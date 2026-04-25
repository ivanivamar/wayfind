import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SectionLabel extends StatelessWidget {
  final String label;
  final Widget? action;

  const SectionLabel(this.label, {super.key, this.action});

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.07,
                color: c.fg3,
              ),
            ),
          ),
          if (action != null) action!,
        ],
      ),
    );
  }
}
