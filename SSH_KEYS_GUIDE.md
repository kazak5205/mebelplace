# 🔐 SSH Keys Setup Guide для Auto-Deploy

## У вас уже есть SSH ключ!

**Публичный ключ сохранен в**: `github-actions.pub`

---

## 📋 Шаги по настройке:

### 1. Добавьте публичный ключ на VPS сервер

#### Вариант A - Автоматически (рекомендуется):

```bash
# Подключитесь к VPS
ssh root@YOUR_VPS_IP

# Скачайте и запустите скрипт
curl -o setup-ssh.sh https://raw.githubusercontent.com/kazak5205/mebelplace/main/setup-ssh-keys.sh
chmod +x setup-ssh.sh
./setup-ssh.sh
```

#### Вариант B - Вручную:

```bash
# Подключитесь к VPS
ssh root@YOUR_VPS_IP

# Добавьте публичный ключ
mkdir -p ~/.ssh
chmod 700 ~/.ssh

echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDFLu25P+GrWMMYSOM5iec3jTfJ1x4zQhrcl7ml+8k6uC1vpCubiK5LI9zqqi+b+3aIR8MoE7m9uN6i6zOTsvYxcZ4iPoHFCau81JRRyZpfLMebn75L+L22TpAd2pobm2i77NChB/kccNZT/Ic4oN+Bc9xbsrX+So1Ym2HZ0E5C8gZbzXxBQggN25SAQvkciyIAowEgCIrcSl5XGm5CTRUQFb3DVqhoJ/BV65eZ3JIJTkvqGKL5MpKFNddBh5kPPoYhO8ZNUMcbJuwrI5+U1xRhDjAcp7ksEZ6oYLHJaxudENZGN7HOs7k9b/BFFtGuXqrvVO0e3qDz1NfCl1DzqKMC0/42Z29klP6eK/Dcba+CLKT7ZD8/7COrMQSJ/4bb25wTfBjYd7hSVc36CPpvdoRK8ZrcVViQfEooAnc1cz3egtsdMBjnG7swtG6PSzv0SNNCD4aBsb9EHIEw4qKnz1dOlAu4yFVBypLua4XZsArcG37JhZPKTU01jEZkhlolhjW7fLQ35d5YCqJB7C98cXb0/JP12DO8Wlvf7WZ57HNCdOnMmV+9AT481dTHVe0LJ2K/5n4L78d/dQ5zEVDc/FKBp0ge8sDOMuO0+TEsKrntGZNcBsqwpoVklzvRoPR2JI4ntMhfwEw3mumVmtpPQ4YWW33SIIT/JrAHWvIKhFDAXQ== mebelplace-auto-deploy@github-actions" >> ~/.ssh/authorized_keys

chmod 600 ~/.ssh/authorized_keys
```

---

### 2. Добавьте ПРИВАТНЫЙ ключ в GitHub Secrets

⚠️ **ВАЖНО**: Вам нужен **приватный** ключ (не публичный!)

#### Где найти приватный ключ:

Приватный ключ находится в паре с публичным ключом, который вы предоставили. Обычно это файл без расширения `.pub`.

Если у вас есть приватный ключ в файле (например, `id_rsa` или `mebelplace-key`):

```bash
# Скопируйте содержимое приватного ключа
cat path/to/private/key

# Или если ключ на Windows:
type path\to\private\key
```

#### Добавьте в GitHub:

1. Перейдите: **https://github.com/kazak5205/mebelplace/settings/secrets/actions**
2. Нажмите **"New repository secret"**
3. Name: `VPS_SSH_KEY`
4. Secret: Вставьте **полное содержимое приватного ключа**, включая:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   ... весь ключ ...
   -----END OPENSSH PRIVATE KEY-----
   ```
   или
   ```
   -----BEGIN RSA PRIVATE KEY-----
   ... весь ключ ...
   -----END RSA PRIVATE KEY-----
   ```

---

### 3. Добавьте остальные GitHub Secrets

Перейдите: **https://github.com/kazak5205/mebelplace/settings/secrets/actions**

Добавьте еще 3 секрета:

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
(или другой пользователь, для которого вы добавили публичный ключ)

#### VPS_PORT
```
Name: VPS_PORT
Secret: 22
```

---

### 4. Протестируйте SSH подключение

На вашем компьютере (если у вас есть приватный ключ локально):

```bash
# Тест подключения
ssh -i path/to/private/key root@YOUR_VPS_IP

# Если работает, значит ключи настроены правильно!
```

---

### 5. Протестируйте автоматический деплой

```bash
# На вашем компьютере
cd C:\Users\admin\Desktop\mvp

# Сделайте тестовое изменение
echo "# Test SSH auto-deploy" >> README.md

# Закоммитьте и запушьте
git add .
git commit -m "test: SSH auto-deploy"
git push origin main
```

Проверьте: **https://github.com/kazak5205/mebelplace/actions**

---

## ❓ Если у вас НЕТ приватного ключа

Если вы потеряли приватный ключ или у вас только публичный, вам нужно создать новую пару ключей:

```bash
# Создайте новую пару ключей
ssh-keygen -t rsa -b 4096 -C "mebelplace-deploy@github"

# Сохраните в: C:\Users\admin\.ssh\mebelplace_key
# (или другое место)

# Скопируйте публичный ключ на VPS
type C:\Users\admin\.ssh\mebelplace_key.pub | ssh root@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"

# Скопируйте приватный ключ для GitHub Secret
type C:\Users\admin\.ssh\mebelplace_key
```

---

## 🔍 Проверка настроек

### На VPS:

```bash
# Проверьте authorized_keys
cat ~/.ssh/authorized_keys

# Должен быть ваш публичный ключ
```

### На GitHub:

1. Откройте: https://github.com/kazak5205/mebelplace/settings/secrets/actions
2. Должны быть 4 секрета:
   - ✅ VPS_HOST
   - ✅ VPS_USERNAME
   - ✅ VPS_SSH_KEY
   - ✅ VPS_PORT

---

## 🎯 Итоговый чеклист

- [ ] Публичный ключ добавлен на VPS в `~/.ssh/authorized_keys`
- [ ] Приватный ключ добавлен в GitHub Secret `VPS_SSH_KEY`
- [ ] GitHub Secret `VPS_HOST` настроен (IP адрес)
- [ ] GitHub Secret `VPS_USERNAME` настроен (root)
- [ ] GitHub Secret `VPS_PORT` настроен (22)
- [ ] SSH подключение протестировано
- [ ] VPS сервер настроен (Node.js, PM2, Nginx, MySQL)
- [ ] Проект склонирован на VPS в `/var/www/mebelplace`
- [ ] Переменные окружения настроены в `server/.env`
- [ ] Первый деплой выполнен успешно
- [ ] Автоматический деплой протестирован

---

**После выполнения всех шагов ваш автоматический деплой будет работать!** 🚀

