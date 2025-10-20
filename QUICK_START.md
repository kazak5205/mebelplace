# ⚡ Quick Start - Автоматический деплой за 10 минут

## 1️⃣ Настройте Git (1 минута)

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "your-email@example.com"
```

## 2️⃣ Сделайте первый коммит (1 минута)

```bash
git add .
git commit -m "Initial commit: MebelPlace MVP"
```

## 3️⃣ Создайте GitHub репозиторий (2 минуты)

**Вариант A - Веб интерфейс:**
1. Откройте https://github.com/new
2. Название: `mebelplace`
3. Private/Public - на ваш выбор
4. Нажмите "Create repository"

**Вариант B - Командная строка:**
```bash
gh auth login
gh repo create mebelplace --private --source=. --remote=origin
```

## 4️⃣ Запушьте код (1 минута)

```bash
git remote add origin https://github.com/YOUR_USERNAME/mebelplace.git
git branch -M main
git push -u origin main
```

## 5️⃣ Настройте VPS (3 минуты)

```bash
# Подключитесь к VPS
ssh root@YOUR_VPS_IP

# Запустите установку
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/mebelplace/main/scripts/setup-vps.sh
chmod +x setup.sh
./setup.sh

# Клонируйте проект
cd /var/www
git clone https://github.com/YOUR_USERNAME/mebelplace.git
cd mebelplace
```

## 6️⃣ Настройте переменные окружения (1 минута)

```bash
cd server
cp env.example .env
nano .env
```

Минимально необходимые настройки:
```env
DB_HOST=localhost
DB_USER=mebelplace
DB_PASSWORD=your_strong_password
DB_NAME=mebelplace
JWT_SECRET=generate_random_string_here
PORT=3000
NODE_ENV=production
```

## 7️⃣ Настройте GitHub Secrets (2 минуты)

1. GitHub → Settings → Secrets → Actions → New secret
2. Добавьте 4 секрета:

```
VPS_HOST = 123.45.67.89
VPS_USERNAME = root
VPS_SSH_KEY = (ваш приватный SSH ключ)
VPS_PORT = 22
```

**Получение SSH ключа:**
```bash
ssh-keygen -t rsa -b 4096
cat ~/.ssh/id_rsa  # Скопируйте всё содержимое
```

## 8️⃣ Тестовый деплой (30 секунд)

```bash
# На вашем компьютере
echo "# Auto-deploy test" >> README.md
git add .
git commit -m "Test auto-deployment"
git push origin main
```

Проверьте: GitHub → Actions → Смотрите процесс деплоя

## ✅ Готово!

Теперь каждый `git push` автоматически деплоит на VPS!

**Проверьте результат:**
- https://mebelplace.com.kz
- https://mebelplace.com.kz/api/health

---

## 📚 Дополнительно

- [Полная инструкция по GitHub](GITHUB_SETUP.md)
- [Полная инструкция по деплою](DEPLOYMENT.md)
- [Основной README](README.md)

