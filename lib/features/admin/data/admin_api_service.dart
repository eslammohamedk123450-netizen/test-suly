import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/api_config.dart';

class AdminApiException implements Exception {
  const AdminApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class AdminApiService {
  String? token;

  Map<String, String> get _headers => <String, String>{
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<void> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/v1/auth/admin/login'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode != 200) {
      throw AdminApiException(_message(response, 'تعذر تسجيل دخول المدير'));
    }
    token = (jsonDecode(response.body) as Map<String, dynamic>)['access_token']
        as String;
  }

  Future<Map<String, dynamic>> getOverview() =>
      _getMap('/api/v1/admin/overview');
  Future<List<dynamic>> getUsers() => _getList('/api/v1/admin/users');
  Future<List<dynamic>> getProviders() => _getList('/api/v1/admin/providers');
  Future<List<dynamic>> getModels() => _getList('/api/v1/admin/models');
  Future<List<dynamic>> getPlans() => _getList('/api/v1/admin/plans');
  Future<Map<String, dynamic>> getSettings() =>
      _getMap('/api/v1/admin/settings');
  Future<List<dynamic>> getAudit() => _getList('/api/v1/admin/audit');

  Future<Map<String, dynamic>> _getMap(String path) async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}$path'),
        headers: _headers);
    _ensureOk(response);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> _getList(String path) async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}$path'),
        headers: _headers);
    _ensureOk(response);
    return jsonDecode(response.body) as List<dynamic>;
  }

  void _ensureOk(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw AdminApiException(
          _message(response, 'تعذر تحميل بيانات لوحة الإدارة'));
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
