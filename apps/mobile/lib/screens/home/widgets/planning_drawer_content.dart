import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/mock_data.dart';
import '../../../models/place.dart';
import '../../../models/route_model.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/drawer_handle.dart';
import '../../../widgets/route_card.dart';

class PlanningDrawerContent extends StatefulWidget {
  final Place? destination;
  final String initialMode;
  final int? initialRouteId;
  final VoidCallback onBack;
  final ValueChanged<WfRoute> onSelectRoute;

  const PlanningDrawerContent({
    super.key,
    this.destination,
    this.initialMode = 'transit',
    this.initialRouteId,
    required this.onBack,
    required this.onSelectRoute,
  });

  @override
  State<PlanningDrawerContent> createState() => _PlanningDrawerContentState();
}

class _PlanningDrawerContentState extends State<PlanningDrawerContent> {
  late String _mode;
  String _when = 'now';
  late int _activeRouteId;

  @override
  void initState() {
    super.initState();
    _mode = widget.initialMode;
    _activeRouteId = widget.initialRouteId ?? wfRoutes.first.id;
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final routes = _mode == 'walk'
        ? wfRoutes.where((r) => r.legs.every((l) => l.mode == 'walk')).toList()
        : wfRoutes;

    return Column(
      children: [
        DrawerHandle(),
        // Origin / Destination header
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button
              _IconBtn(
                icon: Icons.arrow_back_rounded,
                onTap: widget.onBack,
                c: c,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  children: [
                    // Origin field
                    _RouteField(
                      value: 'Your location',
                      isDest: false,
                      c: c,
                    ),
                    const SizedBox(height: 6),
                    // Destination field
                    _RouteField(
                      value: widget.destination?.name ?? 'Gare du Nord',
                      isDest: true,
                      c: c,
                    ),
                  ],
                ),
              ),
            ],
          ),
        )
            .animate()
            .fadeIn(duration: 220.ms)
            .slideY(begin: 0.04, end: 0),

        // Mode tabs
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: _ModeTabs(
            selected: _mode,
            onSelect: (m) => setState(() => _mode = m),
            c: c,
          ),
        )
            .animate(delay: 40.ms)
            .fadeIn(duration: 200.ms),

        // Time + options chips
        SizedBox(
          height: 36,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
            children: [
              for (final (key, label) in [
                ('now', 'Leave now'),
                ('leave', 'Leave at›'),
                ('arrive', 'Arrive by'),
              ])
                Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: _TimeChip(
                    label: label,
                    active: _when == key,
                    onTap: () => setState(() => _when = key),
                    c: c,
                  ),
                ),
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: _OptionsChip(c: c),
              ),
            ],
          ),
        )
            .animate(delay: 60.ms)
            .fadeIn(duration: 200.ms),

        const SizedBox(height: 10),

        // Routes list
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(12, 2, 12, 16),
            itemCount: routes.isEmpty ? wfRoutes.length : routes.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final route = routes.isEmpty ? wfRoutes[i] : routes[i];
              return RouteCard(
                route: route,
                active: _activeRouteId == route.id,
                animationIndex: i,
                onTap: () {
                  setState(() => _activeRouteId = route.id);
                  widget.onSelectRoute(route);
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _RouteField extends StatelessWidget {
  final String value;
  final bool isDest;
  final AppColors c;

  const _RouteField({required this.value, required this.isDest, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: isDest ? c.surfaceCard : c.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDest ? c.primary : c.border,
          width: isDest ? 1.5 : 1,
        ),
        boxShadow: isDest
            ? [
                BoxShadow(
                  color: c.primaryRing,
                  blurRadius: 0,
                  spreadRadius: 3,
                ),
              ]
            : null,
      ),
      child: Row(
        children: [
          isDest
              ? Icon(Icons.location_on_rounded, size: 14, color: c.primary)
              : Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: c.primary,
                    boxShadow: [
                      BoxShadow(
                        color: c.primarySubtle,
                        blurRadius: 0,
                        spreadRadius: 3,
                      ),
                    ],
                  ),
                ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
                color: c.fg1,
                fontWeight: isDest ? FontWeight.w500 : FontWeight.w400,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _ModeTabs extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onSelect;
  final AppColors c;

  const _ModeTabs({required this.selected, required this.onSelect, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: c.border),
      ),
      child: Row(
        children: [
          for (final (key, label, icon) in [
            ('transit', 'Transit', Icons.directions_transit_rounded),
            ('walk', 'Walk', Icons.directions_walk_rounded),
          ])
            Expanded(
              child: _ModeTab(
                label: label,
                icon: icon,
                active: selected == key,
                c: c,
                onTap: () => onSelect(key),
              ),
            ),
        ],
      ),
    );
  }
}

class _ModeTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final AppColors c;
  final VoidCallback onTap;

  const _ModeTab({
    required this.label,
    required this.icon,
    required this.active,
    required this.c,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: 120.ms,
        height: 36,
        decoration: BoxDecoration(
          color: active ? c.surfaceCard : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          boxShadow: active ? c.cardShadow : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: active ? c.fg1 : c.fg3),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: active ? c.fg1 : c.fg3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  final AppColors c;

  const _TimeChip({required this.label, required this.active, required this.onTap, required this.c});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: 120.ms,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? c.primarySubtle : c.surface,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: active ? c.primaryTint : c.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: active ? c.primary : c.fg2,
          ),
        ),
      ),
    );
  }
}

class _OptionsChip extends StatelessWidget {
  final AppColors c;

  const _OptionsChip({required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: c.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.tune_rounded, size: 12, color: c.fg2),
          const SizedBox(width: 5),
          Text(
            'Options',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: c.fg2),
          ),
        ],
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final AppColors c;

  const _IconBtn({required this.icon, required this.onTap, required this.c});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        margin: const EdgeInsets.only(top: 4),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 18, color: c.fg1),
      ),
    );
  }
}
