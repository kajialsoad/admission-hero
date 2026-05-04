import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import 'package:intl/intl.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    // Debug: Print user subscription info
    if (user != null) {
      print('DEBUG Profile: subscriptionStatus = ${user.subscriptionStatus}');
      print('DEBUG Profile: subscriptionType = ${user.subscriptionType}');
      print('DEBUG Profile: subscriptionExpireAt = ${user.subscriptionExpireAt}');
    }

    final menuItems = [
      _MenuItem(id: 'edit-profile', title: 'Edit Profile', icon: Icons.edit_outlined,
          onTap: () => Navigator.pushNamed(context, '/edit-profile')),
      _MenuItem(id: 'subscription', title: 'My Subscription', icon: Icons.card_membership_outlined,
          onTap: () => Navigator.pushNamed(context, '/subscription')),
      _MenuItem(id: 'performance', title: 'My Performance', icon: Icons.insights_outlined,
          onTap: () => Navigator.pushNamed(context, '/performance')),
      _MenuItem(id: 'support', title: 'Help & Support', icon: Icons.help_outline_rounded,
          onTap: () => Navigator.pushNamed(context, '/support')),
      _MenuItem(id: 'settings', title: 'Settings', icon: Icons.settings_outlined, 
          onTap: () => Navigator.pushNamed(context, '/settings')),
      if (user != null) // Only show for logged in users
        _MenuItem(id: 'feature-test', title: 'Feature Tests', icon: Icons.bug_report_outlined, 
            onTap: () => Navigator.pushNamed(context, '/feature-test')),
    ];

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 12, left: 20, right: 20, bottom: 16),
              child: const Row(children: [
                Text('Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 90),
                child: Column(
                  children: [
                    // User Card (Gradient)
                    Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Color(0xFF3b82f6), Color(0xFF2563eb)]),
                        borderRadius: BorderRadius.all(Radius.circular(20)),
                      ),
                      child: Column(children: [
                        // Avatar
                        Container(
                          width: 80, height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2), shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              user != null && user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                              style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(user?.name ?? 'Guest',
                            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        Text(user?.email ?? user?.phone ?? 'Not logged in',
                            style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                        if (user?.subscriptionStatus == 'paid') ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.verified, color: Colors.white, size: 16),
                              SizedBox(width: 6),
                              Text('Premium Member', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                            ]),
                          ),
                        ],
                      ]),
                    ),

                    // Subscription Info Card (if paid user)
                    if (user?.subscriptionStatus == 'paid' && user?.subscriptionExpireAt != null)
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF10B981), Color(0xFF059669)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withOpacity(0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.card_membership, color: Colors.white, size: 20),
                                ),
                                const SizedBox(width: 12),
                                const Expanded(
                                  child: Text(
                                    'আপনার সাবস্ক্রিপশন',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'Active',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'প্যাকেজ:',
                                        style: TextStyle(
                                          color: Colors.white70,
                                          fontSize: 13,
                                        ),
                                      ),
                                      Text(
                                        _getPackageName(user?.subscriptionType),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'বাকি আছে:',
                                        style: TextStyle(
                                          color: Colors.white70,
                                          fontSize: 13,
                                        ),
                                      ),
                                      Text(
                                        '${_getDaysRemaining(user?.subscriptionExpireAt)} দিন',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'মেয়াদ শেষ:',
                                        style: TextStyle(
                                          color: Colors.white70,
                                          fontSize: 13,
                                        ),
                                      ),
                                      Text(
                                        _formatExpiryDate(user?.subscriptionExpireAt),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 16),

                    // Login Prompt if guest
                    if (user == null)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => Navigator.pushNamed(context, '/auth'),
                            icon: const Icon(Icons.login),
                            label: const Text('Login / Register'),
                            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                          ),
                        ),
                      ),

                    const SizedBox(height: 16),

                    // Menu Items
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Account',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        const SizedBox(height: 10),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white, borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          clipBehavior: Clip.hardEdge,
                          child: Column(
                            children: menuItems.asMap().entries.map((entry) {
                              final i = entry.key;
                              final item = entry.value;
                              return Column(
                                children: [
                                  ListTile(
                                    onTap: item.onTap,
                                    leading: Icon(item.icon, color: AppColors.primary, size: 22),
                                    title: Text(item.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                                    trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                  ),
                                  if (i < menuItems.length - 1)
                                    const Divider(height: 1, color: AppColors.border, indent: 16, endIndent: 16),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      ]),
                    ),

                    const SizedBox(height: 20),

                    // Logout Button
                    if (user != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _confirmLogout(context, auth),
                            icon: const Icon(Icons.logout),
                            label: const Text('Logout'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.error,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 3),
      ),
    );
  }

  void _confirmLogout(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Logout', style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () async {
              Navigator.pop(context);
              await auth.logout();
              if (context.mounted) Navigator.pushReplacementNamed(context, '/auth');
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  String _getPackageName(String? subscriptionType) {
    if (subscriptionType == null) return 'Unknown';
    
    switch (subscriptionType) {
      case '1-month':
        return '১ মাস প্রিমিয়াম';
      case '3-month':
        return '৩ মাস প্রিমিয়াম';
      case '6-month':
        return '৬ মাস প্রিমিয়াম';
      case '12-month':
        return '১২ মাস প্রিমিয়াম';
      default:
        return subscriptionType;
    }
  }

  int _getDaysRemaining(DateTime? expiryDate) {
    if (expiryDate == null) return 0;
    final now = DateTime.now();
    final difference = expiryDate.difference(now);
    return difference.inDays > 0 ? difference.inDays : 0;
  }

  String _formatExpiryDate(DateTime? expiryDate) {
    if (expiryDate == null) return 'N/A';
    
    final months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    return '${expiryDate.day} ${months[expiryDate.month - 1]}, ${expiryDate.year}';
  }
}

class _MenuItem {
  final String id;
  final String title;
  final IconData icon;
  final VoidCallback onTap;
  _MenuItem({required this.id, required this.title, required this.icon, required this.onTap});
}
