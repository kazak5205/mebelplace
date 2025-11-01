import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/order_response_model.dart';
import '../../../data/models/order_model.dart';
import '../../../data/datasources/api_service.dart';
import '../../providers/app_providers.dart';
import '../../providers/repository_providers.dart';
import '../../widgets/loading_widget.dart';

class OrderResponsesPage extends ConsumerStatefulWidget {
  final String orderId;
  
  const OrderResponsesPage({
    super.key,
    required this.orderId,
  });

  @override
  ConsumerState<OrderResponsesPage> createState() => _OrderResponsesPageState();
}

class _OrderResponsesPageState extends ConsumerState<OrderResponsesPage> {
  @override
  void initState() {
    super.initState();
    // Загружаем отклики на заявку и заказ
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(orderProvider.notifier).loadOrderResponses(widget.orderId);
      ref.read(orderProvider.notifier).loadOrderDetail(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(orderProvider);
    
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
          'Отклики мастеров',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: orderState.isLoading
          ? const Center(child: LoadingWidget())
          : orderState.error != null
              ? _buildErrorWidget(orderState.error!)
              : _buildResponsesList(orderState.orderResponses, orderState.currentOrder),
    );
  }

  Widget _buildResponsesList(List<OrderResponse> responses, OrderModel? order) {
    if (responses.isEmpty) {
      return _buildEmptyState();
    }

    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: responses.length,
      itemBuilder: (context, index) {
        return _buildResponseCard(responses[index], index, order);
      },
    );
  }

  Widget _buildResponseCard(OrderResponse response, int index, OrderModel? order) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16.r),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12.0, sigmaY: 12.0),
        child: Container(
          margin: EdgeInsets.only(bottom: 16.h),
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16.r),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.2),
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
          child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Информация о мастере
          _buildMasterInfo(response),
          
          SizedBox(height: 8.h), // ✅ Уменьшен отступ
          
          // Сообщение мастера (без рамки)
          Text(
            response.message,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14.sp,
              height: 1.4,
            ),
            maxLines: 3, // ✅ Ограничиваем высоту текста
            overflow: TextOverflow.ellipsis,
          ),
          
          SizedBox(height: 8.h), // ✅ Уменьшен отступ
          
          // Цена и сроки
          _buildPriceAndTimeline(response),
          
          SizedBox(height: 8.h), // ✅ Уменьшен отступ
          
          // Действия
          _buildActions(response, order),
        ],
      ),
    ),
      ),
        ).animate().fadeIn(duration: 300.ms, delay: (index * 100).ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildMasterInfo(OrderResponse response) {
    return Row(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/master-profile', arguments: response.masterId);
          },
          child: CircleAvatar(
            radius: 24.r,
            backgroundColor: AppColors.primary,
            backgroundImage: response.masterAvatar != null 
              ? NetworkImage(response.masterAvatar!)
              : null,
            child: response.masterAvatar == null 
              ? Text(
                  response.masterName != null && response.masterName!.isNotEmpty
                      ? response.masterName![0].toUpperCase()
                      : 'M',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                  ),
                )
              : null,
          ),
        ),
        
        SizedBox(width: 12.w),
        
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                response.master?.displayName ?? response.masterName ?? 'Мастер ${response.masterId}',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 4.h),
              Row(
                children: [
                  Icon(Icons.star, color: Colors.yellow, size: 16.sp),
                  SizedBox(width: 4.w),
                  Text(
                    _formatRating(response.masterRating ?? response.master?.rating),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 12.sp,
                    ),
                  ),
                  if (_getReviewsCount(response) > 0) ...[
                    SizedBox(width: 8.w),
                    Text(
                      '•',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6),
                        fontSize: 12.sp,
                      ),
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      '${_getReviewsCount(response)} ${_pluralizeReviews(_getReviewsCount(response))}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6),
                        fontSize: 12.sp,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
        
        // Дата справа
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Предложено',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.6),
                fontSize: 12.sp,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              _formatTime(response.createdAt),
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.4),
                fontSize: 12.sp,
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inHours < 1) {
      return 'только что';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}ч назад';
    } else {
      return '${date.day}.${date.month}';
    }
  }

  String _formatRating(double? rating) {
    if (rating == null || rating <= 0) {
      return '—'; // Если рейтинга нет, показываем прочерк
    }
    return rating.toStringAsFixed(1);
  }

  int _getReviewsCount(OrderResponse response) {
    // Пытаемся получить количество отзывов из master объекта или из response
    // TODO: Добавить reviewsCount в OrderResponse модель, когда бэкенд будет возвращать это поле
    // Пока что возвращаем 0, так как бэкенд не отправляет это поле
    return 0;
  }

  String _pluralizeReviews(int count) {
    if (count % 10 == 1 && count % 100 != 11) {
      return 'отзыв';
    } else if ([2, 3, 4].contains(count % 10) && ![12, 13, 14].contains(count % 100)) {
      return 'отзыва';
    } else {
      return 'отзывов';
    }
  }

  Widget _buildPriceAndTimeline(OrderResponse response) {
    return Wrap(
      spacing: 16.w,
      runSpacing: 8.h,
      children: [
        if (response.price != null && response.price! > 0)
          Text(
            'Цена: ${response.price!.toStringAsFixed(0)} ₸',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
        if (response.deadline != null)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.schedule, color: Colors.white.withValues(alpha: 0.7), size: 16.sp),
              SizedBox(width: 4.w),
              Text(
                DateFormat('dd.MM.yyyy').format(response.deadline!),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 14.sp,
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildActions(OrderResponse response, OrderModel? order) {
    final authState = ref.watch(authProvider);
    final currentUser = authState.user;
    final isOrderOwner = currentUser != null && order != null && currentUser.id == order.clientId;
    final isClient = currentUser?.role == 'user';
    final isMaster = currentUser?.role == 'master';
    
    // ✅ Кнопки только для клиента-владельца заявки (как на вебе строка 271)
    if (!isMaster && isClient && isOrderOwner) {
      // Компактное расположение кнопок в одну строку с минимальным padding
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: () {
                _showAcceptDialog(response);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 8.h), // ✅ Уменьшен padding
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
              child: Text(
                'Принять',
                style: TextStyle(fontSize: 11.sp), // ✅ Уменьшен шрифт
                textAlign: TextAlign.center,
              ),
            ),
          ),
          
          SizedBox(width: 6.w), // ✅ Уменьшен отступ
          
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/chat', arguments: response.masterId);
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 8.h), // ✅ Уменьшен padding
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
              child: Text(
                'Написать',
                style: TextStyle(fontSize: 11.sp), // ✅ Уменьшен шрифт
                textAlign: TextAlign.center,
              ),
            ),
          ),
          
          SizedBox(width: 6.w), // ✅ Уменьшен отступ
          
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/master-profile', arguments: response.masterId);
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 8.h), // ✅ Уменьшен padding
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
              child: Text(
                'Профиль',
                style: TextStyle(fontSize: 11.sp), // ✅ Уменьшен шрифт
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      );
    } else {
      // Для мастера и других пользователей показываем только "Профиль мастера"
      return Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          OutlinedButton(
            onPressed: () {
              Navigator.pushNamed(context, '/master-profile', arguments: response.masterId);
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            child: const Text('Профиль мастера'),
          ),
        ],
      );
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox_outlined,
            size: 80.sp,
            color: Colors.white.withValues(alpha: 0.3),
          ),
          SizedBox(height: 24.h),
          Text(
            'Пока нет откликов',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Мастера еще не оставили предложения\nпо вашей заявке',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24.h),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
            },
            icon: Icon(Icons.arrow_back, size: 18.sp),
            label: const Text('Назад к заявке'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
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
            'Ошибка загрузки откликов',
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
              ref.read(orderProvider.notifier).loadOrderResponses(widget.orderId);
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

  void _showAcceptDialog(OrderResponse response) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.dark,
        title: const Text(
          'Принять предложение?',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Вы уверены, что хотите принять предложение от ${response.masterName ?? 'мастера'}?',
          style: TextStyle(color: Colors.white.withValues(alpha: 0.8)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Отмена', style: TextStyle(color: Colors.white.withValues(alpha: 0.7))),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              
              // ✅ РЕАЛЬНОЕ ПРИНЯТИЕ ЧЕРЕЗ API
              try {
                final apiService = ref.read(apiServiceProvider);
                final request = AcceptRequest(responseId: response.id);
                final apiResponse = await apiService.acceptResponse(widget.orderId, request);
                
                if (apiResponse.success && apiResponse.data != null) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(apiResponse.message ?? 'Предложение принято!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                    // Обновить заказ
                    ref.read(orderProvider.notifier).loadUserOrders();
                    Navigator.pop(context);
                  }
                } else {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(apiResponse.message ?? 'Ошибка принятия'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Ошибка: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
            ),
            child: const Text('Принять', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

}
