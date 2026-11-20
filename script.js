/* ============================================================================
   SCRIPT.JS — NetGO WebAR (Game Edukasi TJKT Kelas X ala Pokemon GO AR)
   Fitur:
   1. Live Camera AR (Kamera Belakang/Depan) + Efek Paralaks Gyroscope HP
   2. 4 Objek 3D Interaktif (Router, Switch, UTP & RJ-45, Topologi Star)
      + dukungan auto-loader file .glb dari folder assets/models/
   3. Kartu Penjelasan Materi Live langsung tampil saat kamera aktif & berubah
      otomatis ketika bagian 3D disentuh (Raycasting)
   4. Mekanik Lempar Net-Ball 3D (Ala Pokéball) + Efek Partikel + Kuis Tangkap
      + Net-Dex (0/4) & Skor XP + Efek Suara Sci-Fi (Web Audio API)
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // KONFIGURASI MODEL 3D KUSTOM (.GLB / .GLTF)
  // Jika Anda menaruh file .glb di assets/models/, aplikasi otomatis memuatnya.
  // Jika belum ada, aplikasi menampilkan model 3D interaktif bawaan Three.js.
  // --------------------------------------------------------------------------
  const CUSTOM_GLB_PATHS = {
    router: 'assets/models/router.glb',
    switch: 'assets/models/switch.glb',
    utp: 'assets/models/utp-rj45.glb'
  };

  // --------------------------------------------------------------------------
  // DATA MATERI LIVE & KUIS TANGKAP UNTUK SETIAP OBJEK (KELAS X TJKT/TKJ)
  // --------------------------------------------------------------------------
  const OBJECT_DATA = {
    router: {
      tag: 'TOPIK 1 • PERANGKAT JARINGAN',
      title: '📡 Router Jaringan (IP Routing)',
      desc: 'Router menghubungkan dua atau lebih jaringan yang berbeda dan mengatur jalur pengiriman paket data (IP). Perhatikan Port WAN (Biru) untuk jalur ke Internet/ISP dan Port LAN (Kuning) untuk jaringan lokal.',
      tip: '👆 Tap Port WAN (Biru) atau Port LAN (Kuning) pada objek 3D, lalu tekan TANGKAP!',
      topicTab: 'topik1',
      quiz: {
        question: 'Apa perbedaan utama Port WAN (biru) dan Port LAN (kuning) pada sebuah Router?',
        options: [
          'Port WAN menghubungkan ke jaringan luar/ISP, sedangkan Port LAN menghubungkan perangkat jaringan lokal',
          'Port WAN hanya untuk printer, sedangkan Port LAN hanya untuk kabel listrik',
          'Port WAN dan Port LAN memiliki fungsi yang sama persis untuk Wi-Fi saja'
        ],
        answerIndex: 0,
        explanation: 'Tepat! Port WAN (Wide Area Network) terhubung ke jaringan luar/ISP, sedangkan Port LAN (Local Area Network) ke perangkat lokal (Switch/PC).'
      }
    },
    switch: {
      tag: 'TOPIK 1 • PERANGKAT JARINGAN',
      title: '🔀 Switch 8-Port (LAN)',
      desc: 'Switch menghubungkan perangkat dalam satu jaringan lokal (LAN) dan meneruskan data secara spesifik ke perangkat tujuan berdasarkan MAC Address.',
      tip: '👆 Tap bodi Switch untuk melihat simulasi pengiriman data via MAC Address!',
      topicTab: 'topik1',
      quiz: {
        question: 'Alamat apa yang digunakan Switch untuk meneruskan data secara spesifik ke perangkat tujuan di jaringan lokal (LAN)?',
        options: [
          'Alamat Email pengguna',
          'MAC Address (alamat fisik kartu jaringan)',
          'Nomor seri monitor komputer'
        ],
        answerIndex: 1,
        explanation: 'Benar! Switch menyimpan tabel MAC Address agar paket data hanya dikirim ke port perangkat tujuan secara spesifik.'
      }
    },
    utp: {
      tag: 'TOPIK 1 • MEDIA TRANSMISI',
      title: '🔌 Kabel UTP & Konektor RJ-45',
      desc: 'Kabel UTP (Unshielded Twisted Pair) adalah kabel tembaga berpasangan terpilin (4 pasang / 8 kabel) yang dipasangi konektor RJ-45 di ujungnya untuk menghubungkan perangkat jaringan lokal.',
      tip: '👆 Tap kabel UTP atau tekan "Bedah UTP" untuk melihat 4 pasang pilinan tembaga & pin emas RJ-45!',
      topicTab: 'topik1',
      quiz: {
        question: 'Mengapa kabel tembaga di dalam kabel UTP dibuat berpasangan dan saling terpilin (Twisted Pair)?',
        options: [
          'Agar warna kabel terlihat lebih menarik saja',
          'Untuk mengurangi gangguan interferensi sinyal elektromagnetik saat transmisi data',
          'Supaya kabel tidak bisa dipasangi konektor RJ-45'
        ],
        answerIndex: 1,
        explanation: 'Mantap! Pilinan berpasangan pada kabel UTP berfungsi meredam interferensi/noise elektromagnetik selama pengiriman data.'
      }
    },
    star: {
      tag: 'TOPIK 2 • TOPOLOGI STAR (BINTANG)',
      title: '⭐ Topologi Star (Bintang)',
      desc: 'Seluruh perangkat klien (PC-1, PC-2, Laptop, Printer) terhubung terpusat ke satu Switch. Jika 1 kabel klien putus, klien lain tetap jalan; namun jika Switch pusat rusak, seluruh jaringan terganggu.',
      tip: '👆 Tap kabel PC-1 (merah = putus) atau Switch Pusat, atau gunakan tombol simulasi di bawah!',
      topicTab: 'topik2',
      quiz: {
        question: 'Pada Topologi Star, apa yang terjadi jika SATU kabel klien (misal PC-1) putus, sementara Switch pusat tetap normal?',
        options: [
          'Seluruh komputer di ruangan ikut mati total',
          'Hanya PC-1 yang terputus; klien lainnya (PC-2, Laptop, Printer) tetap dapat berkomunikasi',
          'Router ISP otomatis berubah menjadi Printer'
        ],
        answerIndex: 1,
        explanation: 'Benar! Itu keunggulan Topologi Star: gangguan 1 kabel klien terisolasi. Namun jika Switch pusat bermasalah, barulah seluruh jaringan terganggu.'
      }
    }
  };

  // State Aplikasi
  const state = {
    started: false,
    cameraActive: false,
    facingMode: 'environment', // Default kamera belakang di HP Android
    currentTarget: 'router',
    caughtSet: new Set(),
    xp: 0,
    targetRotX: 0.22,
    targetRotY: 0.45,
    targetScale: 1.0,
    gyroOffsetX: 0,
    gyroOffsetY: 0,
    isDragging: false,
    pointerDownPos: { x: 0, y: 0 },
    prevPointer: { x: 0, y: 0 },
    utpExploded: false,
    starMode: 'normal', // 'normal' | 'cable-cut' | 'switch-down'
    ballFlying: false,
    ballProgress: 0,
    wobbleTimer: 0
  };

  // --------------------------------------------------------------------------
  // EFEK SUARA SCI-FI RINGAN (WEB AUDIO API — TANPA FILE MP3 EKSTERNAL)
  // --------------------------------------------------------------------------
  class SoundFX {
    constructor() {
      this.ctx = null;
    }
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
    tone(freq, endFreq, dur = 0.14, type = 'sine', vol = 0.08) {
      try {
        this.ensure();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + dur);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
      } catch (_) {}
    }
    tap() { this.tone(540, 880, 0.1, 'triangle', 0.07); }
    throwBall() { this.tone(320, 920, 0.28, 'sine', 0.09); }
    hit() { this.tone(760, 260, 0.22, 'sawtooth', 0.08); }
    catchSuccess() {
      this.tone(523, 659, 0.14, 'triangle', 0.09);
      setTimeout(() => this.tone(659, 784, 0.14, 'triangle', 0.09), 110);
      setTimeout(() => this.tone(784, 1046, 0.28, 'triangle', 0.1), 220);
    }
    wrong() { this.tone(240, 150, 0.24, 'sawtooth', 0.07); }
  }
  const sfx = new SoundFX();

  // --------------------------------------------------------------------------
  // REFERENSI ELEMEN DOM
  // --------------------------------------------------------------------------
  const videoEl = document.getElementById('camera-feed');
  const canvasContainer = document.getElementById('ar-canvas-container');
  const flashOverlay = document.getElementById('flash-overlay');

  const startScreen = document.getElementById('start-screen');
  const hudTop = document.getElementById('hud-top');
  const hudBottom = document.getElementById('hud-bottom');
  const interactionToast = document.getElementById('interaction-toast');
  const toastContentWrap = document.getElementById('toast-content-wrap');
  const btnToggleLiveInfo = document.getElementById('btn-toggle-live-info');

  const toastTag = document.getElementById('toast-tag');
  const toastCaughtBadge = document.getElementById('toast-caught-badge');
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-body');
  const toastTip = document.getElementById('toast-tip');

  const caughtCountEl = document.getElementById('caught-count');
  const xpDisplayEl = document.getElementById('xp-display');
  const specialActionsEl = document.getElementById('special-actions');

  const quizModal = document.getElementById('quiz-modal');
  const quizTitle = document.getElementById('quiz-title');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizFeedback = document.getElementById('quiz-feedback');

  const materiDrawer = document.getElementById('materi-drawer');
  let mediaStream = null;

  // --------------------------------------------------------------------------
  // SETUP THREE.JS SCENE (RINGAN & TRANSPARAN DI ATAS KAMERA)
  // --------------------------------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.45, 4.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  // Pencahayaan cerah agar objek terlihat tajam di atas latar kamera
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
  dirLight.position.set(4, 7, 5);
  scene.add(dirLight);
  const accentLight = new THREE.PointLight(0x38bdf8, 1.2, 15);
  accentLight.position.set(-4, 2, 3);
  scene.add(accentLight);

  // Grid studio tipis (hanya muncul jika mode tanpa kamera)
  const studioGrid = new THREE.GridHelper(12, 20, 0x38bdf8, 0x1e293b);
  studioGrid.position.y = -1.3;
  studioGrid.material.transparent = true;
  studioGrid.material.opacity = 0.35;
  scene.add(studioGrid);

  // Grup Utama Objek AR yang melayang di depan kamera
  const arObjectRoot = new THREE.Group();
  scene.add(arObjectRoot);

  // Cincin Target ala Pokemon GO di bawah objek 3D
  const ringGeo = new THREE.RingGeometry(1.18, 1.27, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65
  });
  const targetRing = new THREE.Mesh(ringGeo, ringMat);
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.y = -0.82;
  arObjectRoot.add(targetRing);

  // Tempat model aktif
  const activeModelHolder = new THREE.Group();
  arObjectRoot.add(activeModelHolder);

  // Helper membuat label teks 3D (Canvas Sprite) agar tajam & terbaca di HP
  function makeLabelSprite(text, bgColor = 'rgba(15,23,42,0.85)', textColor = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(12, 14, 488, 100, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 66);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.55, 0.39, 1);
    return sprite;
  }

  // ==========================================================================
  // PEMBUATAN 4 OBJEK 3D INTERAKTIF (DENGAN TAG INTERAKSI UNTUK RAYCASTING)
  // ==========================================================================
  let currentAnimFn = null;
  let interactiveMeshes = [];
  let modelRefs = {};

  function tagInteractive(mesh, partId) {
    mesh.userData.partId = partId;
    interactiveMeshes.push(mesh);
  }

  // --- 1. MODEL 3D: ROUTER (PORT WAN BIRU & PORT LAN KUNING) ---
  function createRouterModel() {
    const group = new THREE.Group();
    const refs = { packets: [] };

    // Bodi Router
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.36, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.45 })
    );
    tagInteractive(body, 'router-body');
    group.add(body);

    const topAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.62, 0.03, 0.96),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
    );
    topAccent.position.y = 0.19;
    group.add(topAccent);

    // 2 Antena Wi-Fi
    [-0.65, 0.65].forEach((x, idx) => {
      const ant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.055, 1.15, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
      );
      ant.position.set(x, 0.65, -0.4);
      ant.rotation.z = idx === 0 ? 0.12 : -0.12;
      tagInteractive(ant, 'router-antenna');
      group.add(ant);

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 })
      );
      tip.position.set(x + (idx === 0 ? -0.07 : 0.07), 1.22, -0.4);
      group.add(tip);
    });

    // PORT WAN (BIRU - Ke ISP / Internet)
    const wanPort = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.16, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.6 })
    );
    wanPort.position.set(-0.56, -0.03, 0.53);
    tagInteractive(wanPort, 'router-wan');
    group.add(wanPort);
    refs.wanPort = wanPort;

    const wanLbl = makeLabelSprite('PORT WAN (ISP)', 'rgba(30,58,138,0.9)', '#60a5fa');
    wanLbl.scale.set(0.85, 0.22, 1);
    wanLbl.position.set(-0.62, -0.36, 0.6);
    group.add(wanLbl);

    // 4 PORT LAN (KUNING - Ke Jaringan Lokal)
    refs.lanPorts = [];
    [-0.12, 0.14, 0.40, 0.66].forEach((x) => {
      const lan = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.16, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xa16207, emissiveIntensity: 0.45 })
      );
      lan.position.set(x, -0.03, 0.53);
      tagInteractive(lan, 'router-lan');
      group.add(lan);
      refs.lanPorts.push(lan);
    });

    const lanLbl = makeLabelSprite('PORT LAN 1-4 (Lokal)', 'rgba(113,63,18,0.9)', '#fde047');
    lanLbl.scale.set(1.05, 0.22, 1);
    lanLbl.position.set(0.28, -0.36, 0.6);
    group.add(lanLbl);

    // Paket Data IP Animasi yang meluncur keluar masuk Port WAN & LAN
    const ipPacket = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ipPacket.position.set(-0.56, 0.05, 0.6);
    group.add(ipPacket);
    refs.ipPacket = ipPacket;

    // Label Judul
    const titleLbl = makeLabelSprite('ROUTER • PENGATUR IP');
    titleLbl.position.set(0, 1.55, 0);
    group.add(titleLbl);

    modelRefs = refs;
    return {
      group,
      update: (t) => {
        // Animasi paket IP bergerak dari WAN ke LAN
        const phase = (t * 0.7) % 1;
        if (phase < 0.5) {
          const p = phase * 2;
          ipPacket.position.set(-0.56, 0.02 + Math.sin(p * Math.PI) * 0.35, 1.35 - p * 0.82);
          ipPacket.material.color.setHex(0x60a5fa);
        } else {
          const p = (phase - 0.5) * 2;
          ipPacket.position.set(-0.12 + p * 0.55, 0.02 + Math.sin(p * Math.PI) * 0.35, 0.53 + p * 0.82);
          ipPacket.material.color.setHex(0xfde047);
        }
      }
    };
  }

  // --- 2. MODEL 3D: SWITCH 8-PORT (MAC ADDRESS FORWARDING) ---
  function createSwitchModel() {
    const group = new THREE.Group();
    const refs = { leds: [], targetPortIndex: 5 };

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.34, 0.96),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.55 })
    );
    tagInteractive(body, 'switch-body');
    group.add(body);

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(2.08, 0.03, 0.88),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 })
    );
    accent.position.y = 0.18;
    group.add(accent);

    // 8 Port Ethernet + 8 LED Status
    const portPositions = [];
    for (let i = 0; i < 8; i++) {
      const px = -0.84 + i * 0.24;
      portPositions.push(px);
      const port = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.14, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      port.position.set(px, -0.04, 0.48);
      tagInteractive(port, 'switch-port');
      group.add(port);

      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      led.position.set(px, 0.09, 0.49);
      group.add(led);
      refs.leds.push(led);
    }

    // Paket MAC Address bergerak dari Port 1 ke Port Tujuan spesifik
    const macPacket = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    group.add(macPacket);
    refs.macPacket = macPacket;
    refs.portPositions = portPositions;

    const titleLbl = makeLabelSprite('SWITCH 8-PORT • MAC ADDRESS', 'rgba(6,78,59,0.9)', '#34d399');
    titleLbl.position.set(0, 0.85, 0);
    group.add(titleLbl);

    modelRefs = refs;
    return {
      group,
      update: (t) => {
        refs.leds.forEach((led, idx) => {
          const active = idx === refs.targetPortIndex || Math.sin(t * 5 + idx * 1.3) > 0.2;
          led.material.color.setHex(idx === refs.targetPortIndex ? 0xfacc15 : active ? 0x22c55e : 0x1e293b);
        });
        const srcX = portPositions[0];
        const dstX = portPositions[refs.targetPortIndex];
        const p = (t * 0.85) % 1;
        macPacket.position.set(
          srcX + (dstX - srcX) * p,
          0.25 + Math.sin(p * Math.PI) * 0.35,
          0.55 + Math.sin(p * Math.PI) * 0.25
        );
      }
    };
  }

  // --- 3. MODEL 3D: KABEL UTP & KONEKTOR RJ-45 (BISA DI-EXPLODE / BEDAH!) ---
  function createUtpModel() {
    const group = new THREE.Group();
    const refs = { wires: [], explodeFactor: 0 };

    // Jaket Kabel UTP Biru
    const jacket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })
    );
    jacket.rotation.z = Math.PI / 2;
    jacket.position.x = -0.82;
    tagInteractive(jacket, 'utp-jacket');
    group.add(jacket);
    refs.jacket = jacket;

    // 4 Pasang Kabel Tembaga Terpilin (Oranye, Hijau, Biru, Cokelat)
    const wireColors = [0xf97316, 0x22c55e, 0x38bdf8, 0xa16207];
    const offsets = [
      [0.08, 0.08],
      [0.08, -0.08],
      [-0.08, 0.08],
      [-0.08, -0.08]
    ];

    wireColors.forEach((col, i) => {
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, 0.78, 12),
        new THREE.MeshStandardMaterial({ color: col })
      );
      wire.rotation.z = Math.PI / 2;
      wire.position.set(0.05, offsets[i][0], offsets[i][1]);
      wire.userData.baseY = offsets[i][0];
      wire.userData.baseZ = offsets[i][1];
      tagInteractive(wire, 'utp-wires');
      group.add(wire);
      refs.wires.push(wire);
    });

    // Konektor Modular RJ-45 Transparan + Klip + 8 Pin Emas
    const rj45Group = new THREE.Group();
    rj45Group.position.x = 0.65;

    const rjBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.42, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.5, roughness: 0.15 })
    );
    tagInteractive(rjBody, 'utp-rj45');
    rj45Group.add(rjBody);

    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.08, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.75 })
    );
    clip.position.set(-0.08, 0.25, 0);
    clip.rotation.z = 0.28;
    rj45Group.add(clip);

    // 8 Pin Tembaga Emas
    for (let p = 0; p < 8; p++) {
      const pin = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.05, 0.032),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 })
      );
      pin.position.set(0.28, 0.10, -0.175 + p * 0.05);
      tagInteractive(pin, 'utp-rj45');
      rj45Group.add(pin);
    }

    group.add(rj45Group);
    refs.rj45Group = rj45Group;

    const titleLbl = makeLabelSprite('KABEL UTP & KONEKTOR RJ-45', 'rgba(120,53,15,0.9)', '#fbbf24');
    titleLbl.position.set(0, 0.92, 0);
    group.add(titleLbl);

    modelRefs = refs;
    return {
      group,
      update: () => {
        const target = state.utpExploded ? 1 : 0;
        refs.explodeFactor += (target - refs.explodeFactor) * 0.1;
        refs.jacket.position.x = -0.82 - refs.explodeFactor * 0.35;
        refs.rj45Group.position.x = 0.65 + refs.explodeFactor * 0.45;
        refs.wires.forEach((w) => {
          w.position.y = w.userData.baseY * (1 + refs.explodeFactor * 2.2);
          w.position.z = w.userData.baseZ * (1 + refs.explodeFactor * 2.2);
        });
      }
    };
  }

  // --- 4. MODEL 3D: TOPOLOGI STAR (SWITCH PUSAT + 4 KLIEN + PAKET DATA + SIMULASI) ---
  function createStarTopologyModel() {
    const group = new THREE.Group();
    const refs = { cables: {}, screens: {}, packets: [] };

    // Switch Pusat
    const centerSwitch = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.28, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.3 })
    );
    tagInteractive(centerSwitch, 'star-switch');
    group.add(centerSwitch);
    refs.centerSwitch = centerSwitch;

    const switchLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    switchLed.position.y = 0.2;
    group.add(switchLed);
    refs.switchLed = switchLed;

    const swLbl = makeLabelSprite('SWITCH PUSAT', 'rgba(2,132,199,0.9)', '#7dd3fc');
    swLbl.scale.set(0.9, 0.23, 1);
    swLbl.position.set(0, 0.55, 0);
    group.add(swLbl);

    // 4 Klien mengelilingi pusat
    const clients = [
      { id: 'pc1', label: 'PC-1', pos: [0, 0, -1.55], color: 0x38bdf8, pColor: 0xfacc15 },
      { id: 'pc2', label: 'PC-2', pos: [1.55, 0, 0], color: 0x38bdf8, pColor: 0x34d399 },
      { id: 'laptop', label: 'LAPTOP', pos: [0, 0, 1.55], color: 0xa855f7, pColor: 0xc084fc },
      { id: 'printer', label: 'PRINTER', pos: [-1.55, 0, 0], color: 0x22c55e, pColor: 0x38bdf8 }
    ];

    clients.forEach((c, idx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(c.pos[0], 0, c.pos[2]);

      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.34, 0.14),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      monitor.position.y = 0.16;
      tagInteractive(monitor, `star-client-${c.id}`);
      nodeGroup.add(monitor);

      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.25, 0.16),
        new THREE.MeshBasicMaterial({ color: c.color })
      );
      screen.position.y = 0.16;
      nodeGroup.add(screen);
      refs.screens[c.id] = { mesh: screen, normalColor: c.color };

      const lbl = makeLabelSprite(c.label, 'rgba(15,23,42,0.88)', '#e2e8f0');
      lbl.scale.set(0.68, 0.18, 1);
      lbl.position.y = 0.52;
      nodeGroup.add(lbl);

      group.add(nodeGroup);

      // Kabel silinder dari Switch Pusat ke Klien
      const len = 1.35;
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.032, len, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.35 })
      );
      cable.position.set(c.pos[0] * 0.48, 0, c.pos[2] * 0.48);
      if (c.pos[2] !== 0) {
        cable.rotation.x = Math.PI / 2;
      } else {
        cable.rotation.z = Math.PI / 2;
      }
      tagInteractive(cable, c.id === 'pc1' ? 'star-cable-pc1' : 'star-cable-other');
      group.add(cable);
      refs.cables[c.id] = cable;

      // Paket Data Bergerak (Bola Bercahaya)
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 16, 16),
        new THREE.MeshBasicMaterial({ color: c.pColor })
      );
      group.add(packet);
      refs.packets.push({ id: c.id, mesh: packet, endPos: c.pos, offset: idx * 0.7 });
    });

    const titleLbl = makeLabelSprite('TOPOLOGI STAR (BINTANG)', 'rgba(88,28,135,0.9)', '#d8b4fe');
    titleLbl.position.set(0, 1.15, 0);
    group.add(titleLbl);

    modelRefs = refs;
    applyStarVisualState();

    return {
      group,
      update: (t) => {
        refs.packets.forEach((p) => {
          const active =
            state.starMode === 'normal' ||
            (state.starMode === 'cable-cut' && p.id !== 'pc1');
          p.mesh.visible = active;
          if (active) {
            const wave = (Math.sin(t * 2.6 + p.offset) + 1) / 2; // 0 .. 1 bolak-balik
            p.mesh.position.set(p.endPos[0] * wave * 0.9, 0.14, p.endPos[2] * wave * 0.9);
          }
        });
      }
    };
  }

  function applyStarVisualState() {
    if (state.currentTarget !== 'star' || !modelRefs.centerSwitch) return;

    if (state.starMode === 'normal') {
      modelRefs.centerSwitch.material.color.setHex(0x0284c7);
      modelRefs.switchLed.material.color.setHex(0x22c55e);
      Object.values(modelRefs.cables).forEach((c) => c.material.color.setHex(0x38bdf8));
      Object.values(modelRefs.screens).forEach((s) => s.mesh.material.color.setHex(s.normalColor));
    } else if (state.starMode === 'cable-cut') {
      modelRefs.centerSwitch.material.color.setHex(0x0284c7);
      modelRefs.switchLed.material.color.setHex(0x22c55e);
      Object.entries(modelRefs.cables).forEach(([id, c]) => {
        c.material.color.setHex(id === 'pc1' ? 0xef4444 : 0x38bdf8);
      });
      Object.entries(modelRefs.screens).forEach(([id, s]) => {
        s.mesh.material.color.setHex(id === 'pc1' ? 0xef4444 : s.normalColor);
      });
    } else if (state.starMode === 'switch-down') {
      modelRefs.centerSwitch.material.color.setHex(0xb91c1c);
      modelRefs.switchLed.material.color.setHex(0xef4444);
      Object.values(modelRefs.cables).forEach((c) => c.material.color.setHex(0x64748b));
      Object.values(modelRefs.screens).forEach((s) => s.mesh.material.color.setHex(0xef4444));
    }
  }

  // ==========================================================================
  // MEMUAT OBJEK TARGET (DENGAN CEK OTOMATIS .GLB -> FALLBACK 3D INTERAKTIF)
  // ==========================================================================
  async function tryLoadCustomGlb(key) {
    const url = CUSTOM_GLB_PATHS[key];
    if (!url || typeof THREE.GLTFLoader === 'undefined') return null;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || ct.includes('text/html')) return null;

      return await new Promise((resolve) => {
        const loader = new THREE.GLTFLoader();
        loader.load(
          url,
          (gltf) => resolve(gltf.scene),
          undefined,
          () => resolve(null)
        );
      });
    } catch (_) {
      return null;
    }
  }

  async function spawnObject(key) {
    state.currentTarget = key;
    state.utpExploded = false;
    state.starMode = 'normal';
    interactiveMeshes = [];
    modelRefs = {};

    // Bersihkan objek sebelumnya
    while (activeModelHolder.children.length > 0) {
      activeModelHolder.remove(activeModelHolder.children[0]);
    }

    // Update tombol aktif di dock bawah
    document.querySelectorAll('.target-chip').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.target === key);
    });

    // Cek apakah user menaruh file .glb kustom di assets/models/
    const customGlb = await tryLoadCustomGlb(key);
    if (customGlb) {
      customGlb.traverse((child) => {
        if (child.isMesh) tagInteractive(child, `${key}-body`);
      });
      activeModelHolder.add(customGlb);
      currentAnimFn = null;
    } else {
      let built;
      if (key === 'router') built = createRouterModel();
      else if (key === 'switch') built = createSwitchModel();
      else if (key === 'utp') built = createUtpModel();
      else built = createStarTopologyModel();

      activeModelHolder.add(built.group);
      currentAnimFn = built.update;
    }

    // Efek spawn membesar ala Pokemon muncul di AR
    arObjectRoot.scale.setScalar(0.15);
    state.targetScale = 1.0;

    updateLiveMateriCard(key);
    renderSpecialActionButtons(key);
    switchMateriTab(OBJECT_DATA[key].topicTab);
    sfx.tap();
  }

  // ==========================================================================
  // KARTU PENJELASAN MATERI LIVE DI ATAS KAMERA AR
  // ==========================================================================
  function updateLiveMateriCard(key, customOverride = null) {
    const data = OBJECT_DATA[key];
    const isCaught = state.caughtSet.has(key);

    toastTag.textContent = customOverride?.tag || data.tag;
    toastTitle.textContent = customOverride?.title || data.title;
    toastBody.textContent = customOverride?.desc || data.desc;
    toastTip.innerHTML = customOverride?.tip || data.tip;

    toastCaughtBadge.textContent = isCaught ? '✅ TERTANGKAP' : '⚡ LIAR';
    toastCaughtBadge.classList.toggle('caught', isCaught);
  }

  btnToggleLiveInfo.addEventListener('click', () => {
    const collapsed = toastContentWrap.classList.toggle('collapsed');
    btnToggleLiveInfo.textContent = collapsed ? '▾' : '▴';
  });

  // Render tombol interaksi khusus di atas dock (sesuai objek aktif)
  function renderSpecialActionButtons(key) {
    specialActionsEl.innerHTML = '';

    if (key === 'router') {
      addSpecialBtn('🔵 Info Port WAN', () => handlePartInteraction('router-wan'));
      addSpecialBtn('🟡 Info Port LAN', () => handlePartInteraction('router-lan'));
    } else if (key === 'switch') {
      addSpecialBtn('⚡ Kirim Frame ke Port Lain (MAC)', () => handlePartInteraction('switch-port'));
    } else if (key === 'utp') {
      const btn = addSpecialBtn('🔍 Bedah / Explode Kabel UTP', () => {
        handlePartInteraction('utp-wires');
        btn.classList.toggle('active', state.utpExploded);
      });
    } else if (key === 'star') {
      const bNorm = addSpecialBtn('✅ Normal', () => setStarSim('normal'));
      const bCut = addSpecialBtn('⚠️ 1 Kabel Putus', () => setStarSim('cable-cut'));
      const bDown = addSpecialBtn('❌ Switch Rusak', () => setStarSim('switch-down'));
      bNorm.id = 'btn-star-normal';
      bCut.id = 'btn-star-cut';
      bDown.id = 'btn-star-down';
      bNorm.classList.add('active');
    }
  }

  function addSpecialBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'special-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    specialActionsEl.appendChild(btn);
    return btn;
  }

  function setStarSim(mode) {
    state.starMode = mode;
    applyStarVisualState();
    sfx.tap();

    const bNorm = document.getElementById('btn-star-normal');
    const bCut = document.getElementById('btn-star-cut');
    const bDown = document.getElementById('btn-star-down');
    if (bNorm) bNorm.classList.toggle('active', mode === 'normal');
    if (bCut) bCut.classList.toggle('danger-active', mode === 'cable-cut');
    if (bDown) bDown.classList.toggle('danger-active', mode === 'switch-down');

    if (mode === 'normal') {
      updateLiveMateriCard('star');
    } else if (mode === 'cable-cut') {
      updateLiveMateriCard('star', {
        tag: 'SIMULASI TOPOLOGI STAR',
        title: '⚠️ Simulasi: 1 Kabel Klien (PC-1) Putus!',
        desc: 'Perhatikan objek 3D: kabel merah ke PC-1 terputus & paket datanya berhenti. Namun PC-2, Laptop, dan Printer TETAP bisa bertukar data lewat Switch pusat!',
        tip: '✅ Inilah keunggulan Topologi Star: gangguan 1 kabel mudah diidentifikasi & tidak mematikan klien lain.'
      });
    } else if (mode === 'switch-down') {
      updateLiveMateriCard('star', {
        tag: 'SIMULASI TOPOLOGI STAR',
        title: '❌ Simulasi: Switch Pusat Bermasalah!',
        desc: 'Perhatikan objek 3D: ketika Switch di tengah rusak (merah), seluruh pengiriman paket data ke semua perangkat berhenti total!',
        tip: '⚠️ Kelemahan Topologi Star: seluruh jaringan bergantung pada perangkat pusat (Single Point of Failure).'
      });
    }
  }

  // ==========================================================================
  // INTERAKSI SENTUH (TAP / RAYCASTING) LANGSUNG PADA OBJEK 3D
  // ==========================================================================
  const raycaster = new THREE.Raycaster();
  const tapCoords = new THREE.Vector2();

  function handlePartInteraction(partId) {
    sfx.tap();
    state.wobbleTimer = 0.45; // Objek 3D memantul/merespons sentuhan!
    toastContentWrap.classList.remove('collapsed');
    btnToggleLiveInfo.textContent = '▴';

    if (partId === 'router-wan') {
      updateLiveMateriCard('router', {
        tag: 'DETAIL PORT ROUTER',
        title: '🔵 Port WAN (Wide Area Network)',
        desc: 'Port WAN berwarna biru (biasanya 1 port). Fungsinya menghubungkan Router dengan jaringan luar / modem ISP agar jaringan lokal bisa mengakses Internet.',
        tip: '👆 Coba tap Port LAN (Kuning) di sebelahnya untuk membandingkan!'
      });
    } else if (partId === 'router-lan') {
      updateLiveMateriCard('router', {
        tag: 'DETAIL PORT ROUTER',
        title: '🟡 Port LAN (Local Area Network)',
        desc: 'Port LAN berwarna kuning (biasanya 4 port). Fungsinya menghubungkan perangkat di jaringan lokal seperti Switch, komputer PC, atau Access Point.',
        tip: '👆 Router meneruskan paket data antar jaringan berbeda menggunakan alamat IP!'
      });
    } else if (partId === 'router-antenna' || partId === 'router-body') {
      updateLiveMateriCard('router');
    } else if (partId === 'switch-port' || partId === 'switch-body') {
      if (modelRefs.targetPortIndex !== undefined) {
        modelRefs.targetPortIndex = 1 + Math.floor(Math.random() * 7);
      }
      const pNum = (modelRefs.targetPortIndex || 2) + 1;
      updateLiveMateriCard('switch', {
        tag: 'SIMULASI MAC ADDRESS',
        title: `🔀 Data Diteruskan Spesifik ke Port #${pNum}!`,
        desc: `Switch membaca alamat MAC tujuan dan mengirim paket langsung ke Port #${pNum} tanpa membroadcast ke semua port lain di jaringan LAN.`,
        tip: '👆 Tap lagi Switch untuk menguji pengiriman MAC Address ke port lain, atau tekan TANGKAP!'
      });
    } else if (partId === 'utp-wires' || partId === 'utp-rj45' || partId === 'utp-jacket') {
      state.utpExploded = !state.utpExploded;
      updateLiveMateriCard('utp', {
        tag: state.utpExploded ? 'MODE BEDAH 3D AKTIF' : 'MEDIA TRANSMISI',
        title: state.utpExploded ? '🔍 Struktur Dalam UTP & RJ-45 Terbuka!' : '🔌 Kabel UTP & Konektor RJ-45',
        desc: state.utpExploded
          ? 'Lihat 4 pasang kabel tembaga terpilin (Oranye, Hijau, Biru, Cokelat) yang masuk ke 8 pin emas pada konektor RJ-45 untuk menghantarkan sinyal data LAN.'
          : OBJECT_DATA.utp.desc,
        tip: '👆 Tap kembali kabel untuk menyatukan/membedah, lalu tekan TANGKAP!'
      });
    } else if (partId === 'star-cable-pc1') {
      setStarSim(state.starMode === 'cable-cut' ? 'normal' : 'cable-cut');
    } else if (partId === 'star-switch') {
      setStarSim(state.starMode === 'switch-down' ? 'normal' : 'switch-down');
    } else if (partId.startsWith('star-')) {
      setStarSim('normal');
    }
  }

  // ==========================================================================
  // MEKANIK LEMPAR NET-BALL 3D (ALA POKEBALL DI POKEMON GO!) + PARTIKEL
  // ==========================================================================
  const netBallGroup = new THREE.Group();
  const topHalf = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.4 })
  );
  const botHalf = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
  );
  const midRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.235, 0.028, 12, 32),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  midRing.rotation.x = Math.PI / 2;
  const coreBtn = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  coreBtn.position.z = 0.22;
  netBallGroup.add(topHalf, botHalf, midRing, coreBtn);
  netBallGroup.visible = false;
  scene.add(netBallGroup);

  // Partikel Ledakan Energi saat Net-Ball Kena Objek
  const burstParticles = [];
  const pGeo = new THREE.SphereGeometry(0.045, 8, 8);
  for (let i = 0; i < 24; i++) {
    const pm = new THREE.Mesh(
      pGeo,
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0xfacc15 })
    );
    pm.visible = false;
    scene.add(pm);
    burstParticles.push({ mesh: pm, vel: new THREE.Vector3(), life: 0 });
  }

  function triggerBurstParticles() {
    burstParticles.forEach((p) => {
      p.mesh.visible = true;
      p.mesh.position.copy(arObjectRoot.position);
      p.vel.set(
        (Math.random() - 0.5) * 0.16,
        (Math.random() - 0.5) * 0.16,
        (Math.random() - 0.5) * 0.16
      );
      p.life = 1.0;
    });
  }

  function throwNetBall() {
    if (state.ballFlying || !quizModal.classList.contains('hidden')) return;
    state.ballFlying = true;
    state.ballProgress = 0;
    netBallGroup.visible = true;
    sfx.throwBall();
  }

  document.getElementById('btn-throw-ball').addEventListener('click', throwNetBall);

  // ==========================================================================
  // MODAL KUIS TANGKAP (NET-DEX)
  // ==========================================================================
  function openCatchQuiz(key) {
    const data = OBJECT_DATA[key];
    quizTitle.textContent = `Menangkap ${data.title}`;
    quizQuestion.textContent = data.quiz.question;
    quizOptions.innerHTML = '';
    quizFeedback.classList.add('hidden');
    quizFeedback.textContent = '';

    data.quiz.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${optText}`;
      btn.addEventListener('click', () => {
        const allBtns = quizOptions.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach((b) => (b.disabled = true));

        if (idx === data.quiz.answerIndex) {
          btn.classList.add('correct');
          sfx.catchSuccess();
          const newlyCaught = !state.caughtSet.has(key);
          state.caughtSet.add(key);
          if (newlyCaught) {
            state.xp += 100;
          } else {
            state.xp += 25;
          }
          updateNetDexUI();
          quizFeedback.innerHTML = `<strong>🎉 TERTANGKAP! (+${newlyCaught ? 100 : 25} XP)</strong><br>${data.quiz.explanation}`;
          quizFeedback.classList.remove('hidden');
          updateLiveMateriCard(key);

          setTimeout(() => {
            quizModal.classList.add('hidden');
          }, 2300);
        } else {
          btn.classList.add('wrong');
          sfx.wrong();
          quizFeedback.innerHTML = `<strong>😅 Objek Lepas!</strong> Coba baca kartu penjelasan materi di layar kamera atau buka 📘 Materi, lalu lempar Net-Ball lagi!`;
          quizFeedback.classList.remove('hidden');
          setTimeout(() => {
            allBtns.forEach((b) => {
              b.disabled = false;
              b.classList.remove('wrong');
            });
          }, 1200);
        }
      });
      quizOptions.appendChild(btn);
    });

    quizModal.classList.remove('hidden');
  }

  function updateNetDexUI() {
    caughtCountEl.textContent = state.caughtSet.size;
    xpDisplayEl.textContent =
      state.caughtSet.size === 4
        ? `XP: ${state.xp} • 🏆 Master TJKT!`
        : `XP: ${state.xp} • Jelajah AR`;

    ['router', 'switch', 'utp', 'star'].forEach((k) => {
      const el = document.getElementById(`check-${k}`);
      if (el) el.textContent = state.caughtSet.has(k) ? '✅' : '';
    });
  }

  document.getElementById('btn-close-quiz').addEventListener('click', () => {
    quizModal.classList.add('hidden');
  });

  // ==========================================================================
  // KAMERA AR & SENSOR GYROSCOPE HP
  // ==========================================================================
  async function startCamera(facing = state.facingMode) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      videoEl.srcObject = mediaStream;
      await videoEl.play();
      state.cameraActive = true;
      state.facingMode = facing;
      videoEl.classList.add('active');
      videoEl.classList.toggle('mirrored', facing === 'user');
      studioGrid.visible = false;
    } catch (err) {
      // Fallback ke kamera apapun jika kamera belakang tidak ada (misal di laptop)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoEl.srcObject = mediaStream;
        await videoEl.play();
        state.cameraActive = true;
        state.facingMode = 'user';
        videoEl.classList.add('active', 'mirrored');
        studioGrid.visible = false;
      } catch (err2) {
        alert('Kamera tidak tersedia atau izin ditolak. Berjalan dalam Mode Studio 3D.\nDetail: ' + err2.message);
        state.cameraActive = false;
        studioGrid.visible = true;
      }
    }
  }

  function enableGyroscope() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      // Efek paralaks halus ala AR Pokemon GO saat HP digerakkan
      state.gyroOffsetX = Math.max(-0.55, Math.min(0.55, (e.gamma / 45) * 0.45));
      state.gyroOffsetY = Math.max(-0.4, Math.min(0.4, ((e.beta - 60) / 45) * 0.35));
    });
  }

  async function enterExperience(useCamera) {
    sfx.ensure();
    startScreen.classList.add('hidden');
    hudTop.classList.remove('hidden');
    hudBottom.classList.remove('hidden');
    interactionToast.classList.remove('hidden'); // Langsung tampilkan penjelasan materi di atas kamera!
    state.started = true;

    if (useCamera) {
      await startCamera('environment');
      enableGyroscope();
    } else {
      studioGrid.visible = true;
    }

    spawnObject('router');
  }

  document.getElementById('btn-start-ar').addEventListener('click', () => enterExperience(true));
  document.getElementById('btn-start-preview').addEventListener('click', () => enterExperience(false));

  document.getElementById('btn-switch-cam').addEventListener('click', () => {
    const nextFacing = state.facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
    sfx.tap();
  });

  document.getElementById('btn-recenter').addEventListener('click', () => {
    state.targetRotX = 0.22;
    state.targetRotY = 0.45;
    state.targetScale = 1.0;
    state.wobbleTimer = 0.35;
    sfx.tap();
  });

  // ==========================================================================
  // KONTROL SENTUH (TAP OBJEK, DRAG PUTAR 360°, & ZOOM)
  // ==========================================================================
  canvasContainer.addEventListener('pointerdown', (e) => {
    state.isDragging = true;
    state.pointerDownPos = { x: e.clientX, y: e.clientY };
    state.prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointermove', (e) => {
    if (!state.isDragging) return;
    const dx = e.clientX - state.prevPointer.x;
    const dy = e.clientY - state.prevPointer.y;
    state.targetRotY += dx * 0.01;
    state.targetRotX = Math.max(-1.0, Math.min(1.1, state.targetRotX + dy * 0.008));
    state.prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointerup', (e) => {
    if (!state.isDragging) return;
    state.isDragging = false;

    const moved = Math.hypot(e.clientX - state.pointerDownPos.x, e.clientY - state.pointerDownPos.y);
    // Jika gerakan kecil (< 12px), anggap sebagai TAP / KLIK pada objek 3D!
    if (moved < 12 && state.started) {
      tapCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
      tapCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(tapCoords, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0 && hits[0].object.userData.partId) {
        handlePartInteraction(hits[0].object.userData.partId);
      }
    }
  });

  canvasContainer.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      state.targetScale = Math.max(0.55, Math.min(1.85, state.targetScale - e.deltaY * 0.001));
    },
    { passive: false }
  );

  // Selector Target di Dock Bawah
  document.querySelectorAll('.target-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      spawnObject(btn.dataset.target);
    });
  });

  // Panel Materi Lengkap (Drawer)
  function switchMateriTab(topicId) {
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.topic === topicId);
    });
    document.querySelectorAll('.topic-content').forEach((sec) => {
      sec.classList.toggle('active', sec.id === `topic-${topicId}`);
    });
  }

  document.getElementById('btn-open-materi').addEventListener('click', () => {
    materiDrawer.classList.add('open');
    materiDrawer.setAttribute('aria-hidden', 'false');
    sfx.tap();
  });

  document.getElementById('btn-close-materi').addEventListener('click', () => {
    materiDrawer.classList.remove('open');
    materiDrawer.setAttribute('aria-hidden', 'true');
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchMateriTab(btn.dataset.topic));
  });

  // Resize layar (Portrait <-> Landscape)
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ==========================================================================
  // RENDER & ANIMATION LOOP UTAMA
  // ==========================================================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    // Rotasi perlahan otomatis jika tidak sedang di-drag
    if (!state.isDragging) {
      state.targetRotY += dt * 0.25;
    }

    // Efek melayang lembut + paralaks gyro HP ala Pokemon GO
    const floatY = Math.sin(t * 2.1) * 0.08;
    arObjectRoot.position.x += (-state.gyroOffsetX - arObjectRoot.position.x) * 0.1;
    arObjectRoot.position.y += (floatY - state.gyroOffsetY - arObjectRoot.position.y) * 0.1;

    // Animasi memantul saat objek disentuh / kena Net-Ball
    let wobbleScale = 1.0;
    if (state.wobbleTimer > 0) {
      state.wobbleTimer = Math.max(0, state.wobbleTimer - dt);
      wobbleScale = 1 + Math.sin(state.wobbleTimer * 28) * 0.12;
    }

    const curS = arObjectRoot.scale.x;
    const goalS = state.targetScale * wobbleScale;
    arObjectRoot.scale.setScalar(curS + (goalS - curS) * 0.14);

    arObjectRoot.rotation.x += (state.targetRotX - arObjectRoot.rotation.x) * 0.12;
    arObjectRoot.rotation.y += (state.targetRotY - arObjectRoot.rotation.y) * 0.12;

    // Cincin target berputar
    targetRing.rotation.z = t * 0.8;

    // Animasi internal objek aktif (paket IP, MAC, Topologi Star, Explode UTP)
    if (currentAnimFn) currentAnimFn(t, dt);

    // Animasi Lempar Net-Ball 3D (Lintasan Parabola menuju Objek)
    if (state.ballFlying) {
      state.ballProgress += dt * 2.1;
      const p = Math.min(1, state.ballProgress);
      const startZ = 3.6;
      const endZ = arObjectRoot.position.z + 0.1;
      netBallGroup.position.set(
        arObjectRoot.position.x * p,
        -1.35 * (1 - p) + arObjectRoot.position.y * p + Math.sin(p * Math.PI) * 1.35,
        startZ + (endZ - startZ) * p
      );
      netBallGroup.rotation.x -= dt * 14;
      netBallGroup.scale.setScalar(1.0 - p * 0.35);

      if (p >= 1) {
        state.ballFlying = false;
        netBallGroup.visible = false;
        state.wobbleTimer = 0.6;
        sfx.hit();
        triggerBurstParticles();

        // Efek kilatan tangkap
        flashOverlay.classList.add('flash');
        setTimeout(() => flashOverlay.classList.remove('flash'), 240);

        // Buka kuis singkat untuk mengunci tangkapan!
        setTimeout(() => openCatchQuiz(state.currentTarget), 380);
      }
    }

    // Update Partikel Ledakan
    burstParticles.forEach((p) => {
      if (p.life > 0) {
        p.mesh.position.add(p.vel);
        p.life -= dt * 1.8;
        p.mesh.scale.setScalar(Math.max(0.01, p.life));
        if (p.life <= 0) p.mesh.visible = false;
      }
    });

    renderer.render(scene, camera);
  }

  animate();
});
