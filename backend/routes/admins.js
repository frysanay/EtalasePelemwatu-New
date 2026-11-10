const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt'); // simple hashing for passwords

// GET all admin users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching admins:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch admins' });
  }
});

// POST create new admin (plain password stored for simplicity, but hashed)
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Name, email, and password required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashed]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error creating admin:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create admin' });
  }
});

// DELETE admin
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }
    res.json({ status: 'success', message: 'Admin deleted', data: result.rows[0] });
  } catch (err) {
    console.error('Error deleting admin:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete admin' });
  }
});

module.exports = router;

