import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/exam_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';

class FeaturedExamsScreen extends StatefulWidget {
  const FeaturedExamsScreen({super.key});

  @override
  State<FeaturedExamsScreen> createState() => _FeaturedExamsScreenState();
}

class _FeaturedExamsScreenState extends State<FeaturedExamsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().fetchQuestionSets(limit: 50);
    });
  }

  Future<void> _onRefresh() async {
    await context.read<ExamProvider>().fetchQuestionSets(limit: 50);
  }

  void _handleStartExam(QuestionSet set) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Start Exam?', style: TextStyle(fontWeight: FontWeight.w700)),
        content: Text('${set.name}\n\nQuestions: ${set.totalQuestions}\nTime: ${set.durationInMinutes} min'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/exam', arguments: set.id);
            },
            child: const Text('Start'),
          ),
        ],
      ),
    );
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
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, left: 16, right: 16, bottom: 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Featured Exams',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Consumer<ExamProvider>(
                    builder: (context, exam, _) => Text(
                      '${exam.questionSets.length} exams available',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    ),
                  ),
                ])),
              ]),
            ),

            Expanded(
              child: Consumer<ExamProvider>(
                builder: (context, exam, _) {
                  if (exam.isLoading && exam.questionSets.isEmpty) {
                    return const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      CircularProgressIndicator(color: AppColors.primary),
                      SizedBox(height: 12),
                      Text('Loading exams...', style: TextStyle(color: AppColors.textMuted)),
                    ]));
                  }

                  if (exam.questionSets.isEmpty) {
                    return const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.inbox, size: 60, color: AppColors.textMuted),
                      SizedBox(height: 12),
                      Text('No exams available', style: TextStyle(color: AppColors.textMuted)),
                    ]));
                  }

                  final featured = exam.questionSets.take(3).toList();
                  final all = exam.questionSets.skip(3).toList();

                  return RefreshIndicator(
                    onRefresh: _onRefresh,
                    color: AppColors.primary,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        if (featured.isNotEmpty) ...[
                          const Text('🌟 Trending Exams', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          const SizedBox(height: 12),
                          ...featured.map(_buildExamCard),
                          const SizedBox(height: 20),
                        ],

                        if (all.isNotEmpty) ...[
                          const Text('All Exams', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          const SizedBox(height: 12),
                          ...all.map(_buildExamCard),
                        ],
                        const SizedBox(height: 80),
                      ]),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExamCard(QuestionSet set) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)],
      ),
      clipBehavior: Clip.hardEdge,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _handleStartExam(set),
          child: Column(children: [
            // Header Gradient
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [Color(0xFF3b82f6), Color(0xFF6366f1), Color(0xFF9333ea)]),
              ),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(set.name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(set.universityName, style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13)),
                ])),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                  child: Text('${set.totalQuestions}Q', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                ),
              ]),
            ),

            // Info Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.background,
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Row(children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                    child: Row(children: [
                      const Icon(Icons.access_time, size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text('${set.durationInMinutes}m', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    ]),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                    child: Row(children: [
                      const Icon(Icons.star, size: 14, color: AppColors.warning),
                      const SizedBox(width: 4),
                      Text('${set.totalQuestions}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    ]),
                  ),
                ]),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.primaryBg, borderRadius: BorderRadius.circular(8)),
                  child: Text('Unit ${set.unit}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                ),
              ]),
            ),

            if (set.description != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.borderLight))),
                child: Text(set.description!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              ),

            // Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(color: AppColors.primaryBg, border: Border(top: BorderSide(color: AppColors.borderLight))),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('Session: ${set.session}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                const Row(children: [
                  Text('Start Now', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_forward, size: 16, color: AppColors.primary),
                ]),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}
