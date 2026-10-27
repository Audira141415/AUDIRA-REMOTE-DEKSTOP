/**
 * Audira Signature Shield - JavaScript / TypeScript Verifier & Anti-Tamper Guard
 * Kompatibel dengan: Node.js (Express, Nest, Next.js, Fastify) & Browser (Vue, React, HTML Web).
 * Dibuat khusus untuk aplikasi Web Audira (misal: AUDIRA-TOPUPGAME, Web Dashboard, dsb.)
 */

(function (global) {
  const DEFAULT_SECRET = "AUDIRA_MASTER_SEC_KEY_2026_AGUS_DWI_R_IMMUTABLE_SIGNATURE_9981";
  const EXPECTED_CREATOR = "Agus Dwi R (Audira)";

  function canonicalString(payload) {
    const coreKeys = ["creator", "owner_id", "app_name", "issued_date", "canary_token"];
    const sortedObj = {};
    for (const key of coreKeys.sort()) {
      sortedObj[key] = payload[key] || "";
    }
    return JSON.stringify(sortedObj);
  }

  // Node.js crypto detection
  const isNode = typeof process !== "undefined" && process.versions && process.versions.node;
  let nodeCrypto = null;
  if (isNode) {
    try {
      nodeCrypto = require("crypto");
    } catch (e) {}
  }

  const AudiraShield = {
    expectedCreator: EXPECTED_CREATOR,

    /**
     * Verifikasi token tanda tangan digital
     * @param {string|object} tokenOrObject Token Base64 atau object JSON tanda tangan
     * @param {string} [secret] Kunci rahasia master
     * @returns {{isValid: boolean, message: string, payload: object}}
     */
    verify: function (tokenOrObject, secret = DEFAULT_SECRET) {
      let payload = null;
      try {
        if (typeof tokenOrObject === "string") {
          // Decode Base64 jika format token
          let jsonStr = "";
          if (isNode) {
            jsonStr = Buffer.from(tokenOrObject, "base64").toString("utf-8");
          } else {
            jsonStr = atob(tokenOrObject);
          }
          payload = JSON.parse(jsonStr);
        } else {
          payload = tokenOrObject;
        }
      } catch (err) {
        return { isValid: false, message: "Format tanda tangan rusak: " + err.message, payload: {} };
      }

      if (!payload || typeof payload !== "object") {
        return { isValid: false, message: "Payload tidak valid.", payload: {} };
      }

      if (payload.creator !== EXPECTED_CREATOR) {
        return {
          isValid: false,
          message: `PELANGGARAN HAK CIPTA: Pembuat asli adalah '${EXPECTED_CREATOR}', tetapi terbaca '${payload.creator}'`,
          payload: payload,
        };
      }

      if (!payload.digital_signature) {
        return { isValid: false, message: "Tanda tangan digital tidak ditemukan.", payload: payload };
      }

      // Jika berjalan di Node.js, verifikasi kriptografis langsung
      if (nodeCrypto) {
        const canonical = canonicalString(payload);
        const computedSig = nodeCrypto.createHmac("sha256", secret).update(canonical).digest("hex");
        if (computedSig !== payload.digital_signature) {
          return {
            isValid: false,
            message: "Tanda tangan digital TIDAK COCOK! Modifikasi ilegal terdeteksi.",
            payload: payload,
          };
        }
      }

      return {
        isValid: true,
        message: `Identitas Sah: ${payload.creator} | Aplikasi: ${payload.app_name}`,
        payload: payload,
      };
    },

    /**
     * Menegakkan tanda tangan di runtime.
     * Jika rusak, di web akan memunculkan banner peringatan permanen di layar.
     * Di Node.js akan mematikan proses (process.exit).
     */
    enforce: function (tokenOrObject, expectedAppName = null) {
      const result = this.verify(tokenOrObject);
      let isValid = result.isValid;
      let reason = result.message;

      if (isValid && expectedAppName && result.payload.app_name !== expectedAppName) {
        isValid = false;
        reason = `Nama aplikasi tidak sesuai! Diharapkan: ${expectedAppName}, tetapi terbaca: ${result.payload.app_name}`;
      }

      if (!isValid) {
        console.error(
          `%c[SECURITY SHIELD VIOLATION] APLIKASI DIBAJAK ATAU DIRUSAK!\nPemilik Asli: ${EXPECTED_CREATOR}\nPesan: ${reason}`,
          "color: white; background: red; font-size: 16px; font-weight: bold; padding: 10px;"
        );

        if (isNode) {
          process.stderr.write(`[AUDIRA SHIELD] Exit: ${reason}\n`);
          process.exit(99);
        } else if (typeof document !== "undefined") {
          // Di browser: tempelkan watermark merah permanen yang tidak bisa ditutup
          window.addEventListener("DOMContentLoaded", () => {
            const overlay = document.createElement("div");
            overlay.id = "audira-piracy-watermark";
            overlay.setAttribute(
              "style",
              "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(180, 0, 0, 0.95); z-index: 99999999; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;"
            );
            overlay.innerHTML = `
              <h1 style="font-size: 32px; margin-bottom: 10px;">⚠️ PERINGATAN MODIFIKASI ILEGAL</h1>
              <p style="font-size: 18px; max-width: 600px; line-height: 1.6;">
                Aplikasi ini telah dimodifikasi atau dicuri tanpa izin.<br>
                Hak Cipta Asli dan Kepemilikan Eksklusif terdaftar atas nama:
              </p>
              <h2 style="background: #fff; color: #b00; padding: 10px 25px; border-radius: 8px; font-size: 26px; margin: 15px 0;">
                ${EXPECTED_CREATOR}
              </h2>
              <p style="font-size: 14px; opacity: 0.85;">Pesan: ${reason}</p>
            `;
            document.body.appendChild(overlay);
          });
        }
        return false;
      }

      // Jika valid, tampilkan watermark terverifikasi di console pengembang
      console.log(
        `%c🛡️ AUDIRA SHIELD VERIFIED: Licensed to ${EXPECTED_CREATOR} (${result.payload.app_name})`,
        "color: #10b981; font-weight: bold; font-size: 12px;"
      );
      return true;
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AudiraShield;
  } else {
    global.AudiraShield = AudiraShield;
  }
})(typeof window !== "undefined" ? window : globalThis);
