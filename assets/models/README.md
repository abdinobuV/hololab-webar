# Folder Model 3D (`assets/models/`)

Letakkan file model 3D berformat `.glb` atau `.gltf` Anda di dalam folder ini.

## Cara Menggunakan Model 3D Kustom (.glb / .gltf)
1. Siapkan file model 3D (disarankan ukuran < 5 MB agar ringan di HP Android), misalnya:
   - `router.glb`
   - `switch.glb`
   - `utp-rj45.glb`
2. Salin file tersebut ke dalam folder `assets/models/`.
3. Buka file `script.js` pada bagian konfigurasi `CUSTOM_MODELS`:
   ```js
   const CUSTOM_MODELS = {
     router: 'assets/models/router.glb',
     switch: 'assets/models/switch.glb',
     utp: 'assets/models/utp-rj45.glb'
   };
   ```
4. Aplikasi akan otomatis mengecek apakah file `.glb` tersedia.
   - Jika **tersedia**, model `.glb` akan ditampilkan di atas Marker 1.
   - Jika **belum tersedia**, aplikasi otomatis menampilkan **fallback objek 3D primitif A-Frame** agar pembelajaran tetap berjalan lancar.
