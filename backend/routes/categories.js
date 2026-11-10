const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
});

// POST create new category
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error creating category:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create category' });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error updating category:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.json({ status: 'success', message: 'Category deleted', data: result.rows[0] });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete category' });
  }
});

module.exports = router;

