/* ============================================================================
   SCRIPT.JS — NetGO WebAR (10 Karakter Jaringan TJKT + Galeri Koleksi Net-Dex)
   Fitur:
   1. Live Camera AR (Belakang/Depan) + Efek Gyroscope HP
   2. 10 Karakter 3D Interaktif (Perangkat, Media Transmisi, Topologi, Keamanan)
      + dukungan auto-loader file .glb dari folder assets/models/
   3. Penjelasan Materi Live langsung tampil di layar kamera saat kamera aktif
   4. Mekanik Lempar Net-Ball 3D (Ala Pokéball) + Kuis Tangkap + Net-Dex 10/10
   5. Galeri Koleksi Karakter (Filter Kategori, Progress, Rank, & Auto-Save)
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'netgo_webar_collection_v2';

  // Konfigurasi opsional model .glb kustom di assets/models/
  const CUSTOM_GLB_PATHS = {
    router: 'assets/models/router.glb',
    switch: 'assets/models/switch.glb',
    ap: 'assets/models/access-point.glb',
    server: 'assets/models/server.glb',
    utp: 'assets/models/utp-rj45.glb',
    fiber: 'assets/models/fiber-optic.glb'
  };

  // ==========================================================================
  // DAFTAR 10 KARAKTER JARINGAN (NET-DEX ROSTER)
  // ==========================================================================
  const CHARACTERS = [
    {
      id: 'router',
      num: '#01',
      name: 'Router',
      fullTitle: '📡 Router Jaringan',
      emoji: '📡',
      category: 'perangkat',
      categoryLabel: 'PERANGKAT JARINGAN',
      rarity: 'rare',
      topicTab: 'topik1',
      shortDesc: 'Menghubungkan jaringan berbeda & mengatur jalur paket data (IP).',
      desc: 'Router menghubungkan dua atau lebih jaringan yang berbeda dan mengatur jalur pengiriman paket data (IP). Perhatikan Port WAN (Biru) ke ISP dan Port LAN (Kuning) ke jaringan lokal.',
      tip: '👆 Tap Port WAN (Biru) atau Port LAN (Kuning) di 3D, lalu tekan TANGKAP!',
      quiz: {
        question: 'Apa perbedaan utama Port WAN (biru) dan Port LAN (kuning) pada sebuah Router?',
        options: [
          'Port WAN menghubungkan ke jaringan luar/ISP, sedangkan Port LAN menghubungkan perangkat jaringan lokal',
          'Port WAN hanya untuk printer, sedangkan Port LAN untuk kabel listrik',
          'Port WAN dan Port LAN fungsinya sama persis hanya untuk Bluetooth'
        ],
        answerIndex: 0,
        explanation: 'Tepat! Port WAN (Wide Area Network) ke ISP/Internet, sedangkan Port LAN (Local Area Network) ke jaringan lokal.'
      }
    },
    {
      id: 'switch',
      num: '#02',
      name: 'Switch',
      fullTitle: '🔀 Switch 8-Port LAN',
      emoji: '🔀',
      category: 'perangkat',
      categoryLabel: 'PERANGKAT JARINGAN',
      rarity: 'common',
      topicTab: 'topik1',
      shortDesc: 'Penghubung perangkat LAN yang meneruskan data via MAC Address.',
      desc: 'Switch menghubungkan berbagai perangkat dalam satu jaringan lokal (LAN) dan meneruskan data secara spesifik ke perangkat tujuan menggunakan MAC Address.',
      tip: '👆 Tap bodi Switch untuk melihat simulasi pengiriman frame ke port spesifik!',
      quiz: {
        question: 'Alamat apa yang digunakan Switch untuk meneruskan data secara spesifik ke perangkat tujuan di LAN?',
        options: [
          'Alamat Email pengguna',
          'MAC Address (alamat fisik kartu jaringan)',
          'Nomor seri monitor komputer'
        ],
        answerIndex: 1,
        explanation: 'Benar! Switch menggunakan tabel MAC Address agar data dikirim langsung ke port tujuan secara akurat.'
      }
    },
    {
      id: 'ap',
      num: '#03',
      name: 'Access Point',
      fullTitle: '📶 Access Point (Wi-Fi)',
      emoji: '📶',
      category: 'perangkat',
      categoryLabel: 'PERANGKAT JARINGAN',
      rarity: 'common',
      topicTab: 'topik1',
      shortDesc: 'Pemancar sinyal Wi-Fi (WLAN) penghubung perangkat nirkabel ke LAN.',
      desc: 'Access Point (AP) memancarkan gelombang radio Wi-Fi (2.4 GHz & 5 GHz) agar smartphone, tablet, dan laptop dapat terhubung ke jaringan lokal tanpa kabel.',
      tip: '👆 Tap Access Point atau ganti mode frekuensi 2.4 GHz / 5 GHz di bawah!',
      quiz: {
        question: 'Apa fungsi utama Access Point dalam sebuah jaringan komputer sekolah atau kantor?',
        options: [
          'Memancarkan sinyal nirkabel (Wi-Fi) agar perangkat mobile terhubung ke jaringan lokal',
          'Mendinginkan suhu prosesor komputer',
          'Mengganti fungsi kabel listrik PLN'
        ],
        answerIndex: 0,
        explanation: 'Tepat! Access Point menjembatani perangkat nirkabel (WLAN) agar bisa masuk ke jaringan kabel LAN.'
      }
    },
    {
      id: 'server',
      num: '#04',
      name: 'Server Rack',
      fullTitle: '🖥️ Server & Rack Data',
      emoji: '🖥️',
      category: 'perangkat',
      categoryLabel: 'PERANGKAT JARINGAN',
      rarity: 'epic',
      topicTab: 'topik1',
      shortDesc: 'Komputer penyedia layanan jaringan (Web, DNS, DHCP, File Server).',
      desc: 'Server adalah komputer berperforma tinggi yang melayani permintaan data klien secara terus-menerus, seperti layanan DNS (penerjemah domain), DHCP (pemberi IP otomatis), dan Web Server.',
      tip: '👆 Tap rak Server atau uji layanan DNS / DHCP / Web di tombol bawah!',
      quiz: {
        question: 'Layanan Server manakah yang bertugas membagikan alamat IP secara otomatis ke perangkat klien?',
        options: [
          'DHCP Server (Dynamic Host Configuration Protocol)',
          'Printer Spooler',
          'Bluetooth Pairing'
        ],
        answerIndex: 0,
        explanation: 'Mantap! DHCP Server otomatis memberikan konfigurasi IP, Subnet Mask, dan Gateway kepada perangkat klien.'
      }
    },
    {
      id: 'utp',
      num: '#05',
      name: 'UTP & RJ-45',
      fullTitle: '🔌 Kabel UTP & RJ-45',
      emoji: '🔌',
      category: 'media',
      categoryLabel: 'MEDIA TRANSMISI',
      rarity: 'common',
      topicTab: 'topik1',
      shortDesc: 'Kabel tembaga 4 pasang pilin + konektor modular 8-pin RJ-45.',
      desc: 'Kabel UTP (Unshielded Twisted Pair) adalah kabel tembaga berpasangan terpilin untuk menghubungkan perangkat jaringan lokal dengan ujung konektor RJ-45 (8 pin tembaga).',
      tip: '👆 Tap kabel UTP untuk membedah (Explode 3D) 4 pasang kabel pilin warna!',
      quiz: {
        question: 'Mengapa kabel tembaga di dalam kabel UTP dibuat berpasangan dan saling terpilin (Twisted Pair)?',
        options: [
          'Agar warna kabel terlihat lebih menarik saja',
          'Untuk meredam gangguan interferensi elektromagnetik saat pengiriman data',
          'Agar kabel tidak bisa dipasang konektor RJ-45'
        ],
        answerIndex: 1,
        explanation: 'Benar! Pilinan berpasangan mengurangi gangguan elektromagnetik (EMI/crosstalk) selama transmisi data.'
      }
    },
    {
      id: 'fiber',
      num: '#06',
      name: 'Fiber Optic',
      fullTitle: '✨ Kabel Fiber Optic',
      emoji: '✨',
      category: 'media',
      categoryLabel: 'MEDIA TRANSMISI',
      rarity: 'rare',
      topicTab: 'topik1',
      shortDesc: 'Serat kaca pemancar data via pulsa cahaya berkecepatan sangat tinggi.',
      desc: 'Kabel Fiber Optic menggunakan inti serat kaca/plastik (Core) yang mengirimkan data berupa pulsa cahaya. Kecepatannya sangat tinggi, jangkauan jauh (km), dan kebal interferensi elektromagnetik.',
      tip: '👆 Tap kabel Fiber Optic untuk membedah lapisan Jacket, Cladding, & Core laser!',
      quiz: {
        question: 'Sinyal apakah yang digunakan oleh kabel Fiber Optic untuk mentransmisikan data di dalam intinya (Core)?',
        options: [
          'Arus listrik tegangan tinggi',
          'Pulsa cahaya (Laser / LED)',
          'Gelombang suara ultrasonik'
        ],
        answerIndex: 1,
        explanation: 'Tepat! Fiber Optic mentransmisikan data lewat pantulan pulsa cahaya di dalam serat kaca/plastik.'
      }
    },
    {
      id: 'star',
      num: '#07',
      name: 'Topologi Star',
      fullTitle: '⭐ Topologi Star (Bintang)',
      emoji: '⭐',
      category: 'topologi',
      categoryLabel: 'TOPOLOGI JARINGAN',
      rarity: 'rare',
      topicTab: 'topik2',
      shortDesc: 'Semua klien terhubung terpusat ke satu Switch/Hub di tengah.',
      desc: 'Seluruh perangkat (PC, Laptop, Printer) terhubung terpusat ke satu Switch. Jika 1 kabel klien putus, klien lain tetap berkomunikasi; namun jika Switch pusat rusak, seluruh jaringan terganggu.',
      tip: '👆 Tap kabel PC-1 (1 Kabel Putus) atau Switch Pusat (Switch Rusak) untuk simulasi!',
      quiz: {
        question: 'Pada Topologi Star, apa yang terjadi jika SATU kabel klien putus, sementara Switch pusat tetap normal?',
        options: [
          'Seluruh jaringan ikut mati total',
          'Hanya klien tersebut yang terputus; klien lain tetap bisa berkomunikasi normal',
          'Semua komputer berubah menjadi Switch'
        ],
        answerIndex: 1,
        explanation: 'Benar! Isolasi gangguan tiap klien adalah keunggulan utama Topologi Star.'
      }
    },
    {
      id: 'bus',
      num: '#08',
      name: 'Topologi Bus',
      fullTitle: '🚌 Topologi Bus (Backbone)',
      emoji: '🚌',
      category: 'topologi',
      categoryLabel: 'TOPOLOGI JARINGAN',
      rarity: 'common',
      topicTab: 'topik2',
      shortDesc: 'Semua perangkat menempel pada satu kabel tulang punggung + Terminator.',
      desc: 'Topologi Bus menggunakan satu kabel utama (Backbone) dengan Terminator di kedua ujung untuk menyerap sinyal agar tidak memantul. Hemat kabel, tetapi jika kabel utama putus maka seluruh jaringan lumpuh.',
      tip: '👆 Tap kabel Backbone atau tekan simulasi "Backbone Putus" di bawah!',
      quiz: {
        question: 'Apa fungsi komponen Terminator yang dipasang di kedua ujung kabel utama pada Topologi Bus?',
        options: [
          'Menyerap sinyal di ujung kabel agar tidak memantul balik (signal bounce)',
          'Memperkuat sinyal Wi-Fi ke seluruh gedung',
          'Menyimpan file cadangan server'
        ],
        answerIndex: 0,
        explanation: 'Tepat! Tanpa Terminator, sinyal akan memantul balik di ujung kabel dan mengacaukan lalu lintas data.'
      }
    },
    {
      id: 'ring',
      num: '#09',
      name: 'Topologi Ring',
      fullTitle: '⭕ Topologi Ring (Cincin)',
      emoji: '⭕',
      category: 'topologi',
      categoryLabel: 'TOPOLOGI JARINGAN',
      rarity: 'rare',
      topicTab: 'topik2',
      shortDesc: 'Perangkat terhubung melingkar tertutup dengan aliran Token satu arah.',
      desc: 'Pada Topologi Ring, setiap komputer terhubung ke dua tetangganya membentuk lingkaran. Data berpindah searah lewat Token sehingga minim tabrakan, tetapi jika satu segmen putus maka sirkulasi terhenti.',
      tip: '👆 Tap cincin Ring atau uji simulasi "1 Jalur Putus" di tombol bawah!',
      quiz: {
        question: 'Bagaimana pola aliran data (Token) pada Topologi Ring standar?',
        options: [
          'Bergerak satu arah mengelilingi cincin dari satu node ke node berikutnya',
          'Dipancarkan lewat satelit luar angkasa',
          'Hanya berhenti di satu komputer tanpa berpindah'
        ],
        answerIndex: 0,
        explanation: 'Benar! Aliran Token satu arah pada Topologi Ring meminimalkan tabrakan paket data (collision).'
      }
    },
    {
      id: 'mesh',
      num: '#10',
      name: 'Topologi Mesh',
      fullTitle: '🕸️ Topologi Mesh (Jala)',
      emoji: '🕸️',
      category: 'topologi',
      categoryLabel: 'TOPOLOGI JARINGAN',
      rarity: 'epic',
      topicTab: 'topik2',
      shortDesc: 'Setiap node saling terhubung penuh dengan banyak jalur cadangan.',
      desc: 'Pada Topologi Mesh (Full Mesh), setiap perangkat terhubung langsung ke semua perangkat lain. Sangat andal karena jika 1 kabel putus, data otomatis berbelok lewat jalur cadangan; namun butuh sangat banyak kabel.',
      tip: '👆 Tap kabel depan atau tekan "⚠️ 1 Jalur Putus (Reroute)" untuk melihat jalur cadangan!',
      quiz: {
        question: 'Apa keunggulan utama Topologi Mesh dibandingkan Topologi Bus atau Ring?',
        options: [
          'Menggunakan kabel paling sedikit dan paling murah',
          'Sangat andal karena memiliki banyak jalur cadangan jika satu kabel putus',
          'Tidak membutuhkan kartu jaringan pada komputer'
        ],
        answerIndex: 1,
        explanation: 'Mantap! Topologi Mesh punya redundansi jalur tinggi sehingga tetap berjalan meski ada 1 kabel terputus.'
      }
    },
    {
      id: 'tree',
      num: '#11',
      name: 'Topologi Tree',
      fullTitle: '🌳 Topologi Tree (Pohon)',
      emoji: '🌳',
      category: 'topologi',
      categoryLabel: 'TOPOLOGI JARINGAN',
      rarity: 'rare',
      topicTab: 'topik2',
      shortDesc: 'Struktur hierarki bertingkat dari Switch Root ke cabang-cabang Star.',
      desc: 'Topologi Tree (Pohon) membentuk hierarki bertingkat dari Switch Root di puncak menuju Sub-Switch cabang (misal Lab A & Lab B). Sangat mudah diperluas untuk gedung bertingkat.',
      tip: '👆 Tap Sub-Switch Cabang atau Switch Root Utama untuk simulasi gangguan bertingkat!',
      quiz: {
        question: 'Pada Topologi Tree, apa yang terjadi jika hanya satu Sub-Switch cabang (Lab A) yang rusak?',
        options: [
          'Cabang Lab A terputus, tetapi cabang lain (Lab B) masih tetap aktif di jaringannya',
          'Semua gedung di seluruh kota ikut padam listrik',
          'Topologi Tree otomatis berubah menjadi kabel Fiber Optic'
        ],
        answerIndex: 0,
        explanation: 'Benar! Gangguan pada satu Sub-Switch cabang hanya memengaruhi perangkat di bawah cabang tersebut.'
      }
    },
    {
      id: 'hybrid',
      num: '#12',
      name: 'Topologi Hybrid',
      fullTitle: '🔀 Topologi Hybrid (Campuran)',
      emoji: '🔀',
      category: 'topologi',
      categoryLabel: 'TOPOLOGI JARINGAN',
      rarity: 'legendary',
      topicTab: 'topik2',
      shortDesc: 'Gabungan dua atau lebih topologi berbeda (misal Star + Ring) dalam 1 jaringan.',
      desc: 'Topologi Hybrid menggabungkan dua atau lebih topologi berbeda (di sini Topologi Star di kiri + Topologi Ring di kanan) melalui Router penghubung. Sangat fleksibel untuk perusahaan atau kampus besar.',
      tip: '👆 Tap Router Penghubung di tengah untuk melihat paket melintas antara Star ↔ Ring!',
      quiz: {
        question: 'Apa yang dimaksud dengan Topologi Hybrid dalam jaringan komputer?',
        options: [
          'Jaringan yang hanya terdiri dari satu komputer tanpa kabel',
          'Gabungan dua atau lebih jenis topologi jaringan berbeda dalam satu sistem jaringan',
          'Topologi yang hanya boleh memakai kabel telepon lama'
        ],
        answerIndex: 1,
        explanation: 'Luar biasa! Topologi Hybrid memadukan keunggulan beberapa topologi (seperti Star + Ring/Bus) sesuai kebutuhan gedung.'
      }
    },
    {
      id: 'firewall',
      num: '#13',
      name: 'Firewall Shield',
      fullTitle: '🛡️ Firewall Shield (Legendary)',
      emoji: '🛡️',
      category: 'keamanan',
      categoryLabel: 'KEAMANAN JARINGAN',
      rarity: 'legendary',
      topicTab: 'topik2',
      shortDesc: 'Perisai penyaring lalu lintas data: meloloskan akses sah & memblokir serangan.',
      desc: 'Firewall adalah sistem keamanan jaringan yang memantau dan menyaring lalu lintas paket masuk/keluar berdasarkan aturan keamanan — meloloskan paket sah (Hijau) dan memblokir serangan berbahaya (Merah).',
      tip: '👆 Tap perisai Firewall atau tekan "🚨 Uji Serangan Siber" untuk melihat blokir real-time!',
      quiz: {
        question: 'Apa tugas utama sebuah Firewall dalam arsitektur keamanan jaringan komputer?',
        options: [
          'Menyaring lalu lintas jaringan masuk/keluar serta memblokir akses ilegal atau serangan',
          'Menambah kapasitas hard disk komputer klien',
          'Mengubah kabel UTP menjadi kabel Fiber Optic'
        ],
        answerIndex: 0,
        explanation: 'Luar biasa! Firewall bertindak sebagai perisai penyaring yang melindungi jaringan internal dari ancaman luar.'
      }
    }
  ];

  const CHAR_MAP = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

  // ==========================================================================
  // STATE APLIKASI + AUTO-LOAD PROGRESS DARI LOCALSTORAGE
  // ==========================================================================
  const state = {
    started: false,
    cameraActive: false,
    facingMode: 'environment',
    currentIndex: 0,
    currentTarget: 'router',
    caughtSet: new Set(),
    xp: 0,
    collectionFilter: 'all',
    targetRotX: 0,
    targetRotY: 0.35,
    targetScale: 1.0,
    // State True 3-DOF Gyroscope & Deteksi Permukaan Dasar (Lantai/Meja)
    gyroEnabled: true,
    gyroHasData: false,
    surfaceMode: 'placed', // 'scanning' | 'placed'
    surfaceReady: false,
    isDragging: false,
    pointerDownPos: { x: 0, y: 0 },
    prevPointer: { x: 0, y: 0 },
    // State simulasi spesifik karakter
    explodeMode: false,
    apBand: '2.4GHz',
    serverService: 'DHCP',
    starMode: 'normal',
    busBroken: false,
    ringBroken: false,
    meshReroute: false,
    treeMode: 'normal', // 'normal' | 'branch-down' | 'root-down'
    hybridBoost: 0,
    firewallAttackSurge: 0,
    // State lempar Net-Ball
    ballFlying: false,
    ballProgress: 0,
    wobbleTimer: 0
  };

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(saved.caught)) {
        saved.caught.forEach((id) => {
          if (CHAR_MAP[id]) state.caughtSet.add(id);
        });
      }
      if (typeof saved.xp === 'number') state.xp = saved.xp;
    } catch (_) {}
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ caught: Array.from(state.caughtSet), xp: state.xp })
      );
    } catch (_) {}
  }

  loadProgress();

  // ==========================================================================
  // EFEK SUARA SCI-FI (WEB AUDIO API)
  // ==========================================================================
  class SoundFX {
    constructor() { this.ctx = null; }
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    }
    tone(f1, f2, dur = 0.13, type = 'sine', vol = 0.08) {
      try {
        this.ensure();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + dur);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
      } catch (_) {}
    }
    tap() { this.tone(540, 880, 0.09, 'triangle', 0.07); }
    throwBall() { this.tone(320, 920, 0.26, 'sine', 0.09); }
    hit() { this.tone(760, 260, 0.2, 'sawtooth', 0.08); }
    shieldBlock() { this.tone(220, 620, 0.14, 'square', 0.05); }
    catchSuccess() {
      this.tone(523, 659, 0.14, 'triangle', 0.09);
      setTimeout(() => this.tone(659, 784, 0.14, 'triangle', 0.09), 110);
      setTimeout(() => this.tone(784, 1046, 0.28, 'triangle', 0.1), 220);
    }
    wrong() { this.tone(240, 150, 0.22, 'sawtooth', 0.07); }
  }
  const sfx = new SoundFX();

  // ==========================================================================
  // REFERENSI DOM
  // ==========================================================================
  const videoEl = document.getElementById('camera-feed');
  const canvasContainer = document.getElementById('ar-canvas-container');
  const flashOverlay = document.getElementById('flash-overlay');

  const startScreen = document.getElementById('start-screen');
  const hudTop = document.getElementById('hud-top');
  const hudBottom = document.getElementById('hud-bottom');
  const zoomControls = document.getElementById('zoom-controls');
  const zoomLevelText = document.getElementById('zoom-level-text');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnToggleGyro = document.getElementById('btn-toggle-gyro');
  const btnRescanFloor = document.getElementById('btn-rescan-floor');
  const surfaceScannerBar = document.getElementById('surface-scanner-bar');
  const scannerDot = document.getElementById('scanner-dot');
  const scannerText = document.getElementById('scanner-text');
  const btnPlaceSurface = document.getElementById('btn-place-surface');
  const interactionToast = document.getElementById('interaction-toast');
  const toastContentWrap = document.getElementById('toast-content-wrap');
  const btnToggleLiveInfo = document.getElementById('btn-toggle-live-info');

  const toastTag = document.getElementById('toast-tag');
  const toastRarity = document.getElementById('toast-rarity');
  const toastCaughtBadge = document.getElementById('toast-caught-badge');
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-body');
  const toastTip = document.getElementById('toast-tip');

  const caughtCountEl = document.getElementById('caught-count');
  const xpDisplayEl = document.getElementById('xp-display');
  const specialActionsEl = document.getElementById('special-actions');
  const characterStripEl = document.getElementById('character-strip');
  const dockCharEmoji = document.getElementById('dock-char-emoji');
  const dockCharName = document.getElementById('dock-char-name');
  const dockCharIndex = document.getElementById('dock-char-index');

  const collectionModal = document.getElementById('collection-modal');
  const collectionGrid = document.getElementById('collection-grid');
  const colProgressText = document.getElementById('col-progress-text');
  const colProgressFill = document.getElementById('col-progress-fill');
  const colRankBadge = document.getElementById('col-rank-badge');

  const quizModal = document.getElementById('quiz-modal');
  const quizTitle = document.getElementById('quiz-title');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizFeedback = document.getElementById('quiz-feedback');
  const materiDrawer = document.getElementById('materi-drawer');

  let mediaStream = null;

  // ==========================================================================
  // SETUP THREE.JS SCENE (WORLD-SPACE GROUND PLANE y = 0 + CONTACT SHADOW)
  // ==========================================================================
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.08, 100);
  // Default posisi kamera Studio / Non-Gyro menatap titik lantai (0, 0.55, 0)
  camera.position.set(0, 1.45, 3.8);
  camera.lookAt(0, 0.55, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.88));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
  dirLight.position.set(4, 8, 5);
  scene.add(dirLight);
  const accentLight = new THREE.PointLight(0x38bdf8, 1.2, 18);
  accentLight.position.set(-4, 3, 3);
  scene.add(accentLight);

  // Bidang Lantai Virtual pada y = 0 untuk Raycast Deteksi Permukaan
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const studioGrid = new THREE.GridHelper(14, 24, 0x38bdf8, 0x1e293b);
  studioGrid.position.y = 0;
  studioGrid.material.transparent = true;
  studioGrid.material.opacity = 0.35;
  scene.add(studioGrid);

  // --- Surface Reticle 3D (Indikator Bidang Lantai / Meja saat Memindai) ---
  const surfaceReticle = new THREE.Group();
  const retOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.54, 48),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
  );
  retOuter.rotation.x = -Math.PI / 2;
  const retInner = new THREE.Mesh(
    new THREE.RingGeometry(0.14, 0.19, 32),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  retInner.rotation.x = -Math.PI / 2;
  const retGrid = new THREE.GridHelper(1.2, 6, 0x22c55e, 0x22c55e);
  retGrid.material.transparent = true;
  retGrid.material.opacity = 0.32;
  surfaceReticle.add(retOuter, retInner, retGrid);
  surfaceReticle.position.set(0, 0.01, -2.5);
  surfaceReticle.visible = false;
  scene.add(surfaceReticle);

  // --- Root Objek AR (Terkunci Stabil di Permukaan Lantai y = 0) ---
  const arObjectRoot = new THREE.Group();
  scene.add(arObjectRoot);

  // Bayangan Kontak Lembut di Lantai agar Objek Terlihat Menapak Kokoh
  function createContactShadowMesh() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.006;
    return shadow;
  }
  arObjectRoot.add(createContactShadowMesh());

  // Cincin target datar menempel di lantai
  const targetRing = new THREE.Mesh(
    new THREE.RingGeometry(1.12, 1.21, 48),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.y = 0.015;
  arObjectRoot.add(targetRing);

  // Dudukan Model 3D (terangkat y = 0.72 agar seluruh model menapak pas di atas bayangan lantai)
  const activeModelHolder = new THREE.Group();
  activeModelHolder.position.y = 0.72;
  arObjectRoot.add(activeModelHolder);

  function makeLabelSprite(text, bgColor = 'rgba(15,23,42,0.88)', borderColor = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(12, 12, 488, 96, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 62);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(1.55, 0.36, 1);
    return sprite;
  }

  let currentAnimFn = null;
  let interactiveMeshes = [];
  let modelRefs = {};

  function tagInteractive(mesh, partId) {
    mesh.userData.partId = partId;
    interactiveMeshes.push(mesh);
  }

  // ==========================================================================
  // 10 MODEL 3D INTERAKTIF KARAKTER JARINGAN
  // ==========================================================================

  // 1. ROUTER
  function createRouterModel() {
    const group = new THREE.Group();
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

    [-0.65, 0.65].forEach((x, idx) => {
      const ant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.055, 1.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
      );
      ant.position.set(x, 0.64, -0.4);
      ant.rotation.z = idx === 0 ? 0.12 : -0.12;
      tagInteractive(ant, 'router-body');
      group.add(ant);
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      tip.position.set(x + (idx === 0 ? -0.07 : 0.07), 1.2, -0.4);
      group.add(tip);
    });

    const wanPort = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.16, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.6 })
    );
    wanPort.position.set(-0.56, -0.03, 0.53);
    tagInteractive(wanPort, 'router-wan');
    group.add(wanPort);

    const wanLbl = makeLabelSprite('WAN (ISP)', 'rgba(30,58,138,0.9)', '#60a5fa');
    wanLbl.scale.set(0.76, 0.2, 1);
    wanLbl.position.set(-0.62, -0.35, 0.6);
    group.add(wanLbl);

    [-0.12, 0.14, 0.4, 0.66].forEach((x) => {
      const lan = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.16, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xa16207, emissiveIntensity: 0.45 })
      );
      lan.position.set(x, -0.03, 0.53);
      tagInteractive(lan, 'router-lan');
      group.add(lan);
    });

    const lanLbl = makeLabelSprite('LAN 1-4', 'rgba(113,63,18,0.9)', '#fde047');
    lanLbl.scale.set(0.76, 0.2, 1);
    lanLbl.position.set(0.28, -0.35, 0.6);
    group.add(lanLbl);

    const ipPacket = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    group.add(ipPacket);

    const titleLbl = makeLabelSprite('ROUTER • PENGATUR IP');
    titleLbl.position.set(0, 1.5, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t) => {
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

  // 2. SWITCH
  function createSwitchModel() {
    const group = new THREE.Group();
    const refs = { leds: [], targetPortIndex: 5, portPositions: [] };

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.34, 0.96),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.55 })
    );
    tagInteractive(body, 'switch-port');
    group.add(body);

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(2.08, 0.03, 0.88),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 })
    );
    accent.position.y = 0.18;
    group.add(accent);

    for (let i = 0; i < 8; i++) {
      const px = -0.84 + i * 0.24;
      refs.portPositions.push(px);
      const port = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.06), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      port.position.set(px, -0.04, 0.48);
      tagInteractive(port, 'switch-port');
      group.add(port);

      const led = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      led.position.set(px, 0.09, 0.49);
      group.add(led);
      refs.leds.push(led);
    }

    const macPacket = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
    group.add(macPacket);

    const titleLbl = makeLabelSprite('SWITCH • MAC ADDRESS', 'rgba(6,78,59,0.9)', '#34d399');
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
        const srcX = refs.portPositions[0];
        const dstX = refs.portPositions[refs.targetPortIndex];
        const p = (t * 0.85) % 1;
        macPacket.position.set(srcX + (dstX - srcX) * p, 0.25 + Math.sin(p * Math.PI) * 0.35, 0.55 + Math.sin(p * Math.PI) * 0.25);
      }
    };
  }

  // 3. ACCESS POINT (WI-FI)
  function createAccessPointModel() {
    const group = new THREE.Group();
    const waves = [];

    // Piringan Ceiling Access Point (Putih futuristik ala UniFi)
    const dome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.88, 0.24, 36),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.2 })
    );
    tagInteractive(dome, 'ap-body');
    group.add(dome);

    // Cincin LED tengah
    const ledRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.035, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ledRing.rotation.x = Math.PI / 2;
    ledRing.position.y = 0.13;
    group.add(ledRing);

    // 3 Gelombang Sinyal Wi-Fi 3D mengembang
    for (let i = 0; i < 3; i++) {
      const wRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.025, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
      );
      wRing.rotation.x = Math.PI / 2;
      group.add(wRing);
      waves.push({ mesh: wRing, phase: i / 3 });
    }

    const titleLbl = makeLabelSprite('ACCESS POINT • WI-FI', 'rgba(12,74,110,0.9)', '#38bdf8');
    titleLbl.position.set(0, 1.25, 0);
    group.add(titleLbl);

    modelRefs = { ledRing, waves };
    return {
      group,
      update: (t) => {
        const is5G = state.apBand === '5GHz';
        const speed = is5G ? 1.3 : 0.65;
        const maxScale = is5G ? 2.4 : 3.4;
        const colorHex = is5G ? 0xa855f7 : 0x38bdf8;
        ledRing.material.color.setHex(colorHex);

        waves.forEach((w) => {
          const p = (t * speed + w.phase) % 1;
          w.mesh.scale.setScalar(0.5 + p * maxScale);
          w.mesh.position.y = 0.15 + p * 0.95;
          w.mesh.material.opacity = (1 - p) * 0.85;
          w.mesh.material.color.setHex(colorHex);
        });
      }
    };
  }

  // 4. SERVER & RACK
  function createServerModel() {
    const group = new THREE.Group();
    const leds = [];

    // Kabinet Rack Server
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.75, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.65 })
    );
    chassis.position.y = 0.25;
    tagInteractive(chassis, 'server-body');
    group.add(chassis);

    // 4 Unit Blade Server + Indikator LED
    for (let i = 0; i < 4; i++) {
      const y = -0.35 + i * 0.4;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(1.04, 0.3, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
      );
      blade.position.set(0, y, 0.53);
      tagInteractive(blade, 'server-body');
      group.add(blade);

      for (let j = 0; j < 3; j++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.032, 10, 10),
          new THREE.MeshBasicMaterial({ color: j === 0 ? 0x22c55e : 0x38bdf8 })
        );
        led.position.set(-0.34 + j * 0.14, y, 0.57);
        group.add(led);
        leds.push(led);
      }
    }

    // Orbit Paket Request-Response Klien
    const reqBall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: 0xc084fc }));
    group.add(reqBall);

    const titleLbl = makeLabelSprite('SERVER RACK • DNS / DHCP', 'rgba(88,28,135,0.9)', '#c084fc');
    titleLbl.position.set(0, 1.48, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t) => {
        leds.forEach((led, idx) => {
          const blink = Math.sin(t * 7 + idx * 1.9) > 0;
          led.material.color.setHex(blink ? 0x22c55e : idx % 3 === 1 ? 0x38bdf8 : 0x1e293b);
        });
        reqBall.position.set(Math.cos(t * 2.2) * 1.1, 0.25 + Math.sin(t * 3.1) * 0.45, Math.sin(t * 2.2) * 1.1);
      }
    };
  }

  // 5. KABEL UTP & RJ-45
  function createUtpModel() {
    const group = new THREE.Group();
    const refs = { wires: [], explodeFactor: 0 };

    const jacket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })
    );
    jacket.rotation.z = Math.PI / 2;
    jacket.position.x = -0.82;
    tagInteractive(jacket, 'utp-explode');
    group.add(jacket);
    refs.jacket = jacket;

    const wireColors = [0xf97316, 0x22c55e, 0x38bdf8, 0xa16207];
    const offsets = [[0.08, 0.08], [0.08, -0.08], [-0.08, 0.08], [-0.08, -0.08]];
    wireColors.forEach((col, i) => {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.78, 12), new THREE.MeshStandardMaterial({ color: col }));
      wire.rotation.z = Math.PI / 2;
      wire.position.set(0.05, offsets[i][0], offsets[i][1]);
      wire.userData.baseY = offsets[i][0];
      wire.userData.baseZ = offsets[i][1];
      tagInteractive(wire, 'utp-explode');
      group.add(wire);
      refs.wires.push(wire);
    });

    const rj45Group = new THREE.Group();
    rj45Group.position.x = 0.65;
    const rjBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.42, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.5, roughness: 0.15 })
    );
    tagInteractive(rjBody, 'utp-explode');
    rj45Group.add(rjBody);

    for (let p = 0; p < 8; p++) {
      const pin = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.05, 0.032),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 })
      );
      pin.position.set(0.28, 0.1, -0.175 + p * 0.05);
      rj45Group.add(pin);
    }
    group.add(rj45Group);
    refs.rj45Group = rj45Group;

    const titleLbl = makeLabelSprite('KABEL UTP & RJ-45', 'rgba(120,53,15,0.9)', '#fbbf24');
    titleLbl.position.set(0, 0.92, 0);
    group.add(titleLbl);

    return {
      group,
      update: () => {
        const target = state.explodeMode ? 1 : 0;
        refs.explodeFactor += (target - refs.explodeFactor) * 0.1;
        refs.jacket.position.x = -0.82 - refs.explodeFactor * 0.35;
        refs.rj45Group.position.x = 0.65 + refs.explodeFactor * 0.45;
        refs.wires.forEach((w) => {
          w.position.y = w.userData.baseY * (1 + refs.explodeFactor * 2.3);
          w.position.z = w.userData.baseZ * (1 + refs.explodeFactor * 2.3);
        });
      }
    };
  }

  // 6. KABEL FIBER OPTIC (LAPISAN + PULSA CAHAYA LASER!)
  function createFiberModel() {
    const group = new THREE.Group();
    const refs = { explodeFactor: 0 };

    // Outer Jacket (Kuning Single-Mode)
    const jacket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.15, 24),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35 })
    );
    jacket.rotation.z = Math.PI / 2;
    jacket.position.x = -0.8;
    tagInteractive(jacket, 'fiber-explode');
    group.add(jacket);

    // Buffer Coating (Biru)
    const coating = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.8 })
    );
    coating.rotation.z = Math.PI / 2;
    coating.position.x = -0.15;
    tagInteractive(coating, 'fiber-explode');
    group.add(coating);

    // Cladding Kaca Transparan
    const cladding = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 1.3, 24),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.45 })
    );
    cladding.rotation.z = Math.PI / 2;
    cladding.position.x = 0.45;
    tagInteractive(cladding, 'fiber-explode');
    group.add(cladding);

    // Inti Serat Kaca (Core) bercahaya
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 2.3, 18),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    core.rotation.z = Math.PI / 2;
    core.position.x = 0.2;
    tagInteractive(core, 'fiber-explode');
    group.add(core);

    // 3 Pulsa Cahaya Laser melesat super cepat di dalam Core
    const pulses = [];
    for (let i = 0; i < 3; i++) {
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      group.add(pulse);
      pulses.push({ mesh: pulse, offset: i / 3 });
    }

    const titleLbl = makeLabelSprite('FIBER OPTIC • PULSA CAHAYA', 'rgba(6,95,70,0.9)', '#34d399');
    titleLbl.position.set(0, 0.95, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t) => {
        const target = state.explodeMode ? 1 : 0;
        refs.explodeFactor += (target - refs.explodeFactor) * 0.1;
        jacket.position.x = -0.8 - refs.explodeFactor * 0.4;
        coating.position.x = -0.15 - refs.explodeFactor * 0.12;
        cladding.position.x = 0.45 + refs.explodeFactor * 0.35;
        pulses.forEach((p) => {
          const prog = (t * 2.2 + p.offset) % 1;
          p.mesh.position.set(-1.1 + prog * 2.5, 0, 0);
        });
      }
    };
  }

  // 7. TOPOLOGI STAR
  function createStarModel() {
    const group = new THREE.Group();
    const refs = { cables: {}, screens: {}, packets: [] };

    const centerSwitch = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.28, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4 })
    );
    tagInteractive(centerSwitch, 'star-switch');
    group.add(centerSwitch);
    refs.centerSwitch = centerSwitch;

    const switchLed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    switchLed.position.y = 0.2;
    group.add(switchLed);
    refs.switchLed = switchLed;

    const clients = [
      { id: 'pc1', label: 'PC-1', pos: [0, 0, -1.5], color: 0x38bdf8, pColor: 0xfacc15 },
      { id: 'pc2', label: 'PC-2', pos: [1.5, 0, 0], color: 0x38bdf8, pColor: 0x34d399 },
      { id: 'laptop', label: 'LAPTOP', pos: [0, 0, 1.5], color: 0xa855f7, pColor: 0xc084fc },
      { id: 'printer', label: 'PRINTER', pos: [-1.5, 0, 0], color: 0x22c55e, pColor: 0x38bdf8 }
    ];

    clients.forEach((c, idx) => {
      const node = new THREE.Group();
      node.position.set(c.pos[0], 0, c.pos[2]);
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.14), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      mon.position.y = 0.15;
      tagInteractive(mon, c.id === 'pc1' ? 'star-cable-pc1' : 'star-normal');
      node.add(mon);

      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.23, 0.16), new THREE.MeshBasicMaterial({ color: c.color }));
      scr.position.y = 0.15;
      node.add(scr);
      refs.screens[c.id] = { mesh: scr, normalColor: c.color };
      group.add(node);

      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      cable.position.set(c.pos[0] * 0.48, 0, c.pos[2] * 0.48);
      if (c.pos[2] !== 0) cable.rotation.x = Math.PI / 2;
      else cable.rotation.z = Math.PI / 2;
      tagInteractive(cable, c.id === 'pc1' ? 'star-cable-pc1' : 'star-normal');
      group.add(cable);
      refs.cables[c.id] = cable;

      const pkt = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), new THREE.MeshBasicMaterial({ color: c.pColor }));
      group.add(pkt);
      refs.packets.push({ id: c.id, mesh: pkt, endPos: c.pos, offset: idx * 0.7 });
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
          const active = state.starMode === 'normal' || (state.starMode === 'cable-cut' && p.id !== 'pc1');
          p.mesh.visible = active;
          if (active) {
            const w = (Math.sin(t * 2.6 + p.offset) + 1) / 2;
            p.mesh.position.set(p.endPos[0] * w * 0.9, 0.14, p.endPos[2] * w * 0.9);
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
      Object.entries(modelRefs.cables).forEach(([id, c]) => c.material.color.setHex(id === 'pc1' ? 0xef4444 : 0x38bdf8));
      Object.entries(modelRefs.screens).forEach(([id, s]) => s.mesh.material.color.setHex(id === 'pc1' ? 0xef4444 : s.normalColor));
    } else {
      modelRefs.centerSwitch.material.color.setHex(0xb91c1c);
      modelRefs.switchLed.material.color.setHex(0xef4444);
      Object.values(modelRefs.cables).forEach((c) => c.material.color.setHex(0x64748b));
      Object.values(modelRefs.screens).forEach((s) => s.mesh.material.color.setHex(0xef4444));
    }
  }

  // 8. TOPOLOGI BUS (BACKBONE + 2 TERMINATOR + 4 PC)
  function createBusModel() {
    const group = new THREE.Group();
    const screens = [];

    // Kabel Backbone Utama
    const backbone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 3.0, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })
    );
    backbone.rotation.z = Math.PI / 2;
    tagInteractive(backbone, 'bus-backbone');
    group.add(backbone);

    // 2 Terminator di ujung kiri & kanan
    [-1.55, 1.55].forEach((x) => {
      const term = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.18, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.5 })
      );
      term.rotation.z = Math.PI / 2;
      term.position.x = x;
      tagInteractive(term, 'bus-terminator');
      group.add(term);
    });

    // 4 PC terhubung ke Backbone via T-Connector
    [-1.05, -0.35, 0.35, 1.05].forEach((x, idx) => {
      const z = idx % 2 === 0 ? -0.68 : 0.68;
      const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.62, 10), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      drop.rotation.x = Math.PI / 2;
      drop.position.set(x, 0, z * 0.5);
      group.add(drop);

      const pc = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.14), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      pc.position.set(x, 0.14, z);
      tagInteractive(pc, 'bus-backbone');
      group.add(pc);

      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.2, 0.16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      scr.position.set(x, 0.14, z);
      group.add(scr);
      screens.push(scr);
    });

    const busPacket = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    group.add(busPacket);

    const titleLbl = makeLabelSprite('TOPOLOGI BUS • BACKBONE', 'rgba(120,53,15,0.9)', '#fbbf24');
    titleLbl.position.set(0, 1.0, 0);
    group.add(titleLbl);

    modelRefs = { backbone, screens, busPacket };
    return {
      group,
      update: (t) => {
        backbone.material.color.setHex(state.busBroken ? 0xef4444 : 0xf59e0b);
        screens.forEach((s) => s.material.color.setHex(state.busBroken ? 0xef4444 : 0x38bdf8));
        busPacket.visible = !state.busBroken;
        if (!state.busBroken) {
          busPacket.position.set(Math.sin(t * 2.2) * 1.35, 0.12, 0);
        }
      }
    };
  }

  // 9. TOPOLOGI RING (CINCIN + TOKEN BERPUTAR SEARAH)
  function createRingModel() {
    const group = new THREE.Group();
    const screens = [];

    const ringLoop = new THREE.Mesh(
      new THREE.TorusGeometry(1.18, 0.045, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45 })
    );
    ringLoop.rotation.x = Math.PI / 2;
    tagInteractive(ringLoop, 'ring-toggle');
    group.add(ringLoop);

    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const x = Math.cos(ang) * 1.18;
      const z = Math.sin(ang) * 1.18;

      const pc = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.3, 0.22), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      pc.position.set(x, 0.18, z);
      pc.lookAt(0, 0.18, 0);
      tagInteractive(pc, 'ring-toggle');
      group.add(pc);

      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.24), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      scr.position.set(x, 0.18, z);
      scr.lookAt(0, 0.18, 0);
      group.add(scr);
      screens.push(scr);
    }

    const tokenBall = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    group.add(tokenBall);

    const titleLbl = makeLabelSprite('TOPOLOGI RING • TOKEN', 'rgba(12,74,110,0.9)', '#38bdf8');
    titleLbl.position.set(0, 1.05, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t) => {
        ringLoop.material.color.setHex(state.ringBroken ? 0xef4444 : 0x38bdf8);
        screens.forEach((s) => s.material.color.setHex(state.ringBroken ? 0xef4444 : 0x22c55e));
        tokenBall.visible = !state.ringBroken;
        if (!state.ringBroken) {
          const ang = t * 2.0;
          tokenBall.position.set(Math.cos(ang) * 1.18, 0.12, Math.sin(ang) * 1.18);
        }
      }
    };
  }

  // Helper membuat silinder kabel yang presisi antara 2 titik 3D
  function createCableBetween(p1, p2, radius = 0.028, color = 0x38bdf8) {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const dist = v1.distanceTo(v2);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, dist, 10),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 })
    );
    mesh.position.copy(v1).add(v2).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
    return mesh;
  }

  // 10. TOPOLOGI MESH (FULL MESH: 4 NODE + 6 KABEL PENUH + AUTO REROUTE!)
  function createMeshModel() {
    const group = new THREE.Group();
    const coords = [
      [-1.1, 0.05, 0.95],  // Node A (Depan Kiri)
      [1.1, 0.05, 0.95],   // Node B (Depan Kanan)
      [1.1, 0.05, -0.95],  // Node C (Belakang Kanan)
      [-1.1, 0.05, -0.95]  // Node D (Belakang Kiri)
    ];

    coords.forEach((pt, i) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.34, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4 })
      );
      box.position.set(pt[0], pt[1] + 0.12, pt[2]);
      tagInteractive(box, 'mesh-toggle');
      group.add(box);

      const topLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xa855f7 })
      );
      topLed.position.set(pt[0], pt[1] + 0.34, pt[2]);
      group.add(topLed);

      const lbl = makeLabelSprite(`NODE ${String.fromCharCode(65 + i)}`, 'rgba(15,23,42,0.88)', '#c084fc');
      lbl.scale.set(0.65, 0.17, 1);
      lbl.position.set(pt[0], pt[1] + 0.56, pt[2]);
      group.add(lbl);
    });

    // 6 Kabel Full Mesh (4 sisi + 2 diagonal silang)
    const pairs = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];
    const cables = pairs.map(([a, b], idx) => {
      const c = createCableBetween(coords[a], coords[b], 0.03, idx >= 4 ? 0xa855f7 : 0x38bdf8);
      tagInteractive(c, 'mesh-toggle');
      group.add(c);
      return c;
    });

    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    group.add(packet);

    const titleLbl = makeLabelSprite('TOPOLOGI MESH • FULL REDUNDANCY', 'rgba(88,28,135,0.92)', '#c084fc');
    titleLbl.position.set(0, 1.15, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t) => {
        // Kabel 0 (depan A-B) putus jika state.meshReroute = true
        cables[0].material.color.setHex(state.meshReroute ? 0xef4444 : 0x38bdf8);
        cables[0].material.emissive.setHex(state.meshReroute ? 0x991b1b : 0x0284c7);
        cables[4].material.color.setHex(state.meshReroute ? 0x22c55e : 0xa855f7);
        cables[1].material.color.setHex(state.meshReroute ? 0x22c55e : 0x38bdf8);

        const p = (t * 0.9) % 1;
        if (!state.meshReroute) {
          // Langsung dari A -> B lewat kabel depan
          const vA = new THREE.Vector3(...coords[0]);
          const vB = new THREE.Vector3(...coords[1]);
          packet.position.lerpVectors(vA, vB, p).y += 0.14;
          packet.material.color.setHex(0xfacc15);
        } else {
          // Auto Reroute! A -> C (diagonal) -> B
          const vA = new THREE.Vector3(...coords[0]);
          const vC = new THREE.Vector3(...coords[2]);
          const vB = new THREE.Vector3(...coords[1]);
          if (p < 0.5) packet.position.lerpVectors(vA, vC, p * 2).y += 0.16;
          else packet.position.lerpVectors(vC, vB, (p - 0.5) * 2).y += 0.16;
          packet.material.color.setHex(0x22c55e);
        }
      }
    };
  }

  // 11. TOPOLOGI TREE (POHON: ROOT SWITCH -> 2 SUB-SWITCH -> 4 PC KLIEN)
  function createTreeModel() {
    const group = new THREE.Group();
    const posRoot = [0, 0.95, 0];
    const posSubA = [-1.0, 0.15, 0];
    const posSubB = [1.0, 0.15, 0];
    const posClients = [
      [-1.45, -0.58, 0.35],
      [-0.55, -0.58, -0.35],
      [0.55, -0.58, -0.35],
      [1.45, -0.58, 0.35]
    ];

    // Switch Root Utama (Puncak)
    const rootBox = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.42), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4 }));
    rootBox.position.set(...posRoot);
    tagInteractive(rootBox, 'tree-root');
    group.add(rootBox);

    const rootLbl = makeLabelSprite('ROOT SWITCH', 'rgba(2,132,199,0.9)', '#7dd3fc');
    rootLbl.scale.set(0.82, 0.2, 1);
    rootLbl.position.set(0, 1.32, 0);
    group.add(rootLbl);

    // 2 Sub-Switch (Lab A & Lab B)
    const subA = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.35), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    subA.position.set(...posSubA);
    tagInteractive(subA, 'tree-branch');
    group.add(subA);

    const subB = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.35), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    subB.position.set(...posSubB);
    tagInteractive(subB, 'tree-normal');
    group.add(subB);

    // Kabel Root -> SubA & SubB
    const cRootA = createCableBetween(posRoot, posSubA, 0.032, 0x38bdf8);
    const cRootB = createCableBetween(posRoot, posSubB, 0.032, 0x38bdf8);
    group.add(cRootA, cRootB);

    // 4 Klien di bawah SubA (0,1) dan SubB (2,3)
    const clientScreens = [];
    const clientCables = [];
    posClients.forEach((pcPos, idx) => {
      const parentPos = idx < 2 ? posSubA : posSubB;
      const cab = createCableBetween(parentPos, pcPos, 0.024, 0x34d399);
      group.add(cab);
      clientCables.push(cab);

      const pc = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.14), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      pc.position.set(...pcPos);
      tagInteractive(pc, idx < 2 ? 'tree-branch' : 'tree-normal');
      group.add(pc);

      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.17, 0.16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      scr.position.set(...pcPos);
      group.add(scr);
      clientScreens.push(scr);
    });

    const pktA = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    const pktB = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
    group.add(pktA, pktB);

    const titleLbl = makeLabelSprite('TOPOLOGI TREE (POHON)', 'rgba(6,95,70,0.9)', '#34d399');
    titleLbl.position.set(0, 1.68, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t) => {
        const isBranchDown = state.treeMode === 'branch-down';
        const isRootDown = state.treeMode === 'root-down';

        rootBox.material.color.setHex(isRootDown ? 0xef4444 : 0x0284c7);
        subA.material.color.setHex(isBranchDown ? 0xef4444 : 0x10b981);
        subB.material.color.setHex(0x10b981);

        cRootA.material.color.setHex(isRootDown || isBranchDown ? 0xef4444 : 0x38bdf8);
        cRootB.material.color.setHex(isRootDown ? 0xef4444 : 0x38bdf8);

        clientScreens.forEach((s, i) => {
          const dead = isRootDown || (isBranchDown && i < 2);
          s.material.color.setHex(dead ? 0xef4444 : 0x38bdf8);
          clientCables[i].material.color.setHex(dead ? 0x64748b : 0x34d399);
        });

        // Paket Lab A (berhenti jika branch-down atau root-down)
        pktA.visible = !isBranchDown && !isRootDown;
        if (pktA.visible) {
          const w = (Math.sin(t * 2.5) + 1) / 2;
          pktA.position.lerpVectors(new THREE.Vector3(...posClients[0]), new THREE.Vector3(...posRoot), w);
        }

        // Paket Lab B (tetap jalan di dalam cabang B jika hanya Lab A yang rusak!)
        pktB.visible = !isRootDown;
        if (pktB.visible) {
          const w = (Math.sin(t * 2.5 + 1.4) + 1) / 2;
          const topTarget = isBranchDown ? new THREE.Vector3(...posSubB) : new THREE.Vector3(...posRoot);
          pktB.position.lerpVectors(new THREE.Vector3(...posClients[3]), topTarget, w);
        }
      }
    };
  }

  // 12. TOPOLOGI HYBRID (GABUNGAN STAR DI KIRI + RING DI KANAN LEWAT ROUTER TENGAH)
  function createHybridModel() {
    const group = new THREE.Group();

    // Router Penghubung Tengah
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.28, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.4, metalness: 0.5 })
    );
    tagInteractive(bridge, 'hybrid-bridge');
    group.add(bridge);

    // KIRI: Mini Topologi STAR (pusat di x = -1.15)
    const starCenter = [-1.15, 0, 0];
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.28), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    sw.position.set(...starCenter);
    tagInteractive(sw, 'hybrid-star');
    group.add(sw);

    const starNodes = [[-1.65, 0, -0.58], [-1.75, 0, 0.48], [-0.95, 0, 0.72]];
    starNodes.forEach((pt) => {
      group.add(createCableBetween(starCenter, pt, 0.022, 0x38bdf8));
      const n = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.14), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      n.position.set(pt[0], 0.1, pt[2]);
      tagInteractive(n, 'hybrid-star');
      group.add(n);
    });
    group.add(createCableBetween(starCenter, [0, 0, 0], 0.032, 0xfacc15));

    // KANAN: Mini Topologi RING (pusat di x = +1.15)
    const ringCenter = [1.15, 0, 0];
    const miniRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.03, 12, 40),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.4 })
    );
    miniRing.rotation.x = Math.PI / 2;
    miniRing.position.set(...ringCenter);
    tagInteractive(miniRing, 'hybrid-ring');
    group.add(miniRing);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const n = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.18), new THREE.MeshStandardMaterial({ color: 0xc084fc }));
      n.position.set(ringCenter[0] + Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55);
      tagInteractive(n, 'hybrid-ring');
      group.add(n);
    }
    group.add(createCableBetween([0, 0, 0], [0.6, 0, 0], 0.032, 0xfacc15));

    // Paket Lintas Topologi (Star <-> Bridge <-> Ring) & Token Ring
    const crossPacket = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    const ringToken = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    group.add(crossPacket, ringToken);

    const lblStar = makeLabelSprite('GRUP STAR', 'rgba(12,74,110,0.9)', '#38bdf8');
    lblStar.scale.set(0.7, 0.18, 1);
    lblStar.position.set(-1.2, 0.65, 0);
    const lblRing = makeLabelSprite('GRUP RING', 'rgba(88,28,135,0.9)', '#c084fc');
    lblRing.scale.set(0.7, 0.18, 1);
    lblRing.position.set(1.2, 0.65, 0);
    const titleLbl = makeLabelSprite('TOPOLOGI HYBRID • STAR + RING', 'rgba(120,53,15,0.92)', '#facc15');
    titleLbl.position.set(0, 1.2, 0);
    group.add(lblStar, lblRing, titleLbl);

    return {
      group,
      update: (t, dt) => {
        const speed = state.hybridBoost > 0 ? 2.4 : 1.0;
        if (state.hybridBoost > 0) state.hybridBoost = Math.max(0, state.hybridBoost - dt);
        const w = Math.sin(t * 2.0 * speed);
        crossPacket.position.set(w * 1.15, 0.18 + Math.abs(Math.cos(t * 2.0 * speed)) * 0.16, 0);

        const ang = t * 2.5 * speed;
        ringToken.position.set(ringCenter[0] + Math.cos(ang) * 0.55, 0.12, Math.sin(ang) * 0.55);
      }
    };
  }

  // 10. FIREWALL SHIELD (LEGENDARY — BLOKIR PAKET MERAH, LOLOSKAN PAKET HIJAU!)
  function createFirewallModel() {
    const group = new THREE.Group();

    // Perisai Heksagonal Hologram
    const shieldWall = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 0.12, 6),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.72,
        metalness: 0.5
      })
    );
    shieldWall.rotation.x = Math.PI / 2;
    tagInteractive(shieldWall, 'firewall-shield');
    group.add(shieldWall);

    const shieldRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.055, 12, 6),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    group.add(shieldRim);

    // Paket Hijau (Aman -> Menembus Firewall menuju LAN)
    const safePacket = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    group.add(safePacket);

    // Paket Merah (Serangan -> Memantul Diblokir oleh Firewall!)
    const threatPacket = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    group.add(threatPacket);

    const titleLbl = makeLabelSprite('🛡️ FIREWALL • LEGENDARY', 'rgba(120,53,15,0.94)', '#facc15');
    titleLbl.position.set(0, 1.4, 0);
    group.add(titleLbl);

    return {
      group,
      update: (t, dt) => {
        shieldRim.rotation.z = t * 0.6;
        if (state.firewallAttackSurge > 0) {
          state.firewallAttackSurge = Math.max(0, state.firewallAttackSurge - dt);
          shieldWall.material.color.setHex(0xef4444);
          shieldWall.scale.setScalar(1.08 + Math.sin(t * 25) * 0.04);
        } else {
          shieldWall.material.color.setHex(0xf59e0b);
          shieldWall.scale.setScalar(1.0);
        }

        // Paket aman lolos dari depan (z=1.6) menembus perisai ke belakang (z=-1.6)
        const sp = (t * 0.75) % 1;
        safePacket.position.set(-0.32, 0.15, 1.6 - sp * 3.2);

        // Paket serangan merah datang dari depan (z=1.7) lalu terpental di perisai (z=0.18)!
        const tp = (t * 1.15) % 1;
        const tz = tp < 0.5 ? 1.7 - tp * 3.04 : 0.18 + (tp - 0.5) * 3.04;
        const tx = tp < 0.5 ? 0.35 : 0.35 + (tp - 0.5) * 1.1;
        threatPacket.position.set(tx, -0.1, tz);
        threatPacket.rotation.x += dt * 4;
        threatPacket.rotation.y += dt * 5;
      }
    };
  }

  // ==========================================================================
  // SPAWN KARAKTER & LOADER .GLB OTOMATIS
  // ==========================================================================
  async function tryLoadCustomGlb(key) {
    const url = CUSTOM_GLB_PATHS[key];
    if (!url || typeof THREE.GLTFLoader === 'undefined') return null;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || ct.includes('text/html')) return null;
      return await new Promise((resolve) => {
        new THREE.GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, () => resolve(null));
      });
    } catch (_) {
      return null;
    }
  }

  async function spawnCharacter(id) {
    const idx = CHARACTERS.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const char = CHARACTERS[idx];

    state.currentIndex = idx;
    state.currentTarget = id;
    state.explodeMode = false;
    state.starMode = 'normal';
    state.busBroken = false;
    state.ringBroken = false;
    state.meshReroute = false;
    state.treeMode = 'normal';
    interactiveMeshes = [];
    modelRefs = {};

    while (activeModelHolder.children.length > 0) {
      activeModelHolder.remove(activeModelHolder.children[0]);
    }

    // Warna cincin bawah mengikuti rarity karakter!
    const ringColors = { common: 0x38bdf8, rare: 0x0ea5e9, epic: 0xa855f7, legendary: 0xfacc15 };
    targetRing.material.color.setHex(ringColors[char.rarity] || 0x38bdf8);

    const customGlb = await tryLoadCustomGlb(id);
    if (customGlb) {
      customGlb.traverse((ch) => {
        if (ch.isMesh) tagInteractive(ch, `${id}-body`);
      });
      activeModelHolder.add(customGlb);
      currentAnimFn = null;
    } else {
      let built;
      switch (id) {
        case 'router': built = createRouterModel(); break;
        case 'switch': built = createSwitchModel(); break;
        case 'ap': built = createAccessPointModel(); break;
        case 'server': built = createServerModel(); break;
        case 'utp': built = createUtpModel(); break;
        case 'fiber': built = createFiberModel(); break;
        case 'star': built = createStarModel(); break;
        case 'bus': built = createBusModel(); break;
        case 'ring': built = createRingModel(); break;
        case 'mesh': built = createMeshModel(); break;
        case 'tree': built = createTreeModel(); break;
        case 'hybrid': built = createHybridModel(); break;
        case 'firewall': built = createFirewallModel(); break;
        default: built = createRouterModel();
      }
      activeModelHolder.add(built.group);
      currentAnimFn = built.update;
    }

    // Animasi muncul membesar ala Pokemon (tetap pertahankan skala pilihan user atau reset ke 1.0x)
    arObjectRoot.scale.setScalar(0.15);
    setZoomScale(1.0);

    // Update UI Dock, Strip, Kartu Materi Live & Tab Materi
    dockCharEmoji.textContent = char.emoji;
    dockCharName.textContent = char.name;
    dockCharIndex.textContent = `${idx + 1} / ${CHARACTERS.length}`;
    updateLiveMateriCard(id);
    renderSpecialActionButtons(id);
    renderCharacterStrip();
    switchMateriTab(char.topicTab);
    sfx.tap();
  }

  // ==========================================================================
  // KARTU MATERI LIVE DI LAYAR KAMERA & TOMBOL SIMULASI SPESIAL
  // ==========================================================================
  function updateLiveMateriCard(id, override = null) {
    const char = CHAR_MAP[id];
    const isCaught = state.caughtSet.has(id);

    toastTag.textContent = override?.tag || `${char.num} • ${char.categoryLabel}`;
    toastRarity.textContent = char.rarity.toUpperCase();
    toastRarity.className = `rarity-pill rarity-${char.rarity}`;

    toastCaughtBadge.textContent = isCaught ? '✅ TERTANGKAP' : '⚡ LIAR';
    toastCaughtBadge.classList.toggle('caught', isCaught);

    toastTitle.textContent = override?.title || char.fullTitle;
    toastBody.textContent = override?.desc || char.desc;
    toastTip.innerHTML = override?.tip || char.tip;
  }

  btnToggleLiveInfo.addEventListener('click', () => {
    const collapsed = toastContentWrap.classList.toggle('collapsed');
    btnToggleLiveInfo.textContent = collapsed ? '▾' : '▴';
  });

  function addSpecialBtn(label, onClick, isActive = false, isDanger = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'special-btn';
    if (isActive) btn.classList.add('active');
    if (isDanger) btn.classList.add('danger-active');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    specialActionsEl.appendChild(btn);
    return btn;
  }

  function renderSpecialActionButtons(id) {
    specialActionsEl.innerHTML = '';

    if (id === 'router') {
      addSpecialBtn('🔵 Info Port WAN', () => handlePartInteraction('router-wan'));
      addSpecialBtn('🟡 Info Port LAN', () => handlePartInteraction('router-lan'));
    } else if (id === 'switch') {
      addSpecialBtn('⚡ Uji Forwarding MAC Address', () => handlePartInteraction('switch-port'));
    } else if (id === 'ap') {
      addSpecialBtn('📶 Mode 2.4 GHz (Jauh)', () => {
        state.apBand = '2.4GHz';
        renderSpecialActionButtons('ap');
        handlePartInteraction('ap-band');
      }, state.apBand === '2.4GHz');
      addSpecialBtn('⚡ Mode 5 GHz (Cepat)', () => {
        state.apBand = '5GHz';
        renderSpecialActionButtons('ap');
        handlePartInteraction('ap-band');
      }, state.apBand === '5GHz');
    } else if (id === 'server') {
      ['DHCP', 'DNS', 'WEB'].forEach((srv) => {
        addSpecialBtn(`🖥️ Uji ${srv}`, () => {
          state.serverService = srv;
          renderSpecialActionButtons('server');
          handlePartInteraction('server-service');
        }, state.serverService === srv);
      });
    } else if (id === 'utp') {
      addSpecialBtn(state.explodeMode ? '🔗 Satukan Kabel UTP' : '🔍 Bedah UTP & RJ-45', () => {
        handlePartInteraction('utp-explode');
        renderSpecialActionButtons('utp');
      }, state.explodeMode);
    } else if (id === 'fiber') {
      addSpecialBtn(state.explodeMode ? '🔗 Satukan Lapisan' : '🔍 Bedah Lapisan Fiber', () => {
        handlePartInteraction('fiber-explode');
        renderSpecialActionButtons('fiber');
      }, state.explodeMode);
    } else if (id === 'star') {
      addSpecialBtn('✅ Normal', () => setStarSim('normal'), state.starMode === 'normal');
      addSpecialBtn('⚠️ 1 Kabel Putus', () => setStarSim('cable-cut'), false, state.starMode === 'cable-cut');
      addSpecialBtn('❌ Switch Rusak', () => setStarSim('switch-down'), false, state.starMode === 'switch-down');
    } else if (id === 'bus') {
      addSpecialBtn('✅ Normal', () => {
        state.busBroken = false;
        renderSpecialActionButtons('bus');
        updateLiveMateriCard('bus');
        sfx.tap();
      }, !state.busBroken);
      addSpecialBtn('❌ Backbone Putus', () => {
        state.busBroken = true;
        renderSpecialActionButtons('bus');
        handlePartInteraction('bus-broken-info');
      }, false, state.busBroken);
    } else if (id === 'ring') {
      addSpecialBtn('✅ Token Berjalan', () => {
        state.ringBroken = false;
        renderSpecialActionButtons('ring');
        updateLiveMateriCard('ring');
        sfx.tap();
      }, !state.ringBroken);
      addSpecialBtn('❌ 1 Jalur Putus', () => {
        state.ringBroken = true;
        renderSpecialActionButtons('ring');
        handlePartInteraction('ring-broken-info');
      }, false, state.ringBroken);
    } else if (id === 'mesh') {
      addSpecialBtn('✅ Jalur Langsung', () => {
        state.meshReroute = false;
        renderSpecialActionButtons('mesh');
        updateLiveMateriCard('mesh');
        sfx.tap();
      }, !state.meshReroute);
      addSpecialBtn('⚠️ 1 Jalur Putus (Auto Reroute)', () => {
        state.meshReroute = true;
        renderSpecialActionButtons('mesh');
        handlePartInteraction('mesh-reroute-info');
      }, false, state.meshReroute);
    } else if (id === 'tree') {
      addSpecialBtn('✅ Normal', () => setTreeSim('normal'), state.treeMode === 'normal');
      addSpecialBtn('⚠️ Cabang Lab A Rusak', () => setTreeSim('branch-down'), false, state.treeMode === 'branch-down');
      addSpecialBtn('❌ Root Utama Rusak', () => setTreeSim('root-down'), false, state.treeMode === 'root-down');
    } else if (id === 'hybrid') {
      addSpecialBtn('⚡ Uji Kirim Lintas Topologi (Star ↔ Ring)', () => handlePartInteraction('hybrid-bridge'));
    } else if (id === 'firewall') {
      addSpecialBtn('🚨 Uji Blokir Serangan Siber', () => handlePartInteraction('firewall-shield'));
    }
  }

  function setTreeSim(mode) {
    state.treeMode = mode;
    renderSpecialActionButtons('tree');
    sfx.tap();
    if (mode === 'normal') {
      updateLiveMateriCard('tree');
    } else if (mode === 'branch-down') {
      updateLiveMateriCard('tree', {
        tag: 'SIMULASI TOPOLOGI TREE',
        title: '⚠️ Sub-Switch Cabang Lab A Rusak!',
        desc: 'Perhatikan sisi kiri (Lab A) padam merah, namun sisi kanan (Lab B) TETAP dapat berkomunikasi secara lokal di cabangnya sendiri!'
      });
    } else {
      updateLiveMateriCard('tree', {
        tag: 'SIMULASI TOPOLOGI TREE',
        title: '❌ Switch Root Utama Rusak!',
        desc: 'Ketika Switch Root di puncak pohon bermasalah, komunikasi lintas cabang (antar Lab A dan Lab B) langsung terputus!'
      });
    }
  }

  function setStarSim(mode) {
    state.starMode = mode;
    applyStarVisualState();
    renderSpecialActionButtons('star');
    sfx.tap();

    if (mode === 'normal') {
      updateLiveMateriCard('star');
    } else if (mode === 'cable-cut') {
      updateLiveMateriCard('star', {
        tag: 'SIMULASI TOPOLOGI STAR',
        title: '⚠️ 1 Kabel Klien (PC-1) Putus!',
        desc: 'Kabel merah ke PC-1 terputus & paketnya berhenti, namun PC-2, Laptop, dan Printer TETAP bisa bertukar data lewat Switch pusat!',
        tip: '✅ Keunggulan Star: gangguan 1 kabel klien terisolasi & mudah dicek.'
      });
    } else {
      updateLiveMateriCard('star', {
        tag: 'SIMULASI TOPOLOGI STAR',
        title: '❌ Switch Pusat Bermasalah!',
        desc: 'Ketika Switch di tengah rusak (merah), seluruh paket data ke semua klien berhenti total!',
        tip: '⚠️ Kelemahan Star: ketergantungan pada perangkat pusat (Single Point of Failure).'
      });
    }
  }

  // ==========================================================================
  // INTERAKSI SENTUH (RAYCASTING 3D)
  // ==========================================================================
  const raycaster = new THREE.Raycaster();
  const tapCoords = new THREE.Vector2();

  function handlePartInteraction(partId) {
    state.wobbleTimer = 0.42;
    toastContentWrap.classList.remove('collapsed');
    btnToggleLiveInfo.textContent = '▴';

    if (partId === 'router-wan') {
      sfx.tap();
      updateLiveMateriCard('router', {
        title: '🔵 Port WAN (Wide Area Network)',
        desc: 'Port WAN berwarna biru menghubungkan Router ke jaringan luar / modem ISP agar jaringan lokal bisa terhubung ke Internet.'
      });
    } else if (partId === 'router-lan') {
      sfx.tap();
      updateLiveMateriCard('router', {
        title: '🟡 Port LAN (Local Area Network)',
        desc: 'Port LAN berwarna kuning (1-4) menghubungkan Router ke perangkat jaringan lokal seperti Switch, komputer PC, atau Access Point.'
      });
    } else if (partId === 'router-body') {
      sfx.tap();
      updateLiveMateriCard('router');
    } else if (partId === 'switch-port') {
      sfx.tap();
      if (modelRefs.targetPortIndex !== undefined) {
        modelRefs.targetPortIndex = 1 + Math.floor(Math.random() * 7);
      }
      const pNum = (modelRefs.targetPortIndex || 2) + 1;
      updateLiveMateriCard('switch', {
        title: `🔀 MAC Forwarding → Port #${pNum}`,
        desc: `Switch mengenali MAC Address tujuan dan langsung meneruskan frame data secara spesifik ke Port #${pNum} tanpa mengganggu port lain.`
      });
    } else if (partId === 'ap-body' || partId === 'ap-band') {
      sfx.tap();
      if (partId === 'ap-body') {
        state.apBand = state.apBand === '2.4GHz' ? '5GHz' : '2.4GHz';
        renderSpecialActionButtons('ap');
      }
      updateLiveMateriCard('ap', {
        title: state.apBand === '5GHz' ? '⚡ Access Point: Band 5 GHz (Cepat)' : '📶 Access Point: Band 2.4 GHz (Jangkauan Luas)',
        desc: state.apBand === '5GHz'
          ? 'Frekuensi 5 GHz menawarkan kecepatan transfer data lebih tinggi dan minim gangguan, cocok untuk ruangan terbuka berjarak dekat.'
          : 'Frekuensi 2.4 GHz memiliki daya tembus dinding lebih baik dan jangkauan sinyal lebih luas untuk mencakup banyak ruangan.'
      });
    } else if (partId === 'server-body' || partId === 'server-service') {
      sfx.tap();
      if (partId === 'server-body') {
        const order = ['DHCP', 'DNS', 'WEB'];
        state.serverService = order[(order.indexOf(state.serverService) + 1) % order.length];
        renderSpecialActionButtons('server');
      }
      const info = {
        DHCP: 'DHCP Server membagikan alamat IP, Subnet Mask, dan Gateway secara otomatis ke setiap komputer/HP yang terhubung.',
        DNS: 'DNS Server menerjemahkan nama domain yang mudah diingat manusia (misal google.com) menjadi alamat IP numerik.',
        WEB: 'Web Server menyimpan dan melayani halaman website (HTML/CSS/JS) ketika diakses oleh browser klien melalui HTTP/HTTPS.'
      };
      updateLiveMateriCard('server', {
        title: `🖥️ Layanan Server Aktif: ${state.serverService}`,
        desc: info[state.serverService]
      });
    } else if (partId === 'utp-explode') {
      sfx.tap();
      state.explodeMode = !state.explodeMode;
      renderSpecialActionButtons('utp');
      updateLiveMateriCard('utp', {
        title: state.explodeMode ? '🔍 Mode Bedah UTP & RJ-45 Aktif!' : '🔌 Kabel UTP & RJ-45',
        desc: state.explodeMode
          ? 'Terlihat 4 pasang kabel tembaga warna (Oranye, Hijau, Biru, Cokelat) yang terpilin masuk ke 8 pin emas konektor RJ-45!'
          : CHAR_MAP.utp.desc
      });
    } else if (partId === 'fiber-explode') {
      sfx.tap();
      state.explodeMode = !state.explodeMode;
      renderSpecialActionButtons('fiber');
      updateLiveMateriCard('fiber', {
        title: state.explodeMode ? '🔍 Bedah Lapisan Fiber Optic!' : '✨ Kabel Fiber Optic',
        desc: state.explodeMode
          ? 'Lapisan dari luar ke dalam: Jacket Kuning (pelindung), Coating Biru, Cladding Kaca (pemantul), dan Core di tengah tempat pulsa cahaya melesat!'
          : CHAR_MAP.fiber.desc
      });
    } else if (partId === 'star-cable-pc1') {
      setStarSim(state.starMode === 'cable-cut' ? 'normal' : 'cable-cut');
    } else if (partId === 'star-switch') {
      setStarSim(state.starMode === 'switch-down' ? 'normal' : 'switch-down');
    } else if (partId === 'star-normal') {
      setStarSim('normal');
    } else if (partId === 'bus-backbone' || partId === 'bus-terminator' || partId === 'bus-broken-info') {
      sfx.tap();
      if (partId !== 'bus-broken-info') {
        state.busBroken = !state.busBroken;
        renderSpecialActionButtons('bus');
      }
      updateLiveMateriCard('bus', state.busBroken ? {
        title: '❌ Backbone Bus Putus / Terminator Lepas!',
        desc: 'Karena semua PC berbagi 1 kabel utama, putusnya Backbone atau lepasnya Terminator membuat sinyal memantul & seluruh jaringan langsung lumpuh!'
      } : null);
    } else if (partId === 'ring-toggle' || partId === 'ring-broken-info') {
      sfx.tap();
      if (partId !== 'ring-broken-info') {
        state.ringBroken = !state.ringBroken;
        renderSpecialActionButtons('ring');
      }
      updateLiveMateriCard('ring', state.ringBroken ? {
        title: '❌ 1 Jalur Ring Terputus!',
        desc: 'Ketika satu segmen kabel cincin terputus, aliran Token satu arah terhenti sehingga komunikasi antar node terganggu.'
      } : null);
    } else if (partId === 'mesh-toggle' || partId === 'mesh-reroute-info') {
      sfx.tap();
      if (partId !== 'mesh-reroute-info') {
        state.meshReroute = !state.meshReroute;
        renderSpecialActionButtons('mesh');
      }
      updateLiveMateriCard('mesh', state.meshReroute ? {
        title: '✅ Jalur Depan Putus → Auto Reroute Aktif!',
        desc: 'Meskipun kabel depan Node A-B putus (merah), paket data hijau langsung berbelok melewati jalur cadangan diagonal (A → C → B)! Jaringan tetap aktif 100%.'
      } : null);
    } else if (partId === 'tree-root') {
      setTreeSim(state.treeMode === 'root-down' ? 'normal' : 'root-down');
    } else if (partId === 'tree-branch') {
      setTreeSim(state.treeMode === 'branch-down' ? 'normal' : 'branch-down');
    } else if (partId === 'tree-normal') {
      setTreeSim('normal');
    } else if (partId === 'hybrid-bridge' || partId === 'hybrid-star' || partId === 'hybrid-ring') {
      sfx.tap();
      state.hybridBoost = 1.6;
      const msgMap = {
        'hybrid-bridge': {
          title: '⚡ Paket Melintas Antar Topologi (Star ↔ Ring)!',
          desc: 'Router/Bridge di tengah menerjemahkan dan meneruskan paket data secara mulus antara jaringan Topologi Star (kiri) dan Topologi Ring (kanan).'
        },
        'hybrid-star': {
          title: '⭐ Segmen Kiri: Topologi Star',
          desc: 'Segmen gedung kiri memakai Topologi Star (Switch + 3 klien) lalu terhubung ke Router pusat menuju segmen topologi lainnya.'
        },
        'hybrid-ring': {
          title: '⭕ Segmen Kanan: Topologi Ring',
          desc: 'Segmen gedung kanan memakai Topologi Ring dengan aliran Token melingkar yang disatukan ke jaringan besar lewat Router penghubung.'
        }
      };
      updateLiveMateriCard('hybrid', msgMap[partId]);
    } else if (partId === 'firewall-shield') {
      sfx.shieldBlock();
      state.firewallAttackSurge = 1.2;
      updateLiveMateriCard('firewall', {
        title: '🛡️ SERANGAN DIBLOKIR OLEH FIREWALL!',
        desc: 'Lihat paket merah berbahaya terpental oleh perisai Firewall, sedangkan paket hijau yang sah tetap diizinkan masuk menuju jaringan lokal (LAN)!'
      });
    }
  }

  // ==========================================================================
  // STRIP 10 KARAKTER & GALERI KOLEKSI ("NET-DEX")
  // ==========================================================================
  function getRankTitle(count) {
    if (count >= 13) return '🏆 Master TJKT';
    if (count >= 9) return '⚡ Network Engineer';
    if (count >= 5) return '🔧 Teknisi LAN';
    if (count >= 1) return '📡 Penjelajah Jaringan';
    return 'Pemula Jaringan';
  }

  function renderCharacterStrip() {
    characterStripEl.innerHTML = '';
    let activeBtn = null;
    CHARACTERS.forEach((char) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isCaught = state.caughtSet.has(char.id);
      const isActive = char.id === state.currentTarget;
      btn.className = 'strip-chip' + (isActive ? ' active' : '') + (isCaught ? ' caught' : '');
      btn.textContent = `${char.emoji} ${char.name}${isCaught ? ' ✅' : ''}`;
      btn.addEventListener('click', () => spawnCharacter(char.id));
      characterStripEl.appendChild(btn);
      if (isActive) activeBtn = btn;
    });
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function updateNetDexHUD() {
    const count = state.caughtSet.size;
    const rank = getRankTitle(count);
    caughtCountEl.textContent = count;
    xpDisplayEl.textContent = `XP: ${state.xp} • ${rank}`;
    renderCharacterStrip();
  }

  function renderCollectionGallery() {
    const total = CHARACTERS.length;
    const count = state.caughtSet.size;
    const pct = Math.round((count / total) * 100);

    colProgressText.textContent = `${count} / ${total} Karakter Tertangkap (${pct}%)`;
    colProgressFill.style.width = `${pct}%`;
    colRankBadge.textContent = getRankTitle(count);

    collectionGrid.innerHTML = '';
    const list =
      state.collectionFilter === 'all'
        ? CHARACTERS
        : CHARACTERS.filter((c) => c.category === state.collectionFilter);

    list.forEach((char) => {
      const isCaught = state.caughtSet.has(char.id);
      const card = document.createElement('div');
      card.className = `dex-card ${isCaught ? 'caught' : 'locked'}`;

      card.innerHTML = `
        <div class="dex-card-top">
          <span class="dex-num">${char.num}</span>
          <span class="rarity-pill rarity-${char.rarity}">${char.rarity.toUpperCase()}</span>
        </div>
        <div class="dex-emoji-wrap">${char.emoji}</div>
        <h4>${isCaught ? char.name : '🔒 ' + char.name}</h4>
        <p>${isCaught ? char.shortDesc : `Belum tertangkap • Kategori: ${char.categoryLabel}`}</p>
        <button type="button" class="dex-action-btn">
          ${isCaught ? '👁️ Lihat di AR' : '🎯 Munculkan & Tangkap'}
        </button>
      `;

      card.querySelector('.dex-action-btn').addEventListener('click', () => {
        collectionModal.classList.add('hidden');
        spawnCharacter(char.id);
      });

      collectionGrid.appendChild(card);
    });
  }

  function openCollectionModal() {
    renderCollectionGallery();
    collectionModal.classList.remove('hidden');
    sfx.tap();
  }

  document.getElementById('btn-open-collection').addEventListener('click', openCollectionModal);
  document.getElementById('btn-open-collection-dock').addEventListener('click', openCollectionModal);
  document.getElementById('btn-quick-roster').addEventListener('click', openCollectionModal);
  document.getElementById('btn-close-collection').addEventListener('click', () => collectionModal.classList.add('hidden'));

  document.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.collectionFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-chip').forEach((b) => b.classList.toggle('active', b === btn));
      renderCollectionGallery();
    });
  });

  document.getElementById('btn-reset-collection').addEventListener('click', () => {
    if (confirm('Reset seluruh koleksi Net-Dex dan XP kembali ke 0?')) {
      state.caughtSet.clear();
      state.xp = 0;
      saveProgress();
      updateNetDexHUD();
      updateLiveMateriCard(state.currentTarget);
      renderCollectionGallery();
    }
  });

  // Navigasi Prev / Next / Radar Acak
  document.getElementById('btn-prev-char').addEventListener('click', () => {
    const prev = (state.currentIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    spawnCharacter(CHARACTERS[prev].id);
  });

  document.getElementById('btn-next-char').addEventListener('click', () => {
    const next = (state.currentIndex + 1) % CHARACTERS.length;
    spawnCharacter(CHARACTERS[next].id);
  });

  document.getElementById('btn-random-spawn').addEventListener('click', () => {
    // Prioritaskan karakter liar yang belum tertangkap!
    const uncaught = CHARACTERS.filter((c) => !state.caughtSet.has(c.id) && c.id !== state.currentTarget);
    const pool = uncaught.length > 0 ? uncaught : CHARACTERS.filter((c) => c.id !== state.currentTarget);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      spawnCharacter(pick.id);
      showSnackbar(`🎲 Sinyal terdeteksi: ${pick.emoji} ${pick.name}!`);
    }
  });

  // ==========================================================================
  // MEKANIK LEMPAR NET-BALL 3D + PARTIKEL + KUIS TANGKAP
  // ==========================================================================
  const netBallGroup = new THREE.Group();
  netBallGroup.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.4 })
    ),
    new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    )
  );
  const midRing = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.028, 12, 32), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
  midRing.rotation.x = Math.PI / 2;
  const coreBtn = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  coreBtn.position.z = 0.22;
  netBallGroup.add(midRing, coreBtn);
  netBallGroup.visible = false;
  scene.add(netBallGroup);

  const burstParticles = [];
  const pGeo = new THREE.SphereGeometry(0.045, 8, 8);
  for (let i = 0; i < 24; i++) {
    const pm = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0xfacc15 }));
    pm.visible = false;
    scene.add(pm);
    burstParticles.push({ mesh: pm, vel: new THREE.Vector3(), life: 0 });
  }

  const ballStartPos = new THREE.Vector3();
  const ballEndPos = new THREE.Vector3();

  function triggerBurstParticles() {
    const center = arObjectRoot.position.clone().add(new THREE.Vector3(0, 0.72 * state.targetScale, 0));
    burstParticles.forEach((p) => {
      p.mesh.visible = true;
      p.mesh.position.copy(center);
      p.vel.set((Math.random() - 0.5) * 0.16, (Math.random() - 0.5) * 0.16, (Math.random() - 0.5) * 0.16);
      p.life = 1.0;
    });
  }

  document.getElementById('btn-throw-ball').addEventListener('click', () => {
    if (state.ballFlying || !quizModal.classList.contains('hidden')) return;
    if (state.surfaceMode === 'scanning') {
      showSnackbar('📐 Letakkan objek 3D di lantai/meja terlebih dahulu!');
      return;
    }
    // Hitung titik awal lemparan tepat di depan-bawah arah pandang kamera saat ini
    const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    ballStartPos.copy(camera.position).addScaledVector(camDir, 0.85).addScaledVector(camUp, -0.35);
    ballEndPos.copy(arObjectRoot.position).add(new THREE.Vector3(0, 0.72 * state.targetScale, 0));

    state.ballFlying = true;
    state.ballProgress = 0;
    netBallGroup.visible = true;
    sfx.throwBall();
  });

  function openCatchQuiz(id) {
    const char = CHAR_MAP[id];
    quizTitle.textContent = `Menangkap ${char.fullTitle}`;
    quizQuestion.textContent = char.quiz.question;
    quizOptions.innerHTML = '';
    quizFeedback.classList.add('hidden');
    quizFeedback.textContent = '';

    char.quiz.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${optText}`;
      btn.addEventListener('click', () => {
        const allBtns = quizOptions.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach((b) => (b.disabled = true));

        if (idx === char.quiz.answerIndex) {
          btn.classList.add('correct');
          sfx.catchSuccess();
          const newlyCaught = !state.caughtSet.has(id);
          const xpReward = newlyCaught
            ? char.rarity === 'legendary' ? 250 : char.rarity === 'epic' ? 150 : 100
            : 25;
          state.caughtSet.add(id);
          state.xp += xpReward;
          saveProgress();
          updateNetDexHUD();
          updateLiveMateriCard(id);

          quizFeedback.innerHTML = `<strong>🎉 TERTANGKAP! (+${xpReward} XP)</strong><br>${char.quiz.explanation}<br><em>Masuk ke Galeri Koleksi (${state.caughtSet.size}/${CHARACTERS.length})!</em>`;
          quizFeedback.classList.remove('hidden');

          setTimeout(() => quizModal.classList.add('hidden'), 2400);
        } else {
          btn.classList.add('wrong');
          sfx.wrong();
          quizFeedback.innerHTML = `<strong>😅 Karakter Lepas!</strong> Baca penjelasan materi di layar kamera atau 📘 Materi, lalu coba pilih jawaban yang tepat!`;
          quizFeedback.classList.remove('hidden');
          setTimeout(() => {
            allBtns.forEach((b) => {
              b.disabled = false;
              b.classList.remove('wrong');
            });
          }, 1100);
        }
      });
      quizOptions.appendChild(btn);
    });

    quizModal.classList.remove('hidden');
  }

  document.getElementById('btn-close-quiz').addEventListener('click', () => quizModal.classList.add('hidden'));

  // ==========================================================================
  // KAMERA AR, GYROSCOPE, DRAG PUTAR 360°, & MATERI DRAWER
  // ==========================================================================
  async function startCamera(facing = state.facingMode) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoEl.srcObject = mediaStream;
      await videoEl.play();
      state.cameraActive = true;
      state.facingMode = facing;
      videoEl.classList.add('active');
      videoEl.classList.toggle('mirrored', facing === 'user');
      studioGrid.visible = false;
    } catch (_) {
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

  // ==========================================================================
  // TRUE 3-DOF GYROSCOPE CAMERA + STABILISASI ANTI-JITTER + DETEKSI LANTAI
  // ==========================================================================
  const gyroZee = new THREE.Vector3(0, 0, 1);
  const gyroEuler = new THREE.Euler();
  const gyroQ0 = new THREE.Quaternion();
  const gyroQ1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 sumbu X (kamera belakang)
  const rawDeviceQuat = new THREE.Quaternion();
  const targetCameraQuat = new THREE.Quaternion();
  const smoothedCameraQuat = new THREE.Quaternion();
  let gyroYawOffsetRad = null;
  let gyroListenerBound = false;
  let gyroFallbackTimer = null;

  function getScreenOrientationDeg() {
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
      return window.screen.orientation.angle;
    }
    return typeof window.orientation === 'number' ? window.orientation : 0;
  }

  function updateGyroQuaternion(alphaDeg, betaDeg, gammaDeg) {
    const alpha = THREE.MathUtils.degToRad(alphaDeg || 0);
    const beta = THREE.MathUtils.degToRad(betaDeg || 0);
    const gamma = THREE.MathUtils.degToRad(gammaDeg || 0);
    const orient = THREE.MathUtils.degToRad(getScreenOrientationDeg());

    if (gyroYawOffsetRad === null) {
      gyroYawOffsetRad = alpha;
    }

    // Kurangi yaw awal agar saat mulai kamera langsung menghadap sumbu -Z (depan)
    const relativeAlpha = alpha - gyroYawOffsetRad;
    gyroEuler.set(beta, relativeAlpha, -gamma, 'YXZ');
    rawDeviceQuat.setFromEuler(gyroEuler);
    rawDeviceQuat.multiply(gyroQ1);
    rawDeviceQuat.multiply(gyroQ0.setFromAxisAngle(gyroZee, -orient));
    targetCameraQuat.copy(rawDeviceQuat);
  }

  async function enableGyroscope() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') {
          state.gyroEnabled = false;
          btnToggleGyro.classList.remove('active');
          showSnackbar('ℹ️ Izin Gyro ditolak, menggunakan mode lantai virtual stabil');
          return;
        }
      } catch (_) {}
    }

    if (!gyroListenerBound) {
      gyroListenerBound = true;
      window.addEventListener('deviceorientation', (e) => {
        if (e.alpha === null && e.beta === null && e.gamma === null) return;
        const firstSignal = !state.gyroHasData;
        state.gyroHasData = true;
        updateGyroQuaternion(e.alpha, e.beta, e.gamma);

        if (firstSignal && state.cameraActive && state.gyroEnabled) {
          camera.position.set(0, 1.45, 0);
          smoothedCameraQuat.copy(targetCameraQuat);
          camera.quaternion.copy(smoothedCameraQuat);
          clearTimeout(gyroFallbackTimer);
          showSnackbar('🧭 Gyroscope 3-DOF Aktif! Arahkan ke lantai/meja');
        }
      });
    }

    // Jika dalam 1.5 detik tidak ada data gyro (misal Laptop / HP tanpa giroskop),
    // aktifkan mode lantai virtual stabil agar tetap mudah meletakkan 3D!
    clearTimeout(gyroFallbackTimer);
    gyroFallbackTimer = setTimeout(() => {
      if (!state.gyroHasData && state.cameraActive) {
        camera.position.set(0, 1.45, 3.8);
        camera.lookAt(0, 0.45, 0);
        if (state.surfaceMode === 'scanning') {
          setSurfaceReadyUI(true, '✅ Permukaan Meja/Lantai Siap! Tap atau tekan tombol di bawah');
          surfaceReticle.position.set(0, 0.01, 0);
          retOuter.material.color.setHex(0x22c55e);
          retInner.material.color.setHex(0x22c55e);
        }
      }
    }, 1500);
  }

  function setSurfaceReadyUI(ready, message) {
    state.surfaceReady = ready;
    if (scannerDot) scannerDot.classList.toggle('ready', ready);
    if (scannerText && message) scannerText.textContent = message;
    if (btnPlaceSurface) btnPlaceSurface.disabled = !ready;
  }

  function startSurfaceScan() {
    state.surfaceMode = 'scanning';
    state.surfaceReady = false;
    arObjectRoot.visible = false;
    surfaceReticle.visible = true;
    surfaceScannerBar.classList.remove('hidden');

    if (state.cameraActive && state.gyroHasData && state.gyroEnabled) {
      camera.position.set(0, 1.45, 0);
      setSurfaceReadyUI(false, '📐 Arahkan kamera miring ke bawah ke lantai atau meja...');
    } else {
      camera.position.set(0, 1.45, 3.8);
      camera.lookAt(0, 0.45, 0);
      surfaceReticle.position.set(0, 0.01, 0);
      retOuter.material.color.setHex(0x22c55e);
      retInner.material.color.setHex(0x22c55e);
      setSurfaceReadyUI(true, '✅ Permukaan Dasar Terdeteksi! Tap untuk meletakkan 3D');
    }
  }

  function placeObjectOnSurface(worldPos) {
    arObjectRoot.position.set(worldPos.x, 0, worldPos.z);
    arObjectRoot.visible = true;
    surfaceReticle.visible = false;
    surfaceScannerBar.classList.add('hidden');
    state.surfaceMode = 'placed';

    // Hadapkan objek secara tegak lurus stabil menghadap kamera pada bidang horizontal
    const dx = camera.position.x - arObjectRoot.position.x;
    const dz = camera.position.z - arObjectRoot.position.z;
    state.targetRotY = Math.atan2(dx, dz);
    state.targetRotX = 0;

    arObjectRoot.scale.setScalar(0.15);
    state.wobbleTimer = 0.45;
    sfx.tap();
    showSnackbar('📍 Objek 3D terkunci stabil di permukaan lantai!');
  }

  function recenterObjectInFront() {
    setZoomScale(1.0);
    state.targetRotX = 0;

    if (state.cameraActive && state.gyroHasData && state.gyroEnabled) {
      // Hitung titik lantai tepat 2.8m di depan arah pandang horizontal kamera saat ini
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      fwd.y = 0;
      if (fwd.lengthSq() < 0.001) fwd.set(0, 0, -1);
      fwd.normalize();
      const targetPt = new THREE.Vector3(
        camera.position.x + fwd.x * 2.8,
        0,
        camera.position.z + fwd.z * 2.8
      );
      placeObjectOnSurface(targetPt);
    } else {
      camera.position.set(0, 1.45, 3.8);
      camera.lookAt(0, 0.55, 0);
      arObjectRoot.position.set(0, 0, 0);
      state.targetRotY = 0.35;
      arObjectRoot.visible = true;
      surfaceReticle.visible = false;
      surfaceScannerBar.classList.add('hidden');
      state.surfaceMode = 'placed';
    }
    showSnackbar('🎯 Objek dipusatkan stabil di depan kamera (1.0x)');
    sfx.tap();
  }

  // ==========================================================================
  // SNACKBAR FEEDBACK & KONTROL ZOOM (TOMBOL + / - , PINCH 2 JARI, & WHEEL)
  // ==========================================================================
  const snackbarEl = document.getElementById('status-snackbar');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  let snackbarTimer = null;

  function showSnackbar(message) {
    if (!snackbarEl) return;
    snackbarEl.textContent = message;
    snackbarEl.classList.remove('hidden');
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(() => snackbarEl.classList.add('hidden'), 2000);
  }

  function setZoomScale(newScale, announce = false) {
    state.targetScale = Math.max(0.4, Math.min(2.4, newScale));
    if (zoomLevelText) {
      zoomLevelText.textContent = `${state.targetScale.toFixed(1)}x`;
    }
    if (announce) {
      showSnackbar(`🔍 Ukuran Karakter: ${state.targetScale.toFixed(1)}x`);
    }
  }

  btnZoomIn.addEventListener('click', () => {
    setZoomScale(state.targetScale + 0.2, true);
    sfx.tap();
  });

  btnZoomOut.addEventListener('click', () => {
    setZoomScale(state.targetScale - 0.2, true);
    sfx.tap();
  });

  zoomLevelText.addEventListener('click', () => {
    setZoomScale(1.0, true);
    sfx.tap();
  });

  btnPlaceSurface.addEventListener('click', () => {
    if (state.surfaceReady) {
      placeObjectOnSurface(surfaceReticle.position);
    }
  });

  btnRescanFloor.addEventListener('click', () => {
    if (!state.cameraActive) {
      showSnackbar('ℹ️ Mode Studio 3D: objek sudah menapak di lantai');
      return;
    }
    startSurfaceScan();
    sfx.tap();
    showSnackbar('📐 Pindai ulang permukaan lantai/meja...');
  });

  btnToggleGyro.addEventListener('click', () => {
    state.gyroEnabled = !state.gyroEnabled;
    btnToggleGyro.classList.toggle('active', state.gyroEnabled);

    if (state.gyroEnabled && state.gyroHasData && state.cameraActive) {
      camera.position.set(0, 1.45, 0);
      gyroYawOffsetRad = null; // Kalibrasi ulang arah depan
      showSnackbar('🧭 Gyroscope ON: Kamera mengikuti sudut HP');
    } else {
      camera.position.set(0, 1.45, 3.8);
      camera.lookAt(0, 0.55, 0);
      arObjectRoot.position.set(0, 0, 0);
      showSnackbar('🔒 Gyroscope OFF: Mode Kamera Terkunci Stabil');
    }
    sfx.tap();
  });

  async function enterExperience(useCamera) {
    sfx.ensure();
    startScreen.classList.add('hidden');
    hudTop.classList.remove('hidden');
    hudBottom.classList.remove('hidden');
    zoomControls.classList.remove('hidden');
    interactionToast.classList.remove('hidden');
    state.started = true;

    updateNetDexHUD();
    await spawnCharacter('router');

    if (useCamera) {
      await startCamera('environment');
      await enableGyroscope();
      // Mulai dengan pemindaian permukaan dasar lantai/meja agar 3D muncul di atas permukaan & stabil!
      startSurfaceScan();
    } else {
      studioGrid.visible = true;
      camera.position.set(0, 1.45, 3.8);
      camera.lookAt(0, 0.55, 0);
      arObjectRoot.position.set(0, 0, 0);
      arObjectRoot.visible = true;
      state.surfaceMode = 'placed';
    }
  }

  document.getElementById('btn-start-ar').addEventListener('click', () => enterExperience(true));
  document.getElementById('btn-start-preview').addEventListener('click', () => enterExperience(false));

  document.getElementById('btn-switch-cam').addEventListener('click', async () => {
    const nextFacing = state.facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(nextFacing);
    showSnackbar(state.facingMode === 'environment' ? '📷 Kamera Belakang Aktif' : '🤳 Kamera Depan Aktif');
    sfx.tap();
  });

  document.getElementById('btn-recenter').addEventListener('click', recenterObjectInFront);

  // Multi-Touch Pinch-to-Zoom (2 Jari) + Drag Putar (1 Jari) + Tap Raycasting / Place Surface
  const activePointers = new Map();
  let initialPinchDist = null;
  let initialPinchScale = 1.0;
  let didPinchGesture = false;

  function getPinchDistance() {
    const pts = Array.from(activePointers.values());
    if (pts.length < 2) return null;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  canvasContainer.addEventListener('pointerdown', (e) => {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 2) {
      state.isDragging = false;
      didPinchGesture = true;
      initialPinchDist = getPinchDistance();
      initialPinchScale = state.targetScale;
    } else if (activePointers.size === 1) {
      state.isDragging = true;
      didPinchGesture = false;
      state.pointerDownPos = { x: e.clientX, y: e.clientY };
      state.prevPointer = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 2 && initialPinchDist) {
      const curDist = getPinchDistance();
      if (curDist && initialPinchDist > 10) {
        const ratio = curDist / initialPinchDist;
        setZoomScale(initialPinchScale * ratio);
      }
      return;
    }

    if (state.isDragging && activePointers.size === 1 && state.surfaceMode === 'placed') {
      const dx = e.clientX - state.prevPointer.x;
      const dy = e.clientY - state.prevPointer.y;
      state.targetRotY += dx * 0.01;
      // Pada mode lantai stabil, batasi kemiringan X agar tetap tegak di atas permukaan
      if (!state.cameraActive || !state.gyroHasData) {
        state.targetRotX = Math.max(-0.45, Math.min(0.65, state.targetRotX + dy * 0.006));
      }
      state.prevPointer = { x: e.clientX, y: e.clientY };
    }
  });

  function handlePointerEnd(e) {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.delete(e.pointerId);

    if (activePointers.size < 2) {
      initialPinchDist = null;
    }

    if (activePointers.size === 0) {
      const wasDragging = state.isDragging;
      state.isDragging = false;
      if (wasDragging && !didPinchGesture && state.started) {
        const moved = Math.hypot(e.clientX - state.pointerDownPos.x, e.clientY - state.pointerDownPos.y);
        if (moved < 12) {
          // Jika sedang memindai permukaan & reticle hijau siap -> Tap layar langsung meletakkan 3D!
          if (state.surfaceMode === 'scanning') {
            if (state.surfaceReady) {
              placeObjectOnSurface(surfaceReticle.position);
            } else {
              showSnackbar('📐 Miringkan HP ke bawah menghadap lantai/meja');
            }
            return;
          }

          tapCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
          tapCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(tapCoords, camera);
          const hits = raycaster.intersectObjects(interactiveMeshes, false);
          if (hits.length > 0 && hits[0].object.userData.partId) {
            handlePartInteraction(hits[0].object.userData.partId);
          }
        }
      }
    }
  }

  window.addEventListener('pointerup', handlePointerEnd);
  window.addEventListener('pointercancel', handlePointerEnd);

  canvasContainer.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      setZoomScale(state.targetScale - e.deltaY * 0.0012);
    },
    { passive: false }
  );

  function switchMateriTab(topicId) {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.topic === topicId));
    document.querySelectorAll('.topic-content').forEach((sec) => sec.classList.toggle('active', sec.id === `topic-${topicId}`));
  }

  function setDrawerOpen(open) {
    materiDrawer.classList.toggle('open', open);
    materiDrawer.setAttribute('aria-hidden', String(!open));
    if (drawerBackdrop) drawerBackdrop.classList.toggle('hidden', !open);
  }

  document.getElementById('btn-open-materi').addEventListener('click', () => {
    setDrawerOpen(true);
    sfx.tap();
  });

  document.getElementById('btn-close-materi').addEventListener('click', () => setDrawerOpen(false));
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => setDrawerOpen(false));
  }

  collectionModal.addEventListener('click', (e) => {
    if (e.target === collectionModal) collectionModal.classList.add('hidden');
  });
  quizModal.addEventListener('click', (e) => {
    if (e.target === quizModal) quizModal.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      collectionModal.classList.add('hidden');
      quizModal.classList.add('hidden');
      setDrawerOpen(false);
    }
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchMateriTab(btn.dataset.topic));
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ==========================================================================
  // RENDER & ANIMATION LOOP UTAMA (GYRO STABIL + SURFACE RETICLE + 3D LOCKED)
  // ==========================================================================
  const clock = new THREE.Clock();
  const centerRay = new THREE.Raycaster();
  const centerNdc = new THREE.Vector2(0, 0);
  const floorHitPoint = new THREE.Vector3();
  const camForward = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    // 1. Update Kamera 3-DOF dari Gyroscope dengan Deadzone Anti-Jitter + Adaptive SLERP
    if (state.cameraActive && state.gyroHasData && state.gyroEnabled) {
      const angleDiff = smoothedCameraQuat.angleTo(targetCameraQuat);
      if (angleDiff > 0.0045) {
        // Getaran kecil dihaluskan kuat (0.09), gerakan putar cepat direspons mulus (0.26)
        const slerpFactor = THREE.MathUtils.clamp(angleDiff * 1.35, 0.09, 0.26);
        smoothedCameraQuat.slerp(targetCameraQuat, slerpFactor);
      }
      camera.quaternion.copy(smoothedCameraQuat);
    }

    // 2. Mode Pemindaian Permukaan Dasar (Lantai / Meja)
    if (state.surfaceMode === 'scanning' && state.started) {
      if (state.cameraActive && state.gyroHasData && state.gyroEnabled) {
        camera.getWorldDirection(camForward);
        centerRay.setFromCamera(centerNdc, camera);
        const hit = centerRay.ray.intersectPlane(groundPlane, floorHitPoint);

        if (hit && camForward.y < -0.14) {
          const dist = Math.hypot(floorHitPoint.x - camera.position.x, floorHitPoint.z - camera.position.z);
          if (dist >= 1.0 && dist <= 6.0) {
            surfaceReticle.position.x += (floorHitPoint.x - surfaceReticle.position.x) * 0.2;
            surfaceReticle.position.z += (floorHitPoint.z - surfaceReticle.position.z) * 0.2;
            surfaceReticle.position.y = 0.01;
            retOuter.material.color.setHex(0x22c55e);
            retInner.material.color.setHex(0x22c55e);
            retGrid.visible = true;
            if (!state.surfaceReady) {
              setSurfaceReadyUI(true, '✅ Permukaan Lantai/Meja Terdeteksi! Tap untuk Letakkan 3D');
            }
          } else {
            retOuter.material.color.setHex(0xf59e0b);
            retInner.material.color.setHex(0xf59e0b);
            retGrid.visible = false;
            if (state.surfaceReady) {
              setSurfaceReadyUI(false, '📐 Dekatkan / miringkan sedikit ke permukaan lantai...');
            }
          }
        } else {
          // Belum menghadap lantai -> posisikan reticle redup di depan bawah agar tetap terlihat
          const approxX = camera.position.x + camForward.x * 2.5;
          const approxZ = camera.position.z + camForward.z * 2.5;
          surfaceReticle.position.x += (approxX - surfaceReticle.position.x) * 0.12;
          surfaceReticle.position.z += (approxZ - surfaceReticle.position.z) * 0.12;
          surfaceReticle.position.y = 0.01;
          retOuter.material.color.setHex(0xf59e0b);
          retInner.material.color.setHex(0xf59e0b);
          retGrid.visible = false;
          if (state.surfaceReady) {
            setSurfaceReadyUI(false, '📐 Arahkan kamera miring ke bawah ke lantai atau meja...');
          }
        }
      }
      // Animasi denyut halus reticle lantai
      const rPulse = 1 + Math.sin(t * 4) * 0.05;
      retOuter.scale.setScalar(rPulse);
      retInner.rotation.z = t * 1.4;
    }

    // 3. Objek 3D Terkunci Stabil Menapak di Lantai (y = 0, tanpa goyang melayang)
    if (!state.isDragging && state.surfaceMode === 'placed') {
      state.targetRotY += dt * 0.18;
    }

    let wobbleScale = 1.0;
    if (state.wobbleTimer > 0) {
      state.wobbleTimer = Math.max(0, state.wobbleTimer - dt);
      wobbleScale = 1 + Math.sin(state.wobbleTimer * 28) * 0.1;
    }

    const curS = arObjectRoot.scale.x;
    const goalS = state.targetScale * wobbleScale;
    arObjectRoot.scale.setScalar(curS + (goalS - curS) * 0.14);

    // Putaran objek tetap halus di tempat tanpa bergeser dari lantai
    arObjectRoot.rotation.x += (state.targetRotX - arObjectRoot.rotation.x) * 0.12;
    arObjectRoot.rotation.y += (state.targetRotY - arObjectRoot.rotation.y) * 0.12;
    targetRing.rotation.z = t * 0.6;

    if (currentAnimFn && state.surfaceMode === 'placed') {
      currentAnimFn(t, dt);
    }

    // 4. Animasi Lempar Net-Ball 3D di World-Space (akurat dari sudut gyro mana pun)
    if (state.ballFlying) {
      state.ballProgress += dt * 2.1;
      const p = Math.min(1, state.ballProgress);
      netBallGroup.position.lerpVectors(ballStartPos, ballEndPos, p);
      netBallGroup.position.y += Math.sin(p * Math.PI) * 1.1;
      netBallGroup.rotation.x -= dt * 14;
      netBallGroup.scale.setScalar(1.0 - p * 0.3);

      if (p >= 1) {
        state.ballFlying = false;
        netBallGroup.visible = false;
        state.wobbleTimer = 0.55;
        sfx.hit();
        triggerBurstParticles();
        flashOverlay.classList.add('flash');
        setTimeout(() => flashOverlay.classList.remove('flash'), 240);
        setTimeout(() => openCatchQuiz(state.currentTarget), 360);
      }
    }

    // 5. Partikel Ledakan Tangkap
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
