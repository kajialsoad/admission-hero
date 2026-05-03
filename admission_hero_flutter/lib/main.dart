import 'package:flutter/material.dart';
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
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

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
            home: _buildHome(auth),
            onGenerateRoute: _generateRoute,
          );
        },
      ),
    );
  }

  Widget _buildHome(AuthProvider auth) {
    if (auth.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }
    if (auth.isAuthenticated) {
      return const HomeScreen();
    }
    return const AuthScreen();
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
