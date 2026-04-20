import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class UniversityProvider extends ChangeNotifier {
  List<University> _universities = [];
  bool _isLoading = false;
  String? _error;

  List<University> get universities => _universities;
  bool get isLoading => _isLoading;
  String? get error => _error;

  final ApiService _api = ApiService();

  Future<void> fetchUniversities({int limit = 20}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(
        '${AppConstants.universitiesEndpoint}?limit=$limit',
      );
      final List<dynamic> data = response['data'] ?? [];
      _universities = data.map((u) => University.fromJson(u)).toList();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Failed to load universities.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
