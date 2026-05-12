import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http_parser/http_parser.dart';
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
    print('DEBUG: Making $method request to: $uri');
    
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      final token = await StorageService.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
        print('DEBUG: Added auth token to request');
      } else {
        print('DEBUG: No auth token found');
      }
    } else {
      print('DEBUG: Request does not require auth');
    }

    http.Response response;
    try {
      switch (method.toUpperCase()) {
        case 'POST':
          response = await http
              .post(uri, headers: headers, body: jsonEncode(body))
              .timeout(const Duration(seconds: 60));
          break;
        case 'PUT':
          response = await http
              .put(uri, headers: headers, body: jsonEncode(body))
              .timeout(const Duration(seconds: 60));
          break;
        case 'DELETE':
          response = await http
              .delete(uri, headers: headers)
              .timeout(const Duration(seconds: 60));
          break;
        default: // GET
          response = await http
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 60));
      }
      
      print('DEBUG: Response status: ${response.statusCode}');
      print('DEBUG: Response body: ${response.body}');
      
    } on http.ClientException catch (e) {
      print('DEBUG: ClientException - Network error: $e');
      throw ApiException('No internet connection. Please check your network.');
    } catch (e) {
      print('DEBUG: Request exception: $e');
      throw ApiException('Request failed: $e');
    }

    Map<String, dynamic> responseBody;
    try {
      responseBody = jsonDecode(response.body);
    } catch (_) {
      print('DEBUG: Failed to parse JSON response');
      throw ApiException('Invalid server response.');
    }

    if (response.statusCode == 401) {
      print('DEBUG: 401 Unauthorized - clearing storage');
      await StorageService.clearAll();
      throw ApiException('Session expired. Please login again.', statusCode: 401);
    }

    if (response.statusCode >= 400) {
      final msg = responseBody['message'] ?? responseBody['error'] ?? 'Request failed';
      print('DEBUG: HTTP error ${response.statusCode}: $msg');
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

  // --- Exam Related Methods ---
  static Future<Map<String, dynamic>?> submitExam(Map<String, dynamic> data) => ApiService().post('/exams/submit', data);
  static Future<Map<String, dynamic>?> getPerformanceStats() => ApiService().get('/exams/performance/stats');
  static Future<Map<String, dynamic>?> getRecentExamResults({int limit = 5}) => ApiService().get('/exams/performance/recent?limit=$limit');

  // --- Upload Methods ---
  static Future<String?> uploadImage(XFile file) async {
    final uri = Uri.parse('${AppConstants.baseUrl}/uploads/image');
    final request = http.MultipartRequest('POST', uri);
    
    final token = await StorageService.getToken();
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    if (kIsWeb) {
      final bytes = await file.readAsBytes();
      final mimeType = _getMimeType(file.name);
      request.files.add(http.MultipartFile.fromBytes(
        'image', 
        bytes, 
        filename: file.name,
        contentType: MediaType.parse(mimeType),
      ));
    } else {
      final mimeType = _getMimeType(file.path);
      request.files.add(await http.MultipartFile.fromPath(
        'image', 
        file.path,
        contentType: MediaType.parse(mimeType),
      ));
    }
    
    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        if (responseData['success'] == true) {
           return responseData['data']['url'];
        }
      }
      print('DEBUG: Upload failed with status ${response.statusCode}: ${response.body}');
      return null;
    } catch (e) {
      print('DEBUG: Upload exception: $e');
      return null;
    }
  }

  static String _getMimeType(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default to jpeg
    }
  }
}
