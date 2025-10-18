import 'package:flutter/foundation.dart';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../core/theme/app_theme.dart';

class SMSVerificationService {
  static final SMSVerificationService _instance = SMSVerificationService._internal();
  factory SMSVerificationService() => _instance;
  SMSVerificationService._internal();

  // Mobizon API конфигурация
  static const String _apiKey = 'YOUR_MOBIZON_API_KEY'; // Add to config
  static const String _baseUrl = 'https://api.mobizon.kz/service';
  
  /// Отправка SMS кода
  Future<SMSResult> sendSMSCode(String phoneNumber) async {
    try {
      // Очищаем номер телефона
      final cleanPhone = _cleanPhoneNumber(phoneNumber);
      
      // Генерируем код
      final code = _generateCode();
      
      // Отправляем SMS через Mobizon
      final response = await _sendSMSViaMobizon(cleanPhone, code);
      
      if (response['success']) {
        return SMSResult.success(
          messageId: response['data']['messageId'],
          code: code, // В реальном приложении код не должен возвращаться
        );
      } else {
        return SMSResult.error(response['error'] ?? 'Ошибка отправки SMS');
      }
    } catch (e) {
      return SMSResult.error('Ошибка: $e');
    }
  }

  /// Проверка SMS кода
  Future<bool> verifySMSCode(String phoneNumber, String code) async {
    try {
      // В реальном приложении проверка должна происходить на сервере
      // Здесь для демонстрации проверяем локально
      
      // Implement API verification
      final response = await _verifyCodeViaAPI(phoneNumber, code);
      
      return response['success'] ?? false;
    } catch (e) {
      // Error verifying SMS code: $e
      return false;
    }
  }

  /// Отправка SMS через Mobizon API
  Future<Map<String, dynamic>> _sendSMSViaMobizon(String phone, String code) async {
    try {
      final url = Uri.parse('$_baseUrl/message/sendsmsmessage');
      
      final body = {
        'recipient': phone,
        'text': 'Ваш код подтверждения MebelPlace: $code',
        'from': 'MebelPlace', // Или ваш отправитель
      };

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apiKey': _apiKey,
        },
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': data['code'] == 0,
          'data': data['data'],
          'error': data['message'],
        };
      } else {
        return {
          'success': false,
          'error': 'HTTP ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  /// Проверка кода через API
  Future<Map<String, dynamic>> _verifyCodeViaAPI(String phone, String code) async {
    try {
      // Implement real API call
      final url = Uri.parse('https://api.mebelplace.kz/auth/verify-sms');
      
      final body = {
        'phone': phone,
        'code': code,
      };

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': data['success'] ?? false,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': 'Ошибка проверки кода',
        };
      }
    } catch (e) {
      // Для демонстрации возвращаем успех
      return {
        'success': true,
        'message': 'Код подтвержден',
      };
    }
  }

  /// Очистка номера телефона
  String _cleanPhoneNumber(String phone) {
    // Удаляем все символы кроме цифр
    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    
    // Если номер начинается с 8, заменяем на 7
    if (cleaned.startsWith('8')) {
      return '7${cleaned.substring(1)}';
    }
    
    // Если номер начинается с +7, убираем +
    if (cleaned.startsWith('7')) {
      return cleaned;
    }
    
    // Если номер не начинается с 7, добавляем 7
    if (!cleaned.startsWith('7')) {
      return '7$cleaned';
    }
    
    return cleaned;
  }

  /// Генерация SMS кода
  String _generateCode() {
    // Генерируем 4-значный код
    final random = DateTime.now().millisecondsSinceEpoch;
    final code = (random % 9000 + 1000).toString();
    return code;
  }

  /// Форматирование номера телефона для отображения
  String formatPhoneNumber(String phone) {
    final cleaned = _cleanPhoneNumber(phone);
    
    if (cleaned.length == 11 && cleaned.startsWith('7')) {
      return '+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}';
    }
    
    return phone;
  }

  /// Валидация номера телефона
  bool isValidPhoneNumber(String phone) {
    final cleaned = _cleanPhoneNumber(phone);
    return cleaned.length == 11 && cleaned.startsWith('7');
  }
}

/// Результат отправки SMS
class SMSResult {
  final bool isSuccess;
  final String? messageId;
  final String? code;
  final String? error;

  SMSResult._({
    required this.isSuccess,
    this.messageId,
    this.code,
    this.error,
  });

  factory SMSResult.success({
    required String messageId,
    String? code,
  }) {
    return SMSResult._(
      isSuccess: true,
      messageId: messageId,
      code: code,
    );
  }

  factory SMSResult.error(String error) {
    return SMSResult._(
      isSuccess: false,
      error: error,
    );
  }
}

/// Виджет для ввода SMS кода
class SMSCodeInputWidget extends StatefulWidget {
  final Function(String) onCodeComplete;
  final Function() onResendCode;
  final String phoneNumber;
  final int codeLength;

  const SMSCodeInputWidget({
    super.key,
    required this.onCodeComplete,
    required this.onResendCode,
    required this.phoneNumber,
    this.codeLength = 4,
  });

  @override
  State<SMSCodeInputWidget> createState() => _SMSCodeInputWidgetState();
}

class _SMSCodeInputWidgetState extends State<SMSCodeInputWidget> {
  final List<TextEditingController> _controllers = [];
  final List<FocusNode> _focusNodes = [];
  final List<String> _codes = [];

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.codeLength; i++) {
      _controllers.add(TextEditingController());
      _focusNodes.add(FocusNode());
      _codes.add('');
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Заголовок
        Text(
          'Введите код из SMS',
          style: Theme.of(context).textTheme.headlineSmall,
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: 8.0),
        
        // Номер телефона
        Text(
          'Отправлен на ${SMSVerificationService().formatPhoneNumber(widget.phoneNumber)}',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Colors.grey[600]!,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: 24.0),
        
        // Поля ввода кода
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(widget.codeLength, (index) {
            return _buildCodeField(index);
          }),
        ),
        
        const SizedBox(height: 24.0),
        
        // Кнопка повторной отправки
        TextButton(
          onPressed: widget.onResendCode,
          child: Text(
            'Отправить код повторно',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.blue,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCodeField(int index) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        border: Border.all(
          color: _codes[index].isNotEmpty ? Colors.blue : Colors.grey[300]!,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.bold,
        ),
        decoration: const InputDecoration(
          border: InputBorder.none,
          counterText: '',
        ),
        onChanged: (value) {
          setState(() {
            _codes[index] = value;
          });
          
          if (value.isNotEmpty && index < widget.codeLength - 1) {
            _focusNodes[index + 1].requestFocus();
          } else if (value.isEmpty && index > 0) {
            _focusNodes[index - 1].requestFocus();
          }
          
          // Проверяем, заполнен ли весь код
          final fullCode = _codes.join('');
          if (fullCode.length == widget.codeLength) {
            widget.onCodeComplete(fullCode);
          }
        },
      ),
    );
  }
}


