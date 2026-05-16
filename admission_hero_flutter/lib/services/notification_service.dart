import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  static const String baseUrl = AppConstants.baseUrl;
  
  final List<AppNotification> _notifications = [];
  final ValueNotifier<List<AppNotification>> notificationsNotifier = ValueNotifier([]);

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  // Initialize notification service
  Future<void> initialize() async {
    try {
      print('DEBUG: Notification service initialized');
      await fetchNotifications();
    } catch (e) {
      print('DEBUG: Notification initialization error: $e');
      _addSampleNotifications(); // Fallback to sample notifications
    }
  }

  // Get auth token
  Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Fetch notifications from backend
  Future<void> fetchNotifications() async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        print('DEBUG: No auth token found');
        return;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          _notifications.clear();
          
          for (var notificationData in data['data']) {
            final notification = AppNotification.fromJson(notificationData);
            _notifications.add(notification);
          }
          
          notificationsNotifier.value = List.from(_notifications);
          print('DEBUG: Fetched ${_notifications.length} notifications');
        }
      } else {
        print('DEBUG: Failed to fetch notifications: ${response.statusCode}');
        _addSampleNotifications(); // Fallback
      }
    } catch (e) {
      print('DEBUG: Error fetching notifications: $e');
      _addSampleNotifications(); // Fallback
    }
  }

  // Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) return;

      final response = await http.put(
        Uri.parse('$baseUrl/notifications/$notificationId/read'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final index = _notifications.indexWhere((n) => n.id == notificationId);
        if (index != -1) {
          _notifications[index] = _notifications[index].copyWith(isRead: true);
          notificationsNotifier.value = List.from(_notifications);
        }
      }
    } catch (e) {
      print('DEBUG: Error marking notification as read: $e');
      // Update locally anyway
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        _notifications[index] = _notifications[index].copyWith(isRead: true);
        notificationsNotifier.value = List.from(_notifications);
      }
    }
  }

  // Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return;

      final response = await http.put(
        Uri.parse('$baseUrl/notifications/read-all'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        for (int i = 0; i < _notifications.length; i++) {
          _notifications[i] = _notifications[i].copyWith(isRead: true);
        }
        notificationsNotifier.value = List.from(_notifications);
      }
    } catch (e) {
      print('DEBUG: Error marking all notifications as read: $e');
      // Update locally anyway
      for (int i = 0; i < _notifications.length; i++) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
      }
      notificationsNotifier.value = List.from(_notifications);
    }
  }

  // Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) return;

      final response = await http.delete(
        Uri.parse('$baseUrl/notifications/$notificationId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        _notifications.removeWhere((n) => n.id == notificationId);
        notificationsNotifier.value = List.from(_notifications);
      }
    } catch (e) {
      print('DEBUG: Error deleting notification: $e');
      // Delete locally anyway
      _notifications.removeWhere((n) => n.id == notificationId);
      notificationsNotifier.value = List.from(_notifications);
    }
  }

  // Get notification statistics
  Future<Map<String, dynamic>?> getNotificationStats() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/notifications/stats'),
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
      print('DEBUG: Error getting notification stats: $e');
    }
    return null;
  }

  // Add sample notifications for demo
  void _addSampleNotifications() {
    final sampleNotifications = [
      AppNotification(
        id: '1',
        title: 'স্বাগতম Admission Hero তে!',
        body: 'আপনার স্বপ্নের বিশ্ববিদ্যালয়ে ভর্তির জন্য প্রস্তুত হন',
        type: NotificationType.welcome,
        timestamp: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      AppNotification(
        id: '2',
        title: 'নতুন প্রশ্ন সেট যোগ হয়েছে',
        body: 'ঢাকা বিশ্ববিদ্যালয় A ইউনিট ২০২৪ এর নতুন প্রশ্ন সেট এখন উপলব্ধ',
        type: NotificationType.newContent,
        timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      AppNotification(
        id: '3',
        title: 'পরীক্ষার ফলাফল প্রস্তুত',
        body: 'আপনার সর্বশেষ পরীক্ষার ফলাফল দেখুন এবং উন্নতির জন্য পরামর্শ নিন',
        type: NotificationType.examResult,
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        isRead: true,
      ),
    ];

    _notifications.addAll(sampleNotifications);
    notificationsNotifier.value = List.from(_notifications);
  }

  // Show local notification
  void showNotification(AppNotification notification) {
    _notifications.insert(0, notification);
    notificationsNotifier.value = List.from(_notifications);
    
    print('DEBUG: Showing notification: ${notification.title}');
  }

  // Clear all notifications
  void clearAll() {
    _notifications.clear();
    notificationsNotifier.value = [];
  }

  // Send exam reminder
  void sendExamReminder(String examName, DateTime examTime) {
    final notification = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'পরীক্ষার রিমাইন্ডার',
      body: '$examName পরীক্ষা ${_formatTime(examTime)} এ শুরু হবে',
      type: NotificationType.reminder,
      timestamp: DateTime.now(),
    );
    
    showNotification(notification);
  }

  // Send performance update
  void sendPerformanceUpdate(String message) {
    final notification = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'পারফরমেন্স আপডেট',
      body: message,
      type: NotificationType.performance,
      timestamp: DateTime.now(),
    );
    
    showNotification(notification);
  }

  // Send subscription reminder
  void sendSubscriptionReminder(DateTime expiryDate) {
    final daysLeft = expiryDate.difference(DateTime.now()).inDays;
    final notification = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'সাবস্ক্রিপশন রিমাইন্ডার',
      body: 'আপনার সাবস্ক্রিপশন $daysLeft দিন পর শেষ হবে। নবায়ন করুন।',
      type: NotificationType.subscription,
      timestamp: DateTime.now(),
    );
    
    showNotification(notification);
  }

  String _formatTime(DateTime time) {
    final hour = time.hour > 12 ? time.hour - 12 : time.hour;
    final period = time.hour >= 12 ? 'PM' : 'AM';
    return '${hour == 0 ? 12 : hour}:${time.minute.toString().padLeft(2, '0')} $period';
  }
}

enum NotificationType {
  welcome,
  newContent,
  examResult,
  reminder,
  performance,
  subscription,
  general,
}

class AppNotification {
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final DateTime timestamp;
  final bool isRead;
  final String? imageUrl;
  final Map<String, dynamic>? data;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.imageUrl,
    this.data,
  });

  // Create from JSON (backend response)
  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'] ?? json['id'],
      title: json['title'],
      body: json['message'],
      type: _parseNotificationType(json['type']),
      timestamp: DateTime.parse(json['timestamp']),
      isRead: json['isRead'] ?? false,
      data: json['data'],
    );
  }

  static NotificationType _parseNotificationType(String? type) {
    switch (type) {
      case 'exam':
        return NotificationType.examResult;
      case 'payment':
        return NotificationType.subscription;
      case 'chat':
        return NotificationType.general;
      case 'announcement':
        return NotificationType.newContent;
      case 'system':
      default:
        return NotificationType.general;
    }
  }

  AppNotification copyWith({
    String? id,
    String? title,
    String? body,
    NotificationType? type,
    DateTime? timestamp,
    bool? isRead,
    String? imageUrl,
    Map<String, dynamic>? data,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      imageUrl: imageUrl ?? this.imageUrl,
      data: data ?? this.data,
    );
  }

  IconData get icon {
    switch (type) {
      case NotificationType.welcome:
        return Icons.waving_hand;
      case NotificationType.newContent:
        return Icons.library_books;
      case NotificationType.examResult:
        return Icons.assessment;
      case NotificationType.reminder:
        return Icons.alarm;
      case NotificationType.performance:
        return Icons.trending_up;
      case NotificationType.subscription:
        return Icons.card_membership;
      case NotificationType.general:
        return Icons.notifications;
    }
  }

  Color get color {
    switch (type) {
      case NotificationType.welcome:
        return Colors.blue;
      case NotificationType.newContent:
        return Colors.green;
      case NotificationType.examResult:
        return Colors.orange;
      case NotificationType.reminder:
        return Colors.red;
      case NotificationType.performance:
        return Colors.purple;
      case NotificationType.subscription:
        return Colors.amber;
      case NotificationType.general:
        return Colors.grey;
    }
  }
}