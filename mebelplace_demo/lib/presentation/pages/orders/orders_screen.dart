import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/app_providers.dart';
import '../../widgets/swipeable_card.dart';
import '../../widgets/skeleton_loading.dart';
import '../../../utils/haptic_helper.dart';
import '../../../data/models/order_model.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_animate/flutter_animate.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _showWelcomeModal = false;
  
  // Фильтры
  String? _selectedCategory;
  String? _selectedRegion;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    // Загружаем заказы
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      if (user != null) {
        if (user.role == 'master') {
          ref.read(orderProvider.notifier).loadOrders(); // Все заказы для мастера
          _checkWelcomeModal(); // Проверяем, нужно ли показать welcome модал
        } else {
          ref.read(orderProvider.notifier).loadUserOrders(); // Мои заказы для клиента
        }
      }
    });
  }

  Future<void> _checkWelcomeModal() async {
    final prefs = await SharedPreferences.getInstance();
    final hasSeenWelcome = prefs.getBool('hasSeenOrdersWelcome') ?? false;
    if (!hasSeenWelcome) {
      setState(() {
        _showWelcomeModal = true;
      });
    }
  }

  Future<void> _closeWelcomeModal() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('hasSeenOrdersWelcome', true);
    setState(() {
      _showWelcomeModal = false;
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
    final user = authState.user;
    final isMaster = user?.role == 'master';

    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppColors.dark,
          body: SafeArea(
            top: true,
            bottom: false, // Убираем SafeArea снизу чтобы не было полупрозрачного бара
        child: Column(
          children: [
            // Header
            Padding(
              padding: EdgeInsets.all(16.w),
              child: Row(
                children: [
                  Text(
                    isMaster ? 'Все заявки' : 'Мои заказы',
                    style: TextStyle(
                      fontSize: 24.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: Icon(
                      Icons.filter_list_rounded,
                      color: Colors.white,
                      size: 24.sp,
                    ),
                    onPressed: () {
                      HapticHelper.lightImpact(); // ✨ Вибрация
                      _showFilterDialog();
                    },
                  ),
                ],
              ),
            ),
            
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
              tabs: const [
                Tab(text: 'Новые'),
                Tab(text: 'Отвеченные'),
                Tab(text: 'В работе'),
                Tab(text: 'Завершенные'),
              ],
            ),
            
            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildOrdersList('new'),
                  _buildOrdersList('answered'),
                  _buildOrdersList('in_progress'),
                  _buildOrdersList('completed'),
                ],
              ),
            ),
          ],
        ),
      ),
      
      // FAB для создания заказа (только для клиентов)
      floatingActionButton: !isMaster
          ? TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 200),
              tween: Tween(begin: 1.0, end: 1.0),
              builder: (context, scale, child) {
                return Transform.scale(
                  scale: scale,
                  child: FloatingActionButton.extended(
                    onPressed: () {
                      HapticHelper.mediumImpact(); // ✨ Вибрация
                      Navigator.pushNamed(context, '/create-order');
                    },
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    label: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 20.w,
                        vertical: 12.h,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.secondary],
                        ),
                        borderRadius: BorderRadius.circular(30.r),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.add_rounded,
                            color: Colors.white,
                            size: 20.sp,
                          ),
                          SizedBox(width: 8.w),
                          Text(
                            'Создать заказ',
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            )
          : null,
        ),
        
        // Welcome модал для мастеров
        if (_showWelcomeModal && isMaster)
          _buildWelcomeModal(),
      ],
    );
  }

  Widget _buildOrdersList(String status) {
    final orderState = ref.watch(orderProvider);
    final isLoading = orderState.isLoading;
    final orders = orderState.orders;
    
    // Фильтруем заказы по статусу
    final filteredOrders = orders.where((order) {
      switch (status) {
        case 'new':
          // Новые: без откликов в активных статусах
          final active = order.status == 'pending' || order.status == 'active';
          return active && (order.responseCount == null || order.responseCount == 0);
        case 'answered':
          // Отвеченные: есть отклики в активных статусах
          final active = order.status == 'pending' || order.status == 'active';
          return active && (order.responseCount != null && order.responseCount! > 0);
        case 'in_progress':
          return order.status == 'in_progress' || order.status == 'processing' || order.status == 'accepted';
        case 'completed':
          return order.status == 'completed' || order.status == 'done';
        default:
          return true;
      }
    }).toList();

    if (isLoading) {
      // Skeleton loading
      return ListView.builder(
        padding: EdgeInsets.all(16.w),
        itemCount: 5,
        itemBuilder: (context, index) {
          return const SkeletonOrderCard();
        },
      );
    }

    if (filteredOrders.isEmpty) {
      return _buildEmptyState(status);
    }

    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: filteredOrders.length,
      itemBuilder: (context, index) {
        return _buildOrderCardFromModel(filteredOrders[index], index, status);
      },
    );
  }

  Widget _buildEmptyState(String status) {
    String message;
    IconData icon;
    
    switch (status) {
      case 'active':
        message = 'Нет активных заказов';
        icon = Icons.inbox_outlined;
        break;
      case 'in_progress':
        message = 'Нет заказов в работе';
        icon = Icons.work_outline_rounded;
        break;
      case 'completed':
        message = 'Нет завершенных заказов';
        icon = Icons.check_circle_outline_rounded;
        break;
      default:
        message = 'Нет заказов';
        icon = Icons.inbox_outlined;
    }

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
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Заказы появятся здесь',
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.white.withOpacity(0.3),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCardFromModel(OrderModel order, int index, String status) {
    // Формируем строку местоположения: "Регион, Город" или только город
    String locationText = '';
    if (order.region != null && order.region!.isNotEmpty) {
      locationText = order.region!;
      if (order.location != null && order.location!.isNotEmpty) {
        locationText += ', ${order.location}';
      }
    } else if (order.location != null && order.location!.isNotEmpty) {
      locationText = order.location!;
    } else {
      locationText = 'Не указано';
    }
    
    return _buildOrderCardUI(
      index: index,
      status: status,
      statusLabel: _getStatusLabel(order.status),
      statusColor: _getStatusColor(order.status),
      title: order.title,
      description: order.description ?? '',
      location: locationText,
      time: _formatTime(order.createdAt),
      responseCount: order.responseCount, // ✅ Реальное количество откликов из API
      orderId: order.id,
      hasMyResponse: order.hasMyResponse, // ✅ Передаём статус своего отклика
    );
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'pending':
      case 'active':
        return 'Новый';
      case 'in_progress':
      case 'processing':
        return 'В работе';
      case 'completed':
      case 'done':
        return 'Завершен';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
      case 'active':
        return AppColors.primary;
      case 'in_progress':
      case 'processing':
        return Colors.orange;
      case 'completed':
      case 'done':
        return Colors.green;
      default:
        return AppColors.primary;
    }
  }

  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return 'недавно';
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes} мин назад';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} ч назад';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} дн назад';
    } else {
      return DateFormat('dd.MM.yyyy').format(dateTime);
    }
  }

  Widget _buildOrderCardUI({
    required int index,
    required String status,
    required String statusLabel,
    required Color statusColor,
    required String title,
    required String description,
    required String location,
    required String time,
    required int responseCount,
    required String orderId,
    required bool hasMyResponse,
  }) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isMaster = user?.role == 'master';
    
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 300 + (index * 50)),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 50 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: SwipeableCard(
        onDelete: status != 'completed' ? () {
          HapticHelper.success();
          _showDeleteConfirmation(index);
        } : null,
        onArchive: status == 'completed' ? () {
          HapticHelper.success();
          _showArchiveConfirmation(index);
        } : null,
        deleteColor: Colors.red,
        archiveColor: Colors.orange,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20.r),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 12.0, sigmaY: 12.0),
            child: Container(
              margin: EdgeInsets.only(bottom: 16.h),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 32,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Material(
          color: Colors.transparent,
            child: InkWell(
            onTap: () {
              HapticHelper.lightImpact(); // ✨ Вибрация
              Navigator.pushNamed(context, '/order-detail', arguments: orderId);
            },
            borderRadius: BorderRadius.circular(20.r),
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 6.h,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [statusColor, statusColor.withOpacity(0.7)],
                          ),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          statusLabel,
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        time,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                    ],
                  ),
                  
                  SizedBox(height: 12.h),
                  
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  
                  SizedBox(height: 8.h),
                  
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: Colors.white.withOpacity(0.7),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  
                  SizedBox(height: 16.h),
                  
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 16.sp,
                        color: AppColors.primary,
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        location,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      const Spacer(),
                      if (responseCount > 0) ...[
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 16.sp,
                          color: Colors.white.withOpacity(0.5),
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          '$responseCount',
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ],
                  ),
                  
                  // Кнопка "Просмотреть отклики" для всех (как на вебе строка 365)
                  if (responseCount > 0) ...[
                    SizedBox(height: 12.h),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pushNamed(context, '/order-responses', arguments: orderId);
                      },
                      icon: Icon(Icons.visibility, size: 18.sp),
                      label: Text('Отклики ($responseCount)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 12.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                    ),
                  ],
                  
                  // ✅ Status "Отклик отправлен" для мастера (как на вебе строка 385-392)
                  if (isMaster && hasMyResponse && status == 'new' && responseCount == 0) ...[
                    SizedBox(height: 12.h),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8.r),
                        border: Border.all(color: Colors.green.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 16.sp,
                          ),
                          SizedBox(width: 6.w),
                          Text(
                            'Отклик отправлен',
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: Colors.green,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
          ),
        ),
      ),
    );
  }

  void _showDeleteConfirmation(int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.darkSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
        title: Text(
          'Удалить заказ?',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Text(
          'Это действие нельзя отменить',
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 14.sp,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              HapticHelper.lightImpact();
              Navigator.pop(context);
            },
            child: Text(
              'Отмена',
              style: TextStyle(color: Colors.white.withOpacity(0.7)),
            ),
          ),
          TextButton(
            onPressed: () {
              HapticHelper.success();
              Navigator.pop(context);
              // TODO: Delete order
            },
            child: const Text(
              'Удалить',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  void _showArchiveConfirmation(int index) {
    HapticHelper.success();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Заказ архивирован'),
        backgroundColor: Colors.orange,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
      ),
    );
    // TODO: Archive order
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
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
              'Фильтры',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 24.h),
            
            // Категория
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Категория',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
            SizedBox(height: 8.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: ['Все', 'Кухни', 'Шкафы', 'Столы', 'Стулья', 'Кровати', 'Гостиные', 'Детская', 'Офисная'].map((cat) {
                final isSelected = (_selectedCategory == cat) || (cat == 'Все' && _selectedCategory == null);
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedCategory = cat == 'Все' ? null : cat;
                    });
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20.r),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : Colors.white.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      cat,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: Colors.white,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            
            SizedBox(height: 24.h),
            
            // Регион
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Регион',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
            SizedBox(height: 8.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: ['Все', 'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'].map((region) {
                final isSelected = (_selectedRegion == region) || (region == 'Все' && _selectedRegion == null);
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedRegion = region == 'Все' ? null : region;
                    });
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20.r),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : Colors.white.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      region,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: Colors.white,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            
            SizedBox(height: 32.h),
            
            // Кнопки
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      setState(() {
                        _selectedCategory = null;
                        _selectedRegion = null;
                      });
                    },
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 16.h),
                      side: BorderSide(color: Colors.white.withOpacity(0.3)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                    ),
                    child: Text(
                      'Сбросить',
                      style: TextStyle(color: Colors.white, fontSize: 14.sp),
                    ),
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      ref.read(orderProvider.notifier).loadOrders();
                    },
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 16.h),
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                    ),
                    child: Text(
                      'Применить',
                      style: TextStyle(color: Colors.white, fontSize: 14.sp, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 12.h),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeModal() {
    return Container(
      color: Colors.black.withOpacity(0.8),
      child: Center(
        child: Container(
          margin: EdgeInsets.symmetric(horizontal: 24.w),
          padding: EdgeInsets.all(24.w),
          decoration: BoxDecoration(
            color: AppColors.dark,
            borderRadius: BorderRadius.circular(20.r),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 30,
                spreadRadius: 5,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Кнопка закрытия
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: _closeWelcomeModal,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),
              
              // Иконка
              Container(
                width: 80.w,
                height: 80.w,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.video_library_rounded,
                  color: Colors.white,
                  size: 40.sp,
                ),
              ),
              
              SizedBox(height: 16.h),
              
              // Заголовок
              Text(
                'Добро пожаловать на MebelPlace! 👋',
                style: TextStyle(
                  fontSize: 24.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              
              SizedBox(height: 8.h),
              
              Text(
                'Начните принимать заказы от клиентов',
                style: TextStyle(
                  fontSize: 16.sp,
                  color: Colors.white.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              
              SizedBox(height: 24.h),
              
              // Карточка 1: Отвечайте на заявки
              Container(
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(
                    color: Colors.blue.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Colors.blue.shade400,
                      size: 24.sp,
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Отвечайте на заявки',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            'Вы можете отвечать на заявки клиентов и получать заказы уже сейчас!',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              SizedBox(height: 12.h),
              
              // Карточка 2: Важно - Загрузите видеорекламу
              Container(
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: Colors.yellow.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(
                    color: Colors.yellow.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.video_library,
                      color: Colors.yellow.shade400,
                      size: 24.sp,
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '⚠️ Важно: Загрузите видеорекламу',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          RichText(
                            text: TextSpan(
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: Colors.white.withOpacity(0.7),
                              ),
                              children: [
                                const TextSpan(
                                  text: 'Пока вы не загрузите хотя бы одну видеорекламу с вашими работами, ',
                                ),
                                TextSpan(
                                  text: 'клиенты не смогут найти ваш профиль в поиске',
                                  style: TextStyle(
                                    color: Colors.yellow.shade300,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const TextSpan(
                                  text: '.',
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            'Видеореклама помогает клиентам увидеть качество вашей работы и принять решение о заказе. Загружайте короткие ролики с примерами ваших работ.',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              SizedBox(height: 24.h),
              
              // Кнопки
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () {
                        _closeWelcomeModal();
                        Navigator.pushNamed(context, '/create-video');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.secondary],
                          ),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.video_library, color: Colors.white),
                            SizedBox(width: 8.w),
                            Text(
                              'Создать видеорекламу',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _closeWelcomeModal,
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        side: BorderSide(
                          color: Colors.white.withOpacity(0.2),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                      child: Text(
                        'Позже',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              
              SizedBox(height: 16.h),
              
              // Подсказка
              Text(
                'Вы всегда можете создать видеорекламу через кнопку "+" в нижней панели навигации',
                style: TextStyle(
                  fontSize: 12.sp,
                  color: Colors.white.withOpacity(0.5),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0),
        ),
      ),
    ).animate().fadeIn(duration: 200.ms);
  }
}
