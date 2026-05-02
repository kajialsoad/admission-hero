import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final List<FAQItem> _faqs = [
    FAQItem(
      question: 'কিভাবে সাবস্ক্রিপশন কিনবো?',
      answer: 'Subscription পেজে গিয়ে আপনার পছন্দের প্যাকেজ সিলেক্ট করুন এবং bKash অথবা Google Play দিয়ে পেমেন্ট করুন।'
    ),
    FAQItem(
      question: 'পেমেন্ট করার পর কি হবে?',
      answer: 'পেমেন্ট সফল হলে আপনার একাউন্ট অটোমেটিক এক্টিভ হয়ে যাবে এবং সব প্রিমিয়াম কন্টেন্ট এক্সেস করতে পারবেন।'
    ),
    FAQItem(
      question: 'প্রোমো কোড কিভাবে ব্যবহার করবো?',
      answer: 'Subscription পেজে প্রোমো কোড ইনপুট ফিল্ডে আপনার কোড লিখে Apply বাটনে ক্লিক করুন। ডিসকাউন্ট অটোমেটিক এপ্লাই হয়ে যাবে।'
    ),
    FAQItem(
      question: 'সাবস্ক্রিপশন কতদিন ভ্যালিড থাকবে?',
      answer: 'আপনার সিলেক্ট করা প্যাকেজ অনুযায়ী - ৩ মাস, ৬ মাস অথবা ১২ মাস ভ্যালিড থাকবে।'
    ),
    FAQItem(
      question: 'রিফান্ড পলিসি কি?',
      answer: 'পেমেন্ট করার ২৪ ঘন্টার মধ্যে রিফান্ড রিকোয়েস্ট করতে পারবেন। আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।'
    ),
  ];

  Future<void> _launchWhatsApp() async {
    final Uri url = Uri.parse('https://wa.me/8801575804161');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      _showError('WhatsApp খুলতে সমস্যা হয়েছে');
    }
  }

  Future<void> _launchPhone() async {
    final Uri url = Uri.parse('tel:01575804161');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      _showError('Phone app খুলতে সমস্যা হয়েছে');
    }
  }

  Future<void> _launchEmail() async {
    final Uri url = Uri.parse('mailto:support.admissionhero@gmail.com');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      _showError('Email app খুলতে সমস্যা হয়েছে');
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
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 10,
                left: 8,
                right: 16,
                bottom: 14
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context)
                  ),
                  const Expanded(
                    child: Text(
                      'Support & Help',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white
                      )
                    )
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Contact Cards
                    _buildContactCard(
                      icon: Icons.chat_bubble,
                      iconColor: const Color(0xFF25D366),
                      title: 'WhatsApp',
                      subtitle: '01575804161',
                      buttonText: 'Chat Now',
                      onTap: _launchWhatsApp
                    ),
                    
                    const SizedBox(height: 12),
                    
                    _buildContactCard(
                      icon: Icons.email,
                      iconColor: AppColors.error,
                      title: 'Email',
                      subtitle: 'support.admissionhero@gmail.com',
                      buttonText: 'Send Email',
                      onTap: _launchEmail
                    ),
                    
                    const SizedBox(height: 12),
                    
                    _buildContactCard(
                      icon: Icons.phone,
                      iconColor: AppColors.success,
                      title: 'Call Us',
                      subtitle: '01575804161',
                      buttonText: 'Call Now',
                      onTap: _launchPhone
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // FAQ Section
                    const Text(
                      'Frequently Asked Questions',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary
                      )
                    ),
                    
                    const SizedBox(height: 12),
                    
                    ..._faqs.map((faq) => _buildFAQItem(faq)),
                    
                    const SizedBox(height: 24),
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

  Widget _buildContactCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String buttonText,
    required VoidCallback onTap
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 6
          )
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12)
            ),
            child: Icon(icon, color: iconColor, size: 28),
          ),
          
          const SizedBox(width: 16),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary
                  )
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted
                  )
                ),
              ],
            ),
          ),
          
          const SizedBox(width: 12),
          
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10)
              ),
            ),
            child: Text(
              buttonText,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFAQItem(FAQItem faq) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          title: Text(
            faq.question,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary
            )
          ),
          children: [
            Text(
              faq.answer,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textMuted,
                height: 1.5
              )
            ),
          ],
        ),
      ),
    );
  }
}

class FAQItem {
  final String question;
  final String answer;

  FAQItem({required this.question, required this.answer});
}
