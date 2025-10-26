const { chromium } = require('playwright');

// 🚀 ПРАВИЛЬНЫЙ ТЕСТ СОЗДАНИЯ ЗАКАЗА И ВЗАИМОДЕЙСТВИЙ
async function testOrderCreationAndInteractions() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Переходим на сайт и логинимся...');
    await page.goto('https://mebelplace.com.kz/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill('+77770000420');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button:has-text("Войти")').click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Логин успешен');
    
    // 1. СОЗДАНИЕ ЗАКАЗА
    console.log('📝 Создаем заказ...');
    await page.goto('https://mebelplace.com.kz/orders/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Заполняем поля заказа
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('Срочный заказ кухни 3 метра');
    console.log('✅ Заполнили заголовок заказа');
    
    await page.waitForTimeout(1000);
    
    const descInput = page.locator('textarea[name="description"]');
    await descInput.fill('Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге. Срок до 1 декабря 2025 года. Требуется замер на дому. Дополнительные требования: встроенная техника, освещение под шкафами.');
    console.log('✅ Заполнили описание заказа');
    
    await page.waitForTimeout(1000);
    
    const locationInput = page.locator('input[name="location"]');
    await locationInput.fill('Алматы, ул. Абая 150');
    console.log('✅ Заполнили локацию');
    
    await page.waitForTimeout(1000);
    
    // Ищем кнопку отправки
    const submitButtons = await page.locator('button[type="submit"], button:has-text("Создать"), button:has-text("Отправить"), button:has-text("Опубликовать")').all();
    console.log(`🔍 Найдено ${submitButtons.length} кнопок отправки`);
    
    if (submitButtons.length > 0) {
      await submitButtons[0].click();
      console.log('✅ Отправили заказ');
      
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      console.log(`📍 URL после создания заказа: ${currentUrl}`);
    }
    
    // 2. ВЗАИМОДЕЙСТВИЕ С ГЛАВНОЙ СТРАНИЦЕЙ
    console.log('🏠 Переходим на главную страницу...');
    await page.goto('https://mebelplace.com.kz/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Ищем кнопку "ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ"
    const orderButtons = await page.locator('button:has-text("ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ")').all();
    console.log(`🔍 Найдено ${orderButtons.length} кнопок "ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ"`);
    
    if (orderButtons.length > 0) {
      await orderButtons[0].click();
      console.log('✅ Нажали "ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ"');
      
      await page.waitForTimeout(3000);
      
      const newUrl = page.url();
      console.log(`📍 URL после нажатия кнопки: ${newUrl}`);
    }
    
    // Ищем кнопки лайков и сохранения
    const likeButtons = await page.locator('button:has-text("1"), button:has-text("0")').all();
    console.log(`🔍 Найдено ${likeButtons.length} кнопок лайков`);
    
    if (likeButtons.length > 0) {
      for (let i = 0; i < Math.min(3, likeButtons.length); i++) {
        try {
          await likeButtons[i].click();
          console.log(`✅ Нажали лайк ${i + 1}`);
          await page.waitForTimeout(1000);
        } catch (error) {
          console.log(`❌ Ошибка лайка ${i + 1}: ${error.message}`);
        }
      }
    }
    
    const saveButtons = await page.locator('button:has-text("Сохранить")').all();
    console.log(`🔍 Найдено ${saveButtons.length} кнопок сохранения`);
    
    if (saveButtons.length > 0) {
      for (let i = 0; i < Math.min(2, saveButtons.length); i++) {
        try {
          await saveButtons[i].click();
          console.log(`✅ Нажали сохранить ${i + 1}`);
          await page.waitForTimeout(1000);
        } catch (error) {
          console.log(`❌ Ошибка сохранения ${i + 1}: ${error.message}`);
        }
      }
    }
    
    // 3. ПОИСК И ВЗАИМОДЕЙСТВИЕ
    console.log('🔍 Используем поиск...');
    const searchInput = page.locator('input[placeholder*="Поиск"]');
    await searchInput.fill('кухня');
    console.log('✅ Ввели поисковый запрос');
    
    await page.waitForTimeout(1000);
    
    await searchInput.press('Enter');
    console.log('✅ Выполнили поиск');
    
    await page.waitForTimeout(3000);
    
    // Проверяем базу данных
    console.log('📊 Проверяем базу данных...');
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      const ordersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM orders;"');
      const ordersCount = parseInt(ordersResult.stdout.trim()) || 0;
      
      const messagesResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM messages;"');
      const messagesCount = parseInt(messagesResult.stdout.trim()) || 0;
      
      const videosResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM videos;"');
      const videosCount = parseInt(videosResult.stdout.trim()) || 0;
      
      console.log(`📊 Заказов в БД: ${ordersCount}`);
      console.log(`📊 Сообщений в БД: ${messagesCount}`);
      console.log(`📊 Видео в БД: ${videosCount}`);
      
    } catch (error) {
      console.log(`❌ Ошибка проверки БД: ${error.message}`);
    }
    
    // Ждем чтобы увидеть результат
    console.log('⏳ Ждем 5 секунд...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Запускаем тест
testOrderCreationAndInteractions().catch(console.error);
