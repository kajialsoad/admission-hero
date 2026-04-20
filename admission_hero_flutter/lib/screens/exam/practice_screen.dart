import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/exam_provider.dart';
import '../../theme/app_theme.dart';

class PracticeScreen extends StatefulWidget {
  final String setId;
  const PracticeScreen({super.key, required this.setId});

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  final Map<String, String> _selectedAnswers = {};
  bool _showAnswers = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExam(widget.setId);
    });
  }

  void _handleOptionSelect(String questionId, String option) {
    if (_showAnswers) return;
    setState(() {
      _selectedAnswers[questionId] = option;
    });
  }

  int _calculateScore(List<Question> questions) {
    int correct = 0;
    for (var q in questions) {
      if (_selectedAnswers[q.id] == q.correctAnswer) correct++;
    }
    return correct;
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Consumer<ExamProvider>(
          builder: (context, exam, _) {
            final questions = exam.currentQuestions;

            return Column(
              children: [
                // Header
                Container(
                  color: AppColors.primary,
                  padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, left: 8, right: 16, bottom: 12),
                  child: Column(children: [
                    Row(children: [
                      IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Practice Mode', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                        if (questions.isNotEmpty)
                          Text('Unit ${questions.first.unit ?? ''} • Session ${questions.first.session ?? ''}',
                              style: const TextStyle(fontSize: 12, color: Colors.white70)),
                      ])),
                    ]),
                    const SizedBox(height: 8),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                      child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                        _headerStat('Questions', '${questions.length}'),
                        Container(width: 1, height: 24, color: Colors.white30),
                        _headerStat('Answered', '${_selectedAnswers.length}'),
                        Container(width: 1, height: 24, color: Colors.white30),
                        _headerStat('Remaining', '${questions.length - _selectedAnswers.length}'),
                      ]),
                    ),
                  ]),
                ),

                Expanded(
                  child: exam.isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                      : questions.isEmpty
                          ? const Center(child: Text('No Questions Found', style: TextStyle(color: AppColors.textMuted)))
                          : _buildQuestionList(questions),
                ),

                // Bottom Action Bar
                if (questions.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, -2))],
                    ),
                    child: _showAnswers
                        ? Row(children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => setState(() { _selectedAnswers.clear(); _showAnswers = false; }),
                                icon: const Icon(Icons.refresh), label: const Text('Retry'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => setState(() => _showAnswers = false),
                                icon: const Icon(Icons.visibility_off), label: const Text('Hide Answers'),
                              ),
                            ),
                          ])
                        : Column(mainAxisSize: MainAxisSize.min, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Text('Progress: ${_selectedAnswers.length}/${questions.length}',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                              Text('${((_selectedAnswers.length / questions.length) * 100).toStringAsFixed(0)}%',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                            ]),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: _selectedAnswers.length / questions.length, minHeight: 8,
                                backgroundColor: AppColors.borderLight, valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _selectedAnswers.length == questions.length ? () => setState(() => _showAnswers = true) : null,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _selectedAnswers.length == questions.length ? AppColors.success : AppColors.border,
                                ),
                                child: Text(_selectedAnswers.length == questions.length ? 'Submit & Check Answers' : 'Answer All Questions'),
                              ),
                            ),
                          ]),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _headerStat(String label, String value) {
    return Column(children: [
      Text(label, style: const TextStyle(fontSize: 11, color: Colors.white70)),
      Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
    ]);
  }

  Widget _buildQuestionList(List<Question> questions) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: questions.length + (_showAnswers ? 1 : 0),
      itemBuilder: (context, index) {
        if (_showAnswers && index == 0) {
          final score = _calculateScore(questions);
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppColors.accent, AppColors.primary]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Your Score', style: TextStyle(color: Colors.white70, fontSize: 14)),
                Text('$score/${questions.length}', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700)),
                Text('${((score / questions.length) * 100).toStringAsFixed(1)}% Correct', style: const TextStyle(color: Colors.white, fontSize: 14)),
              ]),
              const Icon(Icons.emoji_events, size: 60, color: Colors.white),
            ]),
          );
        }

        final qIndex = _showAnswers ? index - 1 : index;
        final q = questions[qIndex];

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6)],
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Row(children: [
                Container(
                  width: 30, height: 30,
                  decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                  child: Center(child: Text('${qIndex + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
                ),
                const SizedBox(width: 8),
                Text('Question ${q.questionNumber}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
              ]),
              if (_showAnswers)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _selectedAnswers[q.id] == q.correctAnswer ? AppColors.successLight : AppColors.errorLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _selectedAnswers[q.id] == q.correctAnswer ? '✓ Correct' : '✗ Wrong',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _selectedAnswers[q.id] == q.correctAnswer ? AppColors.success : AppColors.error),
                  ),
                ),
            ]),
            const SizedBox(height: 12),
            Text(q.text, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: AppColors.textPrimary, height: 1.5)),
            const SizedBox(height: 16),

            ...q.options.map((opt) {
              final isSelected = _selectedAnswers[q.id] == opt.key;
              final isCorrect = opt.key == q.correctAnswer;
              
              Color bgColor = Colors.white;
              Color borderColor = AppColors.borderLight;
              Color textColor = AppColors.textPrimary;

              if (_showAnswers) {
                if (isCorrect) {
                  bgColor = AppColors.success; borderColor = AppColors.success; textColor = Colors.white;
                } else if (isSelected && !isCorrect) {
                  bgColor = AppColors.error; borderColor = AppColors.error; textColor = Colors.white;
                }
              } else if (isSelected) {
                bgColor = AppColors.primary; borderColor = AppColors.primary; textColor = Colors.white;
              }

              return GestureDetector(
                onTap: () => _handleOptionSelect(q.id, opt.key),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: bgColor, borderRadius: BorderRadius.circular(12), border: Border.all(color: borderColor, width: isSelected ? 2 : 1),
                  ),
                  child: Row(children: [
                    Container(
                      width: 24, height: 24,
                      decoration: BoxDecoration(
                        color: _showAnswers && isCorrect || isSelected ? Colors.white.withOpacity(0.3) : AppColors.borderLight,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: _showAnswers && isCorrect
                            ? const Icon(Icons.check, size: 14, color: Colors.white)
                            : _showAnswers && isSelected && !isCorrect
                                ? const Icon(Icons.close, size: 14, color: Colors.white)
                                : isSelected && !_showAnswers
                                    ? const Icon(Icons.check, size: 14, color: Colors.white)
                                    : Text(opt.key, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(opt.text, style: TextStyle(color: textColor, fontWeight: FontWeight.w500))),
                  ]),
                ),
              );
            }),

            if (_showAnswers && q.explanations != null && q.explanations!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.primaryBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.primary.withOpacity(0.3))),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Icon(Icons.lightbulb, size: 18, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Explanation', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    const SizedBox(height: 4),
                    Text(q.explanations!.first['content'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.textPrimary, height: 1.4)),
                  ])),
                ]),
              ),
            ],

            if (_showAnswers) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.successLight, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.success.withOpacity(0.3))),
                child: Row(children: [
                  const Icon(Icons.check_circle, size: 18, color: AppColors.success),
                  const SizedBox(width: 8),
                  Text('Correct Answer: Option ${q.correctAnswer}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.success)),
                ]),
              ),
            ],
          ]),
        );
      },
    );
  }
}
