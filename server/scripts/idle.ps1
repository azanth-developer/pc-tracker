Add-Type @"
using System;
using System.Runtime.InteropServices;
public struct LASTINPUTINFO {
    public uint cbSize;
    public uint dwTime;
}
public class IdleCheck {
    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
}
"@

while ($true) {
    $info = New-Object LASTINPUTINFO
    $info.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($info)
    [IdleCheck]::GetLastInputInfo([ref]$info) | Out-Null
    $idle = [Math]::Round(([Environment]::TickCount - $info.dwTime) / 1000)
    Write-Output $idle
    Start-Sleep -Seconds 5
}
