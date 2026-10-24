/* =====================================================================
   Neighborly hero scene (Three.js)
   ---------------------------------------------------------------------
   One glowing orb (the shared meal), food cards orbiting it, and small
   lights travelling between neighbors on a faint perspective grid.
   Usage:  const stop = initHero(document.querySelector('.hero3d'));
           stop();   // call when leaving the screen (frees the GPU)
   ===================================================================== */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

/* ---------- things you can tweak ---------- */
export const CONFIG = {
  colors: {
    orb: 0xF0912F,          // the glowing meal
    glow: '#F0912F',        // halo around orb and travelling lights
    node: 0xF4F1E8,         // neighbor dots on the floor
    grid: 0x7FB08A,         // floor grid and connection lines
    card: '#F4F1E8',        // card background
    cardText: '#1E4A2A',    // card text
    fog: 0x12301F           // must match the dark end of the hero gradient
  },
  cards: [
    { word: 'BREAD',  sub: '2 loaves' },
    { word: 'SOUP',   sub: '4 portions' },
    { word: 'FRUIT',  sub: '1 bag' },
    { word: 'FREE',   sub: 'take what you need' },
    { word: 'NEARBY', sub: 'Building B' },
    { word: 'CAKE',   sub: '5 slices' }
  ],
  cardCount:  { desktop: 6, mobile: 4 },   // fewer objects on phones
  travelers:  { desktop: 5, mobile: 3 },   // lights moving between neighbors
  orbitSpeed: 0.18,       // radians per second (cards around the orb)
  travelSpeed: 0.9,       // speed of the travelling lights
  parallax: 0.35,         // how much the scene follows pointer and scroll (0 = none)
  pixelRatioCap: { desktop: 2, mobile: 1.5 }
};

/* ---------- small helpers ---------- */
function glowTexture(color) {
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, color + 'ff');
  gr.addColorStop(0.25, color + 'aa');
  gr.addColorStop(0.6, color + '22');
  gr.addColorStop(1, color + '00');
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function cardTexture(word, sub) {
  const w = 320, h = 200, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  roundRect(g, 4, 4, w - 8, h - 8, 28);
  g.fillStyle = CONFIG.colors.card;
  g.fill();
  g.fillStyle = CONFIG.colors.glow;
  g.beginPath(); g.arc(40, 44, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = CONFIG.colors.cardText;
  g.textBaseline = 'alphabetic';
  g.font = "84px Anton, Impact, 'Arial Narrow', sans-serif";
  g.fillText(word, 28, 140);
  g.font = "bold 24px 'DM Sans', system-ui, sans-serif";
  g.globalAlpha = 0.8;
  g.fillText(sub, 30, 178);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

/* ---------- main ---------- */
export function initHero(root) {
  const canvas = root.querySelector('canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mobile = innerWidth < 760;
  let wide = true;
  const pick = (o) => (mobile ? o.mobile : o.desktop);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) {
    root.classList.add('no-webgl');          // CSS shows a static glow instead
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pick(CONFIG.pixelRatioCap)));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(CONFIG.colors.fog, 8, 22);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  const world = new THREE.Group();
  scene.add(world);

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  /* orb + halo */
  const orb = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.85, 32, 24)),
    track(new THREE.MeshLambertMaterial({ color: CONFIG.colors.orb, emissive: 0x8A3F0C }))
  );
  world.add(orb);
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(-3, 4, 5);
  scene.add(sun, new THREE.AmbientLight(0xffffff, 0.8));
  const glowTex = track(glowTexture(CONFIG.colors.glow));
  const halo1 = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 })));
  halo1.scale.setScalar(6);
  const halo2 = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.28 })));
  halo2.scale.setScalar(11);
  world.add(halo1, halo2);

  /* perspective grid floor */
  const FLOOR = -1.9;
  const grid = new THREE.GridHelper(44, 44, CONFIG.colors.grid, CONFIG.colors.grid);
  grid.position.y = FLOOR;
  grid.material.transparent = true;
  grid.material.opacity = 0.4;
  grid.renderOrder = -2;                 // always drawn behind cards and lights
  disposables.push(grid.geometry, grid.material);
  world.add(grid);

  /* neighbors (dots on the floor) and the paths between them */
  const spots = [[-4.6, -3], [-2.7, -0.6], [-0.6, -4.2], [2.3, -2.3], [4.5, -0.3], [1.1, 0.7], [-3.5, 1.3]];
  const nodes = spots.slice(0, mobile ? 5 : 7).map(([x, z]) => new THREE.Vector3(x, FLOOR + 0.06, z));
  const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 3], [1, 5], [5, 3], [0, 6], [6, 1]]
    .filter(([a, b]) => a < nodes.length && b < nodes.length);
  const nodeGeo = track(new THREE.SphereGeometry(0.1, 12, 10));
  const nodeMat = track(new THREE.MeshBasicMaterial({ color: CONFIG.colors.node }));
  const nodeMeshes = nodes.map((p) => {
    const m = new THREE.Mesh(nodeGeo, nodeMat);
    m.position.copy(p);
    const h = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35, color: 0xcfe3bf })));
    h.scale.setScalar(0.9);
    m.add(h);
    world.add(m);
    return m;
  });
  const linePts = [];
  edges.forEach(([a, b]) => linePts.push(nodes[a], nodes[b]));
  const lines = new THREE.LineSegments(
    track(new THREE.BufferGeometry().setFromPoints(linePts)),
    track(new THREE.LineBasicMaterial({ color: CONFIG.colors.grid, transparent: true, opacity: 0.35 }))
  );
  lines.renderOrder = -1;
  world.add(lines);

  /* travelling lights */
  const travelers = [];
  const travMat = track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  const neighborsOf = (i) => edges.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
  for (let i = 0; i < pick(CONFIG.travelers); i++) {
    const s = new THREE.Sprite(travMat);
    s.scale.setScalar(0.6);
    world.add(s);
    const from = i % nodes.length;
    const opts = neighborsOf(from);
    travelers.push({ s, from, to: opts.length ? opts[i % opts.length] : from, t: (i * 0.37) % 1 });
  }

  /* orbiting cards (built once fonts are ready, so the text looks right) */
  const pivot = new THREE.Group();
  pivot.rotation.set(0.28, 0, -0.14);
  world.add(pivot);
  const cardMeshes = [];
  let disposed = false;
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 900))]).then(() => {
    if (disposed) return;
    const n = pick(CONFIG.cardCount);
    for (let i = 0; i < n; i++) {
      const { word, sub } = CONFIG.cards[i % CONFIG.cards.length];
      const mat = track(new THREE.MeshBasicMaterial({ map: track(cardTexture(word, sub)), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      const m = new THREE.Mesh(track(new THREE.PlaneGeometry(1.5, 0.94)), mat);
      m.userData = { a: (i / n) * Math.PI * 2, r: 2.5 + (i % 2) * 0.45, bob: i * 1.7 };
      m.renderOrder = 2;
      pivot.add(m);
      cardMeshes.push(m);
    }
    if (!running) draw(0);
  });

  /* pointer + scroll parallax */
  const look = new THREE.Vector3();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / innerHeight) * 2 - 1;
  };
  addEventListener('pointermove', onMove, { passive: true });
  let scrollK = 0;
  const onScroll = () => { scrollK = Math.min(1, Math.max(0, scrollY / Math.max(1, root.offsetHeight))); if (!running) draw(0); };
  addEventListener('scroll', onScroll, { passive: true });

  /* layout: scene on the right for wide screens, above the text on phones */
  function resize() {
    mobile = innerWidth < 760;
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pick(CONFIG.pixelRatioCap)));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = innerWidth >= 900;         // same breakpoint as the CSS
    if (wide) {                       // scene on the right, headline on the left
      camera.position.set(0, 2.1, 9);
      world.position.set(Math.min(4.7, camera.aspect * 2.8), 0.3, 0);
      world.scale.setScalar(Math.max(0.65, Math.min(0.9, camera.aspect / 1.9)));
    } else {                          // phones: scene above the text
      camera.position.set(0, 1.6, 9);
      world.position.set(0, 3.15, 0);
      world.scale.setScalar(Math.max(0.42, Math.min(0.62, camera.aspect * 1.2)));
    }
    camera.updateProjectionMatrix();
    if (!running) draw(0);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(root);

  /* per-frame update */
  let time = reduce ? 6 : 0;
  function draw(dt) {
    time += dt;
    const t = time;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const k = reduce ? 0 : CONFIG.parallax;

    orb.scale.setScalar(1 + 0.03 * Math.sin(t * 1.6));
    halo1.scale.setScalar(6 + 0.35 * Math.sin(t * 1.6));
    grid.position.z = (t * 0.35) % 1;                       // floor slowly drifts toward you

    cardMeshes.forEach((m) => {
      const u = m.userData, a = u.a + t * CONFIG.orbitSpeed;
      m.position.set(Math.cos(a) * u.r, Math.sin(a * 2 + u.bob) * 0.35 + Math.sin(t * 0.9 + u.bob) * 0.08, Math.sin(a) * u.r);
      m.lookAt(camera.position);
    });

    travelers.forEach((v) => {
      const A = nodes[v.from], B = nodes[v.to];
      v.t += dt * CONFIG.travelSpeed * (1.6 / Math.max(0.8, A.distanceTo(B)));
      if (v.t >= 1) {
        const arrived = v.to;
        nodeMeshes[arrived].scale.setScalar(1.9);            // little pulse on arrival
        const opts = neighborsOf(arrived).filter((i) => i !== v.from);
        v.from = arrived;
        const list = opts.length ? opts : neighborsOf(arrived);
        v.to = list[Math.floor((t * 7 + arrived) % list.length)];
        v.t = 0;
      }
      v.s.position.lerpVectors(A, B, v.t);
      v.s.position.y += Math.sin(Math.PI * v.t) * 0.55 + 0.1;
    });
    nodeMeshes.forEach((m) => m.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08));

    world.rotation.y = pointer.x * 0.16 * k * 2 + scrollK * 0.5 * k * 2;
    camera.position.x = pointer.x * 0.9 * k * 2;
    camera.position.y = (wide ? 2.1 : 1.6) - pointer.y * 0.5 * k * 2 - scrollK * 0.8 * k * 2;
    look.set(wide ? 0.5 : 0, wide ? -0.1 : 0.4, 0);
    camera.lookAt(look);
    renderer.render(scene, camera);
  }

  /* run only while visible: pauses on hidden tab and when scrolled away */
  let running = false, raf = 0, onScreen = true, last = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    draw(dt);
  }
  function start() {
    if (running || reduce || !onScreen || document.hidden) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen ? start() : stop(); });
  io.observe(root);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  resize();
  draw(0);
  root.classList.add('ready');      // fades the canvas in
  start();

  /* call this when the hero is removed (for example when the app changes screen) */
  return function dispose() {
    disposed = true;
    stop();
    io.disconnect(); ro.disconnect();
    removeEventListener('pointermove', onMove);
    removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVis);
    disposables.forEach((d) => d.dispose && d.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
