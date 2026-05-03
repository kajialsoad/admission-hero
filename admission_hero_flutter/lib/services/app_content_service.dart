import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/app_content.dart';
import '../utils/constants.dart';

class AppContentService {
  static Future<AppContent> getContentByKey(String key) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/app-content/$key'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return AppContent.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Content not found');
        }
      } else {
        throw Exception('Failed to load content');
      }
    } catch (e) {
      print('Error fetching content: $e');
      throw Exception('Failed to load content: $e');
    }
  }

  static Future<List<AppContent>> getAllPublishedContent() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/app-content/published'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => AppContent.fromJson(item))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching published content: $e');
      return [];
    }
  }
}
