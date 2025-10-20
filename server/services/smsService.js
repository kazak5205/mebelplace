const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = 'kza709b533060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1';
    this.baseUrl = 'https://api.mobizon.kz/service';
  }

  // Отправка SMS сообщения
  async sendSMS(phone, message, sender = 'MebelPlace') {
    try {
      // Форматируем номер телефона (убираем + и добавляем код страны если нужно)
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const response = await axios.post(`${this.baseUrl}/message/sendsmsmessage`, {
        apiKey: this.apiKey,
        recipient: formattedPhone,
        from: sender,
        text: message,
        output: 'json'
      });

      if (response.data.code === 0) {
        console.log(`✅ SMS sent successfully to ${formattedPhone}`);
        return {
          success: true,
          messageId: response.data.data?.messageId,
          cost: response.data.data?.cost
        };
      } else {
        console.error(`❌ SMS sending failed: ${response.data.message}`);
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      console.error('SMS service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Отправка SMS с кодом подтверждения
  async sendVerificationCode(phone, code) {
    const message = `MebelPlace: Ваш код подтверждения: ${code}. Не передавайте его никому.`;
    return await this.sendSMS(phone, message);
  }

  // Отправка уведомления о новом отклике на заявку
  async sendNewResponseNotification(phone, orderTitle, masterName) {
    const message = `MebelPlace: Новый отклик на вашу заявку "${orderTitle}" от мастера ${masterName}. Проверьте приложение.`;
    return await this.sendSMS(phone, message);
  }

  // Отправка уведомления о новом сообщении в чате
  async sendNewMessageNotification(phone, senderName) {
    const message = `MebelPlace: Новое сообщение от ${senderName} в чате. Проверьте приложение.`;
    return await this.sendSMS(phone, message);
  }

  // Отправка уведомления о принятии отклика
  async sendResponseAcceptedNotification(phone, orderTitle, clientName) {
    const message = `MebelPlace: Ваш отклик на заявку "${orderTitle}" принят клиентом ${clientName}. Начинайте работу!`;
    return await this.sendSMS(phone, message);
  }

  // Отправка уведомления о новом видео от подписки
  async sendNewVideoNotification(phone, masterName, videoTitle) {
    const message = `MebelPlace: ${masterName} загрузил новое видео "${videoTitle}". Смотрите в приложении!`;
    return await this.sendSMS(phone, message);
  }

  // Отправка уведомления о новом подписчике
  async sendNewSubscriberNotification(phone, subscriberName) {
    const message = `MebelPlace: У вас новый подписчик: ${subscriberName}!`;
    return await this.sendSMS(phone, message);
  }

  // Отправка уведомления о системном событии
  async sendSystemNotification(phone, message) {
    return await this.sendSMS(phone, `MebelPlace: ${message}`);
  }

  // Форматирование номера телефона
  formatPhoneNumber(phone) {
    // Убираем все символы кроме цифр
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Если номер начинается с 8, заменяем на 7
    if (cleanPhone.startsWith('8')) {
      cleanPhone = '7' + cleanPhone.substring(1);
    }
    
    // Если номер не начинается с 7, добавляем 7
    if (!cleanPhone.startsWith('7')) {
      cleanPhone = '7' + cleanPhone;
    }
    
    return cleanPhone;
  }

  // Проверка баланса
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/user/getownbalance`, {
        params: {
          apiKey: this.apiKey,
          output: 'json'
        }
      });

      if (response.data.code === 0) {
        return {
          success: true,
          balance: response.data.data.balance,
          currency: response.data.data.currency
        };
      } else {
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      console.error('Balance check error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Получение истории SMS
  async getSMSHistory(fromDate, toDate, limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/message/list`, {
        params: {
          apiKey: this.apiKey,
          from: fromDate,
          to: toDate,
          limit: limit,
          output: 'json'
        }
      });

      if (response.data.code === 0) {
        return {
          success: true,
          messages: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      console.error('SMS history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Отправка массовой рассылки
  async sendBulkSMS(recipients, message, sender = 'MebelPlace') {
    try {
      const formattedRecipients = recipients.map(phone => this.formatPhoneNumber(phone));
      
      const response = await axios.post(`${this.baseUrl}/message/sendsmsmessage`, {
        apiKey: this.apiKey,
        recipient: formattedRecipients.join(','),
        from: sender,
        text: message,
        output: 'json'
      });

      if (response.data.code === 0) {
        console.log(`✅ Bulk SMS sent successfully to ${formattedRecipients.length} recipients`);
        return {
          success: true,
          campaignId: response.data.data?.campaignId,
          cost: response.data.data?.cost
        };
      } else {
        console.error(`❌ Bulk SMS sending failed: ${response.data.message}`);
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      console.error('Bulk SMS service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SMSService();
