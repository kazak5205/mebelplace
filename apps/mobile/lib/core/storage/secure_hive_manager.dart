import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'dart:typed_data';

/// Secure Hive Manager с encryption
class SecureHiveManager {
  static const String _keyPrefix = 'hive_encryption_key_';
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();
  
  /// Получить или создать encryption key для box
  static Future<List<int>> _getEncryptionKey(String boxName) async {
    final keyString = await _secureStorage.read(key: '$_keyPrefix$boxName');
    
    if (keyString != null) {
      return base64Decode(keyString);
    }
    
    // Генерируем новый ключ
    final key = Hive.generateSecureKey();
    await _secureStorage.write(
      key: '$_keyPrefix$boxName',
      value: base64Encode(key),
    );
    
    return key;
  }
  
  /// Открыть encrypted box
  static Future<Box<T>> openEncryptedBox<T>(
    String boxName, {
    bool encrypted = true,
  }) async {
    if (!encrypted) {
      return await Hive.openBox<T>(boxName);
    }
    
    final encryptionKey = await _getEncryptionKey(boxName);
    
    return await Hive.openBox<T>(
      boxName,
      encryptionCipher: HiveAesCipher(encryptionKey),
    );
  }
  
  /// Удалить encryption key (при logout)
  static Future<void> clearEncryptionKey(String boxName) async {
    await _secureStorage.delete(key: '$_keyPrefix$boxName');
  }
  
  /// Удалить все encryption keys
  static Future<void> clearAllEncryptionKeys() async {
    await _secureStorage.deleteAll();
  }
}

