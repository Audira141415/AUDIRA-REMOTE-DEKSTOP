import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/model.dart';
import '../../models/platform_model.dart';

class SessionHudBar extends StatefulWidget {
  final FFI ffi;
  final VoidCallback onToggleWhiteboard;
  final VoidCallback onToggleDiagnostics;
  final bool isWhiteboardActive;
  final bool isDiagnosticsActive;
  final ValueChanged<Offset>? onDrag;

  const SessionHudBar({
    Key? key,
    required this.ffi,
    required this.onToggleWhiteboard,
    required this.onToggleDiagnostics,
    this.isWhiteboardActive = false,
    this.isDiagnosticsActive = false,
    this.onDrag,
  }) : super(key: key);

  @override
  State<SessionHudBar> createState() => _SessionHudBarState();
}

class _SessionHudBarState extends State<SessionHudBar> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget.ffi.qualityMonitorModel,
      child: Consumer<QualityMonitorModel>(
        builder: (context, qModel, _) {
          final data = qModel.data;
          final delayMs = int.tryParse(data.delay ?? '') ?? 0;
          final fps = data.fps ?? '60';

          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3.5),
            decoration: BoxDecoration(
              color: const Color(0xF20F172A),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: const Color(0xFF334155),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.35),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onPanUpdate: (details) => widget.onDrag?.call(details.delta),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag Handle: Geser HUD ke mana saja di layar
                  Tooltip(
                    message: 'Tahan & geser untuk memindahkan posisi',
                    child: MouseRegion(
                      cursor: SystemMouseCursors.move,
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onPanUpdate: (details) {
                          widget.onDrag?.call(details.delta);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 3),
                          margin: const EdgeInsets.only(right: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF334155), width: 0.8),
                          ),
                          child: const Icon(
                            Icons.drag_indicator_rounded,
                            size: 14,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Live Status Badge: Latency (Ping) & FPS - Klik untuk buka/tutup telemetri
                  Tooltip(
                    message: 'Klik untuk ${qModel.show ? "sembunyikan" : "tampilkan"} rincian telemetri',
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () async {
                        await bind.sessionToggleOption(
                            sessionId: widget.ffi.sessionId,
                            value: 'show-quality-monitor');
                        widget.ffi.qualityMonitorModel
                            .checkShowQualityMonitor(widget.ffi.sessionId);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: qModel.show ? const Color(0xFF334155) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: qModel.show ? const Color(0xFF00D2FF) : const Color(0xFF334155),
                            width: 0.8,
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
                            const SizedBox(width: 5),
                            Text(
                              '${delayMs}ms',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10.5,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '${fps}fps',
                              style: const TextStyle(
                                color: Color(0xFF38BDF8),
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 4),

                  // On-Screen Whiteboard Toggle (Fitur Anotasi Khusus)
                  _hudIconButton(
                    icon: Icons.draw_outlined,
                    tooltip: 'On-Screen Whiteboard / Anotasi',
                    isActive: widget.isWhiteboardActive,
                    activeColor: const Color(0xFFFF2A6D),
                    onTap: widget.onToggleWhiteboard,
                  ),

                  // Remote System Diagnostics Drawer
                  _hudIconButton(
                    icon: Icons.analytics_outlined,
                    tooltip: 'System Info & Diagnostics Drawer',
                    isActive: widget.isDiagnosticsActive,
                    activeColor: const Color(0xFF05D9E8),
                    onTap: widget.onToggleDiagnostics,
                  ),
                ],
              ),
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
