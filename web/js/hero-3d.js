/**
 * AUDIRA REMOTE DESKTOP — Orbital Space-to-Earth Quantum Telemetry Engine
 * Concept: Deep Space Satellite (LEO Orbit) linked to Earth Ground Station via Optical Laser Beam
 * Technologies: Three.js WebGL, Procedural Earth Map & Atmosphere Shader, Procedural Satellite Model
 * Features:
 *   - Photorealistic Earth with dark oceans, illuminated landmasses, glowing city lights
 *   - Dynamic cloud weather layer rotating independently above Earth
 *   - Atmospheric Fresnel rim glow (neon cyan/emerald horizon halo)
 *   - Highly detailed 3D Orbital Satellite with dual solar panels, parabolic dish, and blinking strobe LEDs
 *   - Continuous Space-to-Earth high-speed laser data link with animated photon pulses
 *   - Ground Station (Jakarta Base Station) with radiating radar waves and lock telemetry
 *   - Cinematic Starfield with twinkling distant stars and space dust
 *   - Interactive Camera: Orbit drag, mouse parallax, zoom, and preset camera angles
 *   - IntersectionObserver GPU saver (0% GPU usage when scrolled away)
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[Audira 3D] Three.js not found.');
    return;
  }

  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    console.warn('[Audira 3D] WebGL not supported.');
    return;
  }

  // Constants
  const EARTH_RADIUS = 120;
  const SATELLITE_ORBIT_ALTITUDE = 165; // Orbit radius = 285
  const SATELLITE_RADIUS = EARTH_RADIUS + SATELLITE_ORBIT_ALTITUDE;
  
  // Ground Station: Jakarta HQ (Latitude: -6.2088, Longitude: 106.8456)
  const GROUND_STATION = {
    name: 'AUDIRA Jakarta Base Ground Station',
    lat: -6.2088,
    lon: 106.8456,
    status: 'QUANTUM LASER LOCKED',
    rtt: '3.4 ms (LEO Downlink)',
    freq: 'Optical Laser 1550nm',
    uplink: 'Direct AV1 60FPS Stream'
  };

  class AudiraOrbitalEngine {
    constructor(container) {
      this.container = container;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;

      this.scene = null;
      this.camera = null;
      this.renderer = null;

      // Hierarchy groups
      this.universeGroup = null;
      this.earthGroup = null;
      this.earthMesh = null;
      this.cloudsMesh = null;
      this.atmosphereMesh = null;
      this.satelliteGroup = null;
      this.laserBeam = null;
      this.photonPackets = [];
      this.groundRings = [];
      this.strobeLeds = [];

      // Orbit state
      this.orbitAngle = 0.85;
      this.orbitSpeed = 0.0018;
      this.earthRotationSpeed = 0.0006;
      this.groundTargetPos = new THREE.Vector3();

      // Camera interaction
      this.isDragging = false;
      this.prevMouseX = 0;
      this.prevMouseY = 0;
      this.camRotY = 0.45;
      this.camRotX = 0.25;
      this.targetRotY = 0.45;
      this.targetRotX = 0.25;
      this.camDistance = 420;
      this.targetCamDistance = 420;
      this.viewMode = 'cinematic'; // 'cinematic' | 'satellite' | 'earth'

      this.isRendering = true;
      this.clock = new THREE.Clock();

      this.init();
    }

    init() {
      // 1. Scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x05070d, 0.0006);

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 3000);
      this.updateCameraPosition();

      // 3. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;

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

      // 4. Universe Group
      this.universeGroup = new THREE.Group();
      this.scene.add(this.universeGroup);

      // 5. Lighting: Distant Sun + Ambient + Earth Reflectance
      const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
      sunLight.position.set(400, 200, 350);
      this.scene.add(sunLight);

      const spaceAmbient = new THREE.AmbientLight(0x0f172a, 0.7);
      this.scene.add(spaceAmbient);

      const earthGlowLight = new THREE.PointLight(0x38bdf8, 1.4, 600);
      earthGlowLight.position.set(-200, -100, 100);
      this.scene.add(earthGlowLight);

      // 6. Build Deep Space Starfield & Cosmic Dust
      this.buildStarfield();

      // 7. Build Realistic Earth, Clouds, and Atmosphere
      this.buildEarthSystem();

      // 8. Build High-Detail Spacecraft / Satellite
      this.buildSatellite();

      // 9. Build Laser Beam & Telemetry Link
      this.buildSpaceToEarthLaser();

      // 10. HUD Telemetry Overlay
      this.buildHudOverlay();

      // 11. Event Listeners
      this.setupEvents();

      // 12. Run Loop
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

    // -------------------------------------------------------------
    // Starfield & Deep Space Skybox
    // -------------------------------------------------------------
    buildStarfield() {
      const starCount = 1800;
      const geo = new THREE.BufferGeometry();
      const pos = [];
      const col = [];

      for (let i = 0; i < starCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 900 + Math.random() * 800;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        pos.push(x, y, z);

        // Color variance: blue-white, bright white, warm yellow
        const colorType = Math.random();
        if (colorType > 0.8) {
          col.push(0.65, 0.85, 1.0); // Electric cyan-white
        } else if (colorType > 0.65) {
          col.push(1.0, 0.92, 0.7); // Warm star
        } else {
          col.push(0.95, 0.98, 1.0); // Pure star
        }
      }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });

      this.starPoints = new THREE.Points(geo, mat);
      this.universeGroup.add(this.starPoints);
    }

    // -------------------------------------------------------------
    // Earth System: Procedural Earth Map, Night Lights, Clouds & Halo
    // -------------------------------------------------------------
    buildEarthSystem() {
      this.earthGroup = new THREE.Group();
      this.universeGroup.add(this.earthGroup);

      // 1. Procedural High-Definition Earth Canvas Texture
      const earthTex = this.generateEarthTexture();

      // Earth Mesh with phong shading
      const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
      const earthMat = new THREE.MeshPhongMaterial({
        map: earthTex,
        bumpScale: 0.05,
        specular: new THREE.Color(0x224466),
        shininess: 18
      });

      this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
      this.earthGroup.add(this.earthMesh);

      // 2. Weather Cloud Layer
      const cloudTex = this.generateCloudTexture();
      const cloudGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.018, 48, 48);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.earthGroup.add(this.cloudsMesh);

      // 3. Atmospheric Fresnel Rim Glow (The Blue Horizon Halo seen from Orbit)
      const atmoGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.055, 48, 48);
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec3 viewDir = normalize(-vPosition);
            float intensity = pow(0.7 - dot(vNormal, viewDir), 2.2);
            vec3 atmosphereColor = mix(vec3(0.06, 0.72, 0.5), vec3(0.22, 0.74, 0.98), intensity);
            gl_FragColor = vec4(atmosphereColor, intensity * 0.95);
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });

      this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
      this.earthGroup.add(this.atmosphereMesh);

      // 4. Ground Station Base Beacon at Jakarta
      this.buildGroundStation();
    }

    generateEarthTexture() {
      const width = 2048;
      const height = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Ocean base: deep obsidian OLED navy
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
      oceanGrad.addColorStop(0, '#040914');
      oceanGrad.addColorStop(0.5, '#02060e');
      oceanGrad.addColorStop(1, '#040914');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw latitude / longitude bathymetric grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw stylized world continents with accurate silhouettes
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;

      const continents = [
        // Eurasia & Southeast Asia
        [[100, 200], [250, 180], [450, 150], [600, 160], [800, 220], [850, 320], [800, 420], [680, 520], [580, 480], [500, 420], [380, 450], [280, 380], [180, 340], [120, 260]],
        // Africa
        [[280, 400], [360, 420], [400, 500], [380, 620], [320, 720], [260, 680], [240, 540], [260, 450]],
        // North America
        [[1100, 140], [1350, 150], [1500, 220], [1450, 360], [1300, 440], [1200, 380], [1120, 260]],
        // South America
        [[1320, 460], [1420, 520], [1400, 660], [1320, 760], [1260, 680], [1280, 540]],
        // Australia
        [[720, 620], [840, 600], [860, 720], [750, 750], [700, 680]],
        // Indonesian Archipelago & Southeast Asia Islands (Detailed)
        [[640, 530], [680, 520], [670, 550], [630, 560]], // Sumatra & Malaya
        [[660, 565], [710, 565], [700, 580], [655, 580]], // Java
        [[690, 510], [740, 510], [730, 550], [680, 550]], // Borneo
        [[740, 520], [770, 520], [760, 560], [735, 550]], // Sulawesi
        [[780, 520], [850, 530], [840, 560], [775, 550]]  // Papua
      ];

      continents.forEach((poly) => {
        ctx.beginPath();
        ctx.moveTo(poly[0][0], poly[0][1]);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i][0], poly[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Illuminated Global City Lights / Ground Terminals
      const cities = [
        { x: 685, y: 572, name: 'Jakarta', major: true },
        { x: 672, y: 535, name: 'Singapore', major: true },
        { x: 800, y: 350, name: 'Tokyo', major: true },
        { x: 300, y: 280, name: 'Frankfurt', major: true },
        { x: 260, y: 260, name: 'London', major: true },
        { x: 1180, y: 360, name: 'San Francisco', major: true },
        { x: 1360, y: 340, name: 'New York', major: true },
        { x: 820, y: 720, name: 'Sydney', major: true }
      ];

      cities.forEach((c) => {
        // Glowing night light halo
        const halo = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, c.major ? 16 : 8);
        halo.addColorStop(0, c.major ? '#38bdf8' : '#f59e0b');
        halo.addColorStop(0.4, c.major ? 'rgba(16, 185, 129, 0.8)' : 'rgba(245, 158, 11, 0.6)');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.major ? 16 : 8, 0, Math.PI * 2);
        ctx.fill();

        // City core pin
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.major ? 3 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      return new THREE.CanvasTexture(canvas);
    }

    generateCloudTexture() {
      const width = 1024;
      const height = 512;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, width, height);

      // Wispy atmospheric swirl patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < 90; i++) {
        const cx = Math.random() * width;
        const cy = 100 + Math.random() * (height - 200);
        const radius = 25 + Math.random() * 75;

        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.6, 'rgba(240, 248, 255, 0.18)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    }

    buildGroundStation() {
      // Convert Jakarta coordinates to vector on Earth surface
      this.groundTargetPos = this.latLongToVector3(GROUND_STATION.lat, GROUND_STATION.lon, EARTH_RADIUS);

      const stationGroup = new THREE.Group();
      stationGroup.position.copy(this.groundTargetPos);
      stationGroup.lookAt(new THREE.Vector3(0, 0, 0));

      // 1. Central Ground Beacon
      const beaconGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      stationGroup.add(beacon);

      // 2. Radar Pulse Wave Rings
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.RingGeometry(3.5, 4.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        stationGroup.add(ring);
        this.groundRings.push({ mesh: ring, scale: 1.0 + i * 0.8, baseOpacity: 0.85 });
      }

      this.earthMesh.add(stationGroup);
      this.groundStationGroup = stationGroup;
    }

    // -------------------------------------------------------------
    // High-Detail Orbital Spacecraft / Satellite Model
    // -------------------------------------------------------------
    buildSatellite() {
      this.satelliteGroup = new THREE.Group();
      this.universeGroup.add(this.satelliteGroup);

      // Initial orbital position in space
      this.updateSatelliteOrbit(this.orbitAngle);

      // 1. Satellite Main Chassis Body (Hexagonal / Box Multi-layer Insulation)
      const busGeo = new THREE.BoxGeometry(14, 20, 12);
      const busMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.88,
        roughness: 0.25
      });
      const busMesh = new THREE.Mesh(busGeo, busMat);
      this.satelliteGroup.add(busMesh);

      // Gold Thermal Insulation MLI Foil Panels
      const foilMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.95,
        roughness: 0.35
      });
      const foilTop = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 10), foilMat);
      foilTop.position.y = 10.4;
      this.satelliteGroup.add(foilTop);

      const foilBottom = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 10), foilMat);
      foilBottom.position.y = -10.4;
      this.satelliteGroup.add(foilBottom);

      // 2. Parabolic High-Gain Dish Antenna (Pointed Directly to Earth)
      const dishGroup = new THREE.Group();
      dishGroup.position.set(0, 0, 8);

      const dishGeo = new THREE.ConeGeometry(8, 3.5, 24, 1, true);
      const dishMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.85,
        roughness: 0.2,
        side: THREE.DoubleSide
      });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.rotation.x = Math.PI / 2;
      dishGroup.add(dish);

      // Feed horn & laser optics at the focus of the dish
      const hornGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 12);
      const hornMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.rotation.x = Math.PI / 2;
      horn.position.z = 3.5;
      dishGroup.add(horn);

      // Glowing Optical Laser Emitter Lens
      const lensGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      this.laserEmitter = new THREE.Mesh(lensGeo, lensMat);
      this.laserEmitter.position.set(0, 0, 6.2);
      dishGroup.add(this.laserEmitter);

      this.satelliteGroup.add(dishGroup);

      // 3. Dual Photovoltaic Solar Array Wings (Left and Right)
      const solarTex = this.generateSolarTexture();
      const solarMat = new THREE.MeshStandardMaterial({
        map: solarTex,
        metalness: 0.9,
        roughness: 0.15,
        side: THREE.DoubleSide
      });

      // Solar Boom Trusses
      const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
      const boomLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 16), boomMat);
      boomLeft.rotation.z = Math.PI / 2;
      boomLeft.position.x = -14;
      this.satelliteGroup.add(boomLeft);

      const boomRight = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 16), boomMat);
      boomRight.rotation.z = Math.PI / 2;
      boomRight.position.x = 14;
      this.satelliteGroup.add(boomRight);

      // Left Solar Array (3 segments)
      const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 0.8), solarMat);
      wingLeft.position.set(-42, 0, 0);
      this.satelliteGroup.add(wingLeft);

      // Right Solar Array (3 segments)
      const wingRight = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 0.8), solarMat);
      wingRight.position.set(42, 0, 0);
      this.satelliteGroup.add(wingRight);

      // 4. Strobe Navigation LEDs (Port: Red, Starboard: Green, Beacon: Pulsing Cyan)
      const portLed = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      portLed.position.set(-63, 0, 0);
      this.satelliteGroup.add(portLed);

      const stbdLed = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      stbdLed.position.set(63, 0, 0);
      this.satelliteGroup.add(stbdLed);

      const beaconLed = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      beaconLed.position.set(0, 11.5, 0);
      this.satelliteGroup.add(beaconLed);

      this.strobeLeds.push(portLed, stbdLed, beaconLed);
    }

    generateSolarTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // Solar cell base: reflective midnight blue
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(0, 0, 512, 128);

      // Solar cell silicon grid
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;

      // Vertical divisions
      for (let x = 0; x < 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 128);
        ctx.stroke();
      }

      // Horizontal busbars
      for (let y = 0; y < 128; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Metallic contact sheen lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      for (let x = 8; x < 512; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 4);
        ctx.lineTo(x, 124);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    }

    updateSatelliteOrbit(angle) {
      // Inclined circular orbit (52 deg inclination)
      const inclination = Math.PI / 3.5;
      const x = Math.cos(angle) * SATELLITE_RADIUS;
      const y = Math.sin(angle) * Math.sin(inclination) * SATELLITE_RADIUS;
      const z = Math.sin(angle) * Math.cos(inclination) * SATELLITE_RADIUS;

      this.satelliteGroup.position.set(x, y, z);

      // Orient satellite so its antenna always points toward the center of Earth
      this.satelliteGroup.lookAt(0, 0, 0);
    }

    // -------------------------------------------------------------
    // Space-to-Earth Quantum Laser Link & Flying Photons
    // -------------------------------------------------------------
    buildSpaceToEarthLaser() {
      // 1. Core High-Coherence Laser Beam (Line connecting Satellite to Ground)
      const laserGeo = new THREE.BufferGeometry();
      laserGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));

      const laserMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      });

      this.laserBeam = new THREE.Line(laserGeo, laserMat);
      this.universeGroup.add(this.laserBeam);

      // 2. Laser Sheath / Atmosphere Penetration Glow
      const glowGeo = new THREE.BufferGeometry();
      glowGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
      const glowMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        linewidth: 4
      });
      this.laserGlow = new THREE.Line(glowGeo, glowMat);
      this.universeGroup.add(this.laserGlow);

      // 3. High-Speed Photon Data Packets (Downlink & Uplink streams)
      const packetCount = 8;
      for (let i = 0; i < packetCount; i++) {
        const pGeo = new THREE.SphereGeometry(2.0, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x38bdf8 : 0x10b981,
          transparent: true,
          opacity: 0.95
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        this.universeGroup.add(pMesh);

        this.photonPackets.push({
          mesh: pMesh,
          progress: i / packetCount,
          speed: 0.012 + Math.random() * 0.005,
          direction: i % 3 === 0 ? -1 : 1 // Downlink from space vs uplink from ground
        });
      }
    }

    updateSpaceToEarthLink() {
      if (!this.laserBeam || !this.satelliteGroup || !this.groundStationGroup) return;

      // Current world position of satellite laser emitter
      const satWorldPos = new THREE.Vector3();
      this.laserEmitter.getWorldPosition(satWorldPos);

      // Current world position of Jakarta ground station
      const groundWorldPos = new THREE.Vector3();
      this.groundStationGroup.getWorldPosition(groundWorldPos);

      // Update laser lines
      const positions = new Float32Array([
        satWorldPos.x, satWorldPos.y, satWorldPos.z,
        groundWorldPos.x, groundWorldPos.y, groundWorldPos.z
      ]);

      this.laserBeam.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.laserBeam.geometry.attributes.position.needsUpdate = true;

      this.laserGlow.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.laserGlow.geometry.attributes.position.needsUpdate = true;

      // Update traveling photon packets
      for (let i = 0; i < this.photonPackets.length; i++) {
        const p = this.photonPackets[i];
        p.progress += p.speed * p.direction;

        if (p.progress > 1.0) p.progress = 0.0;
        if (p.progress < 0.0) p.progress = 1.0;

        const currentPos = new THREE.Vector3().lerpVectors(satWorldPos, groundWorldPos, p.progress);
        p.mesh.position.copy(currentPos);

        // Pulsing scale
        const scale = 1.0 + Math.sin(p.progress * Math.PI) * 0.8;
        p.mesh.scale.set(scale, scale, scale);
      }

      // Update Ground Station Radar wave expansion
      for (let i = 0; i < this.groundRings.length; i++) {
        const r = this.groundRings[i];
        r.scale += 0.025;
        if (r.scale > 3.8) {
          r.scale = 1.0;
        }
        r.mesh.scale.set(r.scale, r.scale, r.scale);
        r.mesh.material.opacity = Math.max(0, r.baseOpacity * (1 - (r.scale - 1.0) / 2.8));
      }
    }

    // -------------------------------------------------------------
    // HUD Telemetry Overlay
    // -------------------------------------------------------------
    buildHudOverlay() {
      const hud = document.createElement('div');
      hud.className = 'audira-orbital-hud';
      hud.innerHTML = `
        <div class="orbital-hud-card">
          <div class="orbital-header">
            <span class="orbital-indicator"></span>
            <span class="orbital-title">LEO SATELLITE &bull; QUANTUM DOWNLINK ACTIVE</span>
          </div>

          <div class="orbital-metrics-grid">
            <div class="metric-box">
              <span class="metric-label">Orbital Altitude</span>
              <span class="metric-value cyan">550 KM (LEO)</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Target Station</span>
              <span class="metric-value emerald">Jakarta Base (-6.2° / 106.8°)</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Laser Carrier</span>
              <span class="metric-value">1550nm Coherent</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Direct Latency</span>
              <span class="metric-value emerald">3.4 ms (Zero Relay)</span>
            </div>
          </div>

          <div class="orbital-controls">
            <button type="button" id="btnOrbitalCinematic" class="orbital-btn active">Cinematic Orbit</button>
            <button type="button" id="btnOrbitalSatellite" class="orbital-btn">Satellite Cam</button>
            <button type="button" id="btnOrbitalEarth" class="orbital-btn">Earth Horizon</button>
          </div>
        </div>
      `;

      this.container.appendChild(hud);

      // Camera view presets
      const btnCinematic = hud.querySelector('#btnOrbitalCinematic');
      const btnSat = hud.querySelector('#btnOrbitalSatellite');
      const btnEarth = hud.querySelector('#btnOrbitalEarth');

      const setButtonActive = (btn) => {
        [btnCinematic, btnSat, btnEarth].forEach(b => b && b.classList.remove('active'));
        if (btn) btn.classList.add('active');
      };

      if (btnCinematic) {
        btnCinematic.addEventListener('click', (e) => {
          e.stopPropagation();
          setButtonActive(btnCinematic);
          this.viewMode = 'cinematic';
          this.targetCamDistance = 420;
          this.targetRotX = 0.25;
          this.targetRotY = 0.45;
        });
      }

      if (btnSat) {
        btnSat.addEventListener('click', (e) => {
          e.stopPropagation();
          setButtonActive(btnSat);
          this.viewMode = 'satellite';
          this.targetCamDistance = 210;
          this.targetRotX = 0.15;
          this.targetRotY = this.orbitAngle + 0.35;
        });
      }

      if (btnEarth) {
        btnEarth.addEventListener('click', (e) => {
          e.stopPropagation();
          setButtonActive(btnEarth);
          this.viewMode = 'earth';
          this.targetCamDistance = 280;
          this.targetRotX = 0.55;
          this.targetRotY = 1.45;
        });
      }
    }

    // -------------------------------------------------------------
    // Interactivity & Event Handlers
    // -------------------------------------------------------------
    setupEvents() {
      const el = this.canvas;

      el.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
        el.style.cursor = 'grabbing';
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          el.style.cursor = 'grab';
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          const dx = e.clientX - this.prevMouseX;
          const dy = e.clientY - this.prevMouseY;
          this.prevMouseX = e.clientX;
          this.prevMouseY = e.clientY;

          this.targetRotY += dx * 0.005;
          this.targetRotX += dy * 0.005;
        } else {
          // Subtle mouse parallax
          const nx = (e.clientX / window.innerWidth) - 0.5;
          const ny = (e.clientY / window.innerHeight) - 0.5;
          this.targetRotY += nx * 0.0008;
          this.targetRotX += ny * 0.0008;
        }
      });

      // Mobile Touch Drag Orbit
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.prevMouseX = e.touches[0].clientX;
          this.prevMouseY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.isDragging && e.touches.length === 1) {
          const dx = e.touches[0].clientX - this.prevMouseX;
          const dy = e.touches[0].clientY - this.prevMouseY;
          this.prevMouseX = e.touches[0].clientX;
          this.prevMouseY = e.touches[0].clientY;

          this.targetRotY += dx * 0.007;
          this.targetRotX += dy * 0.007;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });

      // Zoom via Mouse Wheel
      el.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.targetCamDistance += e.deltaY * 0.25;
        this.targetCamDistance = Math.max(160, Math.min(650, this.targetCamDistance));
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

      // IntersectionObserver GPU saver
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isRendering = entry.isIntersecting;
          });
        }, { threshold: 0.05 });
        observer.observe(this.container);
      }
    }

    updateCameraPosition() {
      // Spherical coordinates to Cartesian for smooth camera orbit
      const x = this.camDistance * Math.cos(this.camRotX) * Math.sin(this.camRotY);
      const y = this.camDistance * Math.sin(this.camRotX);
      const z = this.camDistance * Math.cos(this.camRotX) * Math.cos(this.camRotY);

      this.camera.position.set(x, y, z);
      this.camera.lookAt(0, 0, 0);
    }

    // -------------------------------------------------------------
    // Main Animation Loop
    // -------------------------------------------------------------
    animate() {
      requestAnimationFrame(this.animate);

      if (!this.isRendering) return;

      const elapsed = this.clock.getElapsedTime();

      // 1. Advance Satellite Orbit in LEO
      this.orbitAngle += this.orbitSpeed;
      this.updateSatelliteOrbit(this.orbitAngle);

      // 2. Rotate Earth & Clouds
      if (this.earthMesh) {
        this.earthMesh.rotation.y += this.earthRotationSpeed;
      }
      if (this.cloudsMesh) {
        this.cloudsMesh.rotation.y += this.earthRotationSpeed * 1.35; // Clouds drift faster
      }

      // 3. Strobe Navigation LEDs
      const strobe = Math.sin(elapsed * 5.0) > 0.3;
      for (let i = 0; i < this.strobeLeds.length; i++) {
        this.strobeLeds[i].scale.setScalar(strobe ? 1.5 : 0.8);
      }

      // 4. Update Space-to-Earth Quantum Laser Link
      this.updateSpaceToEarthLink();

      // 5. Camera Damping & Rotation
      this.camRotY += (this.targetRotY - this.camRotY) * 0.06;
      this.camRotX += (this.targetRotX - this.camRotX) * 0.06;
      this.camDistance += (this.targetCamDistance - this.camDistance) * 0.08;

      // Clamp vertical camera tilt
      this.camRotX = Math.max(-1.1, Math.min(1.1, this.camRotX));

      this.updateCameraPosition();

      // 6. Render
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Simulator Cockpit 3D Tilt
  function setupSimulatorTilt() {
    const simCard = document.getElementById('telemetry');
    if (!simCard) return;

    simCard.addEventListener('mousemove', (e) => {
      const rect = simCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3.2;
      const rotateY = ((x - centerX) / centerX) * 3.2;

      simCard.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    });

    simCard.addEventListener('mouseleave', () => {
      simCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  // Bootstrap
  function bootstrap() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      // Remove previous 3D wrapper if existing
      const existing = document.getElementById('audira-hero-3d');
      if (existing) existing.remove();

      const canvasContainer = document.createElement('div');
      canvasContainer.id = 'audira-hero-3d';
      canvasContainer.className = 'audira-hero-3d-wrapper';

      heroSection.insertBefore(canvasContainer, heroSection.firstChild);

      window.audiraOrbitalEngine = new AudiraOrbitalEngine(canvasContainer);
    }

    setupSimulatorTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
