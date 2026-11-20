# 🌐 WebAR Edukasi TJKT / TKJ Kelas X — Perangkat Keras Jaringan & Topologi Star

Aplikasi edukasi berbasis **WebAR (Marker-based AR)** menggunakan **HTML, CSS, JavaScript, A-Frame, dan AR.js**. Dirancang ringan agar berjalan lancar di sebagian besar smartphone Android melalui browser (Chrome/Firefox/Edge) **tanpa memerlukan dukungan ARCore**.

---

## 📁 Struktur Folder
```text
├── index.html               # Halaman utama Scene WebAR (A-Frame + AR.js) & UI Panel Materi
├── style.css                # Styling UI responsif (Portrait & Landscape)
├── script.js                # Kontrol materi, loader .glb otomatis, deteksi marker, & simulasi Star
├── vercel.json              # Konfigurasi static site untuk Vercel
└── assets/
    ├── models/              # Tempat menyimpan file model 3D (.glb / .gltf)
    │   └── README.md
    └── markers/             # Tempat menyimpan file custom pattern marker (.patt)
        └── README.md
```

---

## 📚 Materi Edukasi yang Dimuat (Kelas X TJKT/TKJ)
1. **Topik 1: Pengenalan Perangkat Keras Jaringan** *(Marker 1: Hiro)*
   - **Router**: Menghubungkan dua atau lebih jaringan yang berbeda & mengatur jalur paket data (IP), dilengkapi visualisasi perbedaan **Port WAN** (biru) dan **Port LAN** (kuning).
   - **Switch**: Penghubung perangkat dalam satu jaringan lokal (LAN) yang meneruskan data secara spesifik berdasarkan **MAC Address**.
   - **Kabel UTP & Konektor RJ-45**: Media transmisi kabel tembaga berpasangan terpilin (*Unshielded Twisted Pair*) dengan ujung konektor 8-pin RJ-45.
2. **Topik 2: Topologi Star (Bintang)** *(Marker 2: Kanji)*
   - **Konsep**: Seluruh perangkat klien (PC-1, PC-2, Laptop, Printer) terhubung secara terpusat ke satu Switch di tengah dengan animasi paket data bergerak.
   - **Karakteristik & Simulasi Interaktif**:
     - **Normal**: Semua klien berkomunikasi lancar melalui Switch pusat.
     - **1 Kabel Putus**: Hanya klien bersangkutan yang mati, klien lain tetap dapat berkomunikasi.
     - **Switch Rusak**: Seluruh jaringan terganggu (*Single Point of Failure*).

---

## 🛠️ Cara Modifikasi
- **Mengganti Model 3D (`.glb`/`.gltf`)**: Simpan file `router.glb`, `switch.glb`, atau `utp-rj45.glb` ke `assets/models/`. Aplikasi otomatis mendeteksi file `.glb` dan mengganti objek primitif fallback.
- **Mengganti Custom Marker (`.patt`)**: Simpan file `.patt` ke `assets/markers/`, lalu ubah `preset="hiro"` atau `preset="kanji"` di `index.html` menjadi `type="pattern" url="assets/markers/nama-marker.patt"`.

---

## 🚀 Cara Deploy ke GitHub Pages
1. Push repositori ini ke GitHub.
2. Buka tab **Settings** → **Pages** pada repositori GitHub Anda.
3. Pada bagian **Build and deployment** → pilih **Source: Deploy from a branch**, lalu pilih branch `main` dan folder `/ (root)`.
4. Simpan dan tunggu 1–2 menit; link `https://<username>.github.io/<repo>/` (HTTPS) siap dibuka langsung di HP Android!
