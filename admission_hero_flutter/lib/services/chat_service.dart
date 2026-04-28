import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ChatService {
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal();

  static const String baseUrl = 'https://munns-production.up.railway.app/api';

  // Get auth token
  Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Send message to backend
  Future<Map<String, dynamic>?> sendMessage({
    required String message,
    required String conversationId,
    String messageType = 'text',
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        print('DEBUG: No auth token found');
        return null;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/chat/send'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'message': message,
          'conversationId': conversationId,
          'messageType': messageType,
          'metadata': metadata,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data'];
        }
      } else {
        print('DEBUG: Failed to send message: ${response.statusCode}');
      }
    } catch (e) {
      print('DEBUG: Error sending message: $e');
    }
    return null;
  }

  // Get chat messages
  Future<List<Map<String, dynamic>>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        print('DEBUG: No auth token found');
        return [];
      }

      final response = await http.get(
        Uri.parse('$baseUrl/chat/conversation/$conversationId?page=$page&limit=$limit'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return List<Map<String, dynamic>>.from(data['data']);
        }
      } else {
        print('DEBUG: Failed to get messages: ${response.statusCode}');
      }
    } catch (e) {
      print('DEBUG: Error getting messages: $e');
    }
    return [];
  }

  // Mark messages as read
  Future<bool> markMessagesAsRead(String conversationId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) return false;

      final response = await http.put(
        Uri.parse('$baseUrl/chat/read/$conversationId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      print('DEBUG: Error marking messages as read: $e');
      return false;
    }
  }

  // Get unread message count
  Future<int> getUnreadCount(String conversationId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) return 0;

      final response = await http.get(
        Uri.parse('$baseUrl/chat/unread/$conversationId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data']['unreadCount'] ?? 0;
        }
      }
    } catch (e) {
      print('DEBUG: Error getting unread count: $e');
    }
    return 0;
  }

  // Send auto-response request
  Future<Map<String, dynamic>?> requestAutoResponse({
    required String message,
    required String conversationId,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

      final response = await http.post(
        Uri.parse('$baseUrl/chat/auto-response'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'message': message,
          'conversationId': conversationId,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data'];
        }
      }
    } catch (e) {
      print('DEBUG: Error requesting auto-response: $e');
    }
    return null;
  }

  // Generate conversation ID for user
  String generateConversationId(String userId) {
    return 'support_$userId';
  }
}