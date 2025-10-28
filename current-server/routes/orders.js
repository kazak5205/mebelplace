const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const notificationService = require('../services/notificationService');
const router = express.Router();

// POST /api/orders/create - Создание заявки
router.post('/create', authenticateToken, imageUpload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, location, city, region, budget, deadline } = req.body;
    const clientId = req.user.id;

    console.log('[CREATE ORDER] Request:', { title, description, category, location, city, region, budget });

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
        timestamp: new Date().toISOString()
      });
    }

    // Обработка загруженных изображений
    let images = [];
    if (req.files && req.files.length > 0) {
      // Изображения загружены через multer
      images = req.files.map(file => `/uploads/order-photos/${file.filename}`);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      // Изображения переданы в body (уже загружены ранее)
      images = req.body.images;
    }

    // Используем city (если передан) или location (для обратной совместимости)
    const cityValue = city || location;

    // Создание заявки
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
      cityValue,
      region || null,
      budget ? parseFloat(budget) : null,
      deadline ? new Date(deadline) : null,
      'pending'
    ]);

    const order = result.rows[0];

    // Уведомление мастерам о новой заявке (optional - skip if service not ready)
    try {
      const mastersResult = await pool.query(
        'SELECT id FROM users WHERE role = $1 AND is_active = true',
        ['master']
      );

      for (const master of mastersResult.rows) {
        if (notificationService && typeof notificationService.notifyNewOrder === 'function') {
          await notificationService.notifyNewOrder(master.id, order.title, req.user.username);
        }
      }
    } catch (notifError) {
      console.warn('Notification error (non-critical):', notifError.message);
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
    console.error('[ORDERS] Orders feed request from user:', req.user.id, 'role:', req.user.role);
    
    const { page = 1, limit = 10, category, region, status = 'pending', master_responses } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        u.username as client_username,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.avatar as client_avatar,
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

    if (status) {
      query += ` AND o.status = $${++paramCount}`;
      params.push(status);
    }

    // Мастера видят все заявки, клиенты - только свои
    if (req.user.role === 'user' || req.user.role === 'client') {
      query += ` AND o.client_id = $${++paramCount}`;
      params.push(req.user.id);
    }

    // Если запрашиваются заявки, на которые мастер откликнулся
    if (master_responses === 'true' && req.user.role === 'master') {
      query += ` AND o.id IN (SELECT order_id FROM order_responses WHERE master_id = $${++paramCount} AND is_active = true)`;
      params.push(req.user.id);
    }

    query += `
      GROUP BY o.id, u.username, u.first_name, u.last_name, u.avatar
      ORDER BY o.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(parseInt(limit));
    params.push(parseInt(offset));

    console.error('[ORDERS] Executing query');
    console.error('[ORDERS] Params:', JSON.stringify(params));

    const result = await pool.query(query, params);
    console.error('[ORDERS] Query result:', result.rows.length, 'rows');

    // Map snake_case to camelCase for frontend
    const mappedOrders = result.rows.map(order => ({
      id: order.id,
      clientId: order.client_id,
      masterId: order.master_id,
      title: order.title,
      description: order.description,
      category: order.category,
      region: order.region,
      status: order.status,
      price: order.price,
      deadline: order.deadline,
      location: order.location,
      images: order.images || [],
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      client: order.client_username ? {
        id: order.client_id,
        username: order.client_username,
        firstName: order.client_first_name,
        lastName: order.client_last_name,
        avatar: order.client_avatar,
        email: '',
        role: 'user',
        isActive: true,
        isVerified: true,
        createdAt: order.created_at
      } : undefined,
      responseCount: parseInt(order.response_count) || 0,
      hasMyResponse: order.has_my_response || false
    }));

    res.json({
      success: true,
      data: {
        orders: mappedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mappedOrders.length
        }
      },
      message: 'Orders retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get orders feed error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders/regions - Получить список регионов Казахстана
router.get('/regions', async (req, res) => {
  try {
    const { KZ_REGIONS } = require('../utils/regions');

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
        u.avatar as master_avatar
      FROM order_responses ord_resp
      LEFT JOIN users u ON ord_resp.master_id = u.id
      WHERE ord_resp.order_id = $1 AND ord_resp.is_active = true
      ORDER BY ord_resp.created_at DESC
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

// GET /api/orders/:id/responses - Получить отклики на заявку
router.get('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Проверяем, что пользователь имеет доступ к заявке
    // Клиенты видят только свои заявки, мастера видят все заявки
    const orderResult = await pool.query(
      req.user.role === 'client' || req.user.role === 'user'
        ? 'SELECT * FROM orders WHERE id = $1 AND client_id = $2'
        : 'SELECT * FROM orders WHERE id = $1',
      req.user.role === 'client' || req.user.role === 'user' ? [orderId, userId] : [orderId]
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
        u.id as master_user_id,
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

    res.json({
      success: true,
      data: responsesResult.rows,
      total: responsesResult.rows.length,
      message: 'Responses retrieved successfully',
      timestamp: new Date().toISOString()
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

// POST /api/orders/:id/accept - Принять отклик мастера
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { responseId } = req.body;
    const clientId = req.user.id;

    if (!responseId) {
      return res.status(400).json({
        success: false,
        message: 'Response ID is required'
      });
    }

    // Проверяем что заявка принадлежит клиенту
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND client_id = $2',
      [orderId, clientId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept responses for this order'
      });
    }

    // Получаем отклик
    const responseResult = await pool.query(
      'SELECT * FROM order_responses WHERE id = $1 AND order_id = $2',
      [responseId, orderId]
    );

    if (responseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    const response = responseResult.rows[0];
    const masterId = response.master_id;

    // Начинаем транзакцию
    await pool.query('BEGIN');

    try {
      // 1. Принимаем отклик
      await pool.query(
        'UPDATE order_responses SET is_accepted = true, updated_at = NOW() WHERE id = $1',
        [responseId]
      );

      // 2. Обновляем статус заявки
      await pool.query(
        'UPDATE orders SET status = $1, master_id = $2, updated_at = NOW() WHERE id = $3',
        ['in_progress', masterId, orderId]
      );

      // 3. Создаём или находим чат между клиентом и мастером
      const chatCheck = await pool.query(
        `SELECT c.id FROM chats c
         INNER JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
         INNER JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = $2
         WHERE c.type = 'private'
         LIMIT 1`,
        [clientId, masterId]
      );

      let chatId;
      if (chatCheck.rows.length > 0) {
        chatId = chatCheck.rows[0].id;
      } else {
        // Создаём новый чат
        const chatResult = await pool.query(
          `INSERT INTO chats (type, creator_id, created_at, updated_at)
           VALUES ('private', $1, NOW(), NOW())
           RETURNING id`,
          [clientId]
        );
        chatId = chatResult.rows[0].id;
        
        // Добавляем участников чата
        await pool.query(
          `INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
           VALUES ($1, $2, 'member', NOW()), ($1, $3, 'member', NOW())`,
          [chatId, clientId, masterId]
        );
      }

      await pool.query('COMMIT');

      res.json({
        success: true,
        chatId,
        message: 'Response accepted successfully'
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Accept response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept response'
    });
  }
});

// POST /api/orders/upload-images - Загрузка изображений для заявок
router.post('/upload-images', authenticateToken, imageUpload.array('images', 5), async (req, res) => {
  try {
    console.log('🚀 Upload endpoint called');
    console.log('📦 req.files:', req.files);
    console.log('📝 req.body:', req.body);
    console.log('👤 req.user:', req.user);
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files uploaded');
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ ${req.files.length} files received`);
    const imageUrls = req.files.map(file => `/uploads/order-photos/${file.filename}`);
    console.log('🔗 Image URLs:', imageUrls);

    res.json({
      success: true,
      data: imageUrls,
      message: `${imageUrls.length} images uploaded successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Upload images error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/orders/:id - Удаление заявки
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Проверяем, что заявка принадлежит пользователю
    const orderResult = await pool.query(
      'SELECT id, client_id FROM orders WHERE id = $1 AND is_active = true',
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

    // Проверяем права доступа (только клиент может удалить свою заявку)
    if (order.client_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own orders.',
        timestamp: new Date().toISOString()
      });
    }

    // Мягкое удаление - помечаем как неактивную
    await pool.query(
      'UPDATE orders SET is_active = false WHERE id = $1',
      [orderId]
    );

    res.json({
      success: true,
      message: 'Order deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      timestamp: new Date().toISOString()
    });
  }
});



module.exports = router;