import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/theme/app_theme.dart';

class ErrorDialog extends StatelessWidget {
  final String title;
  final String message;

  const ErrorDialog({
    super.key,
    this.title = 'Что-то пошло не так',
    required this.message,
  });

  static Future<void> show(
    BuildContext context, {
    String? title,
    required String message,
  }) {
    return showDialog(
      context: context,
      builder: (context) => ErrorDialog(
        title: title ?? 'Что-то пошло не так',
        message: message,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: EdgeInsets.all(24.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.darkSurface,
              AppColors.dark,
            ],
          ),
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Иконка
            Container(
              width: 64.w,
              height: 64.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    Colors.orange.shade400.withOpacity(0.2),
                    Colors.red.shade400.withOpacity(0.2),
                  ],
                ),
              ),
              child: Icon(
                Icons.error_outline_rounded,
                size: 36.sp,
                color: Colors.orange.shade300,
              ),
            ),
            
            SizedBox(height: 20.h),
            
            // Заголовок
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            
            SizedBox(height: 12.h),
            
            // Сообщение
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.7),
                height: 1.5,
              ),
            ),
            
            SizedBox(height: 24.h),
            
            // Кнопка закрытия
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Понятно',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Красивое Success сообщение
class SuccessDialog extends StatelessWidget {
  final String title;
  final String message;

  const SuccessDialog({
    super.key,
    this.title = 'Успешно!',
    required this.message,
  });

  static Future<void> show(
    BuildContext context, {
    String? title,
    required String message,
  }) {
    return showDialog(
      context: context,
      builder: (context) => SuccessDialog(
        title: title ?? 'Успешно!',
        message: message,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: EdgeInsets.all(24.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.darkSurface,
              AppColors.dark,
            ],
          ),
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Иконка
            Container(
              width: 64.w,
              height: 64.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    Colors.green.shade400.withOpacity(0.2),
                    Colors.teal.shade400.withOpacity(0.2),
                  ],
                ),
              ),
              child: Icon(
                Icons.check_circle_outline_rounded,
                size: 36.sp,
                color: Colors.green.shade300,
              ),
            ),
            
            SizedBox(height: 20.h),
            
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            
            SizedBox(height: 12.h),
            
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.7),
                height: 1.5,
              ),
            ),
            
            SizedBox(height: 24.h),
            
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
                child: Text(
                  'Отлично!',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

