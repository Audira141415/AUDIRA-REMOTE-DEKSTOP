import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:get/get.dart';
import '../../common.dart';
import '../../models/model.dart';
import '../../models/platform_model.dart';
import '../../common/shared_state.dart';
import '../../common/widgets/toolbar.dart';

class SessionHudBar extends StatefulWidget {
  final FFI ffi;
  final VoidCallback onToggleWhiteboard;
  final VoidCallback onToggleDiagnostics;
  final bool isWhiteboardActive;
  final bool isDiagnosticsActive;

  const SessionHudBar({
    Key? key,
    required this.ffi,
    required this.onToggleWhiteboard,
    required this.onToggleDiagnostics,
    this.isWhiteboardActive = false,
    this.isDiagnosticsActive = false,
  }) : super(key: key);

  @override
  State<SessionHudBar> createState() => _SessionHudBarState();
}

class _SessionHudBarState extends State<SessionHudBar> {
  bool _isMuted = false;

  @override
  void initState() {
    super.initState();
    _checkAudioState();
  }

  void _checkAudioState() {
    final muted = bind.sessionGetToggleOptionSync(
            sessionId: widget.ffi.sessionId, arg: 'disable-audio') ==
        true;
    if (mounted && _isMuted != muted) {
      setState(() {
        _isMuted = muted;
      });
    }
  }

  void _toggleAudio() async {
    await bind.sessionToggleOption(
        sessionId: widget.ffi.sessionId, value: 'disable-audio');
    final nextMuted = !_isMuted;
    if (mounted) {
      setState(() {
        _isMuted = nextMuted;
      });
      showToast(nextMuted
          ? 'Audio host dimatikan (Muted)'
          : 'Audio host diaktifkan (Unmuted)');
    }
  }

  void _togglePrivacyMode(RxString privacyModeState) async {
    final currentActive = privacyModeState.value.isNotEmpty;
    await bind.sessionToggleOption(
        sessionId: widget.ffi.sessionId, value: 'privacy-mode');
    togglePrivacyModeTime = DateTime.now();

    if (!currentActive) {
      showToast('🔒 Privacy Mode Aktif: Layar fisik PC target telah dimatikan');
    } else {
      showToast('🔓 Privacy Mode Nonaktif: Layar fisik PC target menyala normal');
    }
  }

  @override
  Widget build(BuildContext context) {
    final privacyModeState = PrivacyModeState.find(widget.ffi.id);

    return ChangeNotifierProvider.value(
      value: widget.ffi.qualityMonitorModel,
      child: Consumer<QualityMonitorModel>(
        builder: (context, qModel, _) {
          final data = qModel.data;
          final delayMs = int.tryParse(data.delay ?? '') ?? 0;
          final fps = data.fps ?? '60';
          final speed = data.speed ?? '';

          return Obx(() {
            final isPrivacyActive = privacyModeState.value.isNotEmpty;

            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
              decoration: BoxDecoration(
                color: const Color(0xE60F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isPrivacyActive
                      ? const Color(0xFF8B5CF6).withValues(alpha: 0.6)
                      : const Color(0xFF334155),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isPrivacyActive
                        ? const Color(0xFF8B5CF6).withValues(alpha: 0.25)
                        : Colors.black.withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Live Status Badge: Latency (Ping)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: const Color(0xFF334155),
                        width: 0.6,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: delayMs < 60
                                ? const Color(0xFF10B981)
                                : (delayMs < 120
                                    ? const Color(0xFFF59E0B)
                                    : const Color(0xFFEF4444)),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${delayMs}ms',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '${fps}fps',
                          style: const TextStyle(
                            color: Color(0xFF38BDF8),
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            fontFamily: 'monospace',
                          ),
                        ),
                        if (speed.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Text(
                            speed,
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 9.5,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Privacy Mode Quick Toggle (Blank Screen Target)
                  _hudIconButton(
                    icon: isPrivacyActive
                        ? Icons.shield_rounded
                        : Icons.shield_outlined,
                    tooltip: isPrivacyActive
                        ? 'Privacy Mode Aktif (Layar Target Dimatikan) - Klik untuk membuka'
                        : 'Aktifkan Privacy Mode (Matikan Layar Target)',
                    isActive: isPrivacyActive,
                    activeColor: const Color(0xFF8B5CF6),
                    onTap: () => _togglePrivacyMode(privacyModeState),
                  ),

                  // Quick Remote Audio Mute/Unmute Toggle
                  _hudIconButton(
                    icon: _isMuted
                        ? Icons.volume_off_rounded
                        : Icons.volume_up_rounded,
                    tooltip: _isMuted
                        ? 'Audio Host Dibisukan (Muted) - Klik untuk mengaktifkan'
                        : 'Bisukan Audio Host (Mute)',
                    isActive: _isMuted,
                    activeColor: const Color(0xFFEF4444),
                    onTap: _toggleAudio,
                  ),

                  // Quick Whiteboard Toggle
                  _hudIconButton(
                    icon: Icons.draw_outlined,
                    tooltip: 'On-Screen Whiteboard / Anotasi',
                    isActive: widget.isWhiteboardActive,
                    activeColor: const Color(0xFFFF2A6D),
                    onTap: widget.onToggleWhiteboard,
                  ),

                  // Quick System Diagnostics Toggle
                  _hudIconButton(
                    icon: Icons.analytics_outlined,
                    tooltip: 'System Info & Diagnostics Drawer',
                    isActive: widget.isDiagnosticsActive,
                    activeColor: const Color(0xFF05D9E8),
                    onTap: widget.onToggleDiagnostics,
                  ),

                  // Quick Ctrl+Alt+Del
                  _hudIconButton(
                    icon: Icons.keyboard_command_key,
                    tooltip: 'Kirim Ctrl + Alt + Delete ke PC Target',
                    onTap: () {
                      bind.sessionCtrlAltDel(sessionId: widget.ffi.sessionId);
                      showToast('Ctrl + Alt + Delete dikirim ke remote target');
                    },
                  ),
                ],
              ),
            );
          });
        },
      ),
    );
  }

  Widget _hudIconButton({
    required IconData icon,
    required String tooltip,
    required VoidCallback onTap,
    bool isActive = false,
    Color activeColor = const Color(0xFF05D9E8),
  }) {
    return Tooltip(
      message: tooltip,
      waitDuration: const Duration(milliseconds: 300),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(4),
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: isActive
                ? activeColor.withValues(alpha: 0.25)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isActive
                  ? activeColor.withValues(alpha: 0.6)
                  : Colors.transparent,
              width: 0.8,
            ),
          ),
          child: Icon(
            icon,
            size: 14.5,
            color: isActive ? activeColor : const Color(0xFF94A3B8),
          ),
        ),
      ),
    );
  }
}
