import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../services/storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // ── Base Request ───────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> _request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
  }) async {
    final uri = Uri.parse('${AppConstants.baseUrl}$endpoint');
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      final token = await StorageService.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    http.Response response;
    try {
      switch (method.toUpperCase()) {
        case 'POST':
          response = await http
              .post(uri, headers: headers, body: jsonEncode(body))
              .timeout(const Duration(seconds: 30));
          break;
        case 'PUT':
          response = await http
              .put(uri, headers: headers, body: jsonEncode(body))
              .timeout(const Duration(seconds: 30));
          break;
        case 'DELETE':
          response = await http
              .delete(uri, headers: headers)
              .timeout(const Duration(seconds: 15));
          break;
        default: // GET
          response = await http
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 15));
      }
    } on SocketException {
      throw ApiException('No internet connection. Please check your network.');
    } on HttpException {
      throw ApiException('Network error. Please try again.');
    } catch (e) {
      throw ApiException('Request timed out. Please try again.');
    }

    Map<String, dynamic> responseBody;
    try {
      responseBody = jsonDecode(response.body);
    } catch (_) {
      throw ApiException('Invalid server response.');
    }

    if (response.statusCode == 401) {
      await StorageService.clearAll();
      throw ApiException('Session expired. Please login again.', statusCode: 401);
    }

    if (response.statusCode >= 400) {
      final msg = responseBody['message'] ?? responseBody['error'] ?? 'Request failed';
      throw ApiException(msg, statusCode: response.statusCode);
    }

    return responseBody;
  }

  // ── Convenience Methods ────────────────────────────────────────────────────
  Future<Map<String, dynamic>> get(String endpoint, {bool requiresAuth = true}) =>
      _request('GET', endpoint, requiresAuth: requiresAuth);

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body, {bool requiresAuth = true}) =>
      _request('POST', endpoint, body: body, requiresAuth: requiresAuth);

  Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> body, {bool requiresAuth = true}) =>
      _request('PUT', endpoint, body: body, requiresAuth: requiresAuth);

  Future<Map<String, dynamic>> delete(String endpoint) =>
      _request('DELETE', endpoint);

  // --- Static Helper Methods ---
  static Future<Map<String, dynamic>?> checkSubscription() => ApiService().get('/subscription/status');
  static Future<Map<String, dynamic>?> createSubscriptionPayment(Map<String, dynamic> data) => ApiService().post('/subscription/create-payment', data);
  static Future<Map<String, dynamic>?> executeSubscriptionPayment(Map<String, dynamic> data) => ApiService().post('/subscription/execute-payment', data);
  static Future<Map<String, dynamic>?> createOrder(Map<String, dynamic> data) => ApiService().post('/orders', data);
  static Future<Map<String, dynamic>?> getMyOrders({int page = 1, int limit = 20}) => ApiService().get('/orders/my-orders?page=$page&limit=$limit');
  static Future<Map<String, dynamic>?> getOrder(String id) => ApiService().get('/orders/$id');
  static Future<Map<String, dynamic>?> sendMessage(Map<String, dynamic> data) => ApiService().post('/messages', data);
}
