import 'dart:async';
import 'dart:io';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:flutter/foundation.dart';

class GooglePlayBillingService {
  static final GooglePlayBillingService _instance = GooglePlayBillingService._internal();
  factory GooglePlayBillingService() => _instance;
  GooglePlayBillingService._internal();

  final InAppPurchase _inAppPurchase = InAppPurchase.instance;
  late StreamSubscription<List<PurchaseDetails>> _subscription;
  
  // Product IDs - these should match your Google Play Console products
  static const String monthlyProductId = 'admission_hero_monthly';
  static const String yearlyProductId = 'admission_hero_yearly';
  
  // Available products
  List<ProductDetails> _products = [];
  List<ProductDetails> get products => _products;
  
  // Purchase callback
  Function(PurchaseDetails)? onPurchaseSuccess;
  Function(String)? onPurchaseError;

  /// Initialize Google Play Billing
  Future<bool> initialize() async {
    try {
      // Check if in-app purchase is available
      final bool available = await _inAppPurchase.isAvailable();
      if (!available) {
        print('[GooglePlay] In-app purchase not available');
        return false;
      }

      // Set up Android-specific configuration
      if (Platform.isAndroid) {
        // Note: enablePendingPurchases is no longer needed in newer versions
        // The plugin handles this automatically
        print('[GooglePlay] Android platform detected');
      }

      // Listen to purchase updates
      _subscription = _inAppPurchase.purchaseStream.listen(
        _onPurchaseUpdate,
        onDone: () => print('[GooglePlay] Purchase stream done'),
        onError: (error) => print('[GooglePlay] Purchase stream error: $error'),
      );

      // Load products
      await loadProducts();

      print('[GooglePlay] Billing service initialized successfully');
      return true;
    } catch (e) {
      print('[GooglePlay] Initialization error: $e');
      return false;
    }
  }

  /// Load available products from Google Play
  Future<void> loadProducts() async {
    try {
      const Set<String> productIds = {
        monthlyProductId,
        yearlyProductId,
      };

      final ProductDetailsResponse response = await _inAppPurchase.queryProductDetails(productIds);

      if (response.notFoundIDs.isNotEmpty) {
        print('[GooglePlay] Products not found: ${response.notFoundIDs}');
      }

      if (response.error != null) {
        print('[GooglePlay] Error loading products: ${response.error}');
        return;
      }

      _products = response.productDetails;
      print('[GooglePlay] Loaded ${_products.length} products');
      
      for (var product in _products) {
        print('[GooglePlay] Product: ${product.id} - ${product.title} - ${product.price}');
      }
    } catch (e) {
      print('[GooglePlay] Load products error: $e');
    }
  }

  /// Get product by ID
  ProductDetails? getProduct(String productId) {
    try {
      return _products.firstWhere((product) => product.id == productId);
    } catch (e) {
      print('[GooglePlay] Product not found: $productId');
      return null;
    }
  }

  /// Purchase a product
  Future<bool> purchaseProduct(String productId, {String? userId}) async {
    try {
      final ProductDetails? product = getProduct(productId);
      if (product == null) {
        print('[GooglePlay] Product not found: $productId');
        onPurchaseError?.call('Product not found');
        return false;
      }

      final PurchaseParam purchaseParam = PurchaseParam(
        productDetails: product,
        applicationUserName: userId, // Optional: link purchase to user
      );

      print('[GooglePlay] Initiating purchase for: ${product.id}');
      
      // For subscriptions, use buyNonConsumable
      // For one-time purchases, use buyConsumable
      final bool success = await _inAppPurchase.buyNonConsumable(
        purchaseParam: purchaseParam,
      );

      if (!success) {
        print('[GooglePlay] Purchase initiation failed');
        onPurchaseError?.call('Failed to initiate purchase');
      }

      return success;
    } catch (e) {
      print('[GooglePlay] Purchase error: $e');
      onPurchaseError?.call('Purchase error: $e');
      return false;
    }
  }

  /// Handle purchase updates
  void _onPurchaseUpdate(List<PurchaseDetails> purchaseDetailsList) {
    for (final PurchaseDetails purchaseDetails in purchaseDetailsList) {
      print('[GooglePlay] Purchase update: ${purchaseDetails.status}');
      
      switch (purchaseDetails.status) {
        case PurchaseStatus.pending:
          print('[GooglePlay] Purchase pending: ${purchaseDetails.productID}');
          break;
          
        case PurchaseStatus.purchased:
        case PurchaseStatus.restored:
          print('[GooglePlay] Purchase successful: ${purchaseDetails.productID}');
          _handleSuccessfulPurchase(purchaseDetails);
          break;
          
        case PurchaseStatus.error:
          print('[GooglePlay] Purchase error: ${purchaseDetails.error}');
          onPurchaseError?.call(purchaseDetails.error?.message ?? 'Purchase failed');
          break;
          
        case PurchaseStatus.canceled:
          print('[GooglePlay] Purchase canceled');
          onPurchaseError?.call('Purchase canceled by user');
          break;
      }

      // Complete the purchase (important!)
      if (purchaseDetails.pendingCompletePurchase) {
        _inAppPurchase.completePurchase(purchaseDetails);
      }
    }
  }

  /// Handle successful purchase
  void _handleSuccessfulPurchase(PurchaseDetails purchaseDetails) {
    // Verify purchase with backend
    onPurchaseSuccess?.call(purchaseDetails);
  }

  /// Restore previous purchases
  Future<void> restorePurchases() async {
    try {
      print('[GooglePlay] Restoring purchases...');
      await _inAppPurchase.restorePurchases();
    } catch (e) {
      print('[GooglePlay] Restore purchases error: $e');
      onPurchaseError?.call('Failed to restore purchases');
    }
  }

  /// Get purchase token from purchase details
  String? getPurchaseToken(PurchaseDetails purchaseDetails) {
    if (Platform.isAndroid) {
      final GooglePlayPurchaseDetails androidDetails = 
          purchaseDetails as GooglePlayPurchaseDetails;
      return androidDetails.billingClientPurchase.purchaseToken;
    }
    return null;
  }

  /// Dispose
  void dispose() {
    _subscription.cancel();
  }
}
