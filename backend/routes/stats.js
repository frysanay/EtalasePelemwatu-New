const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET statistics for admin dashboard
router.get('/', async (req, res) => {
  try {
    // total potensi
    const totalRes = await pool.query('SELECT COUNT(*) AS total FROM potensi');
    const total = parseInt(totalRes.rows[0].total, 10);

    // per category counts
    const catRes = await pool.query(
      `SELECT c.id, c.name, COUNT(p.id) AS count
       FROM categories c
       LEFT JOIN potensi p ON p.category_id = c.id
       GROUP BY c.id, c.name`
    );
    const perCategory = catRes.rows.map(r => ({ id: r.id, name: r.name, count: parseInt(r.count, 10) }));

    // pending approvals (status not 'approved')
    const pendingRes = await pool.query("SELECT COUNT(*) AS pending FROM potensi WHERE status <> 'approved'");
    const pending = parseInt(pendingRes.rows[0].pending, 10);

    res.json({
      status: 'success',
      data: {
        totalPotensi: total,
        perCategory,
        pendingReviews: pending,
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch statistics' });
  }
});

module.exports = router;

