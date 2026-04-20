import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_theme.dart';

class PerformanceScreen extends StatelessWidget {
  const PerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy performance data based on Expo app
    const examsTaken = 12;
    const totalScore = 1050;
    const averageScore = 87.5;
    const rank = 145;
    const correctAnswers = 892;
    const wrongAnswers = 108;
    const totalAnswers = correctAnswers + wrongAnswers;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, left: 8, right: 16, bottom: 12),
              child: Row(children: [
                IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                const Text('Your Performance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Performance Cards Grid
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(children: [
                      Expanded(child: _buildCard('Exams Taken', '$examsTaken', Icons.description_outlined, const Color(0xFF3b82f6))),
                      const SizedBox(width: 16),
                      Expanded(child: _buildCard('Total Score', '$totalScore', Icons.star_border, const Color(0xFFeab308))),
                    ]),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(children: [
                      Expanded(child: _buildCard('Average Score', '$averageScore%', Icons.show_chart, const Color(0xFF22c55e))),
                      const SizedBox(width: 16),
                      Expanded(child: _buildCard('Your Rank', '#$rank', Icons.emoji_events_outlined, const Color(0xFFa855f7))),
                    ]),
                  ),

                  const SizedBox(height: 24),
                  
                  // Answer Stats
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Answer Statistics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: Column(children: [
                      _buildStatBar('Correct Answers', correctAnswers, totalAnswers, AppColors.success),
                      const SizedBox(height: 16),
                      _buildStatBar('Wrong Answers', wrongAnswers, totalAnswers, AppColors.error),
                    ]),
                  ),

                  const SizedBox(height: 24),

                  // Recent Exams
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Recent Exams', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  ),
                  const SizedBox(height: 12),
                  _buildRecentExam('DU Admission 2024', 92, 100),
                  _buildRecentExam('BUET Test', 88, 100),
                  _buildRecentExam('Medical Admission', 85, 100),

                  const SizedBox(height: 40),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
      child: Column(children: [
        Icon(icon, color: Colors.white, size: 32),
        const SizedBox(height: 12),
        Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 4),
        Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9))),
      ]),
    );
  }

  Widget _buildStatBar(String label, int value, int total, Color color) {
    final percent = total > 0 ? value / total : 0.0;
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
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

  Widget _buildRecentExam(String name, int score, int total) {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text('Score: $score/$total', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        ]),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: AppColors.primaryBg, borderRadius: BorderRadius.circular(20)),
          child: Text('$score%', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary)),
        ),
      ]),
    );
  }
}
