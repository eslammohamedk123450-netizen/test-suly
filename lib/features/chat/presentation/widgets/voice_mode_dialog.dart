import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// نافذة الوضع الصوتي المتقدم (Advanced Voice Mode)
class VoiceModeDialog extends StatefulWidget {
  const VoiceModeDialog({
    super.key,
    required this.onClose,
    this.isRtl = true,
  });

  final VoidCallback onClose;
  final bool isRtl;

  @override
  State<VoiceModeDialog> createState() => _VoiceModeDialogState();
}

class _VoiceModeDialogState extends State<VoiceModeDialog> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  bool _isMuted = false;
  String _currentVoice = 'Juniper';
  String _status = 'Listening...';

  final List<String> _voices = ['Breeze', 'Cove', 'Ember', 'Juniper', 'Sky'];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _status = widget.isRtl ? 'جاري الاستماع إليك...' : 'Listening...';
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF121212),
      insetPadding: const EdgeInsets.all(20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Container(
        width: 440,
        height: 520,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          children: [
            // Top Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                DropdownButton<String>(
                  value: _currentVoice,
                  dropdownColor: const Color(0xFF242424),
                  underline: const SizedBox.shrink(),
                  icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white70, size: 18),
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                  items: _voices
                      .map((v) => DropdownMenuItem(value: v, child: Text('Voice: $v')))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _currentVoice = v);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70),
                  onPressed: widget.onClose,
                ),
              ],
            ),

            const Spacer(),

            // Animated Voice Orb
            AnimatedBuilder(
              animation: _animController,
              builder: (context, child) {
                final scale = 1.0 + (_animController.value * 0.15);
                return Transform.scale(
                  scale: scale,
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.primaryGold,
                          const Color(0xFF3B82F6),
                          const Color(0xFF10A37F).withValues(alpha: 0.2),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryGold.withValues(alpha: 0.45 * _animController.value),
                          blurRadius: 40 + (20 * _animController.value),
                          spreadRadius: 8 * _animController.value,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 36),

            // Status message
            Text(
              _isMuted
                  ? (widget.isRtl ? 'الميكروفون مكتوم' : 'Microphone Muted')
                  : _status,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              widget.isRtl
                  ? 'تحدث بشكل طبيعي كما لو كنت تتحدث مع إنسان'
              : 'Speak naturally to interact in real-time',
              style: const TextStyle(color: Colors.white54, fontSize: 12),
            ),

            const Spacer(),

            // Bottom Controls
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Mic toggle
                IconButton(
                  iconSize: 28,
                  icon: Icon(
                    _isMuted ? Icons.mic_off : Icons.mic,
                    color: _isMuted ? AppColors.error : Colors.white,
                  ),
                  onPressed: () {
                    setState(() => _isMuted = !_isMuted);
                  },
                ),
                const SizedBox(width: 32),
                // End Call button
                FloatingActionButton(
                  backgroundColor: AppColors.error,
                  foregroundColor: Colors.white,
                  onPressed: widget.onClose,
                  child: const Icon(Icons.call_end),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}
