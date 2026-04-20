import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Theme
import 'theme/app_theme.dart';

// Providers
import 'providers/auth_provider.dart';
import 'providers/exam_provider.dart';
import 'providers/university_provider.dart';

// Screens
import 'screens/auth/auth_screen.dart';
import 'screens/exam/exam_result_screen.dart';
import 'screens/exam/exam_screen.dart';
import 'screens/exam/questions_view_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/home/question_sets_screen.dart';
import 'screens/home/session_selection_screen.dart';
import 'screens/home/unit_selection_screen.dart';
import 'screens/home/featured_exams_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/support_screen.dart';
import 'screens/profile/performance_screen.dart';
import 'screens/search/search_screen.dart';
import 'screens/subscription/subscription_screen.dart';
import 'screens/subscription/subscription_details_screen.dart';
import 'screens/exam/practice_screen.dart';

// Models
import 'models/models.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AdmissionHeroApp());
}

class AdmissionHeroApp extends StatelessWidget {
  const AdmissionHeroApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initialize()),
        ChangeNotifierProvider(create: (_) => UniversityProvider()),
        ChangeNotifierProvider(create: (_) => ExamProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'Admission Hero',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light,
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
      case '/home':
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/search':
        return MaterialPageRoute(builder: (_) => const SearchScreen());
      case '/subscription':
        return MaterialPageRoute(builder: (_) => const SubscriptionScreen());
      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case '/support':
        return MaterialPageRoute(builder: (_) => const SupportScreen());
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
      case '/subscription-details':
        return MaterialPageRoute(builder: (_) => const SubscriptionDetailsScreen());
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
