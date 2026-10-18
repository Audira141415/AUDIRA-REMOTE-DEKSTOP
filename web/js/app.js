/**
 * Audira Remote Desktop - Official Interactive Client Application Script
 */

// Translations Dictionary
const i18n = {
  en: {
    bannerText: "Official Release: Audira Desk v1.5.0 Standalone Single-EXE is now available!",
    navFeatures: "Features",
    navSelfHost: "Self-Hosting",
    navScenarios: "Scenarios",
    navDownload: "Downloads",
    navFaq: "FAQ",
    heroBadge: "Fast • Open Source • Self-Hosted Alternative",
    heroTitle: "The Fast Open-Source <span>Remote Access & Support</span> Software",
    heroSubtitle: "Switch from TeamViewer, AnyDesk, and RustDesk to Audira Desk for a secure, private, and lightning-fast remote desktop experience with your own self-hosted relay servers.",
    btnDownloadWin: "Download for Windows (v1.5.0)",
    btnSelfHost: "Self-Hosting Guide",
    metaNoInstall: "Zero Install Needed (Single-File)",
    metaEncrypted: "End-to-End Encrypted (X25519)",
    metaFree: "Free & Open-Source (MIT)",
    yourDesk: "Your Desktop",
    deskDesc: "Share your ID and password to allow remote control",
    ready: "Ready for connection",
    controlDesk: "Control Remote Desktop",
    controlDesc: "Enter the remote ID of the computer you want to connect to",
    inputPlaceholder: "Enter 9-digit Remote ID",
    btnConnect: "Connect",
    btnFileTransfer: "File Transfer",
    recentSessions: "Recent Sessions",
    whySelfHost: "Why Self-Hosting?",
    whySelfHostDesc: "Stop paying expensive SaaS subscriptions with unpredictable latency, vendor lock-in, and privacy risks.",
    feat1Title: "Full Data Sovereignty",
    feat1Desc: "Keep your company's network and confidential screen data entirely inside your private cloud or on-premise infrastructure.",
    feat2Title: "Zero Latency & Hardware Codec",
    feat2Desc: "Real-time AV1, VP9, and H.264/H.265 hardware video encoding and WASAPI loopback audio powered by Opus at 60 FPS.",
    feat3Title: "Single-File Standalone Portable",
    feat3Desc: "Runs instantly without installation like AnyDesk. No complex dependencies or administrative requirements for quick support.",
    feat4Title: "Cross-Platform Ecosystem",
    feat4Desc: "Native clients for Windows 10/11, Linux (Debian/AppImage), macOS, Android, and direct browser-based HTML5 Web Client.",
    feat5Title: "Enterprise Security & UAC",
    feat5Desc: "Privileged Windows background service enables seamless UAC prompt navigation and Secure Desktop elevation.",
    feat6Title: "Custom Relay & Rendezvous",
    feat6Desc: "Deploy high-throughput rendezvous mediator and encrypted relay nodes (`audira-server` / `hbbs` / `hbbr`) in 60 seconds.",
    step1Title: "Step 1: Install Docker",
    step2Title: "Step 2: Download compose.yml",
    step3Title: "Step 3: Run Cluster",
    copiedToast: "Command copied to clipboard!"
  },
  id: {
    bannerText: "Rilis Resmi: Audira Desk v1.5.0 Standalone Single-EXE kini telah tersedia!",
    navFeatures: "Fitur",
    navSelfHost: "Self-Hosting",
    navScenarios: "Skenario",
    navDownload: "Unduh",
    navFaq: "FAQ",
    heroBadge: "Cepat • Open Source • Alternatif Self-Hosted",
    heroTitle: "Aplikasi Remote Desktop <span>Cepat & Aman</span> Open-Source",
    heroSubtitle: "Beralih dari TeamViewer, AnyDesk, dan RustDesk ke Audira Desk untuk pengalaman remote desktop yang aman, privat, dan super cepat dengan server relay milik Anda sendiri.",
    btnDownloadWin: "Unduh untuk Windows (v1.5.0)",
    btnSelfHost: "Panduan Self-Hosting",
    metaNoInstall: "Tanpa Perlu Instalasi (Single-File)",
    metaEncrypted: "Enkripsi End-to-End (X25519)",
    metaFree: "Gratis & Open-Source (MIT)",
    yourDesk: "Desktop Anda",
    deskDesc: "Bagikan ID dan kata sandi untuk mengizinkan kendali jarak jauh",
    ready: "Siap terhubung",
    controlDesk: "Kendali Desktop Jarak Jauh",
    controlDesc: "Masukkan ID remote komputer yang ingin Anda hubungi",
    inputPlaceholder: "Masukkan 9-digit Remote ID",
    btnConnect: "Hubungkan",
    btnFileTransfer: "Transfer File",
    recentSessions: "Sesi Terakhir",
    whySelfHost: "Mengapa Self-Hosting?",
    whySelfHostDesc: "Hentikan biaya langganan SaaS yang mahal dengan latensi tak terduga, keterikatan vendor, dan risiko kebocoran privasi.",
    feat1Title: "Kedaulatan Data Penuh",
    feat1Desc: "Jaga jaringan dan data layar rahasia Anda tetap berada sepenuhnya di dalam cloud privat atau server lokal Anda sendiri.",
    feat2Title: "Zero Latency & Hardware Codec",
    feat2Desc: "Encoding video hardware AV1, VP9, dan H.264/H.265 secara real-time dengan audio WASAPI loopback Opus pada 60 FPS.",
    feat3Title: "Single-File Standalone Portable",
    feat3Desc: "Berjalan langsung tanpa install persis seperti AnyDesk. Tanpa konfigurasi rumit untuk kebutuhan remote support kilat.",
    feat4Title: "Ekosistem Multi-Platform",
    feat4Desc: "Dukungan native untuk Windows 10/11, Linux (Debian/AppImage), macOS, Android, serta Web Client berbasis peramban.",
    feat5Title: "Keamanan Enterprise & UAC",
    feat5Desc: "Layanan latar belakang Windows terangkat memungkinkan navigasi prompt UAC dan Secure Desktop tanpa terputus.",
    feat6Title: "Relay & Rendezvous Mandiri",
    feat6Desc: "Jalankan mediator rendezvous dan node relay terenkripsi berkecepatan tinggi (`audira-server` / `hbbs` / `hbbr`) dalam 60 detik.",
    step1Title: "Langkah 1: Pasang Docker",
    step2Title: "Langkah 2: Unduh compose.yml",
    step3Title: "Langkah 3: Jalankan Kluster",
    copiedToast: "Perintah disalin ke clipboard!"
  }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initSimulator();
  initCopyButtons();
  initFaq();
});

// Theme Management
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
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
  localStorage.setItem('theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Language Management
function initLanguage() {
  const langToggle = document.getElementById('langToggle');
  const savedLang = localStorage.getItem('lang') || 'en';
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
  localStorage.setItem('lang', lang);
  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = lang.toUpperCase();
  }
  
  // Apply all dictionary keys
  const dict = i18n[lang] || i18n.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });
  
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
}

// Interactive Simulator Logic
function initSimulator() {
  const connectBtn = document.getElementById('simConnectBtn');
  const targetIdInput = document.getElementById('simTargetId');
  const simStatus = document.getElementById('simStatus');
  const refreshPwBtn = document.getElementById('refreshPwBtn');
  const simPassword = document.getElementById('simPassword');
  
  if (refreshPwBtn && simPassword) {
    refreshPwBtn.addEventListener('click', () => {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let newPw = '';
      for (let i = 0; i < 6; i++) {
        newPw += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      simPassword.textContent = newPw;
    });
  }
  
  if (connectBtn && targetIdInput) {
    connectBtn.addEventListener('click', () => {
      const id = targetIdInput.value.trim();
      if (!id) {
        showToast('Please enter a remote ID first!', 'warning');
        targetIdInput.focus();
        return;
      }
      
      connectBtn.disabled = true;
      connectBtn.innerHTML = `Connecting... <span class="spinner"></span>`;
      
      setTimeout(() => {
        connectBtn.disabled = false;
        connectBtn.innerHTML = `Connect`;
        showToast(`Connected to ${id}! RTT: 18ms | Codec: AV1 60 FPS`, 'success');
      }, 1200);
    });
  }
  
  // Quick session clicks
  document.querySelectorAll('.session-item').forEach(item => {
    item.addEventListener('click', () => {
      const sessionId = item.getAttribute('data-session-id');
      if (sessionId && targetIdInput) {
        targetIdInput.value = sessionId;
        targetIdInput.focus();
        showToast(`Selected session ${sessionId}`, 'info');
      }
    });
  });
}

// Copy Code Snippet
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.backgroundColor = '#10b981';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
          }, 2000);
          showToast(i18n[currentLang].copiedToast || 'Copied to clipboard!', 'success');
        });
      }
    });
  });
}

// FAQ Accordion
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.parentElement;
      card.classList.toggle('open');
    });
  });
}

// Toast Feedback System
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      color: #ffffff;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
    `;
    document.body.appendChild(toast);
  }
  
  if (type === 'success') {
    toast.style.borderLeft = '4px solid #10b981';
  } else if (type === 'warning') {
    toast.style.borderLeft = '4px solid #f59e0b';
  } else {
    toast.style.borderLeft = '4px solid #0284c7';
  }
  
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3500);
}
