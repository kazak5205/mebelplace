import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/user_model.dart';

class CustomBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final UserModel? user;

  const CustomBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.user,
  });

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = user != null;
    final isMaster = user?.role == 'master';

    if (!isLoggedIn) {
      // Для неавторизованных - простая навигация
      return _buildSimpleNavBar();
    }

    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.bottomCenter,
      children: [
        // Основная навигация с вырезом
        CustomPaint(
          painter: _BottomNavBarPainter(),
          child: SizedBox(
            height: 70.h,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(
                  index: 0,
                  icon: currentIndex == 0 ? Icons.home_rounded : Icons.home_outlined,
                  label: 'Главная',
                  isActive: currentIndex == 0,
                ),
                _buildNavItem(
                  index: 1,
                  icon: currentIndex == 1
                      ? (isMaster ? Icons.work_rounded : Icons.list_alt_rounded)
                      : (isMaster ? Icons.work_outline_rounded : Icons.list_alt_outlined),
                  label: isMaster ? 'Заявки' : 'Мои заявки',
                  isActive: currentIndex == 1,
                ),
                SizedBox(width: 80.w), // Пространство для центральной кнопки
                _buildNavItem(
                  index: 3,
                  icon: currentIndex == 3 ? Icons.chat_bubble_rounded : Icons.chat_bubble_outline_rounded,
                  label: 'Чаты',
                  isActive: currentIndex == 3,
                ),
                _buildNavItem(
                  index: 4,
                  icon: currentIndex == 4 ? Icons.person_rounded : Icons.person_outline_rounded,
                  label: 'Профиль',
                  isActive: currentIndex == 4,
                ),
              ],
            ),
          ),
        ),
        
        // Центральная большая кнопка
        Positioned(
          bottom: 24.h, // Опущена ниже на 20%
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () => onTap(2),
                child: TweenAnimationBuilder<double>(
                  duration: const Duration(milliseconds: 150),
                  tween: Tween(begin: 1.0, end: currentIndex == 2 ? 1.1 : 1.0),
                  builder: (context, scale, child) {
                    return Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 70.w,
                        height: 70.w,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Color(0xFFF97316),
                              Color(0xFFEA580C),
                            ],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.5),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.add_rounded,
                          color: Colors.white,
                          size: 36.sp,
                        ),
                      ),
                    );
                  },
                ),
              ),
              SizedBox(height: 6.h),
              Text(
                isMaster ? 'Видео' : 'Заказ',
                style: TextStyle(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w600,
                  color: currentIndex == 2 ? AppColors.primary : Colors.white.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSimpleNavBar() {
    return Container(
      height: 70.h,
      decoration: BoxDecoration(
        color: AppColors.dark,
        border: Border(
          top: BorderSide(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(
            index: 0,
            icon: currentIndex == 0 ? Icons.home_rounded : Icons.home_outlined,
            label: 'Главная',
            isActive: currentIndex == 0,
          ),
          _buildNavItem(
            index: 1,
            icon: Icons.login_rounded,
            label: 'Войти',
            isActive: currentIndex == 1,
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
    required bool isActive,
  }) {
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive ? AppColors.primary : Colors.white.withOpacity(0.6),
              size: 24.sp,
            ),
            SizedBox(height: 4.h),
            Text(
              label,
              style: TextStyle(
                fontSize: 11.sp,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                color: isActive ? AppColors.primary : Colors.white.withOpacity(0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Кастомный painter для рисования навигации с вырезом
class _BottomNavBarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1A1A1A)
      ..style = PaintingStyle.fill;

    final path = Path();
    
    // Начало слева
    path.lineTo(0, 0);
    
    // Линия до начала выреза
    path.lineTo(size.width * 0.35, 0);
    
    // Создаем вырез для центральной кнопки
    const curveEndX = 0.65;
    const curveHeight = 20.0; // Высота выреза
    
    // Плавный вырез (Bezier curve)
    path.quadraticBezierTo(
      size.width * 0.40, // control point X
      -curveHeight, // control point Y (вверх)
      size.width * 0.5, // end point X (центр)
      -curveHeight, // end point Y
    );
    
    path.quadraticBezierTo(
      size.width * 0.60, // control point X
      -curveHeight, // control point Y
      curveEndX, // end point X
      0, // end point Y
    );
    
    // Линия до конца
    path.lineTo(size.width, 0);
    
    // Нижние углы
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    
    path.close();
    
    // Тень
    canvas.drawShadow(path, Colors.black.withOpacity(0.3), 8, false);
    
    // Основной фон
    canvas.drawPath(path, paint);
    
    // Верхняя граница
    final borderPaint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    
    final borderPath = Path();
    borderPath.moveTo(0, 0);
    borderPath.lineTo(size.width * 0.35, 0);
    borderPath.quadraticBezierTo(
      size.width * 0.40,
      -curveHeight,
      size.width * 0.5,
      -curveHeight,
    );
    borderPath.quadraticBezierTo(
      size.width * 0.60,
      -curveHeight,
      size.width * 0.65,
      0,
    );
    borderPath.lineTo(size.width, 0);
    
    canvas.drawPath(borderPath, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

