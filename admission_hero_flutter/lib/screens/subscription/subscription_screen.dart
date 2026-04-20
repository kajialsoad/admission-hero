import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  static const _plans = [
    {
      'id': 'basic', 'name': 'Basic', 'duration': 1, 'price': 299, 'popular': false,
      'features': ['Access to all exams', 'Study materials', 'Basic analytics', 'Email support'],
    },
    {
      'id': 'standard', 'name': 'Standard', 'duration': 3, 'price': 799, 'popular': true,
      'features': ['Everything in Basic', 'Video explanations', 'Advanced analytics', 'Priority support', 'Offline access'],
    },
    {
      'id': 'premium', 'name': 'Premium', 'duration': 6, 'price': 1499, 'popular': false,
      'features': ['Everything in Standard', 'Live classes', 'One-on-one mentoring', 'Mock interviews', 'Lifetime access'],
    },
  ];

  Future<void> _handleSubscribe(Map<String, dynamic> plan) async {
    setState(() => _isProcessing = true);
    try {
      final response = await ApiService().post('/payments/bkash/create', {
        'planId': plan['id'],
        'amount': plan['price'],
        'planName': plan['name'],
        'duration': plan['duration'],
        'payerReference': '01770618575',
      });

      if (!mounted) return;
      final paymentUrl = response['paymentURL'];
      if (paymentUrl != null) {
        // Open bKash payment URL
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Text('Payment', style: TextStyle(fontWeight: FontWeight.w700)),
            content: const Text('Redirecting to bKash payment gateway. Please complete the payment.'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
            ],
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString()}'), backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 10, left: 8, right: 16, bottom: 14),
              child: Row(children: [
                IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                const Text('Subscription Plans', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
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
                    const SizedBox(height: 20),

                    ..._plans.map((plan) => _buildPlanCard(plan)),

                    const SizedBox(height: 20),

                    // Why Premium card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          const Icon(Icons.shield_outlined, color: AppColors.primary, size: 24),
                          const SizedBox(width: 10),
                          const Text('Why Premium?',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary)),
                        ]),
                        const SizedBox(height: 10),
                        const Text(
                          'Get unlimited access to all exams, expert video solutions, live classes, and personalized mentoring to ace your admission exam.',
                          style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
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

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isPopular ? AppColors.primary : AppColors.border, width: isPopular ? 2 : 1),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
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
                child: Text('MOST POPULAR', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(plan['name'], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    Text('${plan['duration']} month${(plan['duration'] as int) > 1 ? 's' : ''}',
                        style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                  ]),
                  Column(children: [
                    Text('৳ ${plan['price']}',
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    const Text('per month', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ]),
                ]),

                const SizedBox(height: 16),
                const Divider(color: AppColors.border),
                const SizedBox(height: 12),

                ...features.map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(children: [
                        const Icon(Icons.check_circle, color: AppColors.success, size: 18),
                        const SizedBox(width: 10),
                        Expanded(child: Text(f, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary))),
                      ]),
                    )),

                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isProcessing ? null : () => _handleSubscribe(plan),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isPopular ? AppColors.primary : AppColors.borderLight,
                      foregroundColor: isPopular ? Colors.white : AppColors.textPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 0,
                    ),
                    child: _isProcessing
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('Subscribe Now', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
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
