import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../theme/app_theme.dart';

class ExamCard extends StatelessWidget {
  final QuestionSet questionSet;
  final VoidCallback onTap;

  const ExamCard({super.key, required this.questionSet, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tags Row
            Row(
              children: [
                _tag(questionSet.universityShortName, AppColors.primary, AppColors.primaryBg),
                const SizedBox(width: 6),
                _tag('Unit ${questionSet.unit}', AppColors.accent, AppColors.accentLight),
                const SizedBox(width: 6),
                _tag(questionSet.session, AppColors.success, AppColors.successLight),
              ],
            ),
            const SizedBox(height: 10),

            // Title
            Text(questionSet.name,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                maxLines: 2, overflow: TextOverflow.ellipsis),

            const SizedBox(height: 10),

            // Footer Stats
            Row(
              children: [
                _stat(Icons.quiz_outlined, '${questionSet.totalQuestions} Qs'),
                const SizedBox(width: 14),
                _stat(Icons.timer_outlined, '${questionSet.durationInMinutes} min'),
                const SizedBox(width: 14),
                _stat(Icons.star_outline_rounded, '${questionSet.totalQuestions} Marks'),
                const Spacer(),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _tag(String label, Color color, Color bg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
        child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
      );

  Widget _stat(IconData icon, String label) => Row(
        children: [
          Icon(icon, size: 14, color: AppColors.textMuted),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        ],
      );
}
