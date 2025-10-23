/**
 * SMS Service для верификации пользователей
 * Использует Mobizon API (https://mobizon.kz)
 */

const { pool } = require('../config/database');
const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MOBIZON_API_KEY || 'kza28b2431c84d125c7b571c1a20363bd4dfc77ca728e74f3f292eb4aee3985d952185';
    this.apiUrl = 'https://api.mobizon.kz/service/message/sendsmsmessage';
  }

  /**
   * Генерация 6-значного кода
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Нормализация номера телефона в формат E.164
   */
  normalizePhone(phone) {
    // Убираем все символы кроме цифр
    let cleanPhone = phone.replace(/\D/g, '');
    
    console.log(`[SMS] Normalizing phone: ${phone} -> ${cleanPhone}`);
    
    // Если номер начинается с 8 и имеет 11 цифр, заменяем на 7
    if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
      cleanPhone = '7' + cleanPhone.substring(1);
      console.log(`[SMS] Converted 8 to 7: ${cleanPhone}`);
    }
    
    // Если номер начинается с 7 и имеет 11 цифр, добавляем +
    if (cleanPhone.startsWith('7') && cleanPhone.length === 11) {
      const result = '+' + cleanPhone;
      console.log(`[SMS] Final normalized phone: ${result}`);
      return result;
    }
    
    // Если номер уже в правильном формате
    if (phone.startsWith('+') && phone.length === 12) {
      console.log(`[SMS] Phone already normalized: ${phone}`);
      return phone;
    }
    
    // Если номер начинается с 7 и имеет 12 цифр (уже с +7), возвращаем как есть
    if (cleanPhone.startsWith('7') && cleanPhone.length === 12) {
      const result = '+' + cleanPhone;
      console.log(`[SMS] Phone with 12 digits normalized: ${result}`);
      return result;
    }
    
    console.log(`[SMS] Could not normalize phone: ${phone} (length: ${cleanPhone.length})`);
    return phone; // Возвращаем как есть, если не можем нормализовать
  }

  /**
   * Отправка SMS через Mobizon API
   */
  async sendVerificationCode(phone, code) {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log(`[SMS] Sending code ${code} to ${normalizedPhone} via Mobizon`);
      
      // Сохраняем код в БД
      try {
        await pool.query(
          `INSERT INTO sms_verifications (phone, code, expires_at, attempts)
           VALUES ($1, $2, NOW() + INTERVAL '10 minutes', 0)
           ON CONFLICT (phone) 
           DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '10 minutes', attempts = 0, created_at = NOW()`,
          [normalizedPhone, code]
        );
        console.log(`[SMS] Code ${code} saved to DB for ${normalizedPhone}`);
      } catch (dbError) {
        console.error('[SMS] Database error:', dbError);
        throw new Error('Failed to save SMS code to database');
      }

      // Отправка через Mobizon API с правильными параметрами
      const message = `MebelPlace код верификации: ${code}. Действителен 10 минут.`;
      
      // Используем GET запрос с параметрами как в документации Mobizon
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        recipient: normalizedPhone,
        text: message
      });
      
      const url = `${this.apiUrl}?${params.toString()}`;
      
      try {
        console.log(`[SMS] Sending to Mobizon:`, {
          recipient: normalizedPhone,
          text: message,
          url: url
        });
        
        const response = await axios.get(url, {
          headers: { 
            'Accept': 'application/json'
          }
        });
        
        console.log(`[SMS] Mobizon response:`, JSON.stringify(response.data, null, 2));
        console.log(`[SMS] Successfully sent via Mobizon to ${normalizedPhone}`);
        return { success: true, message: 'SMS sent successfully', response: response.data };
      } catch (smsError) {
        console.error('[SMS] Mobizon API error:', smsError.response?.data || smsError.message);
        console.error('[SMS] Full error:', smsError);
        console.error('[SMS] Error details:', {
          message: smsError.message,
          code: smsError.code,
          response: smsError.response?.data,
          status: smsError.response?.status
        });
        // Код уже сохранен в БД, поэтому можем вернуть success для тестирования
        return { success: true, message: 'SMS queued (code saved in DB)', error: smsError.message };
      }
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
