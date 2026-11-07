import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ghostPiece, obsidianPiece, setGlow, setFade, swapType, setClip, loadModelPieces, GLYPH, LETTER, HEIGHT,
} from './pieces.js';
import {
  TIMELINE, PROMOTIONS, PROMO_RENDER, MODEL_URL, THEME, THEMES, renderTimeline, renderFallback, wirePanel,
} from './content.js';

const gsap = window.gsap;
const $ = (s) => document.querySelector(s);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Apply the accent colour to the page and the 3D scene.
const ACCENT_HEX = THEMES[THEME] ?? THEMES.violet;
const ACCENT = new THREE.Color(ACCENT_HEX);
{
  const rgb = [1, 3, 5].map((i) => parseInt(ACCENT_HEX.slice(i, i + 2), 16));
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const root = document.documentElement.style;
  root.setProperty('--accent', ACCENT_HEX);
  root.setProperty('--accent-rgb', rgb.join(', '));
  root.setProperty('--on-accent', lum > 0.62 ? '#0a0b10' : '#ffffff');
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

if (!webglAvailable() || !gsap) {
  document.body.classList.add('fallback');
  $('#fallback').innerHTML = renderFallback();
} else {
  if (MODEL_URL) {
    try { await loadModelPieces(MODEL_URL); } catch (e) { console.warn('Model not loaded, using procedural pieces', e); }
  }
  start();
}

function start() {
  /* ---------------- renderer, scene, post ---------------- */
  const canvas = $('#scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const PR = Math.min(devicePixelRatio, 1.75);
  renderer.setPixelRatio(PR);
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;

  const BG = new THREE.Color('#000000');
  const scene = new THREE.Scene();
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, 0.075);

  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 120);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.14;

  const target = new THREE.WebGLRenderTarget(innerWidth * PR, innerHeight * PR, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(PR);
  composer.setSize(innerWidth, innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.75, 0.6, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------------- lights ---------------- */
  scene.add(new THREE.HemisphereLight('#7d8cb3', '#040509', 0.35));
  const key = new THREE.SpotLight('#e6eaff', 32, 16, 0.6, 0.85, 1.4);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#8aa6ff', 1.6);
  scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(ACCENT, 0.4);
  scene.add(fill, fill.target);

  /* ---------------- the path through the story ---------------- */
  const VIEW_NEAR = 2.2; // pieces are fully visible within this many squares
  const VIEW_FAR = 5.6; // ...and invisible beyond this many
  const GAP = 4; // squares hopped before each capture
  const FINAL = 5; // squares from the last capture to the last rank
  const segs = [];
  {
    let f = 0; let r = 0;
    TIMELINE.forEach((item, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      segs.push({ start: { f, r }, len: GAP, target: { f: f + side, r: r + GAP + 1 }, item, side });
      f += side; r += GAP + 1;
    });
    segs.push({ start: { f, r }, len: FINAL, target: null });
  }
  const last = segs[segs.length - 1];
  const PROMO_RANK = last.start.r + last.len;
  const FILES = 'abcdefghijklmnop';
  const sq = (f, r) => `${FILES[f + 4]}${r + 2}`; // our pawn starts on e2
  const worldOf = (f, r) => new THREE.Vector3(f, 0, -r);

  /* ---------------- infinite board ---------------- */
  const boardMat = new THREE.ShaderMaterial({
    uniforms: {
      uBg: { value: BG },
      uDark: { value: new THREE.Color('#090a0f') },
      uLight: { value: new THREE.Color('#171a24') },
      uLine: { value: new THREE.Color('#2a2f42') },
      uWarm: { value: ACCENT.clone() },
      uAccent: { value: ACCENT.clone() },
      uFocus: { value: new THREE.Vector2() },
      uEdge: { value: -(PROMO_RANK + 2.5) }, // two spare ranks ahead hold the promotion choices
      uGlow: { value: 0 },
      uNear: { value: 2.6 },
      uFar: { value: 7.5 },
      uMark: { value: new THREE.Vector2(999, 999) },
      uMarkK: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBg, uDark, uLight, uLine, uWarm, uAccent;
      uniform vec2 uFocus, uMark; uniform float uEdge, uGlow, uNear, uFar, uMarkK, uTime;
      varying vec3 vW;
      void main() {
        vec2 p = vW.xz;
        vec2 cell = floor(p + 0.5);
        float parity = mod(cell.x + cell.y, 2.0);
        vec3 col = mix(uDark, uLight, parity);
        vec2 g = abs(fract(p + 0.5) - 0.5);
        float e = max(g.x, g.y);
        col = mix(col, uLine, smoothstep(0.482, 0.5, e) * 0.6);
        float d = distance(p, uFocus);
        col += uWarm * exp(-d * d * 0.45) * 0.07;
        // target square: pulsing accent outline
        vec2 m = abs(p - uMark);
        float inSq = step(max(m.x, m.y), 0.5);
        float border = smoothstep(0.40, 0.47, max(m.x, m.y)) * inSq;
        float pulse = 0.65 + 0.35 * sin(uTime * 3.2);
        col += uAccent * border * uMarkK * pulse * 1.6 + uAccent * inSq * uMarkK * 0.05;
        float beyond = step(p.y, uEdge);
        float fade = 1.0 - smoothstep(uNear, uFar, d);
        col = mix(uBg, col, fade * (1.0 - beyond));
        col += uAccent * exp(-abs(p.y - uEdge) * 16.0) * uGlow * fade * (1.0 - smoothstep(0.0, 9.0, abs(p.x - uFocus.x)));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), boardMat);
  board.rotation.x = -Math.PI / 2;
  scene.add(board);

  /* ---------------- soft contact shadows ---------------- */
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  function addShadow(obj, size = 0.95) {
    const m = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    m.scale.setScalar(size); m.position.y = 0.003; m.renderOrder = 1;
    obj.add(m); obj.userData.shadow = m;
    return m;
  }

  /* ---------------- pieces ---------------- */
  const pawn = obsidianPiece('pawn', ACCENT_HEX);
  addShadow(pawn);
  scene.add(pawn);

  const enemies = segs.filter((s) => s.target).map((s) => {
    const p = ghostPiece(s.item.piece);
    p.position.copy(worldOf(s.target.f, s.target.r));
    p.rotation.y = s.item.piece === 'knight' ? -Math.PI / 2 + s.side * 0.5 : s.side * 0.4;
    addShadow(p, 0.85);
    p.userData.shadow.material.opacity = 0.5;
    p.userData.seg = s;
    scene.add(p);
    return p;
  });

  // Promotion choices: built now, shown at the last rank.
  const floorClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const choices = PROMOTIONS.map((c, i) => {
    const p = obsidianPiece(c.piece, ACCENT_HEX);
    p.userData.choice = c;
    // the piece rises up through the board, so clip everything below the floor
    setClip(p, [floorClip]);
    // a thin outline on its square
    const sqMat = new THREE.MeshBasicMaterial({ color: ACCENT.clone().multiplyScalar(1.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const sqMesh = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.425, 72).rotateX(-Math.PI / 2), sqMat);
    sqMesh.visible = false; scene.add(sqMesh);
    p.userData.sq = sqMesh; p.userData.sqMat = sqMat;
    p.userData.slot = i;
    p.visible = false;
    scene.add(p);
    return p;
  });

  /* ---------------- ambient dust ---------------- */
  const dust = (() => {
    const N = 700; const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: '#b9c6ee', size: 0.025, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(g, m); pts.visible = false; scene.add(pts); return pts; // ambient dust off
  })();

  /* ---------------- effects ---------------- */
  const bursts = [];
  const PARTICLES = false; // spark bursts switched off for a cleaner look
  function burst(at, color = '#d6e2ff', n = 220, rise = false) {
    if (!PARTICLES) return;
    const pos = new Float32Array(n * 3); const vel = [];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = at.x + (Math.random() - 0.5) * (rise ? 0.5 : 0.4);
      pos[i * 3 + 1] = (at.y || 0) + 0.1 + Math.random() * 1.0;
      pos[i * 3 + 2] = at.z + (Math.random() - 0.5) * (rise ? 0.5 : 0.4);
      const a = Math.random() * Math.PI * 2; const s = rise ? 0.1 + Math.random() * 0.4 : 0.6 + Math.random() * 2.2;
      vel.push(new THREE.Vector3(Math.cos(a) * s, rise ? 0.4 + Math.random() * 1.2 : 0.8 + Math.random() * 2.4, Math.sin(a) * s));
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: new THREE.Color(color).multiplyScalar(2.2), size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(g, m); scene.add(pts);
    bursts.push({ pts, vel, life: rise ? 1.8 : 1.4, max: rise ? 1.8 : 1.4, g: rise ? -0.15 : 1 });
  }
  function shockwave(at, color = ACCENT_HEX, faint = false) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.3), transparent: true, opacity: faint ? 0.3 : 0.7, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.47, 72).rotateX(-Math.PI / 2), m);
    ring.position.set(at.x, 0.01, at.z); scene.add(ring);
    gsap.to(ring.scale, { x: faint ? 1.7 : 2.6, y: faint ? 1.7 : 2.6, z: faint ? 1.7 : 2.6, duration: 0.9, ease: 'power2.out' });
    gsap.to(m, { opacity: 0, duration: 0.9, ease: 'power1.in', onComplete: () => { scene.remove(ring); ring.geometry.dispose(); m.dispose(); } });
  }
  const shake = { k: 0 };
  const kick = (amount = 0.12) => { if (!REDUCED) { shake.k = amount; } };

  // Promotion: a column of light and a rising spiral of sparks around the pawn.
  const pillarMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: ACCENT.clone() }, uK: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main() {
        vec3 v = normalize(cameraPosition - vW);
        float edge = pow(1.0 - abs(dot(normalize(vN), v)), 1.4);
        float fall = pow(1.0 - vUv.y, 1.8);
        float streak = 0.55 + 0.45 * sin(vUv.x * 50.0 + uTime * 5.0 + vUv.y * 14.0);
        float a = (0.2 + edge) * fall * streak * uK;
        gl_FragColor = vec4(uColor * a * 2.6, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 7, 64, 1, true).translate(0, 3.5, 0), pillarMat);
  pillar.visible = false;
  scene.add(pillar);

  const swirl = (() => {
    const N = 380; const pos = new Float32Array(N * 3); const seed = [];
    for (let i = 0; i < N; i++) seed.push({ a: Math.random() * Math.PI * 2, h: Math.random(), s: 0.6 + Math.random() * 0.8, r: 0.35 + Math.random() * 0.55 });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: ACCENT.clone().multiplyScalar(2.6), size: 0.045, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
    return { pts, seed, pos, k: 0, speed: 1, center: new THREE.Vector3() };
  })();
  function updateFx(dt, time) {
    pillarMat.uniforms.uTime.value = time;
    pillar.visible = pillarMat.uniforms.uK.value > 0.001;
    swirl.pts.visible = swirl.k > 0.001;
    if (!swirl.pts.visible) return;
    swirl.seed.forEach((p, i) => {
      p.h = (p.h + dt * 0.4 * p.s * swirl.speed) % 1;
      p.a += dt * (2.2 + 3 * p.s) * swirl.speed;
      const r = p.r * (1 - p.h * 0.75);
      swirl.pos[i * 3] = swirl.center.x + Math.cos(p.a) * r;
      swirl.pos[i * 3 + 1] = p.h * 2.8;
      swirl.pos[i * 3 + 2] = swirl.center.z + Math.sin(p.a) * r;
    });
    swirl.pts.geometry.attributes.position.needsUpdate = true;
    swirl.pts.material.opacity = swirl.k;
  }

  /* ---------------- state ---------------- */
  let seg = 0; let t = 0; let shown = 0;
  let state = 'intro'; // intro | walk | await | capturing | panel | promote | promoting
  let pawnLocked = false;
  let lastInput = 0;
  let camMode = 'intro';
  let hovered = null;
  let panelReturn = null;
  const moves = [];
  const captured = [];

  /* ---------------- HUD ---------------- */
  const hint = $('#hint');
  const label = $('#target-label');
  const intro = $('#intro');
  const moveLog = $('#moves');
  const tray = $('#tray');
  const panel = $('#panel');
  const panelBody = $('#panel-body');
  const panelTitle = $('#panel-title');
  const panelMeta = $('#panel-meta');
  const panelSub = $('#panel-sub');
  const panelGlyph = $('#panel-glyph');
  const panelTeaser = $('#panel-teaser');
  const panelClose = $('#panel-close');
  const panelNext = $('#panel-next');
  const choiceLabels = PROMOTIONS.map((c) => {
    const el = document.createElement('button');
    el.className = 'choice-label';
    el.type = 'button';
    el.innerHTML = `<span class="glyph">${GLYPH.black[c.piece]}</span><span>${c.label}</span>`;
    el.addEventListener('click', () => promote(choices.find((p) => p.userData.choice === c)));
    el.addEventListener('pointerenter', () => { hovered = choices.find((p) => p.userData.choice === c); });
    el.addEventListener('pointerleave', () => { hovered = null; });
    el.hidden = true;
    $('#labels').appendChild(el);
    return el;
  });

  function setHint(html) { hint.innerHTML = html; }
  function logMove(san) {
    moves.push(san);
    const pairs = moves.map((m, i) => `<li><span class="mv-n">${i + 1}.</span> ${m}</li>`).slice(-4);
    moveLog.innerHTML = pairs.join('');
  }
  function refreshHint() {
    if (state === 'walk' || state === 'intro') setHint('Scroll to advance');
    if (state === 'await') {
      const p = segs[seg].item.piece;
      setHint(`Click the glowing ${p} to capture <kbd>Enter</kbd>`);
    }
    if (state === 'promote') setHint('Last rank. Choose your promotion');
  }

  /* ---------------- panel ---------------- */
  function openPanel({ meta = [], glyph = '', title, sub = '', html, wide = false, next = 'Continue', teaser = '', tone = 'ghost', onClose }) {
    panelMeta.innerHTML = meta.map((m) => `<span>${m}</span>`).join('');
    panelGlyph.textContent = glyph;
    panelTitle.textContent = title;
    panelSub.textContent = sub;
    panelSub.hidden = !sub;
    panelBody.innerHTML = html;
    [...panelBody.children].forEach((el, i) => el.style.setProperty('--i', i));
    wirePanel(panelBody);
    panelNext.textContent = next;
    panelTeaser.innerHTML = teaser;
    panel.dataset.tone = tone;
    panel.classList.toggle('wide', wide);
    panel.classList.remove('open');
    void panel.offsetWidth;
    panel.hidden = false;
    panel.scrollTop = 0;
    panelBody.scrollTop = 0;
    requestAnimationFrame(() => panel.classList.add('open'));
    panelReturn = onClose;
    hint.classList.add('dim');
  }
  function closePanel() {
    if (panel.hidden || !panel.classList.contains('open')) return;
    panel.classList.remove('open');
    hint.classList.remove('dim');
    setTimeout(() => { if (!panel.classList.contains('open')) panel.hidden = true; }, 450);
    const cb = panelReturn; panelReturn = null;
    cb?.();
  }
  panelClose.addEventListener('click', closePanel);
  panelNext.addEventListener('click', closePanel);

  function openTimeline(item, onClose) {
    const i = TIMELINE.indexOf(item);
    const nx = TIMELINE[i + 1];
    const pad = (n) => String(n).padStart(2, '0');
    openPanel({
      meta: [`Chapter ${i + 1} of ${TIMELINE.length}`, item.date],
      glyph: GLYPH.white[item.piece],
      title: item.title,
      sub: item.sub,
      html: renderTimeline(item),
      next: onClose ? 'Continue' : 'Back to the board',
      teaser: onClose ? (nx ? `Next on the board <b>${nx.title}</b>` : 'Next <b>The last rank</b>') : '',
      onClose,
    });
  }
  function openPromo(key, onClose) {
    const c = PROMOTIONS.find((p) => p.key === key);
    const subs = {
      projects: 'Models, tools and products I have built',
      about: 'Who I am, where I have worked, what I use',
      achievements: 'Wins, rankings, research and scholarships',
      photography: 'Shot and edited as time_froze',
    };
    openPanel({
      meta: [`The ${c.piece}`],
      glyph: GLYPH.white[c.piece], // outline glyph, same as the chapter panels
      title: c.label,
      sub: subs[key],
      html: PROMO_RENDER[key](),
      wide: key === 'projects' || key === 'photography',
      next: 'Back to the board',
      tone: 'accent',
      onClose,
    });
  }

  // Top navigation opens the four promotion sections from anywhere.
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => {
    if (state === 'capturing' || state === 'promoting') return;
    if (!panel.hidden && panel.classList.contains('open')) {
      // swap the content but keep whatever should happen when the panel closes
      const keep = panelReturn;
      openPromo(b.dataset.open, keep);
      return;
    }
    const prev = state;
    state = 'panel';
    openPromo(b.dataset.open, () => { state = prev === 'panel' ? 'walk' : prev; refreshHint(); });
  }));

  /* ---------------- input ---------------- */
  const blocking = () => state === 'capturing' || state === 'promoting';
  function advance(dy) {
    if (blocking()) return;
    if (state === 'panel') { if (dy > 0.02) closePanel(); return; }
    if (state === 'promote') return;
    const s = segs[seg];
    if (state === 'await') {
      if (dy < 0) { state = 'walk'; refreshHint(); } else { nudge(); return; }
    }
    if (state === 'intro' && dy > 0) { state = 'walk'; camMode = 'follow'; intro.classList.add('gone'); refreshHint(); }
    t = THREE.MathUtils.clamp(t + dy, 0, s.len);
    lastInput = performance.now();
  }
  let nudgeAt = 0;
  function nudge() {
    const now = performance.now();
    if (now - nudgeAt < 700) return;
    nudgeAt = now;
    label.classList.remove('nudge'); void label.offsetWidth; label.classList.add('nudge');
  }

  const inPanel = (e) => panel.contains(e.target);
  addEventListener('wheel', (e) => {
    if (inPanel(e)) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 0.16 : 0.0045;
    advance(THREE.MathUtils.clamp(e.deltaY * unit, -0.6, 0.6));
  }, { passive: false });

  let touchY = null;
  addEventListener('touchstart', (e) => { if (!inPanel(e)) touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (touchY === null || inPanel(e)) return;
    const y = e.touches[0].clientY;
    advance((touchY - y) * 0.012);
    touchY = y;
  }, { passive: true });
  addEventListener('touchend', () => { touchY = null; });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePanel(); return; }
    if (!panel.hidden && panel.contains(document.activeElement) && e.key !== 'Enter') return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      const s = segs[seg];
      if (state === 'panel') { closePanel(); return; }
      advance(Math.min(s.len, Math.floor(t + 1e-3) + 1) - t || 0.01);
    }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); advance(Math.max(0, Math.ceil(t - 1e-3) - 1) - t); }
    if (e.key === 'Enter' && state === 'await') capture();
  });

  const pointer = new THREE.Vector2(); const ray = new THREE.Raycaster();
  let pointerSet = false;
  addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    pointerSet = true;
  });
  function pick() {
    if (!pointerSet) return null;
    ray.setFromCamera(pointer, camera);
    if (state === 'await') {
      const enemy = enemies[seg];
      return ray.intersectObject(enemy.userData.core, false).length ? enemy : null;
    }
    if (state === 'promote') {
      const hit = ray.intersectObjects(choices.map((c) => c.userData.core), false)[0];
      return hit ? choices.find((c) => c.userData.core === hit.object) : null;
    }
    return null;
  }
  canvas.addEventListener('click', (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    pointerSet = true;
    const hit = pick();
    if (!hit) return;
    if (state === 'await') capture();
    else if (state === 'promote') promote(hit);
  });
  label.addEventListener('click', () => { if (state === 'await') capture(); });

  /* ---------------- capture ---------------- */
  // Capture: the pawn leans back, hops onto the square and knocks the white
  // piece over. It tips away from the pawn and fades as it falls.
  function capture() {
    if (state !== 'await') return;
    state = 'capturing';
    pawnLocked = true;
    const s = segs[seg];
    const enemy = enemies[seg];
    label.hidden = true;
    setHint('');
    gsap.to(boardMat.uniforms.uMarkK, { value: 0, duration: 0.4 });
    const from = pawn.position.clone();
    const to = worldOf(s.target.f, s.target.r);
    const dir = new THREE.Vector3(to.x - from.x, 0, to.z - from.z).normalize();
    const axis = new THREE.Vector3(dir.z, 0, -dir.x); // tipping about this axis leans the top along dir
    const baseQ = enemy.quaternion.clone();
    const basePos = enemy.position.clone();
    const tip = { a: 0, slide: 0 };
    const tq = new THREE.Quaternion();
    const applyTip = () => {
      tq.setFromAxisAngle(axis, tip.a);
      enemy.quaternion.copy(tq).multiply(baseQ);
      enemy.position.set(basePos.x + dir.x * tip.slide, basePos.y, basePos.z + dir.z * tip.slide);
    };
    const o = { k: 0 };
    const HOP = REDUCED ? 0.3 : 0.72;
    const T0 = REDUCED ? 0 : 0.18;
    const LAND = T0 + HOP;

    gsap.timeline()
      // the white piece notices: a soft brightening
      .to(enemy.userData, { flash: 0.25, duration: 0.3 }, 0)
      // anticipation: the pawn rocks back a little
      .to(pawn.rotation, { x: 0.12, duration: T0, ease: 'power1.out' }, 0)
      // the hop
      .to(o, {
        k: 1, duration: HOP, ease: 'power2.inOut',
        onUpdate: () => {
          pawn.position.lerpVectors(from, to, o.k);
          pawn.position.y = Math.sin(Math.PI * o.k) * 0.38;
          pawn.rotation.x = 0.12 * (1 - o.k) - Math.sin(Math.PI * o.k) * 0.08;
          pawn.rotation.z = -s.side * Math.sin(Math.PI * o.k) * 0.1;
        },
      }, T0)
      // contact, just before the pawn lands: the piece is nudged and starts to tip
      .to(tip, { a: 0.3, slide: 0.18, duration: 0.22, ease: 'power2.out', onUpdate: applyTip }, LAND - 0.18)
      .add(() => {
        enemy.userData.shadow.visible = false;
        gsap.fromTo(pawn.scale, { x: 1.03, y: 0.96, z: 1.03 }, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
      }, LAND)
      // and it falls over, fading as it goes
      .to(tip, { a: 1.5, slide: 0.42, duration: 0.65, ease: 'power2.in', onUpdate: applyTip }, LAND + 0.04)
      .to(enemy.userData, { flash: 0, duration: 0.5 }, LAND)
      .to({ v: 1 }, {
        v: 0, duration: 0.75, ease: 'power1.in',
        onUpdate() { setFade(enemy, this.targets()[0].v); },
        onComplete: () => { enemy.visible = false; },
      }, LAND + 0.05)
      .add(() => {
        s.item.san = `${FILES[s.start.f + 4]}x${sq(s.target.f, s.target.r)}`;
        logMove(s.item.san);
        captured.push(s.item);
        renderTray();
        seg += 1; t = 0; shown = 0;
        pawn.rotation.set(0, 0, 0);
        pawnLocked = false;
        state = 'panel';
        openTimeline(s.item, () => { state = 'walk'; refreshHint(); });
      }, LAND + 1.05); // after the piece has fully fallen and faded
  }

  function renderTray() {
    tray.innerHTML = captured.map((it, i) => `<button type="button" data-i="${i}" title="${it.title}">${GLYPH.white[it.piece]}</button>`).join('');
    tray.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      if (blocking()) return;
      if (!panel.hidden && panel.classList.contains('open')) {
        const keep = panelReturn;
        openTimeline(captured[+b.dataset.i], null);
        panelReturn = keep;
        return;
      }
      const prev = state;
      state = 'panel';
      openTimeline(captured[+b.dataset.i], null);
      panelReturn = () => { state = prev; refreshHint(); };
    }));
  }

  /* ---------------- promotion ---------------- */
  let promoted = null;
  let promoRef = null; // the pawn's square on the last rank
  function enterPromotion() {
    state = 'promote';
    camMode = 'promo';
    pawnLocked = true;
    promoRef = worldOf(segs[seg].start.f, PROMO_RANK);
    pawn.position.copy(promoRef);
    pawn.rotation.set(0, 0, 0);
    logMove(sq(segs[seg].start.f, PROMO_RANK));
    gsap.to(boardMat.uniforms.uGlow, { value: 0.45, duration: 1.2 });
    showChoices();
    refreshHint();
  }
  // The four choices stand in a row straight ahead of the pawn and rise up
  // through the board, centre pair first.
  const OFFSETS = [-1.5, -0.5, 0.5, 1.5];
  function showChoices() {
    choices.forEach((c, i) => {
      const off = OFFSETS[i];
      const home = new THREE.Vector3(promoRef.x + off, 0, promoRef.z - 2);
      const u = c.userData;
      Object.assign(u, { home, lift: 0, flash: 0 });
      c.visible = true;
      c.scale.setScalar(1);
      c.rotation.set(0, u.type === 'knight' ? -Math.PI / 2 + 0.6 : 0, 0);
      setFade(c, 1);
      c.position.set(home.x, -HEIGHT[u.type] - 0.05, home.z);
      u.sq.position.set(home.x, 0.004, home.z);
      u.sq.visible = true;
      u.sqMat.opacity = 0;
      const d = 0.1 + (Math.abs(off) - 0.5) * 0.22;
      gsap.to(u.sqMat, { opacity: 0.3, duration: 0.5, delay: d });
      gsap.to(c.position, { y: 0, duration: 1.2, delay: d + 0.15, ease: 'power3.out' });
      gsap.delayedCall(d + 0.9, () => { if (camMode !== 'transform' && c.visible) choiceLabels[i].hidden = false; });
    });
  }
  function bloomSpike() {
    gsap.fromTo(bloom, { strength: 1.25 }, { strength: 0.75, duration: 1.2, ease: 'power2.out' });
  }

  // The promotion itself: a thin ring of light scans up the pawn, and below the
  // ring the pawn is already the new piece.
  const keepAbove = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const keepBelow = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const scanRing = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.44, 96).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: ACCENT.clone().multiplyScalar(1.6), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }),
  );
  scanRing.visible = false;
  scene.add(scanRing);
  const facing = (type) => (type === 'knight' ? -Math.PI / 2 + 0.6 : 0); // knight in three-quarter view

  function morph(toType, dur, onDone) {
    const P = pawn.position.clone();
    const next = obsidianPiece(toType, ACCENT_HEX);
    next.position.copy(P);
    next.rotation.y = facing(toType);
    scene.add(next);
    setClip(pawn, [keepAbove]);
    setClip(next, [keepBelow]);
    const top = Math.max(HEIGHT[pawn.userData.type], HEIGHT[toType]) + 0.06;
    const o = { h: -0.01 };
    const apply = () => {
      keepAbove.constant = -o.h;
      keepBelow.constant = o.h;
      // the ring hugs the silhouette: wide at the foot, narrow up the stem
      const r = 0.42 - 0.2 * THREE.MathUtils.smoothstep(o.h, 0.06, 0.28);
      scanRing.position.set(P.x, o.h, P.z);
      scanRing.scale.setScalar(r / 0.42);
    };
    apply();
    scanRing.visible = true;
    gsap.timeline({
      onComplete: () => {
        swapType(pawn, toType);
        pawn.rotation.y = facing(toType);
        setClip(pawn, null);
        scene.remove(next);
        scanRing.visible = false;
        onDone?.();
      },
    })
      .to(scanRing.material, { opacity: 0.85, duration: 0.2 }, 0)
      .to(o, { h: top, duration: dur, ease: 'power2.inOut', onUpdate: apply }, 0)
      .to(scanRing.material, { opacity: 0, duration: 0.3 }, dur - 0.2);
  }

  function promote(choice) {
    if (state !== 'promote' || !choice) return;
    state = 'promoting';
    hovered = null;
    setHint('');
    choiceLabels.forEach((l) => { l.hidden = true; l.classList.remove('hot'); });
    const c = choice.userData.choice;
    const P = promoRef.clone();
    camMode = 'transform';
    const tl = gsap.timeline();

    // 1. The chosen piece brightens for a beat; all four sink back into the board.
    tl.to(choice.userData, { flash: 0.5, duration: 0.25 }, 0);
    choices.forEach((o, i) => {
      const at = o === choice ? 0.2 : 0.04 * i;
      tl.to(o.position, { y: -HEIGHT[o.userData.type] - 0.05, duration: 0.6, ease: 'power2.in', onComplete: () => { o.visible = false; } }, at);
      tl.to(o.userData.sqMat, { opacity: 0, duration: 0.4, onComplete: () => { o.userData.sq.visible = false; } }, at + 0.2);
    });

    // 2. A ring of light rises up the pawn and leaves the new piece behind it.
    tl.add(() => morph(c.piece, 1.3, () => {
      shockwave(P);
      gsap.fromTo(bloom, { strength: 1.05 }, { strength: 0.75, duration: 1.0, ease: 'power2.out' });
    }), 0.55)
      .to(pawn.userData, { flash: 0.35, duration: 0.6 }, 0.6)
      .to(pawn.userData, { flash: 0, duration: 0.8 }, 1.6)

    // 3. Read about it.
      .add(() => {
        camMode = 'promo';
        promoted = choice;
        logMove(`${FILES[segs[seg].start.f + 4]}${PROMO_RANK + 2}=${LETTER[c.piece]}`);
        state = 'panel';
        openPromo(c.key, unpromote);
      }, 2.3);
  }

  // Closing the panel scans the piece back into a pawn and brings the choices back.
  function unpromote() {
    state = 'promoting';
    const choice = promoted; promoted = null;
    choice.userData.flash = 0;
    moves.pop();
    morph('pawn', 0.8, () => { state = 'promote'; refreshHint(); });
    gsap.delayedCall(0.4, showChoices);
  }

  /* ---------------- camera ---------------- */
  const camPos = new THREE.Vector3(3, 1.2, 3);
  const camLook = new THREE.Vector3();
  const wantPos = new THREE.Vector3();
  const wantLook = new THREE.Vector3();
  function cameraGoal(time) {
    const P = promoRef && (camMode === 'promo' || camMode === 'transform') ? promoRef : pawn.position;
    const narrow = camera.aspect < 0.9;
    const k = narrow ? 1.45 : 1;
    if (camMode === 'intro') {
      const a = REDUCED ? 0.6 : 0.6 + Math.sin(time * 0.15) * 0.25;
      wantPos.set(P.x + Math.sin(a) * 3.2 * k, 1.1 + 0.2 * k, P.z + Math.cos(a) * 3.2 * k);
      // wide screens: pawn sits right of the name; phones: pawn sits above it
      if (narrow) wantLook.set(P.x, -0.55, P.z - 1.0);
      else wantLook.set(P.x - 1.7, 0.55, P.z - 1.5);
    } else if (camMode === 'promo') {
      wantPos.set(P.x, 3.1 * k, P.z + 3.4 * k);
      wantLook.set(P.x, 0.35, P.z - 1.7);
    } else if (camMode === 'transform') {
      wantPos.set(P.x + 0.35, 1.6 * k, P.z + 3.3 * k);
      wantLook.set(P.x, 0.55, P.z - 0.2);
    } else {
      wantPos.set(P.x + 0.9, 3.0 * k, P.z + 4.8 * k);
      wantLook.set(P.x, 0.35, P.z - 2.6);
      if (state === 'await') {
        const e = enemies[seg].position;
        wantPos.x += (e.x - P.x) * 0.6;
        wantLook.lerp(new THREE.Vector3(e.x, 0.6, e.z), 0.45);
      }
    }
  }

  /* ---------------- labels ---------------- */
  const tmp = new THREE.Vector3();
  function place(el, obj, yOff) {
    tmp.copy(obj.position); tmp.y += yOff; tmp.project(camera);
    const x = (tmp.x * 0.5 + 0.5) * innerWidth;
    const y = (-tmp.y * 0.5 + 0.5) * innerHeight;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }

  /* ---------------- frame loop ---------------- */
  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    boardMat.uniforms.uTime.value = time;

    // settle on whole squares when the reader stops scrolling
    if ((state === 'walk' || state === 'intro') && performance.now() - lastInput > 160) {
      t = Math.round(t);
    }
    shown += (t - shown) * (1 - Math.exp(-dt * 4.9)); // 30% slower than before
    if (Math.abs(t - shown) < 0.002) shown = t;

    const s = segs[seg];
    if (!pawnLocked && s) {
      const z = s.start.r + shown;
      // a small hop for every square crossed
      pawn.position.set(s.start.f, Math.sin((z % 1) * Math.PI) * 0.14 * Math.min(1, Math.abs(t - shown) * 6 + 0.3), -z);
      pawn.rotation.x = THREE.MathUtils.clamp((shown - t) * 0.5, -0.18, 0.18);
      if (state === 'walk' && t === s.len && Math.abs(shown - s.len) < 0.02) {
        if (s.target) {
          state = 'await';
          const e = enemies[seg];
          boardMat.uniforms.uMark.value.set(e.position.x, e.position.z);
          gsap.to(boardMat.uniforms.uMarkK, { value: 1, duration: 0.5 });
          label.innerHTML = `<span class="glyph">${GLYPH.white[s.item.piece]}</span><span class="lt"><strong>${s.item.title}</strong><em>${s.item.date}</em></span>`;
          label.hidden = false;
          refreshHint();
        } else {
          enterPromotion();
        }
      }
    }

    // board, light and dust follow the pawn
    board.position.set(pawn.position.x, 0, pawn.position.z);
    boardMat.uniforms.uFocus.value.set(pawn.position.x, pawn.position.z);
    key.position.set(pawn.position.x + 1.2, 6, pawn.position.z + 2);
    key.target.position.set(pawn.position.x, 0, pawn.position.z - 1);
    rim.position.set(pawn.position.x - 2, 3, pawn.position.z - 8);
    rim.target.position.copy(pawn.position);
    fill.position.set(pawn.position.x - 4, 1.5, pawn.position.z + 3);
    fill.target.position.copy(pawn.position);
    dust.position.set(pawn.position.x, 0, pawn.position.z - 4);
    if (!REDUCED) dust.rotation.y = time * 0.01;

    // enemy idle: gentle hover + glow for the one you can capture
    enemies.forEach((e, i) => {
      if (!e.visible) return;
      // short view distance: a piece only emerges from the dark as the pawn
      // approaches it (the next one starts to show right after a capture)
      if (!(state === 'capturing' && i === seg)) {
        const d = Math.hypot(e.position.x - pawn.position.x, e.position.z - pawn.position.z);
        const vis = 1 - THREE.MathUtils.smoothstep(d, VIEW_NEAR, VIEW_FAR);
        setFade(e, vis);
        e.userData.shadow.material.opacity = 0.5 * vis;
      }
      const active = i === seg && state === 'await';
      const isHover = active && hovered === e;
      const g = active ? 1.6 + Math.sin(time * 3.2) * 0.5 + (isHover ? 1.2 : 0) : 1;
      setGlow(e, g + e.userData.flash * 3);
      if (state === 'capturing' && i === seg) return;
      e.position.y = REDUCED ? 0 : 0.03 + Math.sin(time * 1.3 + i) * 0.03;
    });
    setGlow(pawn, 1 + (pawn.userData.flash ?? 0) * 4);

    // promotion choices: slow spin, hover lift
    if (state === 'promote') hovered = pick() ?? (choiceLabels.some((l) => l.matches(':hover')) ? hovered : null);
    else if (state === 'await') hovered = pick();
    choices.forEach((c, i) => {
      if (!c.visible) return;
      const u = c.userData;
      if (state === 'promote') {
        const h = hovered === c;
        u.lift = THREE.MathUtils.damp(u.lift, h ? 0.14 : 0, 10, dt);
        if (!gsap.isTweening(c.position)) c.position.y = u.lift;
        c.scale.setScalar(THREE.MathUtils.damp(c.scale.x, h ? 1.06 : 1, 10, dt));
        if (!gsap.isTweening(u.sqMat)) u.sqMat.opacity = THREE.MathUtils.damp(u.sqMat.opacity, h ? 0.9 : 0.3, 10, dt);
        setGlow(c, (h ? 2.6 : 1.1) + u.flash * 4);
        choiceLabels[i].classList.toggle('hot', h);
        place(choiceLabels[i], c, -0.15);
      } else {
        setGlow(c, 1.1 + u.flash * 4);
      }
    });
    // keep the pawn's contact shadow on the board while it is lifted
    pawn.userData.shadow.position.y = 0.003 - pawn.position.y / Math.max(pawn.scale.y, 0.01);
    updateFx(dt, time);
    document.body.style.cursor = hovered ? 'pointer' : '';

    if (!label.hidden) place(label, enemies[seg], HEIGHT[segs[seg].item.piece] + 0.25);

    // particles
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.life -= dt;
      const arr = b.pts.geometry.attributes.position.array;
      b.vel.forEach((v, j) => {
        v.y -= 3.2 * dt * b.g; v.multiplyScalar(1 - 1.2 * dt);
        arr[j * 3] += v.x * dt; arr[j * 3 + 1] = Math.max(0.02, arr[j * 3 + 1] + v.y * dt); arr[j * 3 + 2] += v.z * dt;
      });
      b.pts.geometry.attributes.position.needsUpdate = true;
      b.pts.material.opacity = Math.max(0, b.life / b.max);
      if (b.life <= 0) { scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose(); bursts.splice(i, 1); }
    }

    // camera
    cameraGoal(time);
    const ease = 1 - Math.exp(-dt * (camMode === 'intro' ? 1.2 : 2.6));
    camPos.lerp(wantPos, ease);
    camLook.lerp(wantLook, ease);
    camera.position.copy(camPos);
    if (shake.k > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shake.k;
      camera.position.y += (Math.random() - 0.5) * shake.k;
      shake.k *= Math.exp(-dt * 9);
    }
    camera.lookAt(camLook);

    composer.render();
  }

  /* ---------------- boot ---------------- */
  pawn.position.set(0, 0, 0);
  cameraGoal(0); camPos.copy(wantPos); camLook.copy(wantLook);
  refreshHint();

  function resize() {
    document.documentElement.style.setProperty('--hud-h', `${document.querySelector('.hud-top').offsetHeight}px`);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = camera.aspect < 0.9 ? 52 : 40;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    bloom.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);
  resize();
  renderer.setAnimationLoop(frame);
  document.body.classList.add('ready');

  // tiny debug/test hook
  window.__chess = { get state() { return state; }, get seg() { return seg; }, advance, capture, promote: (i) => promote(choices[i]), closePanel };
}
