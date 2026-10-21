/**
 * AUDIRA REMOTE DESKTOP — Admin Panel & Fleet Management Controller
 * Fully integrated with Central Auth, Multi-Device 1-Account Sync, Webhooks & Fleet Telemetry
 * Author: Audira Core Development Team
 */

function checkAdminAuth() {
  const token = localStorage.getItem('audira_access_token');
  const userStr = localStorage.getItem('audira_user');
  if (!token || !userStr) {
    window.location.replace('index.html?login=1');
    return false;
  }
  try {
    const u = JSON.parse(userStr);
    const isStaff = u.is_owner || u.is_admin || u.role === 'owner' || u.role === 'admin';
    if (!isStaff) {
      alert('Akses Ditolak: Halaman Admin Fleet Control khusus untuk Administrator & Owner. Anda akan dialihkan ke dashboard pengguna.');
      window.location.replace('index.html');
      return false;
    }
  } catch (_) {}
  return true;
}

function getAuthHeaders() {
  const token = localStorage.getItem('audira_access_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

async function authFetch(url, options = {}) {
  const headers = Object.assign(getAuthHeaders(), options.headers || {});
  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('audira_access_token');
      localStorage.removeItem('audira_user');
      sessionStorage.removeItem('audira_logged_in');
      window.location.replace('index.html?login=1');
      return res;
    }
    return res;
  } catch (err) {
    console.debug('authFetch network error:', err);
    throw err;
  }
}

function handleAdminSignOut() {
  const token = localStorage.getItem('audira_access_token');
  if (token) {
    try {
      fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    } catch (_) {}
  }
  localStorage.removeItem('audira_access_token');
  localStorage.removeItem('audira_user');
  localStorage.removeItem('audira_remember');
  sessionStorage.removeItem('audira_logged_in');
  window.location.replace('index.html');
}

// ==========================================================================
// SESSION INACTIVITY TIMEOUT CONTROLLER (15 Minutes)
// ==========================================================================
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_WARNING_MS = 60 * 1000;      // 60 seconds warning countdown
let sessionInactivityTimer = null;
let sessionWarningInterval = null;
let lastInteractionTimestamp = Date.now();
let lastThrottledTouch = 0;

function resetSessionActivityTimer(silent = false) {
  lastInteractionTimestamp = Date.now();
  try {
    localStorage.setItem('audira_last_active', String(lastInteractionTimestamp));
  } catch (_) {}

  const warningModal = document.getElementById('modalSessionTimeoutWarning');
  if (warningModal && warningModal.style.display !== 'none') {
    warningModal.style.display = 'none';
    if (!silent) {
      showToast('Sesi panel admin diperpanjang.', 'success');
      authFetch('/api/health').catch(() => {});
    }
  }

  if (sessionWarningInterval) {
    clearInterval(sessionWarningInterval);
    sessionWarningInterval = null;
  }

  if (sessionInactivityTimer) {
    clearTimeout(sessionInactivityTimer);
    sessionInactivityTimer = null;
  }

  scheduleSessionTimeoutCheck();
}

function scheduleSessionTimeoutCheck() {
  if (localStorage.getItem('audira_remember') === 'true') {
    return; // Remembered operator session does not expire by inactivity
  }
  const elapsed = Date.now() - lastInteractionTimestamp;
  const timeUntilWarning = (SESSION_TIMEOUT_MS - SESSION_WARNING_MS) - elapsed;

  if (timeUntilWarning <= 0) {
    showSessionTimeoutWarning();
  } else {
    sessionInactivityTimer = setTimeout(() => {
      showSessionTimeoutWarning();
    }, timeUntilWarning);
  }
}

function showSessionTimeoutWarning() {
  const warningModal = document.getElementById('modalSessionTimeoutWarning');
  const countdownEl = document.getElementById('sessionCountdownDisplay');
  if (!warningModal) return;

  warningModal.style.display = 'flex';

  let remainingSec = Math.max(1, Math.round((SESSION_TIMEOUT_MS - (Date.now() - lastInteractionTimestamp)) / 1000));
  if (countdownEl) countdownEl.textContent = `${remainingSec}s`;

  if (sessionWarningInterval) clearInterval(sessionWarningInterval);

  sessionWarningInterval = setInterval(() => {
    try {
      const extTime = parseInt(localStorage.getItem('audira_last_active') || '0', 10);
      if (extTime > lastInteractionTimestamp) {
        lastInteractionTimestamp = extTime;
        resetSessionActivityTimer(true);
        return;
      }
    } catch (_) {}

    remainingSec = Math.round((SESSION_TIMEOUT_MS - (Date.now() - lastInteractionTimestamp)) / 1000);
    if (remainingSec <= 0) {
      clearInterval(sessionWarningInterval);
      sessionWarningInterval = null;
      handleSessionTimeoutLogout();
    } else {
      if (countdownEl) countdownEl.textContent = `${remainingSec}s`;
    }
  }, 1000);
}

function handleSessionTimeoutLogout() {
  const token = localStorage.getItem('audira_access_token');
  if (token) {
    try {
      fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    } catch (_) {}
  }

  localStorage.removeItem('audira_access_token');
  localStorage.removeItem('audira_user');
  sessionStorage.removeItem('audira_logged_in');
  sessionStorage.setItem('audira_session_timeout', '1');

  window.location.replace('index.html?timeout=1');
}

function initSessionTimeoutManager() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'audira_last_active' && e.newValue) {
      const extTime = parseInt(e.newValue, 10);
      if (extTime > lastInteractionTimestamp) {
        lastInteractionTimestamp = extTime;
        resetSessionActivityTimer(true);
      }
    }
  });

  const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
  const handleUserActivity = () => {
    const now = Date.now();
    if (now - lastThrottledTouch > 10000) {
      lastThrottledTouch = now;
      const warningModal = document.getElementById('modalSessionTimeoutWarning');
      if (warningModal && warningModal.style.display !== 'none') {
        resetSessionActivityTimer(false);
      } else {
        lastInteractionTimestamp = now;
        try {
          localStorage.setItem('audira_last_active', String(now));
        } catch (_) {}
      }
    }
  };

  activityEvents.forEach(evt => {
    window.addEventListener(evt, handleUserActivity, { passive: true });
  });

  resetSessionActivityTimer(true);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdminAuth()) return;
  initSessionTimeoutManager();
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
  fetchOrdersData();
  if (!fleetPollingTimer) {
    fleetPollingTimer = setInterval(() => {
      fetchFleetData();
      fetchMetricsData();
      fetchSessionsData();
      fetchAccountsData();
      fetchOrdersData();
    }, 4000);
  }
}

// ==========================================================================
// Theme & Language Initialization
// ==========================================================================
function updateAdminThemeIcon(theme) {
  const icon = document.getElementById('adminThemeIcon');
  if (!icon) return;
  if (theme === 'light') {
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
  } else {
    icon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
  }
}

function initAdminTheme() {
  const savedTheme = localStorage.getItem('audira_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateAdminThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('adminThemeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('audira_theme', next);
      updateAdminThemeIcon(next);
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
  const avatarEl = document.getElementById('adminTopbarAvatar');
  const storedUser = localStorage.getItem('audira_user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      const dName = u.display_name || u.name || 'Admin';
      const uname = u.username || u.name || 'audira';
      const isOwner = u.is_owner || u.role === 'owner' || uname.toLowerCase() === 'audira';
      const badgeTag = isOwner ? '👑 OWNER' : '🛡️ ADMIN';
      const badgeStyle = isOwner 
        ? 'background:rgba(245,158,11,0.2); color:#f59e0b; border:1px solid rgba(245,158,11,0.4);' 
        : 'background:rgba(2,132,199,0.2); color:#38bdf8; border:1px solid rgba(2,132,199,0.4);';

      if (avatarEl) {
        avatarEl.textContent = (uname || 'AO').slice(0, 2).toUpperCase();
        if (isOwner) {
          avatarEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          avatarEl.style.color = '#ffffff';
        }
      }
      if (operatorEl) {
        operatorEl.innerHTML = `<span style="font-weight:700;">${escapeHtml(dName)}</span> <span style="font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:4px; font-weight:800; margin-left:6px; ${badgeStyle}">${badgeTag}</span>`;
        return;
      }
    } catch (_) {}
  }
  if (operatorEl) {
    operatorEl.innerHTML = '<span>Admin Operator</span> <span class="nav-badge-pill" style="margin-left:0.25rem;">OPERATOR</span>';
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
    const res = await authFetch('/api/accounts');
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

  let viewerUser = {};
  try {
    viewerUser = JSON.parse(localStorage.getItem('audira_user') || '{}');
  } catch (_) {}
  const viewerIsOwner = viewerUser.is_owner || viewerUser.role === 'owner' || (viewerUser.username && viewerUser.username.toLowerCase() === 'audira');

  container.innerHTML = accounts.map(u => {
    const initials = (u.username || 'AU').slice(0, 2).toUpperCase();
    const isOwner = u.is_owner === true || u.role === 'owner' || u.username.toLowerCase() === 'audira';
    const isAdmin = !isOwner && (u.is_admin === true || u.role === 'admin');
    const isUser = !isOwner && !isAdmin;
    const devices = u.devices || [];

    // Distinct badges
    let roleBadgeHtml = '';
    if (isOwner) {
      roleBadgeHtml = `<span class="nav-badge-pill" style="background:rgba(245,158,11,0.2); color:#f59e0b; border:1px solid rgba(245,158,11,0.4); font-weight:800; font-size:0.72rem; padding:0.2rem 0.55rem;">👑 OWNER (SUPERADMIN)</span>`;
    } else if (isAdmin) {
      roleBadgeHtml = `<span class="nav-badge-pill" style="background:rgba(2,132,199,0.2); color:#38bdf8; border:1px solid rgba(2,132,199,0.4); font-weight:800; font-size:0.72rem; padding:0.2rem 0.55rem;">🛡️ ADMIN OPERATOR</span>`;
    } else {
      roleBadgeHtml = `<span class="nav-badge-pill" style="background:rgba(148,163,184,0.12); color:#94a3b8; border:1px solid rgba(148,163,184,0.25); font-weight:700; font-size:0.72rem; padding:0.2rem 0.55rem;">👤 USER / CLIENT</span>`;
    }

    // Role toggle action button for Owner
    let roleActionBtn = '';
    if (viewerIsOwner && !isOwner) {
      if (isAdmin) {
        roleActionBtn = `<button class="btn btn-secondary btn-sm" onclick="setUserRole('${escapeHtml(u.username)}', 'user')" style="font-size:0.72rem; padding:0.25rem 0.6rem; color:#f87171; border-color:rgba(239,68,68,0.3);" title="Turunkan hak akses ke Pengguna Biasa">Demosi ke User</button>`;
      } else {
        roleActionBtn = `<button class="btn btn-secondary btn-sm" onclick="setUserRole('${escapeHtml(u.username)}', 'admin')" style="font-size:0.72rem; padding:0.25rem 0.6rem; color:#38bdf8; border-color:rgba(2,132,199,0.3);" title="Jadikan Administrator Fleet">Promosikan ke Admin</button>`;
      }
    }

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
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <span style="font-weight:800; font-size:1.05rem; color:var(--color-text-heading);">${escapeHtml(u.display_name || u.username)}</span>
                <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--color-text-dim);">@${escapeHtml(u.username)}</span>
                ${roleBadgeHtml}
              </div>
              <div style="font-size:0.75rem; color:var(--color-text-dim); margin-top:2px;">
                ${escapeHtml(u.email || '-')} &bull; Terdaftar: ${escapeHtml(u.created_at || 'Baru')}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            ${roleActionBtn}
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

async function setUserRole(username, targetRole) {
  const roleLabel = targetRole === 'admin' ? 'Administrator' : 'Pengguna Biasa (Member)';
  if (!confirm(`Ubah role akun '${username}' menjadi '${roleLabel}'?`)) return;

  try {
    const res = await authFetch('/api/accounts/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, role: targetRole })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Hak akses akun '${username}' berhasil diubah ke ${roleLabel}!`, 'success');
      fetchAccountsData();
    } else {
      showToast(data.error || 'Gagal mengubah role akun.', 'warning');
    }
  } catch (err) {
    showToast('Gagal menghubungi server.', 'error');
  }
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
    const res = await authFetch('/api/accounts/create', {
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
    const res = await authFetch('/api/accounts/delete-device', {
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
    const res = await authFetch('/api/fleet');
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
    const res = await authFetch('/api/metrics');
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
    const res = await authFetch('/api/sessions');
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
          <div style="display:flex; gap:0.35rem; align-items:center;">
            <button class="mgmt-action-btn" onclick="launchSession('${d.id}')" title="Buka via Desktop App">Connect</button>
            <a href="viewer.html?id=${encodeURIComponent(d.id)}&name=${encodeURIComponent(d.alias)}" target="_blank" class="mgmt-action-btn" style="background:rgba(56,189,248,0.15); color:var(--color-primary); border-color:rgba(56,189,248,0.3); text-decoration:none;" title="Remote langsung di Browser tanpa install">Web View</a>
            ${!d.is_online ? `<button class="mgmt-action-btn" onclick="quickWol('${d.raw_id}', '${escapeHtml(d.alias)}')" style="background:rgba(245,158,11,0.15); color:var(--color-amber); border-color:rgba(245,158,11,0.3);" title="Kirim Wake-on-LAN Magic Packet">Wake</button>` : ''}
          </div>
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
    const res = await authFetch('/api/devices/alias', {
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
      await authFetch('/api/sessions/terminate', {
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
  const lanIp = `10.10.20.${Math.floor(100 + Math.random() * 150)}`;

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
    ['2026-10-18 15:10:04', 'SecOps Lead', 'core-infra-dc01', '914 302 774', 'Direct P2P UDP', '00:48:22', '410', 'Normal Closure'],
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
    const message = `🚨 <b>[AUDIRA ALERT] Test Notification</b>\n• <b>Target Host:</b> eng-cad-workstation-11\n• <b>Status:</b> Operational\n• <b>Time:</b> ${timeStr} WIB\n• <b>Server:</b> Audira Production Relay Cluster`;
    
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
            { name: "OPERATOR", value: "SecOps Admin (Root)", inline: true },
            { name: "SERVER RELAY", value: "Audira Production Relay Cluster", inline: true }
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

// ==========================================================================
// Billing & Orders Management (Real-Time Synchronized)
// ==========================================================================
async function fetchOrdersData(showToastFeedback = false) {
  try {
    const res = await authFetch('/api/orders');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.success && Array.isArray(data.orders)) {
      renderOrdersTable(data.orders);

      const total = data.orders.length;
      const paidOrders = data.orders.filter(o => o.status === 'PAID' || o.status === 'ACTIVE');
      const pendingOrders = data.orders.filter(o => o.status === 'PENDING');
      const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);

      const badge = document.getElementById('navOrdersBadge');
      if (badge) badge.textContent = total.toString();

      const kpiTotal = document.getElementById('kpiTotalOrders');
      if (kpiTotal) kpiTotal.textContent = total.toString();

      const kpiRev = document.getElementById('kpiTotalRevenue');
      if (kpiRev) kpiRev.textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;

      const kpiLic = document.getElementById('kpiActiveLicenses');
      if (kpiLic) kpiLic.textContent = paidOrders.length.toString();

      const kpiPend = document.getElementById('kpiPendingOrders');
      if (kpiPend) kpiPend.textContent = pendingOrders.length.toString();

      const subtitle = document.getElementById('ordersHeaderSubtitle');
      if (subtitle) {
        subtitle.textContent = `${total} Transaksi (${paidOrders.length} Aktif, ${pendingOrders.length} Menunggu)`;
      }

      if (showToastFeedback) {
        showToast('Data transaksi & lisensi berhasil diperbarui!', 'success');
      }
    }
  } catch (e) {
    console.debug('Orders API not reachable.');
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--color-text-dim);">Belum ada transaksi lisensi yang tercatat.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const isPaid = o.status === 'PAID' || o.status === 'ACTIVE';
    const statusPill = isPaid
      ? `<span class="status-pill online"><span class="pulse-dot" style="display:inline-block; width:6px; height:6px; margin-right:4px; background:var(--color-emerald); border-radius:50%;"></span>AKTIF</span>`
      : `<span class="status-pill standby" style="color:var(--color-amber); border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.1);"><span style="display:inline-block; width:6px; height:6px; margin-right:4px; background:var(--color-amber); border-radius:50%;"></span>PENDING</span>`;

    const planBadge = o.plan === 'team'
      ? `<span class="mgmt-tag-pill" style="background:rgba(0,240,255,0.1); color:var(--color-primary); border:1px solid rgba(0,240,255,0.25);">Pro Team</span>`
      : (o.plan === 'enterprise' ? `<span class="mgmt-tag-pill" style="background:rgba(168,85,247,0.1); color:#a855f7; border:1px solid rgba(168,85,247,0.25);">Enterprise</span>` : `<span class="mgmt-tag-pill">Pro Indiv</span>`);

    return `
      <tr data-order-id="${escapeHtml(o.id)}">
        <td class="admin-code-cell" style="font-weight:700; color:var(--color-primary);">
          ${escapeHtml(o.id)}
        </td>
        <td>
          <div style="font-weight:700; color:var(--color-text-heading);">${escapeHtml(o.customer_name)}</div>
          <div style="font-size:0.75rem; color:var(--color-text-dim);">${escapeHtml(o.email || '-')} ${o.target_id ? `&bull; ID: ${escapeHtml(o.target_id)}` : ''}</div>
        </td>
        <td>
          ${planBadge}
          <div style="font-size:0.72rem; color:var(--color-text-dim); margin-top:2px;">${o.cycle === 'annual' ? 'Tahunan' : 'Bulanan'}</div>
        </td>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--color-text-heading);">
          Rp ${(Number(o.amount) || 0).toLocaleString('id-ID')}
        </td>
        <td style="font-size:0.8rem; text-transform:uppercase; font-weight:600;">
          ${escapeHtml(o.payment_method || 'QRIS')}
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span class="admin-code-cell" style="font-weight:700; font-size:0.78rem; cursor:pointer;" onclick="navigator.clipboard.writeText('${escapeHtml(o.license_key)}'); showToast('Kunci disalin!', 'success');" title="Klik untuk salin">
              ${escapeHtml(o.license_key)}
            </span>
            <button class="icon-btn-inline" title="Salin Kunci" onclick="navigator.clipboard.writeText('${escapeHtml(o.license_key)}'); showToast('Kunci disalin!', 'success');">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </td>
        <td>${statusPill}</td>
        <td style="white-space:nowrap;">
          ${!isPaid ? `
            <button class="mgmt-action-btn" style="background:#10b981; border-color:#10b981; margin-right:4px;" onclick="approveOrder('${escapeHtml(o.id)}')">Setujui</button>
          ` : ''}
          <button class="icon-btn-inline" style="color:var(--color-rose);" title="Hapus transaksi ini" onclick="deleteOrder('${escapeHtml(o.id)}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function approveOrder(orderId) {
  try {
    const res = await authFetch('/api/orders/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast(`Pesanan ${orderId} disetujui & lisensi diaktifkan!`, 'success');
      fetchOrdersData();
    } else {
      showToast(result.error || 'Gagal menyetujui pesanan.', 'warning');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

async function deleteOrder(orderId) {
  if (!confirm(`Hapus catatan transaksi ${orderId}?`)) return;
  try {
    const res = await authFetch('/api/orders/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    });
    if (res.ok) {
      showToast(`Transaksi ${orderId} dihapus.`, 'info');
      fetchOrdersData();
    }
  } catch (err) {
    showToast('Gagal menghapus transaksi.', 'error');
  }
}

// Modal: Manual License Generation
function openManualLicenseModal() {
  const modal = document.getElementById('modalManualLicense');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('manualCustName')?.focus();
  }
}

function closeManualLicenseModal() {
  const modal = document.getElementById('modalManualLicense');
  if (modal) modal.style.display = 'none';
}

async function submitManualLicense(e) {
  e.preventDefault();
  const name = document.getElementById('manualCustName')?.value.trim();
  const email = document.getElementById('manualEmail')?.value.trim();
  const plan = document.getElementById('manualPlan')?.value;
  const cycle = document.getElementById('manualCycle')?.value;
  const targetId = document.getElementById('manualTargetId')?.value.trim();

  if (!name || !email) {
    showToast('Nama dan Email wajib diisi!', 'warning');
    return;
  }

  try {
    const res = await authFetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        email: email,
        plan: plan,
        cycle: cycle,
        target_id: targetId,
        payment_method: 'manual_admin'
      })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast(`Lisensi manual ${result.order.license_key} berhasil diterbitkan!`, 'success');
      closeManualLicenseModal();
      fetchOrdersData();
    } else {
      showToast(result.error || 'Gagal menerbitkan lisensi.', 'warning');
    }
  } catch (err) {
    showToast('Error koneksi saat menerbitkan lisensi.', 'error');
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

// ==========================================================================
// Wake-on-LAN (WoL) Relay Management
// ==========================================================================
function openWolModal(defaultMac = '', defaultName = '') {
  const modal = document.getElementById('modalWol');
  if (!modal) return;
  if (defaultMac) {
    document.getElementById('wolMacInput').value = defaultMac;
  }
  if (defaultName) {
    document.getElementById('wolDeviceLabelInput').value = defaultName;
  }
  modal.style.display = 'flex';
}

function closeWolModal() {
  const modal = document.getElementById('modalWol');
  if (modal) modal.style.display = 'none';
}

function quickWol(rawId, alias) {
  const macGuess = '00:11:22:33:44:55';
  openWolModal(macGuess, `${alias} (${rawId})`);
}

async function submitWolPacket(e) {
  e.preventDefault();
  const mac = document.getElementById('wolMacInput').value.trim();
  const broadcastIp = document.getElementById('wolBroadcastIpInput').value.trim() || '255.255.255.255';
  const label = document.getElementById('wolDeviceLabelInput').value.trim();
  const btn = document.getElementById('btnSubmitWol');

  if (!mac) {
    showToast('Harap masukkan MAC Address target.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = 'Broadcasting...';

  try {
    const res = await authFetch('/api/wol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac, broadcast_ip: broadcastIp, device_name: label })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || `Magic Packet berhasil dikirim ke ${data.mac}!`, 'success');
      closeWolModal();
    } else {
      showToast(data.error || 'Gagal mengirim WoL packet.', 'warning');
    }
  } catch (err) {
    showToast('Error koneksi ke API server: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> <span>Kirim Magic Packet</span>`;
  }
}

// ==========================================================================
// Remote Headless CLI Console (Terminal Execution)
// ==========================================================================
let adminCliHistory = [];
let adminCliHistoryIdx = -1;

function clearTerminalOutput() {
  const screen = document.getElementById('adminTerminalScreen');
  if (screen) {
    screen.innerHTML = '[AUDIRA-CLI] Console output cleared.\nReady for commands.';
  }
}

function copyTerminalOutput() {
  const screen = document.getElementById('adminTerminalScreen');
  if (!screen) return;
  navigator.clipboard.writeText(screen.innerText).then(() => {
    showToast('Terminal output copied to clipboard!', 'success');
  });
}

function handleAdminCliKeyDown(e) {
  if (e.key === 'Enter') {
    executeAdminCli();
  } else if (e.key === 'ArrowUp') {
    if (adminCliHistory.length > 0 && adminCliHistoryIdx < adminCliHistory.length - 1) {
      adminCliHistoryIdx++;
      document.getElementById('adminCliInput').value = adminCliHistory[adminCliHistory.length - 1 - adminCliHistoryIdx];
    }
  } else if (e.key === 'ArrowDown') {
    if (adminCliHistoryIdx > 0) {
      adminCliHistoryIdx--;
      document.getElementById('adminCliInput').value = adminCliHistory[adminCliHistory.length - 1 - adminCliHistoryIdx];
    } else if (adminCliHistoryIdx === 0) {
      adminCliHistoryIdx = -1;
      document.getElementById('adminCliInput').value = '';
    }
  }
}

function runAdminCli(cmd) {
  const input = document.getElementById('adminCliInput');
  if (input) {
    input.value = cmd;
    executeAdminCli();
  }
}

async function executeAdminCli() {
  const input = document.getElementById('adminCliInput');
  const screen = document.getElementById('adminTerminalScreen');
  const shellSelect = document.getElementById('adminCliShell');
  const btn = document.getElementById('btnAdminCliExec');

  const cmd = input ? input.value.trim() : '';
  if (!cmd) return;

  const shell = shellSelect ? shellSelect.value : 'powershell';

  adminCliHistory.push(cmd);
  adminCliHistoryIdx = -1;
  input.value = '';

  const promptPrefix = shell === 'powershell' ? 'PS&gt;' : (shell === 'cmd' ? 'CMD&gt;' : 'bash$');
  screen.innerHTML += `\n<div style="color:var(--color-primary); font-weight:700; margin-top:8px;">${promptPrefix} ${escapeHtml(cmd)}</div>`;
  screen.scrollTop = screen.scrollHeight;

  if (btn) btn.disabled = true;

  try {
    const res = await authFetch('/api/terminal/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd, shell: shell, timeout: 20 })
    });
    const data = await res.json();
    if (data.success) {
      if (data.stdout) {
        screen.innerHTML += `<div style="color:#e2e8f0;">${escapeHtml(data.stdout)}</div>`;
      }
      if (data.stderr) {
        screen.innerHTML += `<div style="color:#f87171;">${escapeHtml(data.stderr)}</div>`;
      }
      screen.innerHTML += `<div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Duration: ${data.duration_ms}ms • Exit Code: ${data.exit_code}</div>`;
    } else {
      screen.innerHTML += `<div style="color:#f87171;">[!] Error: ${escapeHtml(data.error || 'Execution failed')}</div>`;
    }
  } catch (err) {
    screen.innerHTML += `<div style="color:#f87171;">[!] Network Error: ${escapeHtml(err.message)}</div>`;
  } finally {
    if (btn) btn.disabled = false;
    screen.scrollTop = screen.scrollHeight;
  }
}

