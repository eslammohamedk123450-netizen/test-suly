import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../../../core/config/api_config.dart';
import 'auth_session.dart';

class AuthApiException implements Exception {
  const AuthApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class AuthApiService {
  Uri _endpoint(String path) {
    final base = Uri.tryParse(ApiConfig.baseUrl);
    if (kReleaseMode && (base == null || base.scheme != 'https')) {
      throw const AuthApiException(
        'يجب ضبط Backend على HTTPS قبل تسجيل الدخول في إصدار الإنتاج.',
      );
    }
    return Uri.parse('${ApiConfig.baseUrl}/api/v1/auth/$path');
  }

  Future<void> register({
    required String email,
    required String password,
    String? fullName,
  }) async {
    final response = await http.post(
      _endpoint('register'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
        if (fullName != null && fullName.trim().isNotEmpty)
          'full_name': fullName.trim(),
      }),
    );
    if (response.statusCode != 200) {
      throw AuthApiException(_message(response, 'تعذر إنشاء الحساب'));
    }
  }

  Future<void> login({required String email, required String password}) async {
    final response = await http.post(
      _endpoint('login'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email.trim(), 'password': password}),
    );
    if (response.statusCode != 200) {
      throw AuthApiException(_message(response, 'تعذر تسجيل الدخول'));
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final token = data['access_token'];
    if (token is! String || token.isEmpty) {
      throw const AuthApiException(
          'استجابة تسجيل الدخول لا تحتوي على رمز جلسة صالح.');
    }
    await AuthSession.saveAccessToken(token);
  }

  Future<Map<String, dynamic>> currentUser() async {
    final token = AuthSession.accessToken;
    if (token == null || token.isEmpty) {
      throw const AuthApiException('لا توجد جلسة نشطة.');
    }
    final response = await http.get(
      _endpoint('me'),
      headers: <String, String>{'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 401) await AuthSession.clearPersisted();
    if (response.statusCode != 200) {
      throw AuthApiException(_message(response, 'تعذر التحقق من الجلسة'));
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<void> logout() async {
    final token = AuthSession.accessToken;
    if (token == null || token.isEmpty) return;
    try {
      final response = await http.post(
        _endpoint('logout'),
        headers: <String, String>{'Authorization': 'Bearer $token'},
      );
      if (response.statusCode != 200 && response.statusCode != 401) {
        throw AuthApiException(
            _message(response, 'تعذر تسجيل الخروج من الخادم'));
      }
    } finally {
      await AuthSession.clearPersisted();
    }
  }

  String _message(http.Response response, String fallback) {
    try {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return data['detail']?.toString() ?? fallback;
    } catch (_) {
      return fallback;
    }
  }
}
