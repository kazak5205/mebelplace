import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/video_model.dart';
import '../../../data/models/order_model.dart';
import '../../providers/app_providers.dart';
import '../../widgets/loading_widget.dart';

class SearchResultsPage extends ConsumerStatefulWidget {
  final String query;
  
  const SearchResultsPage({
    Key? key,
    required this.query,
  }) : super(key: key);

  @override
  ConsumerState<SearchResultsPage> createState() => _SearchResultsPageState();
}

class _SearchResultsPageState extends ConsumerState<SearchResultsPage> 
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _searchQuery = '';
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _searchQuery = widget.query;
    
    // Загружаем результаты поиска
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _performSearch();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: _buildSearchField(),
        centerTitle: false,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.white.withValues(alpha: 0.7),
          tabs: [
            Tab(text: 'Видео'),
            Tab(text: 'Заявки'),
            Tab(text: 'Мастера'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildVideosTab(),
          _buildOrdersTab(),
          _buildMastersTab(),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
      height: 40.h,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: TextField(
        controller: TextEditingController(text: _searchQuery),
        style: TextStyle(color: Colors.white, fontSize: 14.sp),
        decoration: InputDecoration(
          hintText: 'Поиск...',
          hintStyle: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontSize: 14.sp,
          ),
          prefixIcon: Icon(
            Icons.search,
            color: Colors.white.withValues(alpha: 0.7),
            size: 20.sp,
          ),
          suffixIcon: _searchQuery.isNotEmpty
            ? IconButton(
                icon: Icon(
                  Icons.clear,
                  color: Colors.white.withValues(alpha: 0.7),
                  size: 20.sp,
                ),
                onPressed: () {
                  setState(() {
                    _searchQuery = '';
                  });
                },
              )
            : null,
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        ),
        onSubmitted: (value) {
          setState(() {
            _searchQuery = value;
          });
          _performSearch();
        },
      ),
    );
  }

  Widget _buildVideosTab() {
    final videoState = ref.watch(videoProvider);
    
    return videoState.isLoading
        ? const Center(child: LoadingWidget())
        : videoState.error != null
            ? _buildErrorWidget(videoState.error!)
            : _buildFilteredVideos(videoState.videos);
  }

  Widget _buildFilteredVideos(List<VideoModel> videos) {
    final filteredVideos = videos.where((video) =>
      (video.title?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false) ||
      (video.description?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false) ||
      (video.tags?.any((tag) => tag.toLowerCase().contains(_searchQuery.toLowerCase())) ?? false)
    ).toList();
    
    if (filteredVideos.isEmpty) {
      return _buildEmptyState('Видео не найдены', Icons.video_library_outlined);
    }
    
    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: filteredVideos.length,
      itemBuilder: (context, index) {
        return _buildVideoCard(filteredVideos[index], index);
      },
    );
  }

  Widget _buildOrdersTab() {
    final orderState = ref.watch(orderProvider);
    
    return orderState.isLoading
        ? const Center(child: LoadingWidget())
        : orderState.error != null
            ? _buildErrorWidget(orderState.error!)
            : _buildFilteredOrders(orderState.orders);
  }

  Widget _buildFilteredOrders(List<OrderModel> orders) {
    final filteredOrders = orders.where((order) =>
      order.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      order.description.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
    
    if (filteredOrders.isEmpty) {
      return _buildEmptyState('Заявки не найдены', Icons.description_outlined);
    }
    
    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: filteredOrders.length,
      itemBuilder: (context, index) {
        return _buildOrderCard(filteredOrders[index], index);
      },
    );
  }

  Widget _buildMastersTab() {
    // TODO: Получить список мастеров из API
    final masters = _getMockMasters();
    final filteredMasters = masters.where((master) =>
      master['name'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
      master['description'].toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
    
    if (filteredMasters.isEmpty) {
      return _buildEmptyState('Мастера не найдены', Icons.person_outline);
    }
    
    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: filteredMasters.length,
      itemBuilder: (context, index) {
        return _buildMasterCard(filteredMasters[index], index);
      },
    );
  }

  Widget _buildVideoCard(VideoModel video, int index) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      child: Row(
        children: [
          // Превью видео
          Container(
            width: 120.w,
            height: 80.h,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.r),
              image: DecorationImage(
                image: NetworkImage(video.thumbnailUrl ?? ''),
                fit: BoxFit.cover,
              ),
            ),
            child: Stack(
              children: [
                // Градиент
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.r),
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
                
                // Длительность
                Positioned(
                  bottom: 4.h,
                  right: 4.w,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
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
                    width: 32.w,
                    height: 32.w,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.play_arrow,
                      color: AppColors.primary,
                      size: 20.sp,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(width: 12.w),
          
          // Информация о видео
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  video.title,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                SizedBox(height: 4.h),
                
                Text(
                  video.description ?? '',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 12.sp,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                SizedBox(height: 8.h),
                
                Row(
                  children: [
                    Icon(
                      Icons.person,
                      color: Colors.white.withValues(alpha: 0.7),
                      size: 12.sp,
                    ),
                    SizedBox(width: 4.w),
                    Text(
                      video.username ?? '',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12.sp,
                      ),
                    ),
                    SizedBox(width: 16.w),
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
                        fontSize: 12.sp,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: (index * 100).ms).slideX(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildOrderCard(OrderModel order, int index) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  order.title,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: _getStatusColor(order.status).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8.r),
                  border: Border.all(
                    color: _getStatusColor(order.status).withValues(alpha: 0.5),
                  ),
                ),
                child: Text(
                  _getStatusText(order.status),
                  style: TextStyle(
                    color: _getStatusColor(order.status),
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          
          SizedBox(height: 8.h),
          
          Text(
            order.description,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14.sp,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          
          SizedBox(height: 12.h),
          
          Row(
            children: [
              Icon(
                Icons.attach_money,
                color: AppColors.primary,
                size: 16.sp,
              ),
              SizedBox(width: 4.w),
              Text(
                '${order.price} ₸',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Spacer(),
              Text(
                _formatDate(order.createdAt),
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 12.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: (index * 100).ms).slideX(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildMasterCard(Map<String, dynamic> master, int index) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Аватар мастера
          CircleAvatar(
            radius: 24.r,
            backgroundColor: AppColors.primary,
            backgroundImage: master['avatar'] != null 
              ? NetworkImage(master['avatar'])
              : null,
            child: master['avatar'] == null 
              ? Icon(Icons.person, size: 24.sp, color: Colors.white)
              : null,
          ),
          
          SizedBox(width: 12.w),
          
          // Информация о мастере
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      master['name'],
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (master['isVerified'] == true) ...[
                      SizedBox(width: 4.w),
                      Icon(
                        Icons.verified,
                        color: Colors.blue,
                        size: 16.sp,
                      ),
                    ],
                  ],
                ),
                
                SizedBox(height: 4.h),
                
                Text(
                  master['description'],
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 12.sp,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                SizedBox(height: 8.h),
                
                Row(
                  children: [
                    Icon(
                      Icons.star,
                      color: Colors.amber,
                      size: 14.sp,
                    ),
                    SizedBox(width: 4.w),
                    Text(
                      '${master['rating']}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Icon(
                      Icons.work,
                      color: Colors.white.withValues(alpha: 0.7),
                      size: 14.sp,
                    ),
                    SizedBox(width: 4.w),
                    Text(
                      '${master['ordersCount']} заказов',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12.sp,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Кнопка действия
          IconButton(
            onPressed: () {
              Navigator.pushNamed(context, '/master-profile', arguments: master['id']);
            },
            icon: Icon(
              Icons.arrow_forward_ios,
              color: Colors.white.withValues(alpha: 0.7),
              size: 16.sp,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: (index * 100).ms).slideX(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 80.sp,
            color: Colors.white.withOpacity(0.3),
          ),
          SizedBox(height: 24.h),
          Text(
            message,
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Попробуйте изменить поисковый запрос',
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
            'Ошибка поиска',
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
            onPressed: _performSearch,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: Text(
              'Повторить',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _performSearch() {
    // TODO: Выполнить поиск через API
    ref.read(videoProvider.notifier).searchVideos(_searchQuery);
    ref.read(orderProvider.notifier).searchOrders(_searchQuery);
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  String _formatDate(DateTime dateTime) {
    return '${dateTime.day}.${dateTime.month}.${dateTime.year}';
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return Colors.green;
      case 'completed':
        return Colors.blue;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Активна';
      case 'completed':
        return 'Выполнена';
      case 'cancelled':
        return 'Отменена';
      default:
        return 'В работе';
    }
  }

  List<Map<String, dynamic>> _getMockMasters() {
    return [
      {
        'id': 'master1',
        'name': 'Алексей Мебельщик',
        'description': 'Профессиональный мастер по изготовлению мебели',
        'avatar': 'https://picsum.photos/100/100?random=1',
        'rating': 4.8,
        'ordersCount': 89,
        'isVerified': true,
      },
      {
        'id': 'master2',
        'name': 'Мария Дизайнер',
        'description': 'Дизайнер интерьеров с большим опытом',
        'avatar': 'https://picsum.photos/100/100?random=2',
        'rating': 4.9,
        'ordersCount': 156,
        'isVerified': true,
      },
      {
        'id': 'master3',
        'name': 'Дмитрий Мастер',
        'description': 'Мастер по ремонту и реставрации мебели',
        'avatar': 'https://picsum.photos/100/100?random=3',
        'rating': 4.7,
        'ordersCount': 67,
        'isVerified': false,
      },
    ];
  }
}
