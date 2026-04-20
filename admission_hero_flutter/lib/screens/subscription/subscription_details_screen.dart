import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';

class SubscriptionDetailsScreen extends StatelessWidget {
  const SubscriptionDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isPremium = user?.isSubscribed ?? false;
    // Mock days left if premium, otherwise 0
    final daysLeft = isPremium ? 120 : 0;
    final expireDate = isPremium ? 'Aug 20, 2026' : 'N/A';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, left: 8, right: 16, bottom: 12),
              child: Row(children: [
                IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                const Text('Subscription', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 90),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Current Plan Card
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: isPremium ? _buildPremiumCard(expireDate, daysLeft) : _buildFreeCard(),
                  ),

                  // Features List
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Text('Your Plan Features', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isPremium ? AppColors.success : AppColors.border),
                      ),
                      child: Column(children: [
                        _featureRow(isPremium ? 'Unlimited exam attempts' : 'Limited exam attempts', isPremium),
                        const SizedBox(height: 12),
                        _featureRow(isPremium ? 'Full question database' : 'Basic question sets', isPremium),
                        const SizedBox(height: 12),
                        _featureRow(isPremium ? 'Advanced analytics' : 'Standard support', isPremium),
                        if (isPremium) ...[
                          const SizedBox(height: 12),
                          _featureRow('Priority support', true),
                        ],
                      ]),
                    ),
                  ),

                  // Upgrade Action
                  if (!isPremium) ...[
                    const SizedBox(height: 24),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Upgrade to Premium', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    ),
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => Navigator.pushNamed(context, '/subscription'),
                          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                          child: const Text('View Upgrade Plans', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),
                  
                  // FAQ
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Text('FAQ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Can I cancel anytime?', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        const SizedBox(height: 4),
                        const Text('Yes, you can cancel your subscription anytime from your account settings.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        const Divider(color: AppColors.borderLight),
                        const SizedBox(height: 12),
                        const Text('Is there a trial period?', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        const SizedBox(height: 4),
                        const Text('The free plan gives you access to basic features to explore our platform.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      ]),
                    ),
                  ),
                ]),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 3),
      ),
    );
  }

  Widget _buildPremiumCard(String date, int daysLeft) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF3b82f6), Color(0xFF2563eb)]),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Current Plan', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
            child: const Icon(Icons.star, color: Colors.white, size: 20),
          ),
        ]),
        const SizedBox(height: 16),
        const Text('Plan Duration', style: TextStyle(color: Colors.white70, fontSize: 13)),
        const Text('Premium Subscription', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 20),
        const Divider(color: Colors.white24),
        const SizedBox(height: 16),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Expires on', style: TextStyle(color: Colors.white70, fontSize: 13)),
            Text(date, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF86efac))),
          ]),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            const Text('Days Remaining', style: TextStyle(color: Colors.white70, fontSize: 13)),
            Text('${daysLeft}d', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF86efac))),
          ]),
        ]),
      ]),
    );
  }

  Widget _buildFreeCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFFf3f4f6), borderRadius: BorderRadius.circular(20)),
      child: Column(children: [
        Container(
          width: 64, height: 64,
          decoration: const BoxDecoration(color: Color(0xFFd1d5db), shape: BoxShape.circle),
          child: const Center(child: Text('⭐', style: TextStyle(fontSize: 28))),
        ),
        const SizedBox(height: 16),
        const Text('Free Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        const Text('Upgrade to unlock premium features and unlimited access', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
      ]),
    );
  }

  Widget _featureRow(String text, bool isPremium) {
    return Row(children: [
      Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: isPremium ? AppColors.successLight : AppColors.primaryBg, shape: BoxShape.circle),
        child: Icon(Icons.check_circle, size: 16, color: isPremium ? AppColors.success : AppColors.primary),
      ),
      const SizedBox(width: 12),
      Text(text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
    ]);
  }
}
