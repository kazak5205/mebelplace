const Bull = require('bull');
const videoService = require('./videoService');
const redisClient = require('../config/redis');

// Создаём очередь для обработки видео
// Ограничение: максимум 2 параллельных задачи (чтобы не убить CPU)
const videoQueue = new Bull('video-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 100, // Храним последние 100 успешных задач
    removeOnFail: 200,     // Храним последние 200 проваленных задач
    attempts: 3,           // 3 попытки при ошибке
    backoff: {
      type: 'exponential',
      delay: 5000          // Задержка между попытками: 5с, 10с, 20с
    }
  }
});

// 🎯 Обработчик задач (максимум 2 параллельных процесса)
videoQueue.process(2, async (job) => {
  const { videoId, videoPath } = job.data;
  
  console.log(`[VIDEO QUEUE] 🚀 Processing video ${videoId} (Job ${job.id})`);
  
  try {
    // Mark as processing
    try {
      await require('../config/database').pool.query(
        "UPDATE videos SET processing_status = 'processing' WHERE id = $1",
        [videoId]
      );
    } catch (e) {
      console.warn('[VIDEO QUEUE] Failed to set processing_status=processing:', e.message);
    }

    // 1. Сжатие и оптимизация (самая тяжёлая операция)
    await job.progress(10);
    console.log(`[VIDEO QUEUE] Step 1/3: Compressing video ${videoId}...`);
    await videoService.compressAndOptimizeVideo(videoPath);
    await job.progress(60);
    console.log(`[VIDEO QUEUE] ✅ Compression completed for ${videoId}`);
    
    // 2. Генерация превью
    await job.progress(70);
    console.log(`[VIDEO QUEUE] Step 2/3: Generating thumbnail for ${videoId}...`);
    await videoService.generateThumbnail(videoPath, videoId);
    await job.progress(85);
    console.log(`[VIDEO QUEUE] ✅ Thumbnail generated for ${videoId}`);
    
    // 3. Расчет длительности
    await job.progress(90);
    console.log(`[VIDEO QUEUE] Step 3/3: Calculating duration for ${videoId}...`);
    await videoService.calculateDuration(videoPath, videoId);
    await job.progress(100);
    console.log(`[VIDEO QUEUE] ✅ Duration calculated for ${videoId}`);
    
    // Mark as completed
    try {
      await require('../config/database').pool.query(
        "UPDATE videos SET processing_status = 'completed' WHERE id = $1",
        [videoId]
      );
    } catch (e) {
      console.warn('[VIDEO QUEUE] Failed to set processing_status=completed:', e.message);
    }

    console.log(`[VIDEO QUEUE] ✅ Video ${videoId} processed successfully`);
    
    return { 
      success: true, 
      videoId,
      message: 'Video processed successfully' 
    };
    
  } catch (error) {
    console.error(`[VIDEO QUEUE] ❌ Error processing video ${videoId}:`, error);
    // Mark as failed
    try {
      await require('../config/database').pool.query(
        "UPDATE videos SET processing_status = 'failed' WHERE id = $1",
        [videoId]
      );
    } catch (e) {
      console.warn('[VIDEO QUEUE] Failed to set processing_status=failed:', e.message);
    }

    // Логируем ошибку, но не пробрасываем (чтобы не блокировать очередь)
    throw new Error(`Video processing failed: ${error.message}`);
  }
});

// События очереди для мониторинга
videoQueue.on('completed', (job, result) => {
  console.log(`[VIDEO QUEUE] ✅ Job ${job.id} completed:`, result);
});

videoQueue.on('failed', (job, err) => {
  console.error(`[VIDEO QUEUE] ❌ Job ${job.id} failed:`, err.message);
});

videoQueue.on('stalled', (job) => {
  console.warn(`[VIDEO QUEUE] ⚠️ Job ${job.id} stalled, restarting...`);
});

videoQueue.on('active', (job) => {
  console.log(`[VIDEO QUEUE] 🔄 Job ${job.id} started processing`);
});

// Добавление видео в очередь
async function addVideoToQueue(videoId, videoPath) {
  try {
    const job = await videoQueue.add(
      { videoId, videoPath },
      {
        jobId: `video-${videoId}`, // Уникальный ID, чтобы не добавлять дубликаты
        priority: 1, // Приоритет (1 = высокий, 10 = низкий)
        timeout: 600000, // 10 минут максимум на обработку
      }
    );
    
    console.log(`[VIDEO QUEUE] ✅ Video ${videoId} added to queue (Job ${job.id})`);
    
    return {
      jobId: job.id,
      status: 'queued',
      position: await job.getPosition(),
    };
  } catch (error) {
    console.error(`[VIDEO QUEUE] ❌ Failed to add video ${videoId} to queue:`, error);
    throw error;
  }
}

// Получение статуса обработки
async function getVideoProcessingStatus(videoId) {
  try {
    const job = await videoQueue.getJob(`video-${videoId}`);
    
    if (!job) {
      return { status: 'not_found' };
    }
    
    const state = await job.getState();
    const progress = job.progress();
    
    return {
      status: state, // 'waiting', 'active', 'completed', 'failed'
      progress,
      position: state === 'waiting' ? await job.getPosition() : null,
    };
  } catch (error) {
    console.error(`[VIDEO QUEUE] Error getting status for video ${videoId}:`, error);
    return { status: 'error', message: error.message };
  }
}

// Статистика очереди
async function getQueueStats() {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      videoQueue.getWaitingCount(),
      videoQueue.getActiveCount(),
      videoQueue.getCompletedCount(),
      videoQueue.getFailedCount(),
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active,
    };
  } catch (error) {
    console.error('[VIDEO QUEUE] Error getting queue stats:', error);
    return null;
  }
}

// Очистка завершённых и проваленных задач (можно запускать по cron)
async function cleanOldJobs() {
  try {
    await videoQueue.clean(24 * 3600 * 1000, 'completed'); // Удаляем completed старше 24 часов
    await videoQueue.clean(7 * 24 * 3600 * 1000, 'failed'); // Удаляем failed старше 7 дней
    console.log('[VIDEO QUEUE] ✅ Old jobs cleaned');
  } catch (error) {
    console.error('[VIDEO QUEUE] Error cleaning jobs:', error);
  }
}

// Graceful shutdown
async function closeQueue() {
  await videoQueue.close();
  console.log('[VIDEO QUEUE] Queue closed');
}

module.exports = {
  videoQueue,
  addVideoToQueue,
  getVideoProcessingStatus,
  getQueueStats,
  cleanOldJobs,
  closeQueue,
};

