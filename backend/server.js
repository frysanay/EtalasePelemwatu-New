const express = require("express");
const cors = require("cors");
require("dotenv").config();

const potensiRoutes = require("./routes/potensi");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/potensi", potensiRoutes);

// Route utama
app.get("/", (req, res) => {
  res.json({
    message: "Backend EtalasePelemwatu berhasil dijalankan!",
  });
});

// Route pengecekan server
app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "API EtalasePelemwatu aktif",
  });
});

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
    console.error("Gagal mengambil kategori:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data kategori",
    });
  }
});


// Route login admin
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username dan kata sandi wajib diisi",
      });
    }

    // Cek ke database users jika tabel tersedia
    try {
      const userCheck = await db.query(
        "SELECT id, name, email, password FROM users WHERE email = $1 OR name = $1 LIMIT 1",
        [username]
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
      (username === "admin" || username === "admin@pelemwatu.desa.id") &&
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

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
