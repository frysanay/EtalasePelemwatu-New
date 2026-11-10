const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST review a potensi (approve/reject/pending)
router.post('/:id/review', async (req, res) => {
  const { id } = req.params;
  const { status, reason, reviewerId } = req.body; // status: 'approved' | 'rejected' | 'pending'
  if (!status) {
    return res.status(400).json({ status: 'error', message: 'Status is required' });
  }
  const allowed = ['approved', 'rejected', 'pending'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Invalid status value' });
  }
  try {
    const result = await pool.query(
      `UPDATE potensi SET 
         status = $1,
         reviewed_by = $2,
         reviewed_at = NOW(),
         rejection_reason = $3 
       WHERE id = $4 
       RETURNING *`,
      [status, reviewerId || null, reason || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Potensi not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error reviewing potensi:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to review potensi' });
  }
});

module.exports = router;

