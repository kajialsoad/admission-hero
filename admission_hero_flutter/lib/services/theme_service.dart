import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService extends ChangeNotifier {
  static final ThemeService _instance = ThemeService._internal();
  factory ThemeService() => _instance;
  ThemeService._internal();

  static const String _themeKey = 'app_theme_mode';
  
  ThemeMode _themeMode = ThemeMode.system;
  
  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;
  bool get isLightMode => _themeMode == ThemeMode.light;
  bool get isSystemMode => _themeMode == ThemeMode.system;

  // Initialize theme from storage
  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeIndex = prefs.getInt(_themeKey) ?? 0;
      
      switch (themeIndex) {
        case 0:
          _themeMode = ThemeMode.system;
          break;
        case 1:
          _themeMode = ThemeMode.light;
          break;
        case 2:
          _themeMode = ThemeMode.dark;
          break;
      }
      
      notifyListeners();
      print('DEBUG: Theme initialized: $_themeMode');
    } catch (e) {
      print('DEBUG: Error initializing theme: $e');
    }
  }

  // Set theme mode
  Future<void> setThemeMode(ThemeMode mode) async {
    try {
      _themeMode = mode;
      notifyListeners();
      
      final prefs = await SharedPreferences.getInstance();
      int themeIndex;
      
      switch (mode) {
        case ThemeMode.system:
          themeIndex = 0;
          break;
        case ThemeMode.light:
          themeIndex = 1;
          break;
        case ThemeMode.dark:
          themeIndex = 2;
          break;
      }
      
      await prefs.setInt(_themeKey, themeIndex);
      print('DEBUG: Theme changed to: $mode');
    } catch (e) {
      print('DEBUG: Error setting theme: $e');
    }
  }

  // Toggle between light and dark
  Future<void> toggleTheme() async {
    if (_themeMode == ThemeMode.light) {
      await setThemeMode(ThemeMode.dark);
    } else {
      await setThemeMode(ThemeMode.light);
    }
  }

  // Get theme name for display
  String get themeName {
    switch (_themeMode) {
      case ThemeMode.system:
        return 'System';
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
    }
  }

  // Get theme icon
  IconData get themeIcon {
    switch (_themeMode) {
      case ThemeMode.system:
        return Icons.brightness_auto;
      case ThemeMode.light:
        return Icons.brightness_7;
      case ThemeMode.dark:
        return Icons.brightness_2;
    }
  }
}