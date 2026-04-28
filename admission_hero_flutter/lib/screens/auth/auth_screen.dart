import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import 'forgot_password_screen.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  bool _isLogin = true;
  bool _isLoading = false;

  // Login
  final _loginEmailCtrl = TextEditingController();
  final _loginPassCtrl = TextEditingController();
  bool _showLoginPass = false;

  // Register
  final _regNameCtrl = TextEditingController();
  final _regEmailCtrl = TextEditingController();
  final _regPhoneCtrl = TextEditingController();
  final _regPassCtrl = TextEditingController();
  final _regConfirmPassCtrl = TextEditingController();
  bool _showRegPass = false;
  bool _showRegConfirm = false;

  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut);
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _loginEmailCtrl.dispose();
    _loginPassCtrl.dispose();
    _regNameCtrl.dispose();
    _regEmailCtrl.dispose();
    _regPhoneCtrl.dispose();
    _regPassCtrl.dispose();
    _regConfirmPassCtrl.dispose();
    super.dispose();
  }

  void _switchMode() {
    _animCtrl.reset();
    setState(() => _isLogin = !_isLogin);
    _animCtrl.forward();
  }

  Future<void> _handleLogin() async {
    final email = _loginEmailCtrl.text.trim();
    final pass = _loginPassCtrl.text.trim();

    if (email.isEmpty || pass.isEmpty) {
      _showSnack('Please fill all fields', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final success = await auth.login(email, pass);
    setState(() => _isLoading = false);

    if (!mounted) return;
    if (success) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      _showSnack(auth.errorMessage ?? 'Login failed', isError: true);
    }
  }

  Future<void> _handleRegister() async {
    final name = _regNameCtrl.text.trim();
    final email = _regEmailCtrl.text.trim();
    final phone = _regPhoneCtrl.text.trim();
    final pass = _regPassCtrl.text.trim();
    final confirm = _regConfirmPassCtrl.text.trim();

    if (name.isEmpty || email.isEmpty || phone.isEmpty || pass.isEmpty || confirm.isEmpty) {
      _showSnack('Please fill all fields', isError: true);
      return;
    }
    if (pass != confirm) {
      _showSnack('Passwords do not match', isError: true);
      return;
    }
    if (pass.length < 6) {
      _showSnack('Password must be at least 6 characters', isError: true);
      return;
    }
    if (phone.length < 10) {
      _showSnack('Enter a valid phone number', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final result = await auth.register(
      name: name,
      email: email,
      phone: phone,
      password: pass,
    );
    setState(() => _isLoading = false);

    if (!mounted) return;
    if (result['success'] == true) {
      if (result['autoLogin'] == true) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        _showSnack('Registration successful! Please login.');
        _switchMode();
        _loginEmailCtrl.text = email;
      }
    } else {
      _showSnack(result['message'] ?? 'Registration failed', isError: true);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ─────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Column(
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.15),
                          blurRadius: 24,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(10),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/app_icon.png',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(Icons.school, size: 70, color: AppColors.primary);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Admission Hero',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Prepare for Success',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
            ),

            // ── Form Card ──────────────────────────────────────────────────
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: FadeTransition(
                    opacity: _fadeAnim,
                    child: _isLogin ? _buildLoginForm() : _buildRegisterForm(),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Login Form ─────────────────────────────────────────────────────────────
  Widget _buildLoginForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        const Text('Welcome Back', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
        const SizedBox(height: 4),
        Text('Sign in to continue', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
        const SizedBox(height: 28),

        _buildLabel('Email or Phone'),
        _buildTextField(
          controller: _loginEmailCtrl,
          hint: 'Enter email or phone',
          icon: Icons.mail_outline,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        _buildLabel('Password'),
        _buildTextField(
          controller: _loginPassCtrl,
          hint: 'Enter password',
          icon: Icons.lock_outline,
          obscure: !_showLoginPass,
          suffixIcon: IconButton(
            icon: Icon(_showLoginPass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                color: AppColors.textMuted, size: 20),
            onPressed: () => setState(() => _showLoginPass = !_showLoginPass),
          ),
        ),
        const SizedBox(height: 8),

        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const ForgotPasswordScreen(),
                ),
              );
            },
            child: Text('Forgot password?',
                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w500)),
          ),
        ),
        const SizedBox(height: 8),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleLogin,
            child: _isLoading
                ? const SizedBox(height: 20, width: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
        const SizedBox(height: 20),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Don't have an account? ", style: TextStyle(color: AppColors.textSecondary)),
            GestureDetector(
              onTap: _switchMode,
              child: Text('Sign Up',
                  style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
        const SizedBox(height: 16),

        Center(
          child: TextButton(
            onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
            child: Text('Continue as guest',
                style: TextStyle(color: AppColors.textMuted)),
          ),
        ),
      ],
    );
  }

  // ── Register Form ──────────────────────────────────────────────────────────
  Widget _buildRegisterForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        const Text('Create Account', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
        const SizedBox(height: 4),
        Text('Join thousands of students', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
        const SizedBox(height: 24),

        _buildLabel('Full Name'),
        _buildTextField(controller: _regNameCtrl, hint: 'Enter full name', icon: Icons.person_outline),
        const SizedBox(height: 14),

        _buildLabel('Email'),
        _buildTextField(
            controller: _regEmailCtrl,
            hint: 'Enter email',
            icon: Icons.mail_outline,
            keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 14),

        _buildLabel('Phone'),
        _buildTextField(
            controller: _regPhoneCtrl,
            hint: 'Enter phone number',
            icon: Icons.call_outlined,
            keyboardType: TextInputType.phone),
        const SizedBox(height: 14),

        _buildLabel('Password'),
        _buildTextField(
          controller: _regPassCtrl,
          hint: 'Min 6 characters',
          icon: Icons.lock_outline,
          obscure: !_showRegPass,
          suffixIcon: IconButton(
            icon: Icon(_showRegPass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                color: AppColors.textMuted, size: 20),
            onPressed: () => setState(() => _showRegPass = !_showRegPass),
          ),
        ),
        const SizedBox(height: 14),

        _buildLabel('Confirm Password'),
        _buildTextField(
          controller: _regConfirmPassCtrl,
          hint: 'Confirm password',
          icon: Icons.lock_outline,
          obscure: !_showRegConfirm,
          suffixIcon: IconButton(
            icon: Icon(_showRegConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                color: AppColors.textMuted, size: 20),
            onPressed: () => setState(() => _showRegConfirm = !_showRegConfirm),
          ),
        ),
        const SizedBox(height: 24),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleRegister,
            child: _isLoading
                ? const SizedBox(height: 20, width: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Sign Up', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
        const SizedBox(height: 20),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Already have an account? ', style: TextStyle(color: AppColors.textSecondary)),
            GestureDetector(
              onTap: _switchMode,
              child: Text('Sign In',
                  style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLabel(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      );

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.borderLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 14),
            child: Icon(icon, color: AppColors.textMuted, size: 20),
          ),
          Expanded(
            child: TextField(
              controller: controller,
              obscureText: obscure,
              keyboardType: keyboardType,
              style: const TextStyle(fontSize: 15, color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              ),
            ),
          ),
          if (suffixIcon != null) suffixIcon,
        ],
      ),
    );
  }
}
