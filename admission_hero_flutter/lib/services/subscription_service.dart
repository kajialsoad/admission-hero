import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../services/storage_service.dart';
import '../models/models.dart';

class SubscriptionService {
  static final SubscriptionService _instance = SubscriptionService._internal();
  factory SubscriptionService() => _instance;
  SubscriptionService._internal();

  final String baseUrl = AppConstants.baseUrl;

  // Get auth headers
  Future<Map<String, String>> _getHeaders({bool requiresAuth = true}) async {
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

    return headers;
  }

  // Get all packages
  Future<List<Package>> getPackages() async {
    try {
      final headers = await _getHeaders(requiresAuth: false);
      final response = await http.get(
        Uri.parse('$baseUrl/subscription/packages'),
        headers: headers,
      );

      print('Get packages response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final List<dynamic> packagesJson = data['data'];
          return packagesJson.map((json) => Package.fromJson(json)).toList();
        }
      }

      throw Exception('Failed to load packages');
    } catch (e) {
      print('Get packages error: $e');
      rethrow;
    }
  }

  // Validate promo code
  Future<PromoCode?> validatePromoCode(String code) async {
    try {
      final headers = await _getHeaders(requiresAuth: false);
      final response = await http.post(
        Uri.parse('$baseUrl/subscription/validate-promo'),
        headers: headers,
        body: jsonEncode({'code': code}),
      );

      print('Validate promo code response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return PromoCode.fromJson(data['data']);
        }
      }

      return null;
    } catch (e) {
      print('Validate promo code error: $e');
      return null;
    }
  }

  // Calculate price with promo code
  Future<Map<String, dynamic>?> calculatePrice({
    required String packageType,
    String? promoCode,
  }) async {
    try {
      final headers = await _getHeaders(requiresAuth: false);
      final response = await http.post(
        Uri.parse('$baseUrl/subscription/calculate-price'),
        headers: headers,
        body: jsonEncode({
          'packageType': packageType,
          'promoCode': promoCode,
        }),
      );

      print('Calculate price response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      }

      return null;
    } catch (e) {
      print('Calculate price error: $e');
      return null;
    }
  }

  // Check subscription status
  Future<Map<String, dynamic>?> checkSubscription() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/subscription/status'),
        headers: headers,
      );

      print('Check subscription response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      }

      return null;
    } catch (e) {
      print('Check subscription error: $e');
      return null;
    }
  }

  // Get subscription history
  Future<List<Subscription>> getSubscriptionHistory() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/subscription/history'),
        headers: headers,
      );

      print('Get subscription history response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final List<dynamic> subscriptionsJson = data['data'];
          return subscriptionsJson.map((json) => Subscription.fromJson(json)).toList();
        }
      }

      return [];
    } catch (e) {
      print('Get subscription history error: $e');
      return [];
    }
  }

  // Get payment history
  Future<List<Payment>> getPaymentHistory({int page = 1, int limit = 20}) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/subscription/payments?page=$page&limit=$limit'),
        headers: headers,
      );

      print('Get payment history response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final List<dynamic> paymentsJson = data['data'];
          return paymentsJson.map((json) => Payment.fromJson(json)).toList();
        }
      }

      return [];
    } catch (e) {
      print('Get payment history error: $e');
      return [];
    }
  }

  // Create bKash payment
  Future<Map<String, dynamic>?> createBKashPayment({
    required String packageType,
    String? promoCode,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/payments/bkash/create'),
        headers: headers,
        body: jsonEncode({
          'packageType': packageType,
          'promoCode': promoCode,
        }),
      );

      print('Create bKash payment response: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data;
        }
      }

      return null;
    } catch (e) {
      print('Create bKash payment error: $e');
      return null;
    }
  }

  // Verify bKash payment
  Future<Map<String, dynamic>?> verifyBKashPayment(String paymentID) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/payments/bkash/verify'),
        headers: headers,
        body: jsonEncode({'paymentID': paymentID}),
      );

      print('Verify bKash payment response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data;
        }
      }

      return null;
    } catch (e) {
      print('Verify bKash payment error: $e');
      return null;
    }
  }

  // Verify Google Play purchase
  Future<Map<String, dynamic>?> verifyGooglePlayPurchase({
    required String productId,
    required String purchaseToken,
    required String packageType,
    String? orderId,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/payments/google-play/verify'),
        headers: headers,
        body: jsonEncode({
          'productId': productId,
          'purchaseToken': purchaseToken,
          'packageType': packageType,
          'orderId': orderId,
        }),
      );

      print('Verify Google Play purchase response: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data;
        }
      }

      return null;
    } catch (e) {
      print('Verify Google Play purchase error: $e');
      return null;
    }
  }

  // Get enabled payment methods
  Future<Map<String, bool>> getEnabledPaymentMethods() async {
    try {
      final headers = await _getHeaders(requiresAuth: false);
      final response = await http.get(
        Uri.parse('$baseUrl/subscription/payment-methods'),
        headers: headers,
      );

      print('Get enabled payment methods response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return {
            'bkashEnabled': data['data']['bkashEnabled'] ?? false,
            'googlePlayEnabled': data['data']['googlePlayEnabled'] ?? false,
          };
        }
      }

      // Default: only bKash enabled
      return {
        'bkashEnabled': true,
        'googlePlayEnabled': false,
      };
    } catch (e) {
      print('Get enabled payment methods error: $e');
      // Default: only bKash enabled
      return {
        'bkashEnabled': true,
        'googlePlayEnabled': false,
      };
    }
  }
}
