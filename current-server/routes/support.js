const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/support/info - Get support information
router.get('/info', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT key, value FROM support_settings WHERE key IN ($1, $2, $3, $4)',
      ['support_phone', 'support_email', 'support_hours', 'support_contacts']
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get support info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support information',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/support/tickets - Create support ticket
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, message, priority = 'medium', category = 'general' } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pool.query(
      `INSERT INTO support_tickets (user_id, subject, message, priority, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, subject, status, priority, category, created_at`,
      [userId, subject, message, priority, category]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Support ticket created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/support/tickets - Get user's support tickets
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, subject, status, priority, category, created_at, updated_at, resolved_at
      FROM support_tickets 
      WHERE user_id = $1
    `;
    let params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM support_tickets WHERE user_id = $1';
    let countParams = [userId];
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support tickets',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/support/contact - Send direct message to support
router.post('/contact', authenticateToken, async (req, res) => {
  try {
    const { subject, message, priority = 'medium', category = 'general' } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required',
        timestamp: new Date().toISOString()
      });
    }

    // Create ticket
    const ticketResult = await pool.query(
      `INSERT INTO support_tickets (user_id, subject, message, priority, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, subject, message, priority, category]
    );

    const ticketId = ticketResult.rows[0].id;

    // Add initial message
    await pool.query(
      'INSERT INTO support_messages (ticket_id, user_id, message) VALUES ($1, $2, $3)',
      [ticketId, userId, message]
    );

    res.status(201).json({
      success: true,
      data: { ticketId },
      message: 'Message sent to support successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Contact support error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to support',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;