const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const potensiRoutes = require("./routes/potensi");
const authRoutes = require("./routes/auth");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Melayani file statis frontend langsung dari port 3000
app.use(express.static(path.join(__dirname, "../frontend")));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// Routes API Potensi & Auth
app.use("/api/potensi", potensiRoutes);
app.use("/api/auth", authRoutes);
// Middleware untuk proteksi route admin menggunakan JWT
const authMiddleware = require('./middleware/auth');

// Admin‑protected routes
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/admins', authMiddleware, adminRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/potensi-review', authMiddleware, reviewRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// Additional admin routes
const categoryRoutes = require("./routes/categories");
const adminRoutes = require("./routes/admins");
const messageRoutes = require("./routes/messages");
const reviewRoutes = require("./routes/potensi_review");
const statsRoutes = require("./routes/stats");
app.use("/api/categories", categoryRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/potensi-review", reviewRoutes);
app.use("/api/stats", statsRoutes);

// Route pengecekan server
app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "API EtalasePelemwatu aktif",
    version: "1.0.0",
  });
});

// Data kategori fallback jika database offline
const DEFAULT_CATEGORIES = [
  { id: 1, name: "Usaha & Produk", description: "Usaha kuliner, kerajinan, dan produk olahan warga desa" },
  { id: 2, name: "Jasa", description: "Layanan jasa dan keahlian masyarakat desa" },
  { id: 3, name: "Hunian", description: "Kost, kontrakan, dan akomodasi tempat tinggal di desa" },
  { id: 4, name: "Barang Warga", description: "Barang dan produk yang dijual atau disewakan warga desa" },
];

// Route mengambil data kategori
app.get("/api/categories", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM categories ORDER BY id ASC"
    );

    res.json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    // Fallback data kategori default jika DB offline
    res.json({
      status: "success",
      data: DEFAULT_CATEGORIES,
    });
  }
});

// Route login admin (mendukung format username & email dari modal dan halaman login)
app.post("/api/login", async (req, res) => {
  try {
    const username = req.body.username || req.body.email;
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username dan kata sandi wajib diisi",
      });
    }

    const cleanUser = username.trim().toLowerCase();

    // Cek ke database users jika tabel tersedia
    try {
      const userCheck = await db.query(
        "SELECT id, name, email, password FROM users WHERE LOWER(email) = $1 OR LOWER(name) = $1 LIMIT 1",
        [cleanUser]
      );
      if (userCheck.rows.length > 0) {
        const user = userCheck.rows[0];
        if (user.password === password) {
          return res.json({
            status: "success",
            message: "Login berhasil",
            user: { id: user.id, name: user.name, role: "admin" },
          });
        }
      }
    } catch (dbErr) {
      // Database query fallback
    }

    // Kredensial default admin
    if (
      (cleanUser === "admin" || cleanUser === "admin@pelemwatu.desa.id") &&
      password === "admin123"
    ) {
      return res.json({
        status: "success",
        message: "Login berhasil sebagai Administrator",
        user: { id: 1, name: "Administrator Desa", role: "admin" },
      });
    }

    return res.status(401).json({
      status: "error",
      message: "Username atau kata sandi tidak sesuai",
    });
  } catch (error) {
    console.error("Gagal proses login:", error.message);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server saat login",
    });
  }
});

// Fallback untuk route utama (jika tidak match file statis)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 EtalasePelemwatu Web & API Server Berjalan!`);
  console.log(`🌐 Website Utama : http://localhost:${PORT}/`);
  console.log(`🔑 Login Admin   : http://localhost:${PORT}/login.html`);
  console.log(`⚙️  Panel Admin   : http://localhost:${PORT}/admin.html`);
  console.log(`📝 Daftar Potensi: http://localhost:${PORT}/daftar-potensi.html`);
  console.log(`📡 API Status    : http://localhost:${PORT}/api/status`);
  console.log(`=======================================================`);
});
