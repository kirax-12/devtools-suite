# DevTools Suite

Kumpulan 5 tools kecil buat developer dalam satu halaman web. Semua proses jalan **100% lokal di browser** — tidak ada server, tidak ada data yang dikirim ke mana-mana.

## Fitur

1. **JSON Formatter** — rapikan JSON (indent 2 spasi) atau minify jadi satu baris. Ada validasi yang menampilkan pesan error kalau JSON-nya rusak, plus hitungan karakter.
2. **Base64 Encode / Decode** — aman buat UTF-8 (emoji dan huruf non-latin tidak rusak), lengkap dengan pesan error kalau input bukan Base64 valid.
3. **UUID Generator** — bikin 1 sampai 100 UUID v4 sekaligus pakai `crypto.randomUUID()` (ada fallback manual kalau browser lama), plus tombol salin semua.
4. **Password Generator** — panjang 8–64 karakter, pilihan huruf besar, angka, dan simbol. Dibuat pakai `crypto.getRandomValues` dengan label kekuatan: lemah / sedang / kuat.
5. **Timestamp Converter** — konversi dua arah: detik unix → tanggal lokal + ISO, dan tanggal (datetime-local) → detik unix + milidetik. Ada juga timestamp "sekarang" yang jalan live tiap detik.

Semua hasil bisa disalin ke clipboard dengan satu klik.

## Cara Menjalankan

Tidak perlu build, tidak perlu install apa pun.

- Cara paling gampang: buka file `index.html` langsung di browser.
- Atau jalankan server lokal dari folder ini, misalnya:

```bash
npx serve .
# atau
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

## Teknologi

- HTML, CSS, dan JavaScript murni (vanilla) — tanpa framework, tanpa library eksternal.
- Web Crypto API (`crypto.randomUUID`, `crypto.getRandomValues`) untuk UUID dan password.
- `TextEncoder` / `TextDecoder` untuk Base64 yang aman UTF-8.
- Font: Space Grotesk, Space Mono, dan Caveat (Google Fonts).
- Desain: neo-brutalism krem khas Remike Dev — border hitam 2px, bayangan offset keras, warna aksen datar.

## Struktur File

```
devtools-suite/
├── index.html   # struktur halaman + 5 panel tool
├── style.css    # semua styling
├── script.js    # logika tabs + 5 tool
└── README.md
```

---

Dibuat oleh **Remike Dev** — [github.com/kirax-12](https://github.com/kirax-12)
