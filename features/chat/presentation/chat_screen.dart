import 'package:flutter/material.dart';

/// Shared icon-button building block kept for the original feature draft.
/// The production chat screen lives under lib/features/chat.
class _IconButton extends StatelessWidget {
  const _IconButton({
    required this.icon,
    required this.onPressed,
    required this.tooltip,
    required this.isPrimary,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon),
      onPressed: onPressed,
      tooltip: tooltip,
    );
  }
}
