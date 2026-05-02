import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/subscription_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  final SubscriptionService _service = SubscriptionService();

  List<Package> _packages = [];
  Package? _selectedPackage;
  PromoCode? _appliedPromoCode;
  bool _isLoading = false;
  String? _error;
  
  // Subscription status
  bool _hasSubscription = false;
  Subscription? _currentSubscription;
  DateTime? _subscriptionExpireAt;
  
  // Enabled payment methods
  bool _bkashEnabled = true;
  bool _googlePlayEnabled = true; // Temporarily true for testing

  // Getters
  List<Package> get packages => _packages;
  Package? get selectedPackage => _selectedPackage;
  PromoCode? get appliedPromoCode => _appliedPromoCode;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasSubscription => _hasSubscription;
  Subscription? get currentSubscription => _currentSubscription;
  DateTime? get subscriptionExpireAt => _subscriptionExpireAt;
  bool get bkashEnabled => _bkashEnabled;
  bool get googlePlayEnabled => _googlePlayEnabled;

  // Calculate final price
  double get finalPrice {
    if (_selectedPackage == null) return 0;
    
    double price = _selectedPackage!.price;
    
    if (_appliedPromoCode != null) {
      double discount = _appliedPromoCode!.calculateDiscount(price);
      price = price - discount;
    }
    
    return price > 0 ? price : 0;
  }

  double get discountAmount {
    if (_selectedPackage == null || _appliedPromoCode == null) return 0;
    return _appliedPromoCode!.calculateDiscount(_selectedPackage!.price);
  }

  // Load packages
  Future<void> loadPackages() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _packages = await _service.getPackages();
      print('Loaded ${_packages.length} packages');
      
      // Also load enabled payment methods
      await loadEnabledPaymentMethods();
    } catch (e) {
      _error = 'Failed to load packages: $e';
      print('Load packages error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Load enabled payment methods
  Future<void> loadEnabledPaymentMethods() async {
    try {
      final methods = await _service.getEnabledPaymentMethods();
      _bkashEnabled = methods['bkashEnabled'] ?? true;
      _googlePlayEnabled = methods['googlePlayEnabled'] ?? false;
      print('Payment methods - bKash: $_bkashEnabled, Google Play: $_googlePlayEnabled');
      // Don't call notifyListeners here - it will be called by the parent method
    } catch (e) {
      print('Load enabled payment methods error: $e');
      // Keep defaults
    }
  }

  // Select package
  void selectPackage(Package package) {
    _selectedPackage = package;
    notifyListeners();
  }

  // Apply promo code
  Future<bool> applyPromoCode(String code) async {
    if (code.trim().isEmpty) {
      _error = 'Please enter a promo code';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final promoCode = await _service.validatePromoCode(code);
      
      if (promoCode != null) {
        _appliedPromoCode = promoCode;
        _error = null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = 'Invalid or expired promo code';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Failed to validate promo code';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Remove promo code
  void removePromoCode() {
    _appliedPromoCode = null;
    notifyListeners();
  }

  // Check subscription status
  Future<void> checkSubscriptionStatus() async {
    try {
      final data = await _service.checkSubscription();
      
      if (data != null) {
        _hasSubscription = data['hasSubscription'] ?? false;
        
        if (data['subscription'] != null) {
          _currentSubscription = Subscription.fromJson(data['subscription']);
        }
        
        if (data['expireAt'] != null) {
          _subscriptionExpireAt = DateTime.tryParse(data['expireAt']);
        }
        
        notifyListeners();
      }
    } catch (e) {
      print('Check subscription status error: $e');
    }
  }

  // Create bKash payment
  Future<Map<String, dynamic>?> createBKashPayment() async {
    if (_selectedPackage == null) {
      _error = 'Please select a package';
      notifyListeners();
      return null;
    }

    print('[DEBUG] Selected package type: ${_selectedPackage!.type}');
    print('[DEBUG] Selected package name: ${_selectedPackage!.name}');
    print('[DEBUG] Selected package id: ${_selectedPackage!.id}');

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _service.createBKashPayment(
        packageType: _selectedPackage!.type,
        promoCode: _appliedPromoCode?.code,
      );

      _isLoading = false;
      notifyListeners();
      
      return result;
    } catch (e) {
      _error = 'Failed to create payment: $e';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // Verify Google Play purchase
  Future<Map<String, dynamic>?> verifyGooglePlayPurchase({
    required String productId,
    required String purchaseToken,
    String? orderId,
  }) async {
    if (_selectedPackage == null) {
      _error = 'Please select a package';
      notifyListeners();
      return null;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _service.verifyGooglePlayPurchase(
        productId: productId,
        purchaseToken: purchaseToken,
        packageType: _selectedPackage!.type,
        orderId: orderId,
      );

      if (result != null && result['success'] == true) {
        // Refresh subscription status
        await checkSubscriptionStatus();
      }

      _isLoading = false;
      notifyListeners();
      
      return result;
    } catch (e) {
      _error = 'Failed to verify purchase: $e';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // Reset
  void reset() {
    _selectedPackage = null;
    _appliedPromoCode = null;
    _error = null;
    notifyListeners();
  }
}
