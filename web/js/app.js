/**
 * AUDIRA REMOTE DESKTOP — Anti-AI-Slop Client & Landing Engine
 * Standards: Swiss Precision, Real Telemetry, Zero Fluff
 * Author: Agus Dwi Rianto (AUDIRA) — https://audira.my.id
 */

// Comprehensive i18n Localization Dictionary
const i18n = {
  en: {
    bannerText: "Official Release: Audira Desk v1.5.0 Standalone Single-EXE with zero-install execution is now available.",
    bannerLink: "Get Executable",
    navArchitecture: "Architecture",
    navTelemetry: "Live Demo",
    navSelfHost: "Self-Hosting",
    navCluster: "Server Cluster",
    navDownloads: "Downloads",
    navFaq: "FAQ",
    btnDownloads: "Downloads",
    heroBadge: "P2P NAT Traversal • Hardware AV1/VP9 Codec • 100% Data Sovereignty",
    heroTitle: "Data-Sovereign <span>Remote Desktop</span> for Modern Engineering",
    heroSubtitle: "The high-performance, open-source alternative to TeamViewer and AnyDesk. Direct UDP hole-punching, hardware-accelerated video streaming at 60 FPS, and zero-trust private server hosting.",
    btnHeroWin: "Download AudiraDesk.exe (Windows 64-bit)",
    btnHeroHost: "Self-Host Server Stack",
    specPortable: "Zero-Installation Portable (Single Binary)",
    specCrypto: "Libsodium X25519-ChaCha20-Poly1305",
    specLicense: "Free & Open-Source (MIT License)",
    simYourId: "This Device ID",
    simOneTimePw: "One-Time Password",
    simRemoteControl: "Control Remote Desktop",
    simInputPlaceholder: "Enter 9-digit Remote ID (e.g. 512 884 901)",
    btnConnect: "Connect",
    btnFileTransfer: "File Transfer",
    simRecentSessions: "Verified Target Endpoints",
    tagArchitecture: "System Architecture",
    titleArchitecture: "Engineered for Latency, Privacy, and Unattended Ops",
    descArchitecture: "Designed from the ground up to eliminate commercial SaaS bottlenecks, telemetry surveillance, and arbitrary session time limits.",
    bento1Title: "Zero-Intermediary P2P NAT Traversal",
    bento1Desc: "Direct peer-to-peer UDP hole punching mediated by audira-hbbs on port 21116. When symmetric firewalls prevent direct P2P, encrypted high-throughput fallback routes seamlessly via audira-hbbr (21117).",
    bento2Title: "Asymmetric Key Authentication",
    bento2Desc: "Every session negotiation executes a Diffie-Hellman key exchange via Libsodium. Only trusted endpoints holding verified public keys can decrypt display and audio frames.",
    bento3Title: "Secure Desktop & UAC Elevation",
    bento3Desc: "Installed as an elevated Windows Service (Audira Desk). Allows technicians to view Windows User Account Control prompts and press Ctrl+Alt+Del on locked servers.",
    bento4Title: "AV1 / VP9 / H.265 at 60 FPS",
    bento4Desc: "Direct screen capture via DXGI Desktop Duplication and hardware encoding using NVENC, Intel QuickSync, and VAAPI for sub-16ms frame delivery.",
    bento5Title: "Zero-Install Single Binary",
    bento5Desc: "Packaged as an all-in-one standalone executable (23.8 MB). Simply send the file to an end-user; it launches instantaneously without installer overhead.",
    tagSelfHost: "DevOps & Deployment",
    titleSelfHost: "Deploy Your Private Relay Infrastructure in 60 Seconds",
    descSelfHost: "Run your own Rendezvous (hbbs) and Relay (hbbr) server on any Linux VPS or Proxmox container with Docker Compose.",
    step1Title: "Create Directory & Docker Stack",
    step1Desc: "Provision your deployment workspace on Ubuntu/Debian:",
    step2Title: "Fetch Official docker-compose.yml",
    step2Desc: "Pull the multi-architecture image configuration:",
    step3Title: "Launch Dual Service Cluster",
    step3Desc: "Start both hbbs signal coordinator and hbbr encrypted relay:",
    tagDownloads: "Platform Binaries",
    titleDownloads: "Download Audira Desk for Desktop and Mobile",
    descDownloads: "Compiled with Rust and Flutter. High-definition remote control for Windows, Linux, macOS, and Android.",
    tagFaq: "Knowledge Base",
    titleFaq: "Frequently Asked Questions",
    descFaq: "Technical specifications, encryption guarantees, and deployment answers.",
    copiedToast: "Copied to clipboard!"
  },
  id: {
    bannerText: "Rilis Resmi: Audira Desk v1.5.0 Standalone Single-EXE siap dijalankan tanpa perlu instalasi.",
    bannerLink: "Unduh File EXE",
    navArchitecture: "Arsitektur",
    navTelemetry: "Demo Langsung",
    navSelfHost: "Self-Hosting",
    navCluster: "Kluster Server",
    navDownloads: "Unduhan",
    navFaq: "FAQ",
    btnDownloads: "Unduhan",
    heroBadge: "NAT Traversal P2P • Codec Hardware AV1/VP9 • Kedaulatan Data 100%",
    heroTitle: "Infrastruktur <span>Remote Desktop</span> Andal & Mandiri",
    heroSubtitle: "Alternatif open-source berkecepatan tinggi pengganti TeamViewer dan AnyDesk. Direct UDP hole-punching, streaming video hardware 60 FPS, dan relay server mandiri zero-trust.",
    btnHeroWin: "Unduh AudiraDesk.exe (Windows 64-bit)",
    btnHeroHost: "Panduan Server Mandiri",
    specPortable: "Portabel Tanpa Install (File Tunggal)",
    specCrypto: "Enkripsi Libsodium X25519-ChaCha20",
    specLicense: "Gratis & Open-Source (Lisensi MIT)",
    simYourId: "ID Perangkat Ini",
    simOneTimePw: "Kata Sandi Sekali Pakai",
    simRemoteControl: "Kendalikan Desktop Jarak Jauh",
    simInputPlaceholder: "Masukkan 9-digit Remote ID (misal: 512 884 901)",
    btnConnect: "Hubungkan",
    btnFileTransfer: "Transfer File",
    simRecentSessions: "Target Komputer Terverifikasi",
    tagArchitecture: "Arsitektur Sistem",
    titleArchitecture: "Dirancang Khusus untuk Latensi Rendah & Akses Unattended",
    descArchitecture: "Dibangun dari nol untuk menghapus batasan SaaS komersial, pelacakan telemetri, dan batasan durasi sesi sepihak.",
    bento1Title: "P2P UDP Hole-Punching Tanpa Perantara",
    bento1Desc: "Koneksi langsung peer-to-peer difasilitasi oleh audira-hbbs di port 21116. Jika firewall simetris memblokir P2P langsung, sistem otomatis beralih ke relay terenkripsi audira-hbbr (21117).",
    bento2Title: "Autentikasi Kunci Asimetris",
    bento2Desc: "Setiap negosiasi sesi menjalankan pertukaran kunci Diffie-Hellman via Libsodium. Hanya endpoint dengan kunci publik terverifikasi yang dapat mendekripsi frame layar.",
    bento3Title: "Secure Desktop & Elevasi UAC",
    bento3Desc: "Dijalankan sebagai Layanan Windows terangkat (Audira Desk). Memungkinkan teknisi melihat prompt UAC Administrator dan menekan Ctrl+Alt+Del pada komputer terkunci.",
    bento4Title: "AV1 / VP9 / H.265 pada 60 FPS",
    bento4Desc: "Tangkapan layar instan DXGI Desktop Duplication dengan hardware encoder NVENC, Intel QuickSync, dan VAAPI untuk latensi per frame di bawah 16ms.",
    bento5Title: "Single Binary Portabel Tanpa Install",
    bento5Desc: "Dipaketkan sebagai satu file exe mandiri (23.8 MB). Kirimkan langsung ke pengguna; dapat dijalankan seketika tanpa proses instalasi rumit.",
    tagSelfHost: "DevOps & Penerapan",
    titleSelfHost: "Jalankan Server Relay Privat dalam 60 Detik",
    descSelfHost: "Jalankan server Rendezvous (hbbs) dan Relay (hbbr) Anda sendiri di VPS Linux atau container Proxmox menggunakan Docker Compose.",
    step1Title: "Buat Direktori & Konfigurasi",
    step1Desc: "Siapkan direktori server pada Ubuntu/Debian:",
    step2Title: "Unduh docker-compose.yml Resmi",
    step2Desc: "Ambil konfigurasi multi-architecture siap pakai:",
    step3Title: "Jalankan Kluster Layanan",
    step3Desc: "Mulai layanan koordinasi sinyal hbbs dan relay enkripsi hbbr:",
    tagDownloads: "Paket Platform",
    titleDownloads: "Unduh Audira Desk untuk Komputer & Mobile",
    descDownloads: "Dikompilasi dengan Rust dan Flutter. Kendali jarak jauh berdefinisi tinggi untuk Windows, Linux, macOS, dan Android.",
    tagFaq: "Pusat Bantuan",
    titleFaq: "Pertanyaan yang Sering Diajukan",
    descFaq: "Spesifikasi teknis, jaminan enkripsi data, dan panduan konfigurasi.",
    copiedToast: "Perintah disalin ke clipboard!"
  }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initSimulator();
  initCopyActions();
  initFaqAccordion();
});

// Theme Management (OLED Dark Default / Swiss Monochrome)
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('audira_theme') || 'dark'; // Force dark mode as default
  setTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(activeTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('audira_theme', theme);

  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    if (theme === 'dark') {
      // Moon / Dark Mode Icon
      themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
      // Sun / Light Mode Icon
      themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    }
  }
}

// Language Switcher
function initLanguage() {
  const langToggle = document.getElementById('langToggle');
  const savedLang = localStorage.getItem('audira_lang') || 'en';
  setLanguage(savedLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'id' : 'en';
      setLanguage(nextLang);
    });
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('audira_lang', lang);

  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = lang.toUpperCase();
  }

  const dict = i18n[lang] || i18n.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
}

// Interactive Simulator & Telemetry Engine
function initSimulator() {
  const connectBtn = document.getElementById('simConnectBtn');
  const targetIdInput = document.getElementById('simTargetId');
  const refreshPwBtn = document.getElementById('refreshPwBtn');
  const simPassword = document.getElementById('simPassword');
  const copyIdBtn = document.getElementById('copyIdBtn');
  const fileTransferBtn = document.getElementById('simFileTransferBtn');
  const simRtt = document.getElementById('simRtt');
  const simFps = document.getElementById('simFps');

  // One-time password generator
  if (refreshPwBtn && simPassword) {
    refreshPwBtn.addEventListener('click', () => {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let newPw = '';
      for (let i = 0; i < 6; i++) {
        newPw += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      simPassword.textContent = newPw;
      showToast('Generated new session credential: ' + newPw, 'info');
    });
  }

  // Copy local host ID
  if (copyIdBtn) {
    copyIdBtn.addEventListener('click', () => {
      const code = copyIdBtn.getAttribute('data-code') || '849203118';
      navigator.clipboard.writeText(code).then(() => {
        copyIdBtn.textContent = 'Copied';
        setTimeout(() => { copyIdBtn.textContent = 'Copy'; }, 1800);
        showToast('Local Device ID copied to clipboard: ' + code, 'success');
      });
    });
  }

  // Connect Simulation
  if (connectBtn && targetIdInput) {
    connectBtn.addEventListener('click', () => {
      const id = targetIdInput.value.trim();
      if (!id) {
        showToast('Please specify a 9-digit Remote ID first.', 'warning');
        targetIdInput.focus();
        return;
      }

      connectBtn.disabled = true;
      connectBtn.innerHTML = `Negotiating P2P...`;

      setTimeout(() => {
        connectBtn.disabled = false;
        connectBtn.innerHTML = `Connect`;
        if (simRtt) simRtt.textContent = Math.floor(9 + Math.random() * 8) + ' ms';
        if (simFps) simFps.textContent = '60.0 FPS';
        showToast(`Connected to ${id}! Protocol: Direct UDP Hole-Punch (AV1 60fps)`, 'success');
      }, 900);
    });
  }

  // File Transfer Simulation
  if (fileTransferBtn && targetIdInput) {
    fileTransferBtn.addEventListener('click', () => {
      const id = targetIdInput.value.trim();
      if (!id) {
        showToast('Please specify a Remote ID to open file browser.', 'warning');
        targetIdInput.focus();
        return;
      }
      showToast(`Chunked SFTP channel opened to ${id} (libs/base/src/fs.rs)`, 'info');
    });
  }

  // Quick session selection
  document.querySelectorAll('.sim-session-card').forEach(item => {
    item.addEventListener('click', () => {
      const sessionId = item.getAttribute('data-session-id');
      if (sessionId && targetIdInput) {
        targetIdInput.value = sessionId;
        targetIdInput.focus();
        showToast(`Selected verified target: ${sessionId}`, 'info');
      }
    });
  });
}

// Copy Code Snippets
function initCopyActions() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.color = '#10b981';
          btn.style.borderColor = '#10b981';
          setTimeout(() => {
            btn.textContent = original;
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
          showToast(i18n[currentLang].copiedToast || 'Copied to clipboard!', 'success');
        });
      }
    });
  });
}

// FAQ Accordion
function initFaqAccordion() {
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.parentElement;
      card.classList.toggle('open');
    });
  });
}

// Toast Feedback Notification
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  // Clear previous timers
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
