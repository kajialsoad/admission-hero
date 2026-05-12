import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class BannerProvider extends ChangeNotifier {
  List<BannerModel> _banners = [];
  bool _isLoading = false;
  String? _error;

  List<BannerModel> get banners => _banners;
  bool get isLoading => _isLoading;
  String? get error => _error;

  final ApiService _api = ApiService();

  Future<void> fetchBanners() async {
    if (_banners.isNotEmpty) return; // Prevent unnecessary refetches
    
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(AppConstants.bannersEndpoint, requiresAuth: false);
      
      if (response['success'] == true && response['data'] != null) {
        final List<dynamic> data = response['data'];
        _banners = data.map((b) => BannerModel.fromJson(b)).toList();
      } else {
        _error = 'Failed to load banners format.';
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Failed to load banners.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshBanners() async {
    _banners = [];
    await fetchBanners();
  }
}
