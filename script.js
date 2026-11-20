/* ============================================================================
   SCRIPT.JS — Logika WebAR Edukasi TJKT Kelas X (A-Frame + AR.js)
   Berisi:
   1. Konfigurasi & Loader Otomatis Model 3D (.glb/.gltf) + Fallback Primitif
   2. Kontrol Panel Materi / Info (Buka-Tutup & Pindah Tab Topik)
   3. Deteksi Event Marker AR.js (Marker 1: Hiro, Marker 2: Kanji)
   4. Kontrol Pilihan Perangkat Keras (Router, Switch, UTP & RJ-45)
   5. Simulasi Interaktif Topologi Star (Normal, 1 Kabel Putus, Switch Rusak)
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // KONFIGURASI MODEL 3D KUSTOM (.GLB / .GLTF)
  // Letakkan file .glb di folder assets/models/ dengan nama di bawah ini,
  // atau ubah path sesuai nama file model 3D Anda sendiri.
  // Jika file belum ada, aplikasi otomatis menggunakan fallback primitif A-Frame.
  // --------------------------------------------------------------------------
  const CUSTOM_MODELS = {
    router: 'assets/models/router.glb',
    switch: 'assets/models/switch.glb',
    utp: 'assets/models/utp-rj45.glb'
  };

  // Cache pengecekan ketersediaan file .glb agar tidak berulang-ulang fetch
  const glbAvailabilityCache = {};

  // Referensi Elemen UI
  const materiDrawer = document.getElementById('materi-drawer');
  const btnToggleMateri = document.getElementById('btn-toggle-materi');
  const btnCloseMateri = document.getElementById('btn-close-materi');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const topicContents = document.querySelectorAll('.topic-content');

  const onboardingBanner = document.getElementById('onboarding-banner');
  const btnCloseOnboarding = document.getElementById('btn-close-onboarding');

  const markerModal = document.getElementById('marker-modal');
  const btnShowMarkers = document.getElementById('btn-show-markers');
  const btnCloseMarkerModal = document.getElementById('btn-close-marker-modal');

  const markerDot = document.getElementById('marker-dot');
  const markerStatusText = document.getElementById('marker-status-text');
  const controlsPerangkat = document.getElementById('controls-perangkat');
  const controlsTopologi = document.getElementById('controls-topologi');

  // Referensi Elemen Scene AR (Marker 1 - Perangkat Keras)
  const markerPerangkat = document.getElementById('marker-perangkat');
  const customGlbWrapper = document.getElementById('custom-glb-wrapper');
  const fallbackWrapper = document.getElementById('fallback-perangkat-wrapper');
  const primitiveModels = {
    router: document.getElementById('model-router'),
    switch: document.getElementById('model-switch'),
    utp: document.getElementById('model-utp')
  };

  // Referensi Elemen Scene AR (Marker 2 - Topologi Star)
  const markerTopologi = document.getElementById('marker-topologi');
  const starStatusText = document.getElementById('star-status-text');
  const starSwitchBox = document.getElementById('star-switch-box');
  const starSwitchLed = document.getElementById('star-switch-led');
  const cables = {
    pc1: document.getElementById('cable-pc1'),
    pc2: document.getElementById('cable-pc2'),
    laptop: document.getElementById('cable-laptop'),
    printer: document.getElementById('cable-printer')
  };
  const screens = {
    pc1: document.getElementById('screen-pc1'),
    pc2: document.getElementById('screen-pc2'),
    laptop: document.getElementById('screen-laptop'),
    printer: document.getElementById('screen-printer')
  };
  const packets = {
    pc1: document.getElementById('packet-pc1'),
    pc2: document.getElementById('packet-pc2'),
    laptop: document.getElementById('packet-laptop'),
    printer: document.getElementById('packet-printer')
  };

  let activeMarkers = {
    perangkat: false,
    topologi: false
  };

  // ==========================================================================
  // 1. KONTROL PANEL MATERI / INFO (BUKA-TUTUP & TAB TOPIK)
  // ==========================================================================
  function setMateriOpen(isOpen) {
    materiDrawer.classList.toggle('open', isOpen);
    materiDrawer.setAttribute('aria-hidden', String(!isOpen));
    btnToggleMateri.setAttribute('aria-expanded', String(isOpen));
  }

  function switchTopic(topicId) {
    tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.topic === topicId);
    });
    topicContents.forEach((sec) => {
      sec.classList.toggle('active', sec.id === `topic-${topicId}`);
    });
  }

  btnToggleMateri.addEventListener('click', () => {
    const currentlyOpen = materiDrawer.classList.contains('open');
    setMateriOpen(!currentlyOpen);
  });

  btnCloseMateri.addEventListener('click', () => setMateriOpen(false));

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchTopic(btn.dataset.topic));
  });

  // Tutup panduan awal
  btnCloseOnboarding.addEventListener('click', () => {
    onboardingBanner.classList.add('hidden');
  });

  // Modal Daftar Marker Hiro & Kanji
  btnShowMarkers.addEventListener('click', () => {
    markerModal.classList.remove('hidden');
  });

  btnCloseMarkerModal.addEventListener('click', () => {
    markerModal.classList.add('hidden');
  });

  markerModal.addEventListener('click', (e) => {
    if (e.target === markerModal) {
      markerModal.classList.add('hidden');
    }
  });

  // ==========================================================================
  // 2. LOADER MODEL 3D .GLB DENGAN FALLBACK PRIMITIF A-FRAME (MARKER 1)
  // ==========================================================================
  async function checkGlbExists(url) {
    if (url in glbAvailabilityCache) {
      return glbAvailabilityCache[url];
    }
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      // Pastikan bukan halaman HTML 404 fallback
      const exists = response.ok && !contentType.includes('text/html');
      glbAvailabilityCache[url] = exists;
      return exists;
    } catch (_) {
      glbAvailabilityCache[url] = false;
      return false;
    }
  }

  async function selectHardwareDevice(deviceKey) {
    // Update tombol aktif di toolbar bawah
    document.querySelectorAll('[data-device]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.device === deviceKey);
    });

    const glbUrl = CUSTOM_MODELS[deviceKey];
    const hasGlb = glbUrl ? await checkGlbExists(glbUrl) : false;

    if (hasGlb) {
      // Tampilkan model .glb jika tersedia di assets/models/
      fallbackWrapper.setAttribute('visible', 'false');
      customGlbWrapper.setAttribute('gltf-model', glbUrl);
      customGlbWrapper.setAttribute('visible', 'true');
    } else {
      // Gunakan fallback primitif geometris A-Frame agar tetap jelas
      customGlbWrapper.setAttribute('visible', 'false');
      customGlbWrapper.removeAttribute('gltf-model');
      fallbackWrapper.setAttribute('visible', 'true');

      Object.keys(primitiveModels).forEach((key) => {
        if (primitiveModels[key]) {
          primitiveModels[key].setAttribute('visible', String(key === deviceKey));
        }
      });
    }
  }

  document.querySelectorAll('[data-device]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectHardwareDevice(btn.dataset.device);
      switchTopic('topik1');
    });
  });

  // Muat perangkat awal: Router
  selectHardwareDevice('router');

  // ==========================================================================
  // 3. SIMULASI INTERAKTIF TOPOLOGI STAR (MARKER 2)
  // ==========================================================================
  function setStarSimulationMode(mode) {
    document.querySelectorAll('[data-star]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.star === mode);
    });

    if (mode === 'normal') {
      // Semua normal: Switch hijau, semua kabel biru, semua paket data bergerak
      starSwitchBox.setAttribute('color', '#0284c7');
      starSwitchLed.setAttribute('color', '#22c55e');

      Object.values(cables).forEach((c) => c.setAttribute('color', '#38bdf8'));
      screens.pc1.setAttribute('color', '#38bdf8');
      screens.pc2.setAttribute('color', '#38bdf8');
      screens.laptop.setAttribute('color', '#a855f7');
      screens.printer.setAttribute('color', '#22c55e');

      Object.values(packets).forEach((p) => p.setAttribute('visible', 'true'));

      starStatusText.setAttribute('color', '#38bdf8');
      starStatusText.setAttribute(
        'value',
        'TOPOLOGI STAR: NORMAL\nSemua Klien Terhubung via Switch Pusat'
      );
    } else if (mode === 'cable-cut') {
      // Simulasi 1 kabel klien (PC-1) putus: PC-1 mati, klien lain tetap jalan!
      starSwitchBox.setAttribute('color', '#0284c7');
      starSwitchLed.setAttribute('color', '#22c55e');

      cables.pc1.setAttribute('color', '#ef4444');
      cables.pc2.setAttribute('color', '#38bdf8');
      cables.laptop.setAttribute('color', '#38bdf8');
      cables.printer.setAttribute('color', '#38bdf8');

      screens.pc1.setAttribute('color', '#ef4444');
      screens.pc2.setAttribute('color', '#38bdf8');
      screens.laptop.setAttribute('color', '#a855f7');
      screens.printer.setAttribute('color', '#22c55e');

      packets.pc1.setAttribute('visible', 'false');
      packets.pc2.setAttribute('visible', 'true');
      packets.laptop.setAttribute('visible', 'true');
      packets.printer.setAttribute('visible', 'true');

      starStatusText.setAttribute('color', '#fbbf24');
      starStatusText.setAttribute(
        'value',
        'SIMULASI: KABEL PC-1 PUTUS\nKlien Lain (PC-2, Laptop, Printer) Tetap Aktif!'
      );
    } else if (mode === 'switch-down') {
      // Simulasi Switch pusat bermasalah: Seluruh jaringan terhenti!
      starSwitchBox.setAttribute('color', '#b91c1c');
      starSwitchLed.setAttribute('color', '#ef4444');

      Object.values(cables).forEach((c) => c.setAttribute('color', '#64748b'));
      Object.values(screens).forEach((s) => s.setAttribute('color', '#ef4444'));
      Object.values(packets).forEach((p) => p.setAttribute('visible', 'false'));

      starStatusText.setAttribute('color', '#f87171');
      starStatusText.setAttribute(
        'value',
        'SIMULASI: SWITCH PUSAT RUSAK\nSeluruh Jaringan Terputus (Single Point of Failure)'
      );
    }
  }

  document.querySelectorAll('[data-star]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setStarSimulationMode(btn.dataset.star);
      switchTopic('topik2');
    });
  });

  // ==========================================================================
  // 4. EVENT DETEKSI MARKER AR.JS (MARKER FOUND / MARKER LOST)
  // ==========================================================================
  function updateMarkerHud() {
    const anyDetected = activeMarkers.perangkat || activeMarkers.topologi;
    markerDot.classList.toggle('detected', anyDetected);

    controlsPerangkat.classList.toggle('highlighted', activeMarkers.perangkat);
    controlsTopologi.classList.toggle('highlighted', activeMarkers.topologi);

    if (activeMarkers.perangkat && activeMarkers.topologi) {
      markerStatusText.textContent = 'Marker Hiro & Kanji Terdeteksi';
    } else if (activeMarkers.perangkat) {
      markerStatusText.textContent = 'Terdeteksi: Marker 1 (Perangkat Jaringan)';
    } else if (activeMarkers.topologi) {
      markerStatusText.textContent = 'Terdeteksi: Marker 2 (Topologi Star)';
    } else {
      markerStatusText.textContent = 'Arahkan kamera ke marker Hiro / Kanji';
    }
  }

  if (markerPerangkat) {
    markerPerangkat.addEventListener('markerFound', () => {
      activeMarkers.perangkat = true;
      onboardingBanner.classList.add('hidden');
      switchTopic('topik1');
      updateMarkerHud();
    });

    markerPerangkat.addEventListener('markerLost', () => {
      activeMarkers.perangkat = false;
      updateMarkerHud();
    });
  }

  if (markerTopologi) {
    markerTopologi.addEventListener('markerFound', () => {
      activeMarkers.topologi = true;
      onboardingBanner.classList.add('hidden');
      switchTopic('topik2');
      updateMarkerHud();
    });

    markerTopologi.addEventListener('markerLost', () => {
      activeMarkers.topologi = false;
      updateMarkerHud();
    });
  }
});
