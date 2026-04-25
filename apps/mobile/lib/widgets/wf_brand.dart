import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_colors.dart';

class WfBrand extends StatelessWidget {
  final double size;

  const WfBrand({super.key, this.size = 28});

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _BrandLogo(size: size, color: c.primary)
            .animate()
            .scale(
              begin: const Offset(0.7, 0.7),
              duration: 400.ms,
              curve: Curves.elasticOut,
            )
            .fadeIn(duration: 300.ms),
        const SizedBox(width: 10),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'way',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: size * 0.78,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.02,
                  color: c.fg1,
                ),
              ),
              TextSpan(
                text: 'find',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: size * 0.78,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.02,
                  color: c.primary,
                ),
              ),
            ],
          ),
        )
            .animate()
            .fadeIn(duration: 350.ms, delay: 100.ms)
            .slideX(begin: -0.04),
      ],
    );
  }
}

class _BrandLogo extends StatelessWidget {
  final double size;
  final Color color;

  const _BrandLogo({required this.size, required this.color});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _BrandLogoPainter(color),
    );
  }
}

class _BrandLogoPainter extends CustomPainter {
  final Color color;
  _BrandLogoPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final circlePaint = Paint()..color = color;
    final center = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(center, size.width / 2, circlePaint);

    final arrowPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(size.width * 0.34, size.height * 0.66)
      ..lineTo(size.width * 0.50, size.height * 0.28)
      ..lineTo(size.width * 0.66, size.height * 0.66)
      ..lineTo(size.width * 0.50, size.height * 0.56)
      ..close();

    canvas.drawPath(path, arrowPaint);
  }

  @override
  bool shouldRepaint(_BrandLogoPainter old) => old.color != color;
}
