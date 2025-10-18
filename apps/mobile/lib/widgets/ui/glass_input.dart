/// Glass Input Widget for Flutter
/// <200 lines as per STRICT_RULES
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/glass_theme.dart';

class GlassInput extends StatefulWidget {
  final String? label;
  final String? error;
  final String? helperText;
  final bool glass;
  final TextEditingController? controller;
  final String? placeholder;
  final bool obscureText;
  final TextInputType? keyboardType;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final ValueChanged<String>? onChanged;

  const GlassInput({
    Key? key,
    this.label,
    this.error,
    this.helperText,
    this.glass = true,
    this.controller,
    this.placeholder,
    this.obscureText = false,
    this.keyboardType,
    this.prefixIcon,
    this.suffixIcon,
    this.onChanged,
  }) : super(key: key);

  @override
  State<GlassInput> createState() => _GlassInputState();
}

class _GlassInputState extends State<GlassInput> {
  bool _isFocused = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasError = widget.error != null;

    final borderColor = hasError
        ? GlassTheme.error
        : _isFocused
            ? GlassTheme.primary
            : (isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null)
          Padding(
            padding: EdgeInsets.only(bottom: GlassTheme.spacing2),
            child: Text(
              widget.label!,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: hasError ? GlassTheme.error : null,
              ),
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(GlassTheme.radiusLg),
          child: BackdropFilter(
            filter: widget.glass ? GlassTheme.glassBlurFilter() : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
            child: Container(
              decoration: BoxDecoration(
                color: widget.glass
                    ? (isDark ? Color(0xFF141414).withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.7))
                    : (isDark ? Color(0xFF1A1A1A) : Color(0xFFF8F8F8)),
                borderRadius: BorderRadius.circular(GlassTheme.radiusLg),
                border: Border.all(color: borderColor, width: _isFocused ? 2 : 1),
              ),
              child: TextField(
                controller: widget.controller,
                obscureText: widget.obscureText,
                keyboardType: widget.keyboardType,
                onChanged: widget.onChanged,
                decoration: InputDecoration(
                  hintText: widget.placeholder,
                  prefixIcon: widget.prefixIcon,
                  suffixIcon: widget.suffixIcon,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: GlassTheme.spacing4,
                    vertical: GlassTheme.spacing4,
                  ),
                ),
                onTap: () => setState(() => _isFocused = true),
                onEditingComplete: () => setState(() => _isFocused = false),
              ),
            ),
          ),
        ),
        if (widget.error != null || widget.helperText != null)
          Padding(
            padding: EdgeInsets.only(top: GlassTheme.spacing2 / 2),
            child: Text(
              widget.error ?? widget.helperText!,
              style: TextStyle(
                fontSize: 12,
                color: hasError ? GlassTheme.error : Colors.grey,
              ),
            ),
          ),
      ],
    );
  }
}

