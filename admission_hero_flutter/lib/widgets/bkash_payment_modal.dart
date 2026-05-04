import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class BkashPaymentModal extends StatefulWidget {
  final String planId;
  final String planName;
  final int amount;
  final int duration;
  final List<String> features;
  final VoidCallback onSuccess;

  const BkashPaymentModal({
    super.key,
    required this.planId,
    required this.planName,
    required this.amount,
    required this.duration,
    required this.features,
    required this.onSuccess,
  });

  @override
  State<BkashPaymentModal> createState() => _BkashPaymentModalState();
}

class _BkashPaymentModalState extends State<BkashPaymentModal> {
  String _step = 'init'; // 'init', 'processing', 'confirm'
  String? _paymentID;
  bool _isLoading = false;

  Future<void> _handleStartPayment() async {
    final user = context.read<AuthProvider>().user;
    if (user == null) {
      Navigator.pop(context); // Close modal
      Navigator.pushNamed(context, '/auth');
      return;
    }

    setState(() {
      _step = 'processing';
      _isLoading = true;
    });

    try {
      final response = await ApiService.createSubscriptionPayment({
        'planId': widget.planId,
        'amount': widget.amount,
        'planName': widget.planName,
        'duration': widget.duration,
        'price': widget.amount,
        'features': widget.features,
      });

      if (response == null || response['paymentURL'] == null || response['paymentID'] == null) {
        throw Exception('Invalid bKash response');
      }

      setState(() {
        _paymentID = response['paymentID'];
      });

      final url = Uri.parse(response['paymentURL']);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        
        // Start polling for payment status
        setState(() {
          _step = 'confirm';
          _isLoading = false;
        });
        
        // Auto-check payment status after 5 seconds
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted && _step == 'confirm') {
            _checkPaymentStatus();
          }
        });
      } else {
        throw Exception('Could not open browser');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to initiate payment.'), backgroundColor: AppColors.error));
      }
      setState(() {
        _step = 'init';
        _isLoading = false;
      });
    }
  }

  // Auto-check payment status
  Future<void> _checkPaymentStatus() async {
    if (_paymentID == null || !mounted) return;

    try {
      final response = await ApiService.executeSubscriptionPayment({'paymentID': _paymentID});
      
      if (response != null && response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Payment Successful! Subscription Activated!'),
              backgroundColor: AppColors.success,
              duration: Duration(seconds: 3),
            )
          );
          Navigator.pop(context);
          widget.onSuccess();
        }
      } else {
        // Payment not completed yet, keep showing confirm button
        print('Payment not completed yet. User can manually confirm.');
      }
    } catch (e) {
      print('Auto-check payment status error: $e');
      // Don't show error, let user manually confirm
    }
  }

  Future<void> _handleConfirmPayment() async {
    if (_paymentID == null) return;

    setState(() {
      _step = 'processing';
      _isLoading = true;
    });

    try {
      final response = await ApiService.executeSubscriptionPayment({'paymentID': _paymentID});
      if (response != null && response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Subscription Activated!'), backgroundColor: AppColors.success));
          Navigator.pop(context);
          widget.onSuccess();
        }
      } else {
        throw Exception('Verification failed');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment verification failed.'), backgroundColor: AppColors.error));
      }
      setState(() {
        _step = 'init';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textPrimary),
                    onPressed: _isLoading ? null : () => Navigator.pop(context),
                  ),
                  const Text('bKash Payment', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const SizedBox(width: 48), // Balance for centering
                ],
              ),
            ),
            const Divider(height: 1),

            // Body
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    if (_step == 'init') ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primaryBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primaryLight.withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text('${widget.planName} Plan', style: const TextStyle(fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                            const SizedBox(height: 4),
                            Text('${widget.amount} Tk', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            const SizedBox(height: 4),
                            Text('Duration: ${widget.duration} months', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: const Text('Features', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      ...widget.features.map((f) => Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, size: 18, color: AppColors.success),
                            const SizedBox(width: 12),
                            Expanded(child: Text(f, style: const TextStyle(color: AppColors.textSecondary))),
                          ],
                        ),
                      )),
                    ],

                    if (_step == 'processing')
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            const CircularProgressIndicator(color: AppColors.primary),
                            const SizedBox(height: 16),
                            Text(
                              _paymentID == null ? 'Initiating Payment...' : 'Confirming Payment...',
                              style: const TextStyle(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),

                    if (_step == 'confirm')
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        child: Column(
                          children: [
                            const Icon(Icons.payment, size: 48, color: AppColors.primary),
                            const SizedBox(height: 12),
                            const Text('Complete Payment in bKash', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            const Text(
                              'After completing payment in bKash app/browser, return here and tap "I\'ve Paid" button below.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.primaryBg,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.info_outline, size: 20, color: AppColors.primary),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'We will automatically verify your payment',
                                      style: TextStyle(fontSize: 12, color: AppColors.primary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // Footer
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                child: _step == 'init'
                    ? ElevatedButton(
                        onPressed: _handleStartPayment,
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
                        child: Text('Pay ${widget.amount} Tk with bKash'),
                      )
                    : _step == 'confirm'
                        ? ElevatedButton(
                            onPressed: _isLoading ? null : _handleConfirmPayment,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.success, 
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              disabledBackgroundColor: AppColors.success.withOpacity(0.5),
                            ),
                            child: _isLoading 
                                ? const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      ),
                                      SizedBox(width: 12),
                                      Text('Verifying Payment...'),
                                    ],
                                  )
                                : const Text('I\'ve Paid - Verify Now'),
                          )
                        : const SizedBox.shrink(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
