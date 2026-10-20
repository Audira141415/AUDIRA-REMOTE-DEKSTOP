import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/model.dart';
import '../../models/platform_model.dart';

class SessionHudBar extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: ffi.qualityMonitorModel,
      child: Consumer<QualityMonitorModel>(
        builder: (context, qModel, _) {
          final data = qModel.data;
          final delayMs = int.tryParse(data.delay ?? '') ?? 0;
          final fps = data.fps ?? '60';

          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xE614141E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x33FFFFFF), width: 0.8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Live Status Badge: Latency
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0x33000000),
                    borderRadius: BorderRadius.circular(10),
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
                              ? const Color(0xFF00FF66)
                              : (delayMs < 120 ? Colors.amberAccent : Colors.redAccent),
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
                          color: Colors.white70,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),

                // Quick Whiteboard Toggle
                _hudIconButton(
                  icon: Icons.draw_outlined,
                  tooltip: 'On-Screen Whiteboard / Anotasi',
                  isActive: isWhiteboardActive,
                  activeColor: const Color(0xFFFF2A6D),
                  onTap: onToggleWhiteboard,
                ),

                // Quick System Diagnostics Toggle
                _hudIconButton(
                  icon: Icons.analytics_outlined,
                  tooltip: 'System Info & Diagnostics',
                  isActive: isDiagnosticsActive,
                  activeColor: const Color(0xFF05D9E8),
                  onTap: onToggleDiagnostics,
                ),

                // Quick Ctrl+Alt+Del
                _hudIconButton(
                  icon: Icons.keyboard_command_key,
                  tooltip: 'Kirim Ctrl + Alt + Delete',
                  onTap: () {
                    bind.sessionCtrlAltDel(sessionId: ffi.sessionId);
                  },
                ),
              ],
            ),
          );
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
            color: isActive ? activeColor.withValues(alpha: 0.25) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            size: 14,
            color: isActive ? activeColor : Colors.white70,
          ),
        ),
      ),
    );
  }
}
