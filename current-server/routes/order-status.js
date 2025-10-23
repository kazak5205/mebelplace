/**
 * Order Status Management Routes
 */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const OrderStatusService = require('../services/orderStatusService');
const router = express.Router();

// POST /api/order-status/:id/change - Изменить статус заказа
router.post('/:id/change', authenticateToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { newStatus, reason } = req.body;
    const userId = req.user.id;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await OrderStatusService.changeStatus(
      orderId,
      newStatus,
      userId,
      reason
    );

    res.json({
      success: true,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Change order status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change order status',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/order-status/:id/history - История статусов заказа
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;

    const history = await OrderStatusService.getStatusHistory(orderId);

    res.json({
      success: true,
      data: history,
      message: 'Status history retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get status history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status history',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/order-status/:id/actions - Доступные действия для заказа
router.get('/:id/actions', authenticateToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Получить заказ
    const { pool } = require('../config/database');
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        timestamp: new Date().toISOString(),
      });
    }

    const order = orderResult.rows[0];
    const actions = OrderStatusService.getAvailableActions(order, userId, userRole);

    res.json({
      success: true,
      data: {
        currentStatus: order.status,
        availableActions: actions,
      },
      message: 'Available actions retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get available actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available actions',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;

