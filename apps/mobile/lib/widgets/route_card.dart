import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/route_model.dart';
import '../theme/app_colors.dart';
import 'leg_pill.dart';

class RouteCard extends StatefulWidget {
  final WfRoute route;
  final bool active;
  final VoidCallback? onTap;
  final int animationIndex;

  const RouteCard({
    super.key,
    required this.route,
    this.active = false,
    this.onTap,
    this.animationIndex = 0,
  });

  @override
  State<RouteCard> createState() => _RouteCardState();
}

class _RouteCardState extends State<RouteCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _selectCtrl;

  @override
  void initState() {
    super.initState();
    _selectCtrl = AnimationController(
      vsync: this,
      duration: 160.ms,
      value: widget.active ? 1.0 : 0.0,
    );
  }

  @override
  void didUpdateWidget(RouteCard old) {
    super.didUpdateWidget(old);
    if (widget.active != old.active) {
      if (widget.active) {
        _selectCtrl.forward();
      } else {
        _selectCtrl.reverse();
      }
    }
  }

  @override
  void dispose() {
    _selectCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final route = widget.route;
    final (tagBg, tagFg) = _tagColors(c, route.tagColor);

    return AnimatedBuilder(
      animation: _selectCtrl,
      builder: (context, child) {
        final t = _selectCtrl.value;
        final borderColor = Color.lerp(c.border, c.primary, t)!;
        final ringOpacity = t * 0.4;

        return GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: 160.ms,
            decoration: BoxDecoration(
              color: c.surfaceCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor),
              boxShadow: [
                if (t > 0)
                  BoxShadow(
                    color: c.primary.withValues(alpha: ringOpacity * 0.3),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ...c.cardShadow,
              ],
            ),
            child: child!,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          route.duration,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -0.01,
                            color: c.fg1,
                            height: 1,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'arr ${route.arrive}',
                          style: TextStyle(fontSize: 12, color: c.fg3),
                        ),
                      ],
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: tagBg,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text(
                    route.tag,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: tagFg,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 5,
              runSpacing: 4,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (int i = 0; i < route.legs.length; i++) ...[
                  if (i > 0)
                    Text('›', style: TextStyle(color: c.borderStrong, fontSize: 12)),
                  LegPill(
                    mode: route.legs[i].mode,
                    label: route.legs[i].label,
                    sub: route.legs[i].sub,
                    small: true,
                  ),
                ],
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time_rounded, size: 11, color: c.fg3),
                const SizedBox(width: 4),
                Text(
                  route.transfers == 0 ? 'Direct' : '${route.transfers} transfer',
                  style: TextStyle(fontSize: 11, color: c.fg3),
                ),
                const SizedBox(width: 12),
                Text(route.dist, style: TextStyle(fontSize: 11, color: c.fg3)),
                const SizedBox(width: 12),
                Text(route.fare, style: TextStyle(fontSize: 11, color: c.fg3)),
                const Spacer(),
                Text(
                  route.status,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: route.statusOk ? c.successFg : c.warning,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: widget.animationIndex * 60))
        .fadeIn(duration: 280.ms)
        .slideY(begin: 0.05, end: 0, duration: 280.ms, curve: Curves.easeOut);
  }

  (Color bg, Color fg) _tagColors(AppColors c, String tagColor) {
    return switch (tagColor) {
      'green' => (
          const Color(0xFF4E9A6E).withValues(alpha: 0.1),
          c.successFg,
        ),
      'walk' => (
          c.primary.withValues(alpha: 0.08),
          c.primaryPress,
        ),
      _ => (c.primarySubtle, c.primary),
    };
  }
}
