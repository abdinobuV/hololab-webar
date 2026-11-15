// ============================================================================
// HOLOLAB WebAR — Interactive 3D Hologram & AI Hand-Tracking Engine
// ============================================================================

const MODEL_METADATA = {
  solar: {
    category: 'ASTRONOMI & SAINS',
    code: 'SYS // 01',
    title: 'Tata Surya Interaktif',
    desc: 'Simulasi orbit heliosentris dengan Matahari bercahaya, Bumi & Bulan, Mars, serta cincin Saturnus. Putar, perbesar, atau bedah orbit secara real-time di ruang nyata Anda.',
    stat1: 'Matahari + 5 Orbit'
  },
  reactor: {
    category: 'ENERGI KUANTUM',
    code: 'ARC // 02',
    title: 'Reaktor Arc Mark-X',
    desc: 'Inti plasma magnetik berenergi tinggi dengan cincin akselerator koaksial dan partikel foton. Gunakan mode Explode untuk membedah lapisan koil.',
    stat1: '3.2 Gigajoule/s'
  },
  dna: {
    category: 'BIOTEKNOLOGI AR',
    code: 'BIO // 03',
    title: 'Heliks Ganda DNA',
    desc: 'Visualisasi molekul genomik 3D dengan pasangan basa nukleotida bercahaya (Adenin, Timin, Guanin, Sitosin) dan pemindai untai genetik.',
    stat1: '24 Pasang Basa'
  },
  drone: {
    category: 'ROBOTIKA & AEROSPACE',
    code: 'UAV // 04',
    title: 'Cyber-Drone Recon V4',
    desc: 'Unit drone otonom quad-rotor dengan proyektor pemindai laser volumetrik dan baling-baling levitasi magnetik.',
    stat1: '4 Rotor + Scanner'
  },
  tesseract: {
    category: 'GEOMETRI HIPERDIMENSI',
    code: 'DIM // 05',
    title: 'Tesseract 4D Hypercube',
    desc: 'Proyeksi ruang 4-dimensi ke dalam hologram 3D. Terdiri dari kubus luar, inti oktahedral, dan matriks partikel kuantum.',
    stat1: '8 Sel Hiperkubik'
  }
};

// --- State ---
const state = {
  currentModelKey: 'solar',
  arActive: false,
  handTrackingActive: false,
  explodeActive: false,
  explodeFactor: 0,
  wireframeActive: false,
  soundEnabled: true,
  targetScale: 1.0,
  currentScale: 1.0,
  animSpeed: 1.0,
  targetRotX: 0.25,
  targetRotY: 0.5,
  targetPosX: 0,
  targetPosY: 0,
  isDragging: false,
  prevMouse: { x: 0, y: 0 }
};

// --- Web Audio Sci-Fi Sound Synthesizer ---
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playTone(freq = 600, type = 'sine', duration = 0.12, vol = 0.08) {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }
  switchHologram() {
    this.playTone(420, 'triangle', 0.18, 0.1);
    setTimeout(() => this.playTone(840, 'sine', 0.22, 0.08), 70);
  }
  click() {
    this.playTone(720, 'sine', 0.08, 0.06);
  }
}

const sfx = new SoundFX();

// --- Three.js Scene Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.6, 6.2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xbae6fd, 0.75);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
dirLight1.position.set(5, 8, 6);
scene.add(dirLight1);

const dirLight2 = new THREE.PointLight(0xa855f7, 1.5, 20);
dirLight2.position.set(-5, -3, 4);
scene.add(dirLight2);

// --- Studio Hologram Pedestal Grid (Hidden in AR Camera Mode) ---
const studioEnvGroup = new THREE.Group();
const gridHelper = new THREE.GridHelper(16, 32, 0x38bdf8, 0x1e293b);
gridHelper.position.y = -2.1;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.45;
studioEnvGroup.add(gridHelper);

const baseRingGeo = new THREE.RingGeometry(1.6, 1.72, 64);
const baseRingMat = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.55
});
const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
baseRing.rotation.x = Math.PI / 2;
baseRing.position.y = -2.08;
studioEnvGroup.add(baseRing);
scene.add(studioEnvGroup);

// --- Master Hologram Anchor Group ---
const holoRoot = new THREE.Group();
scene.add(holoRoot);

let activeModelUpdate = null;
let expandableParts = [];

function registerExpandable(mesh, dirVector) {
  mesh.userData.basePos = mesh.position.clone();
  mesh.userData.expandDir = dirVector.clone();
  expandableParts.push(mesh);
}

// ============================================================================
// 5 PROCEDURAL 3D HOLOGRAM MODELS
// ============================================================================

function buildSolarSystem() {
  const group = new THREE.Group();

  // Glowing Sun
  const sunGeo = new THREE.SphereGeometry(0.75, 36, 36);
  const sunMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  group.add(sun);

  // Corona Glow Shell
  const coronaGeo = new THREE.SphereGeometry(0.92, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.22,
    wireframe: true
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  group.add(corona);
  registerExpandable(corona, new THREE.Vector3(0, 0.9, 0));

  const planetsData = [
    { name: 'Mercury', radius: 0.11, dist: 1.25, speed: 1.9, color: 0x94a3b8, yExp: 0.3 },
    { name: 'Venus', radius: 0.16, dist: 1.65, speed: 1.35, color: 0xfb923c, yExp: -0.3 },
    { name: 'Earth', radius: 0.2, dist: 2.15, speed: 1.0, color: 0x38bdf8, hasMoon: true, yExp: 0.5 },
    { name: 'Mars', radius: 0.15, dist: 2.65, speed: 0.78, color: 0xef4444, yExp: -0.5 },
    { name: 'Saturn', radius: 0.3, dist: 3.35, speed: 0.52, color: 0xeab308, hasRing: true, yExp: 0.8 }
  ];

  const pivots = [];

  planetsData.forEach((p, idx) => {
    // Orbit track ring
    const trackGeo = new THREE.RingGeometry(p.dist - 0.012, p.dist + 0.012, 96);
    const trackMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = Math.PI / 2;
    group.add(track);
    registerExpandable(track, new THREE.Vector3(0, p.yExp, 0));

    // Orbit pivot
    const pivot = new THREE.Group();
    pivot.rotation.y = idx * 1.2;
    group.add(pivot);
    registerExpandable(pivot, new THREE.Vector3(0, p.yExp, 0));

    const pGeo = new THREE.SphereGeometry(p.radius, 28, 28);
    const pMat = new THREE.MeshStandardMaterial({
      color: p.color,
      roughness: 0.35,
      metalness: 0.2
    });
    const planetMesh = new THREE.Mesh(pGeo, pMat);
    planetMesh.position.x = p.dist;
    pivot.add(planetMesh);

    if (p.hasMoon) {
      const moonPivot = new THREE.Group();
      planetMesh.add(moonPivot);
      const moonGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.x = 0.36;
      moonPivot.add(moon);
      pivot.userData.moonPivot = moonPivot;
    }

    if (p.hasRing) {
      const sRingGeo = new THREE.RingGeometry(p.radius * 1.35, p.radius * 2.1, 48);
      const sRingMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const sRing = new THREE.Mesh(sRingGeo, sRingMat);
      sRing.rotation.x = Math.PI / 2.4;
      planetMesh.add(sRing);
    }

    pivots.push({ pivot, speed: p.speed, planetMesh });
  });

  // Asteroid particles
  const astGeo = new THREE.BufferGeometry();
  const astCount = 260;
  const positions = new Float32Array(astCount * 3);
  for (let i = 0; i < astCount; i++) {
    const angle = (i / astCount) * Math.PI * 2;
    const r = 2.95 + (Math.random() - 0.5) * 0.22;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }
  astGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const astMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.04, transparent: true, opacity: 0.8 });
  const asteroidBelt = new THREE.Points(astGeo, astMat);
  group.add(asteroidBelt);

  return {
    group,
    update: (dt) => {
      sun.rotation.y += dt * 0.4;
      corona.rotation.y -= dt * 0.6;
      corona.rotation.z += dt * 0.3;
      asteroidBelt.rotation.y += dt * 0.25;
      pivots.forEach((item) => {
        item.pivot.rotation.y += dt * item.speed;
        item.planetMesh.rotation.y += dt * 1.5;
        if (item.pivot.userData.moonPivot) {
          item.pivot.userData.moonPivot.rotation.y += dt * 3.2;
        }
      });
    }
  };
}

function buildArcReactor() {
  const group = new THREE.Group();

  // Inner Plasma Core
  const coreGeo = new THREE.IcosahedronGeometry(0.65, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.1,
    wireframe: true
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner solid sphere
  const innerGeo = new THREE.SphereGeometry(0.45, 32, 32);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.9
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerSphere);

  // Coaxial Rings
  const ring1Geo = new THREE.TorusGeometry(1.15, 0.08, 24, 96);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x0369a1,
    emissiveIntensity: 0.5
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  group.add(ring1);
  registerExpandable(ring1, new THREE.Vector3(0, 0, 0.9));

  const ring2Geo = new THREE.TorusGeometry(1.55, 0.06, 20, 96);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    metalness: 0.7,
    roughness: 0.25,
    emissive: 0x6b21a8,
    emissiveIntensity: 0.5
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 3;
  group.add(ring2);
  registerExpandable(ring2, new THREE.Vector3(0, 0.7, -0.7));

  // 8 Copper/Cyan Inductor Segments around the outer perimeter
  const coilGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const boxGeo = new THREE.BoxGeometry(0.32, 0.22, 0.28);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.75,
      roughness: 0.25
    });
    const coil = new THREE.Mesh(boxGeo, boxMat);
    const r = 1.85;
    coil.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    coil.rotation.z = angle;
    coilGroup.add(coil);
    registerExpandable(coil, new THREE.Vector3(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0));
  }
  group.add(coilGroup);

  return {
    group,
    update: (dt, elapsed) => {
      core.rotation.x += dt * 1.2;
      core.rotation.y += dt * 1.6;
      const pulse = 1 + Math.sin(elapsed * 4) * 0.08;
      innerSphere.scale.set(pulse, pulse, pulse);
      ring1.rotation.z -= dt * 0.8;
      ring2.rotation.y += dt * 1.1;
      coilGroup.rotation.z += dt * 0.35;
    }
  };
}

function buildDNAHelix() {
  const group = new THREE.Group();
  const numPairs = 22;
  const height = 4.2;
  const radius = 0.85;
  const turns = 2.2;

  const strandMat1 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6
  });
  const strandMat2 = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.6
  });

  for (let i = 0; i < numPairs; i++) {
    const t = i / (numPairs - 1);
    const y = (t - 0.5) * height;
    const angle = t * Math.PI * 2 * turns;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    // Nodes
    const nodeGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const n1 = new THREE.Mesh(nodeGeo, strandMat1);
    n1.position.set(x1, y, z1);
    group.add(n1);
    registerExpandable(n1, new THREE.Vector3(x1 * 0.8, 0, z1 * 0.8));

    const n2 = new THREE.Mesh(nodeGeo, strandMat2);
    n2.position.set(x2, y, z2);
    group.add(n2);
    registerExpandable(n2, new THREE.Vector3(x2 * 0.8, 0, z2 * 0.8));

    // Base pair connector rung
    const rungGeo = new THREE.CylinderGeometry(0.035, 0.035, radius * 2, 12);
    const rungColor = i % 2 === 0 ? 0x10b981 : 0xf59e0b;
    const rungMat = new THREE.MeshStandardMaterial({
      color: rungColor,
      emissive: rungColor,
      emissiveIntensity: 0.35
    });
    const rung = new THREE.Mesh(rungGeo, rungMat);
    rung.position.set(0, y, 0);
    rung.rotation.z = Math.PI / 2;
    rung.rotation.y = -angle;
    group.add(rung);
    registerExpandable(rung, new THREE.Vector3(0, (t - 0.5) * 1.1, 0));
  }

  // Scanner Ring moving up and down
  const scanGeo = new THREE.TorusGeometry(1.35, 0.025, 16, 64);
  const scanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const scannerRing = new THREE.Mesh(scanGeo, scanMat);
  scannerRing.rotation.x = Math.PI / 2;
  group.add(scannerRing);

  return {
    group,
    update: (dt, elapsed) => {
      group.rotation.y += dt * 0.85;
      scannerRing.position.y = Math.sin(elapsed * 2.2) * 1.9;
    }
  };
}

function buildCyberDrone() {
  const group = new THREE.Group();

  // Central Chassis
  const bodyGeo = new THREE.OctahedronGeometry(0.75, 1);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0x0f172a
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1.2, 0.55, 1.2);
  group.add(body);

  // Glowing Core Eye
  const eyeGeo = new THREE.SphereGeometry(0.28, 24, 24);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.2
  });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(0, 0.1, 0.65);
  group.add(eye);
  registerExpandable(eye, new THREE.Vector3(0, 0.2, 0.7));

  // 4 Rotor Arms + Spinning Blades
  const rotors = [];
  const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

  armAngles.forEach((ang) => {
    const armGroup = new THREE.Group();
    const rx = Math.cos(ang) * 1.45;
    const rz = Math.sin(ang) * 1.45;

    const strutGeo = new THREE.BoxGeometry(1.4, 0.08, 0.14);
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
    const strut = new THREE.Mesh(strutGeo, strutMat);
    strut.position.set(rx * 0.5, 0, rz * 0.5);
    strut.rotation.y = -ang;
    armGroup.add(strut);

    // Rotor housing ring
    const shroudGeo = new THREE.TorusGeometry(0.48, 0.04, 16, 48);
    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5
    });
    const shroud = new THREE.Mesh(shroudGeo, shroudMat);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(rx, 0.08, rz);
    armGroup.add(shroud);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.82, 0.02, 0.09);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(rx, 0.1, rz);
    armGroup.add(blade);
    rotors.push(blade);

    group.add(armGroup);
    registerExpandable(armGroup, new THREE.Vector3(Math.cos(ang) * 0.85, 0.3, Math.sin(ang) * 0.85));
  });

  // Laser Scan Cone underneath
  const coneGeo = new THREE.ConeGeometry(1.1, 1.8, 32, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const scanCone = new THREE.Mesh(coneGeo, coneMat);
  scanCone.position.y = -1.05;
  group.add(scanCone);
  registerExpandable(scanCone, new THREE.Vector3(0, -0.7, 0));

  return {
    group,
    update: (dt, elapsed) => {
      group.position.y = Math.sin(elapsed * 2.6) * 0.14;
      scanCone.rotation.y -= dt * 1.2;
      rotors.forEach((b) => {
        b.rotation.y += dt * 18;
      });
    }
  };
}

function buildTesseract() {
  const group = new THREE.Group();

  // Outer Hypercube Wireframe
  const outerBoxGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
  const outerEdges = new THREE.EdgesGeometry(outerBoxGeo);
  const outerLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
  const outerCube = new THREE.LineSegments(outerEdges, outerLineMat);
  group.add(outerCube);

  // Semi-transparent glass panels
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
    roughness: 0.1
  });
  const glassCube = new THREE.Mesh(outerBoxGeo, glassMat);
  group.add(glassCube);
  registerExpandable(glassCube, new THREE.Vector3(0, 0.65, 0));

  // Inner Hypercube
  const innerBoxGeo = new THREE.BoxGeometry(1.05, 1.05, 1.05);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.7,
    wireframe: true
  });
  const innerCube = new THREE.Mesh(innerBoxGeo, innerMat);
  group.add(innerCube);

  // Core Quantum Singularity
  const coreGeo = new THREE.OctahedronGeometry(0.45, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // 8 Corner Anchor Nodes
  const corners = [-1.05, 1.05];
  corners.forEach((x) => {
    corners.forEach((y) => {
      corners.forEach((z) => {
        const nodeGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(x, y, z);
        group.add(node);
        registerExpandable(node, new THREE.Vector3(x * 0.6, y * 0.6, z * 0.6));
      });
    });
  });

  return {
    group,
    update: (dt) => {
      outerCube.rotation.x += dt * 0.45;
      outerCube.rotation.y += dt * 0.65;
      glassCube.rotation.copy(outerCube.rotation);
      innerCube.rotation.x -= dt * 0.9;
      innerCube.rotation.z += dt * 0.8;
      core.rotation.y += dt * 1.8;
    }
  };
}

// --- Load Selected Hologram ---
function loadModel(key) {
  state.currentModelKey = key;
  expandableParts = [];

  while (holoRoot.children.length > 0) {
    holoRoot.remove(holoRoot.children[0]);
  }

  let built;
  switch (key) {
    case 'reactor': built = buildArcReactor(); break;
    case 'dna': built = buildDNAHelix(); break;
    case 'drone': built = buildCyberDrone(); break;
    case 'tesseract': built = buildTesseract(); break;
    case 'solar':
    default:
      built = buildSolarSystem();
      break;
  }

  holoRoot.add(built.group);
  activeModelUpdate = built.update;

  if (state.wireframeActive) {
    applyWireframe(true);
  }

  // Update UI Telemetry
  const meta = MODEL_METADATA[key];
  document.getElementById('model-category').textContent = meta.category;
  document.getElementById('model-code').textContent = meta.code;
  document.getElementById('model-title').textContent = meta.title;
  document.getElementById('model-desc').textContent = meta.desc;
  document.getElementById('stat-1').textContent = meta.stat1;

  sfx.switchHologram();
}

function applyWireframe(enabled) {
  holoRoot.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      obj.material.wireframe = enabled;
    }
  });
  document.getElementById('stat-render').textContent = enabled ? 'X-Ray Wireframe' : 'Solid Hologram';
}

// ============================================================================
// WEBCAM AR & AI HAND TRACKING (MediaPipe Hands)
// ============================================================================

const videoEl = document.getElementById('webcam-video');
const hudCanvas = document.getElementById('hud-canvas');
const hudCtx = hudCanvas.getContext('2d');
let mediaStream = null;
let handsDetector = null;
let mpCamera = null;

function resizeHudCanvas() {
  hudCanvas.width = window.innerWidth;
  hudCanvas.height = window.innerHeight;
}
resizeHudCanvas();

async function toggleARCamera() {
  const btn = document.getElementById('btn-toggle-ar');
  const statusText = document.getElementById('status-text');

  if (!state.arActive) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoEl.srcObject = mediaStream;
      await videoEl.play();

      state.arActive = true;
      document.body.classList.add('ar-active');
      studioEnvGroup.visible = false;
      btn.classList.add('active-cam');
      btn.querySelector('span').textContent = 'Kamera AR: AKTIF';
      statusText.textContent = 'Mode: Live WebAR Camera — Klik layar untuk pindah posisi objek';
      sfx.switchHologram();
    } catch (err) {
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera (Camera Permission) telah diberikan di browser Anda.\n\nDetail: ' + err.message);
    }
  } else {
    if (state.handTrackingActive) {
      toggleHandTracking(); // Turn off hand tracking too
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    videoEl.srcObject = null;
    state.arActive = false;
    document.body.classList.remove('ar-active');
    studioEnvGroup.visible = true;
    btn.classList.remove('active-cam');
    btn.querySelector('span').textContent = 'Aktifkan Kamera AR';
    statusText.textContent = 'Mode: 3D Hologram Studio';
    sfx.click();
  }
}

async function toggleHandTracking() {
  const btnHand = document.getElementById('btn-toggle-hand');
  const toast = document.getElementById('gesture-toast');
  const statGesture = document.getElementById('stat-gesture');

  if (!state.handTrackingActive) {
    // Ensure camera is active first
    if (!state.arActive) {
      await toggleARCamera();
      if (!state.arActive) return;
    }

    if (typeof Hands === 'undefined') {
      alert('Modul AI MediaPipe Hands sedang dimuat atau tidak tersedia.');
      return;
    }

    state.handTrackingActive = true;
    btnHand.classList.add('active-hand');
    btnHand.querySelector('span').textContent = 'AI Hand Control: ON';
    toast.classList.remove('hidden');
    statGesture.textContent = 'Scanning...';
    sfx.switchHologram();

    if (!handsDetector) {
      handsDetector = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      handsDetector.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });
      handsDetector.onResults(onHandResults);
    }

    runHandDetectionLoop();
  } else {
    state.handTrackingActive = false;
    btnHand.classList.remove('active-hand');
    btnHand.querySelector('span').textContent = 'AI Hand Control: OFF';
    toast.classList.add('hidden');
    statGesture.textContent = 'Standby';
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    sfx.click();
  }
}

async function runHandDetectionLoop() {
  while (state.handTrackingActive && state.arActive) {
    if (videoEl.readyState >= 2) {
      try {
        await handsDetector.send({ image: videoEl });
      } catch (_) {}
    }
    await new Promise((r) => requestAnimationFrame(r));
  }
}

function onHandResults(results) {
  hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
  const statGesture = document.getElementById('stat-gesture');
  const gestureName = document.getElementById('gesture-name');
  const gestureIcon = document.getElementById('gesture-icon');

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    statGesture.textContent = 'Mencari Tangan...';
    return;
  }

  const lm = results.multiHandLandmarks[0];
  const w = hudCanvas.width;
  const h = hudCanvas.height;

  // Draw Futuristic Hand Skeleton (Mirrored X)
  hudCtx.save();
  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  hudCtx.lineWidth = 2.5;

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
  ];

  connections.forEach(([a, b]) => {
    hudCtx.beginPath();
    hudCtx.moveTo((1 - lm[a].x) * w, lm[a].y * h);
    hudCtx.lineTo((1 - lm[b].x) * w, lm[b].y * h);
    hudCtx.stroke();
  });

  lm.forEach((pt, idx) => {
    const px = (1 - pt.x) * w;
    const py = pt.y * h;
    hudCtx.beginPath();
    hudCtx.arc(px, py, idx === 4 || idx === 8 ? 7 : 4, 0, Math.PI * 2);
    hudCtx.fillStyle = idx === 4 || idx === 8 ? '#a855f7' : '#38bdf8';
    hudCtx.fill();
  });

  // Palm center (Landmark 9) controls rotation & subtle position
  const palmX = 1 - lm[9].x; // 0..1 left to right
  const palmY = lm[9].y;     // 0..1 top to bottom

  state.targetRotY = (palmX - 0.5) * Math.PI * 2.2;
  state.targetRotX = (palmY - 0.5) * Math.PI * 1.2;

  // Pinch Distance (Thumb Tip 4 to Index Tip 8)
  const dx = lm[4].x - lm[8].x;
  const dy = lm[4].y - lm[8].y;
  const pinchDist = Math.hypot(dx, dy);

  // Draw Pinch Energy Line
  const tx = (1 - lm[4].x) * w;
  const ty = lm[4].y * h;
  const ix = (1 - lm[8].x) * w;
  const iy = lm[8].y * h;
  hudCtx.beginPath();
  hudCtx.setLineDash([4, 4]);
  hudCtx.strokeStyle = '#c084fc';
  hudCtx.moveTo(tx, ty);
  hudCtx.lineTo(ix, iy);
  hudCtx.stroke();
  hudCtx.restore();

  // Check if Fist (Fingertips 12, 16, 20 close to wrist 0)
  const wrist = lm[0];
  const midTipDist = Math.hypot(lm[12].x - wrist.x, lm[12].y - wrist.y);
  const ringTipDist = Math.hypot(lm[16].x - wrist.x, lm[16].y - wrist.y);

  if (midTipDist < 0.22 && ringTipDist < 0.22) {
    state.explodeActive = true;
    document.getElementById('btn-explode').classList.add('active');
    statGesture.textContent = '✊ Fist (Explode)';
    gestureIcon.textContent = '✊';
    gestureName.textContent = 'Mode Explode Aktif';
  } else {
    state.explodeActive = false;
    document.getElementById('btn-explode').classList.remove('active');
    // Map pinch distance (0.03 .. 0.28) to scale (0.55 .. 2.2)
    const mappedScale = Math.min(2.3, Math.max(0.5, (pinchDist - 0.02) * 7.5));
    state.targetScale = mappedScale;
    document.getElementById('scale-slider').value = mappedScale.toFixed(2);
    statGesture.textContent = `🤏 Skala ${mappedScale.toFixed(1)}x`;
    gestureIcon.textContent = '🖐️';
    gestureName.textContent = 'Tangan Terkunci pada Hologram';
  }
}

// ============================================================================
// MOUSE / TOUCH INTERACTION & AR SNAPSHOT
// ============================================================================

container.addEventListener('pointerdown', (e) => {
  state.isDragging = true;
  state.prevMouse.x = e.clientX;
  state.prevMouse.y = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!state.isDragging) return;
  const dx = e.clientX - state.prevMouse.x;
  const dy = e.clientY - state.prevMouse.y;
  state.targetRotY += dx * 0.008;
  state.targetRotX = Math.max(-1.2, Math.min(1.2, state.targetRotX + dy * 0.008));
  state.prevMouse.x = e.clientX;
  state.prevMouse.y = e.clientY;
});

window.addEventListener('pointerup', () => {
  state.isDragging = false;
});

container.addEventListener('dblclick', (e) => {
  // Double-click anywhere on screen to move hologram anchor there!
  const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
  state.targetPosX = ndcX * 2.4;
  state.targetPosY = ndcY * 1.5;
  sfx.click();
});

container.addEventListener('wheel', (e) => {
  e.preventDefault();
  state.targetScale = Math.min(2.5, Math.max(0.4, state.targetScale - e.deltaY * 0.001));
  document.getElementById('scale-slider').value = state.targetScale;
}, { passive: false });

// --- UI Controls ---
document.getElementById('btn-toggle-ar').addEventListener('click', toggleARCamera);
document.getElementById('btn-toggle-hand').addEventListener('click', toggleHandTracking);

document.getElementById('scale-slider').addEventListener('input', (e) => {
  state.targetScale = parseFloat(e.target.value);
});

document.getElementById('speed-slider').addEventListener('input', (e) => {
  state.animSpeed = parseFloat(e.target.value);
});

document.getElementById('btn-explode').addEventListener('click', (e) => {
  state.explodeActive = !state.explodeActive;
  e.currentTarget.classList.toggle('active', state.explodeActive);
  sfx.click();
});

document.getElementById('btn-wireframe').addEventListener('click', (e) => {
  state.wireframeActive = !state.wireframeActive;
  e.currentTarget.classList.toggle('active', state.wireframeActive);
  applyWireframe(state.wireframeActive);
  sfx.click();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  state.targetPosX = 0;
  state.targetPosY = 0;
  state.targetRotX = 0.25;
  state.targetRotY = 0.5;
  state.targetScale = 1.0;
  document.getElementById('scale-slider').value = 1.0;
  sfx.click();
});

document.getElementById('btn-sound').addEventListener('click', (e) => {
  state.soundEnabled = !state.soundEnabled;
  e.currentTarget.classList.toggle('active', state.soundEnabled);
  e.currentTarget.querySelector('span').textContent = state.soundEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
  if (state.soundEnabled) sfx.click();
});

// Dock Model Switcher
document.querySelectorAll('.dock-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dock-item').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    loadModel(btn.dataset.model);
  });
});

// Help Modal
const helpModal = document.getElementById('help-modal');
document.getElementById('btn-help').addEventListener('click', () => {
  helpModal.classList.remove('hidden');
  sfx.click();
});
document.getElementById('btn-close-help').addEventListener('click', () => {
  helpModal.classList.add('hidden');
});

// Composite AR Snapshot Capture
document.getElementById('btn-snapshot').addEventListener('click', () => {
  sfx.switchHologram();
  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = window.innerWidth;
  snapCanvas.height = window.innerHeight;
  const ctx = snapCanvas.getContext('2d');

  if (state.arActive && videoEl.readyState >= 2) {
    ctx.save();
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoEl, 0, 0, snapCanvas.width, snapCanvas.height);
    ctx.restore();
  } else {
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);
  }

  // Draw Three.js Hologram
  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, 0, 0, snapCanvas.width, snapCanvas.height);

  // Draw HUD Skeleton
  ctx.drawImage(hudCanvas, 0, 0, snapCanvas.width, snapCanvas.height);

  // Watermark Badge
  ctx.fillStyle = 'rgba(10, 16, 34, 0.78)';
  ctx.fillRect(24, snapCanvas.height - 64, 310, 40);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px Orbitron, sans-serif';
  ctx.fillText('HOLOLAB WebAR // ' + MODEL_METADATA[state.currentModelKey].title, 38, snapCanvas.height - 39);

  const link = document.createElement('a');
  link.download = `HoloLab-AR-${state.currentModelKey}-${Date.now()}.png`;
  link.href = snapCanvas.toDataURL('image/png');
  link.click();
});

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeHudCanvas();
});

// ============================================================================
// MAIN RENDER & ANIMATION LOOP
// ============================================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta() * state.animSpeed;
  const elapsed = clock.getElapsedTime();

  // Smooth interpolation for scale, rotation, and position
  state.currentScale += (state.targetScale - state.currentScale) * 0.12;
  holoRoot.scale.setScalar(state.currentScale);
  document.getElementById('stat-scale').textContent = state.currentScale.toFixed(2) + 'x';

  if (!state.isDragging && !state.handTrackingActive) {
    state.targetRotY += dt * 0.22;
  }

  holoRoot.rotation.x += (state.targetRotX - holoRoot.rotation.x) * 0.12;
  holoRoot.rotation.y += (state.targetRotY - holoRoot.rotation.y) * 0.12;
  holoRoot.position.x += (state.targetPosX - holoRoot.position.x) * 0.12;
  holoRoot.position.y += (state.targetPosY - holoRoot.position.y) * 0.12;

  // Smooth Explode View transition
  const targetExplode = state.explodeActive ? 1.0 : 0.0;
  state.explodeFactor += (targetExplode - state.explodeFactor) * 0.1;

  expandableParts.forEach((mesh) => {
    const base = mesh.userData.basePos;
    const dir = mesh.userData.expandDir;
    mesh.position.set(
      base.x + dir.x * state.explodeFactor,
      base.y + dir.y * state.explodeFactor,
      base.z + dir.z * state.explodeFactor
    );
  });

  if (activeModelUpdate) {
    activeModelUpdate(dt, elapsed);
  }

  // Rotate studio base ring slowly
  baseRing.rotation.z += dt * 0.3;

  renderer.render(scene, camera);
}

// Initialize First Model & Start Loop
loadModel('solar');
animate();
