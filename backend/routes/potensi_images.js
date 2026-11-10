const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET images for a specific potensi
router.get('/:potensiId/images', async (req, res) => {
  const { potensiId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, image_path, created_at FROM potensi_images WHERE potensi_id = $1 ORDER BY id ASC`,
      [potensiId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching images:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch images' });
  }
});

module.exports = router;

