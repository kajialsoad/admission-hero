import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  int _step = 1; // 1=email, 2=otp, 3=new password
  bool _isLoading = false;

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _email = '';
  String _resetToken = '';
  bool _obscurePass = true;
  bool _obscureConfirm = true;

  final _api = ApiService();

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? Colors.red : Colors.green,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  Future<void> _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      _showSnack('সঠিক ইমেইল দিন', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.post('/auth/forgot-password', {'email': email}, requiresAuth: false);
      _email = email;
      setState(() => _step = 2);
      _showSnack('OTP আপনার ইমেইলে পাঠানো হয়েছে');
    } on ApiException catch (e) {
      _showSnack(e.message, isError: true);
    } catch (_) {
      _showSnack('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।', isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      _showSnack('৬ সংখ্যার OTP দিন', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await _api.post(
        '/auth/verify-otp',
        {'email': _email, 'otp': otp},
        requiresAuth: false,
      );
      _resetToken = response['resetToken'] ?? '';
      setState(() => _step = 3);
      _showSnack('OTP সঠিক! নতুন পাসওয়ার্ড দিন');
    } on ApiException catch (e) {
      _showSnack(e.message, isError: true);
    } catch (_) {
      _showSnack('OTP যাচাই করা যায়নি।', isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  Future<void> _resetPassword() async {
    final pass = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();

    if (pass.length < 6) {
      _showSnack('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', isError: true);
      return;
    }
    if (pass != confirm) {
      _showSnack('পাসওয়ার্ড দুটো মিলছে না', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.post(
        '/auth/reset-password',
        {'email': _email, 'resetToken': _resetToken, 'newPassword': pass},
        requiresAuth: false,
      );
      _showSnack('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (e) {
      _showSnack(e.message, isError: true);
    } catch (_) {
      _showSnack('পাসওয়ার্ড পরিবর্তন করা যায়নি।', isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          onPressed: () {
            if (_step > 1) {
              setState(() => _step--);
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
        title: Text(
          _step == 1 ? 'পাসওয়ার্ড রিসেট' : _step == 2 ? 'OTP যাচাই' : 'নতুন পাসওয়ার্ড',
          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildStepIndicator(),
              const SizedBox(height: 32),
              if (_step == 1) _buildEmailStep(),
              if (_step == 2) _buildOtpStep(),
              if (_step == 3) _buildPasswordStep(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      children: List.generate(3, (i) {
        final active = _step == i + 1;
        final done = _step > i + 1;
        return Expanded(
          child: Row(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  color: done ? AppColors.success : active ? AppColors.primary : AppColors.border,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: done
                      ? const Icon(Icons.check, color: Colors.white, size: 14)
                      : Text('${i + 1}',
                          style: TextStyle(
                            color: active ? Colors.white : AppColors.textMuted,
                            fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              if (i < 2)
                Expanded(
                  child: Container(
                    height: 2,
                    color: done ? AppColors.success : AppColors.border,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildEmailStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 80, height: 80,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.primaryBg, borderRadius: BorderRadius.circular(40),
          ),
          child: const Icon(Icons.email_outlined, size: 40, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        const Text('পাসওয়ার্ড ভুলে গেছেন?',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
            textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text('আপনার ইমেইল দিন। আমরা একটি OTP পাঠাব।',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]), textAlign: TextAlign.center),
        const SizedBox(height: 28),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            labelText: 'ইমেইল',
            hintText: 'example@gmail.com',
            prefixIcon: const Icon(Icons.email_outlined),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(height: 20),
        _buildPrimaryButton('OTP পাঠান', _sendOtp),
      ],
    );
  }

  Widget _buildOtpStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 80, height: 80,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.primaryBg, borderRadius: BorderRadius.circular(40),
          ),
          child: const Icon(Icons.lock_clock, size: 40, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        const Text('OTP যাচাই করুন',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
            textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text('$_email-এ পাঠানো ৬ সংখ্যার OTP দিন',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]), textAlign: TextAlign.center),
        const SizedBox(height: 28),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
          decoration: InputDecoration(
            hintText: '------',
            counterText: '',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(height: 20),
        _buildPrimaryButton('যাচাই করুন', _verifyOtp),
        const SizedBox(height: 12),
        TextButton(
          onPressed: _isLoading ? null : () {
            setState(() => _step = 1);
            _otpController.clear();
          },
          child: const Text('নতুন OTP পান', style: TextStyle(color: AppColors.primary)),
        ),
      ],
    );
  }

  Widget _buildPasswordStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 80, height: 80,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.primaryBg, borderRadius: BorderRadius.circular(40),
          ),
          child: const Icon(Icons.lock_reset, size: 40, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        const Text('নতুন পাসওয়ার্ড দিন',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
            textAlign: TextAlign.center),
        const SizedBox(height: 28),
        TextField(
          controller: _passwordController,
          obscureText: _obscurePass,
          decoration: InputDecoration(
            labelText: 'নতুন পাসওয়ার্ড',
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(_obscurePass ? Icons.visibility_off : Icons.visibility),
              onPressed: () => setState(() => _obscurePass = !_obscurePass),
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _confirmPasswordController,
          obscureText: _obscureConfirm,
          decoration: InputDecoration(
            labelText: 'পাসওয়ার্ড নিশ্চিত করুন',
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(_obscureConfirm ? Icons.visibility_off : Icons.visibility),
              onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(height: 20),
        _buildPrimaryButton('পাসওয়ার্ড পরিবর্তন করুন', _resetPassword),
      ],
    );
  }

  Widget _buildPrimaryButton(String label, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: _isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: _isLoading
          ? const SizedBox(
              height: 20, width: 20,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
          : Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
    );
  }
}