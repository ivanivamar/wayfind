import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class WfAvatar extends StatelessWidget {
  final double size;
  final bool ring;

  const WfAvatar({super.key, this.size = 32, this.ring = false});

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFDC8454), Color(0xFFC4611A)],
        ),
        border: ring
            ? Border.all(color: c.surfaceCard, width: 2)
            : null,
        boxShadow: ring ? c.cardShadow : null,
      ),
      alignment: Alignment.center,
      child: Text(
        'AM',
        style: TextStyle(
          fontSize: size * 0.38,
          fontWeight: FontWeight.w600,
          color: Colors.white,
          letterSpacing: 0,
          height: 1,
        ),
      ),
    );
  }
}
