import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/models.dart';
import '../../theme/app_theme.dart';

class UnitSelectionScreen extends StatefulWidget {
  final University university;
  const UnitSelectionScreen({super.key, required this.university});

  @override
  State<UnitSelectionScreen> createState() => _UnitSelectionScreenState();
}

class _UnitSelectionScreenState extends State<UnitSelectionScreen> {
  String? _selectedUnit;

  static const _unitColors = [
    {'color': Color(0xFF3b82f6), 'bg': Color(0xFFdbeafe)},
    {'color': Color(0xFF8b5cf6), 'bg': Color(0xFFede9fe)},
    {'color': Color(0xFFec4899), 'bg': Color(0xFFfce7f3)},
    {'color': Color(0xFFf59e0b), 'bg': Color(0xFFfef3c7)},
    {'color': Color(0xFF10b981), 'bg': Color(0xFFd1fae5)},
    {'color': Color(0xFFef4444), 'bg': Color(0xFFfee2e2)},
  ];

  Map<String, Color> _getUnitColor(String unit) {
    final idx = unit.codeUnitAt(0) - 'A'.codeUnitAt(0);
    final colors = _unitColors[idx.clamp(0, _unitColors.length - 1)];
    return {'color': colors['color'] as Color, 'bg': colors['bg'] as Color};
  }

  void _selectUnit(String unit) {
    setState(() => _selectedUnit = unit);
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) {
        Navigator.pushNamed(context, '/session-selection', arguments: {
          'university': widget.university,
          'unit': unit,
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
            // Header
            _buildHeader(context),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // University info card
                    _buildUniversityCard(),
                    const SizedBox(height: 12),
                    // Step indicator
                    _buildStepCard(),
                    const SizedBox(height: 16),
                    // Unit list
                    if (widget.university.units.isEmpty)
                      _buildEmpty()
                    else
                      ...widget.university.units.map((unit) => _buildUnitCard(unit)),
                    const SizedBox(height: 20),
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
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 24),
            onPressed: () => Navigator.pop(context),
          ),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Select Unit',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
              Text(widget.university.shortName ?? widget.university.name,
                  style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.8))),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildUniversityCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 50, height: 50,
            decoration: BoxDecoration(color: AppColors.primaryBg, borderRadius: BorderRadius.circular(12)),
            child: widget.university.logo != null
                ? ClipRRect(borderRadius: BorderRadius.circular(12),
                    child: Image.network(widget.university.logo!, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.school, color: AppColors.primary)))
                : const Icon(Icons.school, color: AppColors.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(widget.university.name,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text('${widget.university.units.length} units available',
                  style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildStepCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.primaryBg, borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 32, height: 32,
            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
            child: const Center(child: Text('1', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 12),
          const Text('Select your admission unit',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildUnitCard(String unit) {
    final colors = _getUnitColor(unit);
    final isSelected = _selectedUnit == unit;
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
          onTap: () => _selectUnit(unit),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(color: colors['bg'], borderRadius: BorderRadius.circular(16)),
                  child: Center(child: Text(unit,
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: colors['color']))),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Unit $unit',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    const SizedBox(height: 4),
                    Text('Tap to view sessions →',
                        style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                  ]),
                ),
                Icon(Icons.arrow_forward_ios_rounded,
                    color: isSelected ? AppColors.primary : AppColors.border, size: 22),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: const Column(
        children: [
          Icon(Icons.info_outline, size: 48, color: AppColors.textMuted),
          SizedBox(height: 12),
          Text('No units available', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          SizedBox(height: 4),
          Text("This university doesn't have any units configured yet",
              textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
