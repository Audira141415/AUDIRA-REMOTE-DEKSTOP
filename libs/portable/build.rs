fn main() {
    #[cfg(windows)]
    {
        use std::io::Write;
        let mut res = winres::WindowsResource::new();
        res.set_icon("../../res/icon.ico")
            .set_language(winapi::um::winnt::MAKELANGID(
                winapi::um::winnt::LANG_ENGLISH,
                winapi::um::winnt::SUBLANG_ENGLISH_US,
            ))
            .set_manifest_file("../../res/manifest.xml")
            .set("CompanyName", "Audira Studio (Agus Dwi R)")
            .set("FileDescription", "AUDIRA Remote Desktop Client - by Agus Dwi R")
            .set("ProductName", "AUDIRA Remote Desktop")
            .set("LegalCopyright", "Copyright (C) 2026 Agus Dwi R (Audira). All rights reserved.")
            .set("Comments", "Developed by Agus Dwi R (Audira). Enterprise Encrypted Remote Desktop.")
            .set("ProductVersion", "1.5.0")
            .set("FileVersion", "1.5.0.0")
            .set("OriginalFilename", "AudiraDesk.exe");
        match res.compile() {
            Err(e) => {
                write!(std::io::stderr(), "{}", e).unwrap();
                std::process::exit(1);
            }
            Ok(_) => {}
        }
    }
}
