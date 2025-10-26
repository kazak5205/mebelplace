import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/video_model.dart';
import '../../providers/app_providers.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/tiktok_video_player.dart';

class MasterChannelPage extends ConsumerStatefulWidget {
  final String masterId;
  
  const MasterChannelPage({
    super.key,
    required this.masterId,
  });

  @override
  ConsumerState<MasterChannelPage> createState() => _MasterChannelPageState();
}

class _MasterChannelPageState extends ConsumerState<MasterChannelPage> {
  @override
  void initState() {
    super.initState();
    // Загружаем информацию о мастере и его видео
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(videoProvider.notifier).loadMasterVideos(widget.masterId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final videoState = ref.watch(videoProvider);
    
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Канал мастера',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.white),
            onPressed: () {
              // TODO: Поделиться каналом
            },
          ),
        ],
      ),
      body: videoState.isLoading
          ? const Center(child: LoadingWidget())
          : videoState.error != null
              ? _buildErrorWidget(videoState.error!)
              : _buildMasterChannel(_getMasterInfo(), videoState.videos.where((v) => v.authorId == widget.masterId).toList()),
    );
  }

  Widget _buildMasterChannel(Map<String, dynamic> master, List<VideoModel> videos) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Информация о мастере
          _buildMasterInfo(master),
          
          SizedBox(height: 24.h),
          
          // Статистика
          _buildStats(master),
          
          SizedBox(height: 24.h),
          
          // Действия
          _buildActions(master),
          
          SizedBox(height: 24.h),
          
          // Видео мастера
          _buildVideosSection(videos),
        ],
      ),
    );
  }

  Widget _buildMasterInfo(Map<String, dynamic> master) {
    return Container(
      margin: EdgeInsets.all(16.w),
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withValues(alpha: 0.1),
            AppColors.secondary.withValues(alpha: 0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          // Аватар мастера
          Stack(
            children: [
              CircleAvatar(
                radius: 50.r,
                backgroundColor: AppColors.primary,
                backgroundImage: master['avatar'] != null 
                  ? NetworkImage(master['avatar'])
                  : null,
                child: master['avatar'] == null 
                  ? Icon(Icons.person, size: 50.sp, color: Colors.white)
                  : null,
              ),
              
              // Статус верификации
              if (master['isVerified'] == true)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 24.w,
                    height: 24.w,
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.dark, width: 2),
                    ),
                    child: Icon(
                      Icons.verified,
                      color: Colors.white,
                      size: 14.sp,
                    ),
                  ),
                ),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          // Имя мастера
          Text(
            master['name'],
            style: TextStyle(
              color: Colors.white,
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          SizedBox(height: 8.h),
          
          // Описание
          Text(
            master['description'],
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14.sp,
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 12.h),
          
          // Рейтинг
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.star,
                color: Colors.amber,
                size: 20.sp,
              ),
              SizedBox(width: 4.w),
              Text(
                '${master['rating']}',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(width: 8.w),
              Text(
                '(${master['reviewsCount']} отзывов)',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 12.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildStats(Map<String, dynamic> master) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.w),
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              'Видео',
              '${master['videosCount']}',
              Icons.video_library,
              AppColors.primary,
            ),
          ),
          
          Container(
            width: 1,
            height: 40.h,
            color: Colors.white.withValues(alpha: 0.1),
          ),
          
          Expanded(
            child: _buildStatItem(
              'Подписчики',
              '${master['followersCount']}',
              Icons.people,
              Colors.blue,
            ),
          ),
          
          Container(
            width: 1,
            height: 40.h,
            color: Colors.white.withValues(alpha: 0.1),
          ),
          
          Expanded(
            child: _buildStatItem(
              'Заказы',
              '${master['ordersCount']}',
              Icons.work,
              Colors.green,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 200.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(
          icon,
          color: color,
          size: 24.sp,
        ),
        SizedBox(height: 8.h),
        Text(
          value,
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 12.sp,
          ),
        ),
      ],
    );
  }

  Widget _buildActions(Map<String, dynamic> master) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.w),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, '/chat', arguments: widget.masterId);
              },
              icon: Icon(Icons.message, size: 18.sp),
              label: const Text('Написать'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
            ),
          ),
          
          SizedBox(width: 12.w),
          
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {
                // TODO: Подписаться/отписаться
              },
              icon: Icon(Icons.person_add, size: 18.sp),
              label: const Text('Подписаться'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 400.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildVideosSection(List<VideoModel> videos) {
    if (videos.isEmpty) {
      return _buildEmptyVideos();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Text(
            'Видео мастера',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        
        SizedBox(height: 16.h),
        
        SizedBox(
          height: 200.h,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            itemCount: videos.length,
            itemBuilder: (context, index) {
              return _buildVideoCard(videos[index], index);
            },
          ),
        ),
      ],
    ).animate().fadeIn(duration: 500.ms, delay: 600.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildVideoCard(VideoModel video, int index) {
    return Container(
      width: 160.w,
      margin: EdgeInsets.only(right: 12.w),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TikTokVideoPlayer(
                videos: [video],
                initialIndex: 0,
              ),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Превью видео
            Container(
              height: 120.h,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12.r),
                image: DecorationImage(
                  image: NetworkImage(video.thumbnailUrl ?? ''),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(
                children: [
                  // Градиент для лучшей видимости
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.r),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.7),
                        ],
                      ),
                    ),
                  ),
                  
                  // Длительность видео
                  Positioned(
                    bottom: 8.h,
                    right: 8.w,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Text(
                        _formatDuration(video.duration),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  
                  // Иконка воспроизведения
                  Center(
                    child: Container(
                      width: 40.w,
                      height: 40.w,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.play_arrow,
                        color: AppColors.primary,
                        size: 24.sp,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 8.h),
            
            // Название видео
            Text(
              video.title,
              style: TextStyle(
                color: Colors.white,
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            SizedBox(height: 4.h),
            
            // Статистика
            Row(
              children: [
                Icon(
                  Icons.visibility,
                  color: Colors.white.withValues(alpha: 0.7),
                  size: 12.sp,
                ),
                SizedBox(width: 4.w),
                Text(
                  '${video.views}',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 10.sp,
                  ),
                ),
                SizedBox(width: 12.w),
                Icon(
                  Icons.favorite,
                  color: Colors.white.withValues(alpha: 0.7),
                  size: 12.sp,
                ),
                SizedBox(width: 4.w),
                Text(
                  '${video.likesCount}',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 10.sp,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyVideos() {
    return Container(
      margin: EdgeInsets.all(16.w),
      padding: EdgeInsets.all(40.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.video_library_outlined,
            size: 64.sp,
            color: Colors.white.withValues(alpha: 0.3),
          ),
          SizedBox(height: 16.h),
          Text(
            'Пока нет видео',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Мастер еще не загрузил видео',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64.sp,
            color: Colors.red.withValues(alpha: 0.7),
          ),
          SizedBox(height: 16.h),
          Text(
            'Ошибка загрузки канала',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            error,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16.h),
          ElevatedButton(
            onPressed: () {
              ref.read(videoProvider.notifier).loadMasterVideos(widget.masterId);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: const Text(
              'Повторить',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _getMasterInfo() {
    // TODO: Получить реальную информацию о мастере из API
    return {
      'id': widget.masterId,
      'name': 'Алексей Мебельщик',
      'description': 'Профессиональный мастер по изготовлению мебели. Работаю с деревом уже 10 лет.',
      'avatar': 'https://picsum.photos/200/200?random=${widget.masterId}',
      'rating': 4.8,
      'reviewsCount': 127,
      'isVerified': true,
      'videosCount': 15,
      'followersCount': 2340,
      'ordersCount': 89,
    };
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
  }
}
