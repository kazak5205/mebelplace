import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class Avatar extends StatelessWidget {
  final String? url;
  final double size;
  final bool showBorder;

  const Avatar({
    super.key,
    this.url,
    this.size = 44,
    this.showBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    final border = showBorder
        ? Border.all(color: AppColors.lightPrimary, width: 2)
        : null;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: border,
      ),
      clipBehavior: Clip.hardEdge,
      child: url == null || url!.isEmpty
          ? Container(
              color: Colors.grey.shade300,
              child: const Icon(Icons.person, color: Colors.white),
            )
          : CachedNetworkImage(
              imageUrl: url!,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(color: Colors.grey.shade300),
              errorWidget: (_, __, ___) => Container(
                color: Colors.grey.shade300,
                child: const Icon(Icons.person, color: Colors.white),
              ),
            ),
    );
  }
}

