package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-redis/redis/v8"
	"mebelplace-ffmpeg-worker/internal/processor"
	"mebelplace-ffmpeg-worker/internal/queue"
)

func main() {
	log.Println("🎬 Starting MebelPlace FFmpeg Worker...")
	
	// Подключаемся к Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_ADDR", "redis:6379"),
		Password: getEnv("REDIS_PASSWORD", "redis_password_123"),
		DB:       0,
	})
	
	ctx := context.Background()
	
	// Проверяем подключение к Redis
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("✅ Connected to Redis")
	
	// Создаем процессор видео
	videoProcessor := processor.NewVideoProcessor(
		getEnv("SEGMENTS_DIR", "/var/www/segments"),
		10, // segment duration
	)
	
	// Проверяем FFmpeg
	err = videoProcessor.ValidateFFmpeg()
	if err != nil {
		log.Fatalf("FFmpeg validation failed: %v", err)
	}
	log.Println("✅ FFmpeg is available")
	
	// Создаем очередь обработки
	processingQueue := queue.NewProcessingQueue(rdb, "video_processing_queue")
	
	// Запускаем воркер
	worker := &Worker{
		processor: videoProcessor,
		queue:     processingQueue,
		redis:     rdb,
	}
	
	// Обработка сигналов для graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
	// Запускаем воркер в горутине
	go worker.Start(ctx)
	
	log.Println("🚀 FFmpeg Worker started, waiting for jobs...")
	
	// Ждем сигнал завершения
	<-sigChan
	log.Println("🛑 Shutting down FFmpeg Worker...")
	
	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	worker.Stop(ctx)
	log.Println("✅ FFmpeg Worker stopped")
}

type Worker struct {
	processor *processor.VideoProcessor
	queue     *queue.ProcessingQueue
	redis     *redis.Client
	stopChan  chan struct{}
}

func (w *Worker) Start(ctx context.Context) {
	w.stopChan = make(chan struct{})
	
	for {
		select {
		case <-w.stopChan:
			return
		case <-ctx.Done():
			return
		default:
			// Получаем задачу из очереди
			jobData, err := w.queue.PopJob(ctx, 5*time.Second)
			if err != nil {
				if err != redis.Nil {
					log.Printf("Error getting job from queue: %v", err)
				}
				continue
			}
			
			// Обрабатываем задачу
			w.processJob(ctx, jobData)
		}
	}
}

func (w *Worker) Stop(ctx context.Context) {
	close(w.stopChan)
}

func (w *Worker) processJob(ctx context.Context, jobData string) {
	log.Printf("📹 Processing video job: %s", jobData)
	
	var job processor.ProcessingJob
	err := json.Unmarshal([]byte(jobData), &job)
	if err != nil {
		log.Printf("❌ Failed to unmarshal job: %v", err)
		return
	}
	
	// Обрабатываем видео
	result, err := w.processor.ProcessVideo(ctx, &job)
	if err != nil {
		log.Printf("❌ Video processing failed: %v", err)
		result.Success = false
		result.Error = err.Error()
	} else {
		log.Printf("✅ Video processed successfully: %s", job.VideoID)
	}
	
	// Сохраняем результат
	resultData, _ := json.Marshal(result)
	w.redis.Set(ctx, fmt.Sprintf("processing_result:%s", job.VideoID), resultData, time.Hour)
	
	// Логируем результат
	log.Printf("📊 Processing result: VideoID=%s, Success=%t", result.VideoID, result.Success)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
