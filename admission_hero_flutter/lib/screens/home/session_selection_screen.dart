import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/models.dart';
import '../../theme/app_theme.dart';

class SessionSelectionScreen extends StatefulWidget {
  final University university;
  final String unit;
  const SessionSelectionScreen({super.key, required this.university, required this.unit});

  @override
  State<SessionSelectionScreen> createState() => _SessionSelectionScreenState();
}

class _SessionSelectionScreenState extends State<SessionSelectionScreen> {
  String? _selectedSession;

  static const _sessions = [
    {'year': '2024', 'color': Color(0xFF3b82f6), 'isNew': true},
    {'year': '2023', 'color': Color(0xFF8b5cf6), 'isNew': false},
    {'year': '2022', 'color': Color(0xFFec4899), 'isNew': false},
    {'year': '2021', 'color': Color(0xFFf59e0b), 'isNew': false},
    {'year': '2020', 'color': Color(0xFF10b981), 'isNew': false},
  ];

  void _selectSession(String session) {
    setState(() => _selectedSession = session);
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) {
        Navigator.pushNamed(context, '/question-sets', arguments: {
          'university': widget.university,
          'unit': widget.unit,
          'session': session,
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: AppColors.primary, statusBarIconBrightness: Brightness.light),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            _buildHeader(context),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildProgressCard(),
                    const SizedBox(height: 12),
                    _buildInfoCard(),
                    const SizedBox(height: 16),
                    ..._sessions.map((s) => _buildSessionCard(s)),
                    const SizedBox(height: 16),
                    _buildTipCard(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      color: AppColors.primary,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 12,
        left: 8, right: 16, bottom: 16,
      ),
      child: Row(children: [
        IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Select Session',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
          Text('Unit ${widget.unit}',
              style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.8))),
        ]),
      ]),
    );
  }

  Widget _buildProgressCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            _progressStep('Unit', true, null),
            _progressStep('Session', true, '2'),
          ]),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: 0.5, minHeight: 6,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _progressStep(String label, bool done, String? step) {
    return Row(children: [
      Container(
        width: 28, height: 28,
        decoration: BoxDecoration(
          color: done ? (step == null ? AppColors.success : AppColors.primary) : AppColors.border,
          shape: BoxShape.circle,
        ),
        child: Center(child: done && step == null
            ? const Icon(Icons.check, size: 14, color: Colors.white)
            : Text(step ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12))),
      ),
      const SizedBox(width: 6),
      Text(label,
          style: TextStyle(fontSize: 13, color: done && step == null ? AppColors.success : AppColors.primary,
              fontWeight: FontWeight.w600)),
    ]);
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.primaryBg, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Icon(Icons.info_rounded, color: AppColors.primary, size: 22),
        const SizedBox(width: 10),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Choose Admission Session Year',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
          SizedBox(height: 2),
          Text('Select the year to view all available question sets',
              style: TextStyle(fontSize: 12, color: AppColors.primary)),
        ])),
      ]),
    );
  }

  Widget _buildSessionCard(Map<String, Object> s) {
    final year = s['year'] as String;
    final color = s['color'] as Color;
    final isNew = s['isNew'] as bool;
    final isSelected = _selectedSession == year;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent, width: 2),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => _selectSession(year),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(children: [
              Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(Icons.calendar_month, color: color, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Text('Session $year',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  if (isNew) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(20)),
                      child: const Text('NEW', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ]),
                const SizedBox(height: 4),
                const Text('View question sets', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
              ])),
              Icon(Icons.arrow_forward_ios_rounded,
                  color: isSelected ? AppColors.primary : AppColors.border, size: 22),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _buildTipCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(20)),
          child: const Icon(Icons.lightbulb, color: Color(0xFFF59E0B), size: 22),
        ),
        const SizedBox(width: 12),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Pro Tip', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF92400E))),
          SizedBox(height: 4),
          Text('Start with the most recent session (2024) to practice with the latest exam patterns and updated syllabus',
              style: TextStyle(fontSize: 12, color: Color(0xFF92400E))),
        ])),
      ]),
    );
  }
}
