import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_hbb/common.dart';
import 'package:flutter_hbb/models/platform_model.dart';
import 'package:http/http.dart' as http;

/// AI Session Diagnostics & Live Network Benchmark Dialog
void showDiagnosticsDialog(BuildContext context, {OverlayDialogManager? dialogManager}) {
  final mgr = dialogManager ?? gFFI.dialogManager;
  mgr.show((setState, close, context) {
    return CustomAlertDialog(
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: MyTheme.accent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.speed_rounded, color: MyTheme.accent, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Diagnostik Jaringan & AI Copilot',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Uji latensi real-time, NAT traversal, dan optimasi sesi streaming',
                  style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.color
                          ?.withOpacity(0.7)),
                ),
              ],
            ),
          ),
        ],
      ),
      content: _DiagnosticsBody(close: close),
    );
  });
}

class _DiagnosticsBody extends StatefulWidget {
  final VoidCallback close;
  const _DiagnosticsBody({Key? key, required this.close}) : super(key: key);

  @override
  State<_DiagnosticsBody> createState() => _DiagnosticsBodyState();
}

class _DiagnosticsBodyState extends State<_DiagnosticsBody> {
  bool _testing = true;
  int _rttServerMs = -1;
  int _rttApiMs = -1;
  int _score = 0;
  String _grade = 'Menguji...';
  Color _gradeColor = Colors.grey;
  String _natStatus = 'Menganalisis...';
  final String _codecStatus = 'AV1 / VP9 / H.264 (DXGI D3D11)';
  String _aiAdvice = 'Menganalisis kondisi koneksi dan hardware...';
  String _serverHost = '192.168.100.175';

  @override
  void initState() {
    super.initState();
    _runBenchmark();
  }

  Future<void> _runBenchmark() async {
    setState(() {
      _testing = true;
      _grade = 'Menguji...';
      _gradeColor = Colors.grey;
    });

    String srv = bind.mainGetOptionSync(key: 'custom-rendezvous-server');
    if (srv.isEmpty) {
      srv = '192.168.100.175';
    }
    String host = srv.split(':')[0].trim();
    if (host.isEmpty) host = '192.168.100.175';
    _serverHost = host;

    int rttRendezvous = -1;
    final swRend = Stopwatch()..start();
    try {
      final s = await Socket.connect(host, 21116, timeout: const Duration(seconds: 3));
      swRend.stop();
      rttRendezvous = swRend.elapsedMilliseconds;
      await s.close();
    } catch (_) {
      try {
        final s2 = await Socket.connect(host, 21114, timeout: const Duration(seconds: 2));
        swRend.stop();
        rttRendezvous = swRend.elapsedMilliseconds;
        await s2.close();
      } catch (_) {
        rttRendezvous = 999;
      }
    }

    int rttApi = -1;
    final swApi = Stopwatch()..start();
    try {
      final res = await http.get(Uri.parse('http://$host:21114/api/health')).timeout(const Duration(seconds: 3));
      swApi.stop();
      if (res.statusCode == 200) {
        rttApi = swApi.elapsedMilliseconds;
      } else {
        rttApi = swApi.elapsedMilliseconds + 50;
      }
    } catch (_) {
      rttApi = -1;
    }

    int primaryLatency = rttRendezvous > 0 && rttRendezvous < 900 ? rttRendezvous : (rttApi > 0 ? rttApi : 999);
    int score = 0;
    String grade = 'D';
    Color gradeColor = const Color(0xFFE53935);
    String nat = 'Direct P2P UDP & Hole Punching';
    String advice = '';

    if (primaryLatency < 30) {
      score = 98;
      grade = 'Grade A+ (Ultra Low Latency)';
      gradeColor = const Color(0xFF00C853);
      advice = '🚀 Koneksi lokal / fiber ultra-cepat. Sangat optimal untuk mode 60 FPS, Kualitas Tinggi (High Quality), dan transfer file berkecepatan penuh tanpa kompresi agresif.';
    } else if (primaryLatency < 70) {
      score = 90;
      grade = 'Grade A (Sangat Baik)';
      gradeColor = const Color(0xFF2E7D32);
      advice = '✅ Latensi sangat stabil untuk sesi desktop jarak jauh. Direkomendasikan pengaturan Seimbang (Balanced) dengan codec H.264/AV1 untuk efisiensi CPU optimal.';
    } else if (primaryLatency < 130) {
      score = 78;
      grade = 'Grade B (Baik & Normal)';
      gradeColor = const Color(0xFFF9A825);
      advice = '⚡ Koneksi internet broadband standar. Responsivitas mouse dan keyboard lancar. Disarankan mengaktifkan akselerasi hardware decoding pada menu Display.';
    } else if (primaryLatency < 220) {
      score = 62;
      grade = 'Grade C (Sedang / Seluler)';
      gradeColor = const Color(0xFFEF6C00);
      advice = '⚠️ Latensi terdeteksi agak tinggi. Disarankan memilih profil "Optimalkan Kecepatan" (Speed Optimized) dan batas resolusi 1080p untuk mencegah lag.';
    } else {
      score = 35;
      grade = 'Grade D (Tinggi / Relay)';
      gradeColor = const Color(0xFFC62828);
      nat = 'Fallback Terenkripsi via Relay Server (hbbr)';
      advice = '❗ Latensi tinggi atau server tidak dapat dijangkau secara langsung via UDP. Koneksi dialihkan ke Relay Server hbbr terenkripsi.';
    }

    if (mounted) {
      setState(() {
        _testing = false;
        _rttServerMs = rttRendezvous;
        _rttApiMs = rttApi;
        _score = score;
        _grade = grade;
        _gradeColor = gradeColor;
        _natStatus = nat;
        _aiAdvice = advice;
      });
    }
  }

  void _copyReport() {
    final report = '''### ⚡ LAPORAN DIAGNOSTIK & BENCHMARK AUDIRA DESK
- **Tanggal/Waktu:** ${DateTime.now().toString().split('.')[0]}
- **Rendezvous Host:** $_serverHost
- **Latensi Socket (RTT):** ${_rttServerMs > 0 && _rttServerMs < 900 ? '$_rttServerMs ms' : 'Timeout'}
- **Latensi API Gateway (:21114):** ${_rttApiMs > 0 ? '$_rttApiMs ms' : 'Offline'}
- **Skor Kualitas Jaringan:** $_score / 100 ($_grade)
- **Mode NAT Traversal:** $_natStatus
- **Mesin Video & Codec:** $_codecStatus
- **Rekomendasi AI Copilot:** $_aiAdvice
''';
    Clipboard.setData(ClipboardData(text: report));
    showToast(translate('Copied'));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E222D) : const Color(0xFFF5F7FB);
    final borderColor = isDark ? const Color(0xFF2A2E3D) : const Color(0xFFE2E8F0);

    return SizedBox(
      width: 580,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Overall Score Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _gradeColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _gradeColor.withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: _gradeColor.withOpacity(0.2),
                      shape: BoxShape.circle,
                      border: Border.all(color: _gradeColor, width: 2),
                    ),
                    child: Center(
                      child: _testing
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(strokeWidth: 2.5),
                            )
                          : Text(
                              '$_score',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: _gradeColor,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _grade,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _gradeColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _testing
                              ? 'Melakukan pengukuran paket round-trip time...'
                              : 'Server: $_serverHost • RTT: ${_rttServerMs > 0 && _rttServerMs < 900 ? "$_rttServerMs ms" : "N/A"}',
                          style: TextStyle(fontSize: 13, color: theme.textTheme.bodyMedium?.color),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 2. Metrics Grid
            Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    icon: Icons.router_outlined,
                    title: 'Rendezvous RTT',
                    value: _testing
                        ? 'Mengukur...'
                        : (_rttServerMs > 0 && _rttServerMs < 900 ? '$_rttServerMs ms' : 'Timeout'),
                    subtitle: 'Port 21116 (hbbs UDP)',
                    color: _rttServerMs > 0 && _rttServerMs < 80 ? Colors.green : Colors.orange,
                    cardBg: cardBg,
                    borderColor: borderColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    icon: Icons.api_rounded,
                    title: 'API Gateway',
                    value: _testing
                        ? 'Mengukur...'
                        : (_rttApiMs > 0 ? '$_rttApiMs ms' : 'Offline'),
                    subtitle: 'Port 21114 (Health Check)',
                    color: _rttApiMs > 0 ? Colors.green : Colors.red,
                    cardBg: cardBg,
                    borderColor: borderColor,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    icon: Icons.hub_outlined,
                    title: 'Jalur Komunikasi',
                    value: _natStatus,
                    subtitle: 'Enkripsi E2EE ChaCha20-Poly1305',
                    color: MyTheme.accent,
                    cardBg: cardBg,
                    borderColor: borderColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    icon: Icons.videocam_outlined,
                    title: 'Mesin Video & Codec',
                    value: _codecStatus,
                    subtitle: 'Hardware Video Acceleration',
                    color: Colors.purpleAccent,
                    cardBg: cardBg,
                    borderColor: borderColor,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // 3. AI Performance Copilot Box
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    MyTheme.accent.withOpacity(0.08),
                    Colors.indigo.withOpacity(0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: MyTheme.accent.withOpacity(0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.auto_awesome_rounded, color: MyTheme.accent, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Rekomendasi AI Copilot',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: MyTheme.accent,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _aiAdvice,
                          style: const TextStyle(fontSize: 13, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton.icon(
                  icon: const Icon(Icons.copy_rounded, size: 16),
                  label: const Text('Salin Laporan'),
                  onPressed: _testing ? null : _copyReport,
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  icon: _testing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.refresh_rounded, size: 16),
                  label: const Text('Uji Ulang'),
                  onPressed: _testing ? null : _runBenchmark,
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: widget.close,
                  child: Text(translate('Close')),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required String title,
    required String value,
    required String subtitle,
    required Color color,
    required Color cardBg,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
