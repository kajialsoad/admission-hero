import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/exam_provider.dart';
import '../../providers/university_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/university_card.dart';
import '../../widgets/exam_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _initialized = true;
      _loadData();
    }
  }

  Future<void> _loadData() async {
    final uniProv = context.read<UniversityProvider>();
    final examProv = context.read<ExamProvider>();
    await Future.wait([
      uniProv.fetchUniversities(limit: 20),
      examProv.fetchQuestionSets(page: 1, limit: 5),
    ]);
  }

  Future<void> _onRefresh() async {
    await _loadData();
  }

  void _handleUniversitySelect(University uni) {
    Navigator.pushNamed(context, '/unit-selection', arguments: uni);
  }

  void _handleExamPress(QuestionSet set) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Start Exam?', style: TextStyle(fontWeight: FontWeight.w700)),
        content: Text(
          'You are about to start "${set.name}". The timer will begin immediately. Are you ready?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushNamed(context, '/exam', arguments: set.id);
            },
            child: const Text('Start Exam'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final universities = context.watch<UniversityProvider>().universities;
    final uniLoading = context.watch<UniversityProvider>().isLoading;
    final questionSets = context.watch<ExamProvider>().questionSets;
    final examLoading = context.watch<ExamProvider>().isLoading;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: AppColors.primary,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // ── App Header ─────────────────────────────────────────────────
            _buildHeader(user),

            // ── Content ────────────────────────────────────────────────────
            Expanded(
              child: RefreshIndicator(
                onRefresh: _onRefresh,
                color: AppColors.primary,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(bottom: 90),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Stats
                      _buildStatsSection(questionSets),

                      // Universities
                      _buildSectionHeader('Select University',
                          subtitle: universities.isNotEmpty ? '${universities.length} Available' : null),
                      _buildUniversitySection(universities, uniLoading),

                      // Featured Exams
                      _buildSectionHeader('Featured Exams', actionText: 'View All',
                          onAction: () => Navigator.pushNamed(context, '/featured-exams')),
                      _buildExamsSection(questionSets, examLoading),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 0),
      ),
    );
  }

  Widget _buildHeader(UserModel? user) {
    return Container(
      color: AppColors.primary,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 12,
        left: 16,
        right: 16,
        bottom: 16,
      ),
      child: Row(
        children: [
          const Text('🎓', style: TextStyle(fontSize: 32)),
          const SizedBox(width: 8),
          const Text(
            'Admission Hero',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              letterSpacing: -0.3,
            ),
          ),
          const Spacer(),
          if (user != null)
            GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/profile'),
              child: CircleAvatar(
                radius: 18,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(
                  user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                ),
              ),
            )
          else
            TextButton(
              onPressed: () => Navigator.pushNamed(context, '/auth'),
              style: TextButton.styleFrom(
                backgroundColor: Colors.white.withOpacity(0.15),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: const Text('Login', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(List<QuestionSet> sets) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Live Statistics',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: StatsCard(icon: Icons.book_outlined, label: 'Total Exams', value: sets.length, color: AppColors.primary)),
              const SizedBox(width: 10),
              Expanded(child: StatsCard(
                icon: Icons.quiz_outlined,
                label: 'Questions',
                value: sets.fold<int>(0, (sum, s) => sum + s.totalQuestions),
                color: AppColors.accent,
              )),
              const SizedBox(width: 10),
              Expanded(child: StatsCard(icon: Icons.play_circle_outline, label: 'Videos', value: 0, color: AppColors.success)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {String? subtitle, String? actionText, VoidCallback? onAction}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
      child: Row(
        children: [
          Text(title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const Spacer(),
          if (subtitle != null)
            Text(subtitle, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
          if (actionText != null)
            GestureDetector(
              onTap: onAction,
              child: Text(actionText,
                  style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }

  Widget _buildUniversitySection(List<University> universities, bool loading) {
    if (loading) return _buildLoading('Loading universities...');
    if (universities.isEmpty) {
      return _buildEmpty(Icons.school_outlined, 'No universities available');
    }
    return Column(
      children: universities
          .map((uni) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: UniversityCard(
                  university: uni,
                  onTap: () => _handleUniversitySelect(uni),
                ),
              ))
          .toList(),
    );
  }

  Widget _buildExamsSection(List<QuestionSet> sets, bool loading) {
    if (loading) return _buildLoading('Loading exams...');
    if (sets.isEmpty) {
      return _buildEmpty(Icons.description_outlined, 'No exams available');
    }
    return Column(
      children: sets
          .map((set) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ExamCard(
                  questionSet: set,
                  onTap: () => _handleExamPress(set),
                ),
              ))
          .toList(),
    );
  }

  Widget _buildLoading(String msg) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          const CircularProgressIndicator(color: AppColors.primary),
          const SizedBox(height: 12),
          Text(msg, style: const TextStyle(color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildEmpty(IconData icon, String msg) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: AppColors.textMuted),
          const SizedBox(height: 8),
          Text(msg, style: const TextStyle(color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
