import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_hbb/common.dart';
import 'package:flutter_hbb/common/shared_state.dart';
import 'package:flutter_hbb/consts.dart';
import 'package:flutter_hbb/models/model.dart';
import 'package:flutter_hbb/models/platform_model.dart';
import 'package:flutter_hbb/models/chat_model.dart';
import 'package:flutter_hbb/utils/multi_window_manager.dart';
import 'package:get/get.dart';
import 'package:window_manager/window_manager.dart';
import 'package:bot_toast/bot_toast.dart';

/// Top Bar Remote Header Tabs Widget (Host Badge + Displays Tabs + Add Button)
class RemoteHeaderTabsWidget extends StatelessWidget {
  final String peerId;
  final FFI ffi;

  const RemoteHeaderTabsWidget({
    Key? key,
    required this.peerId,
    required this.ffi,
  }) : super(key: key);

  String _getDisplaySubtitle(Display d) {
    if (d.name.isNotEmpty) {
      return d.name;
    }
    if (d.width == 1920 && d.height == 1080) {
      return 'LG FULL HD';
    } else if (d.width == 2560 && d.height == 1440) {
      return '2K QHD';
    } else if (d.width == 3840 && d.height == 2160) {
      return '4K UHD';
    } else if (d.width == 1366 && d.height == 768) {
      return 'DELL E2016H';
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
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // 1. Audira Logo
        Padding(
          padding: const EdgeInsets.only(left: 4, right: 6),
          child: loadIcon(16),
        ),

        // 2. Peer Hostname / Label
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 160),
          child: Tooltip(
            message: '$hostName ($peerId)',
            child: Text(
              hostName,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B),
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),

        // 3. Security Shield Badge
        Obx(() {
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
              margin: const EdgeInsets.only(left: 5, right: 8),
              padding: const EdgeInsets.all(2.5),
              decoration: BoxDecoration(
                color: isSecure
                    ? const Color(0xFFFEF3C7)
                    : const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Icon(
                isSecure ? Icons.shield_rounded : Icons.gpp_maybe_rounded,
                size: 13,
                color: isSecure
                    ? const Color(0xFFD97706)
                    : const Color(0xFFDC2626),
              ),
            ),
          );
        }),

        // 4. Vertical Divider
        Container(
          width: 1,
          height: 16,
          margin: const EdgeInsets.only(left: 2, right: 6),
          color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
        ),

        // 5. Individual Monitor Tabs
        Obx(() {
          final displays = ffi.ffiModel.pi.displays;
          final curDisplay = CurrentDisplayState.find(peerId).value;
          final count = displays.isEmpty ? 1 : displays.length;
          final tabs = <Widget>[];

          for (int i = 0; i < count; i++) {
            final Display? d = i < displays.length ? displays[i] : null;
            final sub = d != null ? _getDisplaySubtitle(d) : '';
            final label = sub.isNotEmpty
                ? 'Monitor ${i + 1} ($sub)'
                : 'Monitor ${i + 1}';
            final isSelected = curDisplay == i ||
                (count == 1 &&
                    (curDisplay == 0 || curDisplay == kAllDisplayValue));

            if (isSelected) {
              // Active Tab: Curved top corners, bright background
              tabs.add(
                Container(
                  height: 31,
                  margin: const EdgeInsets.only(right: 2),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF334155) : Colors.white,
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(8)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 3,
                        offset: const Offset(0, -1),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.crop_landscape_rounded,
                        size: 14,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            } else {
              // Inactive Tab
              tabs.add(
                InkWell(
                  onTap: () {
                    if (d != null) {
                      openMonitorInTheSameTab(i, ffi, ffi.ffiModel.pi);
                    }
                  },
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(6)),
                  child: Container(
                    height: 31,
                    padding: const EdgeInsets.symmetric(horizontal: 11),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.crop_landscape_rounded,
                          size: 14,
                          color: isDark
                              ? const Color(0xFF94A3B8)
                              : const Color(0xFF64748B),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          label,
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                            color: isDark
                                ? const Color(0xFF94A3B8)
                                : const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }

            // Divider between tabs if not adjacent to active tab
            if (i < count - 1 && !isSelected && curDisplay != (i + 1)) {
              tabs.add(
                Container(
                  width: 1,
                  height: 12,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  color: isDark
                      ? const Color(0xFF475569).withOpacity(0.5)
                      : const Color(0xFFCBD5E1),
                ),
              );
            }
          }

          // Divider before Add button
          tabs.add(
            Container(
              width: 1,
              height: 14,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              color: isDark
                  ? const Color(0xFF475569).withOpacity(0.5)
                  : const Color(0xFFCBD5E1),
            ),
          );

          // Add Button (+)
          tabs.add(
            Tooltip(
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
                    Icons.add_rounded,
                    size: 16,
                    color: isDark
                        ? const Color(0xFF94A3B8)
                        : const Color(0xFF64748B),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      margin: const EdgeInsets.only(right: 6),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.04),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Signal quality bars (Green 4 bars)
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
          const SizedBox(width: 6),
          // Timer
          Text(
            _formatDuration(_secondsElapsed),
            style: const TextStyle(
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: FontWeight.w600,
              color: Color(0xFF475569),
            ),
          ),
        ],
      ),
    );
  }
}

/// Control Center Button & Dropdown Menu
class ControlCenterButton extends StatelessWidget {
  final String peerId;
  final FFI ffi;

  const ControlCenterButton({Key? key, required this.peerId, required this.ffi})
      : super(key: key);

  void _showControlCenterMenu(BuildContext context, Offset position) {
    BotToast.showAttachedWidget(
      target: position,
      preferDirection: PreferDirection.bottomRight,
      verticalOffset: 6,
      backgroundColor: Colors.transparent,
      attachedBuilder: (cancelFunc) {
        return _ControlCenterDropdown(
          peerId: peerId,
          ffi: ffi,
          onClose: cancelFunc,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTapDown: (details) {
        _showControlCenterMenu(context, details.globalPosition);
      },
      borderRadius: BorderRadius.circular(5),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        margin: const EdgeInsets.only(right: 8),
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark
              ? const Color(0xFF334155)
              : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(
            color: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF475569)
                : const Color(0xFFCBD5E1),
            width: 0.8,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.tune_rounded,
              size: 14,
              color: Color(0xFF2563EB),
            ),
            const SizedBox(width: 5),
            Text(
              'Control Center',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).brightness == Brightness.dark
                    ? const Color(0xFFF8FAFC)
                    : const Color(0xFF1E293B),
              ),
            ),
            const SizedBox(width: 2),
            const Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 14,
              color: Color(0xFF64748B),
            ),
          ],
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
              color: Colors.black.withOpacity(0.18),
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
                    onTap: () async {
                      onClose();
                      final isFull = await windowManager.isFullScreen();
                      windowManager.setFullScreen(!isFull);
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
