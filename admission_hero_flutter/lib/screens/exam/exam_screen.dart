import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/exam_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/math_text.dart';

class ExamScreen extends StatefulWidget {
  final String setId;
  const ExamScreen({super.key, required this.setId});

  @override
  State<ExamScreen> createState() => _ExamScreenState();
}

class _ExamScreenState extends State<ExamScreen> {
  Timer? _timer;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadExam();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadExam() async {
    final examProv = context.read<ExamProvider>();
    await examProv.loadExam(widget.setId);
    if (mounted && examProv.currentQuestions.isNotEmpty) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      final examProv = context.read<ExamProvider>();
      if (examProv.timeRemaining <= 0) {
        t.cancel();
        _handleTimeEnd();
      } else {
        examProv.updateTimer(examProv.timeRemaining - 1);
      }
    });
  }

  void _handleTimeEnd() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('⏰ Time Up!',
            style: TextStyle(fontWeight: FontWeight.w700)),
        content:
            const Text("Your exam time has ended. Submitting your answers..."),
        actions: [
          ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _submitExam();
              },
              child: const Text('OK')),
        ],
      ),
    );
  }

  Future<void> _submitExam() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    _timer?.cancel();

    final examProv = context.read<ExamProvider>();
    final totalSec = examProv.currentQuestions.length * 45;
    final timeTaken = totalSec - examProv.timeRemaining;

    final result = await examProv.submitExam(timeTaken);
    if (!mounted) return;

    setState(() => _isSubmitting = false);
    Navigator.pushReplacementNamed(context, '/exam-result', arguments: result);
  }

  void _confirmExit() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Exit Exam?',
            style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text(
            'Are you sure you want to exit? Your progress will be lost.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Exit'),
          ),
        ],
      ),
    );
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Color _timerColor(int seconds, int total) {
    final ratio = total > 0 ? seconds / total : 1.0;
    if (ratio > 0.5) return AppColors.success;
    if (ratio > 0.25) return AppColors.warning;
    return AppColors.error;
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
          statusBarColor: AppColors.primary,
          statusBarIconBrightness: Brightness.light),
      child: Consumer<ExamProvider>(
        builder: (context, exam, _) {
          if (exam.isLoading) return _buildLoading();
          if (exam.error != null) return _buildError(exam.error!);
          if (exam.currentQuestions.isEmpty) return _buildNoQuestions();

          final q = exam.currentQuestion!;
          final total = exam.currentQuestions.length;
          final selectedAnswer = exam.answers[q.id] ?? '';
          final isLast = exam.currentQuestionIndex == total - 1;
          final totalSec = total * 45;

          return Scaffold(
            backgroundColor: AppColors.background,
            body: Column(
              children: [
                // ── Exam Header ─────────────────────────────────────────────
                _buildExamHeader(exam, totalSec),

                // ── Content ──────────────────────────────────────────────────
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      children: [
                        // Question Card
                        _buildQuestionCard(exam, q, total, selectedAnswer),
                        const SizedBox(height: 12),
                        // Question Navigator
                        _buildNavigator(exam, total),
                      ],
                    ),
                  ),
                ),

                // ── Footer Navigation ────────────────────────────────────────
                _buildFooter(exam, isLast),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildExamHeader(ExamProvider exam, int totalSec) {
    final tc = _timerColor(exam.timeRemaining, totalSec);
    return Container(
      color: AppColors.primary,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        left: 12,
        right: 12,
        bottom: 12,
      ),
      child: Column(
        children: [
          Row(children: [
            GestureDetector(
                onTap: _confirmExit,
                child: const Icon(Icons.close, color: Colors.white, size: 26)),
            const SizedBox(width: 10),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(exam.currentSet?.name ?? 'Exam',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                  Text(
                      '${exam.currentSet?.unit ?? ''} • ${exam.currentSet?.universityName ?? ''}',
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.8), fontSize: 12)),
                ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                  color: tc.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: tc)),
              child: Text(_formatTime(exam.timeRemaining),
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 16)),
            ),
          ]),
          const SizedBox(height: 10),
          // Progress bar
          Row(children: [
            Text(
                '${exam.currentQuestionIndex + 1}/${exam.currentQuestions.length}',
                style: TextStyle(
                    color: Colors.white.withOpacity(0.8), fontSize: 12)),
            const SizedBox(width: 10),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: exam.currentQuestions.isEmpty
                      ? 0
                      : (exam.currentQuestionIndex + 1) /
                          exam.currentQuestions.length,
                  minHeight: 6,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
            ),
          ]),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(
      ExamProvider exam, Question q, int total, String selectedAnswer) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Q Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                  colors: [AppColors.primary, Color(0xFF4F46E5)]),
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Question ${exam.currentQuestionIndex + 1} of $total',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20)),
                    child: const Text('1 Mark',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700)),
                  ),
                ]),
          ),

          // Q Text
          Padding(
            padding: const EdgeInsets.all(16),
            child: MathText(q.text,
                textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                    height: 1.6)),
          ),

          // Options
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              children: q.options.map((opt) {
                final isSelected = selectedAnswer == opt.key;
                return GestureDetector(
                  onTap: () => exam.answerQuestion(q.id, opt.key),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primaryBg
                          : AppColors.borderLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color:
                              isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 2 : 1),
                    ),
                    child: Row(children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.border,
                              width: 2),
                        ),
                        child: isSelected
                            ? const Icon(Icons.check,
                                color: Colors.white, size: 14)
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                          child: MathText(opt.text,
                              textStyle: TextStyle(
                                  fontSize: 15,
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.textPrimary,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.w400))),
                    ]),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigator(ExamProvider exam, int total) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Question Map',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: List.generate(total, (i) {
            final q = exam.currentQuestions[i];
            final answered = exam.answers.containsKey(q.id);
            final isCurrent = i == exam.currentQuestionIndex;
            return GestureDetector(
              onTap: () => exam.goToQuestion(i),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isCurrent
                      ? AppColors.primary
                      : answered
                          ? AppColors.successLight
                          : AppColors.borderLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isCurrent
                        ? AppColors.primary
                        : answered
                            ? AppColors.success
                            : AppColors.border,
                  ),
                ),
                child: Center(
                    child: Text('${i + 1}',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isCurrent
                                ? Colors.white
                                : answered
                                    ? AppColors.success
                                    : AppColors.textMuted))),
              ),
            );
          }),
        ),
        const SizedBox(height: 10),
        Row(children: [
          _legend(AppColors.success, AppColors.successLight, 'Answered'),
          const SizedBox(width: 14),
          _legend(AppColors.border, AppColors.borderLight, 'Not Answered'),
          const SizedBox(width: 14),
          _legend(AppColors.primary, AppColors.primary, 'Current'),
        ]),
      ]),
    );
  }

  Widget _legend(Color border, Color bg, String label) => Row(children: [
        Container(
            width: 14,
            height: 14,
            decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.circular(3),
                border: Border.all(color: border))),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ]);

  Widget _buildFooter(ExamProvider exam, bool isLast) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(children: [
        // Previous
        Expanded(
          child: OutlinedButton.icon(
            onPressed:
                exam.currentQuestionIndex > 0 ? exam.previousQuestion : null,
            icon: const Icon(Icons.chevron_left, size: 20),
            label: const Text('Previous'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              foregroundColor: AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(width: 10),
        // Next / Submit
        Expanded(
          child: isLast
              ? ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitExam,
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.check_circle_outline, size: 20),
                  label: Text(_isSubmitting ? 'Submitting...' : 'Submit'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                )
              : ElevatedButton.icon(
                  onPressed: exam.nextQuestion,
                  label: const Text('Next'),
                  icon: const Icon(Icons.chevron_right, size: 20),
                  style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
        ),
      ]),
    );
  }

  Widget _buildLoading() => const Scaffold(
        body: Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
          CircularProgressIndicator(color: AppColors.primary),
          SizedBox(height: 16),
          Text('Loading exam...', style: TextStyle(color: AppColors.textMuted)),
        ])),
      );

  Widget _buildError(String msg) => Scaffold(
        body: Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.error_outline, size: 60, color: AppColors.error),
          const SizedBox(height: 12),
          Text('Failed to Load Exam',
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(msg,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textMuted)),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: _loadExam, child: const Text('Retry')),
          const SizedBox(height: 10),
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Go Back')),
        ])),
      );

  Widget _buildNoQuestions() => Scaffold(
        body: Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.description_outlined,
              size: 60, color: AppColors.error),
          const SizedBox(height: 12),
          const Text('No Questions Found',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          const Text('This question set has no questions yet.',
              style: TextStyle(color: AppColors.textMuted)),
          const SizedBox(height: 20),
          ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Go Back')),
        ])),
      );
}
