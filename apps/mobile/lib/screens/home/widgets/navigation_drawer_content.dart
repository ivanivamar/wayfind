import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../models/route_model.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/drawer_handle.dart';

class NavigationDrawerContent extends StatefulWidget {
  final WfRoute route;
  final VoidCallback onEnd;

  const NavigationDrawerContent({
    super.key,
    required this.route,
    required this.onEnd,
  });

  @override
  State<NavigationDrawerContent> createState() =>
      _NavigationDrawerContentState();
}

class _NavigationDrawerContentState extends State<NavigationDrawerContent> {
  int _activeIdx = 1;
  bool _expanded = false;
  bool _audioOn = true;
  late final PageController _pageCtrl;

  @override
  void initState() {
    super.initState();
    _pageCtrl = PageController(
      initialPage: _activeIdx,
      viewportFraction: 0.88,
    );
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final steps = widget.route.steps;

    return Column(
      children: [
        GestureDetector(
          onTap: () => setState(() => _expanded = !_expanded),
          child: DrawerHandle(),
        ),

        // Trip summary
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
          child: _TripSummary(route: widget.route, c: c),
        )
            .animate()
            .fadeIn(duration: 200.ms),

        // Step carousel
        SizedBox(
          height: _expanded ? 0 : 110,
          child: AnimatedSwitcher(
            duration: 200.ms,
            child: _expanded
                ? const SizedBox.shrink()
                : PageView.builder(
                    controller: _pageCtrl,
                    itemCount: steps.length,
                    onPageChanged: (i) => setState(() => _activeIdx = i),
                    itemBuilder: (context, i) {
                      final step = steps[i];
                      final status = i < _activeIdx
                          ? 'done'
                          : i == _activeIdx
                              ? 'current'
                              : 'upcoming';
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: _StepCard(
                          step: step,
                          status: status,
                          c: c,
                          isLast: i == steps.length - 1,
                        ),
                      );
                    },
                  ),
          ),
        ),

        // Expanded: full step list
        if (_expanded)
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              itemCount: steps.length,
              itemBuilder: (context, i) {
                final step = steps[i];
                final status = i < _activeIdx
                    ? 'done'
                    : i == _activeIdx
                        ? 'current'
                        : 'upcoming';
                return _NavStepTile(
                  step: step,
                  status: status,
                  isLast: i == steps.length - 1,
                  c: c,
                  animationIndex: i,
                );
              },
            ),
          ),

        // Page dots (collapsed only)
        if (!_expanded) ...[
          _PageDots(count: steps.length, active: _activeIdx, c: c)
              .animate()
              .fadeIn(duration: 200.ms),
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}

class _TripSummary extends StatelessWidget {
  final WfRoute route;
  final AppColors c;

  const _TripSummary({required this.route, required this.c});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Arriving ${route.arrive}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: c.fg1,
                ),
              ),
              Text(
                '${route.duration} remaining · ${route.dist}',
                style: TextStyle(fontSize: 12, color: c.fg3),
              ),
            ],
          ),
        ),
        // Progress pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: c.primarySubtle,
            borderRadius: BorderRadius.circular(100),
          ),
          child: Text(
            '1 / ${route.steps.length} steps',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: c.primary,
            ),
          ),
        ),
      ],
    );
  }
}

class _StepCard extends StatelessWidget {
  final RouteStep step;
  final String status;
  final AppColors c;
  final bool isLast;

  const _StepCard({
    required this.step,
    required this.status,
    required this.c,
    required this.isLast,
  });

  (Color bg, Color fg, IconData icon) get _style => switch (step.icon) {
        'bus' => (c.busBg, c.busColor, Icons.directions_bus_rounded),
        'train' => (c.trainBg, c.trainColor, Icons.directions_transit_rounded),
        _ => (c.walkBg, c.walkColor, Icons.directions_walk_rounded),
      };

  @override
  Widget build(BuildContext context) {
    final isCurrent = status == 'current';
    final isDone = status == 'done';
    final (bg, fg, icon) = _style;

    return AnimatedContainer(
      duration: 200.ms,
      decoration: BoxDecoration(
        color: isCurrent ? c.surfaceCard : c.surface.withValues(alpha: isDone ? 0.6 : 1.0),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrent ? c.primary : c.border,
          width: isCurrent ? 1.5 : 1,
        ),
        boxShadow: isCurrent
            ? [
                BoxShadow(
                  color: c.primaryRing,
                  blurRadius: 0,
                  spreadRadius: 3,
                ),
                ...c.mediumShadow,
              ]
            : null,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AnimatedContainer(
            duration: 200.ms,
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isDone ? c.primary : bg,
              borderRadius: BorderRadius.circular(10),
              border: isCurrent ? Border.all(color: c.primary, width: 2) : null,
            ),
            child: Icon(
              isDone ? Icons.check_rounded : icon,
              size: 18,
              color: isDone ? Colors.white : fg,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isCurrent)
                  Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                    decoration: BoxDecoration(
                      color: c.primarySubtle,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: c.primary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Now · in 120 m',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: c.primary,
                            letterSpacing: 0.08,
                          ),
                        ),
                      ],
                    ),
                  ),
                Text(
                  step.text,
                  style: TextStyle(
                    fontSize: isCurrent ? 14 : 13,
                    fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w500,
                    color: c.fg1.withValues(alpha: isDone ? 0.55 : 1.0),
                    decoration: isDone ? TextDecoration.lineThrough : null,
                    decorationColor: c.fg3,
                  ),
                ),
                if (step.sub != null)
                  Text(
                    step.sub!,
                    style: TextStyle(fontSize: 11, color: c.fg3),
                  ),
              ],
            ),
          ),
          Text(
            step.dur,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: c.fg2,
            ),
          ),
        ],
      ),
    );
  }
}

class _NavStepTile extends StatelessWidget {
  final RouteStep step;
  final String status;
  final bool isLast;
  final AppColors c;
  final int animationIndex;

  const _NavStepTile({
    required this.step,
    required this.status,
    required this.isLast,
    required this.c,
    required this.animationIndex,
  });

  (Color bg, Color fg, IconData icon) get _style => switch (step.icon) {
        'bus' => (c.busBg, c.busColor, Icons.directions_bus_rounded),
        'train' => (c.trainBg, c.trainColor, Icons.directions_transit_rounded),
        _ => (c.walkBg, c.walkColor, Icons.directions_walk_rounded),
      };

  @override
  Widget build(BuildContext context) {
    final isCurrent = status == 'current';
    final isDone = status == 'done';
    final (bg, fg, icon) = _style;

    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 44,
            child: Column(
              children: [
                AnimatedContainer(
                  duration: 200.ms,
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isDone ? c.primary : bg,
                    borderRadius: BorderRadius.circular(12),
                    border: isCurrent
                        ? Border.all(color: c.primary, width: 3)
                        : Border.all(color: c.surfaceCard, width: 2),
                    boxShadow: isCurrent
                        ? [
                            BoxShadow(
                              color: c.primaryRing,
                              blurRadius: 0,
                              spreadRadius: 4,
                            ),
                            ...c.cardShadow,
                          ]
                        : c.cardShadow,
                  ),
                  child: Icon(
                    isDone ? Icons.check_rounded : icon,
                    size: 18,
                    color: isDone ? Colors.white : fg,
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 3,
                    height: 16,
                    margin: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      color: isDone
                          ? c.primary
                          : null,
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: isDone
                        ? null
                        : CustomPaint(
                            painter: _DashPainter(color: c.borderStrong),
                          ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: AnimatedContainer(
              duration: 200.ms,
              padding: isCurrent
                  ? const EdgeInsets.all(12)
                  : const EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                color: isCurrent ? c.surfaceCard : Colors.transparent,
                borderRadius: BorderRadius.circular(14),
                border: isCurrent
                    ? Border.all(color: c.primary)
                    : Border.all(color: Colors.transparent),
                boxShadow: isCurrent
                    ? [
                        BoxShadow(
                          color: c.primaryRing,
                          blurRadius: 0,
                          spreadRadius: 3,
                        ),
                        ...c.mediumShadow,
                      ]
                    : null,
              ),
              child: Opacity(
                opacity: isDone ? 0.55 : 1.0,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isCurrent)
                      Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 9, vertical: 3),
                        decoration: BoxDecoration(
                          color: c.primarySubtle,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: c.primary,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Now · in 120 m',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: c.primary,
                                letterSpacing: 0.08,
                              ),
                            ),
                          ],
                        ),
                      ),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            step.text,
                            style: TextStyle(
                              fontSize: isCurrent ? 16 : 14,
                              fontWeight: isCurrent
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                              color: c.fg1,
                              letterSpacing: isCurrent ? -0.005 : 0,
                              decoration:
                                  isDone ? TextDecoration.lineThrough : null,
                              decorationColor: c.fg3,
                            ),
                          ),
                        ),
                        Text(
                          step.dur,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: c.fg2,
                          ),
                        ),
                      ],
                    ),
                    if (step.sub != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        step.sub!,
                        style: TextStyle(fontSize: 12, color: c.fg3),
                      ),
                    ],
                    if (isCurrent && step.stops != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: c.surface,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: c.border),
                        ),
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(fontSize: 12, color: c.fg2),
                            children: [
                              TextSpan(
                                text: 'Next stop: ',
                                style: TextStyle(
                                    fontWeight: FontWeight.w600, color: c.fg1),
                              ),
                              TextSpan(text: '${step.stops!.first} · then ${step.stops!.length - 1} more'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    )
        .animate(delay: Duration(milliseconds: animationIndex * 50))
        .fadeIn(duration: 220.ms)
        .slideY(begin: 0.04, end: 0);
  }
}

class _PageDots extends StatelessWidget {
  final int count;
  final int active;
  final AppColors c;

  const _PageDots({required this.count, required this.active, required this.c});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (int i = 0; i < count; i++)
          AnimatedContainer(
            duration: 200.ms,
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: i == active ? 16 : 6,
            height: 6,
            decoration: BoxDecoration(
              color: i == active ? c.primary : c.border,
              borderRadius: BorderRadius.circular(100),
            ),
          ),
      ],
    );
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
        Offset(size.width / 2, (y + 4).clamp(0, size.height)),
        paint,
      );
      y += 8;
    }
  }

  @override
  bool shouldRepaint(_DashPainter old) => old.color != color;
}
