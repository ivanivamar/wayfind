import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum LegMode { walk, bus, train }

class LegPill extends StatelessWidget {
  final String mode;
  final String label;
  final String? sub;
  final bool small;

  const LegPill({
    super.key,
    required this.mode,
    required this.label,
    this.sub,
    this.small = false,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final (bg, fg, icon) = _modeStyle(c, mode);
    final fontSize = small ? 11.0 : 12.0;
    final iconSize = small ? 12.0 : 13.0;
    final padding = small
        ? const EdgeInsets.symmetric(horizontal: 8, vertical: 4)
        : const EdgeInsets.symmetric(horizontal: 10, vertical: 5);

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: iconSize, color: fg),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w500,
              color: fg,
            ),
          ),
          if (sub != null) ...[
            Text(
              ' · $sub',
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.w400,
                color: fg.withValues(alpha: 0.75),
              ),
            ),
          ],
        ],
      ),
    );
  }

  (Color bg, Color fg, IconData icon) _modeStyle(AppColors c, String mode) {
    return switch (mode) {
      'bus' => (c.busBg, c.busColor, Icons.directions_bus_rounded),
      'train' => (c.trainBg, c.trainColor, Icons.directions_transit_rounded),
      _ => (c.walkBg, c.walkColor, Icons.directions_walk_rounded),
    };
  }
}
