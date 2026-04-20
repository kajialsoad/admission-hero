import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class QuestionNavigator extends StatelessWidget {
  final int totalQuestions;
  final int currentQuestionIndex;
  final Map<String, String> answers;
  final ValueChanged<int> onNavigate;

  const QuestionNavigator({
    super.key,
    required this.totalQuestions,
    required this.currentQuestionIndex,
    required this.answers,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Question Navigation', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Row(
                children: [
                  _LegendItem(color: AppColors.primaryLight, label: 'Current'),
                  const SizedBox(width: 8),
                  _LegendItem(color: AppColors.success, label: 'Answered'),
                  const SizedBox(width: 8),
                  _LegendItem(color: AppColors.border, label: 'Pending'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: totalQuestions,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final isCurrent = index == currentQuestionIndex;
                // Wait, answers map uses question IDs. 
                // We need to assume answers map here uses index string or we pass a direct answered array.
                // Assuming we pass answers as map of {index: val} just for UI purposes, or we pass boolean array.
                final isAnswered = answers.containsKey(index.toString()) || answers.containsKey((index + 1).toString());

                Color bgColor;
                Color borderColor;
                Color textColor;

                if (isCurrent) {
                  bgColor = AppColors.primaryBg;
                  borderColor = AppColors.primaryLight;
                  textColor = AppColors.primaryDark;
                } else if (isAnswered) {
                  bgColor = AppColors.successLight;
                  borderColor = AppColors.success;
                  textColor = AppColors.success;
                } else {
                  bgColor = AppColors.borderLight;
                  borderColor = AppColors.border;
                  textColor = AppColors.textSecondary;
                }

                return GestureDetector(
                  onTap: () => onNavigate(index),
                  child: Container(
                    width: 40, height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: borderColor, width: 2),
                    ),
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 12),
          Row(
            children: [
              Row(
                children: [
                  const Text('Answered: ', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.success)),
                  Text('${answers.length}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                ],
              ),
              const SizedBox(width: 16),
              Row(
                children: [
                  const Text('Pending: ', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.warning)),
                  Text('${totalQuestions - answers.length}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
      ],
    );
  }
}
