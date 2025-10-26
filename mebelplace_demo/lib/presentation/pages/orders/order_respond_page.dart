import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/order_model.dart';

class OrderRespondPage extends ConsumerStatefulWidget {
  final String orderId;
  
  const OrderRespondPage({
    super.key,
    required this.orderId,
  });

  @override
  ConsumerState<OrderRespondPage> createState() => _OrderRespondPageState();
}

class _OrderRespondPageState extends ConsumerState<OrderRespondPage> {
  final _formKey = GlobalKey<FormState>();
  final _proposalController = TextEditingController();
  final _priceController = TextEditingController();
  final _timelineController = TextEditingController();
  
  bool _isSubmitting = false;
  OrderModel? _order;

  @override
  void initState() {
    super.initState();
    // Загружаем информацию о заявке
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadOrderDetails();
    });
  }

  @override
  void dispose() {
    _proposalController.dispose();
    _priceController.dispose();
    _timelineController.dispose();
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
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Отклик на заявку',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: _isSubmitting 
        ? _buildSubmittingState()
        : _buildRespondForm(),
    );
  }

  Widget _buildRespondForm() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Информация о заявке
            if (_order != null) ...[
              _buildOrderInfo(),
              SizedBox(height: 24.h),
            ],
            
            // Форма отклика
            _buildResponseForm(),
            
            SizedBox(height: 32.h),
            
            // Кнопка отправки
            _buildSubmitButton(),
            
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderInfo() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withValues(alpha: 0.1),
            AppColors.secondary.withValues(alpha: 0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Заявка',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          
          SizedBox(height: 12.h),
          
          Text(
            _order!.title,
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          SizedBox(height: 8.h),
          
          Text(
            _order!.description,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14.sp,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Icon(
                Icons.attach_money,
                color: AppColors.primary,
                size: 16.sp,
              ),
              SizedBox(width: 4.w),
              Text(
                'Бюджет: ${_order!.price} ₸',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Text(
                _formatDate(_order!.createdAt),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontSize: 12.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildResponseForm() {
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
            'Ваше предложение',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Предложение
          _buildTextField(
            controller: _proposalController,
            label: 'Описание вашего предложения',
            hint: 'Опишите как вы планируете выполнить заказ, какие материалы будете использовать, сроки работы...',
            icon: Icons.description,
            maxLines: 4,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Введите описание предложения';
              }
              if (value.length < 20) {
                return 'Описание должно содержать минимум 20 символов';
              }
              return null;
            },
          ),
          
          SizedBox(height: 20.h),
          
          // Цена и сроки
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _priceController,
                  label: 'Ваша цена',
                  hint: '0',
                  icon: Icons.attach_money,
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Введите цену';
                    }
                    final price = int.tryParse(value);
                    if (price == null || price <= 0) {
                      return 'Введите корректную цену';
                    }
                    return null;
                  },
                ),
              ),
              
              SizedBox(width: 16.w),
              
              Expanded(
                child: _buildTextField(
                  controller: _timelineController,
                  label: 'Срок (дни)',
                  hint: '0',
                  icon: Icons.schedule,
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Введите срок';
                    }
                    final days = int.tryParse(value);
                    if (days == null || days <= 0) {
                      return 'Введите корректный срок';
                    }
                    return null;
                  },
                ),
              ),
            ],
          ),
          
          SizedBox(height: 20.h),
          
          // Дополнительная информация
          Container(
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: Colors.blue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(
                color: Colors.blue.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: Colors.blue,
                  size: 20.sp,
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Text(
                    'Ваше предложение будет отправлено заказчику. Он сможет принять или отклонить его.',
                    style: TextStyle(
                      color: Colors.blue,
                      fontSize: 12.sp,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms, delay: 200.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white,
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 8.h),
        TextFormField(
          controller: controller,
          style: TextStyle(color: Colors.white, fontSize: 14.sp),
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
              fontSize: 14.sp,
            ),
            prefixIcon: Icon(icon, color: AppColors.primary, size: 20.sp),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
            contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _submitResponse,
        icon: const Icon(Icons.send, size: 18.sp),
        label: const Text('Отправить предложение'),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(vertical: 16.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms, delay: 400.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildSubmittingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            strokeWidth: 3,
          ),
          const SizedBox(height: 24.h),
          Text(
            'Отправляем предложение...',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Пожалуйста, подождите',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _loadOrderDetails() async {
    try {
      // TODO: Загрузить детали заявки через API
      // Пока используем mock данные
      await Future.delayed(const Duration(milliseconds: 500));
      
      setState(() {
        _order = OrderModel(
          id: widget.orderId,
          title: 'Изготовление кухонного гарнитура',
          description: 'Нужно изготовить кухонный гарнитур из массива дуба. Размеры: длина 3м, высота 2.2м. Требуется качественная фурнитура.',
          category: 'kitchen',
          clientId: 'customer1',
          price: 250000,
          status: 'active',
          createdAt: DateTime.now().subtract(const Duration(days: 2)),
          images: [],
          responseCount: 0,
          hasMyResponse: false,
        );
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка загрузки заявки: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _submitResponse() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    
    setState(() {
      _isSubmitting = true;
    });
    
    try {
      // TODO: Отправить отклик через API
      await Future.delayed(const Duration(seconds: 2)); // Имитация отправки
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Предложение успешно отправлено!'),
            backgroundColor: Colors.green,
          ),
        );
        
        Navigator.pop(context);
      }
      
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка отправки: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  String _formatDate(DateTime dateTime) {
    return '${dateTime.day}.${dateTime.month}.${dateTime.year}';
  }
}
