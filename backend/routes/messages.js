const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST a new contact message
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'Name, email, and message are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, subject || null, message]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error saving message:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save message' });
  }
});

// GET all messages (admin only – authentication not implemented here, assume protected on client)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch messages' });
  }
});

module.exports = router;

