import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/contact_info.dart';
import '../config/api_config.dart';

class SettingsService {
  static Future<ContactInfo> getContactInfo() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/settings/contact-info'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return ContactInfo.fromJson(data['data']);
        }
      }
      
      // Return default if API fails
      return ContactInfo.defaultInfo;
    } catch (e) {
      print('Error fetching contact info: $e');
      // Return default on error
      return ContactInfo.defaultInfo;
    }
  }
}
