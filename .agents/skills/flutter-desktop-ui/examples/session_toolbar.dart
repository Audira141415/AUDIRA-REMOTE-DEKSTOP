// Reference Example: Flutter Desktop Floating Session Toolbar
// Used during active remote desktop sessions in AUDIRA Remote Desktop.

import 'package:flutter/material.dart';

class SessionToolbarWidget extends StatelessWidget {
  final VoidCallback onToggleFullscreen;
  final VoidCallback onTogglePrivacyMode;
  final VoidCallback onOpenFileTransfer;
  final VoidCallback onDisconnect;
  final bool isPrivacyModeActive;

  const SessionToolbarWidget({
    Key? key,
    required this.onToggleFullscreen,
    required this.onTogglePrivacyMode,
    required this.onOpenFileTransfer,
    required this.onDisconnect,
    this.isPrivacyModeActive = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xE61E1E2E), // Translucent dark surface
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 8,
            offset: Offset(0, 3),
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.fullscreen, color: Colors.white70),
            tooltip: 'Fullscreen',
            onPressed: onToggleFullscreen,
          ),
          IconButton(
            icon: Icon(
              Icons.visibility_off,
              color: isPrivacyModeActive ? Colors.amber : Colors.white70,
            ),
            tooltip: 'Privacy Mode (Blackout Host Screen)',
            onPressed: onTogglePrivacyMode,
          ),
          IconButton(
            icon: const Icon(Icons.folder_shared, color: Colors.white70),
            tooltip: 'File Transfer',
            onPressed: onOpenFileTransfer,
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.close, color: Colors.redAccent),
            tooltip: 'Disconnect Session',
            onPressed: onDisconnect,
          ),
        ],
      ),
    );
  }
}
