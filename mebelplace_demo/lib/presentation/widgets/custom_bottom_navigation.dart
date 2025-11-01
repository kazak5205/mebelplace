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

    return Container(
      // ✅ УБРАНО: SafeArea снизу, чтобы navbar шёл до края экрана
      decoration: const BoxDecoration(
        color: Colors.transparent,
      ),
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          // Основная навигация с вырезом
          CustomPaint(
            painter: _BottomNavBarPainter(),
            child: SizedBox(
              height: 65.h,
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
                  label: isMaster ? 'Все заявки' : 'Мои заявки', // ✅ Синхронизировано с вебом
                  isActive: currentIndex == 1,
                ),
                SizedBox(width: 80.w), // Пространство для центральной кнопки
                _buildNavItem(
                  index: 3,
                  icon: currentIndex == 3 ? Icons.chat_bubble_rounded : Icons.chat_bubble_outline_rounded,
                  label: 'Мессенджер', // ✅ Синхронизировано с вебом
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
          bottom: 20.h, // Улучшена позиция для попадания в вырез
          child: GestureDetector(
            onTap: () => onTap(2),
            behavior: HitTestBehavior.opaque,
            child: Container(
              width: 80.w, // Уменьшена зона нажатия
              height: 80.h, // Уменьшена зона нажатия
              alignment: Alignment.center,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TweenAnimationBuilder<double>(
                    duration: const Duration(milliseconds: 150),
                    tween: Tween(begin: 1.0, end: currentIndex == 2 ? 1.1 : 1.0),
                    builder: (context, scale, child) {
                      return Transform.scale(
                        scale: scale,
                        child: Container(
                          width: 62.w,
                          height: 62.w,
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
                            size: 32.sp,
                          ),
                        ),
                      );
                    },
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    isMaster ? 'создать\nвидеорекламу' : 'заявка\nвсем', // ✅ Синхронизировано с вебом
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    style: TextStyle(
                      fontSize: 9.sp, // Еще уменьшен
                      fontWeight: FontWeight.w600,
                      height: 1.1,
                      color: currentIndex == 2 ? AppColors.primary : Colors.white.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          ),
        ],
      ),
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
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive ? AppColors.primary : Colors.white.withOpacity(0.6),
              size: 22.sp,
            ),
            SizedBox(height: 3.h),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.sp,
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
    
    // Создаем вырез для центральной кнопки - максимально плавная кривая
    const curveEndX = 0.65;
    const curveHeight = 25.0;
    
    // Первая половина дуги - более плавный переход
    path.cubicTo(
      size.width * 0.38, -5, // control point 1 - начинаем погружение
      size.width * 0.44, -curveHeight * 0.4, // control point 2
      size.width * 0.5, -curveHeight, // end point (центр выреза)
    );
    
    // Вторая половина дуги - симметричный подъем
    path.cubicTo(
      size.width * 0.56, -curveHeight * 0.4, // control point 1
      size.width * 0.62, -5, // control point 2 - завершаем подъем
      size.width * curveEndX, 0, // end point
    );
    
    // Линия до конца
    path.lineTo(size.width, 0);
    
    // Нижние углы
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    
    path.close();
    
    // Основной фон
    canvas.drawPath(path, paint);
    
    // Убираем тень чтобы не было линии
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

