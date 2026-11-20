# Folder Pattern Marker (`assets/markers/`)

Letakkan file pattern marker berformat `.patt` buatan Anda sendiri di dalam folder ini (misalnya: `perangkat.patt` dan `topologi-star.patt`).

## Cara Membuat Custom Marker `.patt`
1. Buka generator resmi AR.js Marker Training:
   https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
2. Unggah gambar ikon/logo kontras tinggi (hitam-putih disarankan).
3. Klik **Download Marker** (menghasilkan file `.patt`) dan **Download Image** (gambar PNG untuk dicetak).
4. Simpan file `.patt` ke folder `assets/markers/`.

## Cara Mengaktifkan Custom Marker di `index.html`
Cari tag `<a-marker>` di `index.html` lalu ubah atribut `preset`:

**Dari bawaan (Hiro / Kanji):**
```html
<a-marker id="marker-perangkat" preset="hiro">
```
**Menjadi custom pattern `.patt`:**
```html
<a-marker id="marker-perangkat" type="pattern" url="assets/markers/perangkat.patt">
```
