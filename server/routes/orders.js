const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const notificationService = require('../services/notificationService');
const { KZ_REGIONS } = require('../utils/regions');
const router = express.Router();

// GET /api/orders - Получить заявки (alias для /feed)
router.get('/', authenticateToken, async (req, res) => {
  // Просто перенаправляем на /feed
  req.url = '/feed' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  return res.redirect(307, '/api/orders/feed' + (Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query).toString() : ''));
});

// POST /api/orders/create - Создание заявки
router.post('/create', authenticateToken, imageUpload.array('images', 5), async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files?.length || 0);
    console.log('User:', req.user?.id, req.user?.username);
    
    const { title, description, category, city, region, budget, deadline } = req.body;
    const clientId = req.user.id;

    if (!title || !description) {
      console.log('Validation failed: missing title or description');
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
        timestamp: new Date().toISOString()
      });
    }

    // Обработка загруженных изображений
    const images = req.files ? req.files.map(file => `/uploads/order-photos/${file.filename}`) : [];
    console.log('Images:', images);

    // Создание заявки
    console.log('Inserting order with params:', {
      title, description, images, clientId, category, city, region, budget, deadline
    });
    
    const result = await pool.query(`
      INSERT INTO orders (title, description, images, client_id, category, city, region, price, deadline, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title,
      description,
      images,
      clientId,
      category || 'general',
      city,
      region || null,
      budget ? parseFloat(budget) : null,
      deadline ? new Date(deadline) : null,
      'pending'
    ]);

    const order = result.rows[0];
    console.log('Order created:', order.id);

    // Уведомление мастерам о новой заявке
    const mastersResult = await pool.query(
      'SELECT id FROM users WHERE role = $1 AND is_active = true',
      ['master']
    );
    console.log('Notifying', mastersResult.rows.length, 'masters');

    for (const master of mastersResult.rows) {
      try {
        await notificationService.notifyNewOrder(master.id, order.title, req.user.username);
      } catch (notifyError) {
        console.error('Notification error for master', master.id, ':', notifyError.message);
      }
    }

    console.log('Order created successfully');
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create order error:', error.message);
    console.error('Stack:', error.stack);
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
    // Для админов по умолчанию показываем все заявки, для остальных - только pending
    const defaultStatus = req.user.role === 'admin' ? null : 'pending';
    const { page = 1, limit = 10, category, region, status = defaultStatus } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        u.username as client_username,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.avatar as client_avatar,
        u.phone as client_phone,
        COUNT(DISTINCT ord_resp.id) as response_count,
        CASE WHEN EXISTS(
          SELECT 1 FROM order_responses my_resp 
          WHERE my_resp.order_id = o.id 
          AND my_resp.master_id = $1 
          AND my_resp.is_active = true
        ) THEN true ELSE false END as has_my_response
      FROM orders o
      LEFT JOIN users u ON o.client_id = u.id
      LEFT JOIN order_responses ord_resp ON o.id = ord_resp.order_id AND ord_resp.is_active = true
      WHERE o.is_active = true
    `;
    
    const params = [req.user.id];
    let paramCount = 1;

    if (category) {
      query += ` AND o.category = $${++paramCount}`;
      params.push(category);
    }

    if (region) {
      query += ` AND o.region = $${++paramCount}`;
      params.push(region);
    }

    // Добавляем фильтр по статусу только если он задан явно
    if (status !== null && status !== undefined && status !== '') {
      query += ` AND o.status = $${++paramCount}`;
      params.push(status);
    }

    // Мастера видят все заявки, клиенты - только свои
    if (req.user.role === 'user') {
      query += ` AND o.client_id = $${++paramCount}`;
      params.push(req.user.id);
    }

    query += `
      GROUP BY o.id, u.username, u.first_name, u.last_name, u.avatar, u.phone
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

// GET /api/orders/regions - Получить список регионов Казахстана (ПУБЛИЧНЫЙ)
router.get('/regions', async (req, res) => {
  try {
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

// GET /api/orders/categories - Получить категории заявок (ПУБЛИЧНЫЙ)
router.get('/categories', async (req, res) => {
  try {
    // Получаем категории из базы данных
    const result = await pool.query(`
      SELECT id, name, slug, description, color, sort_order
      FROM content_categories 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `);
    
    const categories = result.rows.map(row => ({
      id: row.slug,
      name: row.name,
      description: row.description,
      color: row.color
    }));

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
        ord_resp.*,
        u.username as master_username,
        u.first_name as master_first_name,
        u.last_name as master_last_name,
        u.avatar as master_avatar,
        u.phone as master_phone
      FROM order_responses ord_resp
      LEFT JOIN users u ON ord_resp.master_id = u.id
      WHERE ord_resp.order_id = $1 AND ord_resp.is_active = true
      ORDER BY ord_resp.created_at DESC
    `, [orderId]);

    order.responses = responsesResult.rows;
    
    console.log(`[GET ORDER] Order ID: ${orderId}`);
    console.log(`[GET ORDER] Responses found: ${responsesResult.rows.length}`);
    console.log(`[GET ORDER] Responses:`, JSON.stringify(responsesResult.rows, null, 2));

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

// GET /api/orders/:id/responses - Получить отклики на заявку
router.get('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Проверяем, что пользователь имеет доступ к заявке (админы имеют доступ ко всем)
    const isAdmin = req.user.role === 'admin';
    const orderResult = await pool.query(
      isAdmin 
        ? 'SELECT * FROM orders WHERE id = $1'
        : 'SELECT * FROM orders WHERE id = $1 AND (client_id = $2 OR $2 IN (SELECT master_id FROM order_responses WHERE order_id = $1))',
      isAdmin ? [orderId] : [orderId, userId]
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
        ord_resp.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        u.phone,
        u.email
      FROM order_responses ord_resp
      LEFT JOIN users u ON ord_resp.master_id = u.id
      WHERE ord_resp.order_id = $1 AND ord_resp.is_active = true
      ORDER BY ord_resp.created_at DESC
    `, [orderId]);

    // Трансформируем данные - создаем объект master для каждого отклика
    const responses = responsesResult.rows.map(row => ({
      id: row.id,
      order_id: row.order_id,
      master_id: row.master_id,
      message: row.message,
      price: row.price,
      deadline: row.deadline,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_active: row.is_active,
      master: {
        id: row.master_id,
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        name: row.first_name && row.last_name 
          ? `${row.first_name} ${row.last_name}` 
          : row.username,
        avatar: row.avatar,
        phone: row.phone,
        email: row.email,
        role: 'master'
      }
    }));

    res.json({
      success: true,
      data: responses,
      total: responses.length,
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
    console.log('[ACCEPT RESPONSE] Starting...');
    console.log('[ACCEPT RESPONSE] Order ID:', req.params.id);
    console.log('[ACCEPT RESPONSE] Response ID:', req.body.responseId);
    console.log('[ACCEPT RESPONSE] User ID:', req.user.id);
    
    const orderId = req.params.id;
    const { responseId } = req.body;
    const userId = req.user.id;

    if (!responseId) {
      console.log('[ACCEPT RESPONSE] ERROR: No response ID');
      return res.status(400).json({
        success: false,
        message: 'Response ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что пользователь - владелец заявки
    console.log('[ACCEPT RESPONSE] Checking order ownership...');
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND client_id = $2 AND is_active = true',
      [orderId, userId]
    );
    console.log('[ACCEPT RESPONSE] Order found:', orderResult.rows.length > 0);

    if (orderResult.rows.length === 0) {
      console.log('[ACCEPT RESPONSE] ERROR: Order not found or access denied');
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что отклик существует
    console.log('[ACCEPT RESPONSE] Checking response exists...');
    const responseResult = await pool.query(
      'SELECT * FROM order_responses WHERE id = $1 AND order_id = $2 AND is_active = true',
      [responseId, orderId]
    );
    console.log('[ACCEPT RESPONSE] Response found:', responseResult.rows.length > 0);
    console.log('[ACCEPT RESPONSE] Master ID:', responseResult.rows[0]?.master_id);

    if (responseResult.rows.length === 0) {
      console.log('[ACCEPT RESPONSE] ERROR: Response not found');
      return res.status(404).json({
        success: false,
        message: 'Response not found',
        timestamp: new Date().toISOString()
      });
    }

    // ✅ Обновляем статус заявки и откликов (транзакция для атомарности)
    console.log('[ACCEPT RESPONSE] Starting transaction...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('[ACCEPT RESPONSE] Transaction started');

      // 1. Отклоняем все другие отклики на эту заявку
      console.log('[ACCEPT RESPONSE] Rejecting other responses...');
      await client.query(
        'UPDATE order_responses SET status = $1 WHERE order_id = $2 AND id != $3 AND status = $4',
        ['rejected', orderId, responseId, 'pending']
      );

      // 2. Принимаем выбранный отклик
      console.log('[ACCEPT RESPONSE] Accepting selected response...');
      const acceptResult = await client.query(
        'UPDATE order_responses SET status = $1 WHERE id = $2 AND status = $3 RETURNING master_id',
        ['accepted', responseId, 'pending']
      );

      if (acceptResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Response already accepted or not found',
          timestamp: new Date().toISOString()
        });
      }

      const masterId = acceptResult.rows[0].master_id;

      // 3. Обновляем статус заявки
      console.log('[ACCEPT RESPONSE] Updating order status...');
      await client.query(
        'UPDATE orders SET status = $1, master_id = $2 WHERE id = $3',
        ['accepted', masterId, orderId]
      );
      console.log('[ACCEPT RESPONSE] Order updated');

      // 4. Создаем чат между клиентом и мастером
      console.log('[ACCEPT RESPONSE] Creating chat...');
      const chatResult = await client.query(`
        INSERT INTO chats (type, name, description, creator_id, order_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, ['private', `Заявка: ${orderResult.rows[0].title}`, `Чат по заявке "${orderResult.rows[0].title}"`, userId, orderId]);
      console.log('[ACCEPT RESPONSE] Chat created');

      const chatId = chatResult.rows[0].id;
      console.log('[ACCEPT RESPONSE] Chat ID:', chatId);

      // 5. Добавляем участников в чат
      console.log('[ACCEPT RESPONSE] Adding chat participants...');
      await client.query(
        'INSERT INTO chat_participants (chat_id, user_id, role) VALUES ($1, $2, $3), ($1, $4, $3)',
        [chatId, userId, 'member', masterId]
      );
      console.log('[ACCEPT RESPONSE] Chat participants added');

      console.log('[ACCEPT RESPONSE] Committing transaction...');
      await client.query('COMMIT');
      client.release();
      
      console.log('[ACCEPT RESPONSE] Transaction committed');
      console.log('[ACCEPT RESPONSE] Chat created with ID:', chatId);

      // Отправляем уведомление мастеру
      console.log('[ACCEPT RESPONSE] Sending notification to master...');
      try {
        const notifResult = await notificationService.sendNotification(
          masterId,
          'response_accepted',
          'Ваш отклик принят!',
          `Клиент принял ваш отклик на заявку "${orderResult.rows[0].title}"`,
          {
            push: true,
            sms: true,
            smsType: 'response_accepted',
            data: { orderId, chatId }
          }
        );
        console.log('[ACCEPT RESPONSE] Notification sent:', JSON.stringify(notifResult));
      } catch (notifError) {
        console.error('[ACCEPT RESPONSE] Notification error:', notifError.message);
        console.error('[ACCEPT RESPONSE] Notification error stack:', notifError.stack);
      }

      const responseData = {
        success: true,
        data: {
          order: { ...orderResult.rows[0], status: 'accepted', master_id: masterId },
          chat: { id: chatId }
        },
        message: 'Response accepted successfully',
        timestamp: new Date().toISOString()
      };
      
      console.log('[ACCEPT RESPONSE] Sending response:', JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } catch (transactionError) {
      // Откат транзакции при ошибке
      await client.query('ROLLBACK');
      client.release();
      throw transactionError;
    }

  } catch (error) {
    console.error('[ACCEPT RESPONSE] Accept response error:', error);
    console.error('[ACCEPT RESPONSE] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to accept response',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;