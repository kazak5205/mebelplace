const { pool } = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.images = data.images || [];
    this.client_id = data.client_id;
    this.master_id = data.master_id;
    this.status = data.status || 'pending';
    this.price = data.price;
    this.deadline = data.deadline;
    this.location = data.location;
    this.category = data.category;
    this.is_active = data.is_active !== false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Создать новую заявку
  static async create(orderData) {
    const { title, description, images, client_id, category, location } = orderData;
    
    const query = `
      INSERT INTO orders (title, description, images, client_id, category, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [title, description, images, client_id, category, location];
    const result = await pool.query(query, values);
    return new Order(result.rows[0]);
  }

  // Получить заявку по ID
  static async findById(id) {
    const query = `
      SELECT o.*, 
             c.username as client_username, c.first_name as client_first_name, c.last_name as client_last_name, c.avatar as client_avatar,
             m.username as master_username, m.first_name as master_first_name, m.last_name as master_last_name, m.avatar as master_avatar
      FROM orders o
      LEFT JOIN users c ON o.client_id = c.id
      LEFT JOIN users m ON o.master_id = m.id
      WHERE o.id = $1 AND o.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new Order(result.rows[0]) : null;
  }

  // Получить все заявки с фильтрацией
  static async findAll(filters = {}) {
    let query = `
      SELECT o.*, 
             c.username as client_username, c.first_name as client_first_name, c.last_name as client_last_name, c.avatar as client_avatar,
             m.username as master_username, m.first_name as master_first_name, m.last_name as master_last_name, m.avatar as master_avatar
      FROM orders o
      LEFT JOIN users c ON o.client_id = c.id
      LEFT JOIN users m ON o.master_id = m.id
      WHERE o.is_active = true
    `;
    
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND o.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.client_id) {
      paramCount++;
      query += ` AND o.client_id = $${paramCount}`;
      values.push(filters.client_id);
    }

    if (filters.master_id) {
      paramCount++;
      query += ` AND o.master_id = $${paramCount}`;
      values.push(filters.master_id);
    }

    query += ` ORDER BY o.created_at DESC`;

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows.map(row => new Order(row));
  }

  // Обновить заявку
  async update(updateData) {
    const allowedFields = ['title', 'description', 'images', 'status', 'price', 'deadline', 'location', 'category', 'master_id'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return this;
    }

    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(this.id);

    const query = `
      UPDATE orders 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Удалить заявку (мягкое удаление)
  async delete() {
    const query = `
      UPDATE orders 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [this.id]);
    this.is_active = false;
    return this;
  }

  // Получить отклики на заявку
  async getResponses() {
    const query = `
      SELECT or.*, 
             u.username, u.first_name, u.last_name, u.avatar, u.phone
      FROM order_responses or
      JOIN users u ON or.master_id = u.id
      WHERE or.order_id = $1 AND or.is_active = true
      ORDER BY or.created_at ASC
    `;
    
    const result = await pool.query(query, [this.id]);
    return result.rows;
  }

  // Принять предложение мастера
  async acceptResponse(responseId) {
    const client = await pool.query('BEGIN');
    
    try {
      // Получить информацию об отклике
      const responseResult = await pool.query(
        'SELECT * FROM order_responses WHERE id = $1 AND order_id = $2',
        [responseId, this.id]
      );
      
      if (responseResult.rows.length === 0) {
        throw new Error('Response not found');
      }
      
      const response = responseResult.rows[0];
      
      // Обновить заявку
      await this.update({
        status: 'accepted',
        master_id: response.master_id,
        price: response.price,
        deadline: response.deadline
      });
      
      // Создать чат
      const chatQuery = `
        INSERT INTO chats (order_id, client_id, master_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const chatResult = await pool.query(chatQuery, [
        this.id,
        this.client_id,
        response.master_id
      ]);
      
      await pool.query('COMMIT');
      
      return {
        order: this,
        chat: chatResult.rows[0]
      };
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  // Получить доступные категории мебели
  static getCategories() {
    return [
      'диван',
      'стол',
      'шкаф',
      'кровать',
      'стул',
      'кресло',
      'комод',
      'тумба',
      'полка',
      'стенка',
      'кухня',
      'прихожая',
      'детская',
      'офисная',
      'другое'
    ];
  }

  // Получить статистику заявок
  static async getStats(userId, role) {
    let query = '';
    let values = [userId];
    
    if (role === 'client') {
      query = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_orders,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders 
        WHERE client_id = $1 AND is_active = true
      `;
    } else if (role === 'master') {
      query = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_orders,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
        FROM orders 
        WHERE master_id = $1 AND is_active = true
      `;
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Order;
