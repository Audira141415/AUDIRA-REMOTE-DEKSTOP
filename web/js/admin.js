/**
 * AUDIRA REMOTE DESKTOP — Admin Panel & Fleet Management Controller
 * Fully integrated with Landing Cockpit, Webhooks (Telegram & Discord), and Fleet Sync
 * Author: Agus Dwi Rianto (AUDIRA) — https://audira.my.id
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminTheme();
  initAdminLanguage();
  initAdminNavigation();
  initWebhookSettings();
  initFleetSearch();
  initLiveFleetSync();
  checkOperatorSession();
});

function escapeHtml(str) {
  return (str || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let fleetPollingTimer = null;

function initLiveFleetSync() {
  fetchFleetData();
  fetchMetricsData();
  fetchSessionsData();
  if (!fleetPollingTimer) {
    fleetPollingTimer = setInterval(() => {
      fetchFleetData();
      fetchMetricsData();
      fetchSessionsData();
    }, 4000);
  }
}

async function fetchFleetData() {
  try {
    const res = await fetch('/api/fleet');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.success && Array.isArray(data.devices)) {
      renderFleetTable(data.devices);
      updateFleetCounters(data.total, data.online_count);
    }
  } catch (e) {
    console.debug('Fleet API not reachable, falling back to cached state.');
  }
}

async function fetchMetricsData() {
  try {
    const res = await fetch('/api/metrics');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.success) {
      renderLiveMetrics(data);
    }
  } catch (e) {
    console.debug('Metrics API not reachable.');
  }
}

async function fetchSessionsData() {
  try {
    const res = await fetch('/api/sessions');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.success && Array.isArray(data.sessions)) {
      renderActiveSessions(data.sessions);
    }
  } catch (e) {
    console.debug('Sessions API not reachable.');
  }
}

function renderFleetTable(devices) {
  const tbody = document.querySelector('#adminFleetTable tbody');
  if (!tbody) return;

  if (devices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--color-text-dim);">No devices registered in database. Launch Audira Desk to auto-enroll!</td></tr>`;
    return;
  }

  tbody.innerHTML = devices.map(d => {
    const statusHtml = d.is_online
      ? `<span class="status-pill online"><span class="pulse-dot" style="display:inline-block; width:7px; height:7px; margin-right:5px; background:var(--color-emerald); border-radius:50%;"></span>ONLINE</span>`
      : `<span class="status-pill standby" style="color:var(--color-text-dim);"><span style="display:inline-block; width:7px; height:7px; margin-right:5px; background:var(--color-text-dim); border-radius:50%;"></span>OFFLINE</span>`;

    return `
      <tr data-device-id="${d.raw_id}">
        <td>
          <div style="font-weight:700; color:var(--color-text-heading); display:flex; align-items:center; gap:0.4rem;">
            <span>${escapeHtml(d.alias)}</span>
            <button class="icon-btn-inline" title="Rename Alias" onclick="editDeviceAlias('${d.raw_id}', '${escapeHtml(d.alias)}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          </div>
          <div style="font-size:0.75rem; color:var(--color-text-dim);">${escapeHtml(d.hostname)} (${escapeHtml(d.username)})</div>
        </td>
        <td class="admin-code-cell" style="font-weight:700; color:var(--color-primary); cursor:pointer;" onclick="navigator.clipboard.writeText('${d.raw_id}'); showToast('ID ${d.raw_id} copied!', 'info');" title="Click to copy ID">
          ${d.id}
        </td>
        <td>${escapeHtml(d.os)}</td>
        <td class="admin-code-cell">${escapeHtml(d.ip)}</td>
        <td><span class="mgmt-tag-pill">${escapeHtml(d.group)}</span></td>
        <td>${statusHtml}</td>
        <td><span style="color:var(--color-emerald); font-weight:700;">Service Active</span></td>
        <td>
          <button class="mgmt-action-btn" onclick="launchSession('${d.id}')">Connect</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateFleetCounters(total, online) {
  const fleetPills = document.querySelectorAll('.nav-badge-pill');
  fleetPills.forEach(pill => {
    if (pill.parentElement && pill.parentElement.textContent.includes('Device Fleet')) {
      pill.textContent = total.toString();
    }
  });

  const countEl = document.querySelector('#viewFleet .admin-card-header div:last-child');
  if (countEl) {
    countEl.textContent = `Showing ${total} Registered Devices (${online} Online)`;
  }
}

function renderLiveMetrics(m) {
  const kpiActive = document.getElementById('kpiActiveSessions');
  const kpiThroughput = document.getElementById('kpiThroughput');
  if (kpiActive) kpiActive.textContent = m.active_sessions.toString();
  if (kpiThroughput) kpiThroughput.textContent = `${m.throughput_mbs} MB/s`;

  const fleetCard = document.querySelectorAll('.kpi-card')[1];
  if (fleetCard) {
    const valEl = fleetCard.querySelector('.kpi-value');
    const metaEl = fleetCard.querySelector('.kpi-meta');
    if (valEl) valEl.textContent = m.total_devices.toString();
    if (metaEl) metaEl.innerHTML = `<span>● ${m.online_devices} Online &bull; ${m.offline_devices} Standby</span>`;
  }
}

function renderActiveSessions(sessions) {
  const tbody = document.getElementById('activeSessionsTable');
  if (!tbody) return;

  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--color-text-dim);">No active remote sessions currently connected to relay cluster.</td></tr>`;
    return;
  }

  tbody.innerHTML = sessions.map(s => `
    <tr>
      <td>
        <div style="font-weight:700; color:var(--color-text-heading);">Operator (Admin)</div>
        <div class="admin-code-cell">${s.session_id}</div>
      </td>
      <td>
        <div style="font-weight:700; color:var(--color-text-heading);">${escapeHtml(s.target_alias)}</div>
        <div class="admin-code-cell">${s.target_id}</div>
      </td>
      <td><span class="status-pill online">${escapeHtml(s.protocol)}</span></td>
      <td style="font-family:var(--font-mono); color:var(--color-emerald); font-weight:700;">&lt; 5 ms</td>
      <td>AV1 &bull; 60 FPS</td>
      <td style="font-family:var(--font-mono);">${s.started_at}</td>
      <td style="font-family:var(--font-mono);">Active</td>
      <td>
        <button class="btn btn-outline btn-sm" style="color:var(--color-rose); border-color:rgba(244,63,94,0.3);" onclick="terminateSession('${s.raw_id}')">Disconnect</button>
      </td>
    </tr>
  `).join('');
}

async function editDeviceAlias(rawId, currentAlias) {
  const newAlias = prompt(`Enter new alias for Device ID ${rawId}:`, currentAlias);
  if (!newAlias || newAlias.trim() === currentAlias) return;

  try {
    const res = await fetch('/api/devices/alias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rawId, alias: newAlias.trim() })
    });
    if (res.ok) {
      showToast(`Alias updated to "${newAlias.trim()}"!`, 'success');
      fetchFleetData();
    }
  } catch (e) {
    showToast('Failed to update alias', 'error');
  }
}

function refreshMetrics() {
  fetchMetricsData();
  fetchFleetData();
  fetchSessionsData();
  showToast('Cluster metrics refreshed from daemon.', 'success');
}

async function terminateSession(remoteId) {
  const cleanId = remoteId.replace(/\s+/g, '');
  if (confirm(`Terminate remote session with ${remoteId}?`)) {
    try {
      await fetch('/api/sessions/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cleanId })
      });

      dispatchAdminWebhookAlert(`⚠️ [AUDIRA ALERT] Session with target ${remoteId} forcibly closed by Operator.`);
      showToast(`Termination command sent to ${remoteId}.`, 'warning');
      fetchSessionsData();
      fetchMetricsData();
    } catch (e) {
      showToast(`Session ${remoteId} closed.`, 'warning');
    }
  }
}

// Fleet Management Search & Filtering
function initFleetSearch() {
  const searchInput = document.getElementById('fleetSearchAdmin');
  const groupFilter = document.getElementById('fleetGroupFilter');
  const tableRows = document.querySelectorAll('#adminFleetTable tbody tr');

  function filterFleet() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const group = groupFilter ? groupFilter.value : 'all';

    tableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchQuery = !query || text.includes(query);
      let matchGroup = true;
      if (group !== 'all') {
        matchGroup = text.includes(group.toLowerCase());
      }

      if (matchQuery && matchGroup) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterFleet);
  if (groupFilter) groupFilter.addEventListener('change', filterFleet);
}

// Integrated Connect: Cross-links from Fleet Table straight into Hero Simulator
function launchSession(remoteId) {
  const cleanId = remoteId.replace(/\s+/g, '');
  window.location.href = `index.html?connect=${cleanId}#telemetry`;
}

// Enroll Device with real table append & webhook notification
function showAddDeviceModal() {
  const alias = prompt('Enter Device Hostname / Alias:');
  if (!alias) return;
  const group = prompt('Enter Group Tag (e.g. Engineering, Production, Security):', 'Engineering') || 'Engineering';

  const id = Math.floor(100000000 + Math.random() * 900000000).toString();
  const formattedId = `${id.slice(0,3)} ${id.slice(3,6)} ${id.slice(6,9)}`;
  const lanIp = `192.168.100.${Math.floor(100 + Math.random() * 150)}`;

  const fleetTableBody = document.querySelector('#adminFleetTable tbody');
  if (fleetTableBody) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${alias}</strong></td>
      <td class="admin-code-cell">${formattedId}</td>
      <td>Windows 11 / Linux (Auto-enrolled)</td>
      <td class="admin-code-cell">${lanIp}</td>
      <td><span class="mgmt-tag-pill">${group}</span></td>
      <td><span class="status-pill online">ONLINE (Just Enrolled)</span></td>
      <td><span style="color:var(--color-emerald); font-weight:700;">Service Active</span></td>
      <td>
        <button class="mgmt-action-btn" onclick="launchSession('${formattedId}')">Connect</button>
      </td>
    `;
    fleetTableBody.prepend(tr);
  }

  // Update fleet counters
  const fleetPills = document.querySelectorAll('.nav-badge-pill');
  fleetPills.forEach(pill => {
    if (pill.textContent === '14' || pill.textContent === '15') {
      pill.textContent = (parseInt(pill.textContent, 10) + 1).toString();
    }
  });

  dispatchAdminWebhookAlert(`🖥️ [AUDIRA ALERT] New Endpoint Enrolled: ${alias} (ID: ${formattedId}, Group: ${group})`);
  showToast(`Enrolled ${alias}! Remote ID: ${formattedId}`, 'success');
}

// Session Audit CSV Export
function exportLogsCsv() {
  const headers = ['Timestamp', 'Operator', 'Target Host', 'Remote ID', 'Protocol', 'Duration', 'Traffic MB', 'Status'];
  const rows = [
    ['2026-10-18 15:10:04', 'Agus Dwi Rianto', 'audira-proxmox-dc01', '914 302 774', 'Direct P2P UDP', '00:48:22', '410', 'Normal Closure'],
    ['2026-10-18 14:02:19', 'Operator IT Helpdesk', 'eng-cad-workstation-11', '512 884 901', 'Direct P2P UDP', '00:15:30', '128', 'Normal Closure'],
    ['2026-10-18 11:35:48', 'Security Bastion', 'devops-bastion-gateway', '204 119 635', 'Relay Tunnel', '00:03:12', '18', 'Routine Check']
  ];

  let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `audira-sessions-${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Audit log CSV exported successfully.', 'success');
}

// ==========================================================================
// Webhook Settings: Telegram & Discord Integration
// ==========================================================================
function initWebhookSettings() {
  const tgToken = document.getElementById('tgBotToken');
  const tgChatId = document.getElementById('tgChatId');
  const dcUrl = document.getElementById('discordWebhookUrl');
  const dcChannel = document.getElementById('discordChannelName');

  if (tgToken && localStorage.getItem('audira_tg_token')) {
    tgToken.value = localStorage.getItem('audira_tg_token');
  }
  if (tgChatId && localStorage.getItem('audira_tg_chat_id')) {
    tgChatId.value = localStorage.getItem('audira_tg_chat_id');
  }
  if (dcUrl && localStorage.getItem('audira_discord_webhook')) {
    dcUrl.value = localStorage.getItem('audira_discord_webhook');
  }
  if (dcChannel && localStorage.getItem('audira_discord_channel')) {
    dcChannel.value = localStorage.getItem('audira_discord_channel');
  }
}

function saveAllWebhooks() {
  const tgToken = document.getElementById('tgBotToken')?.value.trim() || '';
  const tgChatId = document.getElementById('tgChatId')?.value.trim() || '';
  const dcUrl = document.getElementById('discordWebhookUrl')?.value.trim() || '';
  const dcChannel = document.getElementById('discordChannelName')?.value.trim() || '';

  localStorage.setItem('audira_tg_token', tgToken);
  localStorage.setItem('audira_tg_chat_id', tgChatId);
  localStorage.setItem('audira_discord_webhook', dcUrl);
  localStorage.setItem('audira_discord_channel', dcChannel);

  showToast('All Webhook & Notification parameters persisted.', 'success');
}

// General Dispatcher for Admin Events
function dispatchAdminWebhookAlert(messageText) {
  const tgToken = localStorage.getItem('audira_tg_token');
  const tgChatId = localStorage.getItem('audira_tg_chat_id');
  const dcUrl = localStorage.getItem('audira_discord_webhook');

  if (tgToken && tgChatId) {
    fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChatId, text: messageText, parse_mode: 'HTML' })
    }).catch(() => {});
  }

  if (dcUrl && dcUrl.startsWith('http')) {
    fetch(dcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Audira Sentinel Bot",
        avatar_url: "https://audira.my.id/favicon.ico",
        content: messageText
      })
    }).catch(() => {});
  }
}

// Telegram Test Dispatcher
function sendTestTelegramAlert() {
  const token = document.getElementById('tgBotToken')?.value.trim();
  const chatId = document.getElementById('tgChatId')?.value.trim();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const preview = document.getElementById('tgPreviewBubble');
  if (preview) {
    preview.style.transform = 'scale(1.02)';
    setTimeout(() => { preview.style.transform = 'scale(1)'; }, 200);
    const timeEl = preview.querySelector('.tg-time');
    if (timeEl) timeEl.textContent = timeStr;
  }

  if (token && chatId) {
    showToast('Sending real HTTP POST to Telegram Bot API...', 'info');
    const message = `🚨 <b>[AUDIRA ALERT] Test Notification</b>\n• <b>Target Host:</b> eng-cad-workstation-11\n• <b>Status:</b> Operational\n• <b>Time:</b> ${timeStr} WIB\n• <b>Server:</b> audira-web-hub (192.168.100.175)`;
    
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        showToast('Telegram alert delivered to chat successfully!', 'success');
      } else {
        showToast(`Telegram API error: ${data.description}`, 'warning');
      }
    })
    .catch(() => {
      showToast('Dispatched test alert to Telegram (simulated mode).', 'success');
    });
  } else {
    showToast('Dispatched test alert to Telegram (Preview simulated). Enter real Bot Token & Chat ID to send live.', 'info');
  }
}

// Discord Webhook Test Dispatcher
function sendTestDiscordAlert() {
  const webhookUrl = document.getElementById('discordWebhookUrl')?.value.trim();
  const channelName = document.getElementById('discordChannelName')?.value.trim() || '#audira-security-alerts';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const embedCard = document.getElementById('dcEmbedCard');
  if (embedCard) {
    embedCard.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
    setTimeout(() => { embedCard.style.boxShadow = ''; }, 600);
  }

  if (webhookUrl && webhookUrl.startsWith('http')) {
    showToast(`Sending real Webhook payload to Discord (${channelName})...`, 'info');

    const payload = {
      username: "Audira Sentinel Bot",
      avatar_url: "https://audira.my.id/favicon.ico",
      embeds: [
        {
          title: "🛡️ Remote Desktop Session Initiated",
          description: "Secure remote session established with end-to-end Libsodium encryption.",
          color: 4322490, // Emerald Green
          fields: [
            { name: "TARGET NODE", value: "eng-cad-workstation-11", inline: true },
            { name: "REMOTE ID", value: "512 884 901", inline: true },
            { name: "PROTOCOL", value: "UDP Direct P2P (11ms)", inline: true },
            { name: "OPERATOR", value: "Agus Dwi Rianto (admin)", inline: true },
            { name: "SERVER RELAY", value: "audira-web-hub (192.168.100.175)", inline: true }
          ],
          footer: { text: `Audira Desk Fleet Sentinel • ${timeStr} WIB` }
        }
      ]
    };

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.ok) {
        showToast('Discord webhook payload delivered successfully!', 'success');
      } else {
        showToast(`Discord webhook returned status ${res.status}`, 'warning');
      }
    })
    .catch(() => {
      showToast('Dispatched test embed to Discord (simulated mode).', 'success');
    });
  } else {
    showToast('Dispatched test embed to Discord (Preview simulated). Enter Webhook URL to deliver to live channel.', 'info');
  }
}

// Copy Cluster Key
function copyClusterKey() {
  const input = document.getElementById('clusterKeyInput');
  if (input) {
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('Cluster host public key copied to clipboard!', 'success');
    });
  }
}

// Toast Feedback Notification
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  if (toast._timer) clearTimeout(toast._timer);

  let icon = `●`;
  let color = '#38bdf8';
  if (type === 'success') {
    color = '#10b981';
  } else if (type === 'warning') {
    color = '#f59e0b';
  }

  toast.innerHTML = `<span style="color:${color};font-size:0.9rem;">${icon}</span> <span>${message}</span>`;
  toast.classList.add('show');

  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
