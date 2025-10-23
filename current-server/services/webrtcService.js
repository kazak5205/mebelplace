const db = require('../config/database');

class WebRTCService {
  // Создание комнаты для видеозвонка
  async createCallRoom({ chatId, initiatorId, participants }) {
    const roomId = `call_${chatId}_${Date.now()}`;
    
    // Сохраняем информацию о звонке в БД
    await db.query(`
      INSERT INTO video_calls (room_id, chat_id, initiator_id, status, created_at)
      VALUES ($1, $2, $3, 'initiated', NOW())
    `, [roomId, chatId, initiatorId]);

    // Добавляем участников
    for (const participantId of participants) {
      await db.query(`
        INSERT INTO video_call_participants (room_id, user_id, joined_at)
        VALUES ($1, $2, NOW())
      `, [roomId, participantId]);
    }

    return { roomId, chatId, initiatorId };
  }

  // Присоединение к звонку
  async joinCall(roomId, userId) {
    const result = await db.query(`
      UPDATE video_call_participants 
      SET joined_at = NOW(), status = 'joined'
      WHERE room_id = $1 AND user_id = $2
      RETURNING *
    `, [roomId, userId]);

    return result.rows[0];
  }

  // Завершение звонка
  async endCall(roomId) {
    await db.query(`
      UPDATE video_calls 
      SET status = 'ended', ended_at = NOW()
      WHERE room_id = $1
    `, [roomId]);

    await db.query(`
      UPDATE video_call_participants 
      SET status = 'left', left_at = NOW()
      WHERE room_id = $1
    `, [roomId]);
  }

  // Получение информации о звонке
  async getCallInfo(roomId) {
    const result = await db.query(`
      SELECT vc.*, 
             array_agg(vcp.user_id) as participants
      FROM video_calls vc
      LEFT JOIN video_call_participants vcp ON vc.room_id = vcp.room_id
      WHERE vc.room_id = $1
      GROUP BY vc.room_id, vc.chat_id, vc.initiator_id, vc.status, vc.created_at, vc.ended_at
    `, [roomId]);

    return result.rows[0];
  }

  // Получение активных звонков пользователя
  async getUserActiveCalls(userId) {
    const result = await db.query(`
      SELECT vc.*, vcp.joined_at
      FROM video_calls vc
      LEFT JOIN video_call_participants vcp ON vc.room_id = vcp.room_id
      WHERE vcp.user_id = $1 AND vc.status = 'active'
      ORDER BY vc.created_at DESC
    `, [userId]);

    return result.rows;
  }

  // Обновление статуса звонка
  async updateCallStatus(roomId, status) {
    const result = await db.query(`
      UPDATE video_calls 
      SET status = $1, updated_at = NOW()
      WHERE room_id = $2
      RETURNING *
    `, [status, roomId]);

    return result.rows[0];
  }
}

module.exports = new WebRTCService();
