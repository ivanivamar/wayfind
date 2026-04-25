import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_colors.dart';

class MapPlaceholder extends StatefulWidget {
  const MapPlaceholder({super.key});

  @override
  State<MapPlaceholder> createState() => _MapPlaceholderState();
}

class _MapPlaceholderState extends State<MapPlaceholder>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return SizedBox.expand(
      child: CustomPaint(
        painter: _MapPainter(c),
        child: Stack(
          children: [
            // Pulsing location dot
            Positioned(
              left: 180,
              top: 320,
              child: AnimatedBuilder(
                animation: _pulseCtrl,
                builder: (context, child) {
                  final pulse = _pulseCtrl.value;
                  return Stack(
                    alignment: Alignment.center,
                    children: [
                      Transform.scale(
                        scale: 1.0 + pulse * 1.2,
                        child: Opacity(
                          opacity: (1 - pulse) * 0.35,
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: c.primary,
                            ),
                          ),
                        ),
                      ),
                      Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: c.primary,
                          border: Border.all(color: Colors.white, width: 2.5),
                          boxShadow: [
                            BoxShadow(
                              color: c.primary.withValues(alpha: 0.35),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            // Map control buttons (top right)
            Positioned(
              right: 14,
              bottom: 210,
              child: Column(
                children: [
                  _MapButton(icon: Icons.add, color: c),
                  const SizedBox(height: 2),
                  _MapButton(icon: Icons.remove, color: c),
                ],
              )
                  .animate()
                  .fadeIn(duration: 400.ms, delay: 300.ms),
            ),
          ],
        ),
      ),
    );
  }
}

class _MapButton extends StatelessWidget {
  final IconData icon;
  final AppColors color;

  const _MapButton({required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color.surfaceCard,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.border),
        boxShadow: color.mediumShadow,
      ),
      child: Icon(icon, size: 20, color: color.fg2),
    );
  }
}

class _MapPainter extends CustomPainter {
  final AppColors c;
  _MapPainter(this.c);

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = c.mapBg;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final linePaint = Paint()
      ..color = c.mapLine
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    final line2Paint = Paint()
      ..color = c.mapLine2
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    // Draw grid lines
    const gridSize = 36.0;
    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), line2Paint);
    }
    for (double y = 0; y < size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), line2Paint);
    }

    // Draw streets (horizontal)
    final streets = [
      (0.18, 3.0), (0.32, 2.0), (0.48, 3.5), (0.62, 2.5),
      (0.75, 3.0), (0.88, 2.0),
    ];
    for (final (frac, width) in streets) {
      final y = size.height * frac;
      final road = Paint()
        ..color = c.mapRoad
        ..strokeWidth = width * 4;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), road);
      canvas.drawLine(Offset(0, y), Offset(size.width, y),
          linePaint..strokeWidth = 0.5);
    }

    // Draw streets (vertical)
    final vstreets = [
      (0.15, 2.5), (0.30, 3.0), (0.50, 4.0), (0.68, 2.5), (0.82, 3.0),
    ];
    for (final (frac, width) in vstreets) {
      final x = size.width * frac;
      final road = Paint()
        ..color = c.mapRoad
        ..strokeWidth = width * 4;
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), road);
      canvas.drawLine(Offset(x, 0), Offset(x, size.height),
          linePaint..strokeWidth = 0.5);
    }

    // Park blobs
    final parkPaint = Paint()..color = c.mapPark;
    final parks = [
      Rect.fromLTWH(size.width * 0.05, size.height * 0.22, 90, 70),
      Rect.fromLTWH(size.width * 0.55, size.height * 0.55, 120, 90),
      Rect.fromLTWH(size.width * 0.72, size.height * 0.15, 70, 55),
    ];
    for (final park in parks) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(park, const Radius.circular(8)),
        parkPaint,
      );
    }

    // Water
    final waterPaint = Paint()..color = c.mapWater;
    final waterPath = Path()
      ..moveTo(size.width * 0.0, size.height * 0.68)
      ..quadraticBezierTo(
          size.width * 0.25, size.height * 0.62, size.width * 0.5, size.height * 0.66)
      ..quadraticBezierTo(
          size.width * 0.75, size.height * 0.70, size.width * 1.0, size.height * 0.65)
      ..lineTo(size.width, size.height * 0.72)
      ..quadraticBezierTo(
          size.width * 0.75, size.height * 0.77, size.width * 0.5, size.height * 0.73)
      ..quadraticBezierTo(
          size.width * 0.25, size.height * 0.69, 0, size.height * 0.74)
      ..close();
    canvas.drawPath(waterPath, waterPaint);

    // Route line (from user location toward destination)
    final routePaint = Paint()
      ..color = c.primary.withValues(alpha: 0.7)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final routePath = Path()
      ..moveTo(size.width * 0.44, size.height * 0.36)
      ..lineTo(size.width * 0.44, size.height * 0.27)
      ..lineTo(size.width * 0.30, size.height * 0.27)
      ..lineTo(size.width * 0.30, size.height * 0.14);

    final dashPaint = Paint()
      ..color = c.primary.withValues(alpha: 0.6)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    _drawDashedPath(canvas, routePath, dashPaint, dashLen: 8, gapLen: 5);

    // Destination pin
    final pinPaint = Paint()..color = c.primary;
    _drawPin(canvas, Offset(size.width * 0.30, size.height * 0.10), pinPaint, c);
  }

  void _drawDashedPath(Canvas canvas, Path path, Paint paint,
      {double dashLen = 10, double gapLen = 5}) {
    final metric = path.computeMetrics().first;
    double dist = 0;
    while (dist < metric.length) {
      final end = math.min(dist + dashLen, metric.length);
      canvas.drawPath(metric.extractPath(dist, end), paint);
      dist += dashLen + gapLen;
    }
  }

  void _drawPin(Canvas canvas, Offset center, Paint paint, AppColors c) {
    final circlePaint = Paint()..color = c.primary;
    canvas.drawCircle(center, 10, circlePaint);
    final innerPaint = Paint()..color = Colors.white;
    canvas.drawCircle(center, 4, innerPaint);
    canvas.drawCircle(
      Offset(center.dx, center.dy + 14),
      3,
      Paint()
        ..color = c.primary.withValues(alpha: 0.3)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
    );
  }

  @override
  bool shouldRepaint(_MapPainter old) => old.c != c;
}
