package queue

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

// ProcessingQueue очередь обработки видео
type ProcessingQueue struct {
	redis *redis.Client
	name  string
}

// NewProcessingQueue создает новую очередь
func NewProcessingQueue(redis *redis.Client, name string) *ProcessingQueue {
	return &ProcessingQueue{
		redis: redis,
		name:  name,
	}
}

// PushJob добавляет задачу в очередь
func (q *ProcessingQueue) PushJob(ctx context.Context, jobData string) error {
	return q.redis.LPush(ctx, q.name, jobData).Err()
}

// PopJob получает задачу из очереди
func (q *ProcessingQueue) PopJob(ctx context.Context, timeout time.Duration) (string, error) {
	result := q.redis.BRPop(ctx, timeout, q.name)
	if result.Err() != nil {
		return "", result.Err()
	}
	
	values := result.Val()
	if len(values) < 2 {
		return "", nil
	}
	
	return values[1], nil
}

// GetQueueLength получает длину очереди
func (q *ProcessingQueue) GetQueueLength(ctx context.Context) (int64, error) {
	return q.redis.LLen(ctx, q.name).Result()
}
