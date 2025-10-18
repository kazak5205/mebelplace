FROM golang:1.24-alpine

# Устанавливаем FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Копируем Go модули
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение
RUN go build -o worker ./cmd/worker

# Создаем папки для работы
RUN mkdir -p /var/www/uploads /var/www/segments

CMD ["./worker"]
