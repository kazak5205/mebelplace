const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/support/contact - Отправить сообщение в поддержку (алиас для tickets)
router.post('/contact', authenticateToken, async (req, res) => {
  try {
    const { subject, message, priority = 'medium' } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, message, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, subject, message, priority]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Support message sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send support message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send support message',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/support/tickets - Создать тикет поддержки
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, message, priority = 'medium' } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, message, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, subject, message, priority]
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

// GET /api/support/tickets - Получить тикеты пользователя
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    let params = [userId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const result = await pool.query(`
      SELECT 
        st.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      ${whereClause}
      ORDER BY st.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM support_tickets ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        tickets: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Support tickets retrieved successfully',
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

// GET /api/support/tickets/:id - Получить конкретный тикет
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    const ticketResult = await pool.query(`
      SELECT 
        st.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.id = $1 AND st.user_id = $2
    `, [ticketId, userId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
        timestamp: new Date().toISOString()
      });
    }

    // Получаем ответы на тикет
    const responsesResult = await pool.query(`
      SELECT 
        sr.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar
      FROM support_messages sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.ticket_id = $1
      ORDER BY sr.created_at ASC
    `, [ticketId]);

    res.json({
      success: true,
      data: {
        ticket: ticketResult.rows[0],
        responses: responsesResult.rows
      },
      message: 'Support ticket retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support ticket',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/support/tickets/:id/responses - Добавить ответ к тикету
router.post('/tickets/:id/responses', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что тикет принадлежит пользователю
    const ticketResult = await pool.query(
      'SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2',
      [ticketId, userId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pool.query(
      'INSERT INTO support_messages (ticket_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
      [ticketId, userId, message]
    );

    // Обновляем время последнего обновления тикета
    await pool.query(
      'UPDATE support_tickets SET updated_at = NOW() WHERE id = $1',
      [ticketId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Response added successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Add support response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/support/tickets/:id/close - Закрыть тикет
router.put('/tickets/:id/close', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      ['closed', ticketId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Support ticket closed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Close support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close support ticket',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
