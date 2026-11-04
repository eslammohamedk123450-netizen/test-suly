import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// A compact geometric S mark drawn as vector paths, so it stays crisp at
/// every size and does not depend on a raster logo asset.
class SulyBrandMark extends StatelessWidget {
  const SulyBrandMark({super.key, this.size = 48});

  final double size;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: AppColors.surfaceSecondary,
          borderRadius: BorderRadius.circular(size * 0.28),
          border: Border.all(
            color: AppColors.primaryGold.withValues(alpha: 0.34),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryGold.withValues(alpha: 0.08),
              blurRadius: size * 0.35,
              spreadRadius: 0.5,
            ),
          ],
        ),
        padding: EdgeInsets.all(size * 0.22),
        child: CustomPaint(painter: _SulyMarkPainter()),
      );
}

class _SulyMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(size.width * 0.78, size.height * 0.22)
      ..lineTo(size.width * 0.39, size.height * 0.22)
      ..cubicTo(
        size.width * 0.15,
        size.height * 0.22,
        size.width * 0.13,
        size.height * 0.46,
        size.width * 0.38,
        size.height * 0.49,
      )
      ..lineTo(size.width * 0.63, size.height * 0.52)
      ..cubicTo(
        size.width * 0.89,
        size.height * 0.55,
        size.width * 0.86,
        size.height * 0.79,
        size.width * 0.61,
        size.height * 0.79,
      )
      ..lineTo(size.width * 0.22, size.height * 0.79);

    final paint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color(0xFFF1D27A),
          AppColors.primaryGold,
          AppColors.secondaryGold
        ],
      ).createShader(Offset.zero & size)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.shortestSide * 0.09
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _SulyMarkPainter oldDelegate) => false;
}

class BrandMarkPreview extends StatelessWidget {
  const BrandMarkPreview({super.key});

  @override
  Widget build(BuildContext context) =>
      const SulyBrandMark(size: AppSpacing.xxl);
}
