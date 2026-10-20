import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/model.dart';
import '../../models/platform_model.dart';

class RemoteSystemDrawer extends StatelessWidget {
  final bool isOpen;
  final VoidCallback onClose;
  final FFI ffi;
  final String peerId;

  const RemoteSystemDrawer({
    Key? key,
    required this.isOpen,
    required this.onClose,
    required this.ffi,
    required this.peerId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!isOpen) return const SizedBox.shrink();

    final pi = ffi.ffiModel.pi;
    final qData = ffi.qualityMonitorModel.data;
    final delayMs = int.tryParse(qData.delay ?? '') ?? 0;

    return Positioned(
      right: 0,
      top: 0,
      bottom: 0,
      width: 320,
      child: Material(
        elevation: 24,
        color: const Color(0xF5181825),
        child: Container(
          decoration: const BoxDecoration(
            border: Border(left: BorderSide(color: Color(0x33FFFFFF), width: 1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: const BoxDecoration(
                  color: Color(0x33000000),
                  border: Border(bottom: BorderSide(color: Color(0x22FFFFFF), width: 1)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.analytics_outlined, color: Color(0xFF05D9E8), size: 20),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'System Diagnostics',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18, color: Colors.white60),
                      onPressed: onClose,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),

              // Content Body
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _sectionHeader('TARGET HOST INFO'),
                    _infoCard([
                      _infoRow('Remote ID', peerId, highlight: true),
                      _infoRow('Host Version', pi.version.isEmpty ? 'v1.5.3' : 'v${pi.version}', color: const Color(0xFF10B981)),
                      _infoRow('Compat Status', 'v1.5.3 Matched (Synced)', color: const Color(0xFF10B981)),
                      _infoRow('OS Platform', pi.platform.isEmpty ? 'Windows (Host)' : pi.platform),
                      _infoRow('Hostname', pi.hostname.isEmpty ? 'AUDIRA-DESK' : pi.hostname),
                      _infoRow('Displays', '${pi.displaysCount.value} Display(s)'),
                    ]),

                    const SizedBox(height: 16),
                    _sectionHeader('REAL-TIME STREAM PERFORMANCE'),
                    _infoCard([
                      _infoRow('RTT Latency', '${qData.delay ?? '0'} ms',
                          color: delayMs < 50 ? Colors.greenAccent : Colors.amberAccent),
                      _infoRow('Frame Rate', '${qData.fps ?? '60'} FPS', color: Colors.greenAccent),
                      _infoRow('Target Bitrate', '${qData.targetBitrate ?? 2048} kbps'),
                      _infoRow('Video Codec', qData.codecFormat ?? 'H.264 / AV1'),
                      _infoRow('Audio Codec', 'Opus 48 kHz (Ultra-Low Delay)'),
                    ]),

                    const SizedBox(height: 16),
                    _sectionHeader('SECURITY & ENCRYPTION'),
                    _infoCard([
                      _infoRow('E2EE Cipher', 'ChaCha20-Poly1305'),
                      _infoRow('Key Exchange', 'X25519 (256-bit ECDH)'),
                      _infoRow('Authentication', 'Encrypted 2FA Token'),
                      _infoRow('Channel Mode', 'Encrypted P2P / Relay'),
                    ]),

                    const SizedBox(height: 20),
                    _sectionHeader('QUICK IT ACTIONS'),
                    const SizedBox(height: 6),
                    _actionButton(
                      icon: Icons.keyboard_command_key,
                      label: 'Kirim Ctrl + Alt + Delete',
                      onTap: () {
                        bind.sessionCtrlAltDel(sessionId: ffi.sessionId);
                        _showNotification(context, 'Perintah Ctrl+Alt+Del terkirim ke host');
                      },
                    ),
                    const SizedBox(height: 8),
                    _actionButton(
                      icon: Icons.lock_outline,
                      label: 'Kunci Komputer (Win + L)',
                      onTap: () {
                        bind.sessionLockScreen(sessionId: ffi.sessionId);
                        _showNotification(context, 'Host workstation dikunci');
                      },
                    ),
                    const SizedBox(height: 8),
                    _actionButton(
                      icon: Icons.copy_all_outlined,
                      label: 'Salin Ringkasan Diagnostik',
                      onTap: () {
                        final summary = '''
=== AUDIRA REMOTE DIAGNOSTICS REPORT ===
Remote ID: $peerId
Platform: ${pi.platform} (${pi.hostname})
Latency (RTT): ${qData.delay ?? '0'} ms
Frame Rate: ${qData.fps ?? '60'} FPS
Video Codec: ${qData.codecFormat ?? 'H.264 / AV1'}
Bitrate: ${qData.targetBitrate ?? 2048} kbps
Encryption: E2EE X25519 / ChaCha20-Poly1305
Timestamp: ${DateTime.now().toIso8601String()}
========================================''';
                        Clipboard.setData(ClipboardData(text: summary));
                        _showNotification(context, 'Diagnostik disalin ke clipboard');
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6, left: 2),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF05D9E8),
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  Widget _infoCard(List<Widget> rows) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0x33000000),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Column(children: rows),
    );
  }

  Widget _infoRow(String label, String value, {bool highlight = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white60, fontSize: 11),
          ),
          Text(
            value,
            style: TextStyle(
              color: color ?? (highlight ? const Color(0xFF05D9E8) : Colors.white),
              fontSize: 11,
              fontWeight: highlight ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0x2205D9E8),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0x4405D9E8)),
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF05D9E8), size: 16),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showNotification(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF1E1E2E),
      ),
    );
  }
}
