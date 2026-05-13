# TODO - Fix Windows build/packaging so installer works

## Step 1: Inspect current Electron Builder config
- [x] Read package.json to see existing electron-builder settings

## Step 2: Update packaging script/config
- [ ] Modify package.json:
  - Ensure `build.win.icon` points to an actual .ico or use an existing icon format correctly
  - Add/confirm `build.win.target` = `nsis`
  - Add `build.win.target` to produce both Setup.exe (installer) and portable exe if desired
  - Add/adjust `files`/`directories` if needed

## Step 3: Add proper build command(s)
- [ ] Update scripts so `npm run dist` / `npm run electron-builder` builds NSIS installer and portable

## Step 4: Build for correct CPU architectures
- [ ] Run electron-builder for both x64 and ia32 (recommended):
  - `npx electron-builder --win --x64 --ia32`

## Step 5: Verify output
- [ ] Confirm `dist/` contains `Setup.exe` and/or `Portable.exe`

## Step 6: Test on target PC
- [ ] Copy via ZIP/upload method (avoid WhatsApp raw EXE)
- [ ] Install using `Setup.exe`

