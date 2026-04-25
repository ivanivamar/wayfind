import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class DrawerHandle extends StatelessWidget {
  final VoidCallback? onTap;

  const DrawerHandle({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: c.borderStrong.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(100),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
