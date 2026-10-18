import os

with open(r'src/lang/id.rs', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '("connecting_status", "Menghubungkan ke RustDesk...")': '("connecting_status", "Menghubungkan ke Audira Desk...")',
    '("install_tip", "Karena UAC, RustDesk tidak dapat bekerja dengan baik sebagai sisi remote dalam beberapa kasus. Untuk menghindari UAC, silakan klik tombol di bawah ini untuk menginstal RustDesk ke sistem.")': '("install_tip", "Karena UAC, Audira Desk tidak dapat bekerja dengan baik sebagai sisi remote dalam beberapa kasus. Untuk menghindari UAC, silakan klik tombol di bawah ini untuk menginstal Audira Desk ke sistem.")',
    '("config_acc", "Agar bisa mengontrol Desktopmu dari jarak jauh, Kamu harus memberikan izin \\"Aksesibilitas\\" untuk RustDesk.")': '("config_acc", "Agar bisa mengontrol Desktopmu dari jarak jauh, Kamu harus memberikan izin \\"Aksesibilitas\\" untuk Audira Desk.")',
    '("config_screen", "Agar bisa mengakses Desktopmu dari jarak jauh, kamu harus memberikan izin \\"Perekaman Layar\\" untuk RustDesk.")': '("config_screen", "Agar bisa mengakses Desktopmu dari jarak jauh, kamu harus memberikan izin \\"Perekaman Layar\\" untuk Audira Desk.")',
    '("Keep RustDesk background service", "Pertahankan RustDesk berjalan pada service background")': '("Keep RustDesk background service", "Pertahankan Audira Desk berjalan pada service background")',
    '("Show RustDesk", "Tampilkan RustDesk")': '("Show RustDesk", "Tampilkan Audira Desk")',
    '("config_input", "Untuk menggunakan input keyboard remote, anda perlu memberikan izin \\"Pemantauan Input\\" pada RustDesk")': '("config_input", "Untuk menggunakan input keyboard remote, anda perlu memberikan izin \\"Pemantauan Input\\" pada Audira Desk")',
    '("config_microphone", "Untuk berbicara secara remote, anda perlu memberikan izin \\"Rekam Audio\\" pada RustDesk")': '("config_microphone", "Untuk berbicara secara remote, anda perlu memberikan izin \\"Rekam Audio\\" pada Audira Desk")',
    '("still_click_uac_tip", "Masih memerlukan persetujuan pihak pengguna remote untuk mengklik OK pada jendela UAC RustDesk yang sedang berjalan")': '("still_click_uac_tip", "Masih memerlukan persetujuan pihak pengguna remote untuk mengklik OK pada jendela UAC Audira Desk yang sedang berjalan")',
    '("verify_rustdesk_password_tip", "Verifikasi Kata Sandi RustDesk")': '("verify_rustdesk_password_tip", "Verifikasi Kata Sandi Audira Desk")',
    '("scam_text1", "Jika anda sedang berbicara di telepon dengan seseorang yang TIDAK dikenal dan mereka meminta anda untuk menggunakan RustDesk, jangan lanjutkan dan segera tutup panggilan.")': '("scam_text1", "Jika anda sedang berbicara di telepon dengan seseorang yang TIDAK dikenal dan mereka meminta anda untuk menggunakan Audira Desk, jangan lanjutkan dan segera tutup panggilan.")',
    '("upgrade_rustdesk_server_pro_to_{}_tip", "Silahkan perbarui RustDesk Server Pro ke versi {} atau yang lebih baru!")': '("upgrade_rustdesk_server_pro_to_{}_tip", "Silahkan perbarui Audira Server ke versi {} atau yang lebih baru!")',
    '("selinux_tip", "pada perangkat anda, SELinux sedang aktif, yang mana itu dapat mencegah RustDesk berfungsi dengan baik sebagai sisi yang dikontrol.")': '("selinux_tip", "pada perangkat anda, SELinux sedang aktif, yang mana itu dapat mencegah Audira Desk berfungsi dengan baik sebagai sisi yang dikontrol.")',
    '("allow-only-conn-window-open-tip", "Koneksi hanya diperbolehkan jika jendela RustDesk sedang terbuka.")': '("allow-only-conn-window-open-tip", "Koneksi hanya diperbolehkan jika jendela Audira Desk sedang terbuka.")',
    '("floating_window_tip", "Untuk menjaga layanan/service RustDesk agar tetap aktif")': '("floating_window_tip", "Untuk menjaga layanan/service Audira Desk agar tetap aktif")',
    '("About RustDesk", "Tentang RustDesk")': '("About RustDesk", "Tentang Audira Desk")',
    '("upgrade_remote_rustdesk_client_to_{}_tip", "Silahkan perbarui aplikasi RustDesk ke versi {} atau yang lebih baru pada komputer yang akan terhubung!")': '("upgrade_remote_rustdesk_client_to_{}_tip", "Silahkan perbarui aplikasi Audira Desk ke versi {} atau yang lebih baru pada komputer yang akan terhubung!")',
    '("server-oss-not-support-tip", "CATATAN: RustDesk server OSS tidak menyertakan fitur ini.")': '("server-oss-not-support-tip", "CATATAN: Audira Server OSS tidak menyertakan fitur ini.")',
}

count = 0
for k, v in replacements.items():
    if k in content:
        content = content.replace(k, v)
        count += 1
    else:
        print('Not found:', k[:50])

with open(r'src/lang/id.rs', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'[+] Updated {count} translations in id.rs')

# Also check en.rs
with open(r'src/lang/en.rs', 'r', encoding='utf-8') as f:
    en_content = f.read()

en_adds = [
    '("About RustDesk", "About Audira Desk"),',
    '("Keep RustDesk background service", "Keep Audira Desk background service"),',
    '("Show RustDesk", "Show Audira Desk"),',
    '("verify_rustdesk_password_tip", "Verify Audira Desk Password"),',
    '("About", "About"),',
]

to_insert = []
for entry in en_adds:
    if entry not in en_content:
        to_insert.append("        " + entry)

if to_insert:
    # insert before the closing ]
    idx = en_content.rfind(']')
    if idx != -1:
        en_content = en_content[:idx] + "\n".join(to_insert) + "\n    " + en_content[idx:]
        with open(r'src/lang/en.rs', 'w', encoding='utf-8') as f:
            f.write(en_content)
        print(f'[+] Added {len(to_insert)} translations to en.rs')
