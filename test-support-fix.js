const { chromium } = require('playwright');

// 🚀 БЫСТРЫЙ ТЕСТ ПОДДЕРЖКИ
async function testSupportChat() {
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
    
    // Переходим на страницу поддержки
    console.log('💬 Переходим на страницу поддержки...');
    await page.goto('https://mebelplace.com.kz/support', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('✅ Страница поддержки загружена');
    
    // Ищем кнопку "Написать в поддержку"
    const contactButton = page.locator('button:has-text("Написать в поддержку")');
    if (await contactButton.count() > 0) {
      await contactButton.click();
      console.log('✅ Нажали кнопку "Написать в поддержку"');
      await page.waitForTimeout(2000);
      
      // Заполняем форму
      const subjectInput = page.locator('input[name*="subject"], input[placeholder*="тема"]').first();
      if (await subjectInput.count() > 0) {
        await subjectInput.fill('Тест поддержки - исправленный endpoint');
        console.log('✅ Заполнили тему');
        await page.waitForTimeout(500);
      }
      
      const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"]').first();
      if (await messageInput.count() > 0) {
        await messageInput.fill('Это тестовое сообщение для проверки исправленного endpoint /api/support/contact. Сообщение должно сохраниться в базе данных.');
        console.log('✅ Заполнили сообщение');
        await page.waitForTimeout(500);
      }
      
      // Отправляем форму
      const submitButton = page.locator('button[type="submit"], button:has-text("Отправить")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        console.log('✅ Отправили сообщение в поддержку');
        await page.waitForTimeout(3000);
        
        // Проверяем результат
        const currentUrl = page.url();
        console.log(`📍 Текущий URL: ${currentUrl}`);
        
        // Ищем сообщение об успехе или ошибке
        const successMessage = page.locator('text=успешно, text=отправлено, text=создан');
        const errorMessage = page.locator('text=ошибка, text=error, text=не удалось');
        
        if (await successMessage.count() > 0) {
          console.log('🎉 Сообщение успешно отправлено!');
        } else if (await errorMessage.count() > 0) {
          console.log('❌ Ошибка при отправке сообщения');
        } else {
          console.log('⚠️ Не удалось определить результат');
        }
      } else {
        console.log('❌ Не найдена кнопка отправки');
      }
    } else {
      console.log('❌ Не найдена кнопка "Написать в поддержку"');
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Проверяем базу данных до и после
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
  console.log('🚀 ТЕСТ ИСПРАВЛЕННОГО ENDPOINT ПОДДЕРЖКИ');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  
  // Проверяем БД до теста
  console.log('📊 Проверяем БД ДО теста...');
  const countBefore = await checkDatabase();
  
  // Запускаем тест
  await testSupportChat();
  
  // Проверяем БД после теста
  console.log('📊 Проверяем БД ПОСЛЕ теста...');
  const countAfter = await checkDatabase();
  
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`📊 Результат:`);
  console.log(`   До теста: ${countBefore} тикетов`);
  console.log(`   После теста: ${countAfter} тикетов`);
  console.log(`   Изменение: ${countAfter - countBefore}`);
  
  if (countAfter > countBefore) {
    console.log('🎉 УСПЕХ! Endpoint работает, тикет создан в БД!');
  } else {
    console.log('❌ ПРОБЛЕМА! Тикет не создался в БД');
  }
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

runTest().catch(console.error);
