import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class StatisticsProvider with ChangeNotifier {
  int _totalExams = 0;
  int _totalQuestions = 0;
  int _totalVideos = 0;
  bool _isLoading = false;
  String? _error;

  int get totalExams => _totalExams;
  int get totalQuestions => _totalQuestions;
  int get totalVideos => _totalVideos;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchStatistics() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.getStatistics();
      
      if (response != null && response['success'] == true) {
        final data = response['data'];
        _totalExams = data['totalExams'] ?? 0;
        _totalQuestions = data['totalQuestions'] ?? 0;
        _totalVideos = data['totalVideos'] ?? 0;
      } else {
        _error = 'Failed to load statistics';
      }
    } catch (e) {
      print('Error fetching statistics: $e');
      _error = e.toString();
      // Set default values on error
      _totalExams = 0;
      _totalQuestions = 0;
      _totalVideos = 0;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
