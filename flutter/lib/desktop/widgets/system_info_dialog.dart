import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_hbb/common.dart';
import 'package:flutter_hbb/models/platform_model.dart';
import 'package:flutter_hbb/models/state_model.dart';

/// Quick Host System Info & Diagnostic Snapshot Dialog
void showSystemInfoDialog(BuildContext context, {OverlayDialogManager? dialogManager}) {
  final mgr = dialogManager ?? gFFI.dialogManager;
  mgr.show((setState, close, context) {
    final hostname = Platform.localHostname;
    final os = Platform.operatingSystemVersion;
    String srv = bind.mainGetOptionSync(key: 'custom-rendezvous-server');
    if (srv.isEmpty) srv = '192.168.100.175';
    final myId = gFFI.serverModel.serverId.text;

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E222D) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF2A2E3D) : const Color(0xFFE2E8F0);

    void copyAll() {
      final text = '''### 💻 SPESIFIKASI & INFO SISTEM AUDIRA DESK
- **Nama Komputer (Hostname):** $hostname
- **Remote ID:** $myId
- **Sistem Operasi:** $os
- **Arsitektur:** ${Platform.version}
- **Rendezvous Server:** $srv
- **Enkripsi:** E2EE ChaCha20-Poly1305 + Curve25519
- **Status Layanan:** ${stateGlobal.svcStatus.value == SvcStatus.ready ? 'Siap & Online' : 'Menghubungkan'}
- **Versi Aplikasi:** 1.5.3 Enterprise Official Release
''';
      Clipboard.setData(ClipboardData(text: text));
      showToast(translate('Copied'));
    }

    Widget buildInfoRow(String label, String value, IconData icon, {bool isHighlight = false}) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: isHighlight ? MyTheme.accent : Colors.grey),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
            const Spacer(),
            Flexible(
              child: Text(
                value,
                textAlign: TextAlign.right,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
                  color: isHighlight ? MyTheme.accent : null,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      );
    }

    return CustomAlertDialog(
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: MyTheme.accent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.info_outline_rounded, color: MyTheme.accent, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Spesifikasi Sistem & Informasi Host',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Identitas perangkat keras, sistem operasi, dan status konektivitas',
                  style: TextStyle(fontSize: 12, color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7)),
                ),
              ],
            ),
          ),
        ],
      ),
      content: SizedBox(
        width: 520,
        child: SingleChildScrollView(
          child: Column(
            children: [
              buildInfoRow('Nama Host', hostname, Icons.laptop_windows_rounded),
              const SizedBox(height: 8),
              buildInfoRow('Remote ID', myId.isNotEmpty ? myId : 'Audira Host', Icons.badge_outlined, isHighlight: true),
              const SizedBox(height: 8),
              buildInfoRow('Sistem Operasi', os, Icons.settings_system_daydream_rounded),
              const SizedBox(height: 8),
              buildInfoRow('Rendezvous Server', srv, Icons.dns_rounded),
              const SizedBox(height: 8),
              buildInfoRow('Protokol Enkripsi', 'E2EE ChaCha20-Poly1305 (Libsodium)', Icons.lock_outline_rounded),
              const SizedBox(height: 8),
              buildInfoRow('Versi Software', 'v1.5.3 Enterprise Build (Audira Studio)', Icons.verified_user_outlined),
            ],
          ),
        ),
      ),
      actions: [
        OutlinedButton.icon(
          icon: const Icon(Icons.copy_rounded, size: 16),
          label: const Text('Salin Info Sistem'),
          onPressed: copyAll,
        ),
        ElevatedButton(
          onPressed: close,
          child: Text(translate('Close')),
        ),
      ],
    );
  });
}
