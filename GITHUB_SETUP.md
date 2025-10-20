# 🔧 Настройка GitHub и Git

## 1. Настройте Git конфигурацию

Прежде чем делать коммиты, настройте вашу идентификацию:

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "your-email@example.com"
```

Или только для этого проекта (без --global):

```bash
cd /path/to/mebelplace
git config user.name "Ваше Имя"
git config user.email "your-email@example.com"
```

## 2. Создайте первый коммит

```bash
git add .
git commit -m "Initial commit: MebelPlace MVP with auto-deployment"
```

## 3. Создайте репозиторий на GitHub

### Вариант A: Через веб-интерфейс

1. Перейдите на [github.com](https://github.com)
2. Нажмите "+" → "New repository"
3. Заполните:
   - **Repository name**: `mebelplace` (или другое имя)
   - **Description**: "MebelPlace MVP - платформа для мебельных мастеров"
   - **Visibility**: Private или Public
   - **НЕ СТАВЬТЕ** галочки на README, .gitignore, license (они уже есть)
4. Нажмите "Create repository"

### Вариант B: Через GitHub CLI

```bash
# Установите GitHub CLI (если еще нет)
# https://cli.github.com/

# Авторизуйтесь
gh auth login

# Создайте репозиторий
gh repo create mebelplace --private --source=. --remote=origin
```

## 4. Подключите remote и запушьте

### Если использовали Вариант A (веб):

```bash
# Добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/mebelplace.git

# Или если используете SSH:
git remote add origin git@github.com:YOUR_USERNAME/mebelplace.git

# Запушьте код
git branch -M main
git push -u origin main
```

### Если использовали Вариант B (CLI):

```bash
# Remote уже настроен, просто запушьте
git push -u origin main
```

## 5. Настройте GitHub Secrets для автодеплоя

1. Перейдите в ваш репозиторий на GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **"New repository secret"**
4. Добавьте следующие секреты:

### VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: IP адрес вашего VPS (например: `123.45.67.89`)

### VPS_USERNAME
- **Name**: `VPS_USERNAME`
- **Value**: Пользователь для SSH (например: `root` или `www-data`)

### VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value**: Ваш приватный SSH ключ

**Как получить SSH ключ:**

```bash
# На вашем компьютере или VPS
ssh-keygen -t rsa -b 4096 -C "github-actions@mebelplace"

# Нажмите Enter для сохранения в ~/.ssh/id_rsa
# Можете не указывать passphrase

# Скопируйте публичный ключ на VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_VPS_IP

# Скопируйте приватный ключ (для GitHub Secret)
cat ~/.ssh/id_rsa
# Скопируйте ВСЁ содержимое (включая -----BEGIN ... KEY-----)
```

### VPS_PORT
- **Name**: `VPS_PORT`
- **Value**: SSH порт (обычно `22`)

## 6. Проверьте автоматический деплой

После настройки секретов:

```bash
# Сделайте любое изменение
echo "# Test deployment" >> README.md

# Закоммитьте и запушьте
git add README.md
git commit -m "Test auto-deployment"
git push origin main
```

Затем:
1. Перейдите на GitHub → **Actions**
2. Вы должны увидеть запущенный workflow "Deploy to VPS"
3. Дождитесь завершения (зеленая галочка ✅)
4. Проверьте сайт: https://mebelplace.com.kz

## 7. Настройка SSH на VPS (если нужно)

Если GitHub Actions не может подключиться к VPS:

```bash
# На VPS
nano /etc/ssh/sshd_config
```

Убедитесь что:
```
PubkeyAuthentication yes
PasswordAuthentication no  # (для безопасности)
PermitRootLogin yes        # (или prohibit-password)
```

Перезапустите SSH:
```bash
systemctl restart sshd
```

## 8. Проверка деплоя на VPS

После успешного деплоя проверьте на VPS:

```bash
ssh root@YOUR_VPS_IP

# Проверьте что код обновился
cd /var/www/mebelplace
git log -1

# Проверьте PM2
pm2 status

# Проверьте логи
pm2 logs mebelplace-api --lines 50
```

## 🎉 Готово!

Теперь при каждом push в ветку `main` проект будет автоматически деплоиться на VPS!

## Полезные команды

### Просмотр истории коммитов
```bash
git log --oneline
```

### Создание новой ветки
```bash
git checkout -b feature/new-feature
```

### Слияние изменений
```bash
git checkout main
git merge feature/new-feature
```

### Откат изменений
```bash
# Отменить последний коммит (сохранив изменения)
git reset --soft HEAD~1

# Отменить изменения в файле
git checkout -- file.js
```

### Просмотр статуса
```bash
git status
```

### Просмотр изменений
```bash
git diff
```

## Troubleshooting

### Проблема: "Permission denied (publickey)"

**Решение:**
```bash
# Проверьте что ключ добавлен на VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_VPS_IP

# Проверьте подключение
ssh -i ~/.ssh/id_rsa root@YOUR_VPS_IP
```

### Проблема: Workflow не запускается

**Решение:**
1. Проверьте что файл `.github/workflows/deploy.yml` существует
2. Проверьте что вы пушите в ветку `main` (не `master`)
3. Проверьте GitHub Actions → Settings → Actions → General → Allow all actions

### Проблема: Деплой падает с ошибкой

**Решение:**
1. Проверьте логи в GitHub Actions
2. Проверьте что все Secrets настроены правильно
3. Проверьте SSH доступ к VPS
4. Проверьте что `/var/www/mebelplace` существует на VPS

---

**Следующий шаг**: См. [DEPLOYMENT.md](DEPLOYMENT.md) для полной инструкции по деплою на VPS.

