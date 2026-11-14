@echo off
set "APP_DIR=%~dp0"
set "APP_URL_FILE=file:///%APP_DIR:\=/%index.html"

rem run from temp so closing or ejecting the usb drive never hits a locked folder
cd /d "%TEMP%"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "exit 0" >nul 2>&1
if errorlevel 1 goto fallback

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%APP_DIR%usb-server.ps1"
if errorlevel 1 goto fallback
exit /b 0

:fallback
where msedge >nul 2>&1
if not errorlevel 1 (
  start "" msedge --app="%APP_URL_FILE%" --window-size=1380,880
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL_FILE%" --window-size=1380,880
  exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL_FILE%" --window-size=1380,880
  exit /b 0
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%APP_URL_FILE%" --window-size=1380,880
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%APP_URL_FILE%" --window-size=1380,880
  exit /b 0
)
start "" "%APP_DIR%index.html"
exit /b 0
