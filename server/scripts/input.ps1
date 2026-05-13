$signature = @"
[DllImport("user32.dll")]
public static extern short GetAsyncKeyState(int vKey);
"@
$api = Add-Type -MemberDefinition $signature -Name "Win32Input" -Namespace API -PassThru
$keys = 0
$clicks = 0

while ($true) {
    # Mouse buttons: 1=Left, 2=Right, 4=Middle
    for ($i = 1; $i -le 2; $i++) {
        $state = $api::GetAsyncKeyState($i)
        if (($state -band 1) -ne 0) { $clicks++ }
    }
    $state = $api::GetAsyncKeyState(4)
    if (($state -band 1) -ne 0) { $clicks++ }

    # Keyboard keys: 8-254
    for ($i = 8; $i -le 254; $i++) {
        $state = $api::GetAsyncKeyState($i)
        if (($state -band 1) -ne 0) { $keys++ }
    }

    Write-Output "$keys,$clicks"
    Start-Sleep -Milliseconds 200
}
