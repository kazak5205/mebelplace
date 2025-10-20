# MebelPlace - Руководство по Деплою

## 📋 Оглавление

1. [Требования](#требования)
2. [Подготовка VPS](#подготовка-vps)
3. [Настройка GitHub](#настройка-github)
4. [Первичная настройка проекта](#первичная-настройка-проекта)
5. [Автоматический деплой](#автоматический-деплой)
6. [Ручной деплой](#ручной-деплой)
7. [Мониторинг и обслуживание](#мониторинг-и-обслуживание)

---

## 🖥️ Требования

### VPS сервер:
- Ubuntu 20.04+ / Debian 11+
- Минимум 2GB RAM
- 20GB+ свободного места
- Root доступ

### Домен:
- `mebelplace.com.kz` направлен на IP вашего VPS
- A-запись: `mebelplace.com.kz` → IP VPS
- A-запись: `www.mebelplace.com.kz` → IP VPS

---

## 🚀 Подготовка VPS

### 1. Подключитесь к VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2. Запустите скрипт начальной настройки
```bash
# Загрузите скрипт
curl -o setup-vps.sh https://raw.githubusercontent.com/YOUR_USERNAME/mebelplace/main/scripts/setup-vps.sh

# Сделайте его исполняемым
chmod +x setup-vps.sh

# Запустите
./setup-vps.sh
```

### 3. Настройте MySQL
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

### 4. Клонируйте репозиторий
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/mebelplace.git
cd mebelplace
```

### 5. Настройте переменные окружения
```bash
cd server
cp env.example .env
nano .env
```

Заполните все необходимые переменные:
```env
# Database
DB_HOST=localhost
DB_USER=mebelplace
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=mebelplace

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=GENERATE_STRONG_SECRET_HERE

# SMS (Kaspi SMS)
SMS_API_KEY=your_kaspi_sms_api_key
SMS_SENDER=MebelPlace

# File Upload
MAX_FILE_SIZE=100000000
UPLOAD_DIR=/var/www/mebelplace/server/uploads
```

### 6. Установите SSL сертификаты
```bash
cd /var/www/mebelplace
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh
```

### 7. Настройте Nginx
```bash
cp docker/nginx/nginx.conf /etc/nginx/sites-available/mebelplace
ln -s /etc/nginx/sites-available/mebelplace /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t

# Перезапустите Nginx
systemctl restart nginx
```

### 8. Запустите первый деплой
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🔧 Настройка GitHub

### 1. Создайте GitHub репозиторий
```bash
# На вашем локальном компьютере
cd /path/to/mebelplace

# Инициализируйте Git (если еще не сделано)
git init

# Добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/mebelplace.git

# Добавьте файлы
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Настройте GitHub Secrets

Перейдите в `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Добавьте следующие секреты:

| Имя секрета | Описание | Пример |
|-------------|----------|--------|
| `VPS_HOST` | IP адрес VPS | `123.45.67.89` |
| `VPS_USERNAME` | Пользователь для SSH | `root` или `www-data` |
| `VPS_SSH_KEY` | Приватный SSH ключ | Содержимое `~/.ssh/id_rsa` |
| `VPS_PORT` | SSH порт | `22` |

### 3. Создайте SSH ключ для GitHub Actions

На VPS:
```bash
# Создайте SSH ключ
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Добавьте публичный ключ в authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Скопируйте приватный ключ
cat ~/.ssh/id_rsa
```

Скопируйте весь вывод (включая `-----BEGIN ... KEY-----`) и добавьте в GitHub Secret `VPS_SSH_KEY`.

---

## 🔄 Автоматический деплой

После настройки GitHub Actions, каждый push в ветку `main` автоматически запустит деплой:

```bash
# На вашем локальном компьютере
git add .
git commit -m "Update feature X"
git push origin main
```

GitHub Actions автоматически:
1. ✅ Проверит код
2. ✅ Установит зависимости
3. ✅ Соберет клиент
4. ✅ Подключится к VPS
5. ✅ Выполнит `git pull`
6. ✅ Запустит deployment скрипт
7. ✅ Перезапустит сервисы

### Просмотр статуса деплоя
- Перейдите на GitHub в раздел `Actions`
- Выберите последний workflow run
- Просмотрите логи

---

## 🛠️ Ручной деплой

Если нужно задеплоить вручную:

```bash
# Подключитесь к VPS
ssh root@YOUR_VPS_IP

# Перейдите в директорию проекта
cd /var/www/mebelplace

# Запустите деплой
./scripts/deploy.sh
```

---

## 📊 Мониторинг и обслуживание

### Проверка статуса сервисов

```bash
# Статус PM2
pm2 status

# Логи PM2
pm2 logs

# Статус Nginx
systemctl status nginx

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Полезные команды PM2

```bash
# Перезапуск приложения
pm2 restart mebelplace-api

# Остановка
pm2 stop mebelplace-api

# Просмотр логов
pm2 logs mebelplace-api

# Мониторинг в реальном времени
pm2 monit

# Очистка логов
pm2 flush
```

### Обновление SSL сертификатов

Certbot автоматически обновляет сертификаты. Проверка:
```bash
certbot renew --dry-run
```

### Бэкапы

Скрипт деплоя автоматически создает бэкапы `.env` файлов в `/var/backups/mebelplace/`

Ручной бэкап базы данных:
```bash
mysqldump -u mebelplace -p mebelplace > /var/backups/mebelplace/db_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа

```bash
# Восстановление БД
mysql -u mebelplace -p mebelplace < /var/backups/mebelplace/db_TIMESTAMP.sql

# Восстановление .env
cp /var/backups/mebelplace/.env.TIMESTAMP /var/www/mebelplace/server/.env
```

---

## 🔍 Решение проблем

### Проблема: Деплой не запускается автоматически

**Решение:**
1. Проверьте GitHub Secrets
2. Убедитесь, что workflow файл в `.github/workflows/deploy.yml`
3. Проверьте логи в GitHub Actions

### Проблема: SSH подключение не работает

**Решение:**
```bash
# На VPS проверьте SSH настройки
nano /etc/ssh/sshd_config
# Убедитесь что PubkeyAuthentication yes

# Перезапустите SSH
systemctl restart sshd
```

### Проблема: PM2 не запускает приложение

**Решение:**
```bash
# Проверьте логи
pm2 logs --err

# Удалите и создайте заново
pm2 delete mebelplace-api
pm2 start ecosystem.config.js
pm2 save
```

### Проблема: Nginx 502 Bad Gateway

**Решение:**
```bash
# Проверьте что сервер запущен
pm2 status

# Проверьте порт в ecosystem.config.js (должен совпадать с nginx.conf)
nano server/ecosystem.config.js
nano /etc/nginx/sites-available/mebelplace

# Перезапустите сервисы
pm2 restart all
systemctl restart nginx
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs`
2. Проверьте статус: `pm2 status`
3. Проверьте Nginx: `nginx -t`
4. Проверьте доступ к сайту: `https://mebelplace.com.kz`

---

## ✅ Чеклист успешного деплоя

- [ ] VPS настроен и доступен
- [ ] Домен направлен на VPS IP
- [ ] MySQL установлен и настроен
- [ ] SSL сертификаты установлены
- [ ] Nginx настроен и запущен
- [ ] GitHub репозиторий создан
- [ ] GitHub Secrets настроены
- [ ] Первый деплой выполнен успешно
- [ ] Сайт доступен по https://mebelplace.com.kz
- [ ] PM2 запущен и сохранен
- [ ] Автоматический деплой работает

Готово! 🎉

