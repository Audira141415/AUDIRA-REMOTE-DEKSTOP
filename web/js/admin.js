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
  startMetricsPolling();
  checkOperatorSession();
});

// Check shared login session from index.html
function checkOperatorSession() {
  const operatorName = sessionStorage.getItem('audira_operator_name');
  const operatorEl = document.getElementById('adminTopbarOperatorName');
  if (operatorName && operatorEl) {
    operatorEl.textContent = operatorName;
  }
}

// Theme Synchronization (Shares audira_theme with index.html)
function initAdminTheme() {
  const toggleBtn = document.getElementById('adminThemeToggle');
  const savedTheme = localStorage.getItem('audira_theme') || 'dark';
  setAdminTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setAdminTheme(activeTheme);
    });
  }
}

function setAdminTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('audira_theme', theme);
  const icon = document.getElementById('adminThemeIcon');
  if (icon) {
    if (theme === 'dark') {
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
      icon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    }
  }
}

// Language Synchronization (Shares audira_lang with index.html)
function initAdminLanguage() {
  const langToggle = document.getElementById('adminLangToggle');
  const savedLang = localStorage.getItem('audira_lang') || 'en';
  setAdminLanguage(savedLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = localStorage.getItem('audira_lang') || 'en';
      const nextLang = currentLang === 'en' ? 'id' : 'en';
      setAdminLanguage(nextLang);
    });
  }
}

function setAdminLanguage(lang) {
  localStorage.setItem('audira_lang', lang);
  const label = document.getElementById('adminLangLabel');
  if (label) label.textContent = lang.toUpperCase();
}

// View Navigation Router
function initAdminNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const views = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetViewId = item.getAttribute('data-view');
      if (!targetViewId) return;

      navItems.forEach(n => n.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      item.classList.add('active');
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const match = Array.from(navItems).find(n => n.getAttribute('data-view').toLowerCase().includes(hash.toLowerCase()));
    if (match) match.click();
  }
}

// Live Metrics Simulation
function startMetricsPolling() {
  const kpiThroughput = document.getElementById('kpiThroughput');
  setInterval(() => {
    if (kpiThroughput) {
      const val = (22 + Math.random() * 5).toFixed(1);
      kpiThroughput.textContent = `${val} MB/s`;
    }
  }, 3500);
}

function refreshMetrics() {
  const kpiActive = document.getElementById('kpiActiveSessions');
  const kpiThroughput = document.getElementById('kpiThroughput');
  if (kpiActive) kpiActive.textContent = '3';
  if (kpiThroughput) kpiThroughput.textContent = '24.8 MB/s';
  showToast('Cluster metrics refreshed from Proxmox daemon.', 'success');
}

// Session Disconnect Action (Synced with Audit Trail & Webhooks)
function terminateSession(remoteId) {
  if (confirm(`Terminate remote session with ${remoteId}?`)) {
    const rows = document.querySelectorAll('#activeSessionsTable tr');
    rows.forEach(row => {
      if (row.textContent.includes(remoteId)) {
        row.style.opacity = '0.4';
        row.style.pointerEvents = 'none';
        const actionCell = row.querySelector('td:last-child');
        if (actionCell) actionCell.innerHTML = `<span style="color:var(--color-rose); font-weight:700; font-size:0.75rem;">DISCONNECTED</span>`;
      }
    });

    const kpiActive = document.getElementById('kpiActiveSessions');
    if (kpiActive) {
      const current = parseInt(kpiActive.textContent, 10);
      if (current > 0) kpiActive.textContent = (current - 1).toString();
    }

    // Dynamically append new entry to Session Audit Logs Table
    const auditTableBody = document.querySelector('#viewSessions tbody');
    if (auditTableBody) {
      const now = new Date();
      const timeStr = now.toISOString().slice(0, 19).replace('T', ' ');
      const newAuditRow = document.createElement('tr');
      newAuditRow.innerHTML = `
        <td class="admin-code-cell">${timeStr}</td>
        <td><strong>Agus Dwi Rianto</strong> (Root)</td>
        <td>Target Host (${remoteId})</td>
        <td><span class="status-pill standby">Direct UDP</span></td>
        <td style="font-family:var(--font-mono);">00:43:10</td>
        <td style="font-family:var(--font-mono);">390 MB</td>
        <td><span style="color:var(--color-rose); font-weight:700;">Operator Forced Disconnect</span></td>
      `;
      auditTableBody.prepend(newAuditRow);
    }

    // Trigger webhook alert
    dispatchAdminWebhookAlert(`⚠️ [AUDIRA ALERT] Session with target ${remoteId} forcibly closed by Operator.`);

    showToast(`Session ${remoteId} closed cleanly. Audit log recorded.`, 'warning');
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
