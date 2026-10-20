# PowerShell Script: AUDIRA Host Process & Port Health Monitor

Write-Host ">>> Checking AUDIRA Remote Desktop Process Status..." -ForegroundColor Cyan

$Processes = Get-Process -Name "audira", "rustdesk" -ErrorAction SilentlyContinue

if ($Processes) {
    Write-Host "  [RUNNING] Active executable instances found:" -ForegroundColor Green
    $Processes | Select-Object Id, ProcessName, WorkingSet64 | Format-Table -AutoSize
} else {
    Write-Host "  [STOPPED] No active host processes detected." -ForegroundColor Yellow
}

Write-Host ">>> Checking Rendezvous/Relay Network Ports..." -ForegroundColor Cyan
$Ports = @(21115, 21116, 21117, 21118, 21119)
foreach ($Port in $Ports) {
    $Listening = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($Listening) {
        Write-Host "  Port $Port is LISTENING (Owning PID: $($Listening.OwningProcess))" -ForegroundColor Green
    } else {
        Write-Host "  Port $Port is FREE" -ForegroundColor DarkGray
    }
}
