const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Data fallback in-memory jika PostgreSQL belum dikonfigurasi / belum aktif
let fallbackPotensi = [
  {
    id: 1,
    category_id: 1,
    category_name: "Usaha & Produk",
    name: "Omah Dimsum",
    owner_name: "Bapak Ahmad",
    whatsapp: "081234567890",
    address: "Jl. Melati No. 12 Pelemwatu",
    description: "Usaha kuliner yang menyajikan berbagai jenis dimsum pilihan dengan cita rasa khas.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    category_id: 1,
    category_name: "Usaha & Produk",
    name: "Warung Prasmanan Selarasnasi",
    owner_name: "Ibu Siti",
    whatsapp: "081234567891",
    address: "Jl. Raya Pelemwatu No. 45",
    description: "Warung makan prasmanan dengan menu masakan rumahan yang beragam setiap harinya.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    category_id: 1,
    category_name: "Usaha & Produk",
    name: "Ratu Frozen Food Pelemwatu",
    owner_name: "Ibu Ratna",
    whatsapp: "081234567892",
    address: "Dusun Pelemwatu RT 03",
    description: "Usaha penjualan produk frozen food berkualitas untuk kebutuhan rumah tangga dan kuliner.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    category_id: 2,
    category_name: "Jasa",
    name: "Moni Laundry 24 Jam",
    owner_name: "Mas Bayu",
    whatsapp: "081234567893",
    address: "Jl. Masjid Pelemwatu",
    description: "Layanan jasa laundry yang beroperasi 24 jam untuk memenuhi kebutuhan masyarakat.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    category_id: 2,
    category_name: "Jasa",
    name: "One Laundry Koin",
    owner_name: "Pak Doni",
    whatsapp: "081234567894",
    address: "Jl. Raya Pelemwatu No. 88",
    description: "Layanan laundry mandiri berbasis koin yang praktis dan terjangkau bagi warga desa.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    category_id: 3,
    category_name: "Hunian",
    name: "My Kost",
    owner_name: "Pak Hendra",
    whatsapp: "081234567895",
    address: "Gang Mawar No. 5 Pelemwatu",
    description: "Hunian kost nyaman dan terjangkau di lingkungan Desa Pelemwatu.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    category_id: 3,
    category_name: "Hunian",
    name: "RAMA Kost",
    owner_name: "Pak Rama",
    whatsapp: "081234567896",
    address: "Jl. Dahlia Pelemwatu",
    description: "Pilihan hunian kost dengan fasilitas lengkap di lingkungan desa.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "aktif",
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    category_id: 4,
    category_name: "Barang Warga",
    name: "Barang & Produk Warga",
    owner_name: "Warga Pelemwatu",
    whatsapp: "081234567897",
    address: "Desa Pelemwatu",
    description: "Kategori informasi produk dan barang yang dijual atau disewakan oleh warga desa.",
    location: "Desa Pelemwatu, Menganti, Gresik",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

const categoryNames = {
  1: "Usaha & Produk",
  2: "Jasa",
  3: "Hunian",
  4: "Barang Warga",
};

// ==========================
// GET: Mengambil semua data (dengan dukungan pencarian & filter)
// ==========================
router.get("/", async (req, res) => {
  const { search, category_id, status } = req.query;

  // 1. Coba query ke database PostgreSQL
  try {
    let query = `
      SELECT p.*, c.name AS category_name
      FROM potensi p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== "") {
      params.push(`%${search.trim()}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.address ILIKE $${params.length} OR p.owner_name ILIKE $${params.length})`;
    }

    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    query += ` ORDER BY p.id ASC`;

    const result = await pool.query(query, params);

    return res.json({
      status: "success",
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    // 2. Fallback in-memory jika database offline
    let filtered = [...fallbackPotensi];

    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.owner_name.toLowerCase().includes(q)
      );
    }

    if (category_id) {
      filtered = filtered.filter(
        (item) => String(item.category_id) === String(category_id)
      );
    }

    if (status) {
      filtered = filtered.filter(
        (item) => item.status.toLowerCase() === status.toLowerCase()
      );
    }

    return res.json({
      status: "success",
      total: filtered.length,
      data: filtered,
    });
  }
});

// ==========================
// GET: Mengambil data berdasarkan ID
// ==========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM potensi p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      return res.json({
        status: "success",
        data: result.rows[0],
      });
    }
  } catch (error) {
    // Fallback in-memory
    const found = fallbackPotensi.find((item) => String(item.id) === String(id));
    if (found) {
      return res.json({
        status: "success",
        data: found,
      });
    }
  }

  res.status(404).json({
    status: "error",
    message: "Data potensi tidak ditemukan",
  });
});

// ==========================
// POST: Menambahkan data baru
// ==========================
router.post("/", async (req, res) => {
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

  try {
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

    return res.status(201).json({
      status: "success",
      message: "Data potensi berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    // Fallback in-memory
    const newId = fallbackPotensi.length > 0
      ? Math.max(...fallbackPotensi.map((p) => p.id)) + 1
      : 1;

    const newItem = {
      id: newId,
      category_id: Number(category_id) || 1,
      category_name: categoryNames[category_id] || "Potensi Desa",
      name: name || "Potensi Baru",
      owner_name: owner_name || "-",
      whatsapp: whatsapp || "-",
      address: address || "-",
      description: description || "-",
      location: location || address || "-",
      status: status || "pending",
      created_at: new Date().toISOString(),
    };

    fallbackPotensi.push(newItem);

    return res.status(201).json({
      status: "success",
      message: "Data potensi berhasil ditambahkan (mode in-memory)",
      data: newItem,
    });
  }
});

// ==========================
// PUT: Mengubah data berdasarkan ID
// ==========================
router.put("/:id", async (req, res) => {
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

  try {
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

    if (result.rows.length > 0) {
      return res.json({
        status: "success",
        message: "Data potensi berhasil diubah",
        data: result.rows[0],
      });
    }
  } catch (error) {
    // Fallback in-memory
    const idx = fallbackPotensi.findIndex((item) => String(item.id) === String(id));
    if (idx !== -1) {
      fallbackPotensi[idx] = {
        ...fallbackPotensi[idx],
        category_id: Number(category_id) || fallbackPotensi[idx].category_id,
        category_name: categoryNames[category_id] || fallbackPotensi[idx].category_name,
        name: name !== undefined ? name : fallbackPotensi[idx].name,
        owner_name: owner_name !== undefined ? owner_name : fallbackPotensi[idx].owner_name,
        whatsapp: whatsapp !== undefined ? whatsapp : fallbackPotensi[idx].whatsapp,
        address: address !== undefined ? address : fallbackPotensi[idx].address,
        description: description !== undefined ? description : fallbackPotensi[idx].description,
        location: location !== undefined ? location : fallbackPotensi[idx].location,
        status: status !== undefined ? status : fallbackPotensi[idx].status,
        updated_at: new Date().toISOString(),
      };

      return res.json({
        status: "success",
        message: "Data potensi berhasil diubah",
        data: fallbackPotensi[idx],
      });
    }
  }

  res.status(404).json({
    status: "error",
    message: "Data potensi tidak ditemukan",
  });
});

// ==========================
// DELETE: Menghapus data berdasarkan ID
// ==========================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM potensi WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length > 0) {
      return res.json({
        status: "success",
        message: "Data potensi berhasil dihapus",
        data: result.rows[0],
      });
    }
  } catch (error) {
    // Fallback in-memory
    const idx = fallbackPotensi.findIndex((item) => String(item.id) === String(id));
    if (idx !== -1) {
      const deleted = fallbackPotensi.splice(idx, 1)[0];
      return res.json({
        status: "success",
        message: "Data potensi berhasil dihapus",
        data: deleted,
      });
    }
  }

  res.status(404).json({
    status: "error",
    message: "Data potensi tidak ditemukan",
  });
});

module.exports = router;
