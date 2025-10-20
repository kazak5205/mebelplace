# ✅ Автоматический деплой настроен!

## 🎉 Что готово:

✅ **Git репозиторий**: https://github.com/kazak5205/mebelplace  
✅ **GitHub Actions workflows** настроены  
✅ **Deployment скрипты** созданы  
✅ **SSH ключ** для автоматического деплоя подготовлен  
✅ **Полная документация** написана  

---

## 🔑 SSH Ключ для Auto-Deploy

### Публичный ключ сохранен в файле: `github-actions.pub`

**Что нужно сделать прямо сейчас:**

### 1️⃣ Добавьте публичный ключ на VPS (2 минуты)

```bash
# Подключитесь к VPS
ssh root@YOUR_VPS_IP

# Запустите автоматическую установку
curl -o setup-ssh.sh https://raw.githubusercontent.com/kazak5205/mebelplace/main/setup-ssh-keys.sh
chmod +x setup-ssh.sh
./setup-ssh.sh
```

### 2️⃣ Настройте GitHub Secrets (3 минуты)

Перейдите: **https://github.com/kazak5205/mebelplace/settings/secrets/actions**

Добавьте 4 секрета:

| Секрет | Значение |
|--------|----------|
| `VPS_HOST` | IP адрес вашего VPS (например: 123.45.67.89) |
| `VPS_USERNAME` | `root` (или другой пользователь) |
| `VPS_SSH_KEY` | **Приватный SSH ключ** (полностью, с BEGIN/END) |
| `VPS_PORT` | `22` |

⚠️ **ВАЖНО**: Вам нужен **ПРИВАТНЫЙ** ключ (пара к публичному)!

Если у вас его нет, см. инструкцию в `SSH_KEYS_GUIDE.md`

### 3️⃣ Настройте VPS сервер (10 минут)

```bash
# На VPS
ssh root@YOUR_VPS_IP

# Установите все необходимое
curl -o setup-vps.sh https://raw.githubusercontent.com/kazak5205/mebelplace/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh

# Клонируйте проект
cd /var/www
git clone https://github.com/kazak5205/mebelplace.git
cd mebelplace

# Настройте окружение
cd server
cp env.example .env
nano .env
# Заполните все необходимые параметры (DB, JWT_SECRET и т.д.)

# Запустите первый деплой
cd /var/www/mebelplace
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 4️⃣ Протестируйте автодеплой (1 минута)

```bash
# На вашем компьютере
cd C:\Users\admin\Desktop\mvp

# Сделайте тестовое изменение
echo "# Auto-deploy test" >> README.md

# Закоммитьте и запушьте
git add .
git commit -m "test: auto-deploy"
git push origin main
```

Проверьте: https://github.com/kazak5205/mebelplace/actions

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| **SSH_KEYS_GUIDE.md** | 🔐 Подробное руководство по SSH ключам |
| **NEXT_STEPS.md** | 🚀 Следующие шаги для настройки |
| **DEPLOYMENT.md** | 📖 Полная инструкция по деплою |
| **GITHUB_SETUP.md** | 🔧 Настройка GitHub репозитория |
| **QUICK_START.md** | ⚡ Быстрый старт за 10 минут |
| **README.md** | 📋 Основная документация проекта |

---

## 🔍 Структура проекта

```
mebelplace/
├── .github/workflows/
│   ├── deploy.yml         # ← Автоматический деплой
│   └── ci.yml            # ← CI проверки
├── scripts/
│   ├── deploy.sh         # ← Основной скрипт деплоя
│   ├── setup-vps.sh      # ← Установка VPS
│   └── setup-ssl.sh      # ← Установка SSL
├── setup-ssh-keys.sh     # ← Установка SSH ключей
├── github-actions.pub    # ← Публичный SSH ключ
└── server/
    └── .env             # ← Настройте переменные окружения
```

---

## 🎯 Чек-лист финальной настройки

### На VPS:
- [ ] Node.js, PM2, Nginx, MySQL установлены
- [ ] Публичный SSH ключ добавлен в `~/.ssh/authorized_keys`
- [ ] Проект склонирован в `/var/www/mebelplace`
- [ ] База данных создана
- [ ] Файл `server/.env` настроен
- [ ] SSL сертификаты установлены (опционально)
- [ ] Nginx настроен
- [ ] Первый деплой выполнен успешно

### На GitHub:
- [ ] Репозиторий создан: https://github.com/kazak5205/mebelplace
- [ ] Secret `VPS_HOST` добавлен
- [ ] Secret `VPS_USERNAME` добавлен
- [ ] Secret `VPS_SSH_KEY` добавлен (приватный ключ!)
- [ ] Secret `VPS_PORT` добавлен

### Проверка:
- [ ] SSH подключение работает
- [ ] Сайт доступен: https://mebelplace.com.kz
- [ ] API работает: https://mebelplace.com.kz/api/health
- [ ] PM2 запущен: `pm2 status`
- [ ] Автодеплой протестирован через GitHub Actions

---

## 🚀 Как работает автодеплой

1. Вы делаете `git push origin main`
2. GitHub Actions запускает workflow
3. Собирается клиент и сервер
4. Подключается к VPS через SSH
5. Выполняет `git pull`
6. Запускает `scripts/deploy.sh`:
   - Устанавливает зависимости
   - Собирает клиент
   - Перезапускает PM2
   - Перезагружает Nginx
7. ✅ Деплой завершен!

---

## 📞 Помощь

### Проблемы с SSH:
- См. `SSH_KEYS_GUIDE.md`
- Проверьте права: `chmod 600 ~/.ssh/authorized_keys`
- Проверьте логи: `tail -f /var/log/auth.log`

### Проблемы с деплоем:
- См. логи GitHub Actions
- Проверьте PM2: `pm2 logs`
- Проверьте Nginx: `nginx -t`

### Проблемы с базой данных:
- Проверьте подключение: `mysql -u mebelplace -p`
- Проверьте `.env` файл

---

## 🎊 Готово!

**Теперь при каждом `git push` проект автоматически деплоится на VPS!**

Репозиторий: https://github.com/kazak5205/mebelplace  
Actions: https://github.com/kazak5205/mebelplace/actions

---

**Следующий шаг**: Откройте `SSH_KEYS_GUIDE.md` для настройки SSH ключей!

