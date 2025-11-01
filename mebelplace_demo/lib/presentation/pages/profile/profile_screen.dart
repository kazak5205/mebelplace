import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_helper.dart';
import '../../providers/app_providers.dart';
import '../../providers/repository_providers.dart';
import '../../../data/models/user_model.dart';
import '../../../data/models/video_model.dart';
import '../../../data/models/order_model.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // ✅ Локальное состояние для видео мастера (как на вебе)
  List<VideoModel> _masterVideos = [];
  bool _isLoadingMasterVideos = false;
  
  // Состояние для разных вкладок (как на вебе)
  List<VideoModel> _likedVideos = [];
  bool _isLoadingLikedVideos = false;
  List<VideoModel> _bookmarkedVideos = [];
  bool _isLoadingBookmarkedVideos = false;
  
  // Текущая активная вкладка (только для мастера)
  int _activeTabIndex = 0;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    // Для мастера 3 вкладки (videos, likes, bookmarked), для клиента 2 (заказы, избранное)
    final tabCount = user?.role == 'master' ? 3 : 2;
    _tabController = TabController(length: tabCount, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _activeTabIndex = _tabController.index;
        });
        // Загружаем данные при смене вкладки
        _loadTabData(_tabController.index);
      }
    });
    
    // Загружаем данные при открытии профиля
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final currentUser = ref.read(authProvider).user;
      if (currentUser != null) {
        if (currentUser.role == 'master') {
          _loadMasterVideos(currentUser.id);
          // Загружаем также лайкнутые и избранные для мастера
          ref.read(videoProvider.notifier).loadLikedVideos();
          ref.read(videoProvider.notifier).loadBookmarkedVideos();
        } else {
          // Для клиента загружаем подписки (мои мастера) и избранное
          ref.read(masterProvider.notifier).loadSubscriptions(currentUser.id);
          ref.read(videoProvider.notifier).loadBookmarkedVideos();
        }
        ref.read(orderProvider.notifier).loadOrders();
      }
    });
  }

  void _loadTabData(int index) {
    final user = ref.read(authProvider).user;
    if (user == null || user.role != 'master') return;
    
    switch (index) {
      case 0: // videos
        _loadMasterVideos(user.id);
        break;
      case 1: // likes
        ref.read(videoProvider.notifier).loadLikedVideos();
        break;
      case 2: // bookmarked
        ref.read(videoProvider.notifier).loadBookmarkedVideos();
        break;
    }
  }
  
  // ✅ Отдельная загрузка своих видео для мастера (как на вебе)
  Future<void> _loadMasterVideos(String masterId) async {
    setState(() => _isLoadingMasterVideos = true);
    try {
      final videoRepository = ref.read(videoRepositoryProvider);
      final videos = await videoRepository.getMasterVideos(masterId);
      if (mounted) {
        setState(() {
          _masterVideos = videos;
          _isLoadingMasterVideos = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _masterVideos = [];
          _isLoadingMasterVideos = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      backgroundColor: AppColors.dark,
      body: authState.user != null
          ? _buildProfileContent(authState.user!)
          : _buildLoginPrompt(),
    );
  }

  Widget _buildLoginPrompt() {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120.w,
                height: 120.w,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                  ),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.person_outline_rounded,
                  size: 60.sp,
                  color: Colors.white,
                ),
              ),
              
              SizedBox(height: 32.h),
              
              Text(
                'Войдите в аккаунт',
                style: TextStyle(
                  fontSize: 28.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              
              SizedBox(height: 12.h),
              
              Text(
                'Создавайте профиль, делитесь работами\nи находите клиентов',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Colors.white.withOpacity(0.6),
                  height: 1.5,
                ),
              ),
              
              SizedBox(height: 40.h),
              
              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                  ),
                  child: Ink(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.secondary],
                      ),
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                    child: Container(
                      alignment: Alignment.center,
                      child: Text(
                        'Войти или зарегистрироваться',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileContent(UserModel user) {
    final isMaster = user.role == 'master';
    
    // Для клиента - отдельный интерфейс
    if (!isMaster) {
      return _buildClientProfile(user);
    }
    
    // Для мастера - текущий интерфейс
    return NestedScrollView(
      headerSliverBuilder: (context, innerBoxIsScrolled) {
        return [
          SliverAppBar(
            expandedHeight: 0,
            pinned: true,
            backgroundColor: AppColors.dark,
            actions: [
              IconButton(
                icon: Icon(Icons.settings_outlined, color: Colors.white, size: 24.sp),
                onPressed: () => _showSettingsDialog(context, user),
              ),
            ],
          ),
        ];
      },
      body: CustomScrollView(
        slivers: [
          // Profile Header
          SliverToBoxAdapter(
            child: Column(
              children: [
                SizedBox(height: 20.h),
                
                // Avatar
                Hero(
                  tag: 'profile_avatar_${user.id}',
                  child: Container(
                    width: 110.w,
                    height: 110.w,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.secondary],
                      ),
                    ),
                    padding: EdgeInsets.all(3.w),
                    child: ClipOval(
                      child: ImageHelper.hasValidImagePath(user.avatar)
                          ? CachedNetworkImage(
                              imageUrl: ImageHelper.getFullImageUrl(user.avatar),
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                color: AppColors.darkSurface,
                                child: Icon(
                                  Icons.person,
                                  size: 50.sp,
                                  color: Colors.white,
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: AppColors.darkSurface,
                                child: Icon(
                                  Icons.person,
                                  size: 50.sp,
                                  color: Colors.white,
                                ),
                              ),
                            )
                          : Container(
                              color: AppColors.darkSurface,
                              child: Icon(
                                Icons.person,
                                size: 50.sp,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ),
                
                SizedBox(height: 16.h),
                
                // Username
                Text(
                  '@${user.username}',
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                
                SizedBox(height: 8.h),
                
                // Role badge - показываем тип компании для мастера
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 6.h,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.r),
                    border: Border.all(
                      color: isMaster 
                          ? _getCompanyTypeBorderColor(user.companyType)
                          : const Color(0xFF7C3AED),
                      width: 1,
                    ),
                    color: isMaster
                        ? _getCompanyTypeBgColor(user.companyType)
                        : const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                  ),
                  child: Text(
                    isMaster ? _getCompanyTypeLabel(user.companyType) : 'Клиент',
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: isMaster 
                          ? _getCompanyTypeTextColor(user.companyType)
                          : Colors.white,
                    ),
                  ),
                ),
                
                SizedBox(height: 24.h),
                
                // Stats
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildStatItem(
                      label: isMaster ? 'Видео' : 'Заказы',
                      value: isMaster 
                          ? (ref.watch(videoProvider).videos.where((v) => v.authorId == user.id).length.toString())
                          : (ref.watch(orderProvider).orders.where((o) => o.clientId == user.id).length.toString()),
                    ),
                    _buildStatItem(
                      label: 'Подписчики',
                      value: (user.subscribersCount ?? user.followersCount ?? 0).toString(),
                    ),
                    _buildStatItem(
                      label: 'Подписки',
                      value: (user.subscriptionsCount ?? 0).toString(),
                    ),
                    _buildStatItem(
                      label: 'Лайки',
                      value: _calculateTotalLikes(ref.watch(videoProvider).videos.where((v) => v.authorId == user.id).toList()).toString(),
                    ),
                  ],
                ),
                
                SizedBox(height: 24.h),
                
                // Action buttons
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildActionButton(
                          icon: Icons.edit_outlined,
                          label: 'Редактировать',
                          onTap: () {
                            _showEditProfileDialog(context, user);
                          },
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: _buildActionButton(
                          icon: Icons.share_outlined,
                          label: 'Поделиться',
                          onTap: () => _shareProfile(user),
                        ),
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: 24.h),
                
                // Tabs - для мастера 3 вкладки (videos, likes, bookmarked), для клиента 2 (заказы, избранное)
                TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.primary,
                  indicatorWeight: 3,
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.white.withOpacity(0.5),
                  labelStyle: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                  ),
                  tabs: isMaster
                      ? [
                          // Для мастера: videos, likes, bookmarked (как на вебе)
                          Tab(
                            icon: Icon(Icons.video_library_outlined, size: 24.sp),
                            text: 'Видео',
                          ),
                          Tab(
                            icon: Icon(Icons.favorite_border_rounded, size: 24.sp),
                            text: 'Лайки',
                          ),
                          Tab(
                            icon: Icon(Icons.bookmark_border_rounded, size: 24.sp),
                            text: 'Сохранено',
                          ),
                        ]
                      : [
                          // Для клиента: заказы, избранное
                          Tab(
                            icon: Icon(Icons.shopping_bag_outlined, size: 24.sp),
                            text: 'Заказы',
                          ),
                          Tab(
                            icon: Icon(Icons.bookmark_border_rounded, size: 24.sp),
                            text: 'Избранное',
                          ),
                        ],
                ),
              ],
            ),
          ),
          
          // Tab content - для мастера 3 вкладки, для клиента 2
          SliverFillRemaining(
            child: TabBarView(
              controller: _tabController,
              children: isMaster
                  ? [
                      // Для мастера: videos, likes, bookmarked
                      _buildVideosGrid(isMaster: true),
                      _buildLikedVideosGrid(),
                      _buildBookmarkedVideosGrid(),
                    ]
                  : [
                      // Для клиента: заказы, избранное
                      _buildOrdersGrid(),
                      _buildBookmarkedVideosGrid(),
                    ],
            ),
          ),
        ],
      ),
    );
  }

  int _calculateTotalLikes(List<dynamic> videos) {
    if (videos.isEmpty) return 0;
    return videos.fold<int>(0, (sum, video) {
      if (video is Map && video.containsKey('likesCount')) {
        return sum + (video['likesCount'] as int? ?? 0);
      }
      return sum;
    });
  }

  Widget _buildStatItem({required String label, required String value}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          label,
          style: TextStyle(
            fontSize: 12.sp,
            color: Colors.white.withOpacity(0.6),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12.h),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: Colors.white,
              size: 18.sp,
            ),
            SizedBox(width: 8.w),
            Text(
              label,
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideosGrid({required bool isMaster}) {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();
    
    // ✅ Используем локальное состояние для мастера (как на вебе)
    if (isMaster && _isLoadingMasterVideos) {
      return Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    
    return GridView.builder(
      padding: EdgeInsets.all(2.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, // 2 колонки как на вебе для мобильных устройств
        mainAxisSpacing: 2.w,
        crossAxisSpacing: 2.w,
        childAspectRatio: 9 / 16,
      ),
      itemCount: isMaster 
          ? _masterVideos.length
          : ref.watch(orderProvider).orders.where((o) => o.clientId == user.id).length,
      itemBuilder: (context, index) {
        final items = isMaster 
            ? _masterVideos
            : ref.watch(orderProvider).orders.where((o) => o.clientId == user.id).toList();
        
        if (isMaster) {
          final video = items[index] as VideoModel;
          return GestureDetector(
            onTap: () {
              Navigator.pushNamed(
                context,
                '/video-detail',
                arguments: video.id,
              );
            },
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.darkSurface,
                border: Border.all(
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (ImageHelper.hasValidImagePath(video.thumbnailUrl))
                    CachedNetworkImage(
                      imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey[900],
                        child: const Icon(
                          Icons.video_library_outlined,
                          color: Colors.white54,
                          size: 40,
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[900],
                        child: const Icon(
                          Icons.video_library_outlined,
                          color: Colors.white54,
                          size: 40,
                        ),
                      ),
                    )
                  else
                    Container(
                      color: Colors.grey[900],
                      child: const Icon(
                        Icons.video_library_outlined,
                        color: Colors.white54,
                        size: 40,
                      ),
                    ),
                  Positioned(
                    bottom: 4,
                    left: 4,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.play_arrow,
                            color: Colors.white,
                            size: 12.sp,
                          ),
                          Text(
                            video.views.toString(),
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10.sp,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        } else {
          final order = items[index] as OrderModel;
          return Container(
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(4.r),
            ),
            child: Center(
              child: Icon(
                Icons.play_circle_outline_rounded,
                color: Colors.white.withOpacity(0.7),
                size: 40.sp,
              ),
            ),
          );
        }
      },
    );
  }

  // Для клиента - заказы
  Widget _buildOrdersGrid() {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();
    
    final orders = ref.watch(orderProvider).orders.where((o) => o.clientId == user.id).toList();
    
    if (orders.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shopping_bag_outlined, size: 64.sp, color: Colors.white.withOpacity(0.3)),
              SizedBox(height: 16.h),
              Text(
                'У вас пока нет заказов',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 16.sp,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
        return Container(
          margin: EdgeInsets.only(bottom: 12.h),
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(
              order.title,
              style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              order.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14.sp),
            ),
            trailing: Icon(Icons.chevron_right, color: Colors.white.withOpacity(0.4)),
            onTap: () {
              Navigator.pushNamed(context, '/order-detail', arguments: order.id);
            },
          ),
        );
      },
    );
  }

  // Лайкнутые видео (для мастера)
  Widget _buildLikedVideosGrid() {
    final videoState = ref.watch(videoProvider);
    
    if (videoState.isLoading) {
      return Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    
    if (videoState.error != null) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Text(
            'Ошибка загрузки: ${videoState.error}',
            style: TextStyle(color: Colors.red.withOpacity(0.8), fontSize: 14.sp),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    
    if (videoState.videos.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.favorite_border, size: 64.sp, color: Colors.white.withOpacity(0.3)),
              SizedBox(height: 16.h),
              Text(
                'У вас пока нет лайкнутых видео',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 16.sp,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return GridView.builder(
      padding: EdgeInsets.all(2.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 2.w,
        crossAxisSpacing: 2.w,
        childAspectRatio: 9 / 16,
      ),
      itemCount: videoState.videos.length,
      itemBuilder: (context, index) {
        final video = videoState.videos[index];
        return GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/video-detail', arguments: video.id);
          },
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (ImageHelper.hasValidImagePath(video.thumbnailUrl))
                  CachedNetworkImage(
                    imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[900],
                      child: const Icon(Icons.video_library_outlined, color: Colors.white54, size: 40),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[900],
                      child: const Icon(Icons.video_library_outlined, color: Colors.white54, size: 40),
                    ),
                  )
                else
                  Container(
                    color: Colors.grey[900],
                    child: const Icon(Icons.video_library_outlined, color: Colors.white54, size: 40),
                  ),
                Positioned(
                  bottom: 4,
                  left: 4,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.favorite, color: Colors.red, size: 12.sp),
                        SizedBox(width: 4.w),
                        Text(
                          '${video.likesCount ?? 0}',
                          style: TextStyle(color: Colors.white, fontSize: 10.sp),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Сохраненные видео (для мастера и клиента)
  Widget _buildBookmarkedVideosGrid() {
    final videoState = ref.watch(videoProvider);
    
    if (videoState.isLoading) {
      return Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    
    if (videoState.error != null) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Text(
            'Ошибка загрузки: ${videoState.error}',
            style: TextStyle(color: Colors.red.withOpacity(0.8), fontSize: 14.sp),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    
    if (videoState.videos.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.bookmark_border, size: 64.sp, color: Colors.white.withOpacity(0.3)),
              SizedBox(height: 16.h),
              Text(
                'У вас пока нет сохраненных видео',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 16.sp,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return GridView.builder(
      padding: EdgeInsets.all(2.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 2.w,
        crossAxisSpacing: 2.w,
        childAspectRatio: 9 / 16,
      ),
      itemCount: videoState.videos.length,
      itemBuilder: (context, index) {
        final video = videoState.videos[index];
        return GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/video-detail', arguments: video.id);
          },
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (ImageHelper.hasValidImagePath(video.thumbnailUrl))
                  CachedNetworkImage(
                    imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[900],
                      child: const Icon(Icons.video_library_outlined, color: Colors.white54, size: 40),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[900],
                      child: const Icon(Icons.video_library_outlined, color: Colors.white54, size: 40),
                    ),
                  )
                else
                  Container(
                    color: Colors.grey[900],
                    child: const Icon(Icons.video_library_outlined, color: Colors.white54, size: 40),
                  ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: Icon(Icons.bookmark, color: AppColors.primary, size: 16.sp),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLikesGrid() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(40.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.favorite_border_rounded,
              size: 64.sp,
              color: Colors.white.withOpacity(0.3),
            ),
            SizedBox(height: 16.h),
            Text(
              'Нет понравившихся видео',
              style: TextStyle(
                fontSize: 16.sp,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSettingsDialog(BuildContext context, UserModel user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 40.w,
              height: 4.h,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2.r),
              ),
            ),
            SizedBox(height: 24.h),
            
            Text(
              'Настройки',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 24.h),
            
            // Edit Profile
            _buildSettingsItem(
              icon: Icons.edit_outlined,
              iconColor: Colors.pink,
              title: 'Редактировать профиль',
              subtitle: 'Изменить имя, фото и другие данные',
              onTap: () {
                Navigator.pop(context);
                _showEditProfileDialog(context, user);
              },
            ),
            
            SizedBox(height: 12.h),
            
            // Language
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40.w,
                        height: 40.w,
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Icon(Icons.language, color: Colors.blue, size: 20.sp),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Язык',
                              style: TextStyle(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Выберите язык интерфейса',
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: Colors.white.withOpacity(0.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12.h),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: EdgeInsets.symmetric(vertical: 10.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
                          ),
                          child: Text('Русский', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: Stack(
                          children: [
                            ElevatedButton(
                              onPressed: null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white.withOpacity(0.05),
                                disabledBackgroundColor: Colors.white.withOpacity(0.05),
                                padding: EdgeInsets.symmetric(vertical: 10.h),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
                              ),
                              child: Text(
                                'Қазақша',
                                style: TextStyle(fontSize: 12.sp, color: Colors.white.withOpacity(0.3)),
                              ),
                            ),
                            Positioned(
                              top: -2,
                              right: -2,
                              child: Container(
                                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                                decoration: BoxDecoration(
                                  color: Colors.yellow,
                                  borderRadius: BorderRadius.circular(8.r),
                                ),
                                child: Text(
                                  'Скоро',
                                  style: TextStyle(
                                    fontSize: 9.sp,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 12.h),
            
            // Support
            _buildSettingsItem(
              icon: Icons.help_outline,
              iconColor: Colors.green,
              title: 'Поддержка',
              subtitle: 'Связаться с службой поддержки',
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/support');
              },
            ),
            
            SizedBox(height: 12.h),
            
            // Delete Account
            _buildSettingsItem(
              icon: Icons.delete_outline,
              iconColor: Colors.red,
              title: 'Удалить профиль',
              subtitle: 'Безвозвратное удаление аккаунта',
              onTap: () {
                Navigator.pop(context);
                _showDeleteAccountDialog(context);
              },
              isDestructive: true,
            ),
            
            SizedBox(height: 12.h),
            
            // Logout
            _buildSettingsItem(
              icon: Icons.logout,
              iconColor: Colors.orange,
              title: 'Выйти',
              subtitle: 'Выход из аккаунта',
              onTap: () {
                Navigator.pop(context);
                ref.read(authProvider.notifier).logout();
              },
            ),
            
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: isDestructive ? Colors.red.withOpacity(0.1) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isDestructive ? Colors.red.withOpacity(0.3) : Colors.white.withOpacity(0.1),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(icon, color: iconColor, size: 20.sp),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: isDestructive ? Colors.red : Colors.white,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.darkSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
        title: Text(
          'Удалить профиль?',
          style: TextStyle(color: Colors.white, fontSize: 18.sp, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Вы уверены, что хотите удалить профиль? Это действие необратимо.',
          style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Отмена', style: TextStyle(color: Colors.white.withOpacity(0.6))),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final apiService = ref.read(apiServiceProvider);
                await apiService.deleteAccount();
                Navigator.pop(context);
                await ref.read(authProvider.notifier).logout();
                Navigator.pushNamedAndRemoveUntil(context, '/register', (route) => false);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Ошибка при удалении аккаунта'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
            ),
            child: Text('Удалить', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context, UserModel user) {
    final firstNameController = TextEditingController(text: user.firstName ?? '');
    final lastNameController = TextEditingController(text: user.lastName ?? '');
    final usernameController = TextEditingController(text: user.username);
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        title: Text(
          'Редактировать профиль',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Имя
              TextField(
                controller: firstNameController,
                style: TextStyle(color: Colors.white, fontSize: 14.sp),
                decoration: InputDecoration(
                  labelText: 'Имя',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.05),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
              SizedBox(height: 16.h),
              
              // Фамилия
              TextField(
                controller: lastNameController,
                style: TextStyle(color: Colors.white, fontSize: 14.sp),
                decoration: InputDecoration(
                  labelText: 'Фамилия',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.05),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
              SizedBox(height: 16.h),
              
              // Username
              TextField(
                controller: usernameController,
                style: TextStyle(color: Colors.white, fontSize: 14.sp),
                decoration: InputDecoration(
                  labelText: 'Имя пользователя',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                  helperText: 'Только латиница, цифры и _',
                  helperStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11.sp),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.05),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Отмена',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 14.sp,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              // Валидация username
              final username = usernameController.text.trim();
              if (username.isNotEmpty && !RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(username)) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Username может содержать только латиницу, цифры и _'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              
              try {
                final apiService = ref.read(apiServiceProvider);
                await apiService.updateProfile(
                  firstName: firstNameController.text.trim().isEmpty ? null : firstNameController.text.trim(),
                  lastName: lastNameController.text.trim().isEmpty ? null : lastNameController.text.trim(),
                  username: username.isEmpty ? null : username,
                );
                
                // Обновляем локальный state
                await ref.read(authProvider.notifier).refreshUser();
                
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Профиль успешно обновлен!'),
                    backgroundColor: Colors.green,
                  ),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(e.toString().contains('409') || e.toString().contains('already taken')
                        ? 'Это имя пользователя уже занято'
                        : 'Ошибка обновления профиля'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
            ),
            child: Text(
              'Сохранить',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClientProfile(UserModel user) {
    return SingleChildScrollView(
      child: Column(
        children: [
          SizedBox(height: 60.h),
          
          // Avatar
          Hero(
            tag: 'profile_avatar_${user.id}',
            child: Container(
              width: 100.w,
              height: 100.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
                ),
              ),
              padding: EdgeInsets.all(3.w),
              child: ClipOval(
                child: ImageHelper.hasValidImagePath(user.avatar)
                    ? CachedNetworkImage(
                        imageUrl: ImageHelper.getFullImageUrl(user.avatar),
                        fit: BoxFit.cover,
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.darkSurface,
                          child: Icon(Icons.person, size: 50.sp, color: Colors.white),
                        ),
                      )
                    : Container(
                        color: AppColors.darkSurface,
                        child: Icon(Icons.person, size: 50.sp, color: Colors.white),
                      ),
              ),
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Username
          Text(
            '@${user.username}',
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          
          SizedBox(height: 24.h),
          
          // Action buttons
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    icon: Icons.edit_outlined,
                    label: 'Редактировать',
                    onTap: () => _showEditProfileDialog(context, user),
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: _buildActionButton(
                    icon: Icons.share_outlined,
                    label: 'Поделиться',
                    onTap: () => _shareProfile(user),
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: 32.h),
          
          // Мои мастера
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.people_outline, color: AppColors.primary, size: 24.sp),
                    SizedBox(width: 8.w),
                    Text(
                      'Мои мастера',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                // Список мастеров с API
                Builder(
                  builder: (context) {
                    final masterState = ref.watch(masterProvider);
                    
                    if (masterState.isLoading) {
                      return Container(
                        padding: EdgeInsets.all(20.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                          ),
                        ),
                      );
                    }
                    
                    if (masterState.error != null) {
                      return Container(
                        padding: EdgeInsets.all(20.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Center(
                          child: Text(
                            'Ошибка загрузки: ${masterState.error}',
                            style: TextStyle(
                              color: Colors.red.withOpacity(0.8),
                              fontSize: 14.sp,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    }
                    
                    if (masterState.masters.isEmpty) {
                      return Container(
                        padding: EdgeInsets.all(20.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Center(
                          child: Text(
                            'У вас пока нет подписок на мастеров',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 14.sp,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    }
                    
                    return Column(
                      children: masterState.masters.take(5).map((master) {
                        return GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/master-profile', arguments: master.id);
                          },
                          child: Container(
                            margin: EdgeInsets.only(bottom: 12.h),
                            padding: EdgeInsets.all(12.w),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12.r),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.2),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 20.r,
                                  backgroundColor: AppColors.primary,
                                  backgroundImage: master.avatar != null
                                      ? NetworkImage(ImageHelper.getFullImageUrl(master.avatar!))
                                      : null,
                                  child: master.avatar == null
                                      ? Text(
                                          master.displayName.isNotEmpty 
                                              ? master.displayName[0].toUpperCase()
                                              : 'M',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 16.sp,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        )
                                      : null,
                                ),
                                SizedBox(width: 12.w),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        // Показываем название компании для мастеров, или имя+фамилия, или username
                                        master.isMaster && master.companyName != null && master.companyName!.isNotEmpty
                                            ? master.companyName!
                                            : (master.firstName != null && master.lastName != null
                                                ? '${master.firstName} ${master.lastName}'
                                                : master.username),
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 14.sp,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      if (master.username != null)
                                        Text(
                                          '@${master.username}',
                                          style: TextStyle(
                                            color: Colors.white.withOpacity(0.6),
                                            fontSize: 12.sp,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                Icon(
                                  Icons.chevron_right,
                                  color: Colors.white.withOpacity(0.4),
                                  size: 20.sp,
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
              ],
            ),
          ),
          
          SizedBox(height: 32.h),
          
          // Избранное
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.favorite_border, color: AppColors.primary, size: 24.sp),
                    SizedBox(width: 8.w),
                    Text(
                      'Избранное',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                // Список избранных видео с API
                Builder(
                  builder: (context) {
                    final videoState = ref.watch(videoProvider);
                    
                    if (videoState.isLoading) {
                      return Container(
                        padding: EdgeInsets.all(20.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                          ),
                        ),
                      );
                    }
                    
                    if (videoState.error != null) {
                      return Container(
                        padding: EdgeInsets.all(20.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Center(
                          child: Text(
                            'Ошибка загрузки: ${videoState.error}',
                            style: TextStyle(
                              color: Colors.red.withOpacity(0.8),
                              fontSize: 14.sp,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    }
                    
                    if (videoState.videos.isEmpty) {
                      return Container(
                        padding: EdgeInsets.all(20.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Center(
                          child: Text(
                            'У вас пока нет избранных видео',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 14.sp,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    }
                    
                    // Сетка избранных видео (2 колонки как на вебе)
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 2.w,
                        crossAxisSpacing: 2.w,
                        childAspectRatio: 9 / 16,
                      ),
                      itemCount: videoState.videos.length,
                      itemBuilder: (context, index) {
                        final video = videoState.videos[index];
                        return GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              '/home',
                            );
                            // TODO: Navigate to specific video
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.darkSurface,
                              border: Border.all(
                                color: Colors.white.withOpacity(0.1),
                              ),
                            ),
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                if (ImageHelper.hasValidImagePath(video.thumbnailUrl))
                                  CachedNetworkImage(
                                    imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Container(
                                      color: Colors.grey[900],
                                      child: const Icon(
                                        Icons.video_library_outlined,
                                        color: Colors.white54,
                                        size: 40,
                                      ),
                                    ),
                                    errorWidget: (context, url, error) => Container(
                                      color: Colors.grey[900],
                                      child: const Icon(
                                        Icons.video_library_outlined,
                                        color: Colors.white54,
                                        size: 40,
                                      ),
                                    ),
                                  )
                                else
                                  Container(
                                    color: Colors.grey[900],
                                    child: const Icon(
                                      Icons.video_library_outlined,
                                      color: Colors.white54,
                                      size: 40,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          ),
          
          SizedBox(height: 40.h),
        ],
      ),
    );
  }

  void _shareProfile(UserModel user) {
    final profileUrl = 'https://mebelplace.com.kz/profile/${user.username}';
    final text = user.role == 'master'
        ? 'Посмотрите профиль мастера ${user.displayName} на MebelPlace!\n$profileUrl'
        : 'Посмотрите профиль ${user.displayName} на MebelPlace!\n$profileUrl';
    
    Share.share(
      text,
      subject: 'Профиль на MebelPlace',
    );
  }

  // ✅ Company Type Helper методы (как на вебе companyTypes.ts)
  String _getCompanyTypeLabel(String? type) {
    if (type == null) return 'Мастер';
    switch (type) {
      case 'company':
        return 'Мебельная компания';
      case 'shop':
        return 'Мебельный магазин';
      case 'master':
      default:
        return 'Мастер';
    }
  }

  Color _getCompanyTypeBgColor(String? type) {
    if (type == null) return Colors.yellow.withValues(alpha: 0.2);
    switch (type) {
      case 'company':
        return Colors.orange.withValues(alpha: 0.2);
      case 'shop':
        return Colors.red.withValues(alpha: 0.2);
      case 'master':
      default:
        return Colors.yellow.withValues(alpha: 0.2);
    }
  }

  Color _getCompanyTypeTextColor(String? type) {
    if (type == null) return Colors.yellow[400]!;
    switch (type) {
      case 'company':
        return Colors.orange[400]!;
      case 'shop':
        return Colors.red[400]!;
      case 'master':
      default:
        return Colors.yellow[400]!;
    }
  }

  Color _getCompanyTypeBorderColor(String? type) {
    if (type == null) return Colors.yellow.withValues(alpha: 0.3);
    switch (type) {
      case 'company':
        return Colors.orange.withValues(alpha: 0.3);
      case 'shop':
        return Colors.red.withValues(alpha: 0.3);
      case 'master':
      default:
        return Colors.yellow.withValues(alpha: 0.3);
    }
  }
}
