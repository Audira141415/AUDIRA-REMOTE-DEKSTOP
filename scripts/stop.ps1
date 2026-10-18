# AUDIRA Remote Desktop - Desktop PC Shutdown Utility
$ErrorActionPreference = "SilentlyContinue"

Write-Host "==============================================================================" -ForegroundColor Yellow
Write-Host "             AUDIRA Remote Desktop - Graceful Shutdown Utility                " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Yellow
Write-Host "[INFO] Menghentikan semua proses AUDIRA Remote Desktop..." -ForegroundColor Gray
Write-Host ""

$targetProcesses = @(
    "AudiraDesk",
    "audira",
    "rustdesk",
    "RustDesk",
    "flutter_hbb",
    "rustdesk-service"
)

$terminatedCount = 0

foreach ($procName in $targetProcesses) {
    $procs = Get-Process -Name $procName -ErrorAction SilentlyContinue
    if ($procs) {
        foreach ($proc in $procs) {
            Write-Host "  [-] Menghentikan proses: $($proc.ProcessName) (PID: $($proc.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $terminatedCount++
        }
    }
}

# Periksa port lokal jika ada listener aktif (21115, 21116, 21117, 21118)
$ports = @(21115, 21116, 21117, 21118)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($p -and ($p.ProcessName -like "*rustdesk*" -or $p.ProcessName -like "*cargo*")) {
                Write-Host "  [-] Menutup listener port $port (PID: $procId - $($p.ProcessName))..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                $terminatedCount++
            }
        }
    }
}

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "[VERIFIKASI] Status Proses:" -ForegroundColor Cyan
$stillRunning = Get-Process -Name "audira", "rustdesk", "RustDesk" -ErrorAction SilentlyContinue
if ($stillRunning) {
    Write-Host "  [!] Masih ada proses yang berjalan: PID $($stillRunning.Id -join ', ')" -ForegroundColor Red
} else {
    Write-Host "  [OK] Semua proses AUDIRA Remote Desktop telah berhenti." -ForegroundColor Green
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
if ($terminatedCount -gt 0) {
    Write-Host "[SUCCESS] $terminatedCount proses AUDIRA Remote Desktop berhasil dihentikan." -ForegroundColor Green
} else {
    Write-Host "[INFO] Tidak ada proses AUDIRA Remote Desktop yang sedang aktif." -ForegroundColor Green
}
Write-Host "==============================================================================" -ForegroundColor Green
