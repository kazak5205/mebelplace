import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
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

  Widget _buildVideosGrid(bool isMaster) {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();
    
    return GridView.builder(
      padding: EdgeInsets.all(2.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, // 2 колонки как на вебе для мобильных устройств
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
        }
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
