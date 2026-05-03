import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/theme_service.dart';
import '../../services/offline_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final OfflineService _offlineService = OfflineService();
  Map<String, dynamic> _storageUsage = {};
  bool _pushNotificationsEnabled = true;
  bool _examRemindersEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadStorageUsage();
    _loadNotificationSettings();
  }

  Future<void> _loadStorageUsage() async {
    final usage = await _offlineService.getStorageUsage();
    setState(() {
      _storageUsage = usage;
    });
  }

  Future<void> _loadNotificationSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _pushNotificationsEnabled = prefs.getBool('push_notifications') ?? true;
      _examRemindersEnabled = prefs.getBool('exam_reminders') ?? true;
    });
  }

  Future<void> _savePushNotificationSetting(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('push_notifications', value);
    setState(() {
      _pushNotificationsEnabled = value;
    });
  }

  Future<void> _saveExamReminderSetting(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('exam_reminders', value);
    setState(() {
      _examRemindersEnabled = value;
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeService = context.watch<ThemeService>();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance Section
            _buildSectionHeader('Appearance'),
            _buildSettingsCard([
              _buildThemeSelector(themeService),
            ]),
            
            const SizedBox(height: 24),
            
            // Offline Section
            _buildSectionHeader('Offline'),
            _buildSettingsCard([
              _buildOfflineStorageInfo(),
              const Divider(height: 1),
              _buildOfflineManagement(),
            ]),
            
            const SizedBox(height: 24),
            
            // Notifications Section
            _buildSectionHeader('Notifications'),
            _buildSettingsCard([
              _buildNotificationSettings(),
            ]),
            
            const SizedBox(height: 24),
            
            // Privacy Section
            _buildSectionHeader('Privacy & Security'),
            _buildSettingsCard([
              _buildPrivacySettings(),
            ]),
            
            const SizedBox(height: 24),
            
            // About Section
            _buildSectionHeader('About'),
            _buildSettingsCard([
              _buildAboutInfo(),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).dividerColor,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildThemeSelector(ThemeService themeService) {
    return ListTile(
      leading: Icon(
        themeService.themeIcon,
        color: Theme.of(context).colorScheme.primary,
      ),
      title: const Text('Theme'),
      subtitle: Text(themeService.themeName),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        _showThemeDialog(themeService);
      },
    );
  }

  Widget _buildOfflineStorageInfo() {
    return ListTile(
      leading: Icon(
        Icons.storage,
        color: Theme.of(context).colorScheme.primary,
      ),
      title: const Text('Offline Storage'),
      subtitle: Text(
        '${_storageUsage['exams'] ?? 0} exams, ${_storageUsage['questions'] ?? 0} questions',
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        Navigator.pushNamed(context, '/offline-exams');
      },
    );
  }

  Widget _buildOfflineManagement() {
    return ListTile(
      leading: const Icon(
        Icons.cloud_sync,
        color: Colors.orange,
      ),
      title: const Text('Sync Offline Data'),
      subtitle: const Text('Upload offline results to server'),
      trailing: const Icon(Icons.chevron_right),
      onTap: () async {
        final success = await _offlineService.syncOfflineResults();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                success ? 'Offline data synced successfully' : 'Failed to sync offline data',
              ),
              backgroundColor: success ? Colors.green : Colors.red,
            ),
          );
        }
      },
    );
  }

  Widget _buildNotificationSettings() {
    return Column(
      children: [
        SwitchListTile(
          secondary: Icon(
            Icons.notifications,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Push Notifications'),
          subtitle: const Text('Receive exam reminders and updates'),
          value: _pushNotificationsEnabled,
          onChanged: (value) async {
            await _savePushNotificationSetting(value);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    value 
                      ? 'Push notifications enabled' 
                      : 'Push notifications disabled',
                  ),
                  backgroundColor: Colors.green,
                ),
              );
            }
          },
        ),
        const Divider(height: 1),
        SwitchListTile(
          secondary: Icon(
            Icons.alarm,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Exam Reminders'),
          subtitle: const Text('Get notified before exam time'),
          value: _examRemindersEnabled,
          onChanged: (value) async {
            await _saveExamReminderSetting(value);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    value 
                      ? 'Exam reminders enabled' 
                      : 'Exam reminders disabled',
                  ),
                  backgroundColor: Colors.green,
                ),
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildPrivacySettings() {
    return Column(
      children: [
        ListTile(
          leading: Icon(
            Icons.privacy_tip,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Privacy Policy'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.pushNamed(context, '/app-content', arguments: 'privacy_policy');
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: Icon(
            Icons.description,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Terms & Conditions'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.pushNamed(context, '/app-content', arguments: 'terms_conditions');
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: Icon(
            Icons.assignment_return,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Refund Policy'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.pushNamed(context, '/app-content', arguments: 'refund_policy');
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: const Icon(
            Icons.delete_forever,
            color: Colors.red,
          ),
          title: const Text(
            'Clear All Data',
            style: TextStyle(color: Colors.red),
          ),
          subtitle: const Text('Delete all offline data and reset app'),
          onTap: () {
            _showClearDataDialog();
          },
        ),
      ],
    );
  }

  Widget _buildAboutInfo() {
    return Column(
      children: [
        ListTile(
          leading: Icon(
            Icons.info,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('About App'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.pushNamed(context, '/app-content', arguments: 'about_app');
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: Icon(
            Icons.contact_support,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Contact Us'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.pushNamed(context, '/app-content', arguments: 'contact_us');
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: Icon(
            Icons.help,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('Support'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.pushNamed(context, '/support');
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: Icon(
            Icons.info_outline,
            color: Theme.of(context).colorScheme.primary,
          ),
          title: const Text('App Version'),
          subtitle: const Text('1.0.0+1'),
        ),
      ],
    );
  }

  void _showThemeDialog(ThemeService themeService) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<ThemeMode>(
              title: const Text('System'),
              subtitle: const Text('Follow system setting'),
              value: ThemeMode.system,
              groupValue: themeService.themeMode,
              onChanged: (value) {
                if (value != null) {
                  themeService.setThemeMode(value);
                  Navigator.of(context).pop();
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Light'),
              subtitle: const Text('Light theme'),
              value: ThemeMode.light,
              groupValue: themeService.themeMode,
              onChanged: (value) {
                if (value != null) {
                  themeService.setThemeMode(value);
                  Navigator.of(context).pop();
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Dark'),
              subtitle: const Text('Dark theme'),
              value: ThemeMode.dark,
              groupValue: themeService.themeMode,
              onChanged: (value) {
                if (value != null) {
                  themeService.setThemeMode(value);
                  Navigator.of(context).pop();
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _showClearDataDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(
          'Clear All Data',
          style: TextStyle(color: Colors.red),
        ),
        content: const Text(
          'This will delete all offline exams, results, and reset the app to its initial state. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(context).pop();
              final success = await _offlineService.clearAllOfflineData();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success ? 'All data cleared successfully' : 'Failed to clear data',
                    ),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
                if (success) {
                  _loadStorageUsage();
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }
}