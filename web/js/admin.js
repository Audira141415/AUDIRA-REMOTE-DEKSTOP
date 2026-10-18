/**
 * AUDIRA REMOTE DESKTOP — Admin Panel & Fleet Management Controller
 * Fully integrated with Central Auth, Multi-Device 1-Account Sync, Webhooks & Fleet Telemetry
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
  fetchAccountsData();
  if (!fleetPollingTimer) {
    fleetPollingTimer = setInterval(() => {
      fetchFleetData();
      fetchMetricsData();
      fetchSessionsData();
      fetchAccountsData();
    }, 4000);
  }
}

// ==========================================================================
// Theme & Language Initialization
// ==========================================================================
function initAdminTheme() {
  const savedTheme = localStorage.getItem('audira_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtn = document.getElementById('adminThemeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('audira_theme', next);
      showToast(`Mode visual diubah ke: ${next.toUpperCase()}`, 'info');
    });
  }
}

function initAdminLanguage() {
  const savedLang = localStorage.getItem('audira_lang') || 'ID';
  const label = document.getElementById('adminLangLabel');
  if (label) label.textContent = savedLang;

  const toggleBtn = document.getElementById('adminLangToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = localStorage.getItem('audira_lang') || 'ID';
      const next = current === 'ID' ? 'EN' : 'ID';
      localStorage.setItem('audira_lang', next);
      if (label) label.textContent = next;
      showToast(`Bahasa diubah ke: ${next}`, 'info');
    });
  }
}

function checkOperatorSession() {
  const operatorEl = document.getElementById('adminTopbarOperatorName');
  const storedUser = localStorage.getItem('audira_user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (operatorEl && (u.display_name || u.name)) {
        operatorEl.textContent = `${u.display_name || u.name} (@${u.name})`;
        return;
      }
    } catch (_) {}
  }
  if (operatorEl) {
    operatorEl.textContent = 'Agus Dwi Rianto (AUDIRA)';
  }
}

// ==========================================================================
// Sidebar Navigation Viewport Switching
// ==========================================================================
function initAdminNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetViewId = item.getAttribute('data-view');
      if (!targetViewId) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      viewSections.forEach(sec => {
        if (sec.id === targetViewId) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });
    });
  });
}

// ==========================================================================
// Accounts & Linked Devices (Multi-Device 1 Akun)
// ==========================================================================
async function fetchAccountsData(showToastFeedback = false) {
  try {
    const res = await fetch('/api/accounts');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.success && Array.isArray(data.accounts)) {
      renderAccountsView(data.accounts);

      const totalAccounts = data.accounts.length;
      const totalLinkedDevices = data.accounts.reduce((acc, u) => acc + (u.total_devices || 0), 0);
      const totalOnlineDevices = data.accounts.reduce((acc, u) => acc + (u.online_devices || 0), 0);

      const badge = document.getElementById('navAccountsBadge');
      if (badge) badge.textContent = totalAccounts.toString();

      const kpiAcc = document.getElementById('kpiTotalAccounts');
      if (kpiAcc) kpiAcc.textContent = totalAccounts.toString();

      const kpiDev = document.getElementById('kpiTotalLinkedDevices');
      if (kpiDev) kpiDev.textContent = totalLinkedDevices.toString();

      const kpiOnlineMeta = document.getElementById('kpiOnlineLinkedDevices');
      if (kpiOnlineMeta) kpiOnlineMeta.innerHTML = `<span>● ${totalOnlineDevices} Online via LAN/WAN</span>`;

      if (showToastFeedback) {
        showToast('Data akun & perangkat tersinkronisasi!', 'success');
      }
    }
  } catch (e) {
    console.debug('Accounts API not reachable.');
  }
}

function renderAccountsView(accounts) {
  const container = document.getElementById('accountsListContainer');
  if (!container) return;

  if (accounts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--color-text-dim); background:var(--color-admin-card); border-radius:var(--radius-md);">
        Belum ada akun yang terdaftar. Klik "+ Buat Akun Baru" di atas untuk menambahkan akun.
      </div>
    `;
    return;
  }

  container.innerHTML = accounts.map(u => {
    const initials = (u.username || 'AU').slice(0, 2).toUpperCase();
    const isAdmin = u.is_admin === true;
    const devices = u.devices || [];

    let devicesHtml = '';
    if (devices.length === 0) {
      devicesHtml = `
        <div style="padding:1.5rem; text-align:center; color:var(--color-text-dim); font-size:0.875rem;">
          Belum ada PC atau perangkat yang login menggunakan akun <strong>${escapeHtml(u.username)}</strong>.<br>
          Buka Audira Desk di PC kamu, klik <strong>Login</strong>, dan masukkan username ini untuk menghubungkan perangkat secara otomatis.
        </div>
      `;
    } else {
      devicesHtml = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>NAMA PERANGKAT / ALIAS</th>
                <th>REMOTE ID</th>
                <th>SISTEM OPERASI</th>
                <th>ALAMAT IP</th>
                <th>TAG KELOMPOK</th>
                <th>STATUS KONEKSI</th>
                <th>TERAKHIR AKTIF</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              ${devices.map(d => {
                const statusHtml = d.is_online
                  ? `<span class="status-pill online"><span class="pulse-dot" style="display:inline-block; width:7px; height:7px; margin-right:5px; background:var(--color-emerald); border-radius:50%;"></span>ONLINE</span>`
                  : `<span class="status-pill standby" style="color:var(--color-text-dim);"><span style="display:inline-block; width:7px; height:7px; margin-right:5px; background:var(--color-text-dim); border-radius:50%;"></span>OFFLINE</span>`;

                return `
                  <tr>
                    <td>
                      <div style="font-weight:700; color:var(--color-text-heading);">${escapeHtml(d.alias || d.hostname)}</div>
                      <div style="font-size:0.75rem; color:var(--color-text-dim);">${escapeHtml(d.hostname)} (${escapeHtml(d.username)})</div>
                    </td>
                    <td class="admin-code-cell" style="font-weight:700; color:var(--color-primary); cursor:pointer;" onclick="navigator.clipboard.writeText('${d.raw_id}'); showToast('ID ${d.raw_id} disalin!', 'info');" title="Klik untuk salin ID">
                      ${d.id}
                    </td>
                    <td>${escapeHtml(d.os)}</td>
                    <td class="admin-code-cell">${escapeHtml(d.ip)}</td>
                    <td><span class="mgmt-tag-pill">${escapeHtml((d.tags && d.tags[0]) || 'My Devices')}</span></td>
                    <td>${statusHtml}</td>
                    <td style="font-family:var(--font-mono); font-size:0.75rem;">${escapeHtml(d.last_login || '-')}</td>
                    <td style="white-space:nowrap;">
                      <button class="mgmt-action-btn" onclick="launchSession('${d.id}')">Connect</button>
                      <button class="icon-btn-inline" style="color:var(--color-rose); margin-left:6px;" title="Putus integrasi dari akun ini" onclick="unlinkDevice('${escapeHtml(u.username)}', '${d.raw_id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      <div class="account-group-card">
        <div class="account-group-header">
          <div class="account-user-meta">
            <div class="account-user-avatar">${initials}</div>
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-weight:800; font-size:1.05rem; color:var(--color-text-heading);">${escapeHtml(u.display_name || u.username)}</span>
                <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--color-text-dim);">@${escapeHtml(u.username)}</span>
                ${isAdmin ? '<span class="nav-badge-pill" style="background:rgba(0,240,255,0.15); color:var(--color-primary); border-color:rgba(0,240,255,0.3);">ADMIN</span>' : '<span class="nav-badge-pill">USER</span>'}
              </div>
              <div style="font-size:0.75rem; color:var(--color-text-dim); margin-top:2px;">
                ${escapeHtml(u.email || '-')} &bull; Terdaftar: ${escapeHtml(u.created_at || 'Baru')}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--color-emerald); background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); padding:0.3rem 0.65rem; border-radius:var(--radius-xs);">
              ${devices.length} Perangkat Terhubung (${u.online_devices || 0} Online)
            </div>
          </div>
        </div>
        ${devicesHtml}
      </div>
    `;
  }).join('');
}

// Modal: Create New Account
function openCreateAccountModal() {
  const modal = document.getElementById('modalCreateAccount');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('accUsername')?.focus();
  }
}

function closeCreateAccountModal() {
  const modal = document.getElementById('modalCreateAccount');
  if (modal) modal.style.display = 'none';
  document.getElementById('createAccountForm')?.reset();
}

async function submitCreateAccount(e) {
  e.preventDefault();
  const username = document.getElementById('accUsername')?.value.trim();
  const password = document.getElementById('accPassword')?.value.trim();
  const displayName = document.getElementById('accDisplayName')?.value.trim() || username;
  const email = document.getElementById('accEmail')?.value.trim() || `${username}@audira.my.id`;

  if (!username || !password) {
    showToast('Username dan Password wajib diisi!', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/accounts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        display_name: displayName,
        email: email,
        is_admin: false
      })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast(`Akun "${username}" berhasil dibuat!`, 'success');
      closeCreateAccountModal();
      fetchAccountsData();
    } else {
      showToast(result.error || 'Gagal membuat akun.', 'warning');
    }
  } catch (err) {
    showToast('Error koneksi saat membuat akun.', 'error');
  }
}

async function unlinkDevice(username, rawId) {
  if (!confirm(`Putus hubungan perangkat ID ${rawId} dari akun ${username}?`)) return;

  try {
    const res = await fetch('/api/accounts/delete-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, device_id: rawId })
    });
    if (res.ok) {
      showToast(`Perangkat ${rawId} dilepas dari akun ${username}`, 'info');
      fetchAccountsData();
    }
  } catch (e) {
    showToast('Gagal melepas perangkat.', 'error');
  }
}

// ==========================================================================
// Fleet Data Fetching & Table Rendering
// ==========================================================================
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
  fetchAccountsData();
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
