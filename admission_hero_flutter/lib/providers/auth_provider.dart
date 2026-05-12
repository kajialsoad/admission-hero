import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/firebase_service.dart';
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
  bool get isInitialized => !_isLoading;
  String? get errorMessage => _errorMessage;

  final ApiService _api = ApiService();
  final FirebaseService _firebase = FirebaseService();

  // ── Initialize (restore session) ──────────────────────────────────────────
  Future<void> initialize() async {
    try {
      final token = await StorageService.getToken();
      final user = await StorageService.getUser();

      if (token != null && user != null) {
        _token = token;
        _user = user;

        // Sync Firebase user after restoring session (don't await to speed up)
        _firebase.setUserId(user.id).then((_) {
          _firebase.syncTokenAfterLogin();
        });
        debugPrint('✅ Session restored for user: ${user.name}');
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

      // ── Firebase hooks after login ──────────────────────────────────────
      await _firebase.setUserId(_user!.id);
      await _firebase.syncTokenAfterLogin();
      await _firebase.logLogin('phone');

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

        // ── Firebase hooks after register ─────────────────────────────────
        await _firebase.setUserId(_user!.id);
        await _firebase.syncTokenAfterLogin();
        await _firebase.logSignUp('phone');

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

  // ── Update User ───────────────────────────────────────────────────────────
  Future<bool> updateUser({
    required String name,
    required String email,
    required String phone,
    String? avatar,
  }) async {
    _errorMessage = null;
    try {
      final Map<String, dynamic> requestBody = {
        'name': name.trim(),
        'email': email.trim(),
        'phone': phone.trim(),
      };
      
      if (avatar != null) {
        requestBody['avatar'] = avatar;
      }

      final response = await _api.put(
        AppConstants.profileEndpoint,
        requestBody,
      );

      final userData = response['user'];
      if (userData != null) {
        _user = UserModel.fromJson(userData);
        await StorageService.saveUser(_user!);
        notifyListeners();
        return true;
      }
      return false;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Update failed. Please try again.';
      notifyListeners();
      return false;
    }
  }

  // ── Refresh User Data ─────────────────────────────────────────────────────
  Future<bool> refreshUser() async {
    try {
      final response = await _api.get(AppConstants.profileEndpoint);

      final userData = response['user'];
      if (userData != null) {
        _user = UserModel.fromJson(userData);
        await StorageService.saveUser(_user!);
        notifyListeners();
        debugPrint('✅ User data refreshed: ${_user!.subscriptionStatus}');
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Failed to refresh user data: $e');
      return false;
    }
  }

  // ── Forgot Password ───────────────────────────────────────────────────────
  Future<bool> forgotPassword(String email) async {
    _errorMessage = null;
    try {
      await _api.post(
        '/auth/forgot-password',
        {'email': email.trim()},
        requiresAuth: false,
      );
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Failed to send reset email. Please try again.';
      notifyListeners();
      return false;
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  Future<void> logout() async {
    // ── Firebase clear on logout ───────────────────────────────────────────
    await _firebase.clearUserId();

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
