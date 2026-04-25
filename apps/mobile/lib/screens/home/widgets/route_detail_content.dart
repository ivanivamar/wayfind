import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../models/route_model.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/drawer_handle.dart';

class RouteDetailContent extends StatelessWidget {
  final WfRoute route;
  final VoidCallback onBack;
  final VoidCallback onStartTravel;

  const RouteDetailContent({
    super.key,
    required this.route,
    required this.onBack,
    required this.onStartTravel,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Column(
      children: [
        DrawerHandle(),
        // Header
        Container(
          padding: const EdgeInsets.fromLTRB(14, 2, 14, 14),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: c.border)),
          ),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: onBack,
                    child: Container(
                      width: 36,
                      height: 36,
                      alignment: Alignment.center,
                      child: Icon(Icons.arrow_back_rounded, size: 18, color: c.fg1),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              route.duration,
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w600,
                                color: c.fg1,
                                letterSpacing: -0.01,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'arrive ${route.arrive}',
                              style: TextStyle(fontSize: 12, color: c.fg3),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${route.dist} · ${route.transfers == 0 ? 'Direct' : '${route.transfers} transfer'} · ${route.fare}',
                          style: TextStyle(fontSize: 12, color: c.fg2),
                        ),
                      ],
                    ),
                  ),
                  // Save button
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: c.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: c.border),
                    ),
                    child: Icon(Icons.bookmark_outline_rounded, size: 15, color: c.fg2),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // Start travel button
              _StartTravelButton(onTap: onStartTravel, c: c),
              const SizedBox(height: 10),
              // Status row
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: route.statusOk
                          ? const Color(0xFF4E9A6E).withValues(alpha: 0.12)
                          : const Color(0xFFC47F1A).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      '● ${route.status}',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: route.statusOk ? c.successFg : c.warning,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: c.surface,
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: c.border),
                    ),
                    child: Text(
                      '${route.co2} CO₂',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: c.fg2,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        )
            .animate()
            .fadeIn(duration: 220.ms)
            .slideY(begin: 0.04, end: 0),

        // Steps
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(14, 18, 14, 16),
            itemCount: route.steps.length,
            itemBuilder: (context, i) {
              final step = route.steps[i];
              final isLast = i == route.steps.length - 1;
              return StepRow(
                step: step,
                isLast: isLast,
                animationIndex: i,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _StartTravelButton extends StatefulWidget {
  final VoidCallback onTap;
  final AppColors c;

  const _StartTravelButton({required this.onTap, required this.c});

  @override
  State<_StartTravelButton> createState() => _StartTravelButtonState();
}

class _StartTravelButtonState extends State<_StartTravelButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pressCtrl;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(vsync: this, duration: 100.ms, value: 1.0);
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
      onTapDown: (_) => _pressCtrl.animateTo(0.96),
      onTapUp: (_) {
        _pressCtrl.animateTo(1.0);
        widget.onTap();
      },
      onTapCancel: () => _pressCtrl.animateTo(1.0),
      child: ScaleTransition(
        scale: _pressCtrl,
        child: Container(
          width: double.infinity,
          height: 48,
          decoration: BoxDecoration(
            color: c.primary,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: c.primaryRing,
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.navigation_rounded, size: 16, color: Colors.white),
              const SizedBox(width: 8),
              const Text(
                'Start travel',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StepRow extends StatefulWidget {
  final RouteStep step;
  final bool isLast;
  final int animationIndex;

  const StepRow({
    super.key,
    required this.step,
    required this.isLast,
    required this.animationIndex,
  });

  @override
  State<StepRow> createState() => _StepRowState();
}

class _StepRowState extends State<StepRow>
    with SingleTickerProviderStateMixin {
  bool _expanded = false;
  late final AnimationController _expandCtrl;

  @override
  void initState() {
    super.initState();
    _expandCtrl = AnimationController(vsync: this, duration: 200.ms);
  }

  @override
  void dispose() {
    _expandCtrl.dispose();
    super.dispose();
  }

  (Color bg, Color fg, IconData icon) _stepStyle(AppColors c, String mode) =>
      switch (mode) {
        'bus' => (c.busBg, c.busColor, Icons.directions_bus_rounded),
        'train' => (c.trainBg, c.trainColor, Icons.directions_transit_rounded),
        _ => (c.walkBg, c.walkColor, Icons.directions_walk_rounded),
      };

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final step = widget.step;
    final (bg, fg, icon) = _stepStyle(c, step.icon);

    return Padding(
      padding: EdgeInsets.only(bottom: widget.isLast ? 0 : 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left: icon + spine
          SizedBox(
            width: 36,
            child: Column(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: c.surfaceCard, width: 2),
                    boxShadow: c.cardShadow,
                  ),
                  child: Icon(icon, size: 16, color: fg),
                ),
                if (!widget.isLast)
                  Container(
                    width: 2,
                    height: 18 + (step.stops != null && _expanded ? 20.0 * (step.stops!.length) : 0),
                    margin: const EdgeInsets.only(top: 4),
                    child: CustomPaint(
                      painter: _DashPainter(color: c.borderStrong),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          // Right: content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 2),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        step.text,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: c.fg1,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      step.dur,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: c.fg2,
                      ),
                    ),
                  ],
                ),
                if (step.sub != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    step.sub!,
                    style: TextStyle(fontSize: 12, color: c.fg3),
                  ),
                ],
                if (step.line != null) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                        decoration: BoxDecoration(
                          color: fg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          step.icon == 'train' ? 'M${step.line}' : step.line!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '· toward ${step.icon == 'bus' ? 'Gare du Nord' : 'Bobigny'}',
                        style: TextStyle(fontSize: 11, color: c.fg3),
                      ),
                    ],
                  ),
                ],
                if (step.stops != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () {
                      setState(() => _expanded = !_expanded);
                      if (_expanded) {
                        _expandCtrl.forward();
                      } else {
                        _expandCtrl.reverse();
                      }
                    },
                    child: Row(
                      children: [
                        Text(
                          '${step.stops!.length} stops',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: c.fg2,
                          ),
                        ),
                        const SizedBox(width: 4),
                        RotationTransition(
                          turns: Tween(begin: 0.0, end: 0.5).animate(
                            CurvedAnimation(parent: _expandCtrl, curve: Curves.easeOut),
                          ),
                          child: Icon(Icons.keyboard_arrow_down_rounded, size: 12, color: c.fg2),
                        ),
                      ],
                    ),
                  ),
                  SizeTransition(
                    sizeFactor: CurvedAnimation(
                      parent: _expandCtrl,
                      curve: Curves.easeOut,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 8),
                        for (final stop in step.stops!)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 7, left: 6),
                            child: Row(
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: fg,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  stop,
                                  style: TextStyle(fontSize: 12, color: c.fg2),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    )
        .animate(delay: Duration(milliseconds: widget.animationIndex * 70))
        .fadeIn(duration: 250.ms)
        .slideY(begin: 0.04, end: 0);
  }
}

class _DashPainter extends CustomPainter {
  final Color color;
  _DashPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    double y = 0;
    while (y < size.height) {
      canvas.drawLine(
        Offset(size.width / 2, y),
        Offset(size.width / 2, y + 4),
        paint,
      );
      y += 8;
    }
  }

  @override
  bool shouldRepaint(_DashPainter old) => old.color != color;
}
