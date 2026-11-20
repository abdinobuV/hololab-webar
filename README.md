# 📡 NetGO WebAR — Game Edukasi Jaringan TJKT Kelas X (Ala Pokémon GO AR)

Aplikasi game edukasi berbasis **WebAR** untuk siswa **Kelas X TJKT / TKJ** yang menggabungkan pengalaman kamera AR ala **Pokémon GO** (tanpa perlu mencetak kertas marker & tanpa mewajibkan ARCore di HP Android!) dengan interaksi objek 3D langsung dan kartu penjelasan materi *live* di atas layar kamera.

---

## ✨ Fitur Utama
1. **Aktifkan Kamera → Objek 3D Langsung Muncul di Dunia Nyata**:
   - Menggunakan kamera belakang HP (`environment`, bisa dibalik ke kamera depan `🔄`) dan sensor gerak (*gyroscope*) ringan agar objek 3D terasa melayang di sekitar ruangan.
2. **Penjelasan Materi Live Saat Kamera Aktif**:
   - Begitu kamera aktif, **Kartu Penjelasan Materi Live** langsung tampil di layar kamera (bisa dilipat/diperluas) dan otomatis berubah sesuai objek atau bagian 3D yang disentuh siswa!
   - Dilengkapi tombol **📘 Materi** (buka-tutup) untuk membaca materi lengkap **Topik 1 (Perangkat Keras Jaringan)** & **Topik 2 (Topologi Star)**.
3. **Interaksi Langsung (Tap Objek 3D)**:
   - **Router**: Tap **Port WAN (Biru)** dan **Port LAN (Kuning)** untuk melihat animasi paket IP & perbedaan fungsinya.
   - **Switch 8-Port**: Tap bodi/port Switch untuk menguji pengiriman paket data spesifik berbasis **MAC Address**.
   - **Kabel UTP & Konektor RJ-45**: Tap kabel untuk memicu mode **Bedah / Explode 3D** guna melihat 4 pasang kabel pilin warna dan 8 pin tembaga emas.
   - **Topologi Star**: Tap kabel **PC-1** (simulasi **1 kabel putus** → klien lain tetap jalan) atau tap **Switch Pusat** (simulasi **Switch rusak** → seluruh jaringan terhenti).
4. **Mekanik Lempar Net-Ball (Ala Pokéball) & Net-Dex (0/4)**:
   - Tekan tombol **TANGKAP (Net-Ball)** di tengah bawah untuk melempar bola energi 3D dengan lintasan parabola & efek partikel ke arah objek!
   - Jawab 1 pertanyaan kuis singkat untuk menangkap objek ke koleksi **Net-Dex (4/4)** dan mengumpulkan **XP**.

---

## 📁 Struktur Folder
```text
├── index.html          # Halaman utama NetGO WebAR, HUD Radar, Kartu Materi Live & Kuis
├── style.css           # Styling responsif HP Portrait & Landscape
├── script.js           # Engine 3D Three.js, Raycasting Tap, Lempar Net-Ball, & Auto-Loader .glb
├── vercel.json         # Konfigurasi static site Vercel
└── assets/
    ├── models/         # Simpan file .glb kustom (router.glb, switch.glb, utp-rj45.glb)
    └── markers/        # Folder pendukung marker
```
