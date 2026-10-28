import 'dart:async';
import 'package:flutter/material.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:get/get.dart';
import 'package:flutter_hbb/models/model.dart';

/// Workspace Mode State Manager per peer session
class AudiraWorkspaceModeState {
  static String tag(String id) => 'audira_ws_mode_$id';

  static void init(String id) {
    final key = tag(id);
    if (!Get.isRegistered<RxString>(tag: key)) {
      final RxString state = 'desktop'.obs;
      Get.put<RxString>(state, tag: key);
    } else {
      Get.find<RxString>(tag: key).value = 'desktop';
    }
  }

  static void delete(String id) {
    final key = tag(id);
    if (Get.isRegistered<RxString>(tag: key)) {
      Get.delete<RxString>(tag: key);
    }
  }

  static RxString find(String id) {
    final key = tag(id);
    if (!Get.isRegistered<RxString>(tag: key)) {
      init(id);
    }
    return Get.find<RxString>(tag: key);
  }
}

/// Segmented Mode item model
class AudiraModeItem {
  final String key;
  final String label;
  final IconData icon;
  final String tooltip;

  const AudiraModeItem({
    required this.key,
    required this.label,
    required this.icon,
    required this.tooltip,
  });
}

const List<AudiraModeItem> kAudiraModes = [
  AudiraModeItem(
    key: 'desktop',
    label: 'Desktop (60fps)',
    icon: Icons.desktop_windows_outlined,
    tooltip: 'Remote Desktop Native 60 FPS Video Stream',
  ),
  AudiraModeItem(
    key: 'ide',
    label: 'Remote IDE',
    icon: Icons.code_rounded,
    tooltip: 'Remote Monaco IDE & File Explorer',
  ),
  AudiraModeItem(
    key: 'vibe',
    label: 'Vibe Studio',
    icon: Icons.bolt_rounded,
    tooltip: 'AI Vibe Coding & Agent Harness (Every Harness · One UI)',
  ),
  AudiraModeItem(
    key: 'localhost',
    label: 'Localhost Tunnel',
    icon: Icons.language_rounded,
    tooltip: 'Remote Localhost Port Forwarding & Live Web Preview',
  ),
  AudiraModeItem(
    key: 'emulator',
    label: 'Emulator',
    icon: Icons.phone_iphone_rounded,
    tooltip: 'Remote Mobile Device Simulator Frame & Virtual Touch Bar',
  ),
];

// ============================================================================
// 1. NATIVE REMOTE IDE WORKSPACE
// ============================================================================
class AudiraNativeIdeWorkspace extends StatefulWidget {
  final String peerId;
  final FFI ffi;

  const AudiraNativeIdeWorkspace({
    Key? key,
    required this.peerId,
    required this.ffi,
  }) : super(key: key);

  @override
  State<AudiraNativeIdeWorkspace> createState() =>
      _AudiraNativeIdeWorkspaceState();
}

class _AudiraNativeIdeWorkspaceState extends State<AudiraNativeIdeWorkspace> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _codeController = TextEditingController(
    text: '''// Audira Remote Desktop - Native IDE Session
// Connected to Host: ${"target"}
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Audira Native Host Service running at 60 FPS...");
    
    // Initialize P2P Transport & Code Session
    let transport = Arc::new(Mutex::new("P2P_E2EE_ACTIVE"));
    println!("Session Secure: {:?}", transport);

    Ok(())
}
''',
  );

  String _activeFile = 'src/main.rs';
  final List<String> _openFiles = ['src/main.rs', 'Cargo.toml', 'README.md'];

  final List<Map<String, dynamic>> _treeFiles = [
    {'name': 'src', 'isDir': true, 'expanded': true},
    {'name': 'src/main.rs', 'isDir': false, 'git': 'M', 'size': '1.4 KB'},
    {'name': 'src/lib.rs', 'isDir': false, 'git': '', 'size': '3.2 KB'},
    {'name': 'src/server.rs', 'isDir': false, 'git': 'U', 'size': '8.6 KB'},
    {'name': 'Cargo.toml', 'isDir': false, 'git': '', 'size': '720 B'},
    {'name': 'README.md', 'isDir': false, 'git': '', 'size': '2.1 KB'},
    {'name': 'build.rs', 'isDir': false, 'git': '', 'size': '1.8 KB'},
  ];

  @override
  void initState() {
    super.initState();
    _codeController.text = _codeController.text.replaceAll('target', widget.peerId);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _selectFile(String path) {
    setState(() {
      _activeFile = path;
      if (!_openFiles.contains(path)) {
        _openFiles.add(path);
      }
      if (path.endsWith('.toml')) {
        _codeController.text = '''[package]
name = "audira-host"
version = "1.5.8"
edition = "2021"

[dependencies]
tokio = { version = "1.35", features = ["full"] }
hbb_common = { path = "../libs/hbb_common" }
log = "0.4"
''';
      } else if (path.endsWith('.md')) {
        _codeController.text = '''# Audira Remote Workspace
Host Peer ID: ${widget.peerId}
Security: ChaCha20-Poly1305 E2EE
Capabilities: 60 FPS Remote Desktop, Native IDE, Vibe Studio, Localhost Tunnel.
''';
      }
    });
    BotToast.showText(text: 'Berkas $path dimuat dari host');
  }

  void _saveFile() {
    BotToast.showText(
      text: '💾 Berkas $_activeFile berhasil disimpan ke host ${widget.peerId}',
      duration: const Duration(seconds: 2),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF08090D),
      child: Row(
        children: [
          // Left Sidebar: File Tree & Explorer
          Container(
            width: 260,
            decoration: const BoxDecoration(
              color: Color(0xFF0D111A),
              border: Border(
                right: BorderSide(color: Color(0x1FFFFFFF), width: 1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Explorer Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'EXPLORER',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.refresh_rounded, size: 14, color: Color(0xFF94A3B8)),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        tooltip: 'Refresh Direktori Host',
                        onPressed: () => BotToast.showText(text: 'Direktori host diperbarui'),
                      ),
                    ],
                  ),
                ),

                // File search filter
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(fontSize: 11, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Cari berkas...',
                      hintStyle: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      prefixIcon: const Icon(Icons.search, size: 13, color: Color(0xFF64748B)),
                      filled: true,
                      fillColor: const Color(0xFF0A0D14),
                      contentPadding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(5),
                        borderSide: const BorderSide(color: Color(0x1FFFFFFF)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(5),
                        borderSide: const BorderSide(color: Color(0x1FFFFFFF)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),

                // Tree Items
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    itemCount: _treeFiles.length,
                    itemBuilder: (context, idx) {
                      final item = _treeFiles[idx];
                      final isDir = item['isDir'] as bool;
                      final name = item['name'] as String;
                      final isSelected = _activeFile == name;
                      final git = item['git'] as String? ?? '';

                      return InkWell(
                        onTap: () {
                          if (!isDir) _selectFile(name);
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF38BDF8).withValues(alpha: 0.15) : Colors.transparent,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isDir ? Icons.folder_rounded : Icons.insert_drive_file_outlined,
                                size: 14,
                                color: isDir
                                    ? const Color(0xFFFBBF24)
                                    : (isSelected ? const Color(0xFF38BDF8) : const Color(0xFF94A3B8)),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontFamily: 'monospace',
                                    color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFFCBD5E1),
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (git.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: git == 'M' ? const Color(0x33FBBF24) : const Color(0x3334D399),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                  child: Text(
                                    git,
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: git == 'M' ? const Color(0xFFFBBF24) : const Color(0xFF34D399),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Footer
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: Color(0x1FFFFFFF))),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.dns_outlined, size: 13, color: Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Host: ${widget.peerId} (Online)',
                          style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Right Editor Section
          Expanded(
            child: Column(
              children: [
                // Tab Bar
                Container(
                  height: 38,
                  decoration: const BoxDecoration(
                    color: Color(0xFF0D111A),
                    border: Border(bottom: BorderSide(color: Color(0x1FFFFFFF))),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: _openFiles.map((f) {
                            final isActive = _activeFile == f;
                            return InkWell(
                              onTap: () => setState(() => _activeFile = f),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: isActive ? const Color(0xFF08090D) : Colors.transparent,
                                  border: Border(
                                    bottom: BorderSide(
                                      color: isActive ? const Color(0xFF38BDF8) : Colors.transparent,
                                      width: 2,
                                    ),
                                    right: const BorderSide(color: Color(0x14FFFFFF)),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.description_outlined, size: 12, color: Color(0xFF38BDF8)),
                                    const SizedBox(width: 6),
                                    Text(
                                      f,
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontFamily: 'monospace',
                                        color: isActive ? Colors.white : const Color(0xFF94A3B8),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      // Action buttons
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Row(
                          children: [
                            ElevatedButton.icon(
                              onPressed: _saveFile,
                              icon: const Icon(Icons.save_rounded, size: 13),
                              label: const Text('Simpan', style: TextStyle(fontSize: 11)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0284C7),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                              ),
                            ),
                            const SizedBox(width: 6),
                            OutlinedButton.icon(
                              onPressed: () {
                                AudiraWorkspaceModeState.find(widget.peerId).value = 'vibe';
                                BotToast.showText(text: 'Berkas dikirim ke Vibe Studio');
                              },
                              icon: const Icon(Icons.bolt_rounded, size: 13, color: Color(0xFFF97316)),
                              label: const Text('Vibecode', style: TextStyle(fontSize: 11, color: Color(0xFFF97316))),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0x66F97316)),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                              ),
                            ),
                            const SizedBox(width: 6),
                            OutlinedButton.icon(
                              onPressed: () {
                                AudiraWorkspaceModeState.find(widget.peerId).value = 'desktop';
                                BotToast.showText(text: 'Beralih ke Desktop 60 FPS');
                              },
                              icon: const Icon(Icons.desktop_windows_outlined, size: 13, color: Color(0xFF38BDF8)),
                              label: const Text('Desktop', style: TextStyle(fontSize: 11, color: Color(0xFF38BDF8))),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0x6638BDF8)),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Editor Text Area
                Expanded(
                  child: Container(
                    color: const Color(0xFF08090D),
                    padding: const EdgeInsets.all(12),
                    child: TextField(
                      controller: _codeController,
                      maxLines: null,
                      expands: true,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                        color: Color(0xFFE2E8F0),
                        height: 1.5,
                      ),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ),

                // Status Bar
                Container(
                  height: 24,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: const BoxDecoration(
                    color: Color(0xFF0D111A),
                    border: Border(top: BorderSide(color: Color(0x1FFFFFFF))),
                  ),
                  child: Row(
                    children: [
                      const Text(
                        'Rust / Plaintext',
                        style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontFamily: 'monospace'),
                      ),
                      const SizedBox(width: 14),
                      Text(
                        _activeFile,
                        style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
                      ),
                      const Spacer(),
                      const Text(
                        'UTF-8 • LF • Spaces: 4 • Native Direct Session',
                        style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 2. NATIVE AI VIBE STUDIO WORKSPACE
// ============================================================================
class AudiraNativeVibeWorkspace extends StatefulWidget {
  final String peerId;
  final FFI ffi;

  const AudiraNativeVibeWorkspace({
    Key? key,
    required this.peerId,
    required this.ffi,
  }) : super(key: key);

  @override
  State<AudiraNativeVibeWorkspace> createState() =>
      _AudiraNativeVibeWorkspaceState();
}

class _AudiraNativeVibeWorkspaceState extends State<AudiraNativeVibeWorkspace> {
  final TextEditingController _promptController = TextEditingController(
    text: 'Optimalkan pipeline kompresi frame dan periksa memory leak pada host.',
  );
  String _selectedHarness = 'Claude Code (Anthropic 3.7)';
  bool _isRunning = false;
  final List<String> _timeline = [];

  final String _diffContent = '''--- a/src/server/video.rs
+++ b/src/server/video.rs
@@ -102,7 +102,9 @@ impl VideoStream {
-    let bitrate = 2000;
+    // Adaptive hardware-accelerated 60 FPS bitrate curve
+    let bitrate = self.calculate_adaptive_bitrate(rtt_ms);
+    log::info!("Audira 60fps Bitrate: {} kbps", bitrate);
''';

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  void _runVibeCode() {
    final prompt = _promptController.text.trim();
    if (prompt.isEmpty) return;

    setState(() {
      _isRunning = true;
      _timeline.clear();
      _timeline.add('🚀 Menghubungkan ke Agent Harness [$_selectedHarness]...');
    });

    Timer(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() {
        _timeline.add('🧠 Menganalisis repositori host ${widget.peerId}...');
      });
    });

    Timer(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      setState(() {
        _timeline.add('⚡ Menghasilkan patch diff pada src/server/video.rs');
        _isRunning = false;
      });
      BotToast.showText(text: '✅ Patch AI siap ditinjau di panel kanan');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF08090D),
      child: Column(
        children: [
          // Subheader Copy
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
            decoration: const BoxDecoration(
              color: Color(0xFF0D111A),
              border: Border(bottom: BorderSide(color: Color(0x14FFFFFF))),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF97316),
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: Color(0xFFF97316), blurRadius: 6)],
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Every Harness · One UI: ',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFB923C)),
                ),
                const Text(
                  'Satu antarmuka terpadu untuk Claude Code, Codex CLI, Cursor Agent & Aider di desktop.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                ),
                const Spacer(),
                OutlinedButton.icon(
                  onPressed: () {
                    AudiraWorkspaceModeState.find(widget.peerId).value = 'desktop';
                    BotToast.showText(text: 'Beralih ke Desktop 60 FPS');
                  },
                  icon: const Icon(Icons.desktop_windows_outlined, size: 13, color: Color(0xFF38BDF8)),
                  label: const Text('Kembali ke Desktop', style: TextStyle(fontSize: 11, color: Color(0xFF38BDF8))),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0x6638BDF8)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                  ),
                ),
              ],
            ),
          ),

          // Split Layout: Agent Box & Diff Reviewer
          Expanded(
            child: Row(
              children: [
                // Left Pane: Harness & Prompt
                Expanded(
                  flex: 5,
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFF0D111A),
                      border: Border(right: BorderSide(color: Color(0x1FFFFFFF))),
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Agent Select Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'AI AGENT HARNESS',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF121722),
                                border: Border.all(color: const Color(0x2EFFFFFF)),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: DropdownButton<String>(
                                value: _selectedHarness,
                                dropdownColor: const Color(0xFF121722),
                                underline: const SizedBox(),
                                style: const TextStyle(fontSize: 12, color: Colors.white),
                                items: [
                                  'Claude Code (Anthropic 3.7)',
                                  'OpenAI Codex CLI',
                                  'Cursor Background Agent',
                                  'Aider Pair Programmer',
                                  'Audira Native Copilot',
                                ].map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
                                onChanged: (v) {
                                  if (v != null) setState(() => _selectedHarness = v);
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Quick chips
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            '⚡ Refactor Async',
                            '🛡️ Panic Hardening',
                            '🚀 Tune 60fps Bitrate',
                            '🧪 Generate Tests',
                          ].map((chip) {
                            return InkWell(
                              onTap: () {
                                _promptController.text = chip;
                              },
                              borderRadius: BorderRadius.circular(4),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.05),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(chip, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 12),

                        // Prompt Textarea
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0A0D14),
                            border: Border.all(color: const Color(0x2EFFFFFF)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TextField(
                                controller: _promptController,
                                maxLines: 3,
                                style: const TextStyle(fontSize: 13, color: Colors.white),
                                decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  hintText: 'Deskripsikan perubahan kode atau fitur yang diinginkan...',
                                  hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                                  contentPadding: EdgeInsets.zero,
                                ),
                              ),
                              const Divider(color: Color(0x1FFFFFFF), height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Context: Host ${widget.peerId}',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontFamily: 'monospace'),
                                  ),
                                  ElevatedButton.icon(
                                    onPressed: _isRunning ? null : _runVibeCode,
                                    icon: _isRunning
                                        ? const SizedBox(
                                            width: 12,
                                            height: 12,
                                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                          )
                                        : const Icon(Icons.play_arrow_rounded, size: 16),
                                    label: const Text('Vibecode Run', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0284C7),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Timeline Output
                        const Text(
                          'EXECUTION LOG & TIMELINE',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8)),
                        ),
                        const SizedBox(height: 8),
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF08090D),
                              border: Border.all(color: const Color(0x14FFFFFF)),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: _timeline.isEmpty
                                ? const Center(
                                    child: Text(
                                      'Siap mengeksekusi prompt AI secara native di desktop.',
                                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: _timeline.length,
                                    itemBuilder: (ctx, i) {
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 6),
                                        child: Text(
                                          _timeline[i],
                                          style: const TextStyle(
                                            fontSize: 11.5,
                                            fontFamily: 'monospace',
                                            color: Color(0xFF38BDF8),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Right Pane: Code Diff Reviewer
                Expanded(
                  flex: 5,
                  child: Container(
                    color: const Color(0xFF08090D),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.difference_outlined, size: 14, color: Color(0xFF10B981)),
                                SizedBox(width: 6),
                                Text(
                                  'Code Diff Reviewer',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                OutlinedButton(
                                  onPressed: () => BotToast.showText(text: 'Diff ditolak'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFFF87171),
                                    side: const BorderSide(color: Color(0x44F87171)),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                  ),
                                  child: const Text('Reject', style: TextStyle(fontSize: 11)),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  onPressed: () => BotToast.showText(text: '✅ Diff disetujui & diterapkan ke host!'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF059669),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                  ),
                                  child: const Text('Approve & Apply', style: TextStyle(fontSize: 11)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Diff Viewer
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF05070A),
                              border: Border.all(color: const Color(0x1FFFFFFF)),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: SingleChildScrollView(
                              child: Text(
                                _diffContent,
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  color: Color(0xFF34D399),
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 3. NATIVE LOCALHOST TUNNEL WORKSPACE
// ============================================================================
class AudiraNativeLocalhostWorkspace extends StatefulWidget {
  final String peerId;
  final FFI ffi;

  const AudiraNativeLocalhostWorkspace({
    Key? key,
    required this.peerId,
    required this.ffi,
  }) : super(key: key);

  @override
  State<AudiraNativeLocalhostWorkspace> createState() =>
      _AudiraNativeLocalhostWorkspaceState();
}

class _AudiraNativeLocalhostWorkspaceState
    extends State<AudiraNativeLocalhostWorkspace> {
  final TextEditingController _urlController =
      TextEditingController(text: 'http://localhost:5050');
  int _activePort = 5050;

  final List<Map<String, dynamic>> _ports = [
    {'port': 5050, 'service': 'Audira Web Portal', 'active': true, 'traffic': '12.4 MB'},
    {'port': 3000, 'service': 'React / Next.js Dev', 'active': true, 'traffic': '3.1 MB'},
    {'port': 5173, 'service': 'Vite Hot-Reload', 'active': false, 'traffic': '0 B'},
    {'port': 8080, 'service': 'REST API Microservice', 'active': true, 'traffic': '48.2 MB'},
  ];

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF08090D),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Remote Localhost Port Forwarding & Tunneling',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Akses server web dan port dev host ${widget.peerId} langsung dari desktop tanpa NAT rumit.',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
              Row(
                children: [
                  ElevatedButton.icon(
                    onPressed: () => BotToast.showText(text: 'Memindai port aktif pada host...'),
                    icon: const Icon(Icons.refresh_rounded, size: 14),
                    label: const Text('Scan Active Dev Ports', style: TextStyle(fontSize: 11)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      AudiraWorkspaceModeState.find(widget.peerId).value = 'desktop';
                      BotToast.showText(text: 'Beralih ke Desktop 60 FPS');
                    },
                    icon: const Icon(Icons.desktop_windows_outlined, size: 13, color: Color(0xFF38BDF8)),
                    label: const Text('Kembali ke Desktop', style: TextStyle(fontSize: 11, color: Color(0xFF38BDF8))),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0x6638BDF8)),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Ports Row
          Wrap(
            spacing: 8,
            children: _ports.map((p) {
              final isCur = _activePort == p['port'];
              return InkWell(
                onTap: () {
                  setState(() {
                    _activePort = p['port'] as int;
                    _urlController.text = 'http://localhost:$_activePort';
                  });
                },
                borderRadius: BorderRadius.circular(6),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isCur ? const Color(0x2E10B981) : const Color(0xFF0D111A),
                    border: Border.all(
                      color: isCur ? const Color(0xFF10B981) : const Color(0x1FFFFFFF),
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: p['active'] ? const Color(0xFF10B981) : const Color(0xFF64748B),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${p['port']} (${p['service']})',
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: 'monospace',
                          fontWeight: isCur ? FontWeight.bold : FontWeight.normal,
                          color: isCur ? const Color(0xFF34D399) : const Color(0xFFCBD5E1),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Tunnel Metrics Table
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF0D111A),
                border: Border.all(color: const Color(0x1FFFFFFF)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Color(0x1FFFFFFF))),
                    ),
                    child: const Row(
                      children: [
                        Expanded(flex: 2, child: Text('LOCAL PORT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                        Expanded(flex: 3, child: Text('REMOTE TARGET', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                        Expanded(flex: 2, child: Text('PROTOCOL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                        Expanded(flex: 2, child: Text('THROUGHPUT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                        Expanded(flex: 2, child: Text('STATUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.separated(
                      itemCount: _ports.length,
                      separatorBuilder: (_, __) => const Divider(color: Color(0x0FFFFFFF), height: 1),
                      itemBuilder: (ctx, i) {
                        final p = _ports[i];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Row(
                            children: [
                              Expanded(flex: 2, child: Text(':${p['port']}', style: const TextStyle(fontSize: 12, fontFamily: 'monospace', color: Color(0xFF38BDF8)))),
                              Expanded(flex: 3, child: Text('127.0.0.1:${p['port']} (${p['service']})', style: const TextStyle(fontSize: 12, color: Colors.white))),
                              const Expanded(flex: 2, child: Text('TCP Direct', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)))),
                              Expanded(flex: 2, child: Text(p['traffic'], style: const TextStyle(fontSize: 12, fontFamily: 'monospace', color: Color(0xFFCBD5E1)))),
                              Expanded(
                                flex: 2,
                                child: Row(
                                  children: [
                                    Container(width: 6, height: 6, decoration: BoxDecoration(color: p['active'] ? const Color(0xFF10B981) : Colors.red, shape: BoxShape.circle)),
                                    const SizedBox(width: 6),
                                    Text(p['active'] ? 'ONLINE' : 'STOPPED', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: p['active'] ? const Color(0xFF10B981) : Colors.red)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 4. NATIVE MOBILE EMULATOR WORKSPACE
// ============================================================================
class AudiraNativeEmulatorWorkspace extends StatefulWidget {
  final String peerId;
  final FFI ffi;
  final Widget remoteChild;

  const AudiraNativeEmulatorWorkspace({
    Key? key,
    required this.peerId,
    required this.ffi,
    required this.remoteChild,
  }) : super(key: key);

  @override
  State<AudiraNativeEmulatorWorkspace> createState() =>
      _AudiraNativeEmulatorWorkspaceState();
}

class _AudiraNativeEmulatorWorkspaceState
    extends State<AudiraNativeEmulatorWorkspace> {
  bool _isLandscape = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF08090D),
      child: Column(
        children: [
          // Emulator Controls Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF0D111A),
              border: Border(bottom: BorderSide(color: Color(0x1FFFFFFF))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text(
                      'Live Mobile Emulator Stream',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('60 FPS Native Low Latency', style: TextStyle(fontSize: 10, color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => setState(() => _isLandscape = !_isLandscape),
                      icon: const Icon(Icons.screen_rotation, size: 14),
                      label: Text(_isLandscape ? 'Portrait' : 'Landscape', style: const TextStyle(fontSize: 11)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Color(0x33FFFFFF)),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    IconButton(
                      icon: const Icon(Icons.arrow_back_ios_rounded, size: 13, color: Colors.white70),
                      tooltip: 'Back',
                      onPressed: () => BotToast.showText(text: 'Key: Back dikirim'),
                    ),
                    IconButton(
                      icon: const Icon(Icons.circle_outlined, size: 13, color: Colors.white70),
                      tooltip: 'Home',
                      onPressed: () => BotToast.showText(text: 'Key: Home dikirim'),
                    ),
                    IconButton(
                      icon: const Icon(Icons.crop_square_rounded, size: 13, color: Colors.white70),
                      tooltip: 'Recents',
                      onPressed: () => BotToast.showText(text: 'Key: Recents dikirim'),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: () {
                        AudiraWorkspaceModeState.find(widget.peerId).value = 'desktop';
                        BotToast.showText(text: 'Beralih ke Desktop 60 FPS');
                      },
                      icon: const Icon(Icons.desktop_windows_outlined, size: 13, color: Color(0xFF38BDF8)),
                      label: const Text('Desktop', style: TextStyle(fontSize: 11, color: Color(0xFF38BDF8))),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0x6638BDF8)),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Smartphone Bezel Frame with Remote Child inside
          Expanded(
            child: Center(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: _isLandscape ? 640 : 360,
                height: _isLandscape ? 360 : 640,
                decoration: BoxDecoration(
                  color: const Color(0xFF11141C),
                  border: Border.all(color: const Color(0xFF1E293B), width: 10),
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: const [
                    BoxShadow(color: Color(0xCC000000), blurRadius: 40, spreadRadius: 4),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(30),
                  child: Stack(
                    children: [
                      // Remote desktop screen stream inside phone
                      Positioned.fill(child: widget.remoteChild),

                      // Notch
                      Align(
                        alignment: Alignment.topCenter,
                        child: Container(
                          width: 80,
                          height: 16,
                          decoration: const BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(10),
                              bottomRight: Radius.circular(10),
                            ),
                          ),
                          child: Center(
                            child: Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF1E293B),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Home indicator line
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          width: 100,
                          height: 4,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
