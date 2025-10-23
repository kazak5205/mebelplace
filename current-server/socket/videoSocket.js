const { setupVideoSocket } = require('./videoSocket');

// Video-related Socket.IO events
const setupVideoSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🎬 Video socket connected: ${socket.user?.username}`);

    // Join video room for real-time updates
    socket.on('join_video', (videoId) => {
      socket.join(`video_${videoId}`);
      console.log(`👤 User ${socket.user.username} joined video ${videoId}`);
    });

    // Leave video room
    socket.on('leave_video', (videoId) => {
      socket.leave(`video_${videoId}`);
      console.log(`👤 User ${socket.user.username} left video ${videoId}`);
    });

    // Handle video likes
    socket.on('video_like', async (data) => {
      try {
        const { videoId } = data;
        
        // Toggle like in database
        const { pool } = require('../config/database');
        const likeResult = await pool.query(
          'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
          [videoId, socket.user.id]
        );

        let isLiked;
        if (likeResult.rows.length > 0) {
          // Remove like
          await pool.query(
            'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
            [videoId, socket.user.id]
          );
          await pool.query(
            'UPDATE videos SET likes = likes - 1 WHERE id = $1',
            [videoId]
          );
          isLiked = false;
        } else {
          // Add like
          await pool.query(
            'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2)',
            [videoId, socket.user.id]
          );
          await pool.query(
            'UPDATE videos SET likes = likes + 1 WHERE id = $1',
            [videoId]
          );
          isLiked = true;
        }

        // Get updated like count
        const videoResult = await pool.query(
          'SELECT likes FROM videos WHERE id = $1',
          [videoId]
        );

        // Broadcast to all users watching this video (синхронизировано с client/mobile)
        io.to(`video_${videoId}`).emit('video_liked', {
          videoId,
          userId: socket.user.id,
          isLiked,
          likesCount: videoResult.rows[0].likes
        });

        console.log(`❤️ Video ${videoId} ${isLiked ? 'liked' : 'unliked'} by ${socket.user.username}`);

      } catch (error) {
        console.error('Error handling video like:', error);
        socket.emit('error', { message: 'Failed to like video' });
      }
    });

    // Handle video comments
    socket.on('video_comment', async (data) => {
      try {
        const { videoId, content, parentId } = data;
        
        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Comment content is required' });
          return;
        }

        // Add comment to database
        const { pool } = require('../config/database');
        const commentResult = await pool.query(
          'INSERT INTO video_comments (video_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [videoId, socket.user.id, content.trim(), parentId || null]
        );

        const comment = commentResult.rows[0];

        // Get user info for comment
        const userResult = await pool.query(
          'SELECT username, avatar, first_name, last_name FROM users WHERE id = $1',
          [socket.user.id]
        );

        comment.user = userResult.rows[0];

        // Broadcast to all users watching this video (синхронизировано с client/mobile)
        io.to(`video_${videoId}`).emit('new_comment', {
          videoId,
          comment: {
            id: comment.id,
            content: comment.content,
            author: {
              id: socket.user.id,
              name: comment.user.username || `${comment.user.first_name} ${comment.user.last_name}`,
              avatar: comment.user.avatar
            },
            createdAt: comment.created_at
          }
        });

        console.log(`💬 New comment on video ${videoId} by ${socket.user.username}`);

      } catch (error) {
        console.error('Error handling video comment:', error);
        socket.emit('error', { message: 'Failed to add comment' });
      }
    });

    // Handle video views
    socket.on('video_view', async (data) => {
      try {
        const { videoId } = data;
        
        // Record view in database
        const { pool } = require('../config/database');
        await pool.query(
          'UPDATE videos SET views = views + 1 WHERE id = $1',
          [videoId]
        );

        // Get updated view count
        const videoResult = await pool.query(
          'SELECT views FROM videos WHERE id = $1',
          [videoId]
        );

        // Broadcast to all users watching this video
        io.to(`video_${videoId}`).emit('video_view_updated', {
          videoId,
          views: videoResult.rows[0].views
        });

        console.log(`👁️ Video ${videoId} viewed by ${socket.user.username}`);

      } catch (error) {
        console.error('Error handling video view:', error);
      }
    });

    // Handle video sharing
    socket.on('video_share', (data) => {
      try {
        const { videoId, platform } = data;
        
        // Broadcast share event
        io.to(`video_${videoId}`).emit('video_shared', {
          videoId,
          platform,
          userId: socket.user.id,
          username: socket.user.username
        });

        console.log(`📤 Video ${videoId} shared on ${platform} by ${socket.user.username}`);

      } catch (error) {
        console.error('Error handling video share:', error);
        socket.emit('error', { message: 'Failed to share video' });
      }
    });

    // Handle video upload completion
    socket.on('video_uploaded', (data) => {
      try {
        const { videoId, authorId, title, category } = data;
        
        // Notify subscribers of the author
        io.emit('new_video', {
          videoId,
          authorId,
          title,
          category,
          author: {
            id: socket.user.id,
            username: socket.user.username
          }
        });

        console.log(`🎬 New video uploaded: ${title} by ${socket.user.username}`);

      } catch (error) {
        console.error('Error handling video upload notification:', error);
      }
    });

    // Handle video watching status
    socket.on('video_watching', (data) => {
      try {
        const { videoId, isWatching } = data;
        
        if (isWatching) {
          socket.join(`video_${videoId}`);
        } else {
          socket.leave(`video_${videoId}`);
        }

        // Broadcast watching status to other users
        socket.to(`video_${videoId}`).emit('user_watching', {
          videoId,
          userId: socket.user.id,
          username: socket.user.username,
          isWatching
        });

      } catch (error) {
        console.error('Error handling video watching status:', error);
      }
    });

    // Handle video seeking (for synchronized viewing)
    socket.on('video_seek', (data) => {
      try {
        const { videoId, time } = data;
        
        // Broadcast seek event to other users in the same video room
        socket.to(`video_${videoId}`).emit('video_seeked', {
          videoId,
          time,
          userId: socket.user.id,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Error handling video seek:', error);
      }
    });

    // Handle video pause/play
    socket.on('video_play_pause', (data) => {
      try {
        const { videoId, isPlaying } = data;
        
        // Broadcast play/pause event
        socket.to(`video_${videoId}`).emit('video_play_pause_updated', {
          videoId,
          isPlaying,
          userId: socket.user.id,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Error handling video play/pause:', error);
      }
    });

    // Handle video quality change
    socket.on('video_quality_change', (data) => {
      try {
        const { videoId, quality } = data;
        
        // Broadcast quality change event
        socket.to(`video_${videoId}`).emit('video_quality_changed', {
          videoId,
          quality,
          userId: socket.user.id,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Error handling video quality change:', error);
      }
    });

    // Handle video fullscreen toggle
    socket.on('video_fullscreen', (data) => {
      try {
        const { videoId, isFullscreen } = data;
        
        // Broadcast fullscreen event
        socket.to(`video_${videoId}`).emit('video_fullscreen_toggled', {
          videoId,
          isFullscreen,
          userId: socket.user.id,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Error handling video fullscreen:', error);
      }
    });

    // Handle video volume change
    socket.on('video_volume_change', (data) => {
      try {
        const { videoId, volume } = data;
        
        // Broadcast volume change event
        socket.to(`video_${videoId}`).emit('video_volume_changed', {
          videoId,
          volume,
          userId: socket.user.id,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Error handling video volume change:', error);
      }
    });

    // Handle video error reporting
    socket.on('video_error', (data) => {
      try {
        const { videoId, error, timestamp } = data;
        
        console.error(`🎬 Video error reported for ${videoId}:`, {
          error,
          userId: socket.user.id,
          username: socket.user.username,
          timestamp
        });

        // You can add error reporting to database or external service here

      } catch (error) {
        console.error('Error handling video error report:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🎬 Video socket disconnected: ${socket.user?.username}`);
    });
  });
};

module.exports = { setupVideoSocket };

      console.log(`🎬 Video socket disconnected: ${socket.user?.username}`);
    });
  });
};

module.exports = { setupVideoSocket };


      console.log(`🎬 Video socket disconnected: ${socket.user?.username}`);
    });
  });
};

module.exports = { setupVideoSocket };


