import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';
import '../utils/constants.dart';

class AnalyticsService {
  static final AnalyticsService _instance = AnalyticsService._internal();
  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

  static const String baseUrl = AppConstants.baseUrl;
  String? _sessionId;
  Map<String, dynamic>? _deviceInfo;

  // Initialize analytics service
  Future<void> initialize() async {
    _sessionId = DateTime.now().millisecondsSinceEpoch.toString();
    await _collectDeviceInfo();
    print('DEBUG: Analytics service initialized with session: $_sessionId');
  }

  // Collect device information
  Future<void> _collectDeviceInfo() async {
    try {
      final deviceInfo = DeviceInfoPlugin();
      
      if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        _deviceInfo = {
          'platform': 'Android',
          'version': androidInfo.version.release,
          'model': androidInfo.model,
          'brand': androidInfo.brand,
          'manufacturer': androidInfo.manufacturer,
        };
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        _deviceInfo = {
          'platform': 'iOS',
          'version': iosInfo.systemVersion,
          'model': iosInfo.model,
          'name': iosInfo.name,
        };
      } else {
        _deviceInfo = {
          'platform': Platform.operatingSystem,
          'version': Platform.operatingSystemVersion,
        };
      }
    } catch (e) {
      print('DEBUG: Error collecting device info: $e');
      _deviceInfo = {
        'platform': Platform.operatingSystem,
        'version': 'unknown',
      };
    }
  }

  // Track analytics event
  Future<void> trackEvent({
    required String eventType,
    required Map<String, dynamic> eventData,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/analytics/track'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'eventType': eventType,
          'eventData': eventData,
          'sessionId': _sessionId,
          'deviceInfo': _deviceInfo,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 201) {
        print('DEBUG: Event tracked: $eventType');
      } else {
        print('DEBUG: Failed to track event: ${response.statusCode}');
      }
    } catch (e) {
      print('DEBUG: Error tracking event: $e');
    }
  }

  // Track login event
  Future<void> trackLogin(String userId) async {
    await trackEvent(
      eventType: 'login',
      eventData: {
        'userId': userId,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  // Track exam start
  Future<void> trackExamStart({
    required String examId,
    required String examName,
    required String userId,
  }) async {
    await trackEvent(
      eventType: 'exam_start',
      eventData: {
        'examId': examId,
        'examName': examName,
        'userId': userId,
        'startTime': DateTime.now().toIso8601String(),
      },
    );
  }

  // Track exam completion
  Future<void> trackExamComplete({
    required String examId,
    required String examName,
    required String userId,
    required int score,
    required int totalQuestions,
    required Duration timeTaken,
  }) async {
    await trackEvent(
      eventType: 'exam_complete',
      eventData: {
        'examId': examId,
        'examName': examName,
        'userId': userId,
        'score': score,
        'totalQuestions': totalQuestions,
        'percentage': (score / totalQuestions * 100).round(),
        'timeTaken': timeTaken.inSeconds,
        'completedAt': DateTime.now().toIso8601String(),
      },
    );
  }

  // Track payment event
  Future<void> trackPayment({
    required String paymentId,
    required String userId,
    required double amount,
    required String method,
    required String status,
  }) async {
    await trackEvent(
      eventType: 'payment',
      eventData: {
        'paymentId': paymentId,
        'userId': userId,
        'amount': amount,
        'method': method,
        'status': status,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  // Track video watch
  Future<void> trackVideoWatch({
    required String videoId,
    required String videoTitle,
    required String userId,
    required Duration watchTime,
    required Duration totalDuration,
  }) async {
    await trackEvent(
      eventType: 'video_watch',
      eventData: {
        'videoId': videoId,
        'videoTitle': videoTitle,
        'userId': userId,
        'watchTime': watchTime.inSeconds,
        'totalDuration': totalDuration.inSeconds,
        'completionPercentage': (watchTime.inSeconds / totalDuration.inSeconds * 100).round(),
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  // Track page view
  Future<void> trackPageView({
    required String pageName,
    String? userId,
    Map<String, dynamic>? additionalData,
  }) async {
    await trackEvent(
      eventType: 'page_view',
      eventData: {
        'pageName': pageName,
        'userId': userId,
        'timestamp': DateTime.now().toIso8601String(),
        ...?additionalData,
      },
    );
  }

  // Get user analytics (requires auth)
  Future<Map<String, dynamic>?> getUserAnalytics({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token == null) return null;

      String url = '$baseUrl/analytics/user';
      final queryParams = <String, String>{};
      
      if (startDate != null) {
        queryParams['startDate'] = startDate.toIso8601String();
      }
      if (endDate != null) {
        queryParams['endDate'] = endDate.toIso8601String();
      }

      if (queryParams.isNotEmpty) {
        url += '?' + queryParams.entries.map((e) => '${e.key}=${e.value}').join('&');
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data'];
        }
      }
    } catch (e) {
      print('DEBUG: Error getting user analytics: $e');
    }
    return null;
  }

  // Track app lifecycle events
  Future<void> trackAppStart() async {
    await trackPageView(pageName: 'app_start');
  }

  Future<void> trackAppBackground() async {
    await trackPageView(pageName: 'app_background');
  }

  Future<void> trackAppResume() async {
    await trackPageView(pageName: 'app_resume');
  }

  // Track feature usage
  Future<void> trackFeatureUsage({
    required String featureName,
    String? userId,
    Map<String, dynamic>? context,
  }) async {
    await trackPageView(
      pageName: 'feature_usage',
      userId: userId,
      additionalData: {
        'featureName': featureName,
        'context': context,
      },
    );
  }

  // Track error events
  Future<void> trackError({
    required String errorType,
    required String errorMessage,
    String? userId,
    Map<String, dynamic>? context,
  }) async {
    await trackEvent(
      eventType: 'page_view', // Using page_view as error tracking
      eventData: {
        'pageName': 'error',
        'errorType': errorType,
        'errorMessage': errorMessage,
        'userId': userId,
        'context': context,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }
}