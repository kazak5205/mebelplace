# ✅ Git репозиторий создан!

## 🎉 Что уже сделано:

✅ Git репозиторий инициализирован  
✅ Все файлы закоммичены  
✅ Код отправлен на GitHub: **https://github.com/kazak5205/mebelplace**  
✅ GitHub Actions workflows настроены  
✅ Deployment скрипты созданы  
✅ Документация подготовлена  

---

## 🔧 Что нужно сделать для автоматического деплоя:

### 1. Настройте GitHub Secrets (5 минут)

Перейдите на:
**https://github.com/kazak5205/mebelplace/settings/secrets/actions**

Нажмите **"New repository secret"** и добавьте 4 секрета:

#### VPS_HOST
```
Name: VPS_HOST
Secret: [IP адрес вашего VPS, например: 123.45.67.89]
```

#### VPS_USERNAME
```
Name: VPS_USERNAME
Secret: root
```
(или другой пользователь, если используете не root)

#### VPS_SSH_KEY
```
Name: VPS_SSH_KEY
Secret: [Ваш приватный SSH ключ]
```

**Как получить SSH ключ:**
```bash
# На вашем компьютере или VPS
ssh-keygen -t rsa -b 4096 -C "github-actions@mebelplace"

# Скопируйте публичный ключ на VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_VPS_IP

# Скопируйте приватный ключ (для GitHub Secret)
cat ~/.ssh/id_rsa
# Скопируйте ВСЁ содержимое включая:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...весь ключ...
# -----END OPENSSH PRIVATE KEY-----
```

#### VPS_PORT
```
Name: VPS_PORT
Secret: 22
```
(стандартный SSH порт)

---

### 2. Настройте VPS сервер (10 минут)

Подключитесь к VPS:
```bash
ssh root@YOUR_VPS_IP
```

Запустите скрипт установки:
```bash
curl -o setup-vps.sh https://raw.githubusercontent.com/kazak5205/mebelplace/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

Скрипт установит:
- Node.js 18.x
- PM2
- Nginx
- MySQL
- FFmpeg
- И другие необходимые пакеты

---

### 3. Клонируйте проект на VPS

```bash
cd /var/www
git clone https://github.com/kazak5205/mebelplace.git
cd mebelplace
```

---

### 4. Настройте базу данных

```bash
mysql -u root -p
```

```sql
CREATE DATABASE mebelplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mebelplace'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON mebelplace.* TO 'mebelplace'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 5. Настройте переменные окружения

```bash
cd /var/www/mebelplace/server
cp env.example .env
nano .env
```

Заполните необходимые параметры:
```env
# Database
DB_HOST=localhost
DB_USER=mebelplace
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=mebelplace

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=GENERATE_RANDOM_STRING_HERE

# Domain
DOMAIN=mebelplace.com.kz
```

---

### 6. Установите SSL сертификаты

```bash
cd /var/www/mebelplace
chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh
```

---

### 7. Настройте Nginx

```bash
sudo cp docker/nginx/nginx.conf /etc/nginx/sites-available/mebelplace
sudo ln -s /etc/nginx/sites-available/mebelplace /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

---

### 8. Запустите первый деплой

```bash
cd /var/www/mebelplace
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🚀 Тестирование автоматического деплоя

После настройки всех секретов, проверьте автодеплой:

```bash
# На вашем компьютере
cd C:\Users\admin\Desktop\mvp

# Сделайте тестовое изменение
echo "# Test auto-deploy" >> README.md

# Закоммитьте и запушьте
git add README.md
git commit -m "Test: Auto-deployment"
git push origin main
```

Затем:
1. Откройте https://github.com/kazak5205/mebelplace/actions
2. Вы увидите запущенный workflow "Deploy to VPS"
3. Дождитесь завершения (зеленая галочка ✅)
4. Проверьте сайт: https://mebelplace.com.kz

---

## 📊 Полезные ссылки

- **Репозиторий**: https://github.com/kazak5205/mebelplace
- **GitHub Actions**: https://github.com/kazak5205/mebelplace/actions
- **Settings/Secrets**: https://github.com/kazak5205/mebelplace/settings/secrets/actions

---

## 📚 Документация

- **Быстрый старт**: [QUICK_START.md](QUICK_START.md)
- **Полная инструкция по деплою**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Настройка GitHub**: [GITHUB_SETUP.md](GITHUB_SETUP.md)
- **Основной README**: [README.md](README.md)

---

## 🔍 Мониторинг

После деплоя проверьте на VPS:

```bash
ssh root@YOUR_VPS_IP

# Статус PM2
pm2 status

# Логи приложения
pm2 logs mebelplace-api

# Статус Nginx
sudo systemctl status nginx

# Проверьте сайт
curl https://mebelplace.com.kz/api/health
```

---

## 🎯 Следующие шаги

1. ✅ Настройте GitHub Secrets (описано выше)
2. ✅ Настройте VPS сервер (описано выше)
3. ✅ Протестируйте автоматический деплой
4. ✅ Настройте мониторинг
5. ✅ Добавьте SSL сертификаты
6. ✅ Настройте бэкапы

---

**Готово! Теперь каждый push в ветку main автоматически деплоится на VPS!** 🚀

