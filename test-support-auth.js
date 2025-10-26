const { chromium } = require('playwright');

// 🚀 ТЕСТ С ПРАВИЛЬНОЙ АВТОРИЗАЦИЕЙ
async function testSupportWithAuth() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Переходим на сайт и логинимся...');
    
    // Логинимся с существующим пользователем
    await page.goto('https://mebelplace.com.kz/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill('+77771234567');
    await page.waitForTimeout(500);
    
    await page.locator('input[type="password"]').fill('testpass123');
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Войти")').click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Логин успешен');
    
    // Получаем токен из localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem('accessToken');
    });
    
    if (token) {
      console.log(`🔑 Получен токен: ${token.substring(0, 20)}...`);
      
      // Тестируем endpoint напрямую с токеном
      console.log('🧪 Тестируем endpoint /api/support/contact с токеном...');
      
      const response = await page.evaluate(async (authToken) => {
        try {
          const res = await fetch('https://mebelplace.com.kz/api/support/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              subject: 'Тест поддержки - прямой API вызов',
              message: 'Это тестовое сообщение отправлено напрямую через API с правильным токеном авторизации.',
              priority: 'medium'
            })
          });
          
          const data = await res.json();
          return {
            status: res.status,
            success: res.ok,
            data: data
          };
        } catch (error) {
          return {
            status: 0,
            success: false,
            error: error.message
          };
        }
      }, token);
      
      console.log(`📡 Ответ API:`, response);
      
      if (response.success) {
        console.log('🎉 УСПЕХ! Сообщение отправлено через API!');
      } else {
        console.log('❌ ОШИБКА API:', response.data?.message || response.error);
      }
      
    } else {
      console.log('❌ Токен не найден в localStorage');
    }
    
    // Также тестируем через UI
    console.log('🖱️ Тестируем через UI...');
    await page.goto('https://mebelplace.com.kz/user/support', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const contactButton = page.locator('button:has-text("Новое обращение")');
    if (await contactButton.count() > 0) {
      await contactButton.click();
      console.log('✅ Нажали кнопку "Новое обращение"');
      await page.waitForTimeout(2000);
      
      // Заполняем форму
      const subjectInput = page.locator('input[name*="subject"], input[placeholder*="тема"]').first();
      if (await subjectInput.count() > 0) {
        await subjectInput.fill('Тест поддержки - через UI');
        console.log('✅ Заполнили тему');
        await page.waitForTimeout(500);
      }
      
      const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"]').first();
      if (await messageInput.count() > 0) {
        await messageInput.fill('Это тестовое сообщение отправлено через UI интерфейс.');
        console.log('✅ Заполнили сообщение');
        await page.waitForTimeout(500);
      }
      
      // Отправляем форму
      const submitButton = page.locator('button[type="submit"], button:has-text("Отправить")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        console.log('✅ Отправили сообщение через UI');
        await page.waitForTimeout(3000);
      }
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Проверяем базу данных
async function checkDatabase() {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const result = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM support_tickets;"');
    const count = parseInt(result.stdout.trim()) || 0;
    
    console.log(`📊 Тикетов поддержки в БД: ${count}`);
    return count;
    
  } catch (error) {
    console.log(`❌ Ошибка проверки БД: ${error.message}`);
    return 0;
  }
}

async function runTest() {
  console.log('🚀 ТЕСТ ПОДДЕРЖКИ С АВТОРИЗАЦИЕЙ');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  
  // Проверяем БД до теста
  console.log('📊 Проверяем БД ДО теста...');
  const countBefore = await checkDatabase();
  
  // Запускаем тест
  await testSupportWithAuth();
  
  // Проверяем БД после теста
  console.log('📊 Проверяем БД ПОСЛЕ теста...');
  const countAfter = await checkDatabase();
  
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`📊 Результат:`);
  console.log(`   До теста: ${countBefore} тикетов`);
  console.log(`   После теста: ${countAfter} тикетов`);
  console.log(`   Изменение: ${countAfter - countBefore}`);
  
  if (countAfter > countBefore) {
    console.log('🎉 УСПЕХ! Тикет создан в БД!');
  } else {
    console.log('❌ ПРОБЛЕМА! Тикет не создался в БД');
  }
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

runTest().catch(console.error);
