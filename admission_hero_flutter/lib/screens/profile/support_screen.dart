import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import '../chat/chat_screen.dart';
import '../../models/contact_info.dart';
import '../../services/settings_service.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  int? _expandedFaq;
  ContactInfo? _contactInfo;
  bool _isLoadingContact = true;

  static const _faqs = [
    {'q': 'How do I used this app?', 'a': 'This app addmission hero, this help addmission question bank solve and better result in university exam.'},
    {'q': 'Can I download materials offline?', 'a': 'Yes, Premium subscribers can download all study materials and video solutions for offline access.'},
    {'q': 'How are exams scored?', 'a': 'Exams are automatically scored based on correct and incorrect answers. You get detailed feedback immediately after submission.'},
    {'q': 'Can I retake exams?', 'a': 'You can retake exams in Study and Practice modes unlimited times. Exam mode attempts are tracked for your record.'},
  ];

  @override
  void initState() {
    super.initState();
    _loadContactInfo();
  }

  Future<void> _loadContactInfo() async {
    try {
      final contactInfo = await SettingsService.getContactInfo();
      setState(() {
        _contactInfo = contactInfo;
        _isLoadingContact = false;
      });
    } catch (e) {
      setState(() {
        _contactInfo = ContactInfo.defaultInfo;
        _isLoadingContact = false;
      });
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
                      if (_contactInfo != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Email: ${_contactInfo!.email}')),
                        );
                      }
                    })),
                    const SizedBox(width: 12),
                    Expanded(child: _contactCard(Icons.phone_outlined, 'Call Us', 'Talk to our team', () {
                      if (_contactInfo != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Call: ${_contactInfo!.phone}')),
                        );
                      }
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
                  _isLoadingContact
                      ? const Center(child: CircularProgressIndicator())
                      : Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFF2563eb)]),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            const Text('Contact Information', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 16),
                            _infoRow(Icons.email, _contactInfo?.email ?? 'Loading...'),
                            const SizedBox(height: 12),
                            _infoRow(Icons.phone, _contactInfo?.phone ?? 'Loading...'),
                            const SizedBox(height: 12),
                            _infoRow(Icons.access_time, _contactInfo?.workingHours ?? 'Loading...'),
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
