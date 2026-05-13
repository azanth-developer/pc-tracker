# Fix: PowerShell blocks `npm.ps1` (Execution Policy)

Your terminal error:

> `npm : File C:\nodejs\npm.ps1 cannot be loaded because running scripts is disabled...`

This happens when PowerShell execution policy blocks running scripts.

## Option 1 (recommended): Use cmd.exe for npm

Run these in **Command Prompt** (cmd):

```bat
cd "C:\Users\sazan\Downloads\PC TRACKER"
npm run electron:build
```

## Option 2: Allow scripts for the current user (PowerShell)

In PowerShell, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then close/reopen the terminal and run `npm` again.

## Option 3: Bypass only for this command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run electron:build"
```

## Note about `&&`

Some of your earlier failures also showed that `&&` was being rejected as a statement separator.
This repo was updated to avoid `&&` inside `package.json` scripts (switched to `;`).
The remaining blocker is execution policy (`npm.ps1`).

