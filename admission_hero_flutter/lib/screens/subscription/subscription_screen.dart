import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  bool _isProcessing = false;
  String? _processingPlanId;

  static const _plans = [
    {
      'id': 'basic',
      'name': 'Basic',
      'duration': 1,
      'price': 299,
      'popular': false,
      'features': [
        'Access to all exams',
        'Study materials',
        'Basic analytics',
        'Email support'
      ],
    },
    {
      'id': 'standard',
      'name': 'Standard',
      'duration': 3,
      'price': 799,
      'popular': true,
      'features': [
        'Everything in Basic',
        'Video explanations',
        'Advanced analytics',
        'Priority support',
        'Offline access'
      ],
    },
    {
      'id': 'premium',
      'name': 'Premium',
      'duration': 6,
      'price': 1499,
      'popular': false,
      'features': [
        'Everything in Standard',
        'Live classes',
        'One-on-one mentoring',
        'Mock interviews',
        'Lifetime access'
      ],
    },
  ];

  Future<void> _handleSubscribe(Map<String, dynamic> plan) async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
      _processingPlanId = plan['id'] as String;
    });

    try {
      final response = await ApiService().post('/payments/bkash/create', {
        'planId': plan['id'],
        'amount': plan['price'],
        'planName': plan['name'],
        'duration': plan['duration'],
        'payerReference': '01770618575',
      });

      if (!mounted) return;

      final paymentUrl = response['paymentURL'] as String?;

      if (paymentUrl != null && paymentUrl.isNotEmpty) {
        final uri = Uri.parse(paymentUrl);
        final launched = await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );

        if (!launched && mounted) {
          // fallback: show dialog with URL
          _showPaymentDialog(paymentUrl, plan['name'] as String);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment URL not received. Please try again.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed: ${e.toString()}'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _processingPlanId = null;
        });
      }
    }
  }

  void _showPaymentDialog(String url, String planName) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFE2136E).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('bKash', style: TextStyle(color: Color(0xFFE2136E), fontWeight: FontWeight.w900, fontSize: 13)),
          ),
          const SizedBox(width: 10),
          const Text('Payment', style: TextStyle(fontWeight: FontWeight.w700)),
        ]),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Plan: $planName', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 8),
          const Text(
            'Your bKash payment is ready. Tap "Open bKash" to complete the payment.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
        ]),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
              } catch (_) {}
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE2136E),
              foregroundColor: Colors.white,
            ),
            child: const Text('Open bKash'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
          statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(
                  top: MediaQuery.of(context).padding.top + 10,
                  left: 8,
                  right: 16,
                  bottom: 14),
              child: Row(children: [
                IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context)),
                const Text('Subscription Plans',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text('Choose a plan that works best for you',
                        style: TextStyle(fontSize: 14, color: AppColors.textMuted),
                        textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    // bKash badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE2136E).withOpacity(0.08),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2136E).withOpacity(0.3)),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.payment, color: Color(0xFFE2136E), size: 18),
                        const SizedBox(width: 6),
                        const Text('Powered by bKash',
                            style: TextStyle(
                                color: Color(0xFFE2136E),
                                fontWeight: FontWeight.w600,
                                fontSize: 13)),
                      ]),
                    ),
                    const SizedBox(height: 20),

                    ..._plans.map((plan) => _buildPlanCard(plan)),

                    const SizedBox(height: 20),

                    // Why Premium card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBg,
                        borderRadius: BorderRadius.circular(20),
                        border:
                            Border.all(color: AppColors.primary.withOpacity(0.3)),
                      ),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              const Icon(Icons.shield_outlined,
                                  color: AppColors.primary, size: 24),
                              const SizedBox(width: 10),
                              const Text('Why Premium?',
                                  style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primary)),
                            ]),
                            const SizedBox(height: 10),
                            const Text(
                              'Get unlimited access to all exams, expert video solutions, live classes, and personalized mentoring to ace your admission exam.',
                              style: TextStyle(
                                  fontSize: 14,
                                  color: AppColors.textSecondary,
                                  height: 1.6),
                            ),
                          ]),
                    ),
                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 2),
      ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan) {
    final isPopular = plan['popular'] as bool;
    final features = plan['features'] as List;
    final isThisPlanProcessing = _isProcessing && _processingPlanId == plan['id'];

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: isPopular ? AppColors.primary : AppColors.border,
            width: isPopular ? 2 : 1),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)
        ],
      ),
      clipBehavior: Clip.hardEdge,
      child: Column(
        children: [
          if (isPopular)
            Container(
              width: double.infinity,
              color: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: const Center(
                child: Text('MOST POPULAR',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1)),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(plan['name'] as String,
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary)),
                    Text(
                        '${plan['duration']} month${(plan['duration'] as int) > 1 ? 's' : ''}',
                        style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                  ]),
                  Column(children: [
                    Text('৳ ${plan['price']}',
                        style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary)),
                    const Text('total',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ]),
                ]),

                const SizedBox(height: 16),
                const Divider(color: AppColors.border),
                const SizedBox(height: 12),

                ...features.map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(children: [
                        const Icon(Icons.check_circle,
                            color: AppColors.success, size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                            child: Text(f as String,
                                style: const TextStyle(
                                    fontSize: 14, color: AppColors.textSecondary))),
                      ]),
                    )),

                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: (_isProcessing) ? null : () => _handleSubscribe(plan),
                    style: ElevatedButton.styleFrom(
                      backgroundColor:
                          isPopular ? AppColors.primary : AppColors.borderLight,
                      foregroundColor:
                          isPopular ? Colors.white : AppColors.textPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 0,
                    ),
                    child: isThisPlanProcessing
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            const Text('Pay with ', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                            Text('bKash',
                                style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15,
                                    color: isPopular ? Colors.white : const Color(0xFFE2136E))),
                          ]),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
