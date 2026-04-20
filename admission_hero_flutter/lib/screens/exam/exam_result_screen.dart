import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/models.dart';
import '../../theme/app_theme.dart';


class ExamResultScreen extends StatefulWidget {
  final ExamResult result;
  const ExamResultScreen({super.key, required this.result});

  @override
  State<ExamResultScreen> createState() => _ExamResultScreenState();
}

class _ExamResultScreenState extends State<ExamResultScreen> {
  bool _expandedAnalysis = false;

  Color get _performanceColor {
    if (widget.result.percentage >= 80) return AppColors.success;
    if (widget.result.percentage >= 60) return AppColors.warning;
    return AppColors.error;
  }

  String get _performanceLabel {
    if (widget.result.percentage >= 80) return 'Excellent 🏆';
    if (widget.result.percentage >= 60) return 'Good 👍';
    return 'Needs Improvement';
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.result;
    final timeTakenMin = r.timeTaken ~/ 60;
    final timeTakenSec = r.timeTaken % 60;
    final accuracy = r.totalQuestions > 0 ? (r.correctAnswers / r.totalQuestions * 100) : 0.0;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 12,
                left: 16, right: 16, bottom: 16,
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Exam Result',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
                GestureDetector(
                  onTap: () => Navigator.pushReplacementNamed(context, '/home'),
                  child: const Icon(Icons.close, color: Colors.white, size: 28),
                ),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(children: [
                  // ── Score Card ──────────────────────────────────────────────
                  _buildScoreCard(r, timeTakenMin, timeTakenSec),
                  const SizedBox(height: 16),

                  // ── Stats Grid ──────────────────────────────────────────────
                  _buildStatsGrid(r, timeTakenMin, timeTakenSec, accuracy),
                  const SizedBox(height: 16),

                  // ── Detailed Analysis ───────────────────────────────────────
                  GestureDetector(
                    onTap: () => setState(() => _expandedAnalysis = !_expandedAnalysis),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(children: [
                        Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.bar_chart, color: Color(0xFF4F46E5), size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('Detailed Analysis', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                          const Text('View question-wise performance', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ])),
                        Icon(_expandedAnalysis ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                            color: AppColors.textMuted),
                      ]),
                    ),
                  ),

                  if (_expandedAnalysis) ...[
                    const SizedBox(height: 8),
                    _buildAnswerAnalysis(r),
                  ],

                  const SizedBox(height: 16),

                  // ── Action Buttons ──────────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
                      icon: const Icon(Icons.home_outlined),
                      label: const Text('Back to Home'),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pushReplacementNamed(context, '/exam',
                            arguments: r.questionSetId);
                      },
                      icon: const Icon(Icons.replay),
                      label: const Text('Retake Exam'),
                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                    ),
                  ),
                  const SizedBox(height: 32),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreCard(ExamResult r, int min, int sec) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10)],
      ),
      clipBehavior: Clip.hardEdge,
      child: Column(
        children: [
          // Score area
          Container(
            width: double.infinity,
            color: _performanceColor,
            padding: const EdgeInsets.symmetric(vertical: 32),
            child: Column(children: [
              const Text('Your Score', style: TextStyle(color: Colors.white70, fontSize: 14)),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(r.obtainedMarks.toStringAsFixed(1),
                    style: const TextStyle(color: Colors.white, fontSize: 52, fontWeight: FontWeight.w700)),
                Text(' / ${r.totalMarks}',
                    style: const TextStyle(color: Colors.white70, fontSize: 24, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                child: Text('${r.percentage.toStringAsFixed(1)}%   $_performanceLabel',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              ),
            ]),
          ),
          // Progress bars
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(children: [
              _progressBar('Correct', r.correctAnswers, r.totalQuestions, AppColors.success),
              const SizedBox(height: 12),
              _progressBar('Wrong', r.wrongAnswers, r.totalQuestions, AppColors.error),
              const SizedBox(height: 12),
              _progressBar('Unattempted', r.unattempted, r.totalQuestions, AppColors.textMuted),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _progressBar(String label, int val, int total, Color color) {
    final ratio = total > 0 ? val / total : 0.0;
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Row(children: [
          Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        ]),
        Text(val.toString(), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color)),
      ]),
      const SizedBox(height: 6),
      ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(
          value: ratio, minHeight: 8,
          backgroundColor: AppColors.borderLight,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      ),
    ]);
  }

  Widget _buildStatsGrid(ExamResult r, int min, int sec, double accuracy) {
    return Row(children: [
      Expanded(child: _statBox('Total Questions', '${r.totalQuestions}', Icons.list_alt_outlined, AppColors.primary)),
      const SizedBox(width: 12),
      Expanded(child: _statBox('Time Taken', '${min}m ${sec}s', Icons.timer_outlined, AppColors.accent)),
      const SizedBox(width: 12),
      Expanded(child: _statBox('Accuracy', '${accuracy.toStringAsFixed(1)}%', Icons.track_changes, AppColors.success)),
    ]);
  }

  Widget _statBox(String label, String val, IconData icon, Color color) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(val, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        ]),
      );

  Widget _buildAnswerAnalysis(ExamResult r) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.hardEdge,
      child: Column(
        children: r.answers.asMap().entries.map((entry) {
          final i = entry.key;
          final ans = entry.value;
          Color bg;
          Color iconColor;
          IconData icon;
          if (ans.isCorrect) {
            bg = AppColors.successLight;
            iconColor = AppColors.success;
            icon = Icons.check_circle;
          } else if (ans.selected.isNotEmpty) {
            bg = AppColors.errorLight;
            iconColor = AppColors.error;
            icon = Icons.cancel;
          } else {
            bg = AppColors.borderLight;
            iconColor = AppColors.textMuted;
            icon = Icons.remove_circle_outline;
          }

          return Container(
            color: bg,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Q${i + 1}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text('Your Answer: ${ans.selected.isEmpty ? 'Not Answered' : ans.selected}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                if (!ans.isCorrect && ans.selected.isNotEmpty)
                  Text('Correct: ${ans.correct}',
                      style: const TextStyle(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.w600)),
              ])),
              Icon(icon, color: iconColor, size: 28),
            ]),
          );
        }).toList(),
      ),
    );
  }
}
