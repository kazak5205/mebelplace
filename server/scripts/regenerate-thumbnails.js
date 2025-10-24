const { pool } = require('../config/database');
const videoService = require('../services/videoService');
const path = require('path');
const fs = require('fs').promises;

async function regenerateThumbnails() {
  try {
    console.log('🎬 Starting thumbnail regeneration...');
    
    // Get all videos
    const result = await pool.query('SELECT id, video_url, thumbnail_url FROM videos WHERE is_active = true');
    const videos = result.rows;
    
    console.log(`Found ${videos.length} videos to process`);
    
    for (const video of videos) {
      try {
        // Convert video URL to file path
        // video_url format: /uploads/videos/video-xxx.mp4
        const videoPath = path.join(__dirname, '../..', video.video_url);
        
        console.log(`\nProcessing video ${video.id}`);
        console.log(`Video path: ${videoPath}`);
        
        // Check if video file exists
        try {
          await fs.access(videoPath);
        } catch (err) {
          console.log(`❌ Video file not found: ${videoPath}`);
          continue;
        }
        
        // Check if thumbnail already exists
        const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '_thumb.jpg');
        let thumbnailExists = false;
        try {
          await fs.access(thumbnailPath);
          thumbnailExists = true;
          console.log(`✅ Thumbnail already exists: ${thumbnailPath}`);
        } catch (err) {
          console.log(`⚠️  Thumbnail missing, will generate`);
        }
        
        // Generate thumbnail if missing
        if (!thumbnailExists) {
          await videoService.generateThumbnail(videoPath, video.id);
          console.log(`✅ Generated thumbnail for video ${video.id}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing video ${video.id}:`, error.message);
      }
    }
    
    console.log('\n🎉 Thumbnail regeneration completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

regenerateThumbnails();

