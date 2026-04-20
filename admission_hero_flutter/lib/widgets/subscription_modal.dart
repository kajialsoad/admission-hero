import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SubscriptionModal {
  static void show(BuildContext context, {required VoidCallback onUpgrade}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SubscriptionModalContent(onUpgrade: () {
        Navigator.pop(ctx);
        onUpgrade();
      }),
    );
  }
}

class _SubscriptionModalContent extends StatelessWidget {
  final VoidCallback onUpgrade;

  const _SubscriptionModalContent({required this.onUpgrade});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Upgrade to Premium', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Feature Banner
                  Container(
                    width: double.infinity,
                    color: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                    child: Column(
                      children: [
                        Container(
                          width: 64, height: 64,
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
                          child: const Icon(Icons.lock, size: 32, color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        const Text('Premium Access Required', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 8),
                        const Text('Unlock unlimited exams and premium learning features', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70, fontSize: 14)),
                      ],
                    ),
                  ),

                  // Features List
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Premium Features', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                        const SizedBox(height: 24),
                        ...[
                          _FeatureItem(icon: Icons.menu_book, title: 'Unlimited Exams', desc: 'Access all question sets anytime'),
                          _FeatureItem(icon: Icons.bolt, title: 'Instant Feedback', desc: 'Get answers and explanations immediately'),
                          _FeatureItem(icon: Icons.show_chart, title: 'Performance Analytics', desc: 'Track your progress and improvement'),
                          _FeatureItem(icon: Icons.video_library, title: 'Video Solutions', desc: 'Learn from expert video explanations'),
                          _FeatureItem(icon: Icons.bookmark, title: 'Save & Organize', desc: 'Bookmark questions for later review'),
                          _FeatureItem(icon: Icons.download, title: 'Offline Access', desc: 'Download and practice without internet'),
                        ],
                      ],
                    ),
                  ),

                  // Pricing Cards
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Choose Your Plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                        const SizedBox(height: 24),
                        _PlanCard(duration: '1 Month', price: '৳299', discount: null, isPopular: false, onUpgrade: onUpgrade),
                        const SizedBox(height: 12),
                        _PlanCard(duration: '3 Months', price: '৳799', discount: 'Save 13%', isPopular: false, onUpgrade: onUpgrade),
                        const SizedBox(height: 12),
                        _PlanCard(duration: '6 Months', price: '৳1499', discount: 'Save 23%', isPopular: true, onUpgrade: onUpgrade),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),

          // Footer
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: onUpgrade,
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: const Text('Upgrade Now'),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    style: TextButton.styleFrom(
                      backgroundColor: AppColors.borderLight,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Continue as Free User', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
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

class _FeatureItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String desc;

  const _FeatureItem({required this.icon, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.border)),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(color: AppColors.primaryBg, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String duration;
  final String price;
  final String? discount;
  final bool isPopular;
  final VoidCallback onUpgrade;

  const _PlanCard({required this.duration, required this.price, this.discount, required this.isPopular, required this.onUpgrade});

  @override
  Widget build(BuildContext context) {
    final numericPrice = int.parse(price.replaceAll(RegExp(r'[^0-9]'), ''));
    final amountMonths = int.tryParse(duration.split(' ').first) ?? 1;
    final perMonth = (numericPrice / amountMonths).round();

    return GestureDetector(
      onTap: onUpgrade,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isPopular ? AppColors.primaryBg : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isPopular ? AppColors.primary : AppColors.border, width: 2),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(duration, style: TextStyle(fontWeight: FontWeight.bold, color: isPopular ? AppColors.primaryDark : AppColors.textPrimary)),
                if (discount != null) ...[
                  const SizedBox(height: 4),
                  Text(discount!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.success)),
                ],
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(price, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: isPopular ? AppColors.primary : AppColors.textPrimary)),
                const SizedBox(height: 4),
                Text('$perMonth/month', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
