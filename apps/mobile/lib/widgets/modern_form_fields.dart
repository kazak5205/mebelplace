import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';

/// Современные поля форм с валидацией
class ModernTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? helperText;
  final IconData? prefixIcon;
  final Widget? suffix;
  final bool obscureText;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final int? maxLines;
  final int? maxLength;
  final bool enabled;
  final bool autofocus;

  const ModernTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.helperText,
    this.prefixIcon,
    this.suffix,
    this.obscureText = false,
    this.keyboardType,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.maxLines = 1,
    this.maxLength,
    this.enabled = true,
    this.autofocus = false,
  });

  @override
  State<ModernTextField> createState() => _ModernTextFieldState();
}

class _ModernTextFieldState extends State<ModernTextField> 
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<Color?> _borderColorAnimation;
  bool _isFocused = false;
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: AppTheme.animationFast,
      vsync: this,
    );
    
    _borderColorAnimation = ColorTween(
      begin: Colors.grey[300]Dark,
      end: Colors.blue,
    ).animate(_animationController);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onFocusChange(bool hasFocus) {
    setState(() => _isFocused = hasFocus);
    if (hasFocus) {
      _animationController.forward();
    } else {
      _animationController.reverse();
      _validate();
    }
  }

  void _validate() {
    if (widget.validator != null) {
      setState(() {
        _errorText = widget.validator!(widget.controller?.text);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: AppTheme.labelMedium.copyWith(
              color: _isFocused ? Colors.blue : Colors.grey[600]Dark,
            ),
          ),
          const SizedBox(height: 8.0),
        ],
        
        AnimatedBuilder(
          animation: _borderColorAnimation,
          builder: (context, child) => Focus(
            onFocusChange: _onFocusChange,
            child: TextFormField(
              controller: widget.controller,
              obscureText: widget.obscureText,
              keyboardType: widget.keyboardType,
              inputFormatters: widget.inputFormatters,
              onChanged: (value) {
                widget.onChanged?.call(value);
                if (_errorText != null) {
                  _validate(); // Revalidate on change
                }
              },
              maxLines: widget.maxLines,
              maxLength: widget.maxLength,
              enabled: widget.enabled,
              autofocus: widget.autofocus,
              style: AppTheme.bodyLarge.copyWith(
                color: AppTheme.textDark,
              ),
              decoration: InputDecoration(
                hintText: widget.hint,
                hintStyle: AppTheme.bodyLarge.copyWith(
                  color: AppTheme.textTertiaryDark,
                ),
                helperText: widget.helperText,
                errorText: _errorText,
                prefixIcon: widget.prefixIcon != null
                    ? Icon(
                        widget.prefixIcon,
                        color: _isFocused ? Colors.blue : Colors.grey[600]Dark,
                      )
                    : null,
                suffix: widget.suffix,
                filled: true,
                fillColor: _isFocused 
                    ? Colors.grey[100]VariantDark
                    : Colors.grey[100]Dark,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: _borderColorAnimation.value ?? Colors.grey[300]Dark,
                    width: _isFocused ? 2 : 1,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: _errorText != null ? AppTheme.error : Colors.grey[300]Dark,
                    width: 1,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: _errorText != null ? AppTheme.error : Colors.blue,
                    width: 2,
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: const BorderSide(
                    color: AppTheme.error,
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.all(24.0),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Validators для форм
class ModernValidators {
  /// Email валидация
  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email обязателен';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Неверный формат email';
    }
    return null;
  }

  /// Телефон валидация (Kazakhstan)
  static String? phone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Телефон обязателен';
    }
    final phoneRegex = RegExp(r'^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$');
    if (!phoneRegex.hasMatch(value)) {
      return 'Формат: +7 777 123 45 67';
    }
    return null;
  }

  /// Пароль валидация (безопасность)
  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Пароль обязателен';
    }
    if (value.length < 8) {
      return 'Минимум 8 символов';
    }
    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Должна быть хотя бы одна строчная буква';
    }
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Должна быть хотя бы одна заглавная буква';
    }
    if (!RegExp(r'\d').hasMatch(value)) {
      return 'Должна быть хотя бы одна цифра';
    }
    return null;
  }

  /// Имя валидация
  static String? name(String? value) {
    if (value == null || value.isEmpty) {
      return 'Имя обязательно';
    }
    if (value.length < 2) {
      return 'Минимум 2 символа';
    }
    if (value.length > 50) {
      return 'Максимум 50 символов';
    }
    if (!RegExp(r'^[а-яА-ЯёЁa-zA-Z\s-]+$').hasMatch(value)) {
      return 'Только буквы, пробелы и дефисы';
    }
    return null;
  }

  /// Бюджет валидация
  static String? budget(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Опционально
    }
    final number = int.tryParse(value.replaceAll(' ', ''));
    if (number == null) {
      return 'Введите число';
    }
    if (number < 0) {
      return 'Бюджет должен быть положительным';
    }
    return null;
  }

  /// Обязательное поле
  static String? required(String? value, {String fieldName = 'Поле'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName обязательно';
    }
    return null;
  }

  /// Минимальная длина
  static String? Function(String?) minLength(int length) {
    return (String? value) {
      if (value == null || value.isEmpty) return null;
      if (value.length < length) {
        return 'Минимум $length символов';
      }
      return null;
    };
  }

  /// Максимальная длина
  static String? Function(String?) maxLength(int length) {
    return (String? value) {
      if (value == null || value.isEmpty) return null;
      if (value.length > length) {
        return 'Максимум $length символов';
      }
      return null;
    };
  }
}

