@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo =========================================================================
echo   KESTREL FINANCE - DOMAIN RULES ^& VITEST TEST BATTERY
echo =========================================================================
node --experimental-strip-types src\domain\rules\run-tests.mjs
echo =========================================================================
pause
