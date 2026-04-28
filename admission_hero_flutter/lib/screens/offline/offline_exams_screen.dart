import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/models.dart';
import '../../services/offline_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/constants.dart';
import '../../widgets/exam_card.dart';

class OfflineExamsScreen extends StatefulWidget {
  const OfflineExamsScreen({super.key});

  @override
  State<OfflineExamsScreen> createState() => _OfflineExamsScreenState();
}

class _OfflineExamsScreenState extends State<OfflineExamsScreen> {
  final OfflineService _offlineService = OfflineService();
  List<QuestionSet> _offlineExams = [];
  Map<String, dynamic> _storageUsage = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOfflineData();
  }

  Future<void> _loadOfflineData() async {
    setState(() => _isLoading = true);
    
    try {
      final exams = await _offlineService.getOfflineExams();
      final usage = await _offlineService.getStorageUsage();
      
      setState(() {
        _offlineExams = exams;
        _storageUsage = usage;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to load offline data'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _deleteOfflineExam(QuestionSet exam) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Offline Exam'),
        content: Text('Are you sure you want to delete "${exam.name}" from offline storage?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await _offlineService.deleteOfflineExam(exam.id);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Exam deleted from offline storage'),
            backgroundColor: Colors.green,
          ),
        );
        _loadOfflineData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to delete exam'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _clearAllOfflineData() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Clear All Offline Data'),
        content: const Text(
          'This will delete all downloaded exams and offline results. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await _offlineService.clearAllOfflineData();
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All offline data cleared'),
            backgroundColor: Colors.green,
          ),
        );
        _loadOfflineData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to clear offline data'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Offline Exams',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          if (_offlineExams.isNotEmpty)
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert),
              onSelected: (value) {
                switch (value) {
                  case 'sync':
                    _syncOfflineResults();
                    break;
                  case 'clear_all':
                    _clearAllOfflineData();
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'sync',
                  child: Row(
                    children: [
                      Icon(Icons.sync, size: 20),
                      SizedBox(width: 12),
                      Text('Sync Results'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'clear_all',
                  child: Row(
                    children: [
                      Icon(Icons.clear_all, size: 20, color: Colors.red),
                      SizedBox(width: 12),
                      Text('Clear All', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Storage Usage Card
                _buildStorageUsageCard(),
                
                // Offline Exams List
                Expanded(
                  child: _offlineExams.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _offlineExams.length,
                          itemBuilder: (context, index) {
                            final exam = _offlineExams[index];
                            return _buildOfflineExamCard(exam);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildStorageUsageCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.storage,
                color: Theme.of(context).colorScheme.primary,
                size: 24,
              ),
              const SizedBox(width: 8),
              const Text(
                'Offline Storage',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildUsageItem(
                  'Exams',
                  _storageUsage['exams']?.toString() ?? '0',
                  Icons.quiz,
                ),
              ),
              Expanded(
                child: _buildUsageItem(
                  'Questions',
                  _storageUsage['questions']?.toString() ?? '0',
                  Icons.help_outline,
                ),
              ),
              Expanded(
                child: _buildUsageItem(
                  'Results',
                  _storageUsage['results']?.toString() ?? '0',
                  Icons.assessment,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUsageItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.grey[600], size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.cloud_off,
              size: 60,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Offline Exams',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Download exams to take them offline',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.search),
            label: const Text('Browse Exams'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfflineExamCard(QuestionSet exam) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.offline_bolt,
            color: Colors.green,
            size: 24,
          ),
        ),
        title: Text(
          exam.name,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              '${exam.universityName} • ${exam.unit} Unit • ${exam.session}',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${exam.totalQuestions} Questions • ${exam.durationInMinutes} min',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'take_exam':
                Navigator.pushNamed(context, '/exam', arguments: exam.id);
                break;
              case 'practice':
                Navigator.pushNamed(context, '/practice', arguments: exam.id);
                break;
              case 'view':
                Navigator.pushNamed(context, '/questions-view', arguments: exam);
                break;
              case 'delete':
                _deleteOfflineExam(exam);
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'take_exam',
              child: Row(
                children: [
                  Icon(Icons.timer, size: 20),
                  SizedBox(width: 12),
                  Text('Take Exam'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'practice',
              child: Row(
                children: [
                  Icon(Icons.fitness_center, size: 20),
                  SizedBox(width: 12),
                  Text('Practice'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'view',
              child: Row(
                children: [
                  Icon(Icons.visibility, size: 20),
                  SizedBox(width: 12),
                  Text('View Questions'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, size: 20, color: Colors.red),
                  SizedBox(width: 12),
                  Text('Delete', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
        ),
        onTap: () {
          _showExamModeDialog(exam);
        },
      ),
    );
  }

  void _showExamModeDialog(QuestionSet exam) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(exam.name),
        content: const Text('Choose how you want to take this exam:'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.pushNamed(context, '/questions-view', arguments: exam);
            },
            child: const Text('View'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.pushNamed(context, '/practice', arguments: exam.id);
            },
            child: const Text('Practice'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.pushNamed(context, '/exam', arguments: exam.id);
            },
            child: const Text('Exam'),
          ),
        ],
      ),
    );
  }

  Future<void> _syncOfflineResults() async {
    try {
      final success = await _offlineService.syncOfflineResults();
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Offline results synced successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadOfflineData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to sync offline results'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error syncing offline results'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}