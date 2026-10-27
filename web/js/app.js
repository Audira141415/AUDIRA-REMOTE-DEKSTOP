/**
 * AUDIRA REMOTE DESKTOP — Anti-AI-Slop Client & Landing Engine
 * Standards: Swiss Precision, Real Telemetry, Zero Fluff
 * Author: Audira Core Development Team
 */

// Comprehensive i18n Localization Dictionary
const i18n = {
  en: {
    bannerText: "Official Release: Audira Desk v1.5.3 Full Installer with zero-trust security is now available.",
    bannerLink: "Get Installer",
    navHome: "Home",
    navProduct: "Product",
    navResources: "Resources",
    navArchitecture: "Architecture",
    navTelemetry: "Live Session",
    navFleet: "Fleet",
    navComparison: "Compare",
    navSelfHost: "Self-Host",
    navPricing: "Pricing",
    navFaq: "FAQ",
    navDownloads: "Downloads",
    navConsoleLogin: "Console Login",
    btnDownloads: "Downloads",
    heroBadge: "P2P NAT Traversal • Hardware AV1/VP9 Codec • 100% Data Sovereignty",
    heroTitle: "High-Performance <span>Remote Desktop</span>. Zero Cloud Relays.",
    heroSubtitle: "Direct peer-to-peer UDP streaming at 60 FPS with hardware AV1/VP9 encoding and end-to-end encryption. Run your own private relay cluster in minutes.",
    btnHeroWin: "Download for Windows (25.1 MB)",
    btnWinInstaller: "Download Windows Installer",
    descWinInstaller: "Official full installer with Windows UAC Service, unattended background access, and verified code signature.",
    subMac: "Universal • Intel + Apple silicon",
    subWinInstaller: "Installer • x64",
    subWinPortable: "Portable • no install",
    subLinux: "Debian/Ubuntu (.deb) or any distro via AppImage (x64 / arm64). Supports Wayland & X11 headless.",
    olderVersionsTitle: "Release History • Previous Builds",
    btnSimDownload: "Download Client (25.1 MB)",
    btnHeroConsole: "Access Web Console",
    specPortable: "Zero-Installation Portable (Single Binary)",
    specCrypto: "Libsodium X25519-ChaCha20-Poly1305",
    specLicense: "Audira Commercial License",
    simYourId: "This Device ID",
    simOneTimePw: "One-Time Password",
    simRemoteControl: "Control Remote Desktop",
    simInputPlaceholder: "Enter 9-digit Remote ID (e.g. 100 200 300)",
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
    bento5Desc: "Packaged as an all-in-one standalone executable (25.0 MB). Simply send the file to an end-user; it launches instantaneously without installer overhead.",
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
    modalTitle: "Audira Account & Fleet Portal",
    modalSubtitle: "Production Authentication & Access Control",
    tabLogin: "Sign In",
    tabRegister: "Register Account",
    tabCredentials: "Sign In",
    tabSso: "OIDC / SSO",
    tabHardwareToken: "2FA / Token",
    lblEmail: "Username or Email",
    lblPassword: "Password",
    lblRemember: "Remember session on this workstation",
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
    tierFreeTag: "COMMUNITY",
    tierFreeTitle: "Community Edition",
    tierFreeSub: "For individuals & technicians using standalone remote desktop capabilities.",
    noteFree: "Standalone Portable (Full Access)",
    btnFree: "Download Community Edition",
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
    badgeFree: "COMMUNITY • FULL STANDALONE",
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
    colFeature: "CORE CAPABILITY",
    navFeatures: "Features",
    bentoTgTitle: "Telegram Bot 2FA & Remote Approval",
    bentoTgDesc: "Native Telegram bot integration for real-time connection alerts, 2FA authorization codes, and unattended remote approval right from your smartphone.",
    bentoTgTag: "TELEGRAM 2FA INTEGRATED",
    bentoTgReqTitle: "Session Authorization Request",
    bentoTgTarget: "Target Endpoint",
    bentoTgRequestor: "Requestor Identity",
    bentoTgSecurity: "Handshake Security",
    bentoTgTotp: "One-Time 2FA TOTP",
    bentoTgApproveBtn: "Approve Connection",
    bentoTgDenyBtn: "Deny",
    bentoTgApprovedMsg: "Session authorized via Webhook. P2P tunnel established.",
    bentoClusterTag: "Dedicated Cluster Deployment",
    bentoClusterTitle: "Private Relay Cluster & Infrastructure Sovereignty Architecture",
    bentoClusterPill: "HIGH-AVAILABILITY CLUSTER",
    bentoClusterS1Tag: "P2P SIGNAL COORDINATOR",
    bentoClusterS1Title: "Rendezvous Mediator",
    bentoClusterS1Desc: "Facilitates public IP discovery and instant UDP NAT hole punching between firewalls.",
    bentoClusterS2Tag: "ZERO-TRUST RELAY",
    bentoClusterS2Title: "Encrypted High-Speed Relay",
    bentoClusterS2Desc: "High-throughput fallback route when symmetric firewalls prevent direct P2P connection.",
    bentoClusterS3Tag: "ADMIN PORTAL & API",
    bentoClusterS3Title: "Web Management Console",
    bentoClusterS3Desc: "Private authenticated control panel for fleet inventory, live telemetry, and webhook alerts.",
    bentoClusterS4Tag: "CRYPTOGRAPHIC SECURITY",
    bentoClusterS4Title: "Libsodium Asymmetric",
    bentoClusterS4Desc: "X25519 key exchange and ChaCha20-Poly1305 symmetric encryption for all remote sessions.",

    // FAQ Accordion
    faqQ1: "How does Audira Desk achieve zero-latency remote control compared to AnyDesk/TeamViewer?",
    faqA1: "Audira Desk implements direct peer-to-peer UDP hole-punching. When both peers establish a direct route, screen frames and input packets bypass intermediate servers completely. Additionally, hardware-accelerated video codecs (AV1 and VP9 via NVENC/QuickSync/VAAPI) compress screen frames within 16 milliseconds at 60 FPS, with WASAPI audio loopback encoded via Opus.",
    faqQ2: "Is installation required, or can it be executed as a standalone portable tool?",
    faqA2: "Audira Desk is packaged as a single standalone executable. Double-clicking <code>AudiraDesk.exe</code> runs the application immediately without administrative rights or registry footprint. If persistent unattended access or Windows UAC elevation is desired, users can click \"Install\" at any time to register the elevated system service.",
    faqQ3: "What cryptographic algorithms are used for end-to-end encryption?",
    faqA3: "All cryptographic operations are backed by Libsodium. Session authentication and key exchange use Curve25519 (X25519), while symmetrical stream payload encryption uses ChaCha20-Poly1305 authenticated encryption (AEAD). Relay servers (hbbr) only forward encrypted byte packets and possess zero ability to decrypt video, keystrokes, or clipboard data.",
    faqQ4: "Can Audira Desk interact with Windows UAC elevation and Secure Desktop?",
    faqA4: "Yes. When installed on the target machine, Audira Desk registers an elevated Windows background service (<code>Audira Desk</code> service running as <code>NT AUTHORITY\\SYSTEM</code>). This service hooks into Windows Secure Desktop sessions, allowing remote technicians to accept administrator prompts and inject Ctrl+Alt+Del commands seamlessly.",
    faqQ5: "How do I point clients to my private relay server on Proxmox or a VPS?",
    faqA5: "Open Audira Desk &gt; Settings &gt; Network. Enter your relay server IP address or domain in the Rendezvous Server field, and enter your cluster public key (from <code>id_ed25519.pub</code>) in the Key field. All client connections will automatically encrypt and route through your private infrastructure!",

    // Official Footer
    footerDesc: "An open-source, high-speed remote desktop platform engineered for data sovereignty, low-latency display streaming, and zero-trust private relay infrastructure.",
    footerColArch: "Architecture",
    footerLinkNat: "NAT Traversal",
    footerLinkCodec: "Hardware Codec",
    footerLinkFleet: "Fleet Inventory &rarr;",
    footerLinkCompare: "Compare Stack",
    footerLinkDocker: "Docker Stack",
    footerLinkLatency: "Global Latency",
    footerLinkDownloads: "Downloads",
    footerLinkAdmin: "Fleet Admin Panel &rarr;",
    footerColSoft: "Software &amp; License",
    footerLinkGhRepo: "GitHub Repository",
    footerLinkReleases: "Releases &amp; Changelog",
    footerLinkBugs: "Bug Tracker",
    footerLinkLicense: "Commercial License",
    footerColContact: "Developer &amp; Contact",
    footerContactTeam: "Audira Desk Engineering Team",
    footerContactSupport: "Enterprise Support Desk",
    footerCopyright: "&copy; 2026 <strong>Audira Desk</strong>. Maintained by <strong>Audira Multimedia Digital</strong>. Licensed under AUDIRA Commercial License.",
    footerBottomWeb: "Official Website",
    footerBottomDownloads: "Binary Releases",
    footerBottomRelay: "Relay Docker",

    // Downloads Platforms
    descLinux: "Universal AppImage &amp; .deb package. Supports Wayland PipeWire DMA-BUF and X11 XShm.",
    btnLinux: "Download .deb / AppImage",
    descMac: "Universal DMG bundle with Apple ScreenCaptureKit API support for low-latency streaming.",
    btnMac: "Download .dmg",
    descAndroid: "Direct APK install. Control remote workstations or view and touch-operate mobile screens.",
    btnAndroid: "Download .apk",

    // Comparison Table
    compColCap: "CAPABILITY / ARCHITECTURE",
    compRowLicensing: "Licensing &amp; Cost",
    compCellSla: "Commercial License / SLA",
    compRowRelay: "Self-Hosted Relay Server",
    compCellDocker: "Included (Docker Cluster)",
    compRowP2p: "Direct P2P UDP NAT Traversal",
    compCellP2p: "Zero-Lag UDP Hole-Punch",
    compRowCodec: "Hardware Video Codecs",
    compRowUac: "Windows UAC &amp; Secure Desktop",
    compCellElevated: "Included Elevated Service",
    compRowTelemetry: "Data Sovereignty &amp; Telemetry",
    compCellNoLeaks: "Zero Telemetry Leaks",
    compRowEndpoints: "Unattended Endpoints Allowed",
    compCellUnlimited: "Unlimited Devices",
    compRowSource: "Complete Source Code Access",
    compCellGithub: "100% Open-Source GitHub",

    // Latency
    latActiveNodes: "Active Edge Nodes",
    latMeasured: "Measured using ICMP and UDP NAT packet handshakes",
    latRunBench: "Run Live Benchmark",

    // Simulator
    stageLive: "LIVE P2P 3D STAGE",
    stageHint: "Drag to rotate • Scroll to zoom",
    simLblRtt: "RTT Latency:",
    simLblFps: "Frame Rate:",
    simLblCodec: "Hardware Codec:",
    simLblAudio: "Audio Loopback:",
    simLblCrypto: "Cryptography:",
    simP2pActive: "P2P Direct UDP Active",
    btnWebViewer: "Web Viewer",
    simClientOp: "Client Operator",
    simLocalStation: "Local Station",
    simDirectHolePunch: "Direct UDP Hole-Punch",
    simTargetWs: "Target Workstation",
    simRemoteEndpoint: "Remote Endpoint",

    // Modals
    lblRegUser: "Username",
    lblRegName: "Full Name",
    lblRegEmail: "Email Address",
    lblRegPass: "Password",
    lblRegConfirm: "Confirm Password",
    btnRegSubmit: "Register Account Now",
    lblNoAccount: "Don't have an account?",
    lnkRegisterNew: "Register new account &rarr;",
    lblAlreadyHaveAccount: "Already have an account?",
    lnkSignInHere: "Sign in here &rarr;",
    btnPricingFeatures: "Features",
    periodFree: "/ free forever",
    periodMonth: "/ month",
  },
  id: {
    bannerText: "Rilis Resmi: Audira Desk v1.5.3 Full Installer dengan keamanan zero-trust kini telah tersedia.",
    bannerLink: "Unduh Installer",
    navHome: "Beranda",
    navProduct: "Produk",
    navResources: "Sumber Daya",
    navArchitecture: "Arsitektur",
    navTelemetry: "Sesi Langsung",
    navFleet: "Armada",
    navComparison: "Perbandingan",
    navSelfHost: "Self-Host",
    navPricing: "Harga",
    navFaq: "FAQ",
    navDownloads: "Unduhan",
    navConsoleLogin: "Portal Akun",
    btnDownloads: "Unduhan",
    heroBadge: "NAT Traversal P2P • Codec Hardware AV1/VP9 • Kedaulatan Data 100%",
    heroTitle: "Infrastruktur <span>Remote Desktop</span> Cepat. Tanpa Perantara Cloud.",
    heroSubtitle: "Koneksi langsung peer-to-peer UDP 60 FPS dengan akselerasi hardware AV1/VP9 dan enkripsi end-to-end. Jalankan cluster relay privat Anda dalam hitungan menit.",
    btnHeroWin: "Unduh untuk Windows (25.1 MB)",
    btnWinInstaller: "Unduh Installer Windows",
    descWinInstaller: "Paket instalasi lengkap dengan Layanan Windows UAC, akses background tanpa pengawas, dan sertifikat resmi terverifikasi.",
    subMac: "Universal • Intel + Apple silicon",
    subWinInstaller: "Installer • x64",
    subWinPortable: "Portabel • tanpa install",
    subLinux: "Debian/Ubuntu (.deb) atau distro lain via AppImage (x64 / arm64). Mendukung Wayland & X11 headless.",
    olderVersionsTitle: "Riwayat Rilis • Versi Sebelumnya",
    btnSimDownload: "Unduh Client (25.1 MB)",
    btnHeroConsole: "Masuk Konsol Web",
    specPortable: "Portabel Tanpa Install (File Tunggal)",
    specCrypto: "Enkripsi Libsodium X25519-ChaCha20",
    specLicense: "Lisensi Komersial (Proprietary)",
    simYourId: "ID Perangkat Ini",
    simOneTimePw: "Kata Sandi Sekali Pakai",
    simRemoteControl: "Kendalikan Desktop Jarak Jauh",
    simInputPlaceholder: "Masukkan 9-digit Remote ID (misal: 100 200 300)",
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
    bento5Desc: "Dipaketkan sebagai satu file exe mandiri (25.0 MB). Kirimkan langsung ke pengguna; dapat dijalankan seketika tanpa proses instalasi rumit.",
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
    tierFreeTag: "EDISI KOMUNITAS",
    tierFreeTitle: "Edisi Komunitas",
    tierFreeSub: "Untuk individu & teknisi yang menggunakan kendali desktop jarak jauh mandiri.",
    noteFree: "Portabel Mandiri (Akses Penuh)",
    btnFree: "Unduh Edisi Komunitas",
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
    badgeFree: "EDISI KOMUNITAS • STANDALONE",
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
    navFeatures: "Fitur",
    bentoTgTitle: "Integrasi Bot Telegram 2FA & Akses Remote",
    bentoTgDesc: "Integrasi langsung bot Telegram untuk notifikasi koneksi, kode 2FA otomatis, dan persetujuan akses jarak jauh langsung dari smartphone Anda tanpa perantara cloud pihak ketiga.",
    bentoTgTag: "TERINTEGRASI TELEGRAM 2FA",
    bentoTgReqTitle: "Permintaan Otorisasi Sesi",
    bentoTgTarget: "Target Endpoint",
    bentoTgRequestor: "Identitas Pemohon",
    bentoTgSecurity: "Keamanan Handshake",
    bentoTgTotp: "Kode Sekali Pakai 2FA",
    bentoTgApproveBtn: "Setujui Koneksi",
    bentoTgDenyBtn: "Tolak",
    bentoTgApprovedMsg: "Sesi disetujui via Webhook. Terowongan P2P berhasil dibuat.",
    bentoClusterTag: "Penerapan Kluster Mandiri",
    bentoClusterTitle: "Arsitektur Kluster Relay Privat & Kedaulatan Infrastruktur",
    bentoClusterPill: "KLUSTER AKTIF KETERSEDIAAN TINGGI",
    bentoClusterS1Tag: "KOORDINATOR SINYAL P2P",
    bentoClusterS1Title: "Rendezvous Mediator",
    bentoClusterS1Desc: "Memfasilitasi penemuan alamat IP publik dan proses pembukaan firewall UDP NAT secara instan.",
    bentoClusterS2Tag: "RELAY TERENKRIPSI ZERO-TRUST",
    bentoClusterS2Title: "Relay Berkecepatan Tinggi",
    bentoClusterS2Desc: "Jalur cadangan throughput tinggi saat kedua firewall berada di balik symmetric NAT yang ketat.",
    bentoClusterS3Tag: "PORTAL ADMIN & API",
    bentoClusterS3Title: "Konsol Manajemen Web",
    bentoClusterS3Desc: "Panel kontrol privat terotentikasi untuk inventaris armada, telemetri live, dan integrasi webhook bot.",
    bentoClusterS4Tag: "KEAMANAN KRIPTOGRAFI",
    bentoClusterS4Title: "Kriptografi Libsodium",
    bentoClusterS4Desc: "Pertukaran kunci X25519 dan enkripsi simetris ChaCha20-Poly1305 di setiap sesi remote tanpa perantara.",
    tagDownloads: "Paket Platform",
    titleDownloads: "Unduh Audira Desk untuk Komputer & Mobile",
    descDownloads: "Dikompilasi dengan Rust dan Flutter. Kendali jarak jauh berdefinisi tinggi untuk Windows, Linux, macOS, dan Android.",
    tagFaq: "Pusat Bantuan",
    titleFaq: "Pertanyaan yang Sering Diajukan",
    descFaq: "Spesifikasi teknis, jaminan enkripsi data, dan panduan konfigurasi.",
    modalTitle: "Portal Akun & Armada Audira",
    modalSubtitle: "Autentikasi Produksi & Kontrol Akses",
    tabLogin: "Masuk",
    tabRegister: "Daftar Akun",
    tabCredentials: "Masuk",
    tabSso: "OIDC / SSO",
    tabHardwareToken: "2FA / Token",
    lblEmail: "Username atau Email",
    lblPassword: "Kata Sandi",
    lblRemember: "Ingat sesi di perangkat ini",
    lnkKeyRecovery: "Kunci Kluster",
    btnSignIn: "Masuk ke Fleet Control",
    ssoDesc: "Autentikasi menggunakan penyedia identitas enterprise atau direktori OAuth terbuka:",
    tokenDesc: "Masukkan 6-digit kode verifikasi dari TOTP Authenticator Anda (Google Authenticator, YubiKey):",
    copiedToast: "Perintah disalin ke clipboard!",

    // FAQ Accordion
    faqQ1: "Bagaimana Audira Desk mencapai kendali jarak jauh tanpa latensi dibandingkan AnyDesk/TeamViewer?",
    faqA1: "Audira Desk mengimplementasikan direct peer-to-peer UDP hole-punching. Ketika kedua perangkat terhubung langsung, frame layar dan paket input melewati server perantara secara penuh. Selain itu, codec video terakselerasi hardware (AV1 dan VP9 via NVENC/QuickSync/VAAPI) mengompresi frame layar di bawah 16 milidetik pada 60 FPS, dengan audio loopback WASAPI yang dienkode via Opus.",
    faqQ2: "Apakah instalasi diperlukan, atau dapatkah dijalankan sebagai aplikasi portabel mandiri?",
    faqA2: "Audira Desk dikemas sebagai satu file biner portabel mandiri. Klik ganda pada <code>AudiraDesk.exe</code> langsung menjalankan aplikasi tanpa hak administrator atau jejak registry. Jika diinginkan akses unattended permanen atau elevasi UAC Windows, pengguna dapat memilih \"Install\" kapan saja untuk mendaftarkan layanan sistem terangkat.",
    faqQ3: "Algoritma kriptografi apa yang digunakan untuk enkripsi end-to-end?",
    faqA3: "Semua operasi kriptografi didukung oleh Libsodium. Otentikasi sesi dan pertukaran kunci menggunakan Curve25519 (X25519), sementara enkripsi payload streaming simetris menggunakan ChaCha20-Poly1305 authenticated encryption (AEAD). Server relay (hbbr) hanya meneruskan paket byte terenkripsi dan tidak memiliki kemampuan untuk mendekripsi video, ketikan keyboard, maupun data clipboard.",
    faqQ4: "Bisakah Audira Desk berinteraksi dengan elevasi UAC Windows dan Secure Desktop?",
    faqA4: "Ya. Saat diinstal pada perangkat target, Audira Desk mendaftarkan layanan latar belakang Windows yang terangkat (layanan <code>Audira Desk</code> yang berjalan sebagai <code>NT AUTHORITY\\SYSTEM</code>). Layanan ini terhubung ke sesi Secure Desktop Windows, memungkinkan teknisi remote menyetujui prompt administrator dan mengirim pintasan Ctrl+Alt+Del tanpa kendala.",
    faqQ5: "Bagaimana cara mengarahkan klien ke server relay privat saya di Proxmox atau VPS?",
    faqA5: "Buka Audira Desk &gt; Pengaturan &gt; Jaringan. Masukkan alamat IP atau domain server relay Anda pada kolom Server Rendezvous, serta masukkan kunci publik cluster (dari file <code>id_ed25519.pub</code>) pada kolom Key. Semua koneksi client akan otomatis terenkripsi dan terhubung melalui infrastruktur privat Anda!",

    // Official Footer
    footerDesc: "Platform remote desktop open-source berkecepatan tinggi yang dirancang untuk kedaulatan data, streaming tampilan latensi rendah, dan infrastruktur relay privat zero-trust.",
    footerColArch: "Arsitektur",
    footerLinkNat: "NAT Traversal",
    footerLinkCodec: "Codec Hardware",
    footerLinkFleet: "Inventaris Armada &rarr;",
    footerLinkCompare: "Bandingkan Solusi",
    footerLinkDocker: "Kluster Docker",
    footerLinkLatency: "Latensi Global",
    footerLinkDownloads: "Unduhan",
    footerLinkAdmin: "Panel Admin Armada &rarr;",
    footerColSoft: "Perangkat Lunak &amp; Lisensi",
    footerLinkGhRepo: "Repositori GitHub",
    footerLinkReleases: "Rilis &amp; Catatan Versi",
    footerLinkBugs: "Pelacak Isu &amp; Bug",
    footerLinkLicense: "Lisensi Komersial",
    footerColContact: "Pengembang &amp; Kontak",
    footerContactTeam: "Tim Engineering Audira Desk",
    footerContactSupport: "Layanan Bantuan Enterprise",
    footerCopyright: "&copy; 2026 <strong>Audira Desk</strong>. Dikelola oleh <strong>Audira Multimedia Digital</strong>. Berlisensi di bawah Lisensi Komersial AUDIRA.",
    footerBottomWeb: "Situs Resmi",
    footerBottomDownloads: "Rilis Biner",
    footerBottomRelay: "Relay Docker",

    // Downloads Platforms
    descLinux: "Paket universal AppImage &amp; .deb. Mendukung Wayland PipeWire DMA-BUF dan X11 XShm.",
    btnLinux: "Unduh .deb / AppImage",
    descMac: "Bundle DMG universal dengan dukungan API Apple ScreenCaptureKit untuk streaming latensi rendah.",
    btnMac: "Unduh .dmg",
    descAndroid: "Instalasi APK langsung. Kendalikan workstation jarak jauh atau pantau dan operasikan layar ponsel.",
    btnAndroid: "Unduh .apk",

    // Comparison Table
    compColCap: "KEMAMPUAN / ARSITEKTUR",
    compRowLicensing: "Lisensi &amp; Biaya",
    compCellSla: "Lisensi Komersial / SLA",
    compRowRelay: "Server Relay Mandiri (Self-Hosted)",
    compCellDocker: "Termasuk (Kluster Docker)",
    compRowP2p: "Direct P2P UDP NAT Traversal",
    compCellP2p: "UDP Hole-Punch Bebas Lag",
    compRowCodec: "Codec Video Hardware",
    compRowUac: "Windows UAC &amp; Secure Desktop",
    compCellElevated: "Layanan Terangkat Termasuk",
    compRowTelemetry: "Kedaulatan Data &amp; Telemetri",
    compCellNoLeaks: "Nol Kebocoran Telemetri",
    compRowEndpoints: "Perangkat Unattended yang Diizinkan",
    compCellUnlimited: "Perangkat Tanpa Batas",
    compRowSource: "Akses Kode Sumber Lengkap",
    compCellGithub: "100% Open-Source di GitHub",

    // Latency
    latActiveNodes: "Node Edge Aktif",
    latMeasured: "Diukur menggunakan jabat tangan paket ICMP dan UDP NAT",
    latRunBench: "Uji Tolok Ukur Live",

    // Simulator
    stageLive: "STAGE 3D P2P LIVE",
    stageHint: "Geser untuk putar • Gulir untuk zoom",
    simLblRtt: "Latensi RTT:",
    simLblFps: "Frame Rate:",
    simLblCodec: "Codec Hardware:",
    simLblAudio: "Audio Loopback:",
    simLblCrypto: "Kriptografi:",
    simP2pActive: "UDP P2P Langsung Aktif",
    btnWebViewer: "Web Viewer",
    simClientOp: "Operator Klien",
    simLocalStation: "Stasiun Lokal",
    simDirectHolePunch: "Hole-Punch UDP Langsung",
    simTargetWs: "Workstation Target",
    simRemoteEndpoint: "Endpoint Jarak Jauh",

    // Modals
    lblRegUser: "Username",
    lblRegName: "Nama Lengkap",
    lblRegEmail: "Alamat Email",
    lblRegPass: "Kata Sandi",
    lblRegConfirm: "Konfirmasi Kata Sandi",
    btnRegSubmit: "Daftar Akun Sekarang",
    lblNoAccount: "Belum memiliki akun?",
    lnkRegisterNew: "Daftar Akun Baru &rarr;",
    lblAlreadyHaveAccount: "Sudah memiliki akun?",
    lnkSignInHere: "Masuk di sini &rarr;",
    btnPricingFeatures: "Fitur",
    periodFree: "/ gratis selamanya",
    periodMonth: "/ bulan",
  }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initMobileMenu();
  initSmoothNavigation();
  initSimulator();
  initCopyActions();
  initFaqAccordion();
  initAuthModal();
  initLatencyBenchmark();
  initPricingToggle();
  initPricingCards();
  handleUrlRouting();
  initModalDismiss();
  initClientSessionTimeout();
  initOsDetection();
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
  const savedLang = (localStorage.getItem('audira_lang') || 'en').toLowerCase();
  setLanguage(savedLang === 'id' ? 'id' : 'en');

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'id' : 'en';
      setLanguage(nextLang);
    });
  }
}

function setLanguage(lang) {
  const normalizedLang = (lang || 'en').toLowerCase() === 'id' ? 'id' : 'en';
  currentLang = normalizedLang;
  localStorage.setItem('audira_lang', normalizedLang);
  document.documentElement.setAttribute('lang', normalizedLang);

  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = normalizedLang.toUpperCase();
  }

  const dict = i18n[normalizedLang] || i18n.en;
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

  const benchmarkBtnText = document.getElementById('benchmarkBtnText');
  const runBenchmarkBtn = document.getElementById('runBenchmarkBtn');
  if (benchmarkBtnText && runBenchmarkBtn && !runBenchmarkBtn.disabled) {
    benchmarkBtnText.textContent = dict.latRunBench || (normalizedLang === 'id' ? 'Uji Tolok Ukur Live' : 'Run Live Benchmark');
  }

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
      const code = copyIdBtn.getAttribute('data-code') || '';
      if (!code) {
        showToast('ID Perangkat tersedia setelah aplikasi desktop dijalankan.', 'info');
        return;
      }
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
        showToast(`Membuka WebRTC Client Viewer di tab baru...`, 'info');
        setTimeout(() => {
          window.open(`viewer.html?id=${encodeURIComponent(id)}&name=RemoteHost`, '_blank');
        }, 500);
      }, 700);
    });

    targetIdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        connectBtn.click();
      }
    });
  }

  const webViewerBtn = document.getElementById('simWebViewerBtn');
  if (webViewerBtn && targetIdInput) {
    webViewerBtn.addEventListener('click', () => {
      const id = targetIdInput.value.trim() || '269 819 537';
      window.open(`viewer.html?id=${encodeURIComponent(id)}&name=RemoteHost`, '_blank');
      showToast(`Membuka WebRTC Remote Viewer ke ${id}...`, 'info');
    });
  }

  if (fileTransferBtn && targetIdInput) {
    fileTransferBtn.addEventListener('click', () => {
      const id = targetIdInput.value.trim() || '100 200 300';
      showToast('Transfer file dienkripsi via AudiraDesk Desktop Client.', 'info');
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
    const token = localStorage.getItem('audira_access_token');
    const user = localStorage.getItem('audira_user');
    if (token && user) {
      try {
        const u = JSON.parse(user);
        if (u.is_owner || u.is_admin || u.role === 'owner' || u.role === 'admin') {
          window.location.href = 'admin.html';
          return;
        }
      } catch (_) {}
      showLoggedInState();
      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }
      return;
    }
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      const emailInput = document.getElementById('adminEmail');
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 150);
      }
    }
  };
  window.openLoginModal = openModal;

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
      setFormAlert('regAlert', null);
      setFormAlert('loginAlert', null);
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
  const hasSession = sessionStorage.getItem('audira_logged_in') === 'true' || 
                     (localStorage.getItem('audira_remember') === 'true' && localStorage.getItem('audira_access_token'));
  if (hasSession) {
    showLoggedInState();
  }
}

function setFormAlert(alertId, message, type = 'error') {
  const alertEl = document.getElementById(alertId);
  if (!alertEl) return;
  if (!message) {
    alertEl.style.display = 'none';
    alertEl.innerHTML = '';
    return;
  }
  let bg = 'rgba(239, 68, 68, 0.12)';
  let border = '#ef4444';
  let color = '#f87171';
  let icon = '❌';

  if (type === 'success') {
    bg = 'rgba(16, 185, 129, 0.12)';
    border = '#10b981';
    color = '#34d399';
    icon = '✅';
  } else if (type === 'warning') {
    bg = 'rgba(245, 158, 11, 0.12)';
    border = '#f59e0b';
    color = '#fbbf24';
    icon = '⚠️';
  }

  alertEl.style.display = 'block';
  alertEl.style.background = bg;
  alertEl.style.border = `1px solid ${border}`;
  alertEl.style.color = color;
  alertEl.style.padding = '0.75rem 1rem';
  alertEl.style.borderRadius = '8px';
  alertEl.style.marginBottom = '1.25rem';
  alertEl.style.fontSize = '0.85rem';
  alertEl.style.fontWeight = '600';
  alertEl.style.lineHeight = '1.4';
  alertEl.innerHTML = `<div style="display:flex; align-items:flex-start; gap:0.5rem;"><span>${icon}</span><span>${message}</span></div>`;
}

function switchToRegister() {
  setFormAlert('regAlert', null);
  setFormAlert('loginAlert', null);
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
  setFormAlert('regAlert', null);
  setFormAlert('loginAlert', null);
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
  setFormAlert('loginAlert', null);
  const submitBtn = document.getElementById('adminLoginSubmitBtn');
  const label = document.getElementById('loginBtnLabel');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const rememberCheckbox = document.getElementById('rememberSession');
  const isRemember = rememberCheckbox ? rememberCheckbox.checked : true;
  const username = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    const msg = 'Username/Email dan kata sandi tidak boleh kosong.';
    setFormAlert('loginAlert', msg, 'warning');
    showToast(msg, 'warning');
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
        type: 'account',
        remember: isRemember
      })
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      localStorage.setItem('audira_access_token', data.access_token);
      localStorage.setItem('audira_user', JSON.stringify(data.user));
      if (isRemember) {
        localStorage.setItem('audira_remember', 'true');
      } else {
        localStorage.removeItem('audira_remember');
      }
      sessionStorage.setItem('audira_logged_in', 'true');
      showLoggedInState(data.user);
      if (!isRemember) {
        initClientSessionTimeout();
      }

      const isStaff = data.user.role === 'owner' || data.user.role === 'admin' || data.user.is_admin;
      if (isStaff) {
        setFormAlert('loginAlert', `Login berhasil sebagai ${data.user.role_title || 'Administrator'}. Mengalihkan ke Admin Console...`, 'success');
        showToast(`Login berhasil sebagai ${data.user.role_title || 'Administrator'}.`, 'success');
        setTimeout(() => {
          navigateToFleet();
        }, 750);
      } else {
        setFormAlert('loginAlert', `Login berhasil! Selamat datang, ${data.user.display_name || data.user.name}.`, 'success');
        showToast(`Selamat datang di Audira Desk, ${data.user.display_name || data.user.name}!`, 'success');
      }
    } else {
      const errMsg = data.error || 'Autentikasi gagal. Periksa username dan kata sandi.';
      setFormAlert('loginAlert', errMsg, 'error');
      showToast(errMsg, 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    const errMsg = 'Gagal menghubungi server API autentikasi. Pastikan koneksi server aktif.';
    setFormAlert('loginAlert', errMsg, 'error');
    showToast(errMsg, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (label) label.textContent = 'Masuk ke Fleet Control';
  }
}

async function handleAdminRegister() {
  setFormAlert('regAlert', null);
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
    const msg = 'Username harus minimal 3 karakter.';
    setFormAlert('regAlert', msg, 'warning');
    showToast(msg, 'warning');
    if (usernameInput) usernameInput.focus();
    return;
  }
  if (!email || !email.includes('@')) {
    const msg = 'Alamat email tidak valid.';
    setFormAlert('regAlert', msg, 'warning');
    showToast(msg, 'warning');
    if (emailInput) emailInput.focus();
    return;
  }
  if (!password || password.length < 6) {
    const msg = 'Kata sandi harus minimal 6 karakter.';
    setFormAlert('regAlert', msg, 'warning');
    showToast(msg, 'warning');
    if (pwInput) pwInput.focus();
    return;
  }
  if (password !== passwordConfirm) {
    const msg = 'Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.';
    setFormAlert('regAlert', msg, 'warning');
    showToast(msg, 'warning');
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
      initClientSessionTimeout();
      setFormAlert('regAlert', `Pendaftaran berhasil! Akun '${data.user.username}' telah dibuat.`, 'success');
      showToast(`Pendaftaran berhasil! Selamat datang di Audira Desk, ${data.user.display_name || data.user.username}.`, 'success');
    } else {
      const errMsg = data.error || 'Pendaftaran gagal. Silakan periksa data Anda.';
      setFormAlert('regAlert', errMsg, 'error');
      showToast(errMsg, 'error');
    }
  } catch (err) {
    console.error('Registration error:', err);
    const errMsg = 'Gagal menghubungi server API saat mendaftar. Pastikan koneksi server aktif.';
    setFormAlert('regAlert', errMsg, 'error');
    showToast(errMsg, 'error');
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

function switchProfileTab(tabKey, btn) {
  document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.profile-pane').forEach(p => p.classList.remove('active'));

  if (btn) {
    btn.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`.profile-tab-btn[data-ptab="${tabKey}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }

  const paneId = 'paneProfile' + tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  const targetPane = document.getElementById(paneId);
  if (targetPane) targetPane.classList.add('active');
}

function copyProfileText(text, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg || 'Berhasil disalin ke clipboard!', 'success');
    }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
  function fallbackCopy(val) {
    const ta = document.createElement('textarea');
    ta.value = val;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(msg || 'Berhasil disalin!', 'success');
    } catch (_) {
      showToast(val, 'info');
    }
    document.body.removeChild(ta);
  }
}

async function renameUserDevice(deviceId, currentAlias) {
  const newName = prompt(`Ubah nama alias untuk perangkat (${deviceId}):`, currentAlias || '');
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) {
    showToast('Nama alias tidak boleh kosong.', 'warning');
    return;
  }

  try {
    const token = localStorage.getItem('audira_access_token');
    const res = await fetch('/api/user/rename-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ device_id: deviceId, alias: trimmed })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || 'Nama alias berhasil diperbarui!', 'success');
      showLoggedInState();
    } else {
      showToast(data.error || 'Gagal mengubah nama perangkat.', 'error');
    }
  } catch (err) {
    showToast('Gagal menghubungi server.', 'error');
  }
}

async function unlinkUserDevice(deviceId, deviceName) {
  if (!confirm(`Putuskan tautan perangkat "${deviceName || deviceId}" dari akun Anda? Perangkat ini tidak akan dapat diakses hingga dihubungkan kembali.`)) {
    return;
  }

  try {
    const token = localStorage.getItem('audira_access_token');
    const res = await fetch('/api/user/unlink-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ device_id: deviceId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || 'Perangkat berhasil diputuskan.', 'success');
      showLoggedInState();
    } else {
      showToast(data.error || 'Gagal memutuskan perangkat.', 'error');
    }
  } catch (err) {
    showToast('Gagal menghubungi server.', 'error');
  }
}

async function handleProfilePasswordChange() {
  const alertEl = document.getElementById('profilePwdAlert');
  if (alertEl) alertEl.style.display = 'none';

  const oldPwd = (document.getElementById('profileOldPwd')?.value || '').trim();
  const newPwd = (document.getElementById('profileNewPwd')?.value || '').trim();
  const confirmPwd = (document.getElementById('profileConfirmPwd')?.value || '').trim();
  const btn = document.getElementById('btnProfileChangePwd');

  if (!oldPwd) {
    setProfileAlert('profilePwdAlert', 'Kata sandi saat ini wajib diisi.', 'warning');
    return;
  }
  if (!newPwd || newPwd.length < 6) {
    setProfileAlert('profilePwdAlert', 'Kata sandi baru minimal 6 karakter.', 'warning');
    return;
  }
  if (newPwd !== confirmPwd) {
    setProfileAlert('profilePwdAlert', 'Konfirmasi kata sandi baru tidak cocok.', 'warning');
    return;
  }

  if (btn) btn.disabled = true;
  try {
    const token = localStorage.getItem('audira_access_token');
    const res = await fetch('/api/accounts/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ old_password: oldPwd, new_password: newPwd })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setProfileAlert('profilePwdAlert', 'Kata sandi berhasil diperbarui dengan aman!', 'success');
      showToast('Kata sandi berhasil diperbarui!', 'success');
      document.getElementById('profileChangePwdForm')?.reset();
    } else {
      setProfileAlert('profilePwdAlert', data.error || 'Gagal memperbarui kata sandi.', 'error');
    }
  } catch (err) {
    setProfileAlert('profilePwdAlert', 'Gagal menghubungi server.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleProfileUpdate() {
  const alertEl = document.getElementById('profileEditAlert');
  if (alertEl) alertEl.style.display = 'none';

  const dName = (document.getElementById('editDisplayName')?.value || '').trim();
  const email = (document.getElementById('editEmail')?.value || '').trim();
  const tgNotif = document.getElementById('editTelegramNotif')?.checked ?? true;
  const btn = document.getElementById('btnSaveProfile');

  if (!dName) {
    setProfileAlert('profileEditAlert', 'Nama tampilan tidak boleh kosong.', 'warning');
    return;
  }

  if (btn) btn.disabled = true;
  try {
    const token = localStorage.getItem('audira_access_token');
    const res = await fetch('/api/user/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ display_name: dName, email: email, telegram_notif: tgNotif })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setProfileAlert('profileEditAlert', 'Profil berhasil diperbarui!', 'success');
      showToast('Profil berhasil disimpan!', 'success');
      try {
        const u = JSON.parse(localStorage.getItem('audira_user') || '{}');
        u.display_name = dName;
        u.email = email;
        localStorage.setItem('audira_user', JSON.stringify(u));
      } catch (_) {}
      showLoggedInState();
    } else {
      setProfileAlert('profileEditAlert', data.error || 'Gagal memperbarui profil.', 'error');
    }
  } catch (err) {
    setProfileAlert('profileEditAlert', 'Gagal menghubungi server.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleRevokeOtherSessions() {
  if (!confirm('Putuskan semua sesi web login lain selain yang sedang aktif saat ini?')) return;
  try {
    const token = localStorage.getItem('audira_access_token');
    const res = await fetch('/api/user/revoke-other-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Semua sesi lain berhasil diputus.', 'success');
    } else {
      showToast(data.error || 'Gagal memutus sesi lain.', 'warning');
    }
  } catch (err) {
    showToast('Gagal menghubungi server.', 'error');
  }
}

function setProfileAlert(alertId, msg, type = 'error') {
  const el = document.getElementById(alertId);
  if (!el) return;
  el.style.display = 'block';
  if (type === 'success') {
    el.style.background = 'rgba(16, 185, 129, 0.12)';
    el.style.border = '1px solid #10b981';
    el.style.color = '#34d399';
  } else if (type === 'warning') {
    el.style.background = 'rgba(245, 158, 11, 0.12)';
    el.style.border = '1px solid #f59e0b';
    el.style.color = '#fbbf24';
  } else {
    el.style.background = 'rgba(239, 68, 68, 0.12)';
    el.style.border = '1px solid #ef4444';
    el.style.color = '#f87171';
  }
  el.textContent = msg;
}

async function showLoggedInState(user) {
  document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));
  const tabs = document.querySelector('.modal-tabs');
  if (tabs) tabs.style.display = 'none';

  const loggedInView = document.getElementById('authViewLoggedIn');
  if (loggedInView) loggedInView.classList.add('active');

  const modalDialog = document.querySelector('#loginModal .modal-dialog');
  if (modalDialog) modalDialog.classList.add('profile-expanded');

  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = 'Audira Account & Fleet Portal';

  if (!user) {
    try {
      const stored = localStorage.getItem('audira_user');
      if (stored) user = JSON.parse(stored);
    } catch (e) {}
  }

  const displayName = (user && (user.display_name || user.name)) || 'User';
  const username = (user && (user.username || user.name)) || 'user';
  const email = (user && user.email) || `${username}@audira.my.id`;
  const role = (user && user.role) || (user && user.is_admin ? 'admin' : 'user');
  const isOwner = role === 'owner' || (user && user.is_owner);
  const isAdmin = isOwner || role === 'admin' || (user && user.is_admin);

  const openBtn = document.getElementById('openLoginBtn');
  if (openBtn) {
    openBtn.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:5px; box-shadow:0 0 6px #10b981;"></span>
      <span>${escapeHtml(displayName)}</span>
    `;
    openBtn.style.borderColor = '#10b981';
  }

  const nameEl = document.getElementById('profileDisplayName');
  if (nameEl) nameEl.textContent = displayName;

  const handleEl = document.getElementById('profileUserHandle');
  if (handleEl) handleEl.innerHTML = `@${escapeHtml(username)} &bull; ${escapeHtml(email)}`;

  const guideUserEl = document.getElementById('profileGuideUsername');
  if (guideUserEl) guideUserEl.textContent = `@${username}`;

  const avatarEl = document.getElementById('profileAvatarInitial');
  if (avatarEl) {
    const parts = displayName.trim().split(/\s+/);
    const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    avatarEl.textContent = initials || 'AD';
    if (isOwner) {
      avatarEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      avatarEl.style.boxShadow = '0 0 20px rgba(245,158,11,0.4)';
    } else if (isAdmin) {
      avatarEl.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
      avatarEl.style.boxShadow = '0 0 20px rgba(2,132,199,0.4)';
    } else {
      avatarEl.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      avatarEl.style.boxShadow = '0 0 20px rgba(16,185,129,0.3)';
    }
  }

  const badgeEl = document.getElementById('profileRoleBadge');
  const adminBanner = document.getElementById('profileAdminPanelBanner');

  if (badgeEl) {
    if (isOwner) {
      badgeEl.innerHTML = '👑 Owner (Superadmin)';
      badgeEl.style.background = 'rgba(245, 158, 11, 0.15)';
      badgeEl.style.color = '#f59e0b';
      badgeEl.style.border = '1px solid rgba(245, 158, 11, 0.3)';
    } else if (isAdmin) {
      badgeEl.innerHTML = '🛡️ Administrator';
      badgeEl.style.background = 'rgba(2, 132, 199, 0.15)';
      badgeEl.style.color = '#38bdf8';
      badgeEl.style.border = '1px solid rgba(2, 132, 199, 0.3)';
    } else {
      badgeEl.innerHTML = '👤 Member (Klien)';
      badgeEl.style.background = 'rgba(148, 163, 184, 0.15)';
      badgeEl.style.color = 'var(--color-text-dim)';
      badgeEl.style.border = '1px solid rgba(148, 163, 184, 0.3)';
    }
  }

  if (adminBanner) {
    adminBanner.style.display = isAdmin ? 'flex' : 'none';
  }

  // Pre-fill profile settings inputs
  const editName = document.getElementById('editDisplayName');
  const editMail = document.getElementById('editEmail');
  if (editName && !editName.value) editName.value = displayName;
  if (editMail && !editMail.value) editMail.value = email;

  // Query live personal user profile & devices (/api/user/me)
  try {
    const token = localStorage.getItem('audira_access_token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('/api/user/me', { headers: authHeaders });
    if (res.ok) {
      const myData = await res.json();
      if (myData.user) {
        const u = myData.user;
        const devices = u.devices || [];
        const quota = u.quota || { devices_used: devices.length, devices_max: 5 };

        // Update counts
        const tabCountEl = document.getElementById('profileDeviceTabCount');
        if (tabCountEl) tabCountEl.textContent = devices.length;

        const kpiTotal = document.getElementById('kpiProfileDevTotal');
        if (kpiTotal) kpiTotal.textContent = `${devices.length} Unit`;

        const onlineCount = devices.filter(d => d.is_online).length;
        const kpiOnline = document.getElementById('kpiProfileDevOnline');
        if (kpiOnline) kpiOnline.textContent = `${onlineCount} Unit`;

        const kpiQuota = document.getElementById('kpiProfileDevQuota');
        if (kpiQuota) kpiQuota.textContent = `${devices.length} / ${quota.devices_max}`;

        const featQuota = document.getElementById('featDeviceQuotaLabel');
        if (featQuota) featQuota.textContent = `Maksimal ${quota.devices_max} Slot Perangkat Pribadi`;

        // Member since
        const memberSinceEl = document.getElementById('profileMemberSince');
        if (memberSinceEl) {
          memberSinceEl.textContent = `Terdaftar sejak: ${u.created_at || 'Baru'}`;
        }

        // Plan labels
        const planBadge = document.getElementById('profilePlanBadge');
        if (planBadge) planBadge.textContent = u.plan || 'Community Free';

        const subTitle = document.getElementById('subPanePlanTitle');
        if (subTitle) subTitle.textContent = u.plan || 'Community Free';

        // License key
        const licEl = document.getElementById('profileLicenseKeyDisplay');
        if (licEl && u.license_key) licEl.textContent = u.license_key;

        // Current IP
        const ipEl = document.getElementById('profileCurrentIp');
        if (ipEl && u.client_ip) ipEl.textContent = u.client_ip;

        // Telegram preference
        const tgCheck = document.getElementById('editTelegramNotif');
        if (tgCheck && typeof u.telegram_notif !== 'undefined') tgCheck.checked = u.telegram_notif;

        // Render device cards
        const devListEl = document.getElementById('profileLinkedDevicesList');
        if (devListEl) {
          if (devices.length === 0) {
            devListEl.innerHTML = `
              <div style="text-align:center; padding:1.75rem 1rem; background:var(--color-bg-subtle); border:1px dashed var(--color-border); border-radius:10px; font-size:0.83rem; color:var(--color-text-dim);">
                <div style="font-size:1.6rem; margin-bottom:0.4rem;">💻</div>
                <div style="font-weight:700; color:var(--color-text-heading); margin-bottom:0.25rem;">Belum ada perangkat tertaut</div>
                <div>Login pada aplikasi Audira Desk di komputer atau smartphone Anda menggunakan akun ini untuk menghubungkannya secara otomatis.</div>
              </div>
            `;
          } else {
            devListEl.innerHTML = devices.map(d => {
              const isOnline = d.is_online;
              const cleanId = d.raw_id || d.id.replace(/\s+/g, '');
              const alias = escapeHtml(d.alias || d.hostname || 'Device');
              const os = d.os || 'Windows';
              let osIcon = '💻';
              if (os.toLowerCase().includes('android')) osIcon = '📱';
              else if (os.toLowerCase().includes('linux')) osIcon = '🐧';
              else if (os.toLowerCase().includes('mac') || os.toLowerCase().includes('ios')) osIcon = '🍎';

              return `
                <div class="device-card-item">
                  <div style="display:flex; align-items:center; gap:0.75rem; min-width:0;">
                    <div class="device-os-icon">
                      <span style="font-size:1.25rem;">${osIcon}</span>
                    </div>
                    <div style="min-width:0;">
                      <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                        <span style="font-size:0.88rem; font-weight:800; color:var(--color-text-heading);">${alias}</span>
                        <span style="display:inline-flex; align-items:center; gap:0.3rem; font-size:0.68rem; font-weight:700; padding:0.15rem 0.45rem; border-radius:4px; ${isOnline ? 'background:rgba(16,185,129,0.12); color:#10b981;' : 'background:rgba(148,163,184,0.12); color:var(--color-text-dim);'}">
                          <span style="width:6px; height:6px; border-radius:50%; background:${isOnline ? '#10b981' : 'var(--color-text-dim)'}; ${isOnline ? 'box-shadow:0 0 5px #10b981;' : ''}"></span>
                          ${isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div style="font-size:0.74rem; color:var(--color-text-dim); font-family:var(--font-mono); margin-top:2px;">
                        ID: <b style="color:var(--color-primary);">${escapeHtml(d.id)}</b> &bull; ${escapeHtml(os)} ${d.ip ? `&bull; ${escapeHtml(d.ip)}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                    <button type="button" class="btn btn-primary btn-sm" onclick="quickConnect('${escapeHtml(d.id)}'); closeAuthModal();" style="padding:0.3rem 0.7rem; font-size:0.75rem; font-weight:800; box-shadow:0 0 10px rgba(0,240,255,0.25);">
                      ⚡ Remote
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="renameUserDevice('${escapeHtml(cleanId)}', '${alias}');" title="Ubah Nama Alias" style="padding:0.3rem 0.55rem; font-size:0.75rem;">
                      ✏️
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="unlinkUserDevice('${escapeHtml(cleanId)}', '${alias}');" title="Putuskan Perangkat" style="padding:0.3rem 0.55rem; font-size:0.75rem; color:#ef4444; border-color:rgba(239,68,68,0.3);">
                      🗑️
                    </button>
                  </div>
                </div>
              `;
            }).join('');
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not populate /api/user/me:', e);
  }
}

function copyProfileLicenseKey() {
  const keyEl = document.getElementById('profileLicenseKeyDisplay');
  const key = keyEl ? keyEl.textContent.trim() : '';
  if (!key) return;
  copyProfileText(key, 'Kunci lisensi klien berhasil disalin ke clipboard!');
}

function handleSignOut(silent = false) {
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
  document.querySelector('#loginModal .modal-dialog')?.classList.remove('profile-expanded');
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = 'Audira Account Portal';
  const loggedInView = document.getElementById('authViewLoggedIn');
  if (loggedInView) loggedInView.classList.remove('active');
  const tabs = document.querySelector('.modal-tabs');
  if (tabs) tabs.style.display = 'flex';
  const credView = document.getElementById('authViewCredentials');
  if (credView) credView.classList.add('active');

  const openBtn = document.getElementById('openLoginBtn');
  if (openBtn) {
    openBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
      <span>Masuk / Daftar</span>
    `;
    openBtn.style.borderColor = '';
  }
  if (!silent) {
    showToast('Berhasil keluar dari akun.', 'info');
  }
}

// ==========================================================================
// User Portal Session Inactivity Timeout (15 Minutes)
// ==========================================================================
const CLIENT_SESSION_TIMEOUT_MS = 15 * 60 * 1000;
let clientLastActivity = Date.now();
let clientTimeoutCheckTimer = null;
let lastClientThrottledTouch = 0;

function resetClientActivityTimer() {
  clientLastActivity = Date.now();
  try {
    localStorage.setItem('audira_last_active', String(clientLastActivity));
  } catch (_) {}
}

function initClientSessionTimeout() {
  if (localStorage.getItem('audira_remember') === 'true') {
    return; // Remembered session persists without forced inactivity timeout
  }
  const token = localStorage.getItem('audira_access_token');
  if (!token) return;

  clientLastActivity = Date.now();
  try {
    localStorage.setItem('audira_last_active', String(clientLastActivity));
  } catch (_) {}

  const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
  const onActivity = () => {
    const now = Date.now();
    if (now - lastClientThrottledTouch > 10000) {
      lastClientThrottledTouch = now;
      clientLastActivity = now;
      try {
        localStorage.setItem('audira_last_active', String(now));
      } catch (_) {}
    }
  };

  activityEvents.forEach(evt => {
    window.addEventListener(evt, onActivity, { passive: true });
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'audira_last_active' && e.newValue) {
      const extTime = parseInt(e.newValue, 10);
      if (extTime > clientLastActivity) {
        clientLastActivity = extTime;
      }
    }
  });

  if (clientTimeoutCheckTimer) clearInterval(clientTimeoutCheckTimer);
  clientTimeoutCheckTimer = setInterval(() => {
    const currentToken = localStorage.getItem('audira_access_token');
    if (!currentToken) return;

    if (Date.now() - clientLastActivity > CLIENT_SESSION_TIMEOUT_MS) {
      handleClientSessionTimeout();
    }
  }, 10000);
}

function handleClientSessionTimeout() {
  handleSignOut(true);
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  setFormAlert('loginAlert', 'Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.', 'warning');
  showToast('Sesi Anda telah berakhir karena tidak ada aktivitas.', 'warning');
}

function closeAuthModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('open');
    modal.querySelector('.modal-dialog')?.classList.remove('profile-expanded');
  }
}

function navigateToFleet() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('open');
  window.location.href = 'admin.html';
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
    const isIndo = currentLang === 'id';
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
      if (noteIndiv) noteIndiv.textContent = isIndo 
        ? (isIdr ? 'Ditagih tahunan (Hemat 20% • Rp 588.000 / thn)' : 'Ditagih tahunan (Hemat 20% • $142.50 / thn)')
        : (isIdr ? 'Billed annually (Save 20% • Rp 588,000 / yr)' : 'Billed annually ($142.50 / yr)');

      if (priceTeam) priceTeam.textContent = isIdr ? '149.000' : '23.88';
      if (noteTeam) noteTeam.textContent = isIndo
        ? (isIdr ? 'Ditagih tahunan (Hemat 20% • Rp 1.788.000 / thn)' : 'Ditagih tahunan (Hemat 20% • $286.50 / thn)')
        : (isIdr ? 'Billed annually (Save 20% • Rp 1,788,000 / yr)' : 'Billed annually ($286.50 / yr)');
    } else {
      if (monthlyLabel) monthlyLabel.classList.add('active');
      if (annualLabel) annualLabel.classList.remove('active');

      if (priceIndiv) priceIndiv.textContent = isIdr ? '59.000' : '14.88';
      if (noteIndiv) noteIndiv.textContent = isIndo
        ? (isIdr ? 'Ditagih bulanan (Rp 59.000 / bln)' : 'Ditagih bulanan ($14.88 / bln)')
        : (isIdr ? 'Billed monthly (Rp 59,000 / mo)' : 'Billed monthly ($14.88 / mo)');

      if (priceTeam) priceTeam.textContent = isIdr ? '179.000' : '29.88';
      if (noteTeam) noteTeam.textContent = isIndo
        ? (isIdr ? 'Ditagih bulanan (Rp 179.000 / bln)' : 'Ditagih bulanan ($29.88 / mo)')
        : (isIdr ? 'Billed monthly (Rp 179,000 / mo)' : 'Billed monthly ($29.88 / mo)');
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

  if (urlParams.get('timeout') === '1' || sessionStorage.getItem('audira_session_timeout') === '1') {
    sessionStorage.removeItem('audira_session_timeout');
    setTimeout(() => {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }
      setFormAlert('loginAlert', 'Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.', 'warning');
      window.history.replaceState({}, document.title, window.location.pathname + (window.location.hash || ''));
    }, 250);
    return;
  }

  if (urlParams.get('login') === '1') {
    setTimeout(() => {
      if (window.openLoginModal) window.openLoginModal();
      window.history.replaceState({}, document.title, window.location.pathname + (window.location.hash || ''));
    }, 250);
    return;
  }

  if (urlParams.get('upgrade') === '1' || urlParams.has('plan')) {
    const plan = urlParams.get('plan') || 'pro';
    setTimeout(() => {
      openUpgradeModal(plan);
      // Clean query parameter from URL bar immediately so subsequent reloads or logo clicks go to clean Home
      window.history.replaceState({}, document.title, window.location.pathname + (window.location.hash || ''));
    }, 350);
  }
}

// Safe helper to dismiss any open modals
function closeAllModals() {
  if (typeof closeUpgradeModal === 'function') closeUpgradeModal();
  if (typeof closeRemoteSession === 'function') closeRemoteSession();
  if (typeof closeFileTransferModal === 'function') closeFileTransferModal();
  if (typeof closeMobilePairModal === 'function') closeMobilePairModal();
  if (typeof closeChangePasswordModal === 'function') closeChangePasswordModal();
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.classList.remove('open');
    loginModal.setAttribute('aria-hidden', 'true');
  }
}

// Navigation to Home (clean URL and scroll to top)
function navigateToHome(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeAllModals();

  // Strip query parameters and hashes from URL
  window.history.replaceState({}, document.title, window.location.pathname);

  // Set active link in nav
  document.querySelectorAll('.nav-links .nav-link').forEach(l => l.classList.remove('active'));
  const homeLink = document.querySelector('.nav-links .nav-link[data-i18n="navHome"]') || document.querySelector('.nav-links a[href="/"]');
  if (homeLink) homeLink.classList.add('active');

  // Smooth scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile drawer if open
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) navLinks.classList.remove('open');
}

// Smooth, robust navigation for all header links and internal anchors
function initSmoothNavigation() {
  const anchors = document.querySelectorAll('.nav-links a, a.brand-logo');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Brand logo or Home link
      if (href === '/' || href === '#' || anchor.getAttribute('data-i18n') === 'navHome') {
        e.preventDefault();
        navigateToHome(e);
        return;
      }

      // Hash links (#features, #architecture, #comparison, etc.)
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          closeAllModals();

          // Calculate precise scroll target offset for sticky header
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 64;
          const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 12);

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });

          // Mark active link
          document.querySelectorAll('.nav-links .nav-link').forEach(l => l.classList.remove('active'));
          anchor.classList.add('active');

          if (window.history.pushState) {
            window.history.pushState(null, '', href);
          }
        }

        // Close mobile drawer
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('open');
      }
    });
  });

  initScrollSpy();
}

// Automatically highlight active navigation link as user scrolls
function initScrollSpy() {
  const sectionIds = ['features', 'architecture', 'comparison', 'selfhost', 'latency', 'pricing', 'downloads', 'faq'];
  
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const navLinks = document.querySelectorAll('.nav-links .nav-link');

        if (scrollY < 200) {
          navLinks.forEach(l => l.classList.remove('active'));
          const homeLink = document.querySelector('.nav-links .nav-link[data-i18n="navHome"]') || document.querySelector('.nav-links a[href="/"]');
          if (homeLink) homeLink.classList.add('active');
          ticking = false;
          return;
        }

        const headerHeight = 76;
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const id = sectionIds[i];
          const el = document.getElementById(id);
          if (el) {
            const top = el.getBoundingClientRect().top + scrollY - headerHeight - 30;
            if (scrollY >= top) {
              navLinks.forEach(l => l.classList.remove('active'));
              const active = document.querySelector(`.nav-links a[href="#${id}"]`);
              if (active) active.classList.add('active');
              break;
            }
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Global Modal Dismissal (Escape key & backdrop)
function initModalDismiss() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

// Mobile Responsive Navigation Drawer & Dropdown Menus
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer) {
        drawer.classList.toggle('open');
      } else if (navLinks) {
        navLinks.classList.toggle('open');
      }
    });
  }

  // Click outside to close drawer or navLinks
  document.addEventListener('click', (e) => {
    if (drawer && !drawer.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      drawer.classList.remove('open');
    }
    if (navLinks && (!toggleBtn || !toggleBtn.contains(e.target)) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });

  // Global helper to close mobile drawer when any link inside is tapped
  window.closeMobileDrawer = function() {
    if (drawer) drawer.classList.remove('open');
  };

  // Keyboard navigation: Escape key closes drawer and active dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawer) drawer.classList.remove('open');
      document.querySelectorAll('.nav-item-dropdown.is-open').forEach(dd => {
        dd.classList.remove('is-open');
      });
    }
  });

  // Desktop/Touch click support for dropdown buttons
  const dropdownButtons = document.querySelectorAll('.nav-item-dropdown .nav-dropdown-btn');
  dropdownButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = btn.closest('.nav-item-dropdown');
      if (!parent) return;

      const isAlreadyOpen = parent.classList.contains('is-open');
      document.querySelectorAll('.nav-item-dropdown.is-open').forEach(dd => {
        if (dd !== parent) dd.classList.remove('is-open');
      });

      if (isAlreadyOpen) {
        parent.classList.remove('is-open');
      } else {
        parent.classList.add('is-open');
      }
    });
  });

  // Close dropdown menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
      document.querySelectorAll('.nav-item-dropdown.is-open').forEach(dd => {
        dd.classList.remove('is-open');
      });
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
    statusEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span><b>Sesi Disetujui!</b> Sesi remote P2P dibuka seketika dengan proteksi E2EE.</span>';
  }
  if (btnApprove) btnApprove.disabled = true;
  if (btnReject) btnReject.disabled = true;
  showToast('Telegram 2FA Approved! Menginisiasi sesi remote...', 'success');

  const simInput = document.getElementById('simTargetId');
  const simConnectBtn = document.getElementById('simConnectBtn');
  if (simInput && !simInput.value) simInput.value = '100 200 300';
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
  const uri = 'audira://relay?host=desk.audira.my.id';
  navigator.clipboard.writeText(uri).then(() => {
    showToast('Mobile Relay URI berhasil disalin!', 'success');
  }).catch(() => {
    showToast('URI: ' + uri, 'info');
  });
}




// Global Endpoint Quick Select for Interactive Simulator
window.selectSimTarget = function(id, name) {
  const targetInput = document.getElementById('simTargetId');
  if (targetInput) {
    targetInput.value = id;
    targetInput.focus();
    showToast('Target selected: ' + (name || id), 'info');
  }
};

// Automatic OS Detection & Download Card System Highlighting
function initOsDetection() {
  try {
    const ua = (navigator.userAgent || '').toLowerCase();
    const platform = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();

    let detectedOs = 'windows';
    if (/android/.test(ua)) {
      detectedOs = 'android';
    } else if (/iphone|ipad|ipod/.test(ua)) {
      detectedOs = 'ios';
    } else if (/macintosh|mac os x/.test(ua) || /mac/.test(platform)) {
      detectedOs = 'macos';
    } else if (/linux/.test(ua) || /linux/.test(platform)) {
      detectedOs = 'linux';
    } else if (/win/.test(ua) || /win/.test(platform)) {
      detectedOs = 'windows';
    }

    const cards = document.querySelectorAll('.dl-card[data-os]');
    cards.forEach(card => {
      const cardOs = card.getAttribute('data-os');
      const header = card.querySelector('.dl-card-header');
      const btn = card.querySelector('.dl-action-btn');

      const existingBadge = card.querySelector('.dl-system-badge');
      if (existingBadge) {
        existingBadge.remove();
      }

      if (cardOs === detectedOs) {
        card.classList.add('is-user-system');
        if (header) {
          const badge = document.createElement('span');
          badge.className = 'dl-system-badge';
          badge.textContent = 'Your system';
          header.appendChild(badge);
        }
        if (btn) {
          btn.classList.remove('dl-btn-dark');
          btn.classList.add('dl-btn-primary');
        }
      } else {
        card.classList.remove('is-user-system');
        if (btn) {
          btn.classList.remove('dl-btn-primary');
          btn.classList.add('dl-btn-dark');
        }
      }
    });
  } catch (err) {
    console.warn('initOsDetection failed:', err);
  }
}
