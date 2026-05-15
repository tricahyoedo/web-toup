const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Halaman depan untuk cek apakah server hidup
app.get('/', (req, res) => {
    res.send('<h1>Robot Ncuks Store: STATUS AKTIF 🚀</h1><p>Server backend berjalan dengan baik. Siap menerima pesanan otomatis!</p>');
});

// DATA RAHASIA - JANGAN KASIH TAHU SIAPAPUN
const DIGIFLAZZ_USER = "ncuks_store"; // Ganti dengan username Digiflazz kamu
const DIGIFLAZZ_KEY = "xxxx-xxxx-xxxx"; // Ganti dengan API Key Digiflazz kamu

// Endpoint untuk menerima pesanan dari website
app.post('/api/order', async (req, res) => {
    const { userId, zoneId, itemCode, orderId } = req.body;

    console.log(`Menerima pesanan baru: ${orderId} untuk ID: ${userId}`);

    // Logika 1: Cek Pembayaran (Biasanya pakai Callback dari Tripay)
    // Di sini kita asumsikan pembayaran sudah dicek dan lunas.

    // Logika 2: Kirim ke Digiflazz
    const signature = crypto.createHash('md5')
        .update(DIGIFLAZZ_USER + DIGIFLAZZ_KEY + orderId)
        .digest('hex');

    const payload = {
        username: DIGIFLAZZ_USER,
        buyer_sku_code: itemCode,
        customer_no: userId + (zoneId ? zoneId : ""),
        ref_id: orderId,
        sign: signature
    };

    try {
        const response = await axios.post('https://api.digiflazz.com/v1/transaction', payload);
        res.json({
            success: true,
            message: "Pesanan sedang diproses oleh supplier!",
            data: response.data
        });
    } catch (error) {
        console.error("Gagal menembak API Supplier:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada sistem supplier."
        });
    }
});

// Endpoint untuk Kontak (Kirim ke Gmail)
app.post('/api/contact', async (req, res) => {
    const { from_name, reply_to, message } = req.body;

    console.log(`Menerima pesan kontak dari: ${from_name} (${reply_to})`);

    // KONFIGURASI GMAIL (SANGAT RAHASIA)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tricahyopriambodo13@gmail.com', // Email Anda
            pass: 'xxxx xxxx xxxx xxxx' // Password Aplikasi Gmail Anda (Bukan password akun)
        }
    });

    const mailOptions = {
        from: reply_to,
        to: 'tricahyopriambodo13@gmail.com',
        subject: `[NCUKS STORE] Pesan Baru dari ${from_name}`,
        text: `Nama: ${from_name}\nEmail: ${reply_to}\n\nPesan:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Pesan berhasil terkirim ke Gmail Admin!" });
    } catch (error) {
        console.error("Gagal mengirim email:", error.message);
        res.status(500).json({ success: false, message: "Gagal mengirim pesan. Pastikan Password Aplikasi Gmail sudah benar." });
    }
});

const PORT = process.env.PORT || 3000;
// Menggunakan 0.0.0.0 agar bisa diakses dari HP dalam satu jaringan WiFi
app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 NCUKS STORE BACKEND AKTIF!`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    console.log(`📱 Network: http://[ALAMAT-IP-KOMPUTER-ANDA]:${PORT}`);
    console.log(`--------------------------------------------------`);
    console.log(`Pastikan Firewall Anda mengizinkan akses ke port ${PORT}`);
});
