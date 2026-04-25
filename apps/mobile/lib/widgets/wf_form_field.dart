import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class WfFormField extends StatefulWidget {
  final String label;
  final String placeholder;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final IconData? prefixIcon;
  final Widget? suffix;
  final String? error;
  final bool autofocus;

  const WfFormField({
    super.key,
    required this.label,
    required this.placeholder,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.prefixIcon,
    this.suffix,
    this.error,
    this.autofocus = false,
  });

  @override
  State<WfFormField> createState() => _WfFormFieldState();
}

class _WfFormFieldState extends State<WfFormField>
    with SingleTickerProviderStateMixin {
  late final AnimationController _focusCtrl;
  late final Animation<double> _focusAnim;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _focusCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 160),
    );
    _focusAnim = CurvedAnimation(parent: _focusCtrl, curve: Curves.easeOut);
    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        _focusCtrl.forward();
      } else {
        _focusCtrl.reverse();
      }
      setState(() {});
    });
  }

  @override
  void dispose() {
    _focusCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final isFocused = _focusNode.hasFocus;
    final hasError = widget.error != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: c.fg1,
          ),
        ),
        const SizedBox(height: 6),
        AnimatedBuilder(
          animation: _focusAnim,
          builder: (context, child) {
            final borderColor = hasError
                ? c.danger
                : Color.lerp(c.border, c.primary, _focusAnim.value)!;
            final ringOpacity = _focusAnim.value * 0.18;

            return Container(
              height: 46,
              decoration: BoxDecoration(
                color: c.surfaceCard,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: borderColor),
                boxShadow: isFocused
                    ? [
                        BoxShadow(
                          color: c.primary.withValues(alpha: ringOpacity),
                          blurRadius: 0,
                          spreadRadius: 3,
                        ),
                      ]
                    : null,
              ),
              child: child,
            );
          },
          child: Row(
            children: [
              if (widget.prefixIcon != null) ...[
                const SizedBox(width: 12),
                AnimatedBuilder(
                  animation: _focusAnim,
                  builder: (context, _) => Icon(
                    widget.prefixIcon,
                    size: 16,
                    color: Color.lerp(c.fg3, c.primary, _focusAnim.value),
                  ),
                ),
                const SizedBox(width: 8),
              ] else
                const SizedBox(width: 14),
              Expanded(
                child: TextField(
                  controller: widget.controller,
                  focusNode: _focusNode,
                  obscureText: widget.obscureText,
                  keyboardType: widget.keyboardType,
                  autofocus: widget.autofocus,
                  style: TextStyle(fontSize: 14, color: c.fg1),
                  decoration: InputDecoration(
                    hintText: widget.placeholder,
                    hintStyle: TextStyle(fontSize: 14, color: c.fg3),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (widget.suffix != null) ...[
                widget.suffix!,
                const SizedBox(width: 12),
              ] else
                const SizedBox(width: 14),
            ],
          ),
        ),
        if (widget.error != null) ...[
          const SizedBox(height: 4),
          Text(
            widget.error!,
            style: TextStyle(fontSize: 11, color: c.danger),
          ),
        ],
      ],
    );
  }
}
