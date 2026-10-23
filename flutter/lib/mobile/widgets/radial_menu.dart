import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../common.dart';
import '../../models/input_model.dart';
import '../../models/model.dart';
import '../../models/platform_model.dart';

/// Floating Radial Quick-Menu for Mobile & Tablet Touch Ergonomics (DESIGN.md §5.2)
class RadialQuickMenu extends StatefulWidget {
  final FFI ffi;
  final VoidCallback onToggleKeyboard;

  const RadialQuickMenu({
    Key? key,
    required this.ffi,
    required this.onToggleKeyboard,
  }) : super(key: key);

  @override
  State<RadialQuickMenu> createState() => _RadialQuickMenuState();
}

class _RadialQuickMenuState extends State<RadialQuickMenu>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _expandAnimation;
  bool _isOpen = false;

  // Draggable position coordinates
  Offset _position = const Offset(20, 200);

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    _expandAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _animController.forward();
      } else {
        _animController.reverse();
      }
    });
  }

  void _close() {
    if (_isOpen) {
      setState(() {
        _isOpen = false;
        _animController.reverse();
      });
    }
  }

  InputModel get inputModel => widget.ffi.inputModel;

  void _sendKey(String key, String toastLabel) {
    inputModel.inputKey(key);
    showToast('$toastLabel dikirim');
    _close();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Stack(
      children: [
        // Dismiss backdrop when open
        if (_isOpen)
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: _close,
              child: Container(
                color: Colors.black.withValues(alpha: 0.35),
              ),
            ),
          ),

        // Draggable floating radial widget
        Positioned(
          left: _position.dx.clamp(10.0, size.width - 65.0),
          top: _position.dy.clamp(40.0, size.height - 120.0),
          child: GestureDetector(
            onPanUpdate: (details) {
              if (!_isOpen) {
                setState(() {
                  _position += details.delta;
                });
              }
            },
            child: SizedBox(
              width: 240,
              height: 240,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Radial Action Buttons
                  ..._buildRadialItems(),

                  // Center Floating Hub Button
                  GestureDetector(
                    onTap: _toggle,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isOpen
                            ? const Color(0xFF00D2FF)
                            : const Color(0xE6131926),
                        border: Border.all(
                          color: const Color(0xFF00D2FF),
                          width: 1.8,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF00D2FF).withValues(alpha: _isOpen ? 0.45 : 0.2),
                            blurRadius: _isOpen ? 16 : 8,
                            spreadRadius: _isOpen ? 2 : 0,
                          ),
                        ],
                      ),
                      child: Center(
                        child: AnimatedRotation(
                          turns: _isOpen ? 0.125 : 0.0,
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            _isOpen ? Icons.close_rounded : Icons.dialpad_rounded,
                            color: _isOpen ? const Color(0xFF0B0F17) : const Color(0xFF00D2FF),
                            size: 24,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildRadialItems() {
    final actions = [
      _RadialAction(
        label: 'ESC',
        icon: Icons.keyboard_return_rounded,
        color: const Color(0xFFEF4444),
        onTap: () => _sendKey('Escape', 'ESC'),
      ),
      _RadialAction(
        label: 'TAB',
        icon: Icons.keyboard_tab_rounded,
        color: const Color(0xFF38BDF8),
        onTap: () => _sendKey('Tab', 'TAB'),
      ),
      _RadialAction(
        label: 'WIN',
        icon: Icons.window_rounded,
        color: const Color(0xFF3B82F6),
        onTap: () => _sendKey('Meta', 'Windows Key'),
      ),
      _RadialAction(
        label: 'CTRL',
        icon: Icons.keyboard_command_key_rounded,
        color: inputModel.ctrl ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
        onTap: () {
          setState(() {
            inputModel.ctrl = !inputModel.ctrl;
          });
          showToast(inputModel.ctrl ? 'CTRL Terkunci (Active)' : 'CTRL Dilepas');
        },
      ),
      _RadialAction(
        label: 'ALT',
        icon: Icons.keyboard_option_key_rounded,
        color: inputModel.alt ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
        onTap: () {
          setState(() {
            inputModel.alt = !inputModel.alt;
          });
          showToast(inputModel.alt ? 'ALT Terkunci (Active)' : 'ALT Dilepas');
        },
      ),
      _RadialAction(
        label: 'DEL',
        icon: Icons.backspace_outlined,
        color: const Color(0xFFF59E0B),
        onTap: () => _sendKey('Delete', 'DELETE'),
      ),
      _RadialAction(
        label: 'C+A+D',
        icon: Icons.security_rounded,
        color: const Color(0xFFFF2A6D),
        onTap: () {
          bind.sessionCtrlAltDel(sessionId: widget.ffi.sessionId);
          showToast('Ctrl + Alt + Delete dikirim');
          _close();
        },
      ),
      _RadialAction(
        label: 'KBD',
        icon: Icons.keyboard_rounded,
        color: const Color(0xFF00D2FF),
        onTap: () {
          _close();
          widget.onToggleKeyboard();
        },
      ),
    ];

    final double radius = 88.0;
    final int count = actions.length;

    return List.generate(count, (index) {
      final double angle = (index * 2 * math.pi / count) - (math.pi / 2);

      return AnimatedBuilder(
        animation: _expandAnimation,
        builder: (context, child) {
          final double progress = _expandAnimation.value;
          final double x = math.cos(angle) * radius * progress;
          final double y = math.sin(angle) * radius * progress;

          return Transform.translate(
            offset: Offset(x, y),
            child: Opacity(
              opacity: progress.clamp(0.0, 1.0),
              child: child,
            ),
          );
        },
        child: _buildItemBubble(actions[index]),
      );
    });
  }

  Widget _buildItemBubble(_RadialAction action) {
    return GestureDetector(
      onTap: action.onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: const Color(0xFF131926),
          border: Border.all(
            color: action.color.withValues(alpha: 0.8),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: action.color.withValues(alpha: 0.25),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(action.icon, size: 14, color: action.color),
            const SizedBox(height: 1),
            Text(
              action.label,
              style: TextStyle(
                fontSize: 8,
                fontWeight: FontWeight.bold,
                color: action.color,
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RadialAction {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  _RadialAction({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });
}
