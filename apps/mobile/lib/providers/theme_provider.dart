import 'package:flutter/material.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  void setTheme(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }

  void setThemeFromString(String mode) {
    switch (mode) {
      case 'light':
        setTheme(ThemeMode.light);
      case 'dark':
        setTheme(ThemeMode.dark);
      default:
        setTheme(ThemeMode.system);
    }
  }

  String get themeString => switch (_themeMode) {
        ThemeMode.light => 'light',
        ThemeMode.dark => 'dark',
        _ => 'system',
      };
}
