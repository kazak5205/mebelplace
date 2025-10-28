import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_helper.dart';
import '../../providers/app_providers.dart';
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

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Загружаем данные при открытии профиля
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      if (user != null) {
        if (user.role == 'master') {
          ref.read(videoProvider.notifier).loadMasterVideos(user.id);
        }
        ref.read(orderProvider.notifier).loadOrders();
      }
    });
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
                
                // Role badge
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 6.h,
                  ),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isMaster
                          ? [AppColors.primary, AppColors.secondary]
                          : [const Color(0xFF8B5CF6), const Color(0xFF7C3AED)],
                    ),
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Text(
                    isMaster ? 'Мастер' : 'Клиент',
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
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
                      value: (user.followersCount ?? 0).toString(),
                    ),
                    _buildStatItem(
                      label: 'Подписки',
                      value: '0', // TODO: Добавить в UserModel subscriptionsCount
                    ),
                    _buildStatItem(
                      label: 'Лайки',
                      value: '0', // TODO: Подсчитать лайки пользователя
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
                
                // Tabs
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
                  tabs: [
                    Tab(
                      icon: Icon(
                        isMaster
                            ? Icons.video_library_outlined
                            : Icons.shopping_bag_outlined,
                        size: 24.sp,
                      ),
                    ),
                    Tab(
                      icon: Icon(
                        Icons.favorite_border_rounded,
                        size: 24.sp,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Tab content
          SliverFillRemaining(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildVideosGrid(isMaster),
                _buildLikesGrid(),
              ],
            ),
          ),
        ],
      ),
    );
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

  Widget _buildVideosGrid(bool isMaster) {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();
    
    return GridView.builder(
      padding: EdgeInsets.all(2.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 2.w,
        crossAxisSpacing: 2.w,
        childAspectRatio: 9 / 16,
      ),
      itemCount: isMaster 
          ? ref.watch(videoProvider).videos.where((v) => v.authorId == user.id).length
          : ref.watch(orderProvider).orders.where((o) => o.clientId == user.id).length,
      itemBuilder: (context, index) {
        final items = isMaster 
            ? ref.watch(videoProvider).videos.where((v) => v.authorId == user.id).toList()
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
                  if (video.thumbnailUrl != null)
                    CachedNetworkImage(
                      imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
                      fit: BoxFit.cover,
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

  void _showEditProfileDialog(BuildContext context, UserModel user) {
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
        content: Text(
          'Функция редактирования профиля будет доступна в следующей версии',
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 14.sp,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Понятно',
              style: TextStyle(
                color: AppColors.primary,
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
                // TODO: Загрузить список мастеров с API
                Container(
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
                Container(
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
}
