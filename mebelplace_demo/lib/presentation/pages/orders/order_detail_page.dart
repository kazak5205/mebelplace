import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_helper.dart';
import '../../../data/models/order_model.dart';
import '../../providers/app_providers.dart';
import '../../widgets/loading_widget.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  final String orderId;
  
  const OrderDetailPage({
    super.key,
    required this.orderId,
  });

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  @override
  void initState() {
    super.initState();
    // Загружаем детали заявки
    WidgetsBinding.instance.addPostFrameCallback((_) {
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
          'Детали заявки',
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
            onPressed: () => _shareOrder(),
          ),
        ],
      ),
      body: orderState.isLoading
          ? const Center(child: LoadingWidget())
          : orderState.error != null
              ? _buildErrorWidget(orderState.error!)
              : _buildOrderDetail(orderState.currentOrder ?? OrderModel(
                  id: widget.orderId,
                  title: 'Заявка не найдена',
                  description: '',
                  category: 'unknown',
                  clientId: 'unknown',
                  price: 0,
                  status: 'unknown',
                  createdAt: DateTime.now(),
                  images: [],
                  responseCount: 0,
                  hasMyResponse: false,
                )),
    );
  }

  Widget _buildOrderDetail(OrderModel order) {
    final authState = ref.watch(authProvider);
    final currentUser = authState.user;
    final isOwner = currentUser?.id == order.clientId;
    
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Заголовок и статус
          _buildHeader(order),
          
          SizedBox(height: 24.h),
          
          // Описание
          _buildDescription(order),
          
          SizedBox(height: 24.h),
          
          // Цена и детали заказа
          if (order.price != null && order.price! > 0) ...[
            _buildOrderDetails(order),
            SizedBox(height: 24.h),
          ],
          
          // Изображения
          if (order.images.isNotEmpty) ...[
            _buildImages(order),
            SizedBox(height: 24.h),
          ],
          
          // Информация о заказчике - НЕ показываем владельцу (как на вебе)
          // Заказчику показываем кнопку "Написать мастеру" вместо информации о себе
          if (!isOwner && order.client != null) ...[
            _buildCustomerInfo(order),
            SizedBox(height: 24.h),
          ],
          
          // Действия
          _buildActions(order),
          
          // Отклики - только для владельца
          // (кнопка уже в _buildActions для владельца)
        ],
      ),
    );
  }

  Widget _buildHeader(OrderModel order) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
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
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _buildStatusChip(order.status),
            ],
          ),
          
          SizedBox(height: 8.h),
          
          Text(
            'Создано: ${_formatDate(order.createdAt)}',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 12.sp,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildStatusChip(String status) {
    Color statusColor;
    String statusText;
    
    switch (status.toLowerCase()) {
      case 'active':
        statusColor = Colors.green;
        statusText = 'Активна';
        break;
      case 'completed':
        statusColor = Colors.blue;
        statusText = 'Выполнена';
        break;
      case 'cancelled':
        statusColor = Colors.red;
        statusText = 'Отменена';
        break;
      default:
        statusColor = Colors.orange;
        statusText = 'В работе';
    }
    
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: statusColor.withValues(alpha: 0.5)),
      ),
      child: Text(
        statusText,
        style: TextStyle(
          color: statusColor,
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildDescription(OrderModel order) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Описание',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            order.description,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14.sp,
              height: 1.5,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: 100.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildOrderDetails(OrderModel order) {
    return Container(
      padding: EdgeInsets.all(20.w),
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
          if (order.price != null && order.price! > 0) ...[
            Row(
              children: [
                Text('₸', style: TextStyle(color: Colors.green, fontSize: 16.sp, fontWeight: FontWeight.w600)),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Бюджет',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12.sp,
                        ),
                      ),
                      Text(
                        '${(order.price ?? 0).toStringAsFixed(0)} ₸',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (order.deadline != null) SizedBox(height: 16.h),
          ],
          if (order.deadline != null) ...[
            Row(
              children: [
                Icon(Icons.schedule, color: Colors.blue, size: 20.sp),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Срок',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12.sp,
                        ),
                      ),
                      Text(
                        _formatDate(order.deadline!),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (order.region != null || order.location != null) SizedBox(height: 16.h),
          ],
          if (order.region != null) ...[
            Row(
              children: [
                Icon(Icons.location_on, color: Colors.orange, size: 20.sp),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Регион',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12.sp,
                        ),
                      ),
                      Text(
                        order.region!,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (order.location != null) SizedBox(height: 16.h),
          ],
          if (order.location != null) ...[
            Row(
              children: [
                Icon(Icons.place, color: Colors.purple, size: 20.sp),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Город',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12.sp,
                        ),
                      ),
                      Text(
                        order.location!,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: 200.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildImages(OrderModel order) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Фотографии',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 12.h),
          SizedBox(
            height: 120.h,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: order.images.length,
              itemBuilder: (context, index) {
                return Container(
                  margin: EdgeInsets.only(right: 12.w),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12.r),
                    child: Image.network(
                      ImageHelper.getFullImageUrl(order.images[index]),
                      width: 120.w,
                      height: 120.h,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 120.w,
                          height: 120.h,
                          color: Colors.white.withValues(alpha: 0.1),
                          child: Icon(
                            Icons.image,
                            color: Colors.white.withValues(alpha: 0.5),
                            size: 32.sp,
                          ),
                        );
                      },
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: 300.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildCustomerInfo(OrderModel order) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Написать мастеру',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 16.h),
          
          _buildInfoRow(Icons.person, 'Имя', order.customerName ?? 'Не указано'),
          SizedBox(height: 12.h),
          
          _buildInfoRow(Icons.phone, 'Телефон', order.customerPhone ?? 'Не указан'),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: 400.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppColors.primary,
          size: 20.sp,
        ),
        SizedBox(width: 12.w),
        Text(
          '$label: ',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 14.sp,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              color: Colors.white,
              fontSize: 14.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(OrderModel order) {
    final authState = ref.watch(authProvider);
    final currentUser = authState.user;
    final isOwner = currentUser?.id == order.clientId;
    final isMaster = currentUser?.role == 'master';
    
    // ✅ Вычисляем hasMyResponse если не пришло с бэкенда (fallback на клиенте)
    final hasMyResponse = order.hasMyResponse || 
        (order.responses != null && order.responses!.isNotEmpty && 
         order.responses!.any((resp) => resp['master_id'] == currentUser?.id));
    
    // ✅ Логика как на вебе: canRespond = isMaster && status pending && !hasMyResponse
    final canRespond = isMaster && order.status == 'pending' && !hasMyResponse;

    return Row(
      children: [
        // Кнопка "Просмотреть отклики" для владельца
        // Веб показывает по order.responses.length, на мобиле fallback к responseCount, если responses не загружены
        if (isOwner && ((order.responses != null && order.responses!.isNotEmpty) || order.responseCount > 0))
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, '/order-responses', arguments: order.id);
              },
              icon: Icon(Icons.visibility, size: 18.sp),
              label: Text('Отклики (' +
                  ((order.responses != null) ? order.responses!.length.toString() : order.responseCount.toString()) +
                  ')'),
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
        
        // Кнопка "Откликнуться" только если может
        if (canRespond)
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, '/order-respond', arguments: order.id);
              },
              icon: Icon(Icons.reply, size: 18.sp),
              label: const Text('Откликнуться'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
            ),
          ),
        
        // Статус "Вы уже откликнулись" - как на вебе, только текст без действий
        if (isMaster && hasMyResponse) ...[
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 16.h),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle, color: Colors.green[300], size: 18.sp),
                  SizedBox(width: 8.w),
                  Text(
                    'Вы уже откликнулись',
                    style: TextStyle(
                      color: Colors.green[300],
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    ).animate().fadeIn(duration: 300.ms, delay: 500.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
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
            'Ошибка загрузки заявки',
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
              ref.read(orderProvider.notifier).loadOrderDetail(widget.orderId);
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

  String _formatDate(DateTime dateTime) {
    return '${dateTime.day}.${dateTime.month}.${dateTime.year}';
  }

  void _shareOrder() {
    final orderState = ref.read(orderProvider);
    final order = orderState.currentOrder;
    if (order != null) {
      Share.share(
        'Заявка: ${order.title}\n\n${order.description}\n\nhttps://mebelplace.com.kz/orders/${order.id}',
        subject: 'Заявка на MebelPlace',
      );
    }
  }
}
