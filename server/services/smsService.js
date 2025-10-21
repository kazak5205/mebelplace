/**
 * SMS Service для верификации пользователей
 * Использует Mobizon API (https://mobizon.kz)
 */

const { pool } = require('../config/database');
const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MOBIZON_API_KEY || 'kza709b553060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1';
    this.apiUrl = 'https://api.mobizon.kz/service/message/sendsmsmessage';
  }

  /**
   * Генерация 6-значного кода
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Отправка SMS через Mobizon API
   */
  async sendVerificationCode(phone, code) {
    try {
      console.log(`[SMS] Sending code ${code} to ${phone} via Mobizon`);
      
      // Сохраняем код в БД
      await pool.query(
        `INSERT INTO sms_verifications (phone, code, expires_at, attempts)
         VALUES ($1, $2, NOW() + INTERVAL '10 minutes', 0)
         ON CONFLICT (phone) 
         DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '10 minutes', attempts = 0, created_at = NOW()`,
        [phone, code]
      );

      // Отправка через Mobizon API (временно отключено для тестирования)
      console.log(`[SMS] Code saved to DB for testing. In production, SMS will be sent via Mobizon.`);
      
      // TODO: Включить после тестирования
      // const message = `MebelPlace код верификации: ${code}. Действителен 10 минут.`;
      // const url = `${this.apiUrl}?apiKey=${this.apiKey}&recipient=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`;
      // const response = await axios.post(url, null, {
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      // });
      
      return { success: true, message: 'SMS sent (test mode)' };
    } catch (error) {
      console.error('[SMS] Send error:', error);
      throw error;
    }
  }

  /**
   * Проверка кода
   */
  async verifyCode(phone, code) {
    try {
      const result = await pool.query(
        `SELECT * FROM sms_verifications 
         WHERE phone = $1 AND code = $2 AND expires_at > NOW() AND attempts < 3`,
        [phone, code]
      );

      if (result.rows.length === 0) {
        // Увеличиваем счётчик попыток
        await pool.query(
          `UPDATE sms_verifications SET attempts = attempts + 1 WHERE phone = $1`,
          [phone]
        );
        return { success: false, message: 'Invalid or expired code' };
      }

      // Удаляем использованный код
      await pool.query(`DELETE FROM sms_verifications WHERE phone = $1`, [phone]);

      return { success: true, message: 'Code verified' };
    } catch (error) {
      console.error('[SMS] Verify error:', error);
      throw new Error('Failed to verify code');
    }
  }

  /**
   * Запрос повторной отправки
   */
  async resendCode(phone) {
    const code = this.generateCode();
    return await this.sendVerificationCode(phone, code);
  }
}

module.exports = new SMSService();
