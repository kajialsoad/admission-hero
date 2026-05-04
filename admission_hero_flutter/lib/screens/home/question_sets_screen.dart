import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/exam_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';

class QuestionSetsScreen extends StatefulWidget {
  final University university;
  final String unit;
  final String session;
  const QuestionSetsScreen({super.key, required this.university, required this.unit, required this.session});

  @override
  State<QuestionSetsScreen> createState() => _QuestionSetsScreenState();
}

class _QuestionSetsScreenState extends State<QuestionSetsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    await context.read<ExamProvider>().fetchQuestionSets(
      universityId: widget.university.id,
      unit: widget.unit,
      session: widget.session,
      limit: 50,
    );
  }

  // Check if user can access paid content
  Future<bool> _checkPaidAccess(QuestionSet set) async {
    // If set is free, allow access
    if (set.isFree) return true;

    // Check subscription status
    final subscriptionProvider = context.read<SubscriptionProvider>();
    final hasActiveSubscription = subscriptionProvider.hasSubscription;

    if (!hasActiveSubscription) {
      // Show dialog and redirect to subscription page
      if (!mounted) return false;
      
      final shouldNavigate = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.lock, color: AppColors.warning),
              SizedBox(width: 8),
              Text('Premium Content'),
            ],
          ),
          content: const Text(
            'This question set requires an active subscription. Would you like to view our subscription plans?',
            style: TextStyle(fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
              ),
              child: const Text('View Plans'),
            ),
          ],
        ),
      );

      if (shouldNavigate == true && mounted) {
        Navigator.pushNamed(context, '/subscription');
      }
      return false;
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            // Header
            Container(
              color: AppColors.primary,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 10, left: 8, right: 16, bottom: 14),
              child: Row(children: [
                IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Question Sets',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                  Text('Unit ${widget.unit} • Session ${widget.session}',
                      style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.8))),
                ])),
              ]),
            ),

            Expanded(
              child: Consumer<ExamProvider>(
                builder: (context, exam, _) {
                  if (exam.isLoading) {
                    return const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      CircularProgressIndicator(color: AppColors.primary),
                      SizedBox(height: 12),
                      Text('Loading question sets...', style: TextStyle(color: AppColors.textMuted)),
                    ]));
                  }

                  final sets = exam.questionSets;

                  return RefreshIndicator(
                    onRefresh: _load,
                    color: AppColors.primary,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(14),
                      child: Column(children: [
                        // Step progress
                        _buildProgressCard(),
                        const SizedBox(height: 12),

                        if (sets.isEmpty)
                          _buildEmpty()
                        else ...[
                          // Stats banner
                          _buildStatsBanner(sets),
                          const SizedBox(height: 12),
                          ...sets.asMap().entries.map((entry) => _buildSetCard(entry.value, entry.key + 1)),
                        ],
                        const SizedBox(height: 24),
                      ]),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 0),
      ),
    );
  }

  Widget _buildProgressCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border)),
      child: Column(
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            _step('Unit', true, false),
            _step('Session', true, false),
            _step('Sets', true, true),
          ]),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: const LinearProgressIndicator(
              value: 1.0, minHeight: 6,
              backgroundColor: AppColors.border,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.success),
            ),
          ),
        ],
      ),
    );
  }

  Widget _step(String label, bool done, bool current) {
    return Row(children: [
      Container(
        width: 24, height: 24,
        decoration: BoxDecoration(
          color: current ? AppColors.primary : AppColors.success, shape: BoxShape.circle,
        ),
        child: Center(child: current
            ? const Text('3', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700))
            : const Icon(Icons.check, color: Colors.white, size: 14)),
      ),
      const SizedBox(width: 6),
      Text(label, style: TextStyle(fontSize: 12, color: current ? AppColors.primary : AppColors.success,
          fontWeight: FontWeight.w600)),
    ]);
  }

  Widget _buildStatsBanner(List<QuestionSet> sets) {
    final totalQ = sets.fold<int>(0, (sum, s) => sum + s.totalQuestions);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.primary, Color(0xFF4F46E5)]),
        borderRadius: BorderRadius.all(Radius.circular(16)),
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Available Sets', style: TextStyle(color: Colors.white70, fontSize: 13)),
          Text('${sets.length}', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700)),
          Text('$totalQ total questions', style: const TextStyle(color: Colors.white70, fontSize: 12)),
        ]),
        Container(
          width: 60, height: 60,
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(16)),
          child: const Icon(Icons.assignment, color: Colors.white, size: 32),
        ),
      ]),
    );
  }

  Widget _buildSetCard(QuestionSet set, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryBg, 
                    borderRadius: BorderRadius.circular(20)
                  ),
                  child: Text(
                    'Set #$index',
                    style: const TextStyle(
                      fontSize: 11, 
                      color: AppColors.primary, 
                      fontWeight: FontWeight.w700
                    )
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.successLight, 
                    borderRadius: BorderRadius.circular(20)
                  ),
                  child: Text(
                    '${set.totalQuestions} MCQs',
                    style: const TextStyle(
                      fontSize: 11, 
                      color: AppColors.success, 
                      fontWeight: FontWeight.w700
                    )
                  ),
                ),
                const SizedBox(width: 8),
                // Access Type Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: set.isFree ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7), 
                    borderRadius: BorderRadius.circular(20)
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        set.isFree ? Icons.check_circle : Icons.lock,
                        size: 12,
                        color: set.isFree ? const Color(0xFF16A34A) : const Color(0xFFCA8A04),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        set.isFree ? 'Free' : 'Paid',
                        style: TextStyle(
                          fontSize: 11, 
                          color: set.isFree ? const Color(0xFF16A34A) : const Color(0xFFCA8A04), 
                          fontWeight: FontWeight.w700
                        )
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 10),
            
            // Title & Description
            Text(
              set.name, 
              style: const TextStyle(
                fontSize: 16, 
                fontWeight: FontWeight.w700, 
                color: AppColors.textPrimary
              )
            ),
            
            if (set.description != null) ...[
              const SizedBox(height: 4),
              Text(
                set.description!, 
                maxLines: 2, 
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13, 
                  color: AppColors.textMuted, 
                  height: 1.4
                )
              ),
            ],
            
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 12),
            
            // 3 Action Buttons
            Row(
              children: [
                // 1. Start Exam
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      final canAccess = await _checkPaidAccess(set);
                      if (canAccess && mounted) {
                        Navigator.pushNamed(context, '/exam', arguments: set.id);
                      }
                    },
                    icon: const Icon(Icons.play_circle_outline, size: 18),
                    label: const Text('Start Exam', style: TextStyle(fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(width: 8),
                
                // 2. Questions with Answers
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final canAccess = await _checkPaidAccess(set);
                      if (canAccess && mounted) {
                        Navigator.pushNamed(context, '/questions-view', arguments: set);
                      }
                    },
                    icon: const Icon(Icons.description_outlined, size: 18),
                    label: const Text('Answers', style: TextStyle(fontSize: 13)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(width: 8),
                
                // 3. Video Solve
                Container(
                  decoration: BoxDecoration(
                    color: set.videoUrl != null ? AppColors.errorLight : AppColors.borderLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: set.videoUrl != null ? AppColors.error : AppColors.border
                    ),
                  ),
                  child: IconButton(
                    onPressed: set.videoUrl != null 
                      ? () async {
                          final canAccess = await _checkPaidAccess(set);
                          if (canAccess && mounted) {
                            Navigator.pushNamed(
                              context, 
                              '/video-player',
                              arguments: {
                                'videoUrl': set.videoUrl!,
                                'title': set.name,
                                'description': set.description,
                              },
                            );
                          }
                        }
                      : null,
                    icon: Icon(
                      Icons.play_circle_filled,
                      color: set.videoUrl != null ? AppColors.error : AppColors.textMuted,
                      size: 24,
                    ),
                    tooltip: set.videoUrl != null ? 'Watch Video' : 'No video available',
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 10),
            
            // Date
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined, size: 13, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  '${set.createdAt.day}/${set.createdAt.month}/${set.createdAt.year}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted)
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 20),
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border)),
      child: Column(children: [
        const Icon(Icons.folder_open, size: 56, color: AppColors.textMuted),
        const SizedBox(height: 12),
        const Text('No Question Sets Found',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 6),
        Text('No sets for Unit ${widget.unit}, Session ${widget.session}',
            textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _load, child: const Text('Refresh')),
      ]),
    );
  }
}
