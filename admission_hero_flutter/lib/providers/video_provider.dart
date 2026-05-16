import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class VideoProvider extends ChangeNotifier {
  List<VideoModel> _videos = [];
  bool _isLoading = false;
  String? _error;

  List<VideoModel> get videos => _videos;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchVideos({String? universityId, String? unit}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.getVideos(
        universityId: universityId,
        unit: unit,
      );

      if (response != null && response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _videos = data.map((v) => VideoModel.fromJson(v)).toList();
      } else {
        _error = response?['message'] ?? 'Failed to load videos';
      }
    } catch (e) {
      _error = 'Error: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void reset() {
    _videos = [];
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}
