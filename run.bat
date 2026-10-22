@echo off
title EduAgent Pro - Academic AI Productivity Platform
echo Starting EduAgent Pro Next.js Application...
set "PATH=C:\Program Files\nodejs;%PATH%"
set NEXT_TELEMETRY_DISABLED=1
cd /d "%~dp0"
node ./node_modules/next/dist/bin/next dev -p 3000
pause
