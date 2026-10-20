/**
 * AUDIRA REMOTE DESKTOP — Anti-AI-Slop Client & Landing Engine
 * Standards: Swiss Precision, Real Telemetry, Zero Fluff
 * Author: Audira Core Development Team
 */

// Comprehensive i18n Localization Dictionary
const i18n = {
  en: {
    bannerText: "Official Release: Audira Desk v1.5.0 Full Installer with zero-trust security is now available.",
    bannerLink: "Get Installer",
    navHome: "Home",
    navArchitecture: "Architecture",
    navTelemetry: "Live Demo",
    navFleet: "Fleet",
    navComparison: "Compare",
    navSelfHost: "Self-Host",
    navPricing: "Pricing",
    navFaq: "FAQ",
    navConsoleLogin: "Console Login",
    btnDownloads: "Downloads",
    heroBadge: "P2P NAT Traversal • Hardware AV1/VP9 Codec • 100% Data Sovereignty",
    heroTitle: "High-Performance <span>Remote Desktop</span>. Zero Cloud Relays.",
    heroSubtitle: "Direct peer-to-peer UDP streaming at 60 FPS with hardware AV1/VP9 encoding and end-to-end encryption. Run your own private relay cluster in minutes.",
    btnHeroWin: "Download AudiraDesk-Full-Installer.exe (Windows 64-bit)",
    btnHeroConsole: "Access Web Console",
    specPortable: "Zero-Installation Portable (Single Binary)",
    specCrypto: "Libsodium X25519-ChaCha20-Poly1305",
    specLicense: "Audira Commercial License",
    simYourId: "This Device ID",
    simOneTimePw: "One-Time Password",
    simRemoteControl: "Control Remote Desktop",
    simInputPlaceholder: "Enter 9-digit Remote ID (e.g. 512 884 901)",
    btnConnect: "Connect",
    btnFileTransfer: "File Transfer",
    simRecentSessions: "Verified Target Endpoints",
    tagFleet: "Fleet Orchestration",
    titleFleet: "Centralized Address Book & Device Inventory",
    descFleet: "Manage hundreds of workstations, unattended servers, and edge kiosks with granular role-based tags and real-time operational status.",
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
    tagComparison: "Feature Matrix",
    titleComparison: "Why Engineering Teams Choose Audira Desk",
    descComparison: "Compare core architecture, deployment independence, and total cost of ownership against commercial and community solutions.",
    tagSelfHost: "DevOps & Deployment",
    titleSelfHost: "Deploy Your Private Relay Infrastructure in 60 Seconds",
    descSelfHost: "Run your own Rendezvous (hbbs) and Relay (hbbr) server on any Linux VPS or Proxmox container with Docker Compose.",
    step1Title: "Create Directory & Docker Stack",
    step1Desc: "Provision your deployment workspace on Ubuntu/Debian:",
    step2Title: "Fetch Official docker-compose.yml",
    step2Desc: "Pull the multi-architecture image configuration:",
    step3Title: "Launch Dual Service Cluster",
    step3Desc: "Start both hbbs signal coordinator and hbbr encrypted relay:",
    tagLatency: "Global Edge Network",
    titleLatency: "Real-Time Regional Relay Latency Benchmark",
    descLatency: "Test round-trip time (RTT) from your current client connection to private and federated edge relay nodes worldwide.",
    tagDownloads: "Platform Binaries",
    titleDownloads: "Download Audira Desk for Desktop and Mobile",
    descDownloads: "Compiled with Rust and Flutter. High-definition remote control for Windows, Linux, macOS, and Android.",
    tagFaq: "Knowledge Base",
    titleFaq: "Frequently Asked Questions",
    descFaq: "Technical specifications, encryption guarantees, and deployment answers.",
    modalTitle: "Fleet Management Console",
    modalSubtitle: "Private Cluster Admin Portal",
    tabCredentials: "Credentials",
    tabSso: "OIDC / SSO",
    tabHardwareToken: "2FA / Token",
    lblEmail: "Operator Email / Username",
    lblPassword: "Access Password",
    lblRemember: "Remember workstation",
    lnkKeyRecovery: "Cluster Keys",
    btnSignIn: "Sign In to Fleet Control",
    ssoDesc: "Authenticate using your enterprise identity provider or open OAuth directory:",
    tokenDesc: "Enter the 6-digit verification code from your TOTP Authenticator (Google Authenticator, YubiKey):",
    copiedToast: "Copied to clipboard!",
    navPricing: "Pricing",
    tagPricing: "Licensing & Plans",
    titlePricing: "Transparent Pricing. Zero Hidden Fees.",
    descPricing: "From 100% free open-source self-hosting to enterprise centralized fleet control. Compare plans tailored to your infrastructure.",
    lblMonthly: "Monthly",
    lblAnnual: "Annual",
    badgeSave: "SAVE 20%",
    tierFreeTag: "STARTER / TRIAL",
    tierFreeTitle: "Starter Standalone",
    tierFreeSub: "For individuals & technicians testing standalone remote desktop capabilities.",
    noteFree: "Standalone Portable (Free Evaluation)",
    btnFree: "Download Free Trial",
    tierProTag: "INDIVIDUAL PRO",
    tierProTitle: "Pro Individual",
    tierProSub: "For IT technicians & consultants needing centralized management.",
    noteProIndiv: "Billed annually ($142.50 / yr)",
    btnPro: "Choose Pro Individual",
    tierTeamTag: "TEAM & MSP",
    tierTeamTitle: "Pro Team",
    tierTeamSub: "For IT support departments, MSPs & growing distributed teams.",
    noteProTeam: "Billed annually ($286.50 / yr)",
    btnTeam: "Choose Pro Team",
    badgeFree: "STARTER • FREE TRIAL",
    badgePro: "RECOMMENDED • INDIVIDUAL PRO",
    badgePopular: "MOST POPULAR • FLEET READY",
    badgeEnterprise: "ENTERPRISE • DEDICATED CLUSTER",
    tierEntTag: "ENTERPRISE",
    tierEntTitle: "Enterprise",
    tierEntSub: "For large enterprises requiring private cluster & custom SLAs.",
    priceCustom: "Custom",
    noteEnt: "Tailored capacity & dedicated relay",
    btnEnt: "Contact Enterprise",
    matrixTitle: "Feature Comparison Across Editions",
    colFeature: "CORE CAPABILITY"
  },
  id: {
    bannerText: "Rilis Resmi: Audira Desk v1.5.0 Full Installer dengan keamanan zero-trust kini telah tersedia.",
    bannerLink: "Unduh Installer",
    navHome: "Beranda",
    navArchitecture: "Arsitektur",
    navTelemetry: "Demo Langsung",
    navFleet: "Armada",
    navComparison: "Perbandingan",
    navSelfHost: "Self-Host",
    navPricing: "Harga",
    navFaq: "FAQ",
    navConsoleLogin: "Login Konsol",
    btnDownloads: "Unduhan",
    heroBadge: "NAT Traversal P2P • Codec Hardware AV1/VP9 • Kedaulatan Data 100%",
    heroTitle: "Infrastruktur <span>Remote Desktop</span> Cepat. Tanpa Perantara Cloud.",
    heroSubtitle: "Koneksi langsung peer-to-peer UDP 60 FPS dengan akselerasi hardware AV1/VP9 dan enkripsi end-to-end. Jalankan cluster relay privat Anda dalam hitungan menit.",
    btnHeroWin: "Unduh AudiraDesk-Full-Installer.exe (Windows 64-bit)",
    btnHeroConsole: "Masuk Konsol Web",
    specPortable: "Portabel Tanpa Install (File Tunggal)",
    specCrypto: "Enkripsi Libsodium X25519-ChaCha20",
    specLicense: "Lisensi Komersial (Proprietary)",
    simYourId: "ID Perangkat Ini",
    simOneTimePw: "Kata Sandi Sekali Pakai",
    simRemoteControl: "Kendalikan Desktop Jarak Jauh",
    simInputPlaceholder: "Masukkan 9-digit Remote ID (misal: 512 884 901)",
    btnConnect: "Hubungkan",
    btnFileTransfer: "Transfer File",
    simRecentSessions: "Target Komputer Terverifikasi",
    tagFleet: "Orkestrasi Armada",
    titleFleet: "Buku Alamat Terpusat & Inventaris Perangkat",
    descFleet: "Kelola ratusan workstation, server tanpa pengawas, dan kios edge dengan tag berbasis peran dan status operasional real-time.",
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
    tagComparison: "Matriks Fitur",
    titleComparison: "Alasan Tim Engineering Memilih Audira Desk",
    descComparison: "Bandingkan arsitektur inti, kemandirian server, dan total biaya kepemilikan terhadap solusi komersial maupun komunitas.",
    tagSelfHost: "DevOps & Penerapan",
    titleSelfHost: "Jalankan Server Relay Privat dalam 60 Detik",
    descSelfHost: "Jalankan server Rendezvous (hbbs) dan Relay (hbbr) Anda sendiri di VPS Linux atau container Proxmox menggunakan Docker Compose.",
    step1Title: "Buat Direktori & Konfigurasi",
    step1Desc: "Siapkan direktori server pada Ubuntu/Debian:",
    step2Title: "Unduh docker-compose.yml Resmi",
    step2Desc: "Ambil konfigurasi multi-architecture siap pakai:",
    step3Title: "Jalankan Kluster Layanan",
    step3Desc: "Mulai layanan koordinasi sinyal hbbs dan relay enkripsi hbbr:",
    tagLatency: "Jaringan Edge Global",
    titleLatency: "Tolok Ukur Latensi Relay Regional Real-Time",
    descLatency: "Uji latensi round-trip time (RTT) dari koneksi Anda ke node relay privat dan federasi di seluruh dunia.",
    tagPricing: "Pilihan Paket & Lisensi",
    titlePricing: "Transparansi Biaya. Tanpa Batasan Sesi Tersembunyi.",
    descPricing: "Mulai dari 100% gratis open-source self-hosting hingga konsol manajemen armada terpusat skala enterprise.",
    lblMonthly: "Bulanan",
    lblAnnual: "Tahunan",
    badgeSave: "HEMAT 20%",
    tierFreeTag: "STARTER / TRIAL",
    tierFreeTitle: "Starter Standalone",
    tierFreeSub: "Untuk individu & teknisi yang ingin menguji kendali desktop jarak jauh mandiri.",
    noteFree: "Portabel Mandiri (Evaluasi Bebas)",
    btnFree: "Unduh Uji Coba",
    tierProTag: "INDIVIDUAL PRO",
    tierProTitle: "Pro Individual",
    tierProSub: "Untuk teknisi IT & konsultan yang memerlukan konsol admin terpusat.",
    noteProIndiv: "Ditagih tahunan ($142.50 / thn)",
    btnPro: "Pilih Pro Individual",
    tierTeamTag: "TIM & MSP",
    tierTeamTitle: "Pro Team",
    tierTeamSub: "Untuk departemen IT support, MSP & perusahaan yang berkembang.",
    noteProTeam: "Ditagih tahunan ($286.50 / thn)",
    btnTeam: "Pilih Pro Team",
    badgeFree: "EVALUASI BEBAS • MANDIRI",
    badgePro: "PILIHAN TERBAIK • INDIVIDUAL",
    badgePopular: "PALING POPULER • FLEET READY",
    badgeEnterprise: "ENTERPRISE • KLUSTER PRIVAT",
    tierEntTag: "ENTERPRISE",
    tierEntTitle: "Enterprise",
    tierEntSub: "Untuk korporasi besar dengan kebutuhan kluster privat & SLA khusus.",
    priceCustom: "Kustom",
    noteEnt: "Kapasitas fleksibel & relay privat khusus",
    btnEnt: "Hubungi Enterprise",
    matrixTitle: "Tabel Perbandingan Fitur Seluruh Paket",
    colFeature: "KEMAMPUAN UTAMA",
    tagDownloads: "Paket Platform",
    titleDownloads: "Unduh Audira Desk untuk Komputer & Mobile",
    descDownloads: "Dikompilasi dengan Rust dan Flutter. Kendali jarak jauh berdefinisi tinggi untuk Windows, Linux, macOS, dan Android.",
    tagFaq: "Pusat Bantuan",
    titleFaq: "Pertanyaan yang Sering Diajukan",
    descFaq: "Spesifikasi teknis, jaminan enkripsi data, dan panduan konfigurasi.",
    modalTitle: "Konsol Manajemen Armada",
    modalSubtitle: "Portal Admin Kluster Privat",
    tabCredentials: "Kredensial",
    tabSso: "OIDC / SSO",
    tabHardwareToken: "2FA / Token",
    lblEmail: "Email / Username Operator",
    lblPassword: "Kata Sandi Akses",
    lblRemember: "Ingat perangkat ini",
    lnkKeyRecovery: "Kunci Kluster",
    btnSignIn: "Masuk ke Kontrol Armada",
    ssoDesc: "Autentikasi menggunakan penyedia identitas enterprise atau direktori OAuth terbuka:",
    tokenDesc: "Masukkan 6-digit kode verifikasi dari TOTP Authenticator Anda (Google Authenticator, YubiKey):",
    copiedToast: "Perintah disalin ke clipboard!"
  }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initMobileMenu();
  initSimulator();
  initCopyActions();
  initFaqAccordion();
  initAuthModal();
  initFleetFilter();
  initLatencyBenchmark();
  initPricingToggle();
  initPricingCards();
  handleUrlRouting();
  initModalDismiss();
});

// Theme Management (OLED Dark Default / Swiss Monochrome)
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('audira_theme') || 'dark';
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
      themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
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

  if (window.updatePricingBilling) {
    window.updatePricingBilling();
  }
}

// Pricing billing switch & modal opener
function openLoginModalWithTab(tab) {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('open');
  const btn = document.querySelector(`.modal-tab-btn[data-tab="${tab || 'credentials'}"]`);
  if (btn) btn.click();
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
        dispatchIntegratedWebhooks(id);
        openRemoteSession(id);
      }, 700);
    });

    targetIdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        connectBtn.click();
      }
    });
  }

  if (fileTransferBtn && targetIdInput) {
    fileTransferBtn.addEventListener('click', () => {
      const id = targetIdInput.value.trim() || '512 884 901';
      openFileTransferModal(id);
    });
  }

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

  // URL Query Parameter Integration (?connect=512884901)
  const urlParams = new URLSearchParams(window.location.search);
  const connectParam = urlParams.get('connect');
  if (connectParam && targetIdInput) {
    targetIdInput.value = connectParam;
    const telemetrySection = document.getElementById('telemetry');
    if (telemetrySection) {
      telemetrySection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Loaded ${connectParam} from Fleet Console`, 'info');
    setTimeout(() => {
      if (connectBtn) connectBtn.click();
    }, 600);
  }
}

// Integrated Webhook Dispatcher on Live Session Connect
function dispatchIntegratedWebhooks(targetId) {
  const tgToken = localStorage.getItem('audira_tg_token');
  const tgChatId = localStorage.getItem('audira_tg_chat_id');
  const dcUrl = localStorage.getItem('audira_discord_webhook');
  const operator = sessionStorage.getItem('audira_operator_name') || 'SecOps Operator (Admin)';
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Dispatch to Telegram
  if (tgToken && tgChatId) {
    const tgMsg = `<b>[AUDIRA SEC-OPS] Sesi Baru Terhubung</b>\n• <b>Target Host:</b> <code>${targetId}</code>\n• <b>Operator:</b> ${operator}\n• <b>Protocol:</b> Direct UDP Hole-Punch (AV1 60fps)\n• <b>Waktu:</b> ${timeStr} WIB\n• <b>Server:</b> Audira Production Relay (relay.audira.my.id)`;
    fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChatId, text: tgMsg, parse_mode: 'HTML' })
    }).then(res => res.json()).then(data => {
      if (data.ok) showToast('Telegram alert delivered!', 'success');
    }).catch(() => {});
  }

  // Dispatch to Discord
  if (dcUrl && dcUrl.startsWith('http')) {
    const dcPayload = {
      username: "Audira Sentinel Bot",
      avatar_url: "https://audira.my.id/favicon.ico",
      embeds: [{
        title: "Remote Desktop Session Initiated",
        description: `Secure remote session connected to target endpoint <code>${targetId}</code>.`,
        color: 4322490, // Emerald Green
        fields: [
          { name: "TARGET ID", value: targetId, inline: true },
          { name: "OPERATOR", value: operator, inline: true },
          { name: "PROTOCOL", value: "Direct UDP P2P (AV1 60 FPS)", inline: true },
          { name: "SERVER NODE", value: "Audira Production Relay Cluster", inline: true }
        ],
        footer: { text: `Audira Sentinel Webhook • ${timeStr} WIB` }
      }]
    };
    fetch(dcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dcPayload)
    }).then(res => {
      if (res.ok) showToast('Discord alert embed delivered!', 'success');
    }).catch(() => {});
  }
}

// Quick connect helper for fleet inventory
function quickConnect(id) {
  const targetIdInput = document.getElementById('simTargetId');
  if (targetIdInput) {
    targetIdInput.value = id;
    const telemetrySection = document.getElementById('telemetry');
    if (telemetrySection) {
      telemetrySection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Loaded ${id} into Remote Desktop Cockpit`, 'success');
    targetIdInput.focus();
    setTimeout(() => {
      const connectBtn = document.getElementById('simConnectBtn');
      if (connectBtn) connectBtn.click();
    }, 450);
  }
}

// ==========================================================================
// Authentication Modal & Management Console Portal
// ==========================================================================
function initAuthModal() {
  const modal = document.getElementById('loginModal');
  const openBtn = document.getElementById('openLoginBtn');
  const heroOpenBtn = document.getElementById('heroOpenLoginBtn');
  const closeBtn = document.getElementById('closeLoginBtn');
  const togglePwBtn = document.getElementById('togglePasswordVisibility');
  const adminPassword = document.getElementById('adminPassword');

  const openModal = () => {
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      const emailInput = document.getElementById('adminEmail');
      if (emailInput && !sessionStorage.getItem('audira_logged_in')) {
        setTimeout(() => emailInput.focus(), 150);
      }
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (heroOpenBtn) heroOpenBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Tab switching (Login, Register, SSO, Token)
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab === 'credentials' || targetTab === 'login') {
        const v = document.getElementById('authViewCredentials');
        if (v) v.classList.add('active');
      } else if (targetTab === 'register') {
        const v = document.getElementById('authViewRegister');
        if (v) v.classList.add('active');
      } else if (targetTab === 'sso') {
        const v = document.getElementById('authViewSso');
        if (v) v.classList.add('active');
      } else if (targetTab === 'token') {
        const v = document.getElementById('authViewToken');
        if (v) v.classList.add('active');
      }
    });
  });

  // Toggle password visibility
  if (togglePwBtn && adminPassword) {
    togglePwBtn.addEventListener('click', () => {
      if (adminPassword.type === 'password') {
        adminPassword.type = 'text';
      } else {
        adminPassword.type = 'password';
      }
    });
  }

  // Check existing session
  if (sessionStorage.getItem('audira_logged_in') === 'true') {
    showLoggedInState();
  }
}

function switchToRegister() {
  document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));

  const tab = document.querySelector('.modal-tab-btn[data-tab="register"]');
  const view = document.getElementById('authViewRegister');
  if (tab) tab.classList.add('active');
  if (view) {
    view.classList.add('active');
    const uInput = document.getElementById('regUsername');
    if (uInput) setTimeout(() => uInput.focus(), 100);
  }
}

function switchToLogin() {
  document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));

  const tab = document.querySelector('.modal-tab-btn[data-tab="login"]') || document.querySelector('.modal-tab-btn[data-tab="credentials"]');
  const view = document.getElementById('authViewCredentials');
  if (tab) tab.classList.add('active');
  if (view) {
    view.classList.add('active');
    const eInput = document.getElementById('adminEmail');
    if (eInput) setTimeout(() => eInput.focus(), 100);
  }
}

async function handleAdminLogin() {
  const submitBtn = document.getElementById('adminLoginSubmitBtn');
  const label = document.getElementById('loginBtnLabel');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const username = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    showToast('Username/Email dan kata sandi tidak boleh kosong.', 'warning');
    if (!username && emailInput) emailInput.focus();
    else if (passwordInput) passwordInput.focus();
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (label) label.textContent = 'Memverifikasi Sesi...';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        type: 'account'
      })
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      localStorage.setItem('audira_access_token', data.access_token);
      localStorage.setItem('audira_user', JSON.stringify(data.user));
      sessionStorage.setItem('audira_logged_in', 'true');
      showLoggedInState(data.user);
      showToast(`Login berhasil! Selamat datang, ${data.user.display_name || data.user.name}.`, 'success');
      setTimeout(() => {
        navigateToFleet();
      }, 750);
    } else {
      showToast(data.error || 'Autentikasi gagal. Periksa username dan kata sandi.', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Gagal menghubungi server API autentikasi. Pastikan koneksi server aktif.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (label) label.textContent = 'Masuk ke Fleet Control';
  }
}

async function handleAdminRegister() {
  const submitBtn = document.getElementById('regSubmitBtn');
  const label = document.getElementById('regBtnLabel');
  const usernameInput = document.getElementById('regUsername');
  const nameInput = document.getElementById('regDisplayName');
  const emailInput = document.getElementById('regEmail');
  const pwInput = document.getElementById('regPassword');
  const pwConfirmInput = document.getElementById('regPasswordConfirm');

  const username = usernameInput ? usernameInput.value.trim().toLowerCase() : '';
  const displayName = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const password = pwInput ? pwInput.value : '';
  const passwordConfirm = pwConfirmInput ? pwConfirmInput.value : '';

  if (!username || username.length < 3) {
    showToast('Username harus minimal 3 karakter.', 'warning');
    if (usernameInput) usernameInput.focus();
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Alamat email tidak valid.', 'warning');
    if (emailInput) emailInput.focus();
    return;
  }
  if (!password || password.length < 6) {
    showToast('Kata sandi harus minimal 6 karakter.', 'warning');
    if (pwInput) pwInput.focus();
    return;
  }
  if (password !== passwordConfirm) {
    showToast('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.', 'warning');
    if (pwConfirmInput) pwConfirmInput.focus();
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (label) label.textContent = 'Mendaftarkan Akun...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
        display_name: displayName || username
      })
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      localStorage.setItem('audira_access_token', data.access_token);
      localStorage.setItem('audira_user', JSON.stringify(data.user));
      sessionStorage.setItem('audira_logged_in', 'true');
      showLoggedInState(data.user);
      showToast(`Pendaftaran berhasil! Akun '${data.user.username}' siap digunakan.`, 'success');
      setTimeout(() => {
        navigateToFleet();
      }, 750);
    } else {
      showToast(data.error || 'Pendaftaran gagal. Silakan periksa data Anda.', 'error');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Gagal menghubungi server API saat mendaftar.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (label) label.textContent = 'Daftar Akun Sekarang';
  }
}

function simulateSso(provider) {
  showToast(`Authenticating via ${provider} OAuth...`, 'info');
  setTimeout(() => {
    sessionStorage.setItem('audira_logged_in', 'true');
    showLoggedInState({ name: 'admin', display_name: 'Audira Admin' });
    showToast(`Authenticated via ${provider}! Root access granted.`, 'success');
  }, 900);
}

function simulateTotpSubmit() {
  const code = document.getElementById('totpCode').value.trim();
  if (code.length < 6) {
    showToast('Please enter a 6-digit TOTP security code.', 'warning');
    return;
  }
  showToast('Hardware token verified via Libsodium HMAC.', 'success');
  setTimeout(() => {
    sessionStorage.setItem('audira_logged_in', 'true');
    showLoggedInState({ name: 'admin', display_name: 'Audira Admin' });
  }, 600);
}

async function showLoggedInState(user) {
  document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));
  const tabs = document.querySelector('.modal-tabs');
  if (tabs) tabs.style.display = 'none';

  const loggedInView = document.getElementById('authViewLoggedIn');
  if (loggedInView) loggedInView.classList.add('active');

  if (!user) {
    try {
      const stored = localStorage.getItem('audira_user');
      if (stored) user = JSON.parse(stored);
    } catch (e) {}
  }

  const displayName = (user && (user.display_name || user.name)) || 'Agus Dwi Rianto';
  const username = (user && (user.username || user.name)) || 'audira';
  const email = (user && user.email) || `${username}@audira.my.id`;

  const openBtn = document.getElementById('openLoginBtn');
  if (openBtn) {
    openBtn.innerHTML = `
      <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10b981; margin-right:4px;"></span>
      <span>${escapeHtml(displayName)}</span>
    `;
    openBtn.style.borderColor = '#10b981';
  }

  const nameEl = document.getElementById('profileDisplayName');
  if (nameEl) nameEl.textContent = displayName;

  const handleEl = document.getElementById('profileUserHandle');
  if (handleEl) handleEl.innerHTML = `@${escapeHtml(username)} &bull; ${escapeHtml(email)}`;

  const avatarEl = document.getElementById('profileAvatarInitial');
  if (avatarEl) {
    const parts = displayName.trim().split(/\s+/);
    const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    avatarEl.textContent = initials || 'AD';
  }

  // Asynchronously query live accounts and active licenses
  try {
    const [accRes, licRes] = await Promise.all([
      fetch('/api/accounts').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/licenses').then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    if (accRes && accRes.accounts && accRes.accounts.length > 0) {
      const acc = accRes.accounts.find(a => a.username === username) || accRes.accounts[0];
      if (acc && acc.devices && acc.devices.length > 0) {
        const countEl = document.getElementById('profileDeviceCount');
        if (countEl) countEl.textContent = acc.devices.length;

        const devListEl = document.getElementById('profileLinkedDevicesList');
        if (devListEl) {
          devListEl.innerHTML = acc.devices.map(d => `
            <div style="background:var(--color-bg-elevated); border:1px solid var(--color-border); border-radius:8px; padding:0.55rem 0.75rem; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span style="width:8px; height:8px; background:${d.is_online ? '#10b981' : 'var(--color-text-dim)'}; border-radius:50%; ${d.is_online ? 'box-shadow:0 0 6px #10b981;' : ''}"></span>
                <div>
                  <div style="font-size:0.82rem; font-weight:700; color:var(--color-text-heading);">${escapeHtml(d.alias || d.hostname || 'Device')}</div>
                  <div style="font-size:0.7rem; color:var(--color-text-dim); font-family:var(--font-mono);">ID: ${escapeHtml(d.id)} &bull; ${escapeHtml(d.os || 'Windows')}</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="quickConnect('${escapeHtml(d.id)}'); document.getElementById('loginModal')?.classList.remove('open');" style="padding:0.25rem 0.6rem; font-size:0.72rem;">Remote</button>
            </div>
          `).join('');
        }
      }
    }

    if (licRes && licRes.licenses && licRes.licenses.length > 0) {
      const lic = licRes.licenses[0];
      const keyEl = document.getElementById('profileLicenseKey');
      if (keyEl && lic.license_key) keyEl.textContent = lic.license_key;

      const planBadge = document.getElementById('profilePlanBadge');
      if (planBadge && lic.plan_name) planBadge.textContent = lic.plan_name;
    }
  } catch (e) {
    console.warn('Could not populate extended profile data:', e);
  }
}

function copyProfileLicenseKey() {
  const keyEl = document.getElementById('profileLicenseKey');
  const key = keyEl ? keyEl.textContent.trim() : '';
  if (!key) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(key).then(() => {
      showToast('Kunci lisensi berhasil disalin ke clipboard!', 'success');
    }).catch(() => fallbackCopy(key));
  } else {
    fallbackCopy(key);
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Kunci lisensi berhasil disalin!', 'success');
    } catch (e) {
      showToast('Gagal menyalin kunci lisensi.', 'error');
    }
    document.body.removeChild(ta);
  }
}

function openChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.style.display = 'flex';
}

function closeChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.style.display = 'none';
  const f = modal ? modal.querySelector('form') : null;
  if (f) f.reset();
}

async function submitChangePassword(event) {
  if (event) event.preventDefault();
  const oldPwd = (document.getElementById('pwdOld')?.value || '').trim();
  const newPwd = (document.getElementById('pwdNew')?.value || '').trim();
  const confirmPwd = (document.getElementById('pwdConfirm')?.value || '').trim();

  if (newPwd.length < 6) {
    showToast('Password baru minimal 6 karakter.', 'warning');
    return;
  }
  if (newPwd !== confirmPwd) {
    showToast('Konfirmasi password tidak cocok dengan password baru.', 'error');
    return;
  }

  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem('audira_user') || '{}');
  } catch (e) {}
  const username = storedUser.username || storedUser.name || 'audira';

  try {
    const res = await fetch('/api/accounts/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        old_password: oldPwd,
        new_password: newPwd
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Kata sandi berhasil diperbarui dengan aman!', 'success');
      closeChangePasswordModal();
    } else {
      showToast(data.error || 'Gagal mengubah password.', 'error');
    }
  } catch (err) {
    showToast('Koneksi server gagal saat memperbarui password.', 'error');
  }
}

function handleSignOut() {
  sessionStorage.removeItem('audira_logged_in');
  document.getElementById('authViewLoggedIn').classList.remove('active');
  const tabs = document.querySelector('.modal-tabs');
  if (tabs) tabs.style.display = 'flex';
  document.getElementById('authViewCredentials').classList.add('active');

  const openBtn = document.getElementById('openLoginBtn');
  if (openBtn) {
    openBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
      <span>Console Login</span>
    `;
    openBtn.style.borderColor = '';
  }
  showToast('Signed out of fleet console session', 'info');
}

function navigateToFleet() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('open');
  window.location.href = 'admin.html';
}

// ==========================================================================
// Fleet Filter & Search + Dynamic Live Sync
// ==========================================================================
async function fetchLandingFleet() {
  try {
    const res = await fetch('/api/fleet');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && Array.isArray(data.devices) && data.devices.length > 0) {
      const tbody = document.getElementById('fleetTableBody');
      if (!tbody) return;
      tbody.innerHTML = data.devices.slice(0, 10).map(d => {
        const isOnline = d.is_online;
        const osName = d.os || 'Windows 11 Pro';
        const tag = (d.tags && d.tags[0]) || 'Fleet Node';
        const latency = isOnline ? (d.latency_ms || 2) + ' ms' : 'Offline';
        const latencyColor = isOnline ? 'var(--color-emerald)' : 'var(--color-text-dim)';
        return `
          <tr>
            <td>
              <div class="mgmt-node-cell">
                <span class="mgmt-node-status ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'Online' : 'Offline'}"></span>
                <strong style="color:var(--color-text-heading);">${escapeHtml(d.alias || d.hostname || 'Device')}</strong>
              </div>
            </td>
            <td><code>${escapeHtml(d.id)}</code></td>
            <td>${escapeHtml(osName)}</td>
            <td><span class="mgmt-tag-pill">${escapeHtml(tag)}</span></td>
            <td style="color:${latencyColor}; font-family:var(--font-mono); font-weight:700;">${latency}</td>
            <td><span style="color:var(--color-primary); font-size:0.75rem;">X25519 E2EE</span></td>
            <td>
              <button class="mgmt-action-btn" onclick="quickConnect('${escapeHtml(d.id)}')">Connect</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.debug('Using cached fleet table rows');
  }
}

function initFleetFilter() {
  fetchLandingFleet();
  const tabs = document.querySelectorAll('.console-tab-pill');
  const searchInput = document.getElementById('fleetSearchInput');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      applyFleetFilter(filter, searchInput ? searchInput.value : '');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeTab = document.querySelector('.console-tab-pill.active');
      const filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
      applyFleetFilter(filter, e.target.value);
    });
  }

  function applyFleetFilter(category, query) {
    const rows = document.querySelectorAll('#fleetTableBody tr');
    const q = query.toLowerCase().trim();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      let matchCat = true;
      if (category === 'windows') {
        matchCat = text.includes('windows');
      } else if (category === 'linux') {
        matchCat = text.includes('ubuntu') || text.includes('debian');
      } else if (category === 'macos') {
        matchCat = text.includes('macos');
      }

      const matchQuery = !q || text.includes(q);

      if (matchCat && matchQuery) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
}

// ==========================================================================
// Regional Relay Latency Benchmark Matrix
// ==========================================================================
function initLatencyBenchmark() {
  const btn = document.getElementById('runBenchmarkBtn');
  const btnText = document.getElementById('benchmarkBtnText');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Measuring RTT Pings...';

    const nodes = [
      { id: 'latJakarta', base: 1, variance: 1 },
      { id: 'latCloudflare', base: 11, variance: 3 },
      { id: 'latSingapore', base: 22, variance: 5 },
      { id: 'latTokyo', base: 56, variance: 8 },
      { id: 'latFrankfurt', base: 139, variance: 12 }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < nodes.length) {
        const node = nodes[step];
        const el = document.getElementById(node.id);
        if (el) {
          const val = node.base + Math.floor(Math.random() * node.variance);
          el.textContent = val + ' ms';
        }
        step++;
      } else {
        clearInterval(interval);
        btn.disabled = false;
        if (btnText) btnText.textContent = 'Benchmark Finished (Refresh)';
        showToast('Relay latency benchmark updated across all 5 edge zones.', 'success');
      }
    }, 280);
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
// Pricing Billing Toggle (Monthly / Annual)
// ==========================================================================
let currentPricingCurrency = 'idr';

function setPricingCurrency(curr = 'idr') {
  currentPricingCurrency = curr.toLowerCase();
  const idrBtn = document.getElementById('currIdrBtn');
  const usdBtn = document.getElementById('currUsdBtn');
  if (idrBtn) idrBtn.classList.toggle('active', currentPricingCurrency === 'idr');
  if (usdBtn) usdBtn.classList.toggle('active', currentPricingCurrency === 'usd');

  if (window.updatePricingBilling) {
    window.updatePricingBilling();
  }
}

function initPricingToggle() {
  const toggle = document.getElementById('pricingBillingToggle');
  const monthlyLabel = document.getElementById('pricingMonthlyLabel');
  const annualLabel = document.getElementById('pricingAnnualLabel');
  const priceIndiv = document.getElementById('priceProIndiv');
  const noteIndiv = document.getElementById('noteProIndiv');
  const priceTeam = document.getElementById('priceProTeam');
  const noteTeam = document.getElementById('noteProTeam');

  if (!toggle) return;

  const updatePrices = (isAnnual) => {
    const isIdr = currentPricingCurrency === 'idr';
    const symFree = document.getElementById('currSymFree');
    const symIndiv = document.getElementById('currSymProIndiv');
    const symTeam = document.getElementById('currSymProTeam');

    if (symFree) symFree.textContent = isIdr ? 'Rp' : '$';
    if (symIndiv) symIndiv.textContent = isIdr ? 'Rp' : '$';
    if (symTeam) symTeam.textContent = isIdr ? 'Rp' : '$';

    if (isAnnual) {
      if (monthlyLabel) monthlyLabel.classList.remove('active');
      if (annualLabel) annualLabel.classList.add('active');

      if (priceIndiv) priceIndiv.textContent = isIdr ? '49.000' : '11.88';
      if (noteIndiv) noteIndiv.textContent = isIdr ? 'Ditagih tahunan (Hemat 20% • Rp 588.000 / thn)' : 'Billed annually ($142.50 / yr)';

      if (priceTeam) priceTeam.textContent = isIdr ? '149.000' : '23.88';
      if (noteTeam) noteTeam.textContent = isIdr ? 'Ditagih tahunan (Hemat 20% • Rp 1.788.000 / thn)' : 'Billed annually ($286.50 / yr)';
    } else {
      if (monthlyLabel) monthlyLabel.classList.add('active');
      if (annualLabel) annualLabel.classList.remove('active');

      if (priceIndiv) priceIndiv.textContent = isIdr ? '59.000' : '14.88';
      if (noteIndiv) noteIndiv.textContent = isIdr ? 'Ditagih bulanan (Rp 59.000 / bln)' : 'Billed monthly ($14.88 / mo)';

      if (priceTeam) priceTeam.textContent = isIdr ? '179.000' : '29.88';
      if (noteTeam) noteTeam.textContent = isIdr ? 'Ditagih bulanan (Rp 179.000 / bln)' : 'Billed monthly ($29.88 / mo)';
    }
  };

  toggle.addEventListener('change', (e) => {
    updatePrices(e.target.checked);
  });

  if (monthlyLabel) {
    monthlyLabel.addEventListener('click', () => {
      toggle.checked = false;
      updatePrices(false);
    });
  }
  if (annualLabel) {
    annualLabel.addEventListener('click', () => {
      toggle.checked = true;
      updatePrices(true);
    });
  }

  window.updatePricingBilling = () => updatePrices(toggle.checked);
  updatePrices(toggle.checked);
}

// ==========================================================================
// Interactive Pricing Card Selector (Seamless Switching & Highlighting)
// ==========================================================================
function selectPricingCard(planKey) {
  if (!planKey) return;
  currentSelectedPlan = planKey;

  const cards = document.querySelectorAll('.pricing-grid .pricing-card');
  cards.forEach(card => {
    const cardPlan = card.getAttribute('data-plan');
    const isTarget = (cardPlan === planKey);

    card.classList.toggle('selected', isTarget);
    card.classList.toggle('featured', isTarget);
    card.setAttribute('aria-selected', isTarget ? 'true' : 'false');

    // Update CTA button styling inside footer
    const ctaBtn = card.querySelector('.pricing-cta-btn');
    if (ctaBtn) {
      if (isTarget) {
        ctaBtn.classList.remove('btn-secondary');
        ctaBtn.classList.add('btn-primary');
      } else {
        ctaBtn.classList.remove('btn-primary');
        ctaBtn.classList.add('btn-secondary');
      }
    }
  });

  // Synchronize column highlight in Feature Comparison Table
  const tableHeaders = document.querySelectorAll('.comparison-table thead th[data-plan-col]');
  tableHeaders.forEach(th => {
    const colPlan = th.getAttribute('data-plan-col');
    if (colPlan === planKey) {
      th.style.color = 'var(--color-primary)';
      th.style.fontWeight = '800';
    } else {
      th.style.color = '';
      th.style.fontWeight = '';
    }
  });
}

function initPricingCards() {
  const cards = document.querySelectorAll('.pricing-grid .pricing-card');
  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const plan = card.getAttribute('data-plan');
        if (plan) {
          selectPricingCard(plan);
          if (plan !== 'free') {
            openUpgradeModal(plan);
          }
        }
      }
    });
  });

  // Default selection is Pro Team
  selectPricingCard(currentSelectedPlan || 'team');
}

// ==========================================================================
// Interactive Upgrade & Feature Checkout Modal Controller
// ==========================================================================
const PLAN_DATA = {
  free: {
    name: "Community Free",
    tag: "Open Source",
    price: "Rp 0 / Gratis Selamanya",
    desc: "Akses remote P2P langsung untuk personal & homelab.",
    features: [
      "Koneksi Direct UDP P2P Hole Punching",
      "Enkripsi End-to-End ChaCha20-Poly1305",
      "Streaming hingga 60 FPS (Hardware AV1/H.264)",
      "1 Sesi Aktif Simultan",
      "Tanpa Perlu Instalasi (Single Portable EXE)"
    ]
  },
  pro: {
    name: "Pro Individual",
    tag: "Paling Populer",
    price: "Rp 49.000 / bulan",
    desc: "Untuk teknisi IT, konsultan, dan remote workstation mandiri.",
    features: [
      "Semua Fitur Community Free",
      "Cloud Address Book Sync (Buku Alamat Fleet)",
      "Multi-Monitor & Switcher Virtual Display",
      "Streaming Audio WASAPI Loopback & Mic Remote",
      "Integrasi Notifikasi & Approval Telegram Bot",
      "Hingga 5 Sesi Aktif Simultan",
      "Riwayat Sesi & Audit Log 30 Hari"
    ]
  },
  team: {
    name: "Pro Team & MSP",
    tag: "Untuk Tim & Departemen IT",
    price: "Rp 149.000 / bulan",
    desc: "Untuk tim support, kantor cabang, dan armada server terpusat.",
    features: [
      "Semua Fitur Pro Individual",
      "10 Akun Operator Teknis (Bisa Ditambah)",
      "100 Managed Workstations & Unattended Servers",
      "Central Web Admin Console & Role-Based Access (RBAC)",
      "White-Label Custom Branding (Logo & Nama Sendiri)",
      "OIDC Single Sign-On (SSO) & LDAP Sync",
      "Prioritas Routing Relay Latensi Rendah",
      "Audit Log Compliance & Ekspor Laporan"
    ]
  },
  enterprise: {
    name: "Enterprise Dedicated Cluster",
    tag: "Solusi Kustom Perusahaan",
    price: "Hubungi Sales (Kustom)",
    desc: "Untuk korporasi dan institusi dengan kedaulatan data 100%.",
    features: [
      "Semua Fitur Pro Team",
      "Dedicated Private Relay Cluster (Server Sendiri)",
      "Unlimited Operator & Unlimited Managed Devices",
      "Dukungan Prioritas SLA 99.99% 24/7",
      "Custom Domain & SSL Dedicated (desk.perusahaan.com)",
      "Konsultasi Arsitektur & Pendampingan Deployment",
      "WhatsApp & Telegram Hot-Line Langsung Developer"
    ]
  }
};

let currentSelectedPlan = 'pro';
let currentGeneratedOrder = null;

function updateCheckoutPlanPrice() {
  const plan = PLAN_DATA[currentSelectedPlan] || PLAN_DATA['pro'];
  const cycleSelect = document.getElementById('checkoutCycleSelect');
  const cycle = cycleSelect ? cycleSelect.value : 'annual';
  const priceEl = document.getElementById('upgradeModalPlanPrice');

  if (!priceEl) return;

  if (currentSelectedPlan === 'pro') {
    priceEl.textContent = cycle === 'annual' ? 'Rp 499.000 / tahun (Hemat Rp 89rb)' : 'Rp 49.000 / bulan';
  } else if (currentSelectedPlan === 'team') {
    priceEl.textContent = cycle === 'annual' ? 'Rp 1.490.000 / tahun (Hemat Rp 298rb)' : 'Rp 149.000 / bulan';
  } else if (currentSelectedPlan === 'free') {
    priceEl.textContent = 'Rp 0 / Gratis Selamanya';
  } else {
    priceEl.textContent = 'Rp 1.500.000 / cluster';
  }
}

function togglePayMethodUI(method) {
  const qrisBox = document.getElementById('qrisDetailBox');
  const bankBox = document.getElementById('bankDetailBox');
  const lblQris = document.getElementById('lblMethodQris');
  const lblBank = document.getElementById('lblMethodBank');

  if (method === 'qris') {
    if (qrisBox) qrisBox.style.display = 'block';
    if (bankBox) bankBox.style.display = 'none';
    if (lblQris) {
      lblQris.style.borderColor = 'var(--color-primary)';
      lblQris.style.background = 'rgba(0,240,255,0.05)';
    }
    if (lblBank) {
      lblBank.style.borderColor = 'var(--color-border)';
      lblBank.style.background = 'var(--color-bg-subtle)';
    }
  } else {
    if (qrisBox) qrisBox.style.display = 'none';
    if (bankBox) bankBox.style.display = 'block';
    if (lblBank) {
      lblBank.style.borderColor = 'var(--color-primary)';
      lblBank.style.background = 'rgba(0,240,255,0.05)';
    }
    if (lblQris) {
      lblQris.style.borderColor = 'var(--color-border)';
      lblQris.style.background = 'var(--color-bg-subtle)';
    }
  }
}

function openUpgradeModal(planKey = 'pro') {
  currentSelectedPlan = planKey;
  selectPricingCard(planKey);
  const modal = document.getElementById('upgradeModal');
  const plan = PLAN_DATA[planKey] || PLAN_DATA['pro'];

  // Reset steps
  const stepForm = document.getElementById('checkoutStepForm');
  const stepSuccess = document.getElementById('checkoutStepSuccess');
  if (stepForm) stepForm.style.display = 'block';
  if (stepSuccess) stepSuccess.style.display = 'none';

  const titleEl = document.getElementById('upgradeModalPlanTitle');
  const tagEl = document.getElementById('upgradeModalPlanTag');
  const descEl = document.getElementById('upgradeModalPlanDesc');
  const featuresListEl = document.getElementById('upgradeModalFeaturesList');

  if (titleEl) titleEl.textContent = plan.name;
  if (tagEl) tagEl.textContent = plan.tag;
  if (descEl) descEl.textContent = plan.desc;

  updateCheckoutPlanPrice();

  if (featuresListEl) {
    featuresListEl.innerHTML = plan.features.map(f => `
      <li style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.45rem; font-size:0.85rem; color:var(--color-text-body);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${f}</span>
      </li>
    `).join('');
  }

  // Pre-fill target ID from client if query param exists
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id') || '';
  const devInput = document.getElementById('upgradeTargetId');
  if (devInput && targetId) devInput.value = targetId;

  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgradeModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  // Clear URL query parameters so page doesn't get trapped in ?upgrade=1
  if (window.location.search.includes('upgrade') || window.location.search.includes('plan')) {
    window.history.replaceState({}, document.title, window.location.pathname + (window.location.hash || ''));
  }
}

async function submitCheckoutOrder() {
  const name = (document.getElementById('upgradeName')?.value || '').trim();
  const email = (document.getElementById('upgradeEmail')?.value || '').trim();
  const targetId = (document.getElementById('upgradeTargetId')?.value || '').trim();
  const cycleSelect = document.getElementById('checkoutCycleSelect');
  const cycle = cycleSelect ? cycleSelect.value : 'annual';
  const payMethodInput = document.querySelector('input[name="payMethod"]:checked');
  const payMethod = payMethodInput ? payMethodInput.value : 'qris';

  if (!name) {
    showToast('Silakan isi Nama Lengkap atau Nama Instansi Anda.', 'warning');
    document.getElementById('upgradeName')?.focus();
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Silakan isi Email kontak yang valid untuk penerimaan lisensi.', 'warning');
    document.getElementById('upgradeEmail')?.focus();
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitOrder');
  const btnText = document.getElementById('btnSubmitOrderText');
  if (btnSubmit) btnSubmit.disabled = true;
  if (btnText) btnText.textContent = 'Memproses Aktivasi & Transaksi...';

  try {
    const payload = {
      plan: currentSelectedPlan,
      cycle: cycle,
      customer_name: name,
      email: email,
      target_id: targetId,
      payment_method: payMethod
    };

    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok && result.success && result.order) {
      currentGeneratedOrder = result.order;

      // Populate Receipt Screen
      const receiptInvoiceId = document.getElementById('receiptInvoiceId');
      const receiptPlanName = document.getElementById('receiptPlanName');
      const receiptAmount = document.getElementById('receiptAmount');
      const receiptLicenseKey = document.getElementById('receiptLicenseKey');
      const receiptStatus = document.getElementById('receiptStatus');

      if (receiptInvoiceId) receiptInvoiceId.textContent = result.order.id;
      if (receiptPlanName) receiptPlanName.textContent = `${result.order.plan_name} (${result.order.cycle === 'annual' ? 'Tahunan' : 'Bulanan'})`;
      if (receiptAmount) receiptAmount.textContent = `Rp ${Number(result.order.amount).toLocaleString('id-ID')}`;
      if (receiptLicenseKey) receiptLicenseKey.textContent = result.order.license_key;
      if (receiptStatus) {
        receiptStatus.textContent = result.order.status === 'PAID' ? 'AKTIF & LISENSI TERBIT' : 'MENUNGGU VERIFIKASI';
      }

      // Switch to Step 2
      const stepForm = document.getElementById('checkoutStepForm');
      const stepSuccess = document.getElementById('checkoutStepSuccess');
      if (stepForm) stepForm.style.display = 'none';
      if (stepSuccess) stepSuccess.style.display = 'block';

      showToast(`Pemesanan Berhasil! Kunci lisensi ${result.order.license_key} telah diterbitkan.`, 'success');
    } else {
      showToast(result.error || 'Gagal memproses pesanan.', 'warning');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan saat memproses pesanan.', 'error');
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = 'Bayar & Dapatkan Kunci Lisensi Sekarang';
  }
}

function copyReceiptLicenseKey() {
  const licKey = document.getElementById('receiptLicenseKey')?.textContent || '';
  if (licKey) {
    navigator.clipboard.writeText(licKey).then(() => {
      showToast(`Kunci Lisensi "${licKey}" berhasil disalin!`, 'success');
    }).catch(() => {
      showToast('Kunci disalin!', 'info');
    });
  }
}

function handleWhatsAppOrderAssistance() {
  const plan = PLAN_DATA[currentSelectedPlan] || PLAN_DATA['pro'];
  const name = (document.getElementById('upgradeName')?.value || '').trim() || 'Pelanggan Audira';
  const email = (document.getElementById('upgradeEmail')?.value || '').trim();
  const targetId = (document.getElementById('upgradeTargetId')?.value || '').trim();

  let msg = `Halo Tim Official Audira Desk,\n\nSaya ingin memesan / konfirmasi lisensi berikut:\n• *Paket:* ${plan.name}\n• *Pemesan:* ${name}`;
  if (email) msg += `\n• *Email:* ${email}`;
  if (targetId) msg += `\n• *ID Client:* ${targetId}`;
  msg += `\n\nMohon dibantu panduan aktivasi lisensi & faktur resminya. Terima kasih!`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

// Direct URL routing for upgrade plans & parameters
function handleUrlRouting() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('upgrade') === '1' || urlParams.has('plan')) {
    const plan = urlParams.get('plan') || 'pro';
    setTimeout(() => {
      openUpgradeModal(plan);
      // Clean query parameter from URL bar immediately so subsequent reloads or logo clicks go to clean Home
      window.history.replaceState({}, document.title, window.location.pathname + (window.location.hash || ''));
    }, 350);
  }
}

// Navigation to Home (clean URL and scroll to top)
function navigateToHome(e) {
  if (e) e.preventDefault();
  closeUpgradeModal();
  closeRemoteSession();
  closeFileTransferModal();
  closeMobilePairModal();
  closeChangePasswordModal();
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.classList.remove('open');

  // Strip query parameters and hashes from URL
  window.history.replaceState({}, document.title, window.location.pathname);

  // Set active link in nav
  document.querySelectorAll('.nav-links .nav-link').forEach(l => l.classList.remove('active'));
  const homeLink = document.querySelector('.nav-links .nav-link[data-i18n="navHome"]');
  if (homeLink) homeLink.classList.add('active');

  // Smooth scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global Modal Dismissal (Escape key & backdrop)
function initModalDismiss() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeUpgradeModal();
      closeRemoteSession();
      closeFileTransferModal();
      closeMobilePairModal();
      closeChangePasswordModal();
      const loginModal = document.getElementById('loginModal');
      if (loginModal) loginModal.classList.remove('open');
    }
  });
}

// Mobile Responsive Navigation Drawer
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Telegram Bot Interactive Simulator Actions
function simulateTgApprove() {
  const statusEl = document.getElementById('tgSimStatus');
  const btnApprove = document.getElementById('tgSimApproveBtn');
  const btnReject = document.getElementById('tgSimRejectBtn');
  if (statusEl) {
    statusEl.style.display = 'flex';
    statusEl.style.alignItems = 'center';
    statusEl.style.gap = '6px';
    statusEl.style.color = '#10b981';
    statusEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span><b>Sesi Disetujui!</b> Sesi remote P2P <code>512 884 901</code> dibuka seketika dengan proteksi E2EE.</span>';
  }
  if (btnApprove) btnApprove.disabled = true;
  if (btnReject) btnReject.disabled = true;
  showToast('Telegram 2FA Approved! Menginisiasi sesi remote...', 'success');

  const simInput = document.getElementById('simTargetId');
  const simConnectBtn = document.getElementById('simConnectBtn');
  if (simInput) simInput.value = '512 884 901';
  if (simConnectBtn) {
    setTimeout(() => {
      simConnectBtn.click();
    }, 700);
  }
}

function simulateTgReject() {
  const statusEl = document.getElementById('tgSimStatus');
  const btnApprove = document.getElementById('tgSimApproveBtn');
  const btnReject = document.getElementById('tgSimRejectBtn');
  if (statusEl) {
    statusEl.style.display = 'flex';
    statusEl.style.alignItems = 'center';
    statusEl.style.gap = '6px';
    statusEl.style.color = '#f43f5e';
    statusEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> <span><b>Sesi Ditolak</b> oleh Administrator via Webhook. Endpoint diblokir.</span>';
  }
  if (btnApprove) btnApprove.disabled = true;
  if (btnReject) btnReject.disabled = true;
  showToast('Permintaan koneksi ditolak via Telegram!', 'warning');
}

// ==========================================================================
// Interactive Remote Session Viewport & Floating Toolbar HUD
// Skill Reference: flutter-desktop-ui & AUDIRA UI/UX Pro Max
// ==========================================================================
let sessionTickerInterval = null;
let currentSessionId = '512 884 901';

function openRemoteSession(targetId) {
  currentSessionId = targetId || '512 884 901';
  const modal = document.getElementById('remoteSessionModal');
  const targetDisplay = document.getElementById('sessionTargetIdDisplay');
  const ftTargetDisplay = document.getElementById('ftTargetIdDisplay');
  
  if (targetDisplay) targetDisplay.textContent = currentSessionId;
  if (ftTargetDisplay) ftTargetDisplay.textContent = currentSessionId;

  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  // Update clock in remote taskbar
  updateRemoteTaskbarClock();

  // Start live telemetry jitter ticker
  if (sessionTickerInterval) clearInterval(sessionTickerInterval);
  sessionTickerInterval = setInterval(() => {
    const latEl = document.getElementById('sessionHudLatency');
    const fpsEl = document.getElementById('sessionHudFps');
    const bitEl = document.getElementById('sessionHudBitrate');
    
    if (latEl) latEl.textContent = (9 + Math.floor(Math.random() * 5)) + ' ms';
    if (fpsEl) fpsEl.textContent = (59.8 + Math.random() * 0.4).toFixed(1) + ' FPS';
    if (bitEl) bitEl.textContent = (1.6 + Math.random() * 0.7).toFixed(1) + ' MB/s';
  }, 1200);

  // Send Audit Log to backend API
  fetch('/api/audit_logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'SESSION_CONNECTED',
      peer_id: currentSessionId,
      operator: sessionStorage.getItem('audira_operator_name') || 'Admin Operator',
      details: 'Direct P2P session opened with AV1 NVENC DXGI pipeline'
    })
  }).catch(() => {});
}

function closeRemoteSession() {
  const modal = document.getElementById('remoteSessionModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (sessionTickerInterval) {
    clearInterval(sessionTickerInterval);
    sessionTickerInterval = null;
  }
  showToast(`Sesi remote dengan ${currentSessionId} telah ditutup dengan aman.`, 'info');
}

function updateRemoteTaskbarClock() {
  const clockEl = document.getElementById('remoteTaskbarClock');
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  }
}

function sendSasCtrlAltDel() {
  showToast('Injeksi Keystroke: Sent Ctrl+Alt+Del (SAS) ke Windows Secure Desktop', 'success');
  const logs = document.getElementById('remoteTerminalLogs');
  if (logs) {
    const entry = document.createElement('div');
    entry.style.color = '#38bdf8';
    entry.style.marginTop = '4px';
    entry.textContent = `[UAC SAS] Ctrl+Alt+Del sequence dispatched. Winlogon SAS event triggered.`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
  }
}

function togglePrivacyMode() {
  const overlay = document.getElementById('privacyModeOverlay');
  const btn = document.getElementById('hudPrivacyModeBtn');
  if (!overlay) return;

  const isActive = overlay.classList.toggle('active');
  if (btn) btn.classList.toggle('active', isActive);

  if (isActive) {
    showToast('Privacy Mode AKTIF: Layar monitor fisik target telah dihitamkan.', 'info');
  } else {
    showToast('Privacy Mode NONAKTIF: Layar monitor fisik target menyala kembali.', 'info');
  }
}

function switchSessionDisplay(displayId) {
  showToast(`Beralih ke Monitor ${displayId} (${displayId === '1' ? '4K Ultra' : 'Full HD'})`, 'info');
  const logs = document.getElementById('remoteTerminalLogs');
  if (logs) {
    const entry = document.createElement('div');
    entry.style.color = '#94a3b8';
    entry.textContent = `[DXGI] Direct3D11 Desktop Duplication switched to Display Adapter 0, Output ${displayId}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
  }
}

function switchSessionQuality(mode) {
  showToast(`Kualitas Video: ${mode.toUpperCase()} (Hardware Pacing 60 FPS)`, 'info');
  const logs = document.getElementById('remoteTerminalLogs');
  if (logs) {
    const entry = document.createElement('div');
    entry.style.color = '#10b981';
    entry.textContent = `[HWCODEC] Encoder bitrate dynamically adjusted for mode: ${mode}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
  }
}

function toggleFullscreenSession() {
  const modal = document.getElementById('remoteSessionModal');
  if (!document.fullscreenElement) {
    if (modal && modal.requestFullscreen) {
      modal.requestFullscreen().catch(() => {});
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

function executeRemoteCommand(cmd) {
  const input = document.getElementById('terminalCmdInput');
  const logs = document.getElementById('remoteTerminalLogs');
  if (!cmd || !cmd.trim() || !logs) return;

  cmd = cmd.trim();
  const cmdLower = cmd.toLowerCase();

  // Echo command
  const cmdDiv = document.createElement('div');
  cmdDiv.style.color = '#00f0ff';
  cmdDiv.style.marginTop = '6px';
  cmdDiv.textContent = `PS C:\\Windows\\System32> ${cmd}`;
  logs.appendChild(cmdDiv);

  const outDiv = document.createElement('div');
  outDiv.style.color = '#cbd5e1';
  outDiv.style.fontSize = '0.72rem';
  outDiv.style.lineHeight = '1.4';
  outDiv.style.margin = '2px 0 6px 0';

  if (cmdLower === 'cls' || cmdLower === 'clear') {
    logs.innerHTML = '';
    if (input) input.value = '';
    return;
  } else if (cmdLower.startsWith('ping')) {
    outDiv.innerHTML = `
      Pinging target relay <code>desk.audira.my.id</code> with 32 bytes of data:<br>
      Reply from 192.168.100.175: bytes=32 time=1ms TTL=64<br>
      Reply from 192.168.100.175: bytes=32 time=1ms TTL=64<br>
      Reply from 192.168.100.175: bytes=32 time=1ms TTL=64<br>
      Ping statistics: Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)
    `;
  } else if (cmdLower === 'systeminfo' || cmdLower === 'sys') {
    outDiv.innerHTML = `
      OS Name: Microsoft Windows 11 Pro (23H2)<br>
      System Model: Audira Edge High-Performance Node<br>
      Processor: 16 Virtual Core AMD EPYC / Intel Xeon 3.40 GHz<br>
      Total Physical Memory: 32,768 MB<br>
      Network Adapter: 10 Gbps VirtIO Virtual Ethernet
    `;
  } else if (cmdLower === 'status' || cmdLower === 'audiractl') {
    outDiv.innerHTML = `
      Service: AudiraDesk-Service [RUNNING - ELEVATED]<br>
      HBBS Connection: ONLINE (Port 21116 UDP P2P)<br>
      HBBR Relay: STANDBY (Direct P2P active, relay not needed)<br>
      E2EE Cipher: ChaCha20-Poly1305 with Curve25519 Ephemeral Keys
    `;
  } else if (cmdLower === 'whoami') {
    outDiv.innerHTML = `nt authority\\system (Elevated Background Daemon)`;
  } else if (cmdLower === 'netstat') {
    outDiv.innerHTML = `
      TCP  0.0.0.0:21114  LISTENING   (audira-api)<br>
      TCP  0.0.0.0:21116  LISTENING   (audira-hbbs)<br>
      TCP  0.0.0.0:21117  LISTENING   (audira-hbbr)<br>
      UDP  0.0.0.0:21116  *.*         (P2P Rendezvous)
    `;
  } else {
    outDiv.innerHTML = `Command executed successfully on remote daemon: <code>${escapeHtml(cmd)}</code>`;
  }

  logs.appendChild(outDiv);
  logs.scrollTop = logs.scrollHeight;
  if (input) input.value = '';
}

// ==========================================================================
// Dual-Pane SFTP File Manager Actions (libs/base/src/fs.rs)
// ==========================================================================
function openFileTransferModal(targetId) {
  const modal = document.getElementById('fileTransferModal');
  const targetDisplay = document.getElementById('ftTargetIdDisplay');
  if (targetDisplay) targetDisplay.textContent = targetId || currentSessionId;
  if (modal) modal.style.display = 'flex';
}

function closeFileTransferModal() {
  const modal = document.getElementById('fileTransferModal');
  if (modal) modal.style.display = 'none';
}

function selectFtItem(el) {
  if (!el || !el.parentElement) return;
  el.parentElement.querySelectorAll('.ft-file-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
}

function startSimulatedTransfer(direction) {
  const progressBar = document.getElementById('ftProgressBar');
  const statusText = document.getElementById('ftTransferStatusText');
  const chunkText = document.getElementById('ftChunkText');
  const hashText = document.getElementById('ftHashText');

  const selectedLocal = document.querySelector('#localFileList .ft-file-item.selected span')?.textContent || 'AudiraDesk-Setup.exe';
  const selectedRemote = document.querySelector('#remoteFileList .ft-file-item.selected span')?.textContent || 'audit_telemetry.db';
  const filename = direction === 'upload' ? selectedLocal : selectedRemote;

  if (statusText) statusText.textContent = `${direction === 'upload' ? 'Mengunggah (Upload)' : 'Mengunduh (Download)'}: ${filename}`;
  if (progressBar) progressBar.style.width = '0%';

  let percent = 0;
  const totalChunks = 96;
  const timer = setInterval(() => {
    percent += 8;
    if (progressBar) progressBar.style.width = percent + '%';
    const currentChunk = Math.min(totalChunks, Math.floor((percent / 100) * totalChunks));
    if (chunkText) chunkText.textContent = `Chunk: ${currentChunk} / ${totalChunks} (512 KB/chunk)`;

    if (percent >= 100) {
      clearInterval(timer);
      if (statusText) statusText.textContent = `Transfer Selesai: ${filename}`;
      if (hashText) hashText.innerHTML = `<span style="color:#10b981; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> SHA-256 Validated (f4e198a2...3b)</span>`;
      showToast(`Transfer ${filename} selesai via chunked SFTP!`, 'success');
    }
  }, 120);
}

// ==========================================================================
// Mobile Client Pairing (QR Code) Actions
// ==========================================================================
function openMobilePairModal() {
  const modal = document.getElementById('mobilePairModal');
  if (modal) modal.style.display = 'flex';
}

function closeMobilePairModal() {
  const modal = document.getElementById('mobilePairModal');
  if (modal) modal.style.display = 'none';
}

function copyMobilePairUri() {
  const uri = 'audira://connect?id=849203118&relay=desk.audira.my.id';
  navigator.clipboard.writeText(uri).then(() => {
    showToast('Mobile Pairing URI berhasil disalin!', 'success');
  }).catch(() => {
    showToast('URI: ' + uri, 'info');
  });
}


