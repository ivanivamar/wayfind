import 'package:flutter/material.dart';

class AppColors {
  final Color bg;
  final Color bgSubtle;
  final Color surface;
  final Color surfaceHover;
  final Color surfaceActive;
  final Color surfaceCard;
  final Color border;
  final Color borderStrong;

  final Color fg1;
  final Color fg2;
  final Color fg3;
  final Color fgDisabled;
  final Color fgOnPrimary;

  final Color primary;
  final Color primaryHover;
  final Color primaryPress;
  final Color primarySubtle;
  final Color primaryTint;
  final Color primaryRing;

  final Color success;
  final Color successFg;
  final Color warning;
  final Color danger;
  final Color info;

  final Color walkColor;
  final Color walkBg;
  final Color busColor;
  final Color busBg;
  final Color trainColor;
  final Color trainBg;

  final Color mapBg;
  final Color mapLine;
  final Color mapLine2;
  final Color mapPark;
  final Color mapWater;
  final Color mapRoad;

  const AppColors({
    required this.bg,
    required this.bgSubtle,
    required this.surface,
    required this.surfaceHover,
    required this.surfaceActive,
    required this.surfaceCard,
    required this.border,
    required this.borderStrong,
    required this.fg1,
    required this.fg2,
    required this.fg3,
    required this.fgDisabled,
    required this.fgOnPrimary,
    required this.primary,
    required this.primaryHover,
    required this.primaryPress,
    required this.primarySubtle,
    required this.primaryTint,
    required this.primaryRing,
    required this.success,
    required this.successFg,
    required this.warning,
    required this.danger,
    required this.info,
    required this.walkColor,
    required this.walkBg,
    required this.busColor,
    required this.busBg,
    required this.trainColor,
    required this.trainBg,
    required this.mapBg,
    required this.mapLine,
    required this.mapLine2,
    required this.mapPark,
    required this.mapWater,
    required this.mapRoad,
  });

  static const light = AppColors(
    bg: Color(0xFFFAF8F5),
    bgSubtle: Color(0xFFF7F3EE),
    surface: Color(0xFFF2EBE0),
    surfaceHover: Color(0xFFEDE3D6),
    surfaceActive: Color(0xFFE5D7C6),
    surfaceCard: Color(0xFFFFFFFF),
    border: Color(0xFFE8DDD0),
    borderStrong: Color(0xFFD9CABA),
    fg1: Color(0xFF1C1510),
    fg2: Color(0xFF6B5744),
    fg3: Color(0xFFA8947E),
    fgDisabled: Color(0xFFC4AC94),
    fgOnPrimary: Color(0xFFFFFFFF),
    primary: Color(0xFFC4611A),
    primaryHover: Color(0xFFA85016),
    primaryPress: Color(0xFF8C3F12),
    primarySubtle: Color(0xFFFDF0E8),
    primaryTint: Color(0xFFF9D8C0),
    primaryRing: Color(0x2EC4611A),
    success: Color(0xFF4E9A6E),
    successFg: Color(0xFF3D8059),
    warning: Color(0xFFC47F1A),
    danger: Color(0xFFC4341A),
    info: Color(0xFF4A7FC4),
    walkColor: Color(0xFFC4611A),
    walkBg: Color(0x1AC4611A),
    busColor: Color(0xFF4A7FC4),
    busBg: Color(0x1F4A7FC4),
    trainColor: Color(0xFF7A4FC4),
    trainBg: Color(0x1F7A4FC4),
    mapBg: Color(0xFFEDE8DF),
    mapLine: Color(0xFFE0D8CC),
    mapLine2: Color(0xFFDDD4C6),
    mapPark: Color(0xFFD4E4C8),
    mapWater: Color(0xFFC8D8E8),
    mapRoad: Color(0xFFFFFFFF),
  );

  static const dark = AppColors(
    bg: Color(0xFF1A1410),
    bgSubtle: Color(0xFF1F1914),
    surface: Color(0xFF231D18),
    surfaceHover: Color(0xFF2D2520),
    surfaceActive: Color(0xFF382E27),
    surfaceCard: Color(0xFF231D18),
    border: Color(0xFF3D3028),
    borderStrong: Color(0xFF52433A),
    fg1: Color(0xFFF2EBE0),
    fg2: Color(0xFFA89280),
    fg3: Color(0xFF917060),
    fgDisabled: Color(0xFF4A3C2E),
    fgOnPrimary: Color(0xFFFFFFFF),
    primary: Color(0xFFF09060),
    primaryHover: Color(0xFFF0A070),
    primaryPress: Color(0xFFD06830),
    primarySubtle: Color(0x1FF09060),
    primaryTint: Color(0x33F09060),
    primaryRing: Color(0x38F09060),
    success: Color(0xFF68C888),
    successFg: Color(0xFF68C888),
    warning: Color(0xFFE09A38),
    danger: Color(0xFFE85840),
    info: Color(0xFF70A0E0),
    walkColor: Color(0xFFF09060),
    walkBg: Color(0x24F09060),
    busColor: Color(0xFF70A0E0),
    busBg: Color(0x2470A0E0),
    trainColor: Color(0xFFA080E0),
    trainBg: Color(0x24A080E0),
    mapBg: Color(0xFF231D18),
    mapLine: Color(0xFF2D2520),
    mapLine2: Color(0xFF342B24),
    mapPark: Color(0xFF1E2A1A),
    mapWater: Color(0xFF1C2830),
    mapRoad: Color(0xFF2D2520),
  );

  BoxShadow get shadow1 => BoxShadow(
        color: bg.withValues(alpha: 0),
        blurRadius: 3,
        offset: const Offset(0, 1),
      );

  List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: const Color(0xFF1C1510).withValues(alpha: 0.08),
          blurRadius: 3,
          offset: const Offset(0, 1),
        ),
        BoxShadow(
          color: const Color(0xFF1C1510).withValues(alpha: 0.04),
          blurRadius: 2,
          offset: const Offset(0, 1),
        ),
      ];

  List<BoxShadow> get drawerShadow => [
        BoxShadow(
          color: const Color(0xFF1C1510).withValues(alpha: 0.18),
          blurRadius: 48,
          offset: const Offset(0, 16),
        ),
        BoxShadow(
          color: const Color(0xFF1C1510).withValues(alpha: 0.08),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];

  List<BoxShadow> get mediumShadow => [
        BoxShadow(
          color: const Color(0xFF1C1510).withValues(alpha: 0.12),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
        BoxShadow(
          color: const Color(0xFF1C1510).withValues(alpha: 0.06),
          blurRadius: 4,
          offset: const Offset(0, 2),
        ),
      ];
}

extension AppColorsContext on BuildContext {
  AppColors get wfColors => Theme.of(this).brightness == Brightness.dark
      ? AppColors.dark
      : AppColors.light;
}
