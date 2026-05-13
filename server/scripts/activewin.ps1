Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinTracker {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@

while ($true) {
    $hwnd = [WinTracker]::GetForegroundWindow()
    $sb = New-Object System.Text.StringBuilder(256)
    [WinTracker]::GetWindowText($hwnd, $sb, 256) | Out-Null
    $title = $sb.ToString()
    $pid = 0
    [WinTracker]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "Unknown" }
    Write-Output "$name|||$title"
    Start-Sleep -Seconds 1
}
