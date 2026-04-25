import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/mock_data.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/drawer_handle.dart';
import '../../../widgets/wf_avatar.dart';

class HomeDrawerContent extends StatelessWidget {
  final bool variantB;
  final VoidCallback onSearchTap;
  final VoidCallback onAvatarTap;

  const HomeDrawerContent({
    super.key,
    required this.variantB,
    required this.onSearchTap,
    required this.onAvatarTap,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        DrawerHandle(),
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: _SearchBar(onTap: onSearchTap, c: c),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: onAvatarTap,
                    child: const WfAvatar(size: 42, ring: true)
                        .animate()
                        .scale(
                          begin: const Offset(0.8, 0.8),
                          duration: 300.ms,
                          curve: Curves.elasticOut,
                        ),
                  ),
                ],
              ),
              if (variantB) ...[
                const SizedBox(height: 10),
                _QuickChips(),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SearchBar extends StatelessWidget {
  final VoidCallback onTap;
  final AppColors c;

  const _SearchBar({required this.onTap, required this.c});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: 150.ms,
        height: 48,
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: c.border),
        ),
        child: Row(
          children: [
            const SizedBox(width: 14),
            Icon(Icons.search_rounded, size: 18, color: c.fg3),
            const SizedBox(width: 10),
            Text(
              'Where to?',
              style: TextStyle(fontSize: 14, color: c.fg3),
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 250.ms)
        .slideY(begin: 0.05, end: 0, duration: 250.ms);
  }
}

class _QuickChips extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(vertical: 2),
        itemCount: wfFavorites.length > 4 ? 4 : wfFavorites.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final fav = wfFavorites[i];
          final icon = _iconForFav(fav.icon);
          return _Chip(label: fav.name, icon: icon, c: c, delay: i * 40)
              .animate(delay: Duration(milliseconds: i * 50))
              .fadeIn(duration: 200.ms)
              .slideX(begin: 0.04, end: 0);
        },
      ),
    );
  }

  IconData _iconForFav(String icon) => switch (icon) {
        'home' => Icons.home_rounded,
        'brief' => Icons.work_rounded,
        'heart' => Icons.favorite_rounded,
        'star' => Icons.star_rounded,
        _ => Icons.location_on_rounded,
      };
}

class _Chip extends StatefulWidget {
  final String label;
  final IconData icon;
  final AppColors c;
  final int delay;

  const _Chip({required this.label, required this.icon, required this.c, required this.delay});

  @override
  State<_Chip> createState() => _ChipState();
}

class _ChipState extends State<_Chip> with SingleTickerProviderStateMixin {
  late final AnimationController _pressCtrl;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(vsync: this, duration: 80.ms, value: 1.0);
  }

  @override
  void dispose() {
    _pressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    return GestureDetector(
      onTapDown: (_) => _pressCtrl.animateTo(0.95),
      onTapUp: (_) => _pressCtrl.animateTo(1.0),
      onTapCancel: () => _pressCtrl.animateTo(1.0),
      child: ScaleTransition(
        scale: _pressCtrl,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(100),
            border: Border.all(color: c.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, size: 13, color: c.primary),
              const SizedBox(width: 6),
              Text(
                widget.label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: c.fg1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
