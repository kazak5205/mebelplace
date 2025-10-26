const { chromium } = require('playwright');

// 🔍 ДИАГНОСТИКА СТРАНИЦЫ ПОДДЕРЖКИ
async function diagnoseSupportPage() {
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
    await page.waitForTimeout(3000);
    
    console.log('✅ Страница поддержки загружена');
    
    // Получаем HTML страницы
    const html = await page.content();
    console.log('📄 HTML страницы получен');
    
    // Ищем все кнопки
    const buttons = await page.locator('button').all();
    console.log(`🔘 Найдено ${buttons.length} кнопок:`);
    
    for (let i = 0; i < Math.min(10, buttons.length); i++) {
      try {
        const text = await buttons[i].textContent();
        const className = await buttons[i].getAttribute('class');
        console.log(`   Button ${i + 1}: text="${text}", class="${className}"`);
      } catch (error) {
        console.log(`   Button ${i + 1}: ошибка получения данных`);
      }
    }
    
    // Ищем все ссылки
    const links = await page.locator('a').all();
    console.log(`🔗 Найдено ${links.length} ссылок:`);
    
    for (let i = 0; i < Math.min(10, links.length); i++) {
      try {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        console.log(`   Link ${i + 1}: text="${text}", href="${href}"`);
      } catch (error) {
        console.log(`   Link ${i + 1}: ошибка получения данных`);
      }
    }
    
    // Ищем формы
    const forms = await page.locator('form').all();
    console.log(`📝 Найдено ${forms.length} форм:`);
    
    for (let i = 0; i < forms.length; i++) {
      try {
        const action = await forms[i].getAttribute('action');
        const method = await forms[i].getAttribute('method');
        console.log(`   Form ${i + 1}: action="${action}", method="${method}"`);
      } catch (error) {
        console.log(`   Form ${i + 1}: ошибка получения данных`);
      }
    }
    
    // Ищем поля ввода
    const inputs = await page.locator('input, textarea').all();
    console.log(`📝 Найдено ${inputs.length} полей ввода:`);
    
    for (let i = 0; i < Math.min(10, inputs.length); i++) {
      try {
        const type = await inputs[i].getAttribute('type');
        const name = await inputs[i].getAttribute('name');
        const placeholder = await inputs[i].getAttribute('placeholder');
        console.log(`   Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
      } catch (error) {
        console.log(`   Input ${i + 1}: ошибка получения данных`);
      }
    }
    
    // Проверяем заголовок страницы
    const title = await page.title();
    console.log(`📄 Заголовок страницы: "${title}"`);
    
    // Проверяем URL
    const url = page.url();
    console.log(`🌐 Текущий URL: "${url}"`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

diagnoseSupportPage().catch(console.error);
