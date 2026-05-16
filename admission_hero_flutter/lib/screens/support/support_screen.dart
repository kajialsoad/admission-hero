import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:iconsax/iconsax.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import '../../models/contact_info.dart';
import '../../services/settings_service.dart';
import '../chat/chat_screen.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  ContactInfo? _contactInfo;
  bool _isLoadingContact = true;

  final List<FAQItem> _faqs = [
    FAQItem(
      question: 'Admission Hero কী?',
      answer: 'Admission Hero হলো দেশসেরা শিক্ষকদের পরিচালিত একটি আধুনিক শিক্ষামূলক প্ল্যাটফর্ম, যেখানে বিশ্ববিদ্যালয়, মেডিকেল ও ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার সম্পূর্ণ প্রস্তুতির জন্য প্রয়োজনীয় গাইডলাইন, প্রশ্নব্যাংক, মডেল টেস্ট ও সমাধান প্রদান করা হয়।'
    ),
    FAQItem(
      question: 'Admission Hero কাদের জন্য?',
      answer: 'যারা বর্তমানে এইচএসসি পড়ছে অথবা এইচএসসি শেষ করে ভর্তি পরীক্ষার প্রস্তুতি নিতে চায়, তাদের জন্য Admission Hero একটি আদর্শ প্ল্যাটফর্ম।'
    ),
    FAQItem(
      question: 'Admission Hero-এর শিক্ষক প্যানেল কেমন?',
      answer: 'Admission Hero-এর শিক্ষক প্যানেল দেশের স্বনামধন্য বিশ্ববিদ্যালয়ের মেধাবী ও অভিজ্ঞ শিক্ষার্থীদের নিয়ে গঠিত, যারা দীর্ঘদিন ধরে ভর্তি পরীক্ষার প্রস্তুতিতে শিক্ষার্থীদের গাইড করে আসছেন।'
    ),
    FAQItem(
      question: 'অ্যাপে কী কী সুবিধা পাওয়া যাবে?',
      answer: 'Admission Hero অ্যাপে শিক্ষার্থীরা পাবে—\n\n• সকল ইউনিটের প্রশ্নব্যাংক\n• মডেল টেস্ট ও ডেইলি পরীক্ষা\n• প্রশ্নের বিস্তারিত সমাধান\n• পারফরম্যান্স অ্যানালাইসিস\n• ভর্তি পরীক্ষার গাইডলাইন\n• গুরুত্বপূর্ণ শর্ট সাজেশন ও টিপস\n• একই প্ল্যাটফর্মে বিভিন্ন বিশ্ববিদ্যালয়ের প্রস্তুতি'
    ),
    FAQItem(
      question: 'Admission Hero অন্যদের থেকে আলাদা কেন?',
      answer: 'Admission Hero-তে শিক্ষার্থীরা শুধু প্রশ্ন পড়তেই নয়, সরাসরি পরীক্ষা দিতে এবং প্রতিটি প্রশ্নের সমাধান দেখতে পারে। এছাড়াও একই অ্যাপে সকল ইউনিট ও বিশ্ববিদ্যালয়ের প্রশ্নব্যাংক সহজেই পাওয়া যায়, যা প্রস্তুতিকে আরও সহজ ও কার্যকর করে তোলে।'
    ),
    FAQItem(
      question: 'Admission Hero-তে কী মডেল টেস্ট দেওয়া যায়?',
      answer: 'হ্যাঁ, শিক্ষার্থীরা নিয়মিত মডেল টেস্ট দিতে পারবে এবং নিজের প্রস্তুতির মান যাচাই করতে পারবে।'
    ),
    FAQItem(
      question: 'প্রশ্নের সমাধান কি পাওয়া যাবে?',
      answer: 'অবশ্যই। প্রতিটি গুরুত্বপূর্ণ প্রশ্নের বিস্তারিত ও সহজবোধ্য সমাধান দেওয়া থাকবে, যাতে শিক্ষার্থীরা ভুল থেকে শিখতে পারে।'
    ),
    FAQItem(
      question: 'সব বিশ্ববিদ্যালয়ের প্রশ্নব্যাংক কি পাওয়া যাবে?',
      answer: 'হ্যাঁ, Admission Hero-তে বিভিন্ন বিশ্ববিদ্যালয়ের ইউনিটভিত্তিক প্রশ্নব্যাংক একসাথে পাওয়া যাবে।'
    ),
    FAQItem(
      question: 'Admission Hero ব্যবহার করলে কীভাবে উপকার হবে?',
      answer: 'এটি শিক্ষার্থীদের স্মার্টভাবে প্রস্তুতি নিতে সাহায্য করবে, সময় বাঁচাবে এবং সঠিক দিকনির্দেশনার মাধ্যমে ভর্তি পরীক্ষায় ভালো ফল করতে সহায়তা করবে।'
    ),
    FAQItem(
      question: 'Admission Hero-এর মূল লক্ষ্য কী?',
      answer: 'শিক্ষার্থীদের সহজ, স্মার্ট ও কার্যকর উপায়ে ভর্তি পরীক্ষার প্রস্তুতি নিশ্চিত করা এবং স্বপ্নের বিশ্ববিদ্যালয়ে ভর্তি হওয়ার পথকে আরও সহজ করে তোলা।'
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadContactInfo();
  }

  Future<void> _loadContactInfo() async {
    try {
      final contactInfo = await SettingsService.getContactInfo();
      if (mounted) {
        setState(() {
          _contactInfo = contactInfo;
          _isLoadingContact = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _contactInfo = ContactInfo.defaultInfo;
          _isLoadingContact = false;
        });
      }
    }
  }

  Future<void> _launchWhatsApp() async {
    final phone = _contactInfo?.phone.replaceAll(RegExp(r'[^0-9]'), '') ?? '8801575804161';
    final Uri url = Uri.parse('https://wa.me/$phone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      _showError('WhatsApp could not be opened');
    }
  }

  Future<void> _launchPhone() async {
    final phone = _contactInfo?.phone ?? '01575804161';
    final Uri url = Uri.parse('tel:$phone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      _showError('Dialer could not be opened');
    }
  }

  Future<void> _launchEmail() async {
    final email = _contactInfo?.email ?? 'support.admissionhero@gmail.com';
    final Uri url = Uri.parse('mailto:$email');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      _showError('Email app could not be opened');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.error)
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: AppColors.primary,
        statusBarIconBrightness: Brightness.light
      ),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Custom App Bar
            Container(
              width: double.infinity,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 10,
                bottom: 20,
                left: 8,
                right: 20,
              ),
              decoration: const BoxDecoration(
                color: AppColors.primary,
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Text(
                    'Help & Support',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Contact Us',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // 2x2 Grid for Contact Options
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1.4,
                      children: [
                        _buildContactGridItem(
                          icon: Iconsax.message_2,
                          title: 'Live Chat',
                          subtitle: 'Chat with support',
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const ChatScreen()),
                            );
                          },
                        ),
                        _buildContactGridItem(
                          icon: Iconsax.call,
                          title: 'Call Us',
                          subtitle: 'Talk to our team',
                          onTap: _launchPhone,
                        ),
                        _buildContactGridItem(
                          icon: Iconsax.sms,
                          title: 'Email',
                          subtitle: 'Get help via email',
                          onTap: _launchEmail,
                        ),
                        _buildContactGridItem(
                          icon: Iconsax.messages_1,
                          title: 'WhatsApp',
                          subtitle: 'Message on WhatsApp',
                          onTap: _launchWhatsApp,
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),

                    const Text(
                      'Frequently Asked Questions',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),

                    ..._faqs.map((faq) => _buildFAQItem(faq)).toList(),
                    
                    const SizedBox(height: 20),
                    
                    // Contact Info Banner at the bottom
                    _isLoadingContact 
                    ? const Center(child: CircularProgressIndicator())
                    : Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Contact Information',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _contactInfo?.workingHours ?? 'Available from 10:00 AM to 10:00 PM',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.email_outlined, color: Colors.white, size: 20),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  _contactInfo?.email ?? 'support.admissionhero@gmail.com',
                                  style: const TextStyle(color: Colors.white, fontSize: 14),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.phone_outlined, color: Colors.white, size: 20),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  _contactInfo?.phone ?? '01575804161',
                                  style: const TextStyle(color: Colors.white, fontSize: 14),
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
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 3),
      ),
    );
  }

  Widget _buildContactGridItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border.withOpacity(0.5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.primary, size: 28),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQItem(FAQItem faq) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
      ),
      child: ExpansionTile(
        shape: const RoundedRectangleBorder(
          side: BorderSide.none,
        ),
        collapsedShape: const RoundedRectangleBorder(
          side: BorderSide.none,
        ),
        title: Text(
          faq.question,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        trailing: Icon(
          Icons.keyboard_arrow_down,
          color: AppColors.primary.withOpacity(0.7),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(
              faq.answer,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FAQItem {
  final String question;
  final String answer;

  FAQItem({required this.question, required this.answer});
}
