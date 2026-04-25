import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/place.dart';
import '../theme/app_colors.dart';

class PlaceRow extends StatefulWidget {
  final Place place;
  final VoidCallback? onTap;
  final int animationIndex;

  const PlaceRow({
    super.key,
    required this.place,
    this.onTap,
    this.animationIndex = 0,
  });

  @override
  State<PlaceRow> createState() => _PlaceRowState();
}

class _PlaceRowState extends State<PlaceRow> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final place = widget.place;
    final isFav = place.isFavoriteIcon;
    final (bg, fg, icon) = _iconStyle(c, place.icon, isFav);

    return AnimatedContainer(
      duration: 100.ms,
      color: _hovered ? c.surfaceHover : Colors.transparent,
      child: InkWell(
        onTap: widget.onTap,
        onHover: (v) => setState(() => _hovered = v),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 16, color: fg),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      place.name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: c.fg1,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 1),
                    Text(
                      place.sub,
                      style: TextStyle(fontSize: 12, color: c.fg3),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (place.dist.isNotEmpty) ...[
                const SizedBox(width: 8),
                Text(
                  place.dist,
                  style: TextStyle(fontSize: 11, color: c.fg3),
                ),
              ],
            ],
          ),
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: widget.animationIndex * 40))
        .fadeIn(duration: 220.ms)
        .slideY(begin: 0.04, end: 0, duration: 220.ms, curve: Curves.easeOut);
  }

  (Color bg, Color fg, IconData icon) _iconStyle(
      AppColors c, String icon, bool isFav) {
    return switch (icon) {
      'home' => (c.primarySubtle, c.primary, Icons.home_rounded),
      'brief' => (c.primarySubtle, c.primary, Icons.work_rounded),
      'heart' => (c.primarySubtle, c.primary, Icons.favorite_rounded),
      'star' => (c.primarySubtle, c.primary, Icons.star_rounded),
      'transit' => (c.busBg, c.busColor, Icons.directions_transit_rounded),
      'clock' => (c.surface, c.fg2, Icons.access_time_rounded),
      _ => (c.surface, c.fg2, Icons.location_on_rounded),
    };
  }
}
