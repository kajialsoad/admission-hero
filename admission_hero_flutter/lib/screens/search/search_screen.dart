import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/exam_provider.dart';
import '../../providers/university_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav.dart';
import '../../widgets/exam_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtrl = TextEditingController();
  bool _showFilters = false;
  String _selectedUniversityId = '';
  String _selectedUnit = '';
  String _selectedSession = '';
  int _page = 1;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _initialized = true;
      _loadData();
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final uniProv = context.read<UniversityProvider>();
    final examProv = context.read<ExamProvider>();
    await Future.wait([
      uniProv.fetchUniversities(limit: 50),
      examProv.fetchQuestionSets(
        universityId: _selectedUniversityId.isEmpty ? null : _selectedUniversityId,
        unit: _selectedUnit.isEmpty ? null : _selectedUnit,
        session: _selectedSession.isEmpty ? null : _selectedSession,
        page: _page,
        limit: 20,
      ),
    ]);
  }

  void _clearFilters() {
    setState(() {
      _selectedUniversityId = '';
      _selectedUnit = '';
      _selectedSession = '';
      _searchCtrl.clear();
      _page = 1;
    });
    _loadData();
  }

  void _toggleFilter(String type, String value) {
    setState(() {
      if (type == 'universityId') {
        _selectedUniversityId = _selectedUniversityId == value ? '' : value;
      } else if (type == 'unit') {
        _selectedUnit = _selectedUnit == value ? '' : value;
      } else if (type == 'session') {
        _selectedSession = _selectedSession == value ? '' : value;
      }
      _page = 1;
    });
    _loadData();
  }

  void _handleExamPress(QuestionSet set) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _buildModeModal(set),
    );
  }

  Widget _buildModeModal(QuestionSet set) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        // Handle
        Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Select Mode', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text('How would you like to proceed?',
                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
          ]),
        ),
        const SizedBox(height: 16),

        // View Questions
        _modeCard(
          icon: Icons.visibility_outlined,
          color: AppColors.accent,
          title: 'View Questions',
          bullets: ['Browse all questions', 'See answers & explanations', 'No timer or pressure', 'Perfect for studying'],
          onTap: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/questions-view', arguments: set);
          },
        ),
        const SizedBox(height: 12),

        // Practice Mode
        _modeCard(
          icon: Icons.edit_document,
          color: AppColors.success,
          title: 'Practice Mode',
          bullets: ['Untimed exam simulation', 'Select answers and verify', 'Learn from mistakes immediately', 'Check score at the end'],
          onTap: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/practice', arguments: set.id);
          },
        ),
        const SizedBox(height: 12),

        // Exam Mode
        _modeCard(
          icon: Icons.access_time_filled,
          color: AppColors.warning,
          title: 'Exam Mode',
          bullets: ['Timed exam (45 sec/question)', 'Real exam experience', 'Auto-submit when time ends', 'Cannot pause or review'],
          onTap: () {
            Navigator.pop(context);
            showDialog(
              context: context,
              builder: (_) => AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                title: const Text('Start Exam Mode?', style: TextStyle(fontWeight: FontWeight.w700)),
                content: Text('You are about to start "${set.name}" in EXAM MODE. Timer begins immediately.'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                  ElevatedButton(
                    onPressed: () { Navigator.pop(context); Navigator.pushNamed(context, '/exam', arguments: set.id); },
                    child: const Text('Start Exam'),
                  ),
                ],
              ),
            );
          },
        ),

        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ),
        const SizedBox(height: 8),
      ]),
    );
  }

  Widget _modeCard({required IconData icon, required Color color, required String title,
      required List<String> bullets, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.4), width: 1.5),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(width: 10),
            Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          ]),
          const SizedBox(height: 8),
          ...bullets.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text('• $b', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              )),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final universities = context.watch<UniversityProvider>().universities;
    final allSets = context.watch<ExamProvider>().questionSets;
    final isLoading = context.watch<ExamProvider>().isLoading;

    // Filter by search query
    final query = _searchCtrl.text.toLowerCase();
    final filteredSets = query.isEmpty ? allSets : allSets.where((s) =>
      s.name.toLowerCase().contains(query) ||
      s.universityName.toLowerCase().contains(query) ||
      s.universityShortName.toLowerCase().contains(query) ||
      s.unit.toLowerCase().contains(query) ||
      s.session.toLowerCase().contains(query)).toList();

    final availableUnits = allSets.map((s) => s.unit).toSet().toList()..sort();
    final availableSessions = allSets.map((s) => s.session).toSet().toList()..sort((a, b) => b.compareTo(a));
    final activeFilters = [_selectedUniversityId, _selectedUnit, _selectedSession].where((f) => f.isNotEmpty).length;

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
                const Text('Search Questions',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(children: [
                  // Search Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)],
                      ),
                      child: Row(children: [
                        const Padding(padding: EdgeInsets.only(left: 14), child: Icon(Icons.search, color: AppColors.textMuted, size: 22)),
                        Expanded(
                          child: TextField(
                            controller: _searchCtrl,
                            onChanged: (_) => setState(() {}),
                            decoration: const InputDecoration(
                              hintText: 'Search by name, university, unit...',
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            ),
                          ),
                        ),
                        if (_searchCtrl.text.isNotEmpty)
                          IconButton(icon: const Icon(Icons.clear, color: AppColors.textMuted, size: 20),
                              onPressed: () { _searchCtrl.clear(); setState(() {}); }),
                      ]),
                    ),
                  ),

                  // Filter Toggle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: GestureDetector(
                      onTap: () => setState(() => _showFilters = !_showFilters),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white, borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(children: [
                          const Icon(Icons.filter_list, color: AppColors.primary, size: 20),
                          const SizedBox(width: 8),
                          const Text('Filters', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          if (activeFilters > 0) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                              child: Text('$activeFilters', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                            ),
                          ],
                          const Spacer(),
                          Icon(_showFilters ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.primary),
                        ]),
                      ),
                    ),
                  ),

                  // Filter Panel
                  if (_showFilters)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        // University
                        const Text('University', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        const SizedBox(height: 8),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(children: universities.map((uni) {
                            final isSelected = _selectedUniversityId == uni.id;
                            return GestureDetector(
                              onTap: () => _toggleFilter('universityId', uni.id),
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.primary : AppColors.borderLight,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(uni.shortName ?? uni.name,
                                    style: TextStyle(fontSize: 13, color: isSelected ? Colors.white : AppColors.textSecondary,
                                        fontWeight: FontWeight.w500)),
                              ),
                            );
                          }).toList()),
                        ),

                        if (availableUnits.isNotEmpty) ...[
                          const SizedBox(height: 14),
                          const Text('Unit', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          const SizedBox(height: 8),
                          Wrap(spacing: 8, runSpacing: 8, children: availableUnits.map((u) {
                            final isSelected = _selectedUnit == u;
                            return GestureDetector(
                              onTap: () => _toggleFilter('unit', u),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.primary : AppColors.borderLight,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text('Unit $u',
                                    style: TextStyle(fontSize: 13, color: isSelected ? Colors.white : AppColors.textSecondary,
                                        fontWeight: FontWeight.w500)),
                              ),
                            );
                          }).toList()),
                        ],

                        if (availableSessions.isNotEmpty) ...[
                          const SizedBox(height: 14),
                          const Text('Session', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          const SizedBox(height: 8),
                          Wrap(spacing: 8, runSpacing: 8, children: availableSessions.map((s) {
                            final isSelected = _selectedSession == s;
                            return GestureDetector(
                              onTap: () => _toggleFilter('session', s),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.primary : AppColors.borderLight,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(s,
                                    style: TextStyle(fontSize: 13, color: isSelected ? Colors.white : AppColors.textSecondary,
                                        fontWeight: FontWeight.w500)),
                              ),
                            );
                          }).toList()),
                        ],

                        if (activeFilters > 0) ...[
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: _clearFilters,
                              style: OutlinedButton.styleFrom(foregroundColor: AppColors.error,
                                  side: const BorderSide(color: AppColors.error)),
                              child: const Text('Clear All Filters'),
                            ),
                          ),
                        ],
                      ]),
                    ),

                  // Results
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text(
                        isLoading ? 'Loading...' : '${filteredSets.length} Result${filteredSets.length != 1 ? 's' : ''} Found',
                        style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                    ]),
                  ),

                  if (isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 32),
                      child: CircularProgressIndicator(color: AppColors.primary),
                    )
                  else if (filteredSets.isEmpty)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border)),
                      child: const Column(children: [
                        Icon(Icons.search_off, size: 64, color: AppColors.textMuted),
                        SizedBox(height: 12),
                        Text('No Exams Found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        SizedBox(height: 4),
                        Text('Try adjusting your filters or search query',
                            style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                      ]),
                    )
                  else
                    ...filteredSets.map((set) => Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          child: ExamCard(questionSet: set, onTap: () => _handleExamPress(set)),
                        )),

                  const SizedBox(height: 100),
                ]),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 1),
      ),
    );
  }
}
