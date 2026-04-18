@echo off
REM Script to update Railway backend URL across all projects
REM Usage: update-railway-url.bat https://your-app.up.railway.app

if "%~1"=="" (
    echo Error: Please provide your Railway backend URL
    echo Usage: update-railway-url.bat https://your-app.up.railway.app
    exit /b 1
)

set RAILWAY_URL=%~1
set API_URL=%RAILWAY_URL%/api

echo Updating Railway backend URL to: %API_URL%
echo.

REM Update Admin Dashboard
echo Updating Admin Dashboard...
if exist "admin-dashboard\.env" (
    powershell -Command "(Get-Content 'admin-dashboard\.env') -replace 'NEXT_PUBLIC_API_URL=.*', 'NEXT_PUBLIC_API_URL=%API_URL%' | Set-Content 'admin-dashboard\.env'"
    echo Admin Dashboard updated
) else (
    echo Warning: admin-dashboard\.env not found
)

REM Update Mobile App
echo Updating Mobile App...
if exist "frontend\.env" (
    powershell -Command "(Get-Content 'frontend\.env') -replace 'EXPO_PUBLIC_API_URL=.*', 'EXPO_PUBLIC_API_URL=%API_URL%' | Set-Content 'frontend\.env'"
    echo Mobile App updated
) else (
    echo Warning: frontend\.env not found
)

echo.
echo All done! Your apps are now configured to use Railway backend.
echo.
echo Next steps:
echo 1. Rebuild admin dashboard: cd admin-dashboard ^&^& npm run build
echo 2. Restart mobile app: cd frontend ^&^& npx expo start
echo.
echo Test your backend: curl %API_URL%/health
