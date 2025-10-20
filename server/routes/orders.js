const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const notificationService = require('../services/notificationService');
const router = express.Router();

// POST /api/orders/create - Создание заявки
router.post('/create', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, location, region, budget, deadline } = req.body;
    const clientId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
        timestamp: new Date().toISOString()
      });
    }

    // Обработка загруженных изображений
    const images = req.files ? req.files.map(file => `/uploads/order-photos/${file.filename}`) : [];

    // Создание заявки
    const result = await pool.query(`
      INSERT INTO orders (title, description, images, client_id, category, location, region, price, deadline, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title,
      description,
      images,
      clientId,
      category || 'general',
      location,
      region || null,
      budget ? parseFloat(budget) : null,
      deadline ? new Date(deadline) : null,
      'pending'
    ]);

    const order = result.rows[0];

    // Уведомление мастерам о новой заявке
    const mastersResult = await pool.query(
      'SELECT id FROM users WHERE role = $1 AND is_active = true',
      ['master']
    );

    for (const master of mastersResult.rows) {
      await notificationService.notifyNewOrder(master.id, order.title, req.user.username);
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders/feed - Лента заявок
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, region, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        u.username as client_username,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.avatar as client_avatar,
        COUNT(or.id) as response_count
      FROM orders o
      LEFT JOIN users u ON o.client_id = u.id
      LEFT JOIN order_responses or ON o.id = or.order_id AND or.is_active = true
      WHERE o.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;

    if (category) {
      query += ` AND o.category = $${++paramCount}`;
      params.push(category);
    }

    if (region) {
      query += ` AND o.region = $${++paramCount}`;
      params.push(region);
    }

    if (status) {
      query += ` AND o.status = $${++paramCount}`;
      params.push(status);
    }

    // Мастера видят все заявки, клиенты - только свои
    if (req.user.role === 'user') {
      query += ` AND o.client_id = $${++paramCount}`;
      params.push(req.user.id);
    }

    query += `
      GROUP BY o.id, u.username, u.first_name, u.last_name, u.avatar
      ORDER BY o.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        orders: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.rows.length
        }
      },
      message: 'Orders retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get orders feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders/:id - Получить заявку
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    const result = await pool.query(`
      SELECT 
        o.*,
        u.username as client_username,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.avatar as client_avatar,
        u.phone as client_phone
      FROM orders o
      LEFT JOIN users u ON o.client_id = u.id
      WHERE o.id = $1 AND o.is_active = true
    `, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    const order = result.rows[0];

    // Проверка доступа
    if (req.user.role === 'user' && order.client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Получить отклики на заявку
    const responsesResult = await pool.query(`
      SELECT 
        or.*,
        u.username as master_username,
        u.first_name as master_first_name,
        u.last_name as master_last_name,
        u.avatar as master_avatar
      FROM order_responses or
      LEFT JOIN users u ON or.master_id = u.id
      WHERE or.order_id = $1 AND or.is_active = true
      ORDER BY or.created_at DESC
    `, [orderId]);

    order.responses = responsesResult.rows;

    res.json({
      success: true,
      data: order,
      message: 'Order retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/orders/:id/response - Отклик на заявку
router.post('/:id/response', authenticateToken, requireRole(['master', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { message, price, deadline } = req.body;
    const masterId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка существования заявки
    const orderResult = await pool.query(
      'SELECT id, client_id, title, status FROM orders WHERE id = $1 AND is_active = true',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order is no longer accepting responses',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка, не откликался ли уже мастер
    const existingResponse = await pool.query(
      'SELECT id FROM order_responses WHERE order_id = $1 AND master_id = $2 AND is_active = true',
      [orderId, masterId]
    );

    if (existingResponse.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this order',
        timestamp: new Date().toISOString()
      });
    }

    // Создание отклика
    const responseResult = await pool.query(`
      INSERT INTO order_responses (order_id, master_id, message, price, deadline)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      orderId,
      masterId,
      message,
      price ? parseFloat(price) : null,
      deadline ? new Date(deadline) : null
    ]);

    const response = responseResult.rows[0];

    // Уведомление клиенту о новом отклике
    await notificationService.notifyNewOrderResponse(order.client_id, order.title, req.user.username);

    res.status(201).json({
      success: true,
      data: response,
      message: 'Response sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/orders/:id/accept - Принять отклик
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { responseId } = req.body;
    const clientId = req.user.id;

    // Проверка заявки
    const orderResult = await pool.query(
      'SELECT id, client_id, status FROM orders WHERE id = $1 AND client_id = $2 AND is_active = true',
      [orderId, clientId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order is no longer accepting responses',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка отклика
    const responseResult = await pool.query(
      'SELECT id, master_id FROM order_responses WHERE id = $1 AND order_id = $2 AND is_active = true',
      [responseId, orderId]
    );

    if (responseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Response not found',
        timestamp: new Date().toISOString()
      });
    }

    const response = responseResult.rows[0];

    // Обновление заявки
    await pool.query(
      'UPDATE orders SET status = $1, master_id = $2, updated_at = NOW() WHERE id = $3',
      ['accepted', response.master_id, orderId]
    );

    // Деактивация всех остальных откликов
    await pool.query(
      'UPDATE order_responses SET is_active = false WHERE order_id = $1 AND id != $2',
      [orderId, responseId]
    );

    // Создание чата между клиентом и мастером
    const chatResult = await pool.query(`
      INSERT INTO chats (order_id, client_id, master_id, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [orderId, clientId, response.master_id, true]);

    const chat = chatResult.rows[0];

    // Уведомление мастеру о принятии отклика
    await notificationService.notifyResponseAccepted(response.master_id, order.title, req.user.username);

    res.json({
      success: true,
      data: {
        order: { id: orderId, status: 'accepted', master_id: response.master_id },
        chat: chat
      },
      message: 'Response accepted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Accept response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept response',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/orders/:id/reject - Отклонить отклик
router.post('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { responseId } = req.body;
    const clientId = req.user.id;

    // Проверка заявки
    const orderResult = await pool.query(
      'SELECT id, client_id FROM orders WHERE id = $1 AND client_id = $2 AND is_active = true',
      [orderId, clientId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Деактивация отклика
    const responseResult = await pool.query(
      'UPDATE order_responses SET is_active = false WHERE id = $1 AND order_id = $2 RETURNING *',
      [responseId, orderId]
    );

    if (responseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Response not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Response rejected successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reject response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject response',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/orders/:id/status - Изменить статус заявки
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка доступа
    const orderResult = await pool.query(
      'SELECT id, client_id, master_id FROM orders WHERE id = $1 AND is_active = true',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    const order = orderResult.rows[0];

    // Только клиент или мастер могут менять статус
    if (order.client_id !== userId && order.master_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Обновление статуса
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Order status updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders/categories - Получить категории заявок
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'furniture', name: 'Мебель', description: 'Изготовление и ремонт мебели' },
      { id: 'carpentry', name: 'Столярные работы', description: 'Работы по дереву' },
      { id: 'upholstery', name: 'Обивка мебели', description: 'Перетяжка и реставрация' },
      { id: 'restoration', name: 'Реставрация', description: 'Восстановление старинной мебели' },
      { id: 'custom', name: 'На заказ', description: 'Индивидуальное изготовление' },
      { id: 'repair', name: 'Ремонт', description: 'Ремонт и восстановление' },
      { id: 'other', name: 'Другое', description: 'Прочие работы' }
    ];

    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders/regions - Получить список регионов Казахстана
router.get('/regions', async (req, res) => {
  try {
    const { KZ_REGIONS } = require('../../shared/utils/regions');

    res.json({
      success: true,
      data: KZ_REGIONS,
      message: 'Regions retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve regions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders/:id/responses - Получить отклики на заявку
router.get('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Проверяем, что пользователь имеет доступ к заявке
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND (client_id = $2 OR $2 IN (SELECT master_id FROM order_responses WHERE order_id = $1))',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Получаем отклики
    const responsesResult = await pool.query(`
      SELECT 
        or.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        u.phone,
        u.email
      FROM order_responses or
      LEFT JOIN users u ON or.master_id = u.id
      WHERE or.order_id = $1 AND or.is_active = true
      ORDER BY or.created_at DESC
    `, [orderId]);

    res.json({
      success: true,
      data: responsesResult.rows,
      total: responsesResult.rows.length,
      message: 'Responses retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve responses',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/orders/:id/responses - Создать отклик на заявку
router.post('/:id/responses', authenticateToken, requireRole('master'), async (req, res) => {
  try {
    const orderId = req.params.id;
    const masterId = req.user.id;
    const { message, price, deadline } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что заявка существует и активна
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND status = $2 AND is_active = true',
      [orderId, 'pending']
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not available for responses',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что мастер еще не оставлял отклик
    const existingResponse = await pool.query(
      'SELECT id FROM order_responses WHERE order_id = $1 AND master_id = $2 AND is_active = true',
      [orderId, masterId]
    );

    if (existingResponse.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this order',
        timestamp: new Date().toISOString()
      });
    }

    // Создаем отклик
    const responseResult = await pool.query(`
      INSERT INTO order_responses (order_id, master_id, message, price, deadline)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [orderId, masterId, message, price, deadline]);

    const response = responseResult.rows[0];

    // Отправляем уведомление клиенту
    await notificationService.sendNotification({
      userId: orderResult.rows[0].client_id,
      type: 'new_response',
      title: 'Новый отклик на вашу заявку',
      message: `Мастер оставил отклик на заявку "${orderResult.rows[0].title}"`,
      data: { orderId, responseId: response.id }
    });

    res.json({
      success: true,
      data: response,
      message: 'Response created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create response',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/orders/:id/accept - Принять отклик
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { responseId } = req.body;
    const userId = req.user.id;

    if (!responseId) {
      return res.status(400).json({
        success: false,
        message: 'Response ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что пользователь - владелец заявки
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND client_id = $2 AND is_active = true',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что отклик существует
    const responseResult = await pool.query(
      'SELECT * FROM order_responses WHERE id = $1 AND order_id = $2 AND is_active = true',
      [responseId, orderId]
    );

    if (responseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Response not found',
        timestamp: new Date().toISOString()
      });
    }

    // Обновляем статус заявки и отклика
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE orders SET status = $1, accepted_response_id = $2 WHERE id = $3',
      ['accepted', responseId, orderId]
    );

    await pool.query(
      'UPDATE order_responses SET status = $1 WHERE id = $2',
      ['accepted', responseId]
    );

    // Создаем чат между клиентом и мастером
    const chatResult = await pool.query(`
      INSERT INTO chats (type, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `, ['order', `Заявка: ${orderResult.rows[0].title}`, `Чат по заявке "${orderResult.rows[0].title}"`]);

    const chatId = chatResult.rows[0].id;

    // Добавляем участников в чат
    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id, role) VALUES ($1, $2, $3), ($1, $4, $5)',
      [chatId, userId, 'client', responseResult.rows[0].master_id, 'master']
    );

    await pool.query('COMMIT');

    // Отправляем уведомление мастеру
    await notificationService.sendNotification({
      userId: responseResult.rows[0].master_id,
      type: 'response_accepted',
      title: 'Ваш отклик принят!',
      message: `Клиент принял ваш отклик на заявку "${orderResult.rows[0].title}"`,
      data: { orderId, chatId }
    });

    res.json({
      success: true,
      data: {
        order: { ...orderResult.rows[0], status: 'accepted' },
        chat: { id: chatId }
      },
      message: 'Response accepted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Accept response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept response',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;