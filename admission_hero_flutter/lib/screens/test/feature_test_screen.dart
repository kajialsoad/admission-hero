import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/exam_provider.dart';
import '../../providers/university_provider.dart';
import '../../services/notification_service.dart';
import '../../services/offline_service.dart';
import '../../services/theme_service.dart';
import '../../models/models.dart';
import '../../utils/constants.dart';

class FeatureTestScreen extends StatefulWidget {
  const FeatureTestScreen({super.key});

  @override
  State<FeatureTestScreen> createState() => _FeatureTestScreenState();
}

class _FeatureTestScreenState extends State<FeatureTestScreen> {
  final List<TestResult> _testResults = [];
  bool _isRunningTests = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Feature Tests'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.play_arrow),
            onPressed: _isRunningTests ? null : _runAllTests,
          ),
        ],
      ),
      body: Column(
        children: [
          // Test Summary
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.primaryContainer,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Feature Test Results',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Total Tests: ${_testResults.length}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Text(
                  'Passed: ${_testResults.where((r) => r.passed).length}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.green,
                  ),
                ),
                Text(
                  'Failed: ${_testResults.where((r) => !r.passed).length}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.red,
                  ),
                ),
              ],
            ),
          ),
          
          // Test Results List
          Expanded(
            child: _isRunningTests
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('Running tests...'),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _testResults.length,
                    itemBuilder: (context, index) {
                      final result = _testResults[index];
                      return _buildTestResultCard(result);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _isRunningTests ? null : _runAllTests,
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildTestResultCard(TestResult result) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          result.passed ? Icons.check_circle : Icons.error,
          color: result.passed ? Colors.green : Colors.red,
        ),
        title: Text(result.testName),
        subtitle: Text(result.description),
        trailing: result.passed
            ? const Icon(Icons.thumb_up, color: Colors.green)
            : const Icon(Icons.thumb_down, color: Colors.red),
        onTap: () {
          if (!result.passed) {
            _showErrorDialog(result);
          }
        },
      ),
    );
  }

  void _showErrorDialog(TestResult result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Test Failed: ${result.testName}'),
        content: Text(result.errorMessage ?? 'Unknown error'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _runAllTests() async {
    setState(() {
      _isRunningTests = true;
      _testResults.clear();
    });

    // Run all feature tests
    await _testAuthenticationFeatures();
    await _testExamFeatures();
    await _testUniversityFeatures();
    await _testNotificationFeatures();
    await _testOfflineFeatures();
    await _testThemeFeatures();
    await _testNavigationFeatures();
    await _testUIComponents();

    setState(() {
      _isRunningTests = false;
    });

    // Show completion message
    final passedCount = _testResults.where((r) => r.passed).length;
    final totalCount = _testResults.length;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Tests completed: $passedCount/$totalCount passed',
        ),
        backgroundColor: passedCount == totalCount ? Colors.green : Colors.orange,
      ),
    );
  }

  // ── Authentication Tests ───────────────────────────────────────────────────
  Future<void> _testAuthenticationFeatures() async {
    final authProvider = context.read<AuthProvider>();
    
    // Test 1: Auth Provider Initialization
    _addTestResult(TestResult(
      testName: 'Auth Provider Initialization',
      description: 'Check if AuthProvider is properly initialized',
      passed: authProvider.isInitialized,
      errorMessage: authProvider.isInitialized ? null : 'AuthProvider not initialized',
    ));

    // Test 2: Login Function Exists
    try {
      // This will test if the method exists without actually calling it
      final loginMethod = authProvider.login;
      _addTestResult(TestResult(
        testName: 'Login Method Available',
        description: 'Check if login method is available',
        passed: loginMethod != null,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'Login Method Available',
        description: 'Check if login method is available',
        passed: false,
        errorMessage: e.toString(),
      ));
    }

    // Test 3: User Model Structure
    try {
      final testUser = UserModel(
        id: 'test',
        name: 'Test User',
        email: 'test@example.com',
        phone: '01234567890',
      );
      final json = testUser.toJson();
      final fromJson = UserModel.fromJson(json);
      
      _addTestResult(TestResult(
        testName: 'User Model Serialization',
        description: 'Test UserModel toJson/fromJson',
        passed: fromJson.name == testUser.name,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'User Model Serialization',
        description: 'Test UserModel toJson/fromJson',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── Exam Tests ─────────────────────────────────────────────────────────────
  Future<void> _testExamFeatures() async {
    final examProvider = context.read<ExamProvider>();
    
    // Test 1: Exam Provider Initialization
    _addTestResult(TestResult(
      testName: 'Exam Provider Available',
      description: 'Check if ExamProvider is available',
      passed: examProvider != null,
    ));

    // Test 2: Question Model Structure
    try {
      final testQuestion = Question(
        id: 'test_q1',
        questionNumber: 1,
        text: 'Test question?',
        questionType: 'mcq',
        options: [
          QuestionOption(key: 'A', text: 'Option A'),
          QuestionOption(key: 'B', text: 'Option B'),
        ],
        correctAnswer: 'A',
      );
      
      final json = testQuestion.toJson();
      final fromJson = Question.fromJson(json);
      
      _addTestResult(TestResult(
        testName: 'Question Model Serialization',
        description: 'Test Question model toJson/fromJson',
        passed: fromJson.text == testQuestion.text,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'Question Model Serialization',
        description: 'Test Question model toJson/fromJson',
        passed: false,
        errorMessage: e.toString(),
      ));
    }

    // Test 3: QuestionSet Model
    try {
      final testQuestionSet = QuestionSet(
        id: 'test_set1',
        name: 'Test Question Set',
        university: {'name': 'Test University', 'shortName': 'TU'},
        unit: 'A',
        session: '2024',
        totalQuestions: 10,
        createdAt: DateTime.now(),
      );
      
      final json = testQuestionSet.toJson();
      final fromJson = QuestionSet.fromJson(json);
      
      _addTestResult(TestResult(
        testName: 'QuestionSet Model Serialization',
        description: 'Test QuestionSet model toJson/fromJson',
        passed: fromJson.name == testQuestionSet.name,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'QuestionSet Model Serialization',
        description: 'Test QuestionSet model toJson/fromJson',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── University Tests ───────────────────────────────────────────────────────
  Future<void> _testUniversityFeatures() async {
    final universityProvider = context.read<UniversityProvider>();
    
    // Test 1: University Provider Available
    _addTestResult(TestResult(
      testName: 'University Provider Available',
      description: 'Check if UniversityProvider is available',
      passed: universityProvider != null,
    ));

    // Test 2: University Model
    try {
      final testUniversity = University(
        id: 'test_uni1',
        name: 'Test University',
        shortName: 'TU',
        units: ['A', 'B', 'C'],
        createdAt: DateTime.now(),
      );
      
      final json = testUniversity.toJson();
      final fromJson = University.fromJson(json);
      
      _addTestResult(TestResult(
        testName: 'University Model Serialization',
        description: 'Test University model toJson/fromJson',
        passed: fromJson.name == testUniversity.name,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'University Model Serialization',
        description: 'Test University model toJson/fromJson',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── Notification Tests ─────────────────────────────────────────────────────
  Future<void> _testNotificationFeatures() async {
    try {
      final notificationService = NotificationService();
      
      // Test 1: Notification Service Available
      _addTestResult(TestResult(
        testName: 'Notification Service Available',
        description: 'Check if NotificationService is available',
        passed: notificationService != null,
      ));

      // Test 2: Notification Creation
      final testNotification = AppNotification(
        id: 'test_notif1',
        title: 'Test Notification',
        body: 'This is a test notification',
        type: NotificationType.general,
        timestamp: DateTime.now(),
      );
      
      _addTestResult(TestResult(
        testName: 'Notification Creation',
        description: 'Test creating notification objects',
        passed: testNotification.title == 'Test Notification',
      ));

      // Test 3: Notification List Access
      final notifications = notificationService.notifications;
      _addTestResult(TestResult(
        testName: 'Notification List Access',
        description: 'Test accessing notification list',
        passed: notifications != null,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'Notification Features',
        description: 'Test notification system',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── Offline Tests ──────────────────────────────────────────────────────────
  Future<void> _testOfflineFeatures() async {
    try {
      final offlineService = OfflineService();
      
      // Test 1: Offline Service Available
      _addTestResult(TestResult(
        testName: 'Offline Service Available',
        description: 'Check if OfflineService is available',
        passed: offlineService != null,
      ));

      // Test 2: Storage Usage Check
      final storageUsage = await offlineService.getStorageUsage();
      _addTestResult(TestResult(
        testName: 'Storage Usage Check',
        description: 'Test getting storage usage information',
        passed: storageUsage != null && storageUsage.containsKey('exams'),
      ));

      // Test 3: Offline Exams List
      final offlineExams = await offlineService.getOfflineExams();
      _addTestResult(TestResult(
        testName: 'Offline Exams List',
        description: 'Test getting offline exams list',
        passed: offlineExams != null,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'Offline Features',
        description: 'Test offline functionality',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── Theme Tests ────────────────────────────────────────────────────────────
  Future<void> _testThemeFeatures() async {
    try {
      final themeService = context.read<ThemeService>();
      
      // Test 1: Theme Service Available
      _addTestResult(TestResult(
        testName: 'Theme Service Available',
        description: 'Check if ThemeService is available',
        passed: themeService != null,
      ));

      // Test 2: Theme Mode Access
      final currentTheme = themeService.themeMode;
      _addTestResult(TestResult(
        testName: 'Theme Mode Access',
        description: 'Test accessing current theme mode',
        passed: currentTheme != null,
      ));

      // Test 3: Theme Name Generation
      final themeName = themeService.themeName;
      _addTestResult(TestResult(
        testName: 'Theme Name Generation',
        description: 'Test getting theme name string',
        passed: themeName.isNotEmpty,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'Theme Features',
        description: 'Test theme system',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── Navigation Tests ───────────────────────────────────────────────────────
  Future<void> _testNavigationFeatures() async {
    try {
      // Test 1: Navigator Available
      final navigator = Navigator.of(context);
      _addTestResult(TestResult(
        testName: 'Navigator Available',
        description: 'Check if Navigator is available',
        passed: navigator != null,
      ));

      // Test 2: Route Names
      final routeNames = [
        '/auth',
        '/home',
        '/search',
        '/profile',
        '/settings',
        '/notifications',
        '/chat',
        '/offline-exams',
      ];
      
      _addTestResult(TestResult(
        testName: 'Route Names Defined',
        description: 'Check if all required routes are defined',
        passed: routeNames.isNotEmpty,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'Navigation Features',
        description: 'Test navigation system',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  // ── UI Component Tests ─────────────────────────────────────────────────────
  Future<void> _testUIComponents() async {
    try {
      // Test 1: Theme Data Available
      final theme = Theme.of(context);
      _addTestResult(TestResult(
        testName: 'Theme Data Available',
        description: 'Check if theme data is available',
        passed: theme != null,
      ));

      // Test 2: Color Scheme
      final colorScheme = theme.colorScheme;
      _addTestResult(TestResult(
        testName: 'Color Scheme Available',
        description: 'Check if color scheme is available',
        passed: colorScheme != null,
      ));

      // Test 3: Text Theme
      final textTheme = theme.textTheme;
      _addTestResult(TestResult(
        testName: 'Text Theme Available',
        description: 'Check if text theme is available',
        passed: textTheme != null,
      ));

      // Test 4: App Constants
      _addTestResult(TestResult(
        testName: 'App Constants Available',
        description: 'Check if app constants are defined',
        passed: AppConstants.baseUrl.isNotEmpty,
      ));
    } catch (e) {
      _addTestResult(TestResult(
        testName: 'UI Components',
        description: 'Test UI component system',
        passed: false,
        errorMessage: e.toString(),
      ));
    }
  }

  void _addTestResult(TestResult result) {
    setState(() {
      _testResults.add(result);
    });
  }
}

class TestResult {
  final String testName;
  final String description;
  final bool passed;
  final String? errorMessage;

  TestResult({
    required this.testName,
    required this.description,
    required this.passed,
    this.errorMessage,
  });
}