import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'firebase_options.dart';

// Theme
import 'theme/app_theme.dart';

// Services
import 'services/notification_service.dart';
import 'services/theme_service.dart';

// Providers
import 'providers/auth_provider.dart';
import 'providers/exam_provider.dart';
import 'providers/university_provider.dart';
import 'providers/firebase_provider.dart';
import 'providers/subscription_provider.dart';
import 'providers/banner_provider.dart';

// Screens
import 'screens/auth/auth_screen.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/exam/exam_result_screen.dart';
import 'screens/exam/exam_screen.dart';
import 'screens/exam/questions_view_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/home/question_sets_screen.dart';
import 'screens/home/session_selection_screen.dart';
import 'screens/home/unit_selection_screen.dart';
import 'screens/home/featured_exams_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/profile/support_screen.dart';
import 'screens/profile/performance_screen.dart';
import 'screens/search/search_screen.dart';
import 'screens/subscription/new_subscription_screen.dart';
import 'screens/exam/practice_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/chat/chat_screen.dart';
import 'screens/offline/offline_exams_screen.dart';
import 'screens/video/video_player_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/test/feature_test_screen.dart';
import 'screens/content/app_content_screen.dart';

// Models
import 'models/models.dart';

// Background FCM handler (must be top-level)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  debugPrint('🔔 BG Message: ${message.notification?.title}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Initialize Firebase FIRST
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Only set background handler for mobile platforms
  if (!kIsWeb) {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  // 2. Initialize other services
  await NotificationService().initialize();
  await ThemeService().initialize();

  debugPrint('✅ App initialized');
  runApp(const AdmissionHeroApp());
}

class AdmissionHeroApp extends StatelessWidget {
  const AdmissionHeroApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Core providers
        ChangeNotifierProvider(create: (_) => AuthProvider()..initialize()),
        ChangeNotifierProvider(create: (_) => UniversityProvider()),
        ChangeNotifierProvider(create: (_) => ExamProvider()),
        ChangeNotifierProvider(create: (_) => ThemeService()),
        ChangeNotifierProvider(create: (_) => SubscriptionProvider()),
        ChangeNotifierProvider(create: (_) => BannerProvider()),

        // Firebase provider — initialized after Firebase.initializeApp()
        ChangeNotifierProvider(
          create: (_) => FirebaseProvider()..initialize(),
        ),
      ],
      child: Consumer2<AuthProvider, ThemeService>(
        builder: (context, auth, themeService, _) {
          return MaterialApp(
            title: 'Admission Hero',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: themeService.themeMode,
            home: const AppInitializer(),
            onGenerateRoute: _generateRoute,
          );
        },
      ),
    );
  }

  Route<dynamic> _generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/auth':
        return MaterialPageRoute(builder: (_) => const AuthScreen());
      case '/forgot-password':
        return MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());
      case '/home':
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/search':
        return MaterialPageRoute(builder: (_) => const SearchScreen());
      case '/subscription':
        return MaterialPageRoute(builder: (_) => const NewSubscriptionScreen());
      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case '/edit-profile':
        return MaterialPageRoute(builder: (_) => const EditProfileScreen());
      case '/support':
        return MaterialPageRoute(builder: (_) => const SupportScreen());
      case '/chat':
        return MaterialPageRoute(builder: (_) => const ChatScreen());
      case '/notifications':
        return MaterialPageRoute(builder: (_) => const NotificationsScreen());
      case '/unit-selection':
        final uni = settings.arguments as University;
        return MaterialPageRoute(builder: (_) => UnitSelectionScreen(university: uni));
      case '/session-selection':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => SessionSelectionScreen(
            university: args['university'] as University,
            unit: args['unit'] as String,
          ),
        );
      case '/question-sets':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => QuestionSetsScreen(
            university: args['university'] as University,
            unit: args['unit'] as String,
            session: args['session'] as String,
          ),
        );
      case '/exam':
        final setId = settings.arguments as String;
        return MaterialPageRoute(builder: (_) => ExamScreen(setId: setId));
      case '/questions-view':
        final set = settings.arguments as QuestionSet;
        return MaterialPageRoute(builder: (_) => QuestionsViewScreen(questionSet: set));
      case '/exam-result':
        final res = settings.arguments as ExamResult;
        return MaterialPageRoute(builder: (_) => ExamResultScreen(result: res));
      case '/featured-exams':
        return MaterialPageRoute(builder: (_) => const FeaturedExamsScreen());
      case '/performance':
        return MaterialPageRoute(builder: (_) => const PerformanceScreen());
      case '/settings':
        return MaterialPageRoute(builder: (_) => const SettingsScreen());
      case '/app-content':
        final contentKey = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => AppContentScreen(contentKey: contentKey),
        );
      case '/offline-exams':
        return MaterialPageRoute(builder: (_) => const OfflineExamsScreen());
      case '/video-player':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => VideoPlayerScreen(
            videoUrl: args['videoUrl'] as String,
            title: args['title'] as String,
            description: args['description'] as String?,
          ),
        );
      case '/feature-test':
        return MaterialPageRoute(builder: (_) => const FeatureTestScreen());
      case '/practice':
        final setId = settings.arguments as String;
        return MaterialPageRoute(builder: (_) => PracticeScreen(setId: setId));
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}

// ── App Initializer (Controls Splash Screen) ───────────────────────────────
class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  bool _showSplash = true;
  bool _isReady = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Wait for auth to initialize
    final auth = context.read<AuthProvider>();
    
    // Wait for auth initialization
    int attempts = 0;
    while (auth.isLoading && attempts < 50) {
      await Future.delayed(const Duration(milliseconds: 100));
      attempts++;
    }
    
    // Mark as ready but keep splash visible
    setState(() => _isReady = true);
  }

  void _dismissSplash() {
    if (_isReady) {
      setState(() => _showSplash = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return SplashScreen(
        onDismiss: _dismissSplash,
        isReady: _isReady,
      );
    }

    // After splash is dismissed, show appropriate screen
    final auth = context.watch<AuthProvider>();
    if (auth.isAuthenticated) {
      return const HomeScreen();
    }
    return const AuthScreen();
  }
}

// ── Splash Screen ──────────────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  final VoidCallback onDismiss;
  final bool isReady;
  
  const SplashScreen({
    super.key, 
    required this.onDismiss,
    required this.isReady,
  });

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  bool _showTapHint = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();

    // Show "Tap to continue" hint after animation completes
    _checkReadyState();
  }

  void _checkReadyState() {
    Future.delayed(const Duration(milliseconds: 1600), () {
      if (mounted && widget.isReady) {
        setState(() => _showTapHint = true);
      } else if (mounted) {
        // Check again if not ready
        _checkReadyState();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    // Dismiss splash and let AppInitializer handle navigation
    widget.onDismiss();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Main Content
          GestureDetector(
            onTap: _handleTap,
            behavior: HitTestBehavior.opaque,
            child: Center(
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return Opacity(
                    opacity: _fadeAnimation.value,
                    child: Transform.scale(
                      scale: _scaleAnimation.value,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Logo
                          Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.2),
                                  blurRadius: 30,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                              border: Border.all(
                                color: AppColors.primary.withOpacity(0.1),
                                width: 2,
                              ),
                            ),
                            padding: const EdgeInsets.all(12),
                            child: ClipOval(
                              child: Image.asset(
                                'assets/images/app_icon.png',
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return const Icon(
                                    Icons.school,
                                    size: 80,
                                    color: AppColors.primary,
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          // App Name
                          const Text(
                            'Admission Hero',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Prepare for Success',
                            style: TextStyle(
                              fontSize: 16,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Bottom Elements
          if (_showTapHint)
            Positioned(
              left: 0,
              right: 0,
              bottom: 40,
              child: AnimatedOpacity(
                opacity: _showTapHint ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 800),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // "from Exam Hero" at the very bottom center
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'from Exam Hero',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.red.shade400,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      
                      // "Next" button at the right side
                      Align(
                        alignment: Alignment.centerRight,
                        child: Material(
                          color: AppColors.primary,
                          elevation: 4,
                          borderRadius: BorderRadius.circular(30),
                          child: InkWell(
                            onTap: _handleTap,
                            borderRadius: BorderRadius.circular(30),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text(
                                    'Next',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  SizedBox(width: 6),
                                  Icon(
                                    Icons.arrow_forward_ios,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
