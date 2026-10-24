/**
 * AUDIRA REMOTE DESKTOP — High-Performance 3D P2P Holographic Engine
 * Architecture: Three.js WebGL, 60 FPS Hardware Render, Zero External CDN Dependency
 * Features:
 *   - Interactive 3D Cyber P2P Globe with real lat/long infrastructure nodes
 *   - Animated P2P Bézier data arcs with real-time traveling packets (AV1/VP9 video & Opus audio)
 *   - Rotating Libsodium X25519 E2EE Cryptographic Core
 *   - Mouse Parallax & Touch Drag Orbit with realistic inertia damping
 *   - IntersectionObserver GPU throttle (0% GPU usage when scrolled out of view)
 *   - Dynamic theme integration (OLED Dark & Swiss Monochrome)
 */

(function () {
  'use strict';

  // Ensure Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('[Audira 3D] Three.js not found. 3D initialization deferred.');
    return;
  }

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    console.warn('[Audira 3D] WebGL not supported on this browser/GPU.');
    return;
  }

  // Global Nodes coordinates [lat, lon, name, type]
  const NETWORK_NODES = [
    { lat: -6.2088, lon: 106.8456, name: 'Jakarta (Core Hub)', type: 'core' },
    { lat: 1.3521, lon: 103.8198, name: 'Singapore (Gateway)', type: 'relay' },
    { lat: 35.6762, lon: 139.6503, name: 'Tokyo (Edge Node)', type: 'edge' },
    { lat: 50.1109, lon: 8.6821, name: 'Frankfurt (EU Cluster)', type: 'relay' },
    { lat: 51.5074, lon: -0.1278, name: 'London (UK Relay)', type: 'relay' },
    { lat: 37.7749, lon: -122.4194, name: 'San Francisco (US-West)', type: 'core' },
    { lat: 40.7128, lon: -74.0060, name: 'New York (US-East)', type: 'relay' },
    { lat: -33.8688, lon: 151.2093, name: 'Sydney (Oceania Edge)', type: 'edge' },
    { lat: 52.5200, lon: 13.4050, name: 'Berlin (Telemetry)', type: 'edge' },
    { lat: 22.3193, lon: 114.1694, name: 'Hong Kong (Edge Node)', type: 'edge' },
    { lat: 25.2048, lon: 55.2708, name: 'Dubai (ME Gateway)', type: 'relay' },
    { lat: -23.5505, lon: -46.6333, name: 'São Paulo (SA Node)', type: 'edge' }
  ];

  // P2P Active Tunnel Pairs (Source Index -> Target Index)
  const ACTIVE_TUNNELS = [
    { from: 0, to: 1, label: 'JKT-SIN P2P Direct', color: 0x10b981 },
    { from: 0, to: 3, label: 'JKT-FRA Fallback hbbr', color: 0x38bdf8 },
    { from: 1, to: 2, label: 'SIN-TYO AV1 60FPS', color: 0x10b981 },
    { from: 3, to: 4, label: 'FRA-LDN Low-RTT', color: 0x10b981 },
    { from: 5, to: 6, label: 'SFO-NYC Direct P2P', color: 0x10b981 },
    { from: 5, to: 2, label: 'SFO-TYO Pacific Link', color: 0x38bdf8 },
    { from: 0, to: 5, label: 'JKT-SFO X25519 E2EE', color: 0x06b6d4 },
    { from: 3, to: 10, label: 'FRA-DXB Relay', color: 0x10b981 },
    { from: 1, to: 7, label: 'SIN-SYD UDP Stream', color: 0x38bdf8 }
  ];

  const GLOBE_RADIUS = 135;

  class AudiraHero3D {
    constructor(containerElement) {
      this.container = containerElement;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.globeGroup = null;
      this.coreMesh = null;
      this.particles = [];
      this.arcPackets = [];

      this.isInteracting = false;
      this.pointerX = 0;
      this.pointerY = 0;
      this.targetRotationX = 0.2;
      this.targetRotationY = 0.6;
      this.currentRotationX = 0.2;
      this.currentRotationY = 0.6;
      this.touchStartX = 0;
      this.touchStartY = 0;

      this.isRendering = true;
      this.currentMode = 'globe'; // 'globe' or 'core'

      this.init();
    }

    init() {
      // 1. Create Scene
      this.scene = new THREE.Scene();

      // 2. Camera Setup
      this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 2000);
      this.camera.position.z = 390;

      // 3. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setClearColor(0x000000, 0);

      this.canvas = this.renderer.domElement;
      this.canvas.className = 'audira-3d-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'auto';
      this.canvas.style.cursor = 'grab';
      this.canvas.style.zIndex = '1';

      this.container.appendChild(this.canvas);

      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);

      const cyanPoint = new THREE.PointLight(0x38bdf8, 2.5, 800);
      cyanPoint.position.set(220, 220, 250);
      this.scene.add(cyanPoint);

      const emeraldPoint = new THREE.PointLight(0x10b981, 2.5, 800);
      emeraldPoint.position.set(-220, -180, 250);
      this.scene.add(emeraldPoint);

      // 5. Globe Group
      this.globeGroup = new THREE.Group();
      this.scene.add(this.globeGroup);

      // Build 3D Elements
      this.buildGlobeDots();
      this.buildGlobeWireframe();
      this.buildNodesAndArcs();
      this.buildCryptoCore();
      this.buildOrbitalHalo();

      // 6. UI HUD Overlay
      this.createHudOverlay();

      // 7. Event Listeners
      this.setupEvents();

      // 8. Start Render Loop
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    latLongToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }

    buildGlobeDots() {
      // Golden Spiral / Fibonacci sphere distribution for uniform digital dot grid
      const count = 1100;
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      const colorCyan = new THREE.Color(0x38bdf8);
      const colorEmerald = new THREE.Color(0x10b981);
      const colorMuted = new THREE.Color(0x1e293b);

      const offset = 2 / count;
      const increment = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < count; i++) {
        const y = i * offset - 1 + offset / 2;
        const r = Math.sqrt(1 - y * y);
        const phi = i * increment;

        const x = Math.cos(phi) * r;
        const z = Math.sin(phi) * r;

        positions.push(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);

        // Continental density / visual sparkle variation
        const rand = Math.random();
        let pointColor;
        if (rand > 0.82) {
          pointColor = colorEmerald;
        } else if (rand > 0.65) {
          pointColor = colorCyan;
        } else {
          pointColor = colorMuted;
        }

        colors.push(pointColor.r, pointColor.g, pointColor.b);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      // Circular particle texture created procedurally via HTML5 Canvas
      const dotTexture = this.createDotTexture();

      const material = new THREE.PointsMaterial({
        size: 3.4,
        vertexColors: true,
        map: dotTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const dotMesh = new THREE.Points(geometry, material);
      this.globeGroup.add(dotMesh);
    }

    createDotTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.85)');
      grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    }

    buildGlobeWireframe() {
      // Internal atmosphere core glow sphere
      const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 28, 28);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x0c1524,
        transparent: true,
        opacity: 0.45,
        wireframe: false
      });
      const innerSphere = new THREE.Mesh(innerGeo, innerMat);
      this.globeGroup.add(innerSphere);

      // Lat/Long Rings
      const ringsGroup = new THREE.Group();
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.28
      });

      // Equator & Tropic Latitude lines
      [-40, -20, 0, 20, 40].forEach((lat) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const radius = GLOBE_RADIUS * Math.sin(phi);
        const y = GLOBE_RADIUS * Math.cos(phi);

        const circleGeo = new THREE.BufferGeometry();
        const points = [];
        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius));
        }
        circleGeo.setFromPoints(points);
        const line = new THREE.Line(circleGeo, ringMat);
        ringsGroup.add(line);
      });

      this.globeGroup.add(ringsGroup);
    }

    buildNodesAndArcs() {
      const nodeVectors = [];

      // 1. Create Node Markers
      NETWORK_NODES.forEach((node) => {
        const vec = this.latLongToVector3(node.lat, node.lon, GLOBE_RADIUS);
        nodeVectors.push(vec);

        // Center beacon
        const isCore = node.type === 'core';
        const beaconGeo = new THREE.SphereGeometry(isCore ? 3.0 : 2.0, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: isCore ? 0x10b981 : 0x38bdf8
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.copy(vec);
        this.globeGroup.add(beacon);

        // Pulsing radar ring
        const ringGeo = new THREE.RingGeometry(isCore ? 3.8 : 2.8, isCore ? 4.8 : 3.6, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isCore ? 0x10b981 : 0x06b6d4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(vec);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        this.globeGroup.add(ring);
      });

      // 2. Create 3D Bézier Arcs & Packet Data Streams
      ACTIVE_TUNNELS.forEach((tunnel) => {
        const vStart = nodeVectors[tunnel.from];
        const vEnd = nodeVectors[tunnel.to];

        if (!vStart || !vEnd) return;

        // Quadratic Bézier curve extending outwards proportional to distance
        const distance = vStart.distanceTo(vEnd);
        const mid = vStart.clone().lerp(vEnd, 0.5);
        const midLength = mid.length();
        mid.normalize();
        mid.multiplyScalar(midLength + distance * 0.28); // Height of arc

        const curve = new THREE.QuadraticBezierCurve3(vStart, mid, vEnd);
        const points = curve.getPoints(48);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

        const arcMat = new THREE.LineBasicMaterial({
          color: tunnel.color,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending
        });

        const arcLine = new THREE.Line(arcGeo, arcMat);
        this.globeGroup.add(arcLine);

        // Add 2 animated packet particles per arc
        for (let i = 0; i < 2; i++) {
          const packetGeo = new THREE.SphereGeometry(1.6, 8, 8);
          const packetMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95
          });
          const packetMesh = new THREE.Mesh(packetGeo, packetMat);
          this.globeGroup.add(packetMesh);

          this.arcPackets.push({
            mesh: packetMesh,
            curve: curve,
            progress: i * 0.5,
            speed: 0.0035 + Math.random() * 0.0035
          });
        }
      });
    }

    buildCryptoCore() {
      // Central Holographic Cryptographic Core (Libsodium X25519)
      const coreGroup = new THREE.Group();

      const icosaGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 0.42, 1);
      const icosaMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      this.coreMesh = new THREE.Mesh(icosaGeo, icosaMat);
      coreGroup.add(this.coreMesh);

      // Inner Dodecahedron (Cyan)
      const dodecaGeo = new THREE.DodecahedronGeometry(GLOBE_RADIUS * 0.28, 0);
      const dodecaMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      this.innerCoreMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
      coreGroup.add(this.innerCoreMesh);

      this.globeGroup.add(coreGroup);
    }

    buildOrbitalHalo() {
      // Surrounding orbital dust particles (Opus audio packets & AV1 keyframes)
      const particleCount = 200;
      const haloGeo = new THREE.BufferGeometry();
      const pos = [];
      const col = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = GLOBE_RADIUS * 1.25 + Math.random() * 35;
        const ySpread = (Math.random() - 0.5) * 45;

        pos.push(Math.cos(angle) * radius, ySpread, Math.sin(angle) * radius);

        if (Math.random() > 0.5) {
          col.push(0.06, 0.72, 0.5); // Emerald
        } else {
          col.push(0.22, 0.74, 0.97); // Cyan
        }
      }

      haloGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      haloGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));

      const haloMat = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });

      this.haloMesh = new THREE.Points(haloGeo, haloMat);
      this.haloMesh.rotation.x = Math.PI / 6;
      this.globeGroup.add(this.haloMesh);
    }

    createHudOverlay() {
      const hud = document.createElement('div');
      hud.className = 'audira-3d-hud';
      hud.innerHTML = `
        <div class="hud-inner">
          <div class="hud-status">
            <span class="hud-pulse"></span>
            <span class="hud-label">P2P 3D MESH &bull; ACTIVE (60 FPS)</span>
          </div>
          <div class="hud-tools">
            <button type="button" id="btn3dReset" class="hud-btn" title="Reset 3D View">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span>Align</span>
            </button>
            <button type="button" id="btn3dToggleMode" class="hud-btn" title="Switch View Mode">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span id="hudModeLabel">Globe View</span>
            </button>
          </div>
        </div>
      `;

      this.container.appendChild(hud);

      // Event listeners for HUD
      const btnReset = hud.querySelector('#btn3dReset');
      if (btnReset) {
        btnReset.addEventListener('click', (e) => {
          e.stopPropagation();
          this.targetRotationX = 0.2;
          this.targetRotationY = 0.6;
        });
      }

      const btnToggle = hud.querySelector('#btn3dToggleMode');
      if (btnToggle) {
        btnToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMode();
        });
      }
    }

    toggleMode() {
      const label = document.getElementById('hudModeLabel');
      if (this.currentMode === 'globe') {
        this.currentMode = 'core';
        if (label) label.textContent = 'Crypto Core';
        // Zoom camera in to center on encryption core
        this.targetCameraZ = 240;
      } else {
        this.currentMode = 'globe';
        if (label) label.textContent = 'Globe View';
        this.targetCameraZ = 390;
      }
    }

    setupEvents() {
      // Mouse Parallax & Drag Orbit
      const el = this.canvas;

      el.addEventListener('mousedown', (e) => {
        this.isInteracting = true;
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
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
          const deltaX = e.clientX - this.pointerX;
          const deltaY = e.clientY - this.pointerY;
          this.pointerX = e.clientX;
          this.pointerY = e.clientY;

          this.targetRotationY += deltaX * 0.006;
          this.targetRotationX += deltaY * 0.006;
        } else {
          // Subtle Hero Parallax tracking
          const rect = this.container.getBoundingClientRect();
          if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
            const normalizedX = (e.clientX / window.innerWidth) - 0.5;
            const normalizedY = (e.clientY / window.innerHeight) - 0.5;
            this.targetRotationY += normalizedX * 0.0012;
            this.targetRotationX += normalizedY * 0.0012;
          }
        }
      });

      // Touch events for Mobile / Tablet
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isInteracting = true;
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.isInteracting && e.touches.length === 1) {
          const deltaX = e.touches[0].clientX - this.touchStartX;
          const deltaY = e.touches[0].clientY - this.touchStartY;
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;

          this.targetRotationY += deltaX * 0.008;
          this.targetRotationX += deltaY * 0.008;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isInteracting = false;
      });

      // Window Resize Listener
      window.addEventListener('resize', () => {
        this.onResize();
      });

      // GPU Saver: IntersectionObserver
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              this.isRendering = entry.isIntersecting;
            });
          },
          { threshold: 0.05 }
        );
        observer.observe(this.container);
      }
    }

    onResize() {
      if (!this.container || !this.renderer || !this.camera) return;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
      requestAnimationFrame(this.animate);

      if (!this.isRendering) return;

      // 1. Natural Auto-rotation when idle
      if (!this.isInteracting) {
        this.targetRotationY += 0.0018; // smooth orbit spin
      }

      // 2. Smooth Inertial Damping
      this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
      this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

      // Clamp X rotation to avoid flipping upside down
      this.currentRotationX = Math.max(-1.1, Math.min(1.1, this.currentRotationX));

      if (this.globeGroup) {
        this.globeGroup.rotation.x = this.currentRotationX;
        this.globeGroup.rotation.y = this.currentRotationY;
      }

      // 3. Smooth Camera Zoom transition for Mode Switching
      if (this.targetCameraZ) {
        this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.06;
      }

      // 4. Rotate Inner Cryptographic Core
      if (this.coreMesh) {
        this.coreMesh.rotation.x -= 0.008;
        this.coreMesh.rotation.y += 0.012;
      }
      if (this.innerCoreMesh) {
        this.innerCoreMesh.rotation.x += 0.014;
        this.innerCoreMesh.rotation.z -= 0.010;
      }

      // 5. Rotate Halo Ring
      if (this.haloMesh) {
        this.haloMesh.rotation.y -= 0.002;
      }

      // 6. Advance Packet Particles along Bézier Arcs
      for (let i = 0; i < this.arcPackets.length; i++) {
        const item = this.arcPackets[i];
        item.progress += item.speed;
        if (item.progress > 1) {
          item.progress = 0;
        }
        const point = item.curve.getPoint(item.progress);
        item.mesh.position.copy(point);

        // Flash packet brighter when at the apex of the arc
        const apexFactor = Math.sin(item.progress * Math.PI);
        const scale = 1.0 + apexFactor * 0.8;
        item.mesh.scale.set(scale, scale, scale);
      }

      // 7. Render
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 3D Card Interactive Tilt for Simulator Cockpit
  function setupSimulatorTilt() {
    const simCard = document.getElementById('telemetry');
    if (!simCard) return;

    simCard.addEventListener('mousemove', (e) => {
      const rect = simCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 3.5;

      simCard.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    });

    simCard.addEventListener('mouseleave', () => {
      simCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  // Initialize on DOM Ready
  function bootstrap() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      // Create dedicated 3D canvas wrapper
      const canvasContainer = document.createElement('div');
      canvasContainer.id = 'audira-hero-3d';
      canvasContainer.className = 'audira-hero-3d-wrapper';

      // Insert at the very beginning of hero-section so it sits gracefully behind content
      heroSection.insertBefore(canvasContainer, heroSection.firstChild);

      // Initialize 3D Scene
      window.audiraHero3D = new AudiraHero3D(canvasContainer);
    }

    // Initialize 3D perspective tilt on telemetry card
    setupSimulatorTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
