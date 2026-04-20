import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/models.dart';
import '../utils/constants.dart';

class StorageService {
  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  // ── Token ──────────────────────────────────────────────────────────────────
  static Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
    // Save expiry (60 days)
    final expiry = DateTime.now().add(const Duration(days: 60));
    await _storage.write(
      key: AppConstants.tokenExpiryKey,
      value: expiry.toIso8601String(),
    );
  }

  static Future<String?> getToken() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token == null) return null;

    // Check expiry
    final expiryStr = await _storage.read(key: AppConstants.tokenExpiryKey);
    if (expiryStr != null) {
      final expiry = DateTime.tryParse(expiryStr);
      if (expiry != null && DateTime.now().isAfter(expiry)) {
        await clearAll();
        return null;
      }
    }
    return token;
  }

  // ── User Data ──────────────────────────────────────────────────────────────
  static Future<void> saveUser(UserModel user) async {
    await _storage.write(
      key: AppConstants.userKey,
      value: jsonEncode(user.toJson()),
    );
  }

  static Future<UserModel?> getUser() async {
    final userStr = await _storage.read(key: AppConstants.userKey);
    if (userStr == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(userStr));
    } catch (_) {
      return null;
    }
  }

  // ── Clear ──────────────────────────────────────────────────────────────────
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
