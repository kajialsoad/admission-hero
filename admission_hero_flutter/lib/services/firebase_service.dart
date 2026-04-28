import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'storage_service.dart';
import '../utils/constants.dart';

// ── Background message handler (must be top-level) ──────────────────────────
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('🔔 FCM Background message: ${message.messageId}');
  debugPrint('   Title: ${message.notification?.title}');
  debugPrint('   Body:  ${message.notification?.body}');
}

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  // ── Initialize Firebase ────────────────────────────────────────────────────
  static Future<void> initializeFirebase() async {
    await Firebase.initializeApp();
    debugPrint('✅ Firebase initialized');
  }

  // ── Initialize all Firebase services ──────────────────────────────────────
  Future<void> initialize() async {
    try {
      // Set background handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // Request notification permission (iOS & Android 13+)
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('🔔 FCM Permission: ${settings.authorizationStatus}');

      // Get FCM token
      await _refreshFcmToken();

      // Listen for token refresh
      _messaging.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        debugPrint('🔔 FCM Token refreshed: $newToken');
        _syncTokenWithBackend(newToken);
      });

      // Foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // App opened from notification (background → foreground)
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // App opened from terminated state
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('🔔 App opened from terminated via notification');
        _handleNotificationTap(initialMessage);
      }

      // Log app_open event
      await _analytics.logAppOpen();
      debugPrint('✅ FirebaseService fully initialized');
    } catch (e) {
      debugPrint('❌ FirebaseService init error: $e');
    }
  }

  // ── Get & sync FCM token ───────────────────────────────────────────────────
  Future<void> _refreshFcmToken() async {
    try {
      _fcmToken = await _messaging.getToken();
      debugPrint('🔔 FCM Token: $_fcmToken');
      if (_fcmToken != null) {
        await _syncTokenWithBackend(_fcmToken!);
      }
    } catch (e) {
      debugPrint('❌ FCM token error: $e');
    }
  }

  // ── Sync FCM token with backend ────────────────────────────────────────────
  Future<void> _syncTokenWithBackend(String token) async {
    try {
      final authToken = await StorageService.getToken();
      if (authToken == null) {
        debugPrint('⚠️ No auth token — FCM token not synced yet');
        return;
      }

      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/auth/fcm-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({'fcmToken': token}),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ FCM token synced with backend');
      } else {
        debugPrint('⚠️ FCM token sync failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('⚠️ FCM token sync error: $e');
    }
  }

  // ── Sync after login (call from AuthProvider after login) ──────────────────
  Future<void> syncTokenAfterLogin() async {
    if (_fcmToken != null) {
      await _syncTokenWithBackend(_fcmToken!);
    } else {
      await _refreshFcmToken();
    }
  }

  // ── Foreground message handler ─────────────────────────────────────────────
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('🔔 FCM Foreground: ${message.notification?.title}');
    debugPrint('   Body: ${message.notification?.body}');
    debugPrint('   Data: ${message.data}');
    // NotificationService will pick this up via the stream
    _onMessageReceived?.call(message);
  }

  // ── Notification tap handler ───────────────────────────────────────────────
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('🔔 Notification tapped: ${message.data}');
    _onNotificationTap?.call(message);
  }

  // ── Callbacks (set from main or provider) ─────────────────────────────────
  Function(RemoteMessage)? _onMessageReceived;
  Function(RemoteMessage)? _onNotificationTap;

  void setOnMessageReceived(Function(RemoteMessage) callback) {
    _onMessageReceived = callback;
  }

  void setOnNotificationTap(Function(RemoteMessage) callback) {
    _onNotificationTap = callback;
  }

  // ── Analytics helpers ──────────────────────────────────────────────────────
  Future<void> logLogin(String method) async {
    try {
      await _analytics.logLogin(loginMethod: method);
    } catch (e) {
      debugPrint('Analytics logLogin error: $e');
    }
  }

  Future<void> logSignUp(String method) async {
    try {
      await _analytics.logSignUp(signUpMethod: method);
    } catch (e) {
      debugPrint('Analytics logSignUp error: $e');
    }
  }

  Future<void> logEvent(String name, {Map<String, Object>? params}) async {
    try {
      await _analytics.logEvent(name: name, parameters: params);
    } catch (e) {
      debugPrint('Analytics logEvent error: $e');
    }
  }

  Future<void> logScreenView(String screenName) async {
    try {
      await _analytics.logScreenView(screenName: screenName);
    } catch (e) {
      debugPrint('Analytics logScreenView error: $e');
    }
  }

  Future<void> setUserId(String userId) async {
    try {
      await _analytics.setUserId(id: userId);
    } catch (e) {
      debugPrint('Analytics setUserId error: $e');
    }
  }

  Future<void> clearUserId() async {
    try {
      await _analytics.setUserId(id: null);
    } catch (e) {
      debugPrint('Analytics clearUserId error: $e');
    }
  }
}
