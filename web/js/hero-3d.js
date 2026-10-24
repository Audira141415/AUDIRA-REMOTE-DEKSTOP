/**
 * AUDIRA REMOTE DESKTOP — Interactive 3D Remote Workstation & Laptop Connection
 * Concept: 3D Local Operator Laptop connecting to Remote Studio Workstation via P2P High-Speed Data Tunnel
 * Real-time 3D PBR hardware rendering, glowing screens, animated video streams & mouse parallax
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[Audira 3D] Three.js not loaded.');
    return;
  }

  function isWebGLAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) return;

  class AudiraRemoteWorkstation3D {
    constructor(container) {
      this.container = container;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;

      this.scene = null;
      this.camera = null;
      this.renderer = null;

      this.mainGroup = null;
      this.laptopGroup = null;
      this.monitorGroup = null;
      this.connectionGroup = null;
      this.dataPackets = [];

      this.isInteracting = false;
      this.prevX = 0;
      this.prevY = 0;
      this.rotX = 0.22;
      this.rotY = -0.35;
      this.targetRotX = 0.22;
      this.targetRotY = -0.35;
      this.camDist = 260;
      this.targetCamDist = 260;

      this.isRendering = true;
      this.clock = new THREE.Clock();

      this.init();
    }

    init() {
      // 1. Scene
      this.scene = new THREE.Scene();

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 1, 2000);
      this.updateCamera();

      // 3. Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;

      this.canvas = this.renderer.domElement;
      this.canvas.className = 'audira-3d-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '1';
      this.canvas.style.cursor = 'grab';

      this.container.appendChild(this.canvas);

      // 4. Lighting: Ambient + Key + Rim Neon Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      this.scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(120, 180, 200);
      this.scene.add(keyLight);

      const cyanRim = new THREE.PointLight(0x38bdf8, 2.8, 600);
      cyanRim.position.set(-180, 80, 150);
      this.scene.add(cyanRim);

      const emeraldRim = new THREE.PointLight(0x10b981, 2.8, 600);
      emeraldRim.position.set(180, 120, -100);
      this.scene.add(emeraldRim);

      // 5. Main World Group
      this.mainGroup = new THREE.Group();
      this.scene.add(this.mainGroup);

      // 6. Build 3D Floating Desk Floor Grid
      this.buildFloorGrid();

      // 7. Build Device 1: Client Laptop (Left)
      this.buildLaptop();

      // 8. Build Device 2: Remote Workstation Display (Right)
      this.buildRemoteWorkstation();

      // 9. Build 3D P2P Connection Tunnel & Flowing Data Packets
      this.buildConnectionTunnel();

      // 10. HUD Control Bar
      this.buildHudOverlay();

      // 11. Event Listeners
      this.setupEvents();

      // 12. Render Loop
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    buildFloorGrid() {
      // Subtle cyber grid plane under the floating computers
      const grid = new THREE.GridHelper(320, 24, 0x38bdf8, 0x1e293b);
      grid.position.y = -42;
      grid.material.opacity = 0.25;
      grid.material.transparent = true;
      this.mainGroup.add(grid);
    }

    // -------------------------------------------------------------
    // Device 1: Sleek 3D Laptop (Local Operator Station)
    // -------------------------------------------------------------
    buildLaptop() {
      this.laptopGroup = new THREE.Group();
      this.laptopGroup.position.set(-78, -12, 10);
      this.laptopGroup.rotation.y = 0.35; // angled toward center

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1c2433,
        metalness: 0.85,
        roughness: 0.25
      });

      // 1. Laptop Base Body
      const baseGeo = new THREE.BoxGeometry(72, 3.2, 50);
      const baseMesh = new THREE.Mesh(baseGeo, metalMat);
      baseMesh.position.y = -1.6;
      this.laptopGroup.add(baseMesh);

      // 2. Keyboard Well & Trackpad
      const kbTex = this.generateKeyboardTexture();
      const kbGeo = new THREE.PlaneGeometry(64, 42);
      const kbMat = new THREE.MeshStandardMaterial({
        map: kbTex,
        roughness: 0.4,
        metalness: 0.5
      });
      const kbMesh = new THREE.Mesh(kbGeo, kbMat);
      kbMesh.rotation.x = -Math.PI / 2;
      kbMesh.position.set(0, 0.1, -1);
      this.laptopGroup.add(kbMesh);

      // 3. Laptop Lid (Hinged at back, open at 105 degrees)
      const lidHinge = new THREE.Group();
      lidHinge.position.set(0, 0, -25);
      lidHinge.rotation.x = -Math.PI / 2 + 0.25; // 105 deg open

      const lidGeo = new THREE.BoxGeometry(72, 48, 2.2);
      const lidMesh = new THREE.Mesh(lidGeo, metalMat);
      lidMesh.position.set(0, 24, -1.1);
      lidHinge.add(lidMesh);

      // 4. Laptop Screen (Audira Client Operator Console)
      const screenTex = this.generateClientScreenTexture();
      const screenGeo = new THREE.PlaneGeometry(66, 42);
      const screenMat = new THREE.MeshBasicMaterial({
        map: screenTex
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 24, 0.1);
      lidHinge.add(screenMesh);

      // Screen glow light onto keyboard
      const screenLight = new THREE.PointLight(0x38bdf8, 1.2, 70);
      screenLight.position.set(0, 24, 8);
      lidHinge.add(screenLight);

      this.laptopGroup.add(lidHinge);
      this.mainGroup.add(this.laptopGroup);

      // Label below laptop
      this.addDeviceBadge(this.laptopGroup, 'LOCAL OPERATOR (CLIENT)', 0x38bdf8);
    }

    generateKeyboardTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 340;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 512, 340);

      // Keyboard bed
      ctx.fillStyle = '#121722';
      ctx.fillRect(20, 20, 472, 190);

      // Draw keyboard keys with backlit glow
      ctx.fillStyle = '#1a2233';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;

      const rows = 5;
      const cols = 14;
      const kw = 29;
      const kh = 30;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const kx = 28 + c * 33;
          const ky = 28 + r * 34;
          ctx.fillRect(kx, ky, kw, kh);
          ctx.strokeRect(kx, ky, kw, kh);
        }
      }

      // Spacebar
      ctx.fillStyle = '#222d42';
      ctx.fillRect(160, 164, 180, 32);
      ctx.strokeRect(160, 164, 180, 32);

      // Glass Trackpad
      ctx.fillStyle = '#10141d';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(170, 230, 172, 95);
      ctx.strokeRect(170, 230, 172, 95);

      return new THREE.CanvasTexture(canvas);
    }

    generateClientScreenTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // Desktop wallpaper: dark OLED cyber gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 400);
      grad.addColorStop(0, '#060911');
      grad.addColorStop(0.5, '#0b1322');
      grad.addColorStop(1, '#080d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 400);

      // Audira Desk Titlebar
      ctx.fillStyle = '#121826';
      ctx.fillRect(0, 0, 640, 42);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('AUDIRA DESK v1.5.3 — OPERATOR CONSOLE', 48, 26);

      // Status pill
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(28, 21, 6, 0, Math.PI * 2);
      ctx.fill();

      // Remote Screen Mirror Viewport Inside Operator Console
      ctx.fillStyle = '#05070c';
      ctx.fillRect(40, 65, 560, 260);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 65, 560, 260);

      // Content inside remote session mirror
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('> CONNECTED: Studio-Workstation-Pro', 70, 115);

      ctx.fillStyle = '#10b981';
      ctx.font = '16px monospace';
      ctx.fillText('RTT Latency: 9ms  |  Framerate: 60.0 FPS', 70, 155);
      ctx.fillText('Codec: Hardware AV1 DXGI Direct UDP', 70, 185);
      ctx.fillText('Encryption: Libsodium X25519-ChaCha20', 70, 215);

      // Bottom taskbar
      ctx.fillStyle = '#0f1420';
      ctx.fillRect(0, 358, 640, 42);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('SESSION ID: 832 941 002  •  OPERATOR: ACTIVE', 20, 384);

      return new THREE.CanvasTexture(canvas);
    }

    // -------------------------------------------------------------
    // Device 2: Ultrawide Remote Studio Monitor (Host Target)
    // -------------------------------------------------------------
    buildRemoteWorkstation() {
      this.monitorGroup = new THREE.Group();
      this.monitorGroup.position.set(78, 6, -10);
      this.monitorGroup.rotation.y = -0.35; // angled toward center

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1e2738,
        metalness: 0.9,
        roughness: 0.2
      });

      // 1. Aluminum Stand Base
      const standBase = new THREE.Mesh(new THREE.BoxGeometry(40, 2.5, 30), metalMat);
      standBase.position.y = -22;
      this.monitorGroup.add(standBase);

      // Stand Neck
      const neck = new THREE.Mesh(new THREE.BoxGeometry(6, 45, 6), metalMat);
      neck.position.set(0, 0, -8);
      this.monitorGroup.add(neck);

      // 2. Frameless Ultrawide Display Enclosure
      const displayBody = new THREE.Mesh(new THREE.BoxGeometry(105, 62, 3.5), metalMat);
      displayBody.position.set(0, 16, 0);
      this.monitorGroup.add(displayBody);

      // 3. Remote Display Screen Texture (Windows 11 Remote Host)
      const remoteTex = this.generateRemoteScreenTexture();
      const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 57),
        new THREE.MeshBasicMaterial({ map: remoteTex })
      );
      screenMesh.position.set(0, 16, 1.8);
      this.monitorGroup.add(screenMesh);

      // Emissive glow from remote display
      const displayLight = new THREE.PointLight(0x10b981, 1.5, 90);
      displayLight.position.set(0, 16, 12);
      this.monitorGroup.add(displayLight);

      this.mainGroup.add(this.monitorGroup);

      // Label below monitor
      this.addDeviceBadge(this.monitorGroup, 'REMOTE HOST (TARGET PC)', 0x10b981);
    }

    generateRemoteScreenTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 460;
      const ctx = canvas.getContext('2d');

      // Windows 11 style dark abstract wallpaper
      const grad = ctx.createLinearGradient(0, 0, 800, 460);
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(0.5, '#0d2238');
      grad.addColorStop(1, '#05101f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 460);

      // Glowing wallpaper wave
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.bezierCurveTo(200, 180, 500, 420, 800, 240);
      ctx.stroke();

      // Open Windows App Window on Remote Desktop (e.g. Code Editor / 3D App)
      ctx.fillStyle = '#111827';
      ctx.fillRect(60, 45, 680, 350);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, 45, 680, 350);

      // Window Header
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(60, 45, 680, 36);

      // Window dots
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(84, 63, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath(); ctx.arc(102, 63, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(120, 63, 5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('REMOTE HOST SESSION [LIVE] — Windows 11 Pro', 145, 68);

      // Code / Operations inside Remote Window
      ctx.fillStyle = '#38bdf8';
      ctx.font = '14px monospace';
      ctx.fillText('1  // AUDIRA REMOTE WORKSTATION PRO', 90, 120);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('2  function executeRemoteStream() {', 90, 150);
      ctx.fillStyle = '#10b981';
      ctx.fillText('3    const stream = VideoCodec.AV1_NVENC.encode({ fps: 60 });', 90, 180);
      ctx.fillText('4    DirectUDP.holePunch("941 820 153", stream.packets);', 90, 210);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('5    return "Zero Intermediary Cloud Relays & Low Latency";', 90, 240);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('6  }', 90, 270);
      ctx.fillText('7  // End-to-End Encrypted via Libsodium X25519', 90, 300);

      // Remote Windows Taskbar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 415, 800, 45);

      // Windows Logo / Start icon
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(380, 425, 10, 10);
      ctx.fillRect(393, 425, 10, 10);
      ctx.fillRect(380, 438, 10, 10);
      ctx.fillRect(393, 438, 10, 10);

      return new THREE.CanvasTexture(canvas);
    }

    addDeviceBadge(parentGroup, text, colorHex) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 70;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(11, 17, 28, 0.9)';
      ctx.strokeStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(10, 8, 380, 54, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, 200, 42);

      const tex = new THREE.CanvasTexture(canvas);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(36, 6.3),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      );
      mesh.position.set(0, -32, 10);
      parentGroup.add(mesh);
    }

    // -------------------------------------------------------------
    // High-Speed P2P Data Tunnel between Both Devices
    // -------------------------------------------------------------
    buildConnectionTunnel() {
      this.connectionGroup = new THREE.Group();
      this.mainGroup.add(this.connectionGroup);

      // Curved Bézier path between Laptop Screen and Remote Monitor
      const p1 = new THREE.Vector3(-45, 10, 10); // Laptop screen position
      const mid = new THREE.Vector3(0, 42, 35);    // High arc
      const p2 = new THREE.Vector3(45, 20, 0);   // Remote screen position

      this.tunnelCurve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = this.tunnelCurve.getPoints(48);

      // Glowing Data Laser Beam
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      const beamLine = new THREE.Line(lineGeo, lineMat);
      this.connectionGroup.add(beamLine);

      // Traveling Video & Input Packets
      const packetCount = 10;
      for (let i = 0; i < packetCount; i++) {
        const isVideo = i % 2 === 0;
        const pGeo = new THREE.SphereGeometry(isVideo ? 1.6 : 1.2, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: isVideo ? 0x10b981 : 0x38bdf8,
          transparent: true,
          opacity: 0.95
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        this.connectionGroup.add(pMesh);

        this.dataPackets.push({
          mesh: pMesh,
          progress: i / packetCount,
          speed: 0.0075 + Math.random() * 0.004,
          direction: isVideo ? -1 : 1 // Video streams Remote -> Laptop; Input streams Laptop -> Remote
        });
      }

      // Central Floating 3D Telemetry Pill
      const pillCanvas = document.createElement('canvas');
      pillCanvas.width = 380;
      pillCanvas.height = 100;
      const pCtx = pillCanvas.getContext('2d');

      pCtx.fillStyle = 'rgba(8, 14, 26, 0.92)';
      pCtx.strokeStyle = '#10b981';
      pCtx.lineWidth = 3;
      pCtx.beginPath();
      pCtx.roundRect(8, 8, 364, 84, 16);
      pCtx.fill();
      pCtx.stroke();

      pCtx.fillStyle = '#10b981';
      pCtx.font = 'bold 20px monospace';
      pCtx.textAlign = 'center';
      pCtx.fillText('DIRECT P2P HOLE-PUNCH', 190, 42);

      pCtx.fillStyle = '#38bdf8';
      pCtx.font = '16px monospace';
      pCtx.fillText('60 FPS • 9ms • X25519 E2EE', 190, 72);

      const pillTex = new THREE.CanvasTexture(pillCanvas);
      const pillMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(36, 9.5),
        new THREE.MeshBasicMaterial({ map: pillTex, transparent: true })
      );
      pillMesh.position.set(0, 48, 30);
      this.connectionGroup.add(pillMesh);
    }

    // -------------------------------------------------------------
    // HUD Control Overlay
    // -------------------------------------------------------------
    buildHudOverlay() {
      const hud = document.createElement('div');
      hud.className = 'audira-workstation-hud';
      hud.innerHTML = `
        <div class="ws-hud-card">
          <div class="ws-header">
            <span class="ws-indicator"></span>
            <span class="ws-title">3D P2P WORKSTATION &bull; ACTIVE 60 FPS</span>
          </div>
          <div class="ws-controls">
            <button type="button" id="btnWsReset" class="ws-btn" title="Reset View">Align View</button>
            <button type="button" id="btnWsLaptop" class="ws-btn" title="Zoom to Laptop">Operator Cam</button>
            <button type="button" id="btnWsRemote" class="ws-btn" title="Zoom to Remote Host">Remote Cam</button>
          </div>
        </div>
      `;

      this.container.appendChild(hud);

      const btnReset = hud.querySelector('#btnWsReset');
      const btnLaptop = hud.querySelector('#btnWsLaptop');
      const btnRemote = hud.querySelector('#btnWsRemote');

      if (btnReset) {
        btnReset.addEventListener('click', (e) => {
          e.stopPropagation();
          this.targetRotX = 0.22;
          this.targetRotY = -0.35;
          this.targetCamDist = 260;
        });
      }

      if (btnLaptop) {
        btnLaptop.addEventListener('click', (e) => {
          e.stopPropagation();
          this.targetRotX = 0.28;
          this.targetRotY = 0.45;
          this.targetCamDist = 175;
        });
      }

      if (btnRemote) {
        btnRemote.addEventListener('click', (e) => {
          e.stopPropagation();
          this.targetRotX = 0.18;
          this.targetRotY = -0.55;
          this.targetCamDist = 185;
        });
      }
    }

    // -------------------------------------------------------------
    // Interaction & Events
    // -------------------------------------------------------------
    setupEvents() {
      const el = this.canvas;

      el.addEventListener('mousedown', (e) => {
        this.isInteracting = true;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        el.style.cursor = 'grabbing';
      });

      window.addEventListener('mouseup', () => {
        if (this.isInteracting) {
          this.isInteracting = false;
          el.style.cursor = 'grab';
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isInteracting) {
          const dx = e.clientX - this.prevX;
          const dy = e.clientY - this.prevY;
          this.prevX = e.clientX;
          this.prevY = e.clientY;

          this.targetRotY += dx * 0.006;
          this.targetRotX += dy * 0.006;
        } else {
          // Smooth mouse parallax
          const nx = (e.clientX / window.innerWidth) - 0.5;
          const ny = (e.clientY / window.innerHeight) - 0.5;
          this.targetRotY += nx * 0.0006;
          this.targetRotX += ny * 0.0006;
        }
      });

      // Touch for Mobile
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isInteracting = true;
          this.prevX = e.touches[0].clientX;
          this.prevY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.isInteracting && e.touches.length === 1) {
          const dx = e.touches[0].clientX - this.prevX;
          const dy = e.touches[0].clientY - this.prevY;
          this.prevX = e.touches[0].clientX;
          this.prevY = e.touches[0].clientY;

          this.targetRotY += dx * 0.008;
          this.targetRotX += dy * 0.008;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isInteracting = false;
      });

      // Zoom via Mouse Wheel
      el.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.targetCamDist += e.deltaY * 0.18;
        this.targetCamDist = Math.max(130, Math.min(420, this.targetCamDist));
      }, { passive: false });

      // Resize
      window.addEventListener('resize', () => {
        if (!this.container || !this.renderer || !this.camera) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      });

      // GPU Saver
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isRendering = entry.isIntersecting;
          });
        }, { threshold: 0.05 });
        obs.observe(this.container);
      }
    }

    updateCamera() {
      const x = this.camDist * Math.cos(this.rotX) * Math.sin(this.rotY);
      const y = this.camDist * Math.sin(this.rotX) + 12;
      const z = this.camDist * Math.cos(this.rotX) * Math.cos(this.rotY);

      this.camera.position.set(x, y, z);
      this.camera.lookAt(0, 8, 0);
    }

    animate() {
      requestAnimationFrame(this.animate);

      if (!this.isRendering) return;

      const elapsed = this.clock.getElapsedTime();

      // 1. Natural slow floating oscillation
      if (!this.isInteracting) {
        this.targetRotY += 0.0012; // slow majestic rotation
      }

      // Gentle floating bob
      if (this.mainGroup) {
        this.mainGroup.position.y = Math.sin(elapsed * 1.5) * 2.2;
      }

      // 2. Smooth Inertia Damping
      this.rotY += (this.targetRotY - this.rotY) * 0.06;
      this.rotX += (this.targetRotX - this.rotX) * 0.06;
      this.camDist += (this.targetCamDist - this.camDist) * 0.08;

      // Clamp vertical tilt
      this.rotX = Math.max(-0.6, Math.min(0.85, this.rotX));

      this.updateCamera();

      // 3. Move Data Packets along the Connection Tunnel
      for (let i = 0; i < this.dataPackets.length; i++) {
        const p = this.dataPackets[i];
        p.progress += p.speed * p.direction;

        if (p.progress > 1.0) p.progress = 0.0;
        if (p.progress < 0.0) p.progress = 1.0;

        const pos = this.tunnelCurve.getPoint(p.progress);
        p.mesh.position.copy(pos);

        // Flash scale at curve apex
        const scale = 1.0 + Math.sin(p.progress * Math.PI) * 0.6;
        p.mesh.scale.set(scale, scale, scale);
      }

      // 4. Render
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Bootstrap
  function bootstrap() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      const existing = document.getElementById('audira-hero-3d');
      if (existing) existing.remove();

      const canvasContainer = document.createElement('div');
      canvasContainer.id = 'audira-hero-3d';
      canvasContainer.className = 'audira-hero-3d-wrapper';

      heroSection.insertBefore(canvasContainer, heroSection.firstChild);

      window.audiraWorkstation3D = new AudiraRemoteWorkstation3D(canvasContainer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
