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

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
