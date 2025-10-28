import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/theme/app_theme.dart';
import '../../utils/haptic_helper.dart';

/// Swipeable карточка с действиями (delete, archive и т.д.)
class SwipeableCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onDelete;
  final VoidCallback? onArchive;
  final VoidCallback? onEdit;
  final Color deleteColor;
  final Color archiveColor;
  final double threshold; // Порог для срабатывания действия (0.0 - 1.0)

  const SwipeableCard({
    super.key,
    required this.child,
    this.onDelete,
    this.onArchive,
    this.onEdit,
    this.deleteColor = Colors.red,
    this.archiveColor = Colors.orange,
    this.threshold = 0.4,
  });

  @override
  State<SwipeableCard> createState() => _SwipeableCardState();
}

class _SwipeableCardState extends State<SwipeableCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  double _dragExtent = 0;
  bool _isDragging = false;
  bool _hasVibrated = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleDragStart(DragStartDetails details) {
    setState(() {
      _isDragging = true;
      _hasVibrated = false;
    });
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    final delta = details.primaryDelta ?? 0;
    final width = context.size?.width ?? 0;
    
    if (width == 0) return;
    
    setState(() {
      _dragExtent = (_dragExtent + delta).clamp(-width, width);
      
      // Вибрация при достижении порога
      final progress = (_dragExtent.abs() / width);
      if (progress >= widget.threshold && !_hasVibrated) {
        HapticHelper.mediumImpact();
        _hasVibrated = true;
      } else if (progress < widget.threshold) {
        _hasVibrated = false;
      }
    });
  }

  void _handleDragEnd(DragEndDetails details) {
    final width = context.size?.width ?? 0;
    if (width == 0) return;
    
    final progress = _dragExtent.abs() / width;
    
    setState(() {
      _isDragging = false;
    });
    
    if (progress >= widget.threshold) {
      // Действие сработало
      if (_dragExtent < 0) {
        // Свайп влево - удалить
        _animateOut(toLeft: true).then((_) {
          HapticHelper.success();
          widget.onDelete?.call();
        });
      } else {
        // Свайп вправо - архив
        _animateOut(toLeft: false).then((_) {
          HapticHelper.success();
          widget.onArchive?.call();
        });
      }
    } else {
      // Возврат в исходное положение
      _animateBack();
    }
  }

  Future<void> _animateOut({required bool toLeft}) async {
    final width = context.size?.width ?? 0;
    _slideAnimation = Tween<Offset>(
      begin: Offset(_dragExtent / width, 0),
      end: Offset(toLeft ? -1.5 : 1.5, 0),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
    
    await _controller.forward(from: 0);
  }

  void _animateBack() {
    final width = context.size?.width ?? 0;
    _slideAnimation = Tween<Offset>(
      begin: Offset(_dragExtent / width, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
    
    _controller.forward(from: 0).then((_) {
      setState(() {
        _dragExtent = 0;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final progress = (_dragExtent.abs() / width).clamp(0.0, 1.0);
    final isLeftSwipe = _dragExtent < 0;
    
    return GestureDetector(
      onHorizontalDragStart: _handleDragStart,
      onHorizontalDragUpdate: _handleDragUpdate,
      onHorizontalDragEnd: _handleDragEnd,
      child: Stack(
        children: [
          // Background actions
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: isLeftSwipe ? Alignment.centerRight : Alignment.centerLeft,
                  end: isLeftSwipe ? Alignment.centerLeft : Alignment.centerRight,
                  colors: [
                    (isLeftSwipe ? widget.deleteColor : widget.archiveColor)
                        .withOpacity(progress * 0.9),
                    (isLeftSwipe ? widget.deleteColor : widget.archiveColor)
                        .withOpacity(progress * 0.3),
                  ],
                ),
                borderRadius: BorderRadius.circular(20.r),
              ),
              child: Align(
                alignment: isLeftSwipe ? Alignment.centerRight : Alignment.centerLeft,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24.w),
                  child: AnimatedScale(
                    scale: progress >= widget.threshold ? 1.2 : 1.0,
                    duration: const Duration(milliseconds: 100),
                    child: Icon(
                      isLeftSwipe ? Icons.delete_rounded : Icons.archive_rounded,
                      color: Colors.white.withOpacity(progress),
                      size: 32.sp,
                    ),
                  ),
                ),
              ),
            ),
          ),
          
          // Card
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final offset = _isDragging
                  ? Offset(_dragExtent / width, 0)
                  : _slideAnimation.value;
              
              return Transform.translate(
                offset: Offset(offset.dx * width, 0),
                child: child,
              );
            },
            child: widget.child,
          ),
        ],
      ),
    );
  }
}

