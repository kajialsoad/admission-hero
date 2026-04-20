import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../utils/constants.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = true;
  String? _errorMessage;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null && _token != null;
  String? get errorMessage => _errorMessage;

  final ApiService _api = ApiService();

  // ── Initialize (restore session) ──────────────────────────────────────────
  Future<void> initialize() async {
    try {
      _isLoading = true;
      notifyListeners();

      final token = await StorageService.getToken();
      final user = await StorageService.getUser();

      if (token != null && user != null) {
        _token = token;
        _user = user;
      }
    } catch (e) {
      debugPrint('AuthProvider init error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  Future<bool> login(String phoneOrEmail, String password) async {
    _errorMessage = null;
    try {
      final response = await _api.post(
        AppConstants.loginEndpoint,
        {
          'phoneOrEmail': phoneOrEmail.trim(),
          'password': password.trim(),
        },
        requiresAuth: false,
      );

      final token = response['token'];
      final userData = response['user'];

      if (token == null || userData == null) {
        _errorMessage = 'Invalid response from server.';
        notifyListeners();
        return false;
      }

      _token = token;
      _user = UserModel.fromJson(userData);

      await StorageService.saveToken(token);
      await StorageService.saveUser(_user!);

      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Login failed. Please try again.';
      notifyListeners();
      return false;
    }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    _errorMessage = null;
    try {
      final response = await _api.post(
        AppConstants.registerEndpoint,
        {
          'name': name.trim(),
          'email': email.trim(),
          'phone': phone.trim(),
          'password': password.trim(),
        },
        requiresAuth: false,
      );

      // If backend auto-logs in (returns token)
      if (response['token'] != null && response['user'] != null) {
        _token = response['token'];
        _user = UserModel.fromJson(response['user']);
        await StorageService.saveToken(_token!);
        await StorageService.saveUser(_user!);
        notifyListeners();
        return {'success': true, 'autoLogin': true};
      }

      return {'success': true, 'message': response['message']};
    } on ApiException catch (e) {
      _errorMessage = e.message;
      notifyListeners();
      return {'success': false, 'message': e.message};
    } catch (e) {
      _errorMessage = 'Registration failed. Please try again.';
      notifyListeners();
      return {'success': false, 'message': _errorMessage};
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  Future<void> logout() async {
    _user = null;
    _token = null;
    _errorMessage = null;
    await StorageService.clearAll();
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
