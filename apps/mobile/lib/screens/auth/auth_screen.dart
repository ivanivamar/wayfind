import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import '../../widgets/wf_brand.dart';
import '../../widgets/wf_form_field.dart';

class AuthScreen extends StatefulWidget {
  final bool isLogin;

  const AuthScreen({super.key, this.isLogin = true});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  late bool _isLogin;
  late final AnimationController _modeCtrl;
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _isLogin = widget.isLogin;
    _modeCtrl = AnimationController(vsync: this, duration: 280.ms);
  }

  @override
  void dispose() {
    _modeCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  void _toggleMode() {
    _modeCtrl.forward(from: 0);
    setState(() {
      _isLogin = !_isLogin;
      _emailCtrl.clear();
      _passwordCtrl.clear();
      _nameCtrl.clear();
    });
  }

  void _submit() {
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return Scaffold(
      backgroundColor: c.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              // Brand
              Padding(
                padding: const EdgeInsets.only(top: 72),
                child: Column(
                  children: [
                    const WfBrand(size: 30),
                    const SizedBox(height: 10),
                    Text(
                      'Find your way around the city.',
                      style: TextStyle(fontSize: 13, color: c.fg2),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: -0.05, end: 0, duration: 350.ms),

              const SizedBox(height: 48),

              // Form card
              AnimatedSwitcher(
                duration: 280.ms,
                transitionBuilder: (child, animation) => FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.04),
                      end: Offset.zero,
                    ).animate(animation),
                    child: child,
                  ),
                ),
                child: _buildForm(c, key: ValueKey(_isLogin)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildForm(AppColors c, {required Key key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _isLogin ? 'Welcome back' : 'Create your account',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: c.fg1,
            letterSpacing: -0.01,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _isLogin
              ? 'Sign in to keep your saved places.'
              : 'Save places, sync across devices.',
          style: TextStyle(fontSize: 13, color: c.fg2),
        ),
        const SizedBox(height: 22),

        // Name field (signup only)
        if (!_isLogin) ...[
          WfFormField(
            label: 'Full name',
            placeholder: 'Alex Martin',
            controller: _nameCtrl,
            prefixIcon: Icons.person_outline_rounded,
          )
              .animate()
              .fadeIn(duration: 250.ms)
              .slideY(begin: 0.04, end: 0),
          const SizedBox(height: 14),
        ],

        WfFormField(
          label: 'Email',
          placeholder: 'you@example.com',
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.mail_outline_rounded,
        )
            .animate(delay: 40.ms)
            .fadeIn(duration: 250.ms)
            .slideY(begin: 0.04, end: 0),

        const SizedBox(height: 14),

        WfFormField(
          label: 'Password',
          placeholder: '••••••••',
          controller: _passwordCtrl,
          obscureText: _obscurePassword,
          prefixIcon: Icons.lock_outline_rounded,
          suffix: GestureDetector(
            onTap: () => setState(() => _obscurePassword = !_obscurePassword),
            child: Icon(
              _obscurePassword
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 16,
              color: c.fg3,
            ),
          ),
        )
            .animate(delay: 80.ms)
            .fadeIn(duration: 250.ms)
            .slideY(begin: 0.04, end: 0),

        const SizedBox(height: 20),

        // Primary button
        _PrimaryButton(
          label: _isLogin ? 'Sign in' : 'Create account',
          onTap: _submit,
          color: c,
        )
            .animate(delay: 120.ms)
            .fadeIn(duration: 250.ms)
            .slideY(begin: 0.04, end: 0),

        const SizedBox(height: 18),

        // Divider
        Row(
          children: [
            Expanded(child: Divider(color: c.border, thickness: 1)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Text(
                'or',
                style: TextStyle(
                  fontSize: 11,
                  color: c.fg3,
                  letterSpacing: 0.06,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Expanded(child: Divider(color: c.border, thickness: 1)),
          ],
        )
            .animate(delay: 150.ms)
            .fadeIn(duration: 200.ms),

        const SizedBox(height: 14),

        _GoogleButton(
          label: _isLogin ? 'Continue with Google' : 'Sign up with Google',
          color: c,
        )
            .animate(delay: 180.ms)
            .fadeIn(duration: 250.ms)
            .slideY(begin: 0.03, end: 0),

        const SizedBox(height: 24),

        // Toggle link
        Center(
          child: GestureDetector(
            onTap: _toggleMode,
            child: RichText(
              text: TextSpan(
                style: TextStyle(fontSize: 13, color: c.fg2),
                children: [
                  TextSpan(
                    text: _isLogin
                        ? "Don't have an account? "
                        : 'Already have an account? ',
                  ),
                  TextSpan(
                    text: _isLogin ? 'Sign up' : 'Sign in',
                    style: TextStyle(
                      color: c.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        )
            .animate(delay: 200.ms)
            .fadeIn(duration: 250.ms),

        const SizedBox(height: 40),
      ],
    );
  }
}

class _PrimaryButton extends StatefulWidget {
  final String label;
  final VoidCallback onTap;
  final AppColors color;

  const _PrimaryButton({
    required this.label,
    required this.onTap,
    required this.color,
  });

  @override
  State<_PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<_PrimaryButton>
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
    final c = widget.color;
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
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: c.primaryRing,
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Text(
            widget.label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class _GoogleButton extends StatefulWidget {
  final String label;
  final AppColors color;

  const _GoogleButton({required this.label, required this.color});

  @override
  State<_GoogleButton> createState() => _GoogleButtonState();
}

class _GoogleButtonState extends State<_GoogleButton>
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
    final c = widget.color;
    return GestureDetector(
      onTapDown: (_) => _pressCtrl.animateTo(0.97),
      onTapUp: (_) => _pressCtrl.animateTo(1.0),
      onTapCancel: () => _pressCtrl.animateTo(1.0),
      child: ScaleTransition(
        scale: _pressCtrl,
        child: Container(
          width: double.infinity,
          height: 46,
          decoration: BoxDecoration(
            color: c.surfaceCard,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: c.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _GoogleLogo(),
              const SizedBox(width: 10),
              Text(
                widget.label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: c.fg1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GoogleLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      height: 18,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paths = [
      (
        'M${size.width} ${size.height * 0.51}C${size.width} ${size.height * 0.47} ${size.width * 0.97} ${size.height * 0.44} ${size.width * 0.94} ${size.height * 0.41}H${size.width * 0.5}V${size.height * 0.6}H${size.width * 0.75}C${size.width * 0.73} ${size.height * 0.66} ${size.width * 0.69} ${size.height * 0.71} ${size.width * 0.63} ${size.height * 0.74}V${size.height * 0.86}H${size.width * 0.79}C${size.width * 0.9} ${size.height * 0.76} ${size.width} ${size.height * 0.65} ${size.width} ${size.height * 0.51}Z',
        const Color(0xFF4285F4),
      ),
    ];

    // Simplified Google G icon using circles
    final paint = Paint()..style = PaintingStyle.fill;
    final center = Offset(size.width / 2, size.height / 2);
    final r = size.width / 2;

    // Blue arc
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(
        Rect.fromCircle(center: center, radius: r),
        -0.5,
        2.0,
        false,
        paint..style = PaintingStyle.stroke..strokeWidth = r * 0.38);

    // Red arc
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(
        Rect.fromCircle(center: center, radius: r),
        -2.8,
        1.5,
        false,
        paint);

    // Yellow arc
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(
        Rect.fromCircle(center: center, radius: r),
        2.8,
        0.85,
        false,
        paint);

    // Green arc
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(
        Rect.fromCircle(center: center, radius: r),
        1.57,
        1.4,
        false,
        paint);

    // White fill center
    canvas.drawCircle(center, r * 0.52, Paint()..color = Colors.white);

    // Horizontal bar of G
    paint
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromLTWH(
          center.dx, center.dy - r * 0.15, r * 0.9, r * 0.3),
      paint,
    );
  }

  @override
  bool shouldRepaint(_) => false;
}
