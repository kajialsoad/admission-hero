@echo off
echo Building Flutter Debug APK...
echo.

REM Clear all caches
echo Clearing Flutter cache...
flutter clean
if %errorlevel% neq 0 goto error

echo Clearing Gradle cache...
rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul
rmdir /s /q "android\build" 2>nul
rmdir /s /q "android\.gradle" 2>nul

echo Getting dependencies...
flutter pub get
if %errorlevel% neq 0 goto error

echo Building APK (this may take a few minutes)...
flutter build apk --debug --no-tree-shake-icons --no-shrink
if %errorlevel% neq 0 goto error

echo.
echo ✅ APK built successfully!
echo Location: build\app\outputs\flutter-apk\app-debug.apk
echo.
goto end

:error
echo.
echo ❌ Build failed. Please check the error messages above.
echo.

:end
pause