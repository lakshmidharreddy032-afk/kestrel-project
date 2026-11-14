@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%PATH%"

echo =========================================================================
echo   KESTREL PROJECT - GITHUB PUSH WIZARD
echo   Target: https://github.com/lakshmidharreddy032-afk/kestrel-project
echo =========================================================================
echo.
echo  [1] Push with Browser Login (Ensure '6302800892' is cleared from Credential Manager)
echo  [2] Push with GitHub Personal Access Token (PAT) (Instant & Guaranteed)
echo.
set /p CHOICE="Select option (1 or 2): "

if "%CHOICE%"=="2" (
    echo.
    echo Generate a token at: https://github.com/settings/tokens (Select 'repo' scope)
    set /p GHTOKEN="Paste your GitHub Token (ghp_...): "
    if not "%GHTOKEN%"=="" (
        git remote set-url origin https://%GHTOKEN%@github.com/lakshmidharreddy032-afk/kestrel-project.git
        git push -u origin main
        git remote set-url origin https://github.com/lakshmidharreddy032-afk/kestrel-project.git
    )
) else (
    git config credential.https://github.com.username lakshmidharreddy032-afk
    git push -u origin main
)

echo.
echo =========================================================================
pause
