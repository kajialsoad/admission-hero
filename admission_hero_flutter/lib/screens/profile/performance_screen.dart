import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _stats;
  List<dynamic> _recentExams = [];

  @override
  void initState() {
    super.initState();
    _loadPerformance();
  }

  Future<void> _loadPerformance() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = ApiService();
      // Fetch performance stats from backend
      final statsResponse = await api.get('/exams/performance/stats');
      final recentResponse = await api.get('/exams/performance/recent?limit=5');

      setState(() {
        _stats = statsResponse['data'] ?? statsResponse;
        _recentExams = recentResponse['data'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
          statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(
                  top: MediaQuery.of(context).padding.top + 8,
                  left: 8,
                  right: 16,
                  bottom: 12),
              child: Row(children: [
                IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context)),
                const Text('Your Performance',
                    style: TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                const Spacer(),
                IconButton(
                    icon: const Icon(Icons.refresh, color: Colors.white),
                    onPressed: _loadPerformance),
              ]),
            ),

            Expanded(
              child: _isLoading
                  ? const Center(
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        CircularProgressIndicator(color: AppColors.primary),
                        SizedBox(height: 12),
                        Text('Loading performance data...',
                            style: TextStyle(color: AppColors.textMuted)),
                      ]),
                    )
                  : _error != null
                      ? Center(
                          child: Column(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.error_outline,
                                size: 60, color: AppColors.error),
                            const SizedBox(height: 12),
                            Text('Failed to load data',
                                style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary)),
                            const SizedBox(height: 8),
                            Text(_error!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              onPressed: _loadPerformance,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Try Again'),
                            ),
                          ]),
                        )
                      : _buildContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final examsTaken = _stats?['examsTaken'] ?? _stats?['totalExams'] ?? 0;
    final totalScore = _stats?['totalScore'] ?? _stats?['totalObtainedMarks'] ?? 0;
    final averageScore = (_stats?['averageScore'] ?? _stats?['averagePercentage'] ?? 0.0).toDouble();
    final rank = _stats?['rank'] ?? _stats?['userRank'] ?? '-';
    final correctAnswers = _stats?['correctAnswers'] ?? _stats?['totalCorrect'] ?? 0;
    final wrongAnswers = _stats?['wrongAnswers'] ?? _stats?['totalWrong'] ?? 0;
    final totalAnswers = correctAnswers + wrongAnswers;

    return RefreshIndicator(
      onRefresh: _loadPerformance,
      color: AppColors.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Performance Cards Grid
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              Expanded(
                  child: _buildCard('Exams Taken', '$examsTaken',
                      Icons.description_outlined, const Color(0xFF3b82f6))),
              const SizedBox(width: 16),
              Expanded(
                  child: _buildCard('Total Score', '$totalScore',
                      Icons.star_border, const Color(0xFFeab308))),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(children: [
              Expanded(
                  child: _buildCard(
                      'Average Score',
                      '${averageScore.toStringAsFixed(1)}%',
                      Icons.show_chart,
                      const Color(0xFF22c55e))),
              const SizedBox(width: 16),
              Expanded(
                  child: _buildCard('Your Rank', rank is int ? '#$rank' : '$rank',
                      Icons.emoji_events_outlined, const Color(0xFFa855f7))),
            ]),
          ),

          const SizedBox(height: 24),

          // Answer Stats
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Answer Statistics',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary)),
          ),
          const SizedBox(height: 12),
          if (totalAnswers > 0)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(16)),
              child: Column(children: [
                _buildStatBar(
                    'Correct Answers', correctAnswers, totalAnswers, AppColors.success),
                const SizedBox(height: 16),
                _buildStatBar(
                    'Wrong Answers', wrongAnswers, totalAnswers, AppColors.error),
              ]),
            )
          else
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(16)),
              child: const Center(
                child: Text('No answer data available yet',
                    style: TextStyle(color: AppColors.textMuted)),
              ),
            ),

          const SizedBox(height: 24),

          // Recent Exams
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Recent Exams',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary)),
          ),
          const SizedBox(height: 12),

          if (_recentExams.isEmpty)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(16)),
              child: const Center(
                child: Text('No exams taken yet',
                    style: TextStyle(color: AppColors.textMuted)),
              ),
            )
          else
            ..._recentExams.map((exam) {
              final name = exam['questionSetName'] ??
                  exam['name'] ??
                  exam['questionSetId'] ??
                  'Exam';
              final score = (exam['percentage'] ?? exam['obtainedMarks'] ?? 0).toDouble();
              final total = exam['totalMarks'] ?? exam['totalQuestions'] ?? 100;
              final obtained = exam['obtainedMarks'] ?? 0;
              return _buildRecentExam(
                name.toString(),
                score,
                obtained.toString(),
                total.toString(),
                exam['submittedAt'],
              );
            }),

          const SizedBox(height: 40),
        ]),
      ),
    );
  }

  Widget _buildCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration:
          BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
      child: Column(children: [
        Icon(icon, color: Colors.white, size: 32),
        const SizedBox(height: 12),
        Text(value,
            style: const TextStyle(
                fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 4),
        Text(label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9))),
      ]),
    );
  }

  Widget _buildStatBar(String label, int value, int total, Color color) {
    final percent = total > 0 ? value / total : 0.0;
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
        Text('$value', style: TextStyle(fontWeight: FontWeight.w700, color: color)),
      ]),
      const SizedBox(height: 8),
      ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(
          value: percent,
          minHeight: 10,
          backgroundColor: AppColors.borderLight,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      ),
    ]);
  }

  Widget _buildRecentExam(
      String name, double percentage, String obtained, String total, dynamic date) {
    String dateStr = '';
    if (date != null) {
      try {
        final dt = DateTime.parse(date.toString());
        dateStr =
            '${dt.day}/${dt.month}/${dt.year}';
      } catch (_) {}
    }

    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name,
                style: const TextStyle(
                    fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Text('Score: $obtained/$total${dateStr.isNotEmpty ? ' • $dateStr' : ''}',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ]),
        ),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
              color: AppColors.primaryBg, borderRadius: BorderRadius.circular(20)),
          child: Text('${percentage.toStringAsFixed(0)}%',
              style: const TextStyle(
                  fontWeight: FontWeight.w700, color: AppColors.primary)),
        ),
      ]),
    );
  }
}
