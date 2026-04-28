import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../services/firebase_service.dart';
import '../services/notification_service.dart';

class FirebaseProvider extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  final NotificationService _notificationService = NotificationService();

  String? _fcmToken;
  final List<Map<String, dynamic>> _pendingNotifications = [];
  bool _initialized = false;

  String? get fcmToken => _fcmToken;
  List<Map<String, dynamic>> get pendingNotifications => _pendingNotifications;
  bool get initialized => _initialized;

  // ── Initialize Firebase Provider ──────────────────────────────────────────
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      await _firebaseService.initialize();

      _fcmToken = _firebaseService.fcmToken;

      // Foreground message handler
      _firebaseService.setOnMessageReceived(_handleIncomingMessage);

      // Notification tap handler
      _firebaseService.setOnNotificationTap(_handleNotificationTap);

      _initialized = true;
      notifyListeners();
      debugPrint('✅ FirebaseProvider initialized. FCM Token: $_fcmToken');
    } catch (e) {
      debugPrint('❌ FirebaseProvider init error: $e');
    }
  }

  // ── Handle foreground push notification ───────────────────────────────────
  void _handleIncomingMessage(RemoteMessage message) {
    debugPrint('🔔 FirebaseProvider: Incoming message "${message.notification?.title}"');

    final notification = AppNotification(
      id: message.messageId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: message.notification?.title ?? 'নতুন বিজ্ঞপ্তি',
      body: message.notification?.body ?? '',
      type: _parseType(message.data['type']),
      timestamp: DateTime.now(),
      data: message.data,
    );

    _notificationService.showNotification(notification);

    _pendingNotifications.add({
      'id': notification.id,
      'title': notification.title,
      'body': notification.body,
      'timestamp': notification.timestamp.toIso8601String(),
      'data': message.data,
    });

    notifyListeners();
  }

  // ── Handle notification tap ───────────────────────────────────────────────
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('🔔 FirebaseProvider: Notification tapped ${message.data}');
    // Route based on data payload
    final type = message.data['type'];
    final route = _getRouteForType(type, message.data);
    if (route != null) {
      _pendingNavigation = route;
      notifyListeners();
    }
  }

  // Pending navigation route from notification tap
  String? _pendingNavigation;
  Map<String, dynamic>? _pendingNavigationArgs;

  String? get pendingNavigation => _pendingNavigation;
  Map<String, dynamic>? get pendingNavigationArgs => _pendingNavigationArgs;

  void clearPendingNavigation() {
    _pendingNavigation = null;
    _pendingNavigationArgs = null;
    notifyListeners();
  }

  // ── Sync FCM token after user logs in ────────────────────────────────────
  Future<void> onUserLoggedIn(String userId) async {
    await _firebaseService.syncTokenAfterLogin();
    await _firebaseService.setUserId(userId);
    debugPrint('✅ FCM token synced for user: $userId');
  }

  // ── Clear on logout ───────────────────────────────────────────────────────
  Future<void> onUserLoggedOut() async {
    await _firebaseService.clearUserId();
    _pendingNotifications.clear();
    notifyListeners();
  }

  // ── Analytics shortcuts ───────────────────────────────────────────────────
  Future<void> logLogin() => _firebaseService.logLogin('phone');
  Future<void> logSignUp() => _firebaseService.logSignUp('phone');
  Future<void> logScreen(String screenName) => _firebaseService.logScreenView(screenName);
  Future<void> logEvent(String name, {Map<String, Object>? params}) =>
      _firebaseService.logEvent(name, params: params);

  // ── Helpers ───────────────────────────────────────────────────────────────
  NotificationType _parseType(String? type) {
    switch (type) {
      case 'exam':
        return NotificationType.examResult;
      case 'payment':
      case 'subscription':
        return NotificationType.subscription;
      case 'announcement':
        return NotificationType.newContent;
      case 'reminder':
        return NotificationType.reminder;
      case 'performance':
        return NotificationType.performance;
      default:
        return NotificationType.general;
    }
  }

  String? _getRouteForType(String? type, Map<String, dynamic> data) {
    switch (type) {
      case 'exam':
        return '/exam-result';
      case 'subscription':
        return '/subscription';
      case 'announcement':
        return '/notifications';
      default:
        return '/notifications';
    }
  }
}
