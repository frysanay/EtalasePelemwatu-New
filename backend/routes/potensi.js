const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ==========================
// GET: Mengambil semua data
// ==========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM potensi
      ORDER BY id ASC
    `);

    res.json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error("Gagal mengambil data:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data potensi",
    });
  }
});

// ==========================
// GET: Mengambil data berdasarkan ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM potensi WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Data potensi tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal mengambil data:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data potensi",
    });
  }
});

// ==========================
// POST: Menambahkan data baru
// ==========================
router.post("/", async (req, res) => {
  try {
    const {
      category_id,
      name,
      owner_name,
      whatsapp,
      address,
      description,
      location,
      status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO potensi
        (category_id, name, owner_name, whatsapp, address,
         description, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        category_id,
        name,
        owner_name,
        whatsapp,
        address,
        description,
        location,
        status || "pending",
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Data potensi berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal menambahkan data:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan data potensi",
    });
  }
});

// ==========================
// PUT: Mengubah data berdasarkan ID
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      name,
      owner_name,
      whatsapp,
      address,
      description,
      location,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE potensi
       SET category_id = $1,
           name = $2,
           owner_name = $3,
           whatsapp = $4,
           address = $5,
           description = $6,
           location = $7,
           status = $8
       WHERE id = $9
       RETURNING *`,
      [
        category_id,
        name,
        owner_name,
        whatsapp,
        address,
        description,
        location,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Data potensi tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      message: "Data potensi berhasil diubah",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal mengubah data:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengubah data potensi",
    });
  }
});

// ==========================
// DELETE: Menghapus data berdasarkan ID
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM potensi WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Data potensi tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      message: "Data potensi berhasil dihapus",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Gagal menghapus data:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data potensi",
    });
  }
});

module.exports = router;