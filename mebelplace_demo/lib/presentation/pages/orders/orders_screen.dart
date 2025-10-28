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

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    // Загружаем заказы
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      if (user != null) {
        if (user.role == 'master') {
          ref.read(orderProvider.notifier).loadOrders(); // Все заказы для мастера
        } else {
          ref.read(orderProvider.notifier).loadUserOrders(); // Мои заказы для клиента
        }
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
    final user = authState.user;
    final isMaster = user?.role == 'master';

    return Scaffold(
      backgroundColor: AppColors.dark,
      body: SafeArea(
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
                Tab(text: 'Активные'),
                Tab(text: 'В работе'),
                Tab(text: 'Завершенные'),
              ],
            ),
            
            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildOrdersList('active'),
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
    );
  }

  Widget _buildOrdersList(String status) {
    final orderState = ref.watch(orderProvider);
    final isLoading = orderState.isLoading;
    final orders = orderState.orders;
    
    // Фильтруем заказы по статусу
    final filteredOrders = orders.where((order) {
      switch (status) {
        case 'active':
          return order.status == 'pending' || order.status == 'active';
        case 'in_progress':
          return order.status == 'in_progress' || order.status == 'processing';
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
    return _buildOrderCardUI(
      index: index,
      status: status,
      statusLabel: _getStatusLabel(order.status),
      statusColor: _getStatusColor(order.status),
      title: order.title,
      description: order.description ?? '',
      location: order.location ?? 'Не указано',
      budget: '0', // TODO: Add budget field to OrderModel if available
      time: _formatTime(order.createdAt),
      responseCount: 0, // TODO: Add responsesCount field to OrderModel if available
      orderId: order.id,
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
    required String budget,
    required String time,
    required int responseCount,
    required String orderId,
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
        child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withOpacity(0.1),
              Colors.white.withOpacity(0.05),
            ],
          ),
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
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
                      SizedBox(width: 16.w),
                      Icon(
                        Icons.attach_money_rounded,
                        size: 16.sp,
                        color: AppColors.primary,
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        '$budget ₸',
                        style: TextStyle(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
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
                ],
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
            // TODO: Add filter options
            Text(
              'Фильтры в разработке',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }
}
