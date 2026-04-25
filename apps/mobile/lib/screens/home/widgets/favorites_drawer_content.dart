import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/mock_data.dart';
import '../../../models/place.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/drawer_handle.dart';
import '../../../widgets/place_row.dart';
import '../../../widgets/section_label.dart';
import '../../../widgets/wf_avatar.dart';

class FavoritesDrawerContent extends StatelessWidget {
  final VoidCallback onSearchTap;
  final VoidCallback onAvatarTap;
  final ValueChanged<Place> onPlaceTap;

  const FavoritesDrawerContent({
    super.key,
    required this.onSearchTap,
    required this.onAvatarTap,
    required this.onPlaceTap,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Column(
      children: [
        DrawerHandle(),
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: onSearchTap,
                  child: Container(
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
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: onAvatarTap,
                child: const WfAvatar(size: 42, ring: true),
              ),
            ],
          ),
        )
            .animate()
            .fadeIn(duration: 200.ms),

        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              SectionLabel(
                'Saved places',
                action: TextButton(
                  onPressed: () {},
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    'Edit',
                    style: TextStyle(
                      fontSize: 11,
                      color: c.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              for (final (i, fav) in wfFavorites.indexed)
                PlaceRow(
                  place: fav,
                  animationIndex: i,
                  onTap: () => onPlaceTap(fav),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                child: _AddPlaceButton(c: c),
              ),
              SectionLabel('Recent'),
              for (final (i, rec) in wfRecents.indexed)
                PlaceRow(
                  place: rec,
                  animationIndex: wfFavorites.length + i,
                  onTap: () => onPlaceTap(rec),
                ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ],
    );
  }
}

class _AddPlaceButton extends StatefulWidget {
  final AppColors c;
  const _AddPlaceButton({required this.c});

  @override
  State<_AddPlaceButton> createState() => _AddPlaceButtonState();
}

class _AddPlaceButtonState extends State<_AddPlaceButton>
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
          height: 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: c.borderStrong,
              style: BorderStyle.solid,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.add_rounded, size: 14, color: c.primary),
              const SizedBox(width: 8),
              Text(
                'Add a saved place',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: c.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
