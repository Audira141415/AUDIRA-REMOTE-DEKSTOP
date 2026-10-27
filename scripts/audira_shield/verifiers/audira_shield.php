<?php
/**
 * Audira Signature Shield - PHP Verifier & Anti-Tamper Guard
 * Dibuat khusus untuk aplikasi Web PHP / Laravel milik Agus Dwi R (Audira).
 * Cocok untuk: AUDIRA-TOPUPGAME, AUDIRA-APLIKASI-KASIR, AUDIRA-NET-BILLING, dsb.
 */

namespace Audira\Shield;

class AudiraShield
{
    const DEFAULT_SECRET = "AUDIRA_MASTER_SEC_KEY_2026_AGUS_DWI_R_IMMUTABLE_SIGNATURE_9981";
    const EXPECTED_CREATOR = "Agus Dwi R (Audira)";

    /**
     * Membentuk canonical string dari payload
     */
    private static function canonicalString(array $payload): string
    {
        $coreKeys = ["creator", "owner_id", "app_name", "issued_date", "canary_token"];
        sort($coreKeys);
        $sorted = [];
        foreach ($coreKeys as $k) {
            $sorted[$k] = isset($payload[$k]) ? (string)$payload[$k] : "";
        }
        return json_encode($sorted, JSON_UNESCAPED_SLASHES);
    }

    /**
     * Verifikasi token atau array tanda tangan
     */
    public static function verify($tokenOrArray, string $secret = self::DEFAULT_SECRET): array
    {
        $payload = null;
        if (is_string($tokenOrArray)) {
            $decoded = base64_decode($tokenOrArray, true);
            if (!$decoded) {
                return ['isValid' => false, 'message' => 'Format token Base64 rusak.', 'payload' => []];
            }
            $payload = json_decode($decoded, true);
        } elseif (is_array($tokenOrArray)) {
            $payload = $tokenOrArray;
        }

        if (!is_array($payload)) {
            return ['isValid' => false, 'message' => 'Payload JSON tidak valid.', 'payload' => []];
        }

        if (($payload['creator'] ?? '') !== self::EXPECTED_CREATOR) {
            return [
                'isValid' => false,
                'message' => "PELANGGARAN HAK CIPTA: Pembuat asli adalah '" . self::EXPECTED_CREATOR . "', terbaca '" . ($payload['creator'] ?? '') . "'",
                'payload' => $payload
            ];
        }

        if (empty($payload['digital_signature'])) {
            return ['isValid' => false, 'message' => 'Tanda tangan digital tidak ditemukan.', 'payload' => $payload];
        }

        $canonical = self::canonicalString($payload);
        $computedSig = hash_hmac('sha256', $canonical, $secret);

        if (!hash_equals($computedSig, $payload['digital_signature'])) {
            return [
                'isValid' => false,
                'message' => 'Tanda tangan digital CACAT/PALSU! Modifikasi ilegal terdeteksi.',
                'payload' => $payload
            ];
        }

        return [
            'isValid' => true,
            'message' => "Identitas Sah: " . self::EXPECTED_CREATOR . " | Aplikasi: " . ($payload['app_name'] ?? ''),
            'payload' => $payload
        ];
    }

    /**
     * Penegakan otomatis saat aplikasi dijalankan
     */
    public static function enforce($tokenOrArray, string $expectedAppName = null, string $onTamper = 'die'): bool
    {
        $result = self::verify($tokenOrArray);
        $isValid = $result['isValid'];
        $message = $result['message'];

        if ($isValid && $expectedAppName && ($result['payload']['app_name'] ?? '') !== $expectedAppName) {
            $isValid = false;
            $message = "Nama aplikasi tidak sesuai! Diharapkan: {$expectedAppName}, terbaca: " . ($result['payload']['app_name'] ?? '');
        }

        if (!$isValid) {
            if ($onTamper === 'die') {
                http_response_code(403);
                header('Content-Type: text/html; charset=utf-8');
                echo "<div style='font-family:sans-serif; background:#800; color:#fff; padding:40px; text-align:center;'>";
                echo "<h1>⚠️ PERINGATAN MODIFIKASI ILEGAL</h1>";
                echo "<p>Aplikasi ini telah dicuri atau dimodifikasi tanpa izin resmi.</p>";
                echo "<h2>Hak Cipta Sah: " . htmlspecialchars(self::EXPECTED_CREATOR) . "</h2>";
                echo "<p style='color:#fca;'>Error: " . htmlspecialchars($message) . "</p>";
                echo "</div>";
                exit(1);
            }
            return false;
        }

        return true;
    }
}
