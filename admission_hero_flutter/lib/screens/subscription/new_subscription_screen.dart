import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/models.dart';
import '../../providers/subscription_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/google_play_billing_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import '../../widgets/youtube_player_web.dart' if (dart.library.io) '../../widgets/youtube_player_stub.dart';

class NewSubscriptionScreen extends StatefulWidget {
  const NewSubscriptionScreen({super.key});

  @override
  State<NewSubscriptionScreen> createState() => _NewSubscriptionScreenState();
}

class _NewSubscriptionScreenState extends State<NewSubscriptionScreen> {
  final TextEditingController _promoController = TextEditingController();
  String _selectedPaymentMethod = 'bkash';
  bool _isProcessing = false;
  YoutubePlayerController? _youtubeController;
  String? _currentVideoUrl;

  @override
  void initState() {
    super.initState();
    // Schedule the data loading after the first frame to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _initializeYoutubePlayer(String videoId) {
    print('DEBUG: Initializing YouTube player with video ID: $videoId');
    
    // For web, just store the URL
    if (kIsWeb) {
      _currentVideoUrl = 'https://www.youtube.com/embed/$videoId';
      print('DEBUG: Web - Set video URL: $_currentVideoUrl');
      if (mounted) {
        setState(() {});
      }
      return;
    }
    
    // For mobile, use YouTube controller
    _youtubeController?.dispose();
    
    _youtubeController = YoutubePlayerController(
      initialVideoId: videoId,
      flags: const YoutubePlayerFlags(
        autoPlay: false,
        mute: false,
      ),
    );
    
    print('DEBUG: Mobile - YouTube controller initialized');
    if (mounted) {
      setState(() {});
    }
  }

  String? _extractYoutubeVideoId(String? url) {
    if (url == null || url.isEmpty) {
      print('DEBUG: Video URL is null or empty');
      return null;
    }
    
    print('DEBUG: Extracting video ID from: $url');
    
    // If it's already just an ID (11 characters, alphanumeric with dash/underscore)
    if (RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(url)) {
      print('DEBUG: URL is already a video ID: $url');
      return url;
    }
    
    // Extract from various YouTube URL formats
    final patterns = [
      RegExp(r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})'),
      RegExp(r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})'),
      RegExp(r'youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})'),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(url);
      if (match != null && match.groupCount >= 1) {
        final videoId = match.group(1);
        print('DEBUG: Extracted video ID: $videoId');
        return videoId;
      }
    }
    
    print('DEBUG: Could not extract video ID from URL');
    return null;
  }

  Future<void> _loadData() async {
    final provider = context.read<SubscriptionProvider>();
    await provider.loadPackages();
    await provider.checkSubscriptionStatus();
    
    // Auto-select first package if available
    if (provider.packages.isNotEmpty && provider.selectedPackage == null) {
      provider.selectPackage(provider.packages.first);
      
      // Initialize video if first package has video URL
      final firstPackage = provider.packages.first;
      if (firstPackage.videoUrl != null && firstPackage.videoUrl!.isNotEmpty) {
        final videoId = _extractYoutubeVideoId(firstPackage.videoUrl);
        print('DEBUG: First package video URL: ${firstPackage.videoUrl}');
        print('DEBUG: Extracted video ID: $videoId');
        if (videoId != null) {
          _initializeYoutubePlayer(videoId);
        }
      }
    }
    
    // Set default payment method based on what's enabled
    if (provider.bkashEnabled) {
      setState(() {
        _selectedPaymentMethod = 'bkash';
      });
    } else if (provider.googlePlayEnabled) {
      setState(() {
        _selectedPaymentMethod = 'google_play';
      });
    }
  }

  @override
  void dispose() {
    if (!kIsWeb) {
      _youtubeController?.dispose();
    }
    _promoController.dispose();
    super.dispose();
  }

  Future<void> _applyPromoCode() async {
    final provider = context.read<SubscriptionProvider>();
    final code = _promoController.text.trim();
    
    if (code.isEmpty) {
      _showMessage('Please enter a promo code', isError: true);
      return;
    }

    final success = await provider.applyPromoCode(code);
    
    if (success) {
      _showMessage('Promo code applied successfully!');
    } else {
      _showMessage(provider.error ?? 'Invalid promo code', isError: true);
    }
  }

  Future<void> _proceedToPayment() async {
    final provider = context.read<SubscriptionProvider>();
    
    if (provider.selectedPackage == null) {
      _showMessage('Please select a package', isError: true);
      return;
    }

    if (_selectedPaymentMethod == 'bkash') {
      await _processBKashPayment();
    } else if (_selectedPaymentMethod == 'google_play') {
      await _processGooglePlayPayment();
    }
  }

  Future<void> _processGooglePlayPayment() async {
    final provider = context.read<SubscriptionProvider>();
    
    setState(() => _isProcessing = true);
    
    try {
      // Initialize Google Play Billing Service
      final billingService = GooglePlayBillingService();
      final initialized = await billingService.initialize();
      
      if (!initialized) {
        _showMessage('Google Play Billing not available', isError: true);
        return;
      }

      // Determine product ID based on package type
      String productId;
      if (provider.selectedPackage?.type == 'monthly') {
        productId = GooglePlayBillingService.monthlyProductId;
      } else if (provider.selectedPackage?.type == 'yearly') {
        productId = GooglePlayBillingService.yearlyProductId;
      } else {
        _showMessage('Invalid package type', isError: true);
        return;
      }

      // Set up purchase callbacks
      billingService.onPurchaseSuccess = (purchaseDetails) async {
        print('[GooglePlay] Purchase successful: ${purchaseDetails.productID}');
        
        // Get purchase token
        final purchaseToken = billingService.getPurchaseToken(purchaseDetails);
        
        if (purchaseToken == null) {
          _showMessage('Failed to get purchase token', isError: true);
          return;
        }

        // Verify purchase with backend
        final result = await provider.verifyGooglePlayPurchase(
          productId: purchaseDetails.productID,
          purchaseToken: purchaseToken,
          orderId: purchaseDetails.purchaseID,
        );

        if (result != null && result['success'] == true) {
          _showMessage('Subscription activated successfully!', isError: false);
          
          // Navigate back to home
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            Navigator.of(context).popUntil((route) => route.isFirst);
          }
        } else {
          _showMessage('Failed to verify purchase', isError: true);
        }
      };

      billingService.onPurchaseError = (error) {
        print('[GooglePlay] Purchase error: $error');
        _showMessage(error, isError: true);
      };

      // Initiate purchase
      final success = await billingService.purchaseProduct(productId);
      
      if (!success) {
        _showMessage('Failed to initiate purchase', isError: true);
      }
      
    } catch (e) {
      print('[GooglePlay] Payment error: $e');
      _showMessage('Payment failed: $e', isError: true);
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<void> _processBKashPayment() async {
    final provider = context.read<SubscriptionProvider>();
    
    final result = await provider.createBKashPayment();
    
    if (result != null && result['paymentURL'] != null) {
      final paymentURL = result['paymentURL'];
      
      // Launch bKash payment URL
      final uri = Uri.parse(paymentURL);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        
        // Show message
        _showMessage('Redirecting to bKash payment...');
        
        // Wait a bit and then refresh subscription status
        Future.delayed(const Duration(seconds: 3), () async {
          if (mounted) {
            await provider.checkSubscriptionStatus();
            
            // Check if subscription is now active
            if (provider.hasSubscription) {
              _showMessage('✅ Payment Successful! Subscription Activated!');
              
              // Navigate back to home after 2 seconds
              Future.delayed(const Duration(seconds: 2), () {
                if (mounted) {
                  Navigator.of(context).popUntil((route) => route.isFirst);
                }
              });
            }
          }
        });
      } else {
        _showMessage('Failed to open bKash payment', isError: true);
      }
    } else {
      _showMessage(provider.error ?? 'Failed to create payment', isError: true);
    }
  }

  void _showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: AppColors.primary,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 10,
                left: 8,
                right: 16,
                bottom: 14,
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Text(
                      'Premium Subscription',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: Consumer<SubscriptionProvider>(
                builder: (context, provider, _) {
                  if (provider.isLoading && provider.packages.isEmpty) {
                    return const Center(
                      child: CircularProgressIndicator(color: AppColors.primary),
                    );
                  }

                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // YouTube Video
                        if (kIsWeb && _currentVideoUrl != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: SizedBox(
                              height: 250,
                              child: YoutubePlayerWeb(videoUrl: _currentVideoUrl!),
                            ),
                          )
                        else if (!kIsWeb && _youtubeController != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: YoutubePlayer(
                              controller: _youtubeController!,
                              showVideoProgressIndicator: true,
                            ),
                          ),

                        const SizedBox(height: 20),

                        // Course Description
                        const Text(
                          'কোর্স সম্পর্কে',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'এই প্রিমিয়াম সাবস্ক্রিপশনে আপনি পাবেন:\n'
                          '• সব প্রশ্নের সম্পূর্ণ এক্সেস\n'
                          '• সব পরীক্ষার এক্সেস\n'
                          '• সব ভিডিও সলিউশন\n'
                          '• পারফরম্যান্স এনালিটিক্স\n'
                          '• প্রায়োরিটি সাপোর্ট',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textMuted,
                            height: 1.6,
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Package Selection
                        const Text(
                          'প্যাকেজ সিলেক্ট করুন',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),

                        ...provider.packages.map((package) => _buildPackageCard(package, provider)),

                        const SizedBox(height: 24),

                        // Promo Code
                        const Text(
                          'প্রোমো কোড (Optional)',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),

                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _promoController,
                                decoration: InputDecoration(
                                  hintText: 'Enter promo code',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                ),
                                textCapitalization: TextCapitalization.characters,
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: provider.appliedPromoCode == null
                                  ? _applyPromoCode
                                  : () {
                                      provider.removePromoCode();
                                      _promoController.clear();
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: provider.appliedPromoCode == null
                                    ? AppColors.primary
                                    : AppColors.error,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Text(
                                provider.appliedPromoCode == null ? 'Apply' : 'Remove',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),

                        if (provider.appliedPromoCode != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.success),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  '${provider.appliedPromoCode!.discountText} applied!',
                                  style: const TextStyle(
                                    color: AppColors.success,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 24),

                        // Payment Method
                        const Text(
                          'পেমেন্ট মেথড',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Payment Methods Section Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'পেমেন্ট মেথড সিলেক্ট করুন',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            // Debug info (remove in production)
                            Text(
                              'bKash: ${provider.bkashEnabled ? "✓" : "✗"} | Google: ${provider.googlePlayEnabled ? "✓" : "✗"}',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Show payment methods based on admin settings
                        if (provider.bkashEnabled)
                          _buildPaymentMethodCard('bkash', 'bKash', Icons.account_balance_wallet),
                        
                        if (provider.bkashEnabled && provider.googlePlayEnabled)
                          const SizedBox(height: 8),
                        
                        if (provider.googlePlayEnabled)
                          _buildPaymentMethodCard('google_play', 'Google Play', Icons.play_arrow),

                        // Show message if no payment methods are enabled
                        if (!provider.bkashEnabled && !provider.googlePlayEnabled)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.red.shade200),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.warning_amber_rounded, color: Colors.red.shade700),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'কোনো পেমেন্ট মেথড এভেইলেবল নেই। দয়া করে সাপোর্টে যোগাযোগ করুন।',
                                    style: TextStyle(
                                      color: Colors.red.shade900,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        const SizedBox(height: 24),

                        // Price Summary
                        if (provider.selectedPackage != null)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Original Price:'),
                                    Text('৳${provider.selectedPackage!.price.toInt()}'),
                                  ],
                                ),
                                if (provider.discountAmount > 0) ...[
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Discount:', style: TextStyle(color: AppColors.success)),
                                      Text(
                                        '- ৳${provider.discountAmount.toInt()}',
                                        style: const TextStyle(color: AppColors.success),
                                      ),
                                    ],
                                  ),
                                ],
                                const Divider(height: 24),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      'Total:',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    Text(
                                      '৳${provider.finalPrice.toInt()}',
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                        const SizedBox(height: 24),

                        // Pay Now Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              // Check if selected package is already paid
                              final user = context.read<AuthProvider>().user;
                              final hasSelectedPackage = user?.subscriptionStatus == 'paid' && 
                                                         user?.subscriptionType != null &&
                                                         provider.selectedPackage != null &&
                                                         _isMatchingPackage(user!.subscriptionType!, provider.selectedPackage!.type);
                              
                              if (hasSelectedPackage) {
                                _showMessage('আপনি ইতিমধ্যে এই প্যাকেজটি কিনেছেন। অন্য প্যাকেজ সিলেক্ট করুন।', isError: true);
                                return;
                              }
                              
                              if (provider.selectedPackage != null && 
                                  !provider.isLoading &&
                                  (provider.bkashEnabled || provider.googlePlayEnabled)) {
                                _proceedToPayment();
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: provider.isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    () {
                                      if (!provider.bkashEnabled && !provider.googlePlayEnabled) {
                                        return 'No Payment Methods Available';
                                      }
                                      
                                      // Check if selected package is already paid
                                      final user = context.read<AuthProvider>().user;
                                      if (provider.selectedPackage != null &&
                                          user?.subscriptionStatus == 'paid' && 
                                          user?.subscriptionType != null &&
                                          _isMatchingPackage(user!.subscriptionType!, provider.selectedPackage!.type)) {
                                        return 'Already Paid - Select Another Package';
                                      }
                                      
                                      return 'Pay Now';
                                    }(),
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),

                        const SizedBox(height: 24),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 3),
      ),
    );
  }

  Widget _buildPackageCard(Package package, SubscriptionProvider provider) {
    final isSelected = provider.selectedPackage?.id == package.id;
    
    // Check if user already has this package type
    final user = context.read<AuthProvider>().user;
    final hasThisPackage = user?.subscriptionStatus == 'paid' && 
                           user?.subscriptionType != null &&
                           _isMatchingPackage(user!.subscriptionType!, package.type);
    
    return GestureDetector(
      onTap: hasThisPackage ? null : () {
        provider.selectPackage(package);
        
        // Initialize video if package has video URL
        if (package.videoUrl != null && package.videoUrl!.isNotEmpty) {
          final videoId = _extractYoutubeVideoId(package.videoUrl);
          if (videoId != null) {
            _initializeYoutubePlayer(videoId);
          }
        } else {
          // Dispose video if no URL
          if (kIsWeb) {
            _currentVideoUrl = null;
          } else {
            _youtubeController?.dispose();
            _youtubeController = null;
          }
          if (mounted) setState(() {});
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: hasThisPackage ? Colors.grey.shade100 : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hasThisPackage 
                ? Colors.grey.shade300
                : (isSelected ? AppColors.primary : AppColors.border),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected && !hasThisPackage
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: hasThisPackage
                      ? Colors.grey.shade400
                      : (isSelected ? AppColors.primary : AppColors.border),
                  width: 2,
                ),
                color: hasThisPackage
                    ? Colors.grey.shade300
                    : (isSelected ? AppColors.primary : Colors.transparent),
              ),
              child: isSelected && !hasThisPackage
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : hasThisPackage
                      ? const Icon(Icons.check, color: Colors.white, size: 16)
                      : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          package.name,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: hasThisPackage ? Colors.grey.shade600 : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      if (hasThisPackage)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.success),
                          ),
                          child: const Text(
                            'Already Paid',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.success,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    package.durationText,
                    style: TextStyle(
                      fontSize: 13,
                      color: hasThisPackage ? Colors.grey.shade500 : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '৳${package.price.toInt()}',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: hasThisPackage 
                    ? Colors.grey.shade600
                    : (isSelected ? AppColors.primary : AppColors.textPrimary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper function to check if subscription type matches package type
  bool _isMatchingPackage(String subscriptionType, String packageType) {
    // subscriptionType: '3-month', '6-month', '12-month'
    // packageType: 'monthly', 'quarterly', 'yearly', etc.
    
    if (subscriptionType == '3-month' && (packageType.contains('3') || packageType.contains('quarter'))) {
      return true;
    }
    if (subscriptionType == '6-month' && packageType.contains('6')) {
      return true;
    }
    if (subscriptionType == '12-month' && (packageType.contains('12') || packageType.contains('year'))) {
      return true;
    }
    if (subscriptionType == '1-month' && (packageType.contains('1') || packageType == 'monthly')) {
      return true;
    }
    
    return false;
  }

  Widget _buildPaymentMethodCard(String method, String title, IconData icon) {
    final isSelected = _selectedPaymentMethod == method;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPaymentMethod = method;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 2,
                ),
                color: isSelected ? AppColors.primary : Colors.transparent,
              ),
              child: isSelected
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : null,
            ),
            const SizedBox(width: 16),
            Icon(icon, color: AppColors.primary),
            const SizedBox(width: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
