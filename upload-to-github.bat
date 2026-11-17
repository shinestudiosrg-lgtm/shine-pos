@echo off
echo ===================================================
echo   AUTOMATIC GITHUB UPLOADER FOR SHINE POS
echo ===================================================
echo.
set /p REPO_URL="Masukkan URL Repository GitHub Anda (contoh: https://github.com/username/shine-pos-app.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] URL Repository tidak boleh kosong!
    pause
    exit /b
)

echo.
echo [1/4] Menginisialisasi Repository Git...
git init
git config user.email "shinestudiosrg@gmail.com"
git config user.name "Shine Studio"

echo.
echo [2/4] Mengumpulkan file proyek SHINE POS...
git add .

echo.
echo [3/4] Membuat commit...
git commit -m "Upload SHINE POS Web App - Vercel PWA & WhatsApp Integration"

echo.
echo [4/4] Mengunggah ke GitHub...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ===================================================
echo [BERHASIL] Proyek SHINE POS telah diunggah ke GitHub!
echo ===================================================
pause
