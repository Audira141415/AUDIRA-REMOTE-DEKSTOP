/**
 * AUDIRA-GLOW — Interactive 3D / Isometric Glow Engine
 * Installed from: F:\AUDIRA-GLOW (Audira Studio Glow Suite)
 * Features:
 *   - Mathematical Isometric Projection Kernel (ISO.frame, plane, TOP, FRONT, SIDE)
 *   - Dark Hairline Vector Art with High-Intensity Neon Glow (#glow, #soft, #bloom)
 *   - Deep-Space Orbital Recon Satellite with Deployed Solar Wings & Phased-Array Dish
 *   - 100Gbps Space-to-Earth Optical Laser Downlink with traveling photon dashes
 *   - Ground Tracking Mission Console (Jakarta Base Station -6.2° / 106.8°)
 *   - Web Audio Sound Synthesizer (Chirping Laser Uplink & Ion RCS Plume Noise)
 *   - Multi-Color Swatch Accent Switcher (Mint, Ice, Ember, Gold, Neon, Dusk)
 *   - Keyboard Controls: Space, 1, 2, 3, 4
 */

(function () {
  'use strict';

  // 1. INJECT SVG GLOW FILTERS INTO DOM
  function ensureGlowFilters() {
    if (document.getElementById('audira-glow-fx')) return;
    const fxSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    fxSvg.id = 'audira-glow-fx';
    fxSvg.setAttribute('class', 'fx');
    fxSvg.setAttribute('aria-hidden', 'true');
    fxSvg.style.position = 'absolute';
    fxSvg.style.width = '0';
    fxSvg.style.height = '0';
    fxSvg.style.overflow = 'hidden';

    fxSvg.innerHTML = `
      <defs>
        <filter id="glow" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">
          <feGaussianBlur stdDeviation="4.5" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="soft" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">
          <feGaussianBlur stdDeviation="2.4" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="bloom" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">
          <feGaussianBlur stdDeviation="9"/>
        </filter>
        <linearGradient id="sat-laser-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="var(--accent-hi)"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(fxSvg);
  }

  // 2. ISOMETRIC PROJECTION KERNEL
  const ISO = (() => {
    const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
    function kernel(OX, OY) {
      const P = (x, y, z) => [(x - y) * C + OX, (x + y) * S - z + OY];
      const D = (x, y, z) => [(x - y) * C, (x + y) * S - z];
      const plane = (O, U, V) => {
        const o = P(...O), u = D(...U), v = D(...V);
        return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`;
      };
      const TOP   = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
      const FRONT = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
      const SIDE  = (x, y, z) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);
      const rect  = (t, w, h, r = 0, cls = 'face') => `<g transform="${t}"><rect class="${cls}" width="${w}" height="${h}" rx="${r}"/></g>`;

      const rounded = (x, y, z, w, d, h, r, cls) => {
        r = Math.min(r, w / 2, d / 2);
        const n = 10, z1 = z + h, q = Math.PI / 4, H = Math.PI / 2, c = cls ? ' ' + cls : '';
        const arc = (cx, cy, a0, a1) => {
          const o = [];
          for (let i = 0; i <= n; i++) {
            const a = a0 + ((a1 - a0) * i) / n;
            o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
          }
          return o;
        };
        const ring = [...arc(x + w - r, y + r, -H, 0), ...arc(x + w - r, y + d - r, 0, H), ...arc(x + r, y + d - r, H, 2 * H), ...arc(x + r, y + r, 2 * H, 3 * H)];
        const vis  = [...arc(x + w - r, y + r, -q, 0), ...arc(x + w - r, y + d - r, 0, H), ...arc(x + r, y + d - r, H, 3 * q)];
        const d3   = pts => 'M' + pts.map(p => P(...p).map(v => v.toFixed(2)).join(' ')).join('L') + 'Z';
        const wall = [...vis.map(([a, b]) => [a, b, z]), ...vis.slice().reverse().map(([a, b]) => [a, b, z1])];
        return `<path class="face${c}" d="${d3(wall)}"/><path class="face top${c}" d="${d3(ring.map(([a, b]) => [a, b, z1]))}"/>`;
      };

      const box = (x, y, z, w, d, h, r = 0) =>
        r > 0 ? rounded(x, y, z, w, d, h, r, '') :
        rect(SIDE(x + w, y + d, z + h), d, h) + rect(FRONT(x, y + d, z + h), w, h) + rect(TOP(x, y, z + h), w, d, 0, 'face top');

      const boxc = (x, y, z, w, d, h, r, cls) =>
        r > 0 ? rounded(x, y, z, w, d, h, r, cls) :
        rect(SIDE(x + w, y + d, z + h), d, h, 0, 'face ' + cls) + rect(FRONT(x, y + d, z + h), w, h, 0, 'face ' + cls) + rect(TOP(x, y, z + h), w, d, 0, 'face top ' + cls);

      const path = pts => 'M' + pts.map(p => P(...p).map(n => n.toFixed(2)).join(' ')).join('L');
      return { C, S, P, D, plane, TOP, FRONT, SIDE, rect, box, boxc, path };
    }

    function frame(points, margin = 0.09, aspect = 4 / 3) {
      const d = points.map(([x, y, z]) => [(x - y) * C, (x + y) * S - z]);
      let x0 = Math.min(...d.map(p => p[0])), x1 = Math.max(...d.map(p => p[0]));
      let y0 = Math.min(...d.map(p => p[1])), y1 = Math.max(...d.map(p => p[1]));
      const m = margin * Math.max(x1 - x0, y1 - y0);
      let w = x1 - x0 + 2 * m, h = y1 - y0 + 2 * m;
      let ox = m - x0, oy = m - y0;
      if (w / h < aspect) {
        const nw = h * aspect;
        ox += (nw - w) / 2;
        w = nw;
      } else {
        const nh = w / aspect;
        oy += (nh - h) / 2;
        h = nh;
      }
      return { ...kernel(ox, oy), viewBox: `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`, W: w, H: h };
    }

    const slits = (a0, a1, step, b0, b1, vertical = true, cls = 'detail') => {
      let s = '';
      for (let a = a0; a <= a1 + 1e-6; a += step) {
        s += vertical
          ? `<line class="${cls}" x1="${a}" y1="${b0}" x2="${a}" y2="${b1}"/>`
          : `<line class="${cls}" x1="${b0}" y1="${a}" x2="${b1}" y2="${a}"/>`;
      }
      return s;
    };

    return { kernel, frame, slits };
  })();

  // 3. WEB AUDIO SYNTHESIZER
  const AUDIO = (() => {
    let ctx = null, out = null;
    return () => {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        out = ctx.createGain();
        out.gain.value = 0.35;
        out.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return { ctx, out };
    };
  })();

  // 4. PALETTE ACCENT MANAGEMENT
  const ACCENTS = [
    ['Mint',  '#00e676', '#69f0ae', '#059669', '#047857'], // Default Audira Emerald
    ['Ice',   '#40c4ff', '#80d8ff', '#0284c7', '#0369a1'], // Electric Sky
    ['Ember', '#ff9a2e', '#ffc77a', '#d97706', '#92400e'], // Warm Amber
    ['Gold',  '#ffd54f', '#fff59d', '#d97706', '#b45309'], // Photovoltaic Solar
    ['Neon',  '#ff4fa3', '#ff9fcb', '#db2777', '#be185d'], // Cyber Magenta
    ['Dusk',  '#7c4dff', '#b388ff', '#7c3aed', '#6d28d9']  // Deep Space Violet
  ];

  function applyAccentPalette(key) {
    const pal = ACCENTS.find(a => a[0].toLowerCase() === key.toLowerCase()) || ACCENTS[0];
    const [name, da, dh] = pal;
    const root = document.documentElement;
    root.style.setProperty('--accent', da);
    root.style.setProperty('--accent-hi', dh);
    root.style.setProperty('--accent-dim', `${da}26`);
    root.style.setProperty('--glass-on', `${da}1a`);

    document.querySelectorAll('#glowSwatches button').forEach(b => {
      b.setAttribute('aria-checked', b.dataset.accent === pal[0].toLowerCase() ? 'true' : 'false');
    });

    try { localStorage.setItem('audira-glow-accent', pal[0].toLowerCase()); } catch (e) {}
  }

  // 5. AUDIRA ORBITAL SATELLITE FIGURE MOUNT
  function mountAudiraSatellite(stage, api) {
    const K = api.iso.frame([
      [0, 270, 0], [340, 10, 0], [340, 270, 0], [0, 10, 0],
      [20, 20, 260], [320, 20, 260], [20, 260, 260], [320, 260, 260]
    ]);
    const { TOP, FRONT, box, boxc, P } = K;
    const slits = api.iso.slits;

    let svg = '';

    // 1. Orbital Horizon Base Grid / Earth Vector Arc
    const PLZ = 8;
    svg += boxc(10, 10, 0, 320, 260, PLZ, 16, 'stage-floor');
    svg += `<g transform="${TOP(10, 10, PLZ)}">
      <rect class="detail" x="12" y="12" width="296" height="236" rx="12" stroke-dasharray="10 6"/>
      <path d="M 20,220 Q 160,80 300,220" fill="none" stroke="var(--line)" stroke-width="1.8"/>
      <path d="M 40,230 Q 160,105 280,230" fill="none" stroke="var(--detail)" stroke-width="1.2" stroke-dasharray="12 8"/>
      <circle cx="160" cy="140" r="4" fill="var(--accent)"/>
      <text class="label" x="25" y="248" font-size="4.2" letter-spacing="1.5">AUDIRA ORBITAL COMM &bull; GEOSTATIONARY RECON SATELLITE (ALT: 35,786 KM)</text>
    </g>`;

    // 2. SATELLITE BODY IN ZERO-G (Floating Group)
    svg += `<g id="satellite-group">`;

    // Center Satellite Equipment Bus
    const CX = 160, CY = 140, SAT_Z = 95, SAT_W = 60, SAT_D = 60, SAT_H = 80;
    svg += box(CX - SAT_W / 2, CY - SAT_D / 2, SAT_Z, SAT_W, SAT_D, SAT_H, 8);
    svg += `<g transform="${TOP(CX - SAT_W / 2, CY - SAT_D / 2, SAT_Z + SAT_H)}">
      <rect class="detail" x="4" y="4" width="${SAT_W - 8}" height="${SAT_D - 8}" rx="4"/>
      <circle cx="${SAT_W / 2}" cy="${SAT_D / 2}" r="16" fill="none" stroke="#ffd54f" stroke-width="1.4"/>
      <circle cx="${SAT_W / 2}" cy="${SAT_D / 2}" r="8" fill="var(--accent)" opacity="0.6"/>
      <text class="label" x="${SAT_W / 2}" y="${SAT_D / 2 + 3}" font-size="3" text-anchor="middle">AUDIRA BUS</text>
    </g>`;

    svg += `<g transform="${FRONT(CX - SAT_W / 2, CY + SAT_D / 2, SAT_Z + SAT_H)}">
      ${slits(6, SAT_W - 6, 4, 8, SAT_H - 10, true, 'wire hot')}
    </g>`;

    // 3. DEPLOYED DUAL PHOTOVOLTAIC SOLAR WINGS
    const LW_W = 100, LW_D = 40, LW_Z = SAT_Z + 25;
    svg += `<g class="solar-wing" id="left-solar-wing">`;
    svg += box(CX - SAT_W / 2 - LW_W - 12, CY - LW_D / 2, LW_Z, LW_W, LW_D, 4, 3);
    svg += `<g transform="${TOP(CX - SAT_W / 2 - LW_W - 12, CY - LW_D / 2, LW_Z + 4)}">
      <rect class="glass hot" x="2" y="2" width="${LW_W - 4}" height="${LW_D - 4}" rx="2"/>
      ${slits(6, LW_W - 6, 8, 4, LW_D - 4, true, 'wire hot')}
      ${slits(6, LW_D - 6, 8, 4, LW_W - 4, false, 'detail')}
    </g>`;
    svg += `<line x1="${P(CX - SAT_W / 2, CY, LW_Z + 2)[0]}" y1="${P(CX - SAT_W / 2, CY, LW_Z + 2)[1]}" x2="${P(CX - SAT_W / 2 - 12, CY, LW_Z + 2)[0]}" y2="${P(CX - SAT_W / 2 - 12, CY, LW_Z + 2)[1]}" stroke="#cfd8dc" stroke-width="2.5"/>`;
    svg += `</g>`;

    const RW_W = 100, RW_D = 40, RW_Z = SAT_Z + 25;
    svg += `<g class="solar-wing" id="right-solar-wing">`;
    svg += box(CX + SAT_W / 2 + 12, CY - RW_D / 2, RW_Z, RW_W, RW_D, 4, 3);
    svg += `<g transform="${TOP(CX + SAT_W / 2 + 12, CY - RW_D / 2, RW_Z + 4)}">
      <rect class="glass hot" x="2" y="2" width="${RW_W - 4}" height="${RW_D - 4}" rx="2"/>
      ${slits(6, RW_W - 6, 8, 4, RW_D - 4, true, 'wire hot')}
      ${slits(6, RW_D - 6, 8, 4, RW_W - 4, false, 'detail')}
    </g>`;
    svg += `<line x1="${P(CX + SAT_W / 2, CY, RW_Z + 2)[0]}" y1="${P(CX + SAT_W / 2, CY, RW_Z + 2)[1]}" x2="${P(CX + SAT_W / 2 + 12, CY, RW_Z + 2)[0]}" y2="${P(CX + SAT_W / 2 + 12, CY, RW_Z + 2)[1]}" stroke="#cfd8dc" stroke-width="2.5"/>`;
    svg += `</g>`;

    // 4. HIGH-GAIN PARABOLIC DISH ANTENNA WITH RADAR SWEEP NEEDLE
    const DISH_Z = SAT_Z + SAT_H + 18;
    const [dpx, dpy] = P(CX, CY, DISH_Z);

    svg += `<g id="sat-dish-unit" class="sat-dish">
      <line x1="${P(CX, CY, SAT_Z + SAT_H)[0]}" y1="${P(CX, CY, SAT_Z + SAT_H)[1]}" x2="${dpx}" y2="${dpy}" stroke="#cfd8dc" stroke-width="3"/>
      <ellipse cx="${dpx}" cy="${dpy}" rx="38" ry="24" fill="var(--deck)" stroke="var(--line)" stroke-width="2"/>
      <ellipse cx="${dpx}" cy="${dpy}" rx="32" ry="20" fill="none" stroke="var(--accent-hi)" stroke-width="1.5" stroke-dasharray="8 6"/>
      <circle cx="${dpx}" cy="${dpy}" r="6" fill="#ffd54f" filter="url(#soft)"/>
      <line id="dish-radar-needle" x1="${dpx}" y1="${dpy}" x2="${dpx + 24}" y2="${dpy - 10}" stroke="var(--accent-hi)" stroke-width="2" stroke-linecap="round" filter="url(#glow)"/>
      <line x1="${dpx}" y1="${dpy}" x2="${dpx - 14}" y2="${dpy - 22}" stroke="#cfd8dc" stroke-width="1.4"/>
      <line x1="${dpx}" y1="${dpy}" x2="${dpx + 14}" y2="${dpy - 22}" stroke="#cfd8dc" stroke-width="1.4"/>
      <circle cx="${dpx}" cy="${dpy - 22}" r="3" fill="var(--accent-hi)" filter="url(#glow)"/>
    </g>`;

    // 5. LASER OPTICAL DATA DOWNLINK BEAM
    svg += `<g id="laser-downlink-fx" opacity="0" style="transition: opacity 0.2s ease;">
      <polygon points="${dpx - 6},${dpy - 22} ${dpx + 6},${dpy - 22} ${dpx + 90},${dpy + 180} ${dpx + 70},${dpy + 180}" fill="url(#sat-laser-grad)" filter="url(#glow)"/>
      <line id="laser-data-stream" class="laser-beam" x1="${dpx}" y1="${dpy - 22}" x2="${dpx + 80}" y2="${dpy + 180}" stroke="#ffffff" stroke-width="3" filter="url(#soft)"/>
      <circle cx="${dpx + 80}" cy="${dpy + 180}" r="16" fill="none" stroke="var(--accent-hi)" stroke-width="2" filter="url(#glow)"/>
    </g>`;

    // 6. ION PROPULSION RCS THRUSTERS WITH DYNAMIC PUFF PLUMES
    const rcsPts = [
      [CX - SAT_W / 2, CY - SAT_D / 2], [CX + SAT_W / 2, CY - SAT_D / 2],
      [CX - SAT_W / 2, CY + SAT_D / 2], [CX + SAT_W / 2, CY + SAT_D / 2]
    ];
    rcsPts.forEach(([rx, ry], idx) => {
      const [rpx, rpy] = P(rx, ry, SAT_Z - 6);
      svg += `<circle cx="${rpx}" cy="${rpy}" r="3" fill="#212121" stroke="var(--accent)" stroke-width="1"/>`;
      svg += `<line id="rcs-plume-${idx}" x1="${rpx}" y1="${rpy}" x2="${rpx - 8}" y2="${rpy + 8}" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" opacity="0" filter="url(#soft)"/>`;
    });

    svg += `</g>`; // End floating group

    // 7. GROUND TRACKING MISSION CONSOLE (Front left - Jakarta Station)
    const TRK_X = 25, TRK_Y = 25, TRK_Z = PLZ;
    svg += box(TRK_X, TRK_Y, TRK_Z, 76, 52, 26, 4);
    svg += `<g transform="${TOP(TRK_X, TRK_Y, TRK_Z + 26)}">
      <rect class="detail" x="4" y="4" width="68" height="44" rx="2"/>
      <rect class="glass" x="8" y="8" width="60" height="36" rx="2"/>
      <text class="scr" id="sat-coord" x="12" y="18" font-size="3.8">LAT: -6.20° &bull; LON: 106.84°E</text>
      <text class="scr-accent" id="sat-link" x="12" y="27" font-size="4">LINK: 100 Gbps AV1</text>
      <text class="label" id="sat-pwr" x="12" y="36" font-size="3.2">SOLAR: 18.42 kW &bull; JAKARTA BASE</text>
    </g>`;

    stage.setAttribute('viewBox', K.viewBox);
    stage.innerHTML = svg;

    // AUDIO SOUND EFFECTS
    const playSatSound = (type) => {
      try {
        const audio = api.audio();
        if (!audio || !audio.ctx) return;
        const { ctx, out } = audio;
        const now = ctx.currentTime;

        if (type === 'uplink') {
          [1200, 1600, 2400, 3200].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.08, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);
            osc.connect(gain);
            gain.connect(out);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.14);
          });
        } else if (type === 'rcs') {
          const bufferSize = ctx.sampleRate * 0.22;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, now);
          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.16, now);
          nGain.gain.linearRampToValueAtTime(0, now + 0.22);
          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(out);
          noise.start(now);
        }
      } catch (e) {}
    };

    // ANIMATION & TICK
    const satGroup = stage.querySelector('#satellite-group');
    const radarNeedle = stage.querySelector('#dish-radar-needle');
    const dataStream = stage.querySelector('#laser-data-stream');
    const coordText = stage.querySelector('#sat-coord');
    const pwrText = stage.querySelector('#sat-pwr');
    const laserFx = stage.querySelector('#laser-downlink-fx');
    const linkText = stage.querySelector('#sat-link');

    let tick = 0;
    const timer = setInterval(() => {
      tick++;

      // 1. Zero-G slow orbital oscillation
      const zeroG = Math.sin(tick * 0.06) * 5;
      if (satGroup) satGroup.style.transform = `translateY(${zeroG.toFixed(1)}px)`;

      // 2. Rotating radar sweep needle on dish
      if (radarNeedle) {
        const nx = dpx + 26 * Math.cos(tick * 0.12);
        const ny = dpy + 16 * Math.sin(tick * 0.12);
        radarNeedle.setAttribute('x2', nx.toFixed(1));
        radarNeedle.setAttribute('y2', ny.toFixed(1));
      }

      // 3. Continuous packet flow along laser stream
      if (dataStream) {
        dataStream.setAttribute('stroke-dashoffset', (-tick * 3).toFixed(1));
      }

      // 4. Periodic RCS thruster puff firing on corner
      if (tick % 60 === 0) {
        const pIdx = (tick / 60) % 4;
        const plume = stage.querySelector(`#rcs-plume-${pIdx}`);
        if (plume) {
          plume.style.opacity = '1';
          setTimeout(() => { plume.style.opacity = '0'; }, 180);
        }
      }

      // 5. Telemetry updates
      if (tick % 8 === 0) {
        const lon = (106.82 + Math.sin(tick * 0.05) * 0.02).toFixed(2);
        if (coordText) coordText.textContent = `LAT: -6.20° &bull; LON: ${lon}°E`;
        const pwr = (18.40 + Math.sin(tick * 0.1) * 0.05).toFixed(2);
        if (pwrText) pwrText.textContent = `SOLAR: ${pwr} kW &bull; JAKARTA BASE`;
      }
    }, 45);

    let downCount = 0;
    const transmitDownlink = () => {
      playSatSound('uplink');
      stage.classList.add('sat-burst');
      downCount++;
      const links = ['LINK: 100 Gbps OPTICAL', 'LINK: QUANTUM ENCRYPTED', 'LINK: AV1 60FPS DIRECT UDP'];
      if (linkText) linkText.textContent = links[downCount % links.length];
      api.readout('OPTICAL LASER DOWNLINK ACTIVE &bull; 100 Gbps TO JAKARTA BASE &bull; BIT ERROR: 0%');
      if (laserFx) laserFx.style.opacity = '1';
      setTimeout(() => {
        if (laserFx) laserFx.style.opacity = '0';
        stage.classList.remove('sat-burst');
      }, 700);
    };

    const dishEl = stage.querySelector('#sat-dish-unit');
    if (dishEl) dishEl.addEventListener('click', transmitDownlink);

    // Expose global trigger for toolbar buttons
    window.audiraGlowTrigger = (key) => {
      if (key === 'space') transmitDownlink();
      if (key === '1') {
        playSatSound('rcs');
        api.readout('RCS ION MANEUVERING BURN: ATTITUDE ORIENTED +0.02°');
      }
      if (key === '2') transmitDownlink();
      if (key === '3') api.readout('STAR TRACKER STELLAR LOCK: 24 CONSTELLATION REFERENCES');
      if (key === '4') api.readout('SOLAR BATTERY CAPACITY: 98.6% &bull; 18.4 kW BUS POWER');
    };

    // Keyboard bindings
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        transmitDownlink();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        window.audiraGlowTrigger(e.key);
      }
    });

    api.readout('ORBITAL RECON SATELLITE &bull; SOLAR ARRAY 100% &bull; READY');

    return {
      destroy: () => clearInterval(timer)
    };
  }

  // 6. INITIALIZATION
  function bootstrap() {
    ensureGlowFilters();

    const stageHolder = document.getElementById('stageHolder');
    if (!stageHolder) return;

    // Create SVG Stage
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'audira-glow-stage');
    svg.setAttribute('role', 'img');
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('aria-label', 'AUDIRA Orbital Recon Satellite');
    stageHolder.appendChild(svg);

    // API Bridge
    const readoutEl = document.getElementById('glowReadout');
    const hintEl = document.getElementById('glowHint');

    const api = {
      iso: ISO,
      audio: AUDIO,
      readout: (msg) => { if (readoutEl) readoutEl.innerHTML = msg; },
      hint: (msg) => { if (hintEl) hintEl.innerHTML = msg; }
    };

    // Render Swatches
    const swatchesContainer = document.getElementById('glowSwatches');
    if (swatchesContainer) {
      swatchesContainer.innerHTML = ACCENTS.map(([name, da]) =>
        `<button type="button" role="radio" data-accent="${name.toLowerCase()}" aria-label="${name}" title="Glow ${name}" style="--sw:${da}"><i></i></button>`
      ).join('');

      swatchesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-accent]');
        if (btn) applyAccentPalette(btn.dataset.accent);
      });
    }

    // Apply saved or default accent
    let savedAccent = 'mint';
    try { savedAccent = localStorage.getItem('audira-glow-accent') || 'mint'; } catch (e) {}
    applyAccentPalette(savedAccent);

    // Mount Satellite Figure
    mountAudiraSatellite(svg, api);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
