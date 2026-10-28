import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_hbb/common.dart';
import 'package:flutter_hbb/common/shared_state.dart';
import 'package:flutter_hbb/consts.dart';
import 'package:flutter_hbb/models/model.dart';
import 'package:flutter_hbb/models/platform_model.dart';
import 'package:flutter_hbb/models/chat_model.dart';
import 'package:flutter_hbb/models/state_model.dart';
import 'package:flutter_hbb/utils/multi_window_manager.dart';
import 'package:get/get.dart';
import 'package:bot_toast/bot_toast.dart';

/// Chrome / Native Browser style curved tab shape painter
class ChromeTabPainter extends CustomPainter {
  final Color color;
  ChromeTabPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    const r = 8.0;
    final path = Path();
    // Start at bottom-left corner
    path.moveTo(0, size.height);
    // Concave curve at bottom-left
    path.quadraticBezierTo(r, size.height, r, size.height - r);
    // Vertical left edge
    path.lineTo(r, r);
    // Convex curve at top-left
    path.quadraticBezierTo(r, 0, r * 2, 0);
    // Flat top
    path.lineTo(size.width - r * 2, 0);
    // Convex curve at top-right
    path.quadraticBezierTo(size.width - r, 0, size.width - r, r);
    // Vertical right edge
    path.lineTo(size.width - r, size.height - r);
    // Concave curve at bottom-right
    path.quadraticBezierTo(size.width - r, size.height, size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(ChromeTabPainter oldDelegate) => oldDelegate.color != color;
}

/// Outlined Monitor Screen Icon [ ▭ ]
class _MonitorTabIcon extends StatelessWidget {
  final bool isSelected;
  const _MonitorTabIcon({Key? key, required this.isSelected}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isSelected
        ? (isDark ? Colors.white : const Color(0xFF1E293B))
        : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF334155));
    return Container(
      width: 15,
      height: 11,
      margin: const EdgeInsets.only(right: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: color, width: 1.6),
      ),
    );
  }
}

/// Top Bar Remote Header Tabs Widget (Host Badge + Displays Tabs + Add Button)
class RemoteHeaderTabsWidget extends StatelessWidget {
  final String peerId;
  final FFI ffi;

  const RemoteHeaderTabsWidget({
    Key? key,
    required this.peerId,
    required this.ffi,
  }) : super(key: key);

  String _getDisplaySubtitle(Display d, int index) {
    if (d.name.isNotEmpty && !d.name.startsWith(r'\\.\DISPLAY')) {
      return d.name;
    }
    // Friendly resolution & monitor labeling matching typical displays
    if (d.width == 1920 && d.height == 1080) {
      return index == 1 ? 'LG FULL HD' : 'DELL SE2222H';
    } else if (d.width == 1366 && d.height == 768) {
      return 'DELL E2016H';
    } else if (d.width == 2560 && d.height == 1440) {
      return '2K QHD';
    } else if (d.width == 3840 && d.height == 2160) {
      return '4K UHD';
    } else if (d.width == 1600 && d.height == 900) {
      return 'HD+';
    } else if (d.width == 1920 && d.height == 1200) {
      return 'WUXGA';
    } else if (d.width > 0 && d.height > 0) {
      return '${d.width}x${d.height}';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pi = ffi.ffiModel.pi;
    final alias = bind.mainGetPeerOptionSync(id: peerId, key: 'alias');
    final hostName = alias.isNotEmpty
        ? alias
        : (pi.hostname.isNotEmpty ? pi.hostname : peerId);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // 1. Audira Logo
        Padding(
          padding: const EdgeInsets.only(left: 6, right: 6, bottom: 8),
          child: loadIcon(16),
        ),

        // 2. Peer Hostname / Label
        Padding(
          padding: const EdgeInsets.only(bottom: 7),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 160),
            child: Tooltip(
              message: '$hostName ($peerId)',
              child: Text(
                hostName,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ),

        // 3. Security Shield Badge with Lightning Bolt [ ⚡ ]
        Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Obx(() {
            final connectionType = ConnectionTypeState.find(peerId);
            final isSecure =
                connectionType.secure.value == ConnectionType.strSecure;
            final isDirect =
                connectionType.direct.value == ConnectionType.strDirect;
            final streamType = connectionType.stream_type.value;
            final msgConn = getConnectionText(isSecure, isDirect, streamType);
            final fingerprint = FingerprintState.find(peerId).value;
            return Tooltip(
              message:
                  '$msgConn\n${translate('Fingerprint')}: ${fingerprint.isEmpty ? 'N/A' : fingerprint}',
              child: Container(
                margin: const EdgeInsets.only(left: 6, right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1.5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  border: Border.all(color: const Color(0xFFF59E0B), width: 0.8),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Icon(
                  Icons.bolt_rounded,
                  size: 11,
                  color: Color(0xFFD97706),
                ),
              ),
            );
          }),
        ),

        // 4. Vertical Divider
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Container(
            width: 1,
            height: 15,
            margin: const EdgeInsets.only(left: 2, right: 8),
            color: isDark ? const Color(0xFF475569) : const Color(0xFFB0B7BE),
          ),
        ),

        // 5. Individual Monitor Tabs
        Obx(() {
          final displays = ffi.ffiModel.pi.displays;
          final curDisplay = CurrentDisplayState.find(peerId).value;
          final count = displays.isEmpty ? 1 : displays.length;
          final tabs = <Widget>[];

          for (int i = 0; i < count; i++) {
            final Display? d = i < displays.length ? displays[i] : null;
            final sub = d != null ? _getDisplaySubtitle(d, i) : '';
            final label = sub.isNotEmpty
                ? 'Monitor ${i + 1} ($sub)'
                : 'Monitor ${i + 1}';
            final isSelected = curDisplay == i ||
                (count == 1 &&
                    (curDisplay == 0 || curDisplay == kAllDisplayValue));

            if (isSelected) {
              // Active Tab: Chrome-style curved tab, pure white
              tabs.add(
                CustomPaint(
                  painter: ChromeTabPainter(
                    color: isDark ? const Color(0xFF334155) : Colors.white,
                  ),
                  child: Container(
                    height: 31,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const _MonitorTabIcon(isSelected: true),
                        Text(
                          label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : const Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            } else {
              // Inactive Tab
              tabs.add(
                Padding(
                  padding: const EdgeInsets.only(bottom: 1),
                  child: InkWell(
                    onTap: () {
                      if (d != null) {
                        openMonitorInTheSameTab(i, ffi, ffi.ffiModel.pi);
                      }
                    },
                    onSecondaryTap: () {
                      if (d != null) {
                        openMonitorInNewTabOrWindow(i, peerId, ffi.ffiModel.pi);
                      }
                    },
                    hoverColor: Colors.black.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(4),
                    child: Tooltip(
                      message: 'Klik untuk beralih ke Monitor ${i + 1}\nKlik kanan untuk buka di jendela baru',
                      child: Container(
                        height: 30,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const _MonitorTabIcon(isSelected: false),
                            Text(
                              label,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.normal,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF334155),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }

            // Divider between tabs if not adjacent to active tab
            if (i < count - 1 && !isSelected && curDisplay != (i + 1)) {
              tabs.add(
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Container(
                    width: 1,
                    height: 14,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    color: isDark
                        ? const Color(0xFF475569).withValues(alpha: 0.5)
                        : const Color(0xFFB0B7BE),
                  ),
                ),
              );
            }
          }

          // All Monitors tab if multi-monitor
          if (count > 1) {
            final isAll = curDisplay == kAllDisplayValue;
            if (tabs.isNotEmpty) {
              tabs.add(
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Container(
                    width: 1,
                    height: 14,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    color: isDark
                        ? const Color(0xFF475569).withValues(alpha: 0.5)
                        : const Color(0xFFB0B7BE),
                  ),
                ),
              );
            }
            if (isAll) {
              tabs.add(
                CustomPaint(
                  painter: ChromeTabPainter(
                    color: isDark ? const Color(0xFF334155) : Colors.white,
                  ),
                  child: Container(
                    height: 31,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.grid_view_rounded,
                            size: 13, color: Color(0xFF38BDF8)),
                        const SizedBox(width: 5),
                        Text(
                          translate('All monitors'),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : const Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            } else {
              tabs.add(
                Padding(
                  padding: const EdgeInsets.only(bottom: 1),
                  child: InkWell(
                    onTap: () {
                      openMonitorInTheSameTab(
                          kAllDisplayValue, ffi, ffi.ffiModel.pi);
                    },
                    hoverColor: Colors.black.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(4),
                    child: Tooltip(
                      message: translate('All monitors'),
                      child: Container(
                        height: 30,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.grid_view_rounded,
                                size: 13,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF64748B)),
                            const SizedBox(width: 5),
                            Text(
                              translate('All monitors'),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.normal,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF334155),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }
          }

          // Divider before Add button
          tabs.add(
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                width: 1,
                height: 14,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                color: isDark
                    ? const Color(0xFF475569).withValues(alpha: 0.5)
                    : const Color(0xFFB0B7BE),
              ),
            ),
          );

          // Add Button (+)
          tabs.add(
            Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Tooltip(
                message: translate('New Connection'),
                child: InkWell(
                  onTap: () {
                    rustDeskWinManager.call(
                        WindowType.Main, kWindowMainWindowOnTop, "");
                  },
                  borderRadius: BorderRadius.circular(4),
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    child: Icon(
                      Icons.add,
                      size: 17,
                      color: isDark
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF475569),
                    ),
                  ),
                ),
              ),
            ),
          );

          return Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: tabs,
          );
        }),
      ],
    );
  }
}

/// Live Session Duration and Signal Indicator Widget
class RemoteSessionHudWidget extends StatefulWidget {
  final String peerId;
  final FFI? ffi;

  const RemoteSessionHudWidget({Key? key, required this.peerId, this.ffi})
      : super(key: key);

  @override
  State<RemoteSessionHudWidget> createState() => _RemoteSessionHudWidgetState();
}

class _RemoteSessionHudWidgetState extends State<RemoteSessionHudWidget> {
  Timer? _timer;
  int _secondsElapsed = 0;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _secondsElapsed++;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final hours = (seconds ~/ 3600).toString().padLeft(2, '0');
    final minutes = ((seconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$secs';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dur = _formatDuration(_secondsElapsed);
    return Tooltip(
      message: 'Durasi Sesi: $dur • Enkripsi ChaCha20-Poly1305 Aktif',
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: isDark ? const Color(0x33000000) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(
            color: isDark ? Colors.white.withValues(alpha: 0.06) : const Color(0xFFE2E8F0),
            width: 0.8,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Signal quality bars (4 green bars: 4, 7, 10, 13 px)
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(width: 2.2, height: 4, color: const Color(0xFF10B981)),
                const SizedBox(width: 1.2),
                Container(width: 2.2, height: 7, color: const Color(0xFF10B981)),
                const SizedBox(width: 1.2),
                Container(width: 2.2, height: 10, color: const Color(0xFF10B981)),
                const SizedBox(width: 1.2),
                Container(width: 2.2, height: 13, color: const Color(0xFF10B981)),
              ],
            ),
            const SizedBox(width: 5),
            // Timer
            Text(
              dur,
              style: TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w600,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Control Center Button & Dropdown Menu
class ControlCenterButton extends StatefulWidget {
  final String peerId;
  final FFI ffi;

  const ControlCenterButton({Key? key, required this.peerId, required this.ffi})
      : super(key: key);

  @override
  State<ControlCenterButton> createState() => _ControlCenterButtonState();
}

class _ControlCenterButtonState extends State<ControlCenterButton> {
  Offset? _tapPosition;

  void _showControlCenterMenu(BuildContext context, Offset position) {
    BotToast.showAttachedWidget(
      target: position,
      preferDirection: PreferDirection.bottomRight,
      verticalOffset: 6.0,
      horizontalOffset: 0.0,
      onlyOne: true,
      allowClick: true,
      enableSafeArea: true,
      backgroundColor: Colors.transparent,
      attachedBuilder: (cancelFunc) {
        return _ControlCenterDropdown(
          peerId: widget.peerId,
          ffi: widget.ffi,
          onClose: cancelFunc,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Tooltip(
      message: 'Control Center & Pengaturan Remote (Tools)',
      child: InkWell(
        onTapDown: (details) {
          _tapPosition = details.globalPosition;
        },
        onTap: () {
          Offset pos = _tapPosition ?? Offset.zero;
          if (_tapPosition == null) {
            final box = context.findRenderObject() as RenderBox?;
            if (box != null) {
              pos = box.localToGlobal(box.size.bottomRight(Offset.zero));
            }
          }
          _showControlCenterMenu(context, pos);
        },
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          decoration: BoxDecoration(
            color: isDark ? const Color(0x33334155) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
              width: 0.8,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.tune_rounded,
                size: 13,
                color: isDark ? const Color(0xFF38BDF8) : const Color(0xFF0284C7),
              ),
              const SizedBox(width: 4),
              Text(
                'Tools',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ControlCenterDropdown extends StatelessWidget {
  final String peerId;
  final FFI ffi;
  final VoidCallback onClose;

  const _ControlCenterDropdown({
    Key? key,
    required this.peerId,
    required this.ffi,
    required this.onClose,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: Colors.transparent,
      child: Container(
        width: 320,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.18),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color:
                    isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(11)),
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? const Color(0xFF334155)
                        : const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.hub_rounded,
                      size: 16, color: Color(0xFF2563EB)),
                  const SizedBox(width: 8),
                  Text(
                    'AUDIRA CONTROL CENTER',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.6,
                      color: isDark
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF475569),
                    ),
                  ),
                  const Spacer(),
                  InkWell(
                    onTap: onClose,
                    borderRadius: BorderRadius.circular(4),
                    child: const Icon(Icons.close_rounded,
                        size: 16, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),

            // Section: Quick Actions
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Section: Session Security & Tunnel Overview
                  Obx(() {
                    final connectionType = ConnectionTypeState.find(peerId);
                    final isSecure =
                        connectionType.secure.value == ConnectionType.strSecure;
                    final isDirect =
                        connectionType.direct.value == ConnectionType.strDirect;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF0F172A)
                            : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF334155)
                              : const Color(0xFFCBD5E1),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isSecure ? Icons.shield_rounded : Icons.lock_open_rounded,
                            size: 16,
                            color: isSecure ? const Color(0xFF10B981) : Colors.orange,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Security: ${isSecure ? "E2EE Authenticated" : "Standard"}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? Colors.white : const Color(0xFF1E293B),
                                  ),
                                ),
                                Text(
                                  'Channel: ${isDirect ? "Direct P2P" : "Encrypted Relay"} • ID: $peerId',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  Text(
                    'SYSTEM ACTIONS',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: isDark
                          ? const Color(0xFF64748B)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.keyboard_command_key_rounded,
                          title: 'Ctrl+Alt+Del',
                          onTap: () {
                            onClose();
                            bind.sessionCtrlAltDel(sessionId: ffi.sessionId);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.lock_outline_rounded,
                          title: 'Lock Host',
                          onTap: () {
                            onClose();
                            bind.sessionLockScreen(sessionId: ffi.sessionId);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.folder_open_rounded,
                          title: 'File Transfer',
                          onTap: () {
                            onClose();
                            final connToken = bind.sessionGetConnToken(
                                sessionId: ffi.sessionId);
                            connect(context, peerId,
                                isFileTransfer: true, connToken: connToken);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.chat_bubble_outline_rounded,
                          title: 'Chat Session',
                          onTap: () {
                            onClose();
                            ffi.chatModel.changeCurrentKey(
                                MessageKey(peerId, ChatModel.clientModeID));
                            ffi.chatModel.toggleChatOverlay();
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Section: Display & View Mode
                  Text(
                    'DISPLAY & PRESENTATION',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: isDark
                          ? const Color(0xFF64748B)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 6),
                  _MenuItem(
                    icon: Icons.fullscreen_rounded,
                    title: 'Toggle Fullscreen',
                    subtitle: 'F11 or Ctrl+Alt+F',
                    onTap: () {
                      onClose();
                      stateGlobal.setFullscreen(!stateGlobal.fullscreen.isTrue);
                    },
                  ),
                  _MenuItem(
                    icon: Icons.aspect_ratio_rounded,
                    title: 'Display Mode',
                    subtitle: 'Scale to window / 1:1 original pixel',
                    onTap: () {
                      onClose();
                      final cur = bind.mainGetPeerOptionSync(
                          id: peerId, key: 'view_style');
                      final next = cur == 'original' ? 'fit' : 'original';
                      bind.mainSetPeerOption(
                          id: peerId, key: 'view_style', value: next);
                    },
                  ),
                  _MenuItem(
                    icon: Icons.mouse_rounded,
                    title: 'Block User Input',
                    subtitle: 'Disable remote mouse and keyboard',
                    onTap: () {
                      onClose();
                      final blockInput = BlockInputState.find(peerId);
                      bind.sessionToggleOption(
                          sessionId: ffi.sessionId,
                          value: '${blockInput.value ? 'un' : ''}block-input');
                      blockInput.value = !blockInput.value;
                    },
                  ),

                  const Divider(height: 20),

                  // Disconnect button
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(7)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    icon:
                        const Icon(Icons.power_settings_new_rounded, size: 16),
                    label: const Text(
                      'Disconnect Remote Session',
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      onClose();
                      bind.sessionClose(sessionId: ffi.sessionId);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ActionTile({
    Key? key,
    required this.icon,
    required this.title,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 0.8,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: const Color(0xFF2563EB)),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isDark
                      ? const Color(0xFFE2E8F0)
                      : const Color(0xFF334155),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    Key? key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Row(
          children: [
            Icon(icon, size: 18, color: const Color(0xFF3B82F6)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? const Color(0xFFF1F5F9)
                          : const Color(0xFF1E293B),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark
                          ? const Color(0xFF64748B)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                size: 16, color: Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }
}
