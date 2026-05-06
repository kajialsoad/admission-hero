import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../services/offline_service.dart';
import '../../theme/app_theme.dart';

class ExamCard extends StatefulWidget {
  final QuestionSet questionSet;
  final VoidCallback onTap;
  final bool showDownloadOption;

  const ExamCard({
    super.key, 
    required this.questionSet, 
    required this.onTap,
    this.showDownloadOption = true,
  });

  @override
  State<ExamCard> createState() => _ExamCardState();
}

class _ExamCardState extends State<ExamCard> {
  final OfflineService _offlineService = OfflineService();
  bool _isDownloaded = false;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _checkDownloadStatus();
  }

  Future<void> _checkDownloadStatus() async {
    final isDownloaded = await _offlineService.isExamDownloaded(widget.questionSet.id);
    if (mounted) {
      setState(() {
        _isDownloaded = isDownloaded;
      });
    }
  }

  Future<void> _handleDownload() async {
    if (_isDownloading || _isDownloaded) return;

    setState(() => _isDownloading = true);

    try {
      // TODO: Fetch questions from API
      // For now, we'll create mock questions
      final mockQuestions = List.generate(
        widget.questionSet.totalQuestions,
        (index) => Question(
          id: 'q_${widget.questionSet.id}_$index',
          questionSetId: widget.questionSet.id,
          university: widget.questionSet.university,
          unit: widget.questionSet.unit,
          session: widget.questionSet.session,
          questionNumber: index + 1,
          text: 'Sample question ${index + 1} for ${widget.questionSet.name}',
          questionType: 'mcq',
          options: [
            QuestionOption(key: 'A', text: 'Option A'),
            QuestionOption(key: 'B', text: 'Option B'),
            QuestionOption(key: 'C', text: 'Option C'),
            QuestionOption(key: 'D', text: 'Option D'),
          ],
          correctAnswer: 'A',
        ),
      );

      final success = await _offlineService.saveExamForOffline(
        widget.questionSet,
        mockQuestions,
      );

      if (mounted) {
        setState(() {
          _isDownloading = false;
          _isDownloaded = success;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success 
                ? 'Exam downloaded for offline use' 
                : 'Failed to download exam',
            ),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isDownloading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error downloading exam'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Check if user can access this content
    final user = context.watch<AuthProvider>().user;
    final bool isPremiumUser = user?.isSubscribed ?? false;
    final bool isLocked = !widget.questionSet.isFree && !isPremiumUser;
    
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isLocked ? AppColors.warning.withOpacity(0.3) : AppColors.border,
          ),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with download button and lock indicator
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          _tag(widget.questionSet.universityShortName, AppColors.primary, AppColors.primaryBg),
                          const SizedBox(width: 6),
                          _tag('Unit ${widget.questionSet.unit}', AppColors.accent, AppColors.accentLight),
                          const SizedBox(width: 6),
                          _tag(widget.questionSet.session, AppColors.success, AppColors.successLight),
                        ],
                      ),
                    ),
                    
                    // Premium badge
                    if (isLocked) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.lock, size: 12, color: AppColors.warning),
                            const SizedBox(width: 4),
                            Text(
                              'Premium',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.warning,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    
                    if (widget.showDownloadOption && !isLocked) ...[
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: _handleDownload,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: _isDownloaded 
                                ? Colors.green.withOpacity(0.1)
                                : AppColors.primaryBg,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: _isDownloading
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                  ),
                                )
                              : Icon(
                                  _isDownloaded ? Icons.offline_bolt : Icons.download,
                                  size: 16,
                                  color: _isDownloaded ? Colors.green : AppColors.primary,
                                ),
                        ),
                      ),
                    ],
                  ],
                ),
                
                const SizedBox(height: 10),

                // Title
                Text(widget.questionSet.name,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    maxLines: 2, overflow: TextOverflow.ellipsis),

                const SizedBox(height: 10),

                // Footer Stats
                Row(
                  children: [
                    _stat(Icons.quiz_outlined, '${widget.questionSet.totalQuestions} Qs'),
                    const SizedBox(width: 14),
                    _stat(Icons.timer_outlined, '${widget.questionSet.durationInMinutes} min'),
                    const SizedBox(width: 14),
                    _stat(Icons.star_outline_rounded, '${widget.questionSet.totalQuestions} Marks'),
                    const Spacer(),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isLocked ? AppColors.warning : AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        isLocked ? Icons.lock : Icons.arrow_forward, 
                        color: Colors.white, 
                        size: 18,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            // Subtle overlay for locked content
            if (isLocked)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
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
