# Bengkelyu Frontend

Frontend React + Vite untuk aplikasi manajemen bengkel Bengkelyu.

## Fitur

- Dashboard ringkasan pendapatan, order aktif, pelanggan, dan stok menipis
- Order servis: buat order, cari/filter status, lihat detail, ubah status
- Pelanggan: data kontak, kendaraan, riwayat order, dan total belanja
- Mekanik: beban kerja, status aktif/libur, rating, dan kontak
- Sparepart: stok, nilai persediaan, status stok, dan penyesuaian stok
- Pembayaran: catat pembayaran, tagihan pending, dan tandai lunas
- Arus kas: pemasukan/pengeluaran, grafik 7 hari, dan saldo bulan ini
- Login/registrasi terhubung ke Laravel Sanctum
- Mode demo tanpa backend dengan data contoh yang tersimpan di localStorage
- Tampilan responsif untuk desktop dan mobile

## Prasyarat

- Node.js `20.19+` atau `22.12+` (disarankan Node 22 LTS)
- Backend Laravel opsional; tanpa backend tetap bisa memakai mode demo

## Menjalankan

```sh
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173`.

Di halaman login, klik **Coba mode demo** untuk mencoba seluruh modul dengan
data contoh. Data demo disimpan di localStorage dan bisa dikembalikan ke kondisi
awal lewat tombol **Reset data demo** di sidebar.

Vite meneruskan request `/api/*` ke backend Laravel. Jika backend berada di
alamat lain, ubah `VITE_API_URL` di `.env`, misalnya:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Endpoint yang dipakai

| Method | Endpoint               | Keterangan                    |
| ------ | ---------------------- | ----------------------------- |
| POST   | `/api/auth/register`   | Registrasi akun baru          |
| POST   | `/api/auth/login`      | Login dan mendapatkan token   |
| GET    | `/api/auth/me`         | Mengambil data user aktif     |
| POST   | `/api/auth/logout`     | Menghapus token aktif         |

Semua endpoint yang butuh autentikasi mengirim header
`Authorization: Bearer <token>`.

Modul operasional saat ini memakai data demo lokal. Ketika endpoint backend
untuk order, pelanggan, mekanik, sparepart, pembayaran, dan arus kas sudah
tersedia, data di `src/context/DataProvider.jsx` bisa diganti dengan pemanggilan
API tanpa mengubah komponen halaman.

## Build

```sh
npm run build
npm run preview
```
