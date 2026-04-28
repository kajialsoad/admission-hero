import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import '../chat/chat_screen.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  int? _expandedFaq;

  static const _faqs = [
    {'q': 'How do I used this app?', 'a': 'This app addmission hero, this help addmission question bank solve and better result in university exam.'},
    {'q': 'Can I download materials offline?', 'a': 'Yes, Premium subscribers can download all study materials and video solutions for offline access.'},
    {'q': 'How are exams scored?', 'a': 'Exams are automatically scored based on correct and incorrect answers. You get detailed feedback immediately after submission.'},
    {'q': 'Can I retake exams?', 'a': 'You can retake exams in Study and Practice modes unlimited times. Exam mode attempts are tracked for your record.'},
  ];

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
                const Text('Help & Support', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Contact Us', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: _contactCard(Icons.chat_bubble_outline, 'Live Chat', 'Chat with support', () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const ChatScreen()),
                      );
                    })),
                    const SizedBox(width: 12),
                    Expanded(child: _contactCard(Icons.email_outlined, 'Email', 'Get help via email', () {
                      // TODO: Open email app
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Email: support@admission-hero.com')),
                      );
                    })),
                    const SizedBox(width: 12),
                    Expanded(child: _contactCard(Icons.phone_outlined, 'Call Us', 'Talk to our team', () {
                      // TODO: Make phone call
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Call: +880 1234 567890')),
                      );
                    })),
                  ]),

                  const SizedBox(height: 30),
                  const Text('Frequently Asked Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white, borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    clipBehavior: Clip.hardEdge,
                    child: Column(
                      children: _faqs.asMap().entries.map((e) {
                        final i = e.key;
                        final isExpanded = _expandedFaq == i;
                        return Column(
                          children: [
                            ListTile(
                              title: Text(e.value['q']!, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                              trailing: Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.primary),
                              onTap: () => setState(() => _expandedFaq = isExpanded ? null : i),
                            ),
                            if (isExpanded)
                              Container(
                                width: double.infinity,
                                color: AppColors.background,
                                padding: const EdgeInsets.all(16),
                                child: Text(e.value['a']!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5)),
                              ),
                            if (i < _faqs.length - 1)
                              const Divider(height: 1, color: AppColors.border),
                          ],
                        );
                      }).toList(),
                    ),
                  ),

                  const SizedBox(height: 30),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFF2563eb)]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Contact Information', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 16),
                      _infoRow(Icons.email, 'support@admission-hero.com'),
                      const SizedBox(height: 12),
                      _infoRow(Icons.phone, '+880 1234 567890'),
                      const SizedBox(height: 12),
                      _infoRow(Icons.access_time, 'Mon-Sat, 9 AM - 6 PM'),
                    ]),
                  ),
                  const SizedBox(height: 30),
                ]),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 3), // Part of profile basically
      ),
    );
  }

  Widget _contactCard(IconData icon, String title, String desc, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(children: [
          Icon(icon, color: AppColors.primary, size: 28),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(desc, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
        ]),
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(children: [
      Icon(icon, color: Colors.white, size: 20),
      const SizedBox(width: 12),
      Text(text, style: const TextStyle(color: Colors.white, fontSize: 14)),
    ]);
  }
}
