import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/exam_provider.dart';
import '../../theme/app_theme.dart';


class QuestionsViewScreen extends StatefulWidget {
  final QuestionSet questionSet;
  const QuestionsViewScreen({super.key, required this.questionSet});

  @override
  State<QuestionsViewScreen> createState() => _QuestionsViewScreenState();
}

class _QuestionsViewScreenState extends State<QuestionsViewScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExam(widget.questionSet.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: Colors.white, statusBarIconBrightness: Brightness.dark),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: Colors.white,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, left: 8, right: 16, bottom: 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                  onPressed: () => Navigator.pop(context),
                ),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('View Questions - ${widget.questionSet.name}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text('${widget.questionSet.universityName} • Unit ${widget.questionSet.unit} • ${widget.questionSet.session}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ])),
              ]),
            ),

            // Content
            Expanded(
              child: Consumer<ExamProvider>(
                builder: (context, exam, _) {
                  if (exam.isLoading) {
                    return const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      CircularProgressIndicator(color: AppColors.primary),
                      SizedBox(height: 12),
                      Text('Loading questions...', style: TextStyle(color: AppColors.textMuted)),
                    ]));
                  }

                  if (exam.error != null) {
                    return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.wifi_off, size: 60, color: AppColors.error),
                      const SizedBox(height: 12),
                      Text(exam.error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary)),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => context.read<ExamProvider>().loadExam(widget.questionSet.id),
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ]));
                  }

                  if (exam.currentQuestions.isEmpty) {
                    return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.description_outlined, size: 60, color: AppColors.textMuted),
                      const SizedBox(height: 12),
                      const Text('No Questions Found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: 8),
                      const Text('This question set has no questions yet.', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                    ]));
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: exam.currentQuestions.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final q = exam.currentQuestions[index];
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white, borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            Text('Question #${index + 1}', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.primaryBg, borderRadius: BorderRadius.circular(4)),
                              child: const Text('MCQ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                            ),
                          ]),
                          const SizedBox(height: 12),
                          Text(q.text, style: const TextStyle(fontSize: 15, color: AppColors.textPrimary, height: 1.5)),
                          const SizedBox(height: 16),

                          ...q.options.map((opt) {
                            final isCorrect = opt.key == q.correctAnswer;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isCorrect ? AppColors.successLight : Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: isCorrect ? AppColors.success.withOpacity(0.5) : AppColors.borderLight),
                              ),
                              child: Row(children: [
                                Text('${opt.key}. ', style: TextStyle(fontWeight: FontWeight.w600, color: isCorrect ? AppColors.success : AppColors.textPrimary)),
                                Expanded(child: Text(opt.text, style: TextStyle(color: isCorrect ? AppColors.success : AppColors.textSecondary))),
                              ]),
                            );
                          }),

                          const SizedBox(height: 8),
                          Row(children: [
                            Text('Correct Answer: ${q.correctAnswer}', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.success)),
                            if (q.explanations != null && q.explanations!.isNotEmpty) ...[
                              const Spacer(),
                              const Text('📝 Has explanation', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                            ],
                          ]),

                          if (q.explanations != null && q.explanations!.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.primaryBg,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                              ),
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Explanation:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                const SizedBox(height: 4),
                                Text(q.explanations!.first['content'] ?? '',
                                    style: const TextStyle(fontSize: 12, color: AppColors.primary, height: 1.4)),
                              ]),
                            ),
                          ],
                        ]),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
