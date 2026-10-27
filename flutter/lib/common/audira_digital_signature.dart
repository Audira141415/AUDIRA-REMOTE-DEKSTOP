import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';

/// 🛡️ AUDIRA DIGITAL SIGNATURE SHIELD
/// Sistem Tanda Tangan Digital Kriptografis Permanen & Hak Cipta Resmi
/// Dibuat dan Dilisensikan untuk: Agus Dwi R (Audira)
class AudiraDigitalSignature {
  static const String kMasterSecret =
      "AUDIRA_MASTER_SEC_KEY_2026_AGUS_DWI_R_IMMUTABLE_SIGNATURE_9981";
  static const String kExpectedCreator = "Agus Dwi R (Audira)";
  static const String kExpectedAppName = "AUDIRA-REMOTE-DEKSTOP";

  // Token resmi terenkripsi untuk AUDIRA-REMOTE-DEKSTOP
  static const String kEmbeddedToken =
      "eyJjcmVhdG9yIjogIkFndXMgRHdpIFIgKEF1ZGlyYSkiLCAib3duZXJfaWQiOiAiQVVESVJBLU9SSUdJTi1BR1VTLURXSS1SIiwgImFwcF9uYW1lIjogIkFVRElSQS1SRU1PVEUtREVLU1RPUCIsICJpc3N1ZWRfZGF0ZSI6ICIyMDI2LTEwLTI0VDIzOjA4OjUxWiIsICJjYW5hcnlfdG9rZW4iOiAiMGFkN2MxNzIxZTgwZTgwNTBjZTgxNGU4IiwgImxlZ2FsX25vdGljZSI6ICJIYWsgQ2lwdGEgRGlsaW5kdW5naSBVbmRhbmctVW5kYW5nLiBIYWsgS2VwZW1pbGlrYW4gRWtza2x1c2lmIEFndXMgRHdpIFIuIiwgImRpZ2l0YWxfc2lnbmF0dXJlIjogIjNhNTczODFiYTNlNjMyZjJmMWVkOWE1OWI4OGRkYzU1MWFjYTY4NGIzOGVhODMzMTNhYjFjOWNlNmI1NDBjNTMiLCAic2lnbmF0dXJlX2FsZ29yaXRobSI6ICJITUFDLVNIQTI1Ni1BVUQtVjEifQ==";

  static Map<String, dynamic>? _cachedPayload;
  static bool? _cachedIsValid;

  /// Memverifikasi integritas kriptografis tanda tangan digital
  static bool verify([String token = kEmbeddedToken]) {
    if (_cachedIsValid != null && token == kEmbeddedToken) {
      return _cachedIsValid!;
    }

    try {
      final jsonBytes = base64.decode(token.trim());
      final jsonString = utf8.decode(jsonBytes);
      final Map<String, dynamic> data = jsonDecode(jsonString);

      if (data['creator'] != kExpectedCreator) {
        debugPrint("[SECURITY VIOLATION] Pembuat asli bukan $kExpectedCreator!");
        _cachedIsValid = false;
        return false;
      }

      if (data['app_name'] != kExpectedAppName) {
        debugPrint("[SECURITY VIOLATION] Nama aplikasi tidak cocok!");
        _cachedIsValid = false;
        return false;
      }

      final sig = data['digital_signature']?.toString();
      if (sig == null || sig.isEmpty) {
        _cachedIsValid = false;
        return false;
      }

      // Canonical serialization
      final coreKeys = ["app_name", "canary_token", "creator", "issued_date", "owner_id"];
      final sortedMap = <String, dynamic>{};
      for (final k in coreKeys) {
        sortedMap[k] = data[k]?.toString() ?? "";
      }
      final canonicalStr = jsonEncode(sortedMap);

      final computedSig = _SimpleCrypto.hmacSha256(kMasterSecret, canonicalStr);
      final isValid = (computedSig.toLowerCase() == sig.toLowerCase());

      _cachedPayload = data;
      _cachedIsValid = isValid;
      return isValid;
    } catch (e) {
      debugPrint("[AUDIRA SHIELD ERROR] Gagal verifikasi tanda tangan: $e");
      _cachedIsValid = false;
      return false;
    }
  }

  static Map<String, dynamic> get payload {
    if (_cachedPayload == null) {
      verify();
    }
    return _cachedPayload ?? {};
  }

  /// Widget Kartu Tanda Tangan Digital Resmi (untuk Halaman About)
  static Widget buildSignatureCard(BuildContext context) {
    final isValid = verify();
    final data = payload;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      decoration: BoxDecoration(
        color: isValid ? const Color(0xFF0F172A) : const Color(0xFF450A0A),
        borderRadius: BorderRadius.circular(10.0),
        border: Border.all(
          color: isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444))
                .withOpacity(0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isValid ? Icons.verified_user_rounded : Icons.gpp_bad_rounded,
                color: isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                size: 24,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isValid
                      ? "Tanda Tangan Digital Resmi (Verified Cryptographic Stamp)"
                      : "PERINGATAN: Tanda Tangan Digital Cacat / Tidak Valid!",
                  style: TextStyle(
                    color: isValid ? const Color(0xFF34D399) : const Color(0xFFFCA5A5),
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "Pemilik & Hak Cipta Asli: $kExpectedCreator",
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "ID Pemilik: ${data['owner_id'] ?? 'AUDIRA-ORIGIN'}",
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          Text(
            "Canary Token / HKI: ${data['canary_token'] ?? '0ad7c1721e80e8050ce814e8'}",
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          Text(
            "Algoritma Kriptografi: ${data['signature_algorithm'] ?? 'HMAC-SHA256-AUD-V1'}",
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isValid ? "Status: TERVERIFIKASI & ASLI" : "Status: TIDAK RESMI / DIUBAH",
                style: TextStyle(
                  color: isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              OutlinedButton.icon(
                icon: const Icon(Icons.security_rounded, size: 14),
                label: const Text(
                  "Detail Sertifikat Digital",
                  style: TextStyle(fontSize: 11),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white30),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                ),
                onPressed: () => _showCertificateDialog(context, isValid, data),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static void _showCertificateDialog(
      BuildContext context, bool isValid, Map<String, dynamic> data) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Row(
          children: [
            Icon(
              isValid ? Icons.shield_rounded : Icons.warning_amber_rounded,
              color: isValid ? const Color(0xFF10B981) : Colors.red,
            ),
            const SizedBox(width: 8),
            const Text(
              "Sertifikat Digital Hak Cipta",
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ],
        ),
        content: SizedBox(
          width: 480,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _certRow("Aplikasi Terdaftar", data['app_name']?.toString() ?? ""),
                _certRow("Pemilik Sah & Pengembang", data['creator']?.toString() ?? ""),
                _certRow("Identifikasi Unik", data['owner_id']?.toString() ?? ""),
                _certRow("Tanggal Penerbitan", data['issued_date']?.toString() ?? ""),
                _certRow("Token Canary HKI", data['canary_token']?.toString() ?? ""),
                _certRow("Algoritma Signature", data['signature_algorithm']?.toString() ?? ""),
                const Divider(color: Colors.white24, height: 20),
                const Text(
                  "Nilai Tanda Tangan Kriptografis (Digital Signature):",
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black45,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: SelectableText(
                    data['digital_signature']?.toString() ?? "-",
                    style: const TextStyle(
                      color: Color(0xFF34D399),
                      fontFamily: "monospace",
                      fontSize: 10,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  data['legal_notice']?.toString() ??
                      "Hak Cipta Dilindungi Undang-Undang. Hak Kepemilikan Eksklusif Agus Dwi R.",
                  style: const TextStyle(color: Colors.white54, fontSize: 11, fontStyle: FontStyle.italic),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text("Tutup", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  static Widget _certRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 160,
            child: Text(
              label,
              style: const TextStyle(color: Colors.white60, fontSize: 12),
            ),
          ),
          const Text(": ", style: TextStyle(color: Colors.white60, fontSize: 12)),
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

/// Standalone Pure Dart SHA-256 and HMAC implementation (Zero dependency)
class _SimpleCrypto {
  static const List<int> _k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  static int _rotr(int x, int n) => ((x >>> n) | (x << (32 - n))) & 0xFFFFFFFF;

  static Uint8List sha256(Uint8List message) {
    int h0 = 0x6a09e667;
    int h1 = 0xbb67ae85;
    int h2 = 0x3c6ef372;
    int h3 = 0xa54ff53a;
    int h4 = 0x510e527f;
    int h5 = 0x9b05688c;
    int h6 = 0x1f83d9ab;
    int h7 = 0x5be0cd19;

    int bitLength = message.length * 8;
    int padLength = (56 - (message.length + 1) % 64) % 64;
    if (padLength < 0) padLength += 64;

    BytesBuilder builder = BytesBuilder();
    builder.add(message);
    builder.addByte(0x80);
    builder.add(Uint8List(padLength));
    ByteData lenData = ByteData(8);
    lenData.setUint64(0, bitLength, Endian.big);
    builder.add(lenData.buffer.asUint8List());

    Uint8List padded = builder.toBytes();
    ByteData byteData = ByteData.sublistView(padded);
    List<int> w = List<int>.filled(64, 0);

    for (int i = 0; i < padded.length; i += 64) {
      for (int t = 0; t < 16; t++) {
        w[t] = byteData.getUint32(i + t * 4, Endian.big);
      }
      for (int t = 16; t < 64; t++) {
        int s0 = _rotr(w[t - 15], 7) ^ _rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        int s1 = _rotr(w[t - 2], 17) ^ _rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) & 0xFFFFFFFF;
      }

      int a = h0;
      int b = h1;
      int c = h2;
      int d = h3;
      int e = h4;
      int f = h5;
      int g = h6;
      int h = h7;

      for (int t = 0; t < 64; t++) {
        int s1 = _rotr(e, 6) ^ _rotr(e, 11) ^ _rotr(e, 25);
        int ch = (e & f) ^ ((~e) & g);
        int temp1 = (h + s1 + ch + _k[t] + w[t]) & 0xFFFFFFFF;
        int s0 = _rotr(a, 2) ^ _rotr(a, 13) ^ _rotr(a, 22);
        int maj = (a & b) ^ (a & c) ^ (b & c);
        int temp2 = (s0 + maj) & 0xFFFFFFFF;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) & 0xFFFFFFFF;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) & 0xFFFFFFFF;
      }

      h0 = (h0 + a) & 0xFFFFFFFF;
      h1 = (h1 + b) & 0xFFFFFFFF;
      h2 = (h2 + c) & 0xFFFFFFFF;
      h3 = (h3 + d) & 0xFFFFFFFF;
      h4 = (h4 + e) & 0xFFFFFFFF;
      h5 = (h5 + f) & 0xFFFFFFFF;
      h6 = (h6 + g) & 0xFFFFFFFF;
      h7 = (h7 + h) & 0xFFFFFFFF;
    }

    ByteData out = ByteData(32);
    out.setUint32(0, h0, Endian.big);
    out.setUint32(4, h1, Endian.big);
    out.setUint32(8, h2, Endian.big);
    out.setUint32(12, h3, Endian.big);
    out.setUint32(16, h4, Endian.big);
    out.setUint32(20, h5, Endian.big);
    out.setUint32(24, h6, Endian.big);
    out.setUint32(28, h7, Endian.big);
    return out.buffer.asUint8List();
  }

  static String hmacSha256(String keyStr, String dataStr) {
    Uint8List key = utf8.encode(keyStr) as Uint8List;
    Uint8List data = utf8.encode(dataStr) as Uint8List;

    Uint8List kPrime = Uint8List(64);
    if (key.length > 64) {
      Uint8List kh = sha256(key);
      kPrime.setRange(0, kh.length, kh);
    } else {
      kPrime.setRange(0, key.length, key);
    }

    Uint8List oKeyPad = Uint8List(64);
    Uint8List iKeyPad = Uint8List(64);
    for (int i = 0; i < 64; i++) {
      oKeyPad[i] = kPrime[i] ^ 0x5c;
      iKeyPad[i] = kPrime[i] ^ 0x36;
    }

    BytesBuilder innerBuilder = BytesBuilder();
    innerBuilder.add(iKeyPad);
    innerBuilder.add(data);
    Uint8List innerHash = sha256(innerBuilder.toBytes());

    BytesBuilder outerBuilder = BytesBuilder();
    outerBuilder.add(oKeyPad);
    outerBuilder.add(innerHash);
    Uint8List finalHash = sha256(outerBuilder.toBytes());

    return finalHash.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }
}
