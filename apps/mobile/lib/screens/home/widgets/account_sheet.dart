import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../providers/theme_provider.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/wf_avatar.dart';
import '../../../data/mock_data.dart';

class AccountSheet extends StatelessWidget {
  final VoidCallback onClose;

  const AccountSheet({super.key, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Stack(
      children: [
        // Scrim
        GestureDetector(
          onTap: onClose,
          child: Container(
            color: Colors.black.withValues(alpha: 0.45),
          ),
        )
            .animate()
            .fadeIn(duration: 180.ms),

        // Sheet
        Positioned(
          top: 54,
          left: 10,
          right: 10,
          child: _SheetContent(onClose: onClose, c: c)
              .animate()
              .fadeIn(duration: 200.ms)
              .slideY(begin: -0.06, end: 0, duration: 220.ms, curve: Curves.easeOut),
        ),
      ],
    );
  }
}

class _SheetContent extends StatelessWidget {
  final VoidCallback onClose;
  final AppColors c;

  const _SheetContent({required this.onClose, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: c.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.border),
        boxShadow: c.drawerShadow,
      ),
      clipBehavior: Clip.hardEdge,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Profile hero header
          _ProfileHeader(onClose: onClose, c: c),

          // Menu items
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Column(
              children: [
                for (final (i, row) in _menuItems.indexed)
                  _MenuItem(
                    icon: row.$1,
                    label: row.$2,
                    sub: row.$3,
                    c: c,
                    delay: i * 30,
                  ),
              ],
            ),
          ),

          // Appearance switcher
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: _AppearanceSwitcher(c: c),
          ),

          // Sign out
          Container(
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: c.border)),
            ),
            padding: const EdgeInsets.all(10),
            child: _SignOutButton(c: c),
          ),
        ],
      ),
    );
  }

  static const _menuItems = [
    (Icons.bookmark_outline_rounded, 'Saved places', '12 places'),
    (Icons.tune_rounded, 'Travel preferences', null),
    (Icons.notifications_outlined, 'Notifications', 'On'),
    (Icons.settings_outlined, 'Account settings', null),
    (Icons.help_outline_rounded, 'Help & support', null),
  ];
}

class _ProfileHeader extends StatelessWidget {
  final VoidCallback onClose;
  final AppColors c;

  const _ProfileHeader({required this.onClose, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 22, 18, 18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [c.primarySubtle, c.surfaceCard],
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const WfAvatar(size: 56, ring: true),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      wfUser.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: c.fg1,
                        letterSpacing: -0.005,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      wfUser.email,
                      style: TextStyle(fontSize: 12, color: c.fg3),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Close button
              GestureDetector(
                onTap: onClose,
                child: Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: c.surfaceCard,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: c.border),
                  ),
                  child: Icon(Icons.close_rounded, size: 13, color: c.fg2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Stats row
          Container(
            decoration: BoxDecoration(
              color: c.surfaceCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: c.border),
            ),
            child: Row(
              children: [
                for (final (i, stat) in [
                  ('12', 'Saved'),
                  ('48', 'Trips'),
                  ('214 km', 'Walked'),
                ].indexed) ...[
                  if (i > 0)
                    Container(width: 1, height: 40, color: c.border),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Column(
                        children: [
                          Text(
                            stat.$1,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: c.fg1,
                              letterSpacing: -0.01,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            stat.$2.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              color: c.fg3,
                              letterSpacing: 0.06,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final String? sub;
  final AppColors c;
  final int delay;

  const _MenuItem({
    required this.icon,
    required this.label,
    this.sub,
    required this.c,
    required this.delay,
  });

  @override
  State<_MenuItem> createState() => _MenuItemState();
}

class _MenuItemState extends State<_MenuItem> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    return AnimatedContainer(
      duration: 100.ms,
      decoration: BoxDecoration(
        color: _hovered ? c.surfaceHover : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: InkWell(
        onTap: () {},
        onHover: (v) => setState(() => _hovered = v),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: c.surface,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(widget.icon, size: 16, color: c.fg2),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.label,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: c.fg1,
                      ),
                    ),
                    if (widget.sub != null)
                      Text(
                        widget.sub!,
                        style: TextStyle(fontSize: 11, color: c.fg3),
                      ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, size: 14, color: c.fg3),
            ],
          ),
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: widget.delay))
        .fadeIn(duration: 200.ms)
        .slideX(begin: -0.02, end: 0);
  }
}

class _AppearanceSwitcher extends StatelessWidget {
  final AppColors c;

  const _AppearanceSwitcher({required this.c});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ThemeProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'APPEARANCE',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: c.fg3,
            letterSpacing: 0.07,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: c.border),
          ),
          child: Row(
            children: [
              for (final (key, label, icon) in [
                ('light', 'Light', Icons.light_mode_outlined),
                ('dark', 'Dark', Icons.dark_mode_outlined),
                ('system', 'System', Icons.settings_suggest_outlined),
              ])
                Expanded(
                  child: _ThemeChip(
                    label: label,
                    icon: icon,
                    active: provider.themeString == key,
                    c: c,
                    onTap: () => provider.setThemeFromString(key),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ThemeChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final AppColors c;
  final VoidCallback onTap;

  const _ThemeChip({
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
        height: 34,
        decoration: BoxDecoration(
          color: active ? c.surfaceCard : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          boxShadow: active ? c.cardShadow : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 13, color: active ? c.fg1 : c.fg3),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
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

class _SignOutButton extends StatefulWidget {
  final AppColors c;

  const _SignOutButton({required this.c});

  @override
  State<_SignOutButton> createState() => _SignOutButtonState();
}

class _SignOutButtonState extends State<_SignOutButton>
    with SingleTickerProviderStateMixin {
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
      onTapDown: (_) => _pressCtrl.animateTo(0.97),
      onTapUp: (_) => _pressCtrl.animateTo(1.0),
      onTapCancel: () => _pressCtrl.animateTo(1.0),
      child: ScaleTransition(
        scale: _pressCtrl,
        child: Container(
          width: double.infinity,
          height: 42,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.logout_rounded, size: 15, color: c.danger),
              const SizedBox(width: 8),
              Text(
                'Sign out',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: c.danger,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
