@echo off
chcp 65001 >nul
title Push to GitHub → Vercel Deploy
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║   Push โค้ด e-office กองช่าง ขึ้น GitHub + Vercel   ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo [1/4] ตรวจสอบสถานะ git...
git status --short
echo.
echo [2/4] เพิ่มไฟล์ที่แก้ไขทั้งหมด...
git add -A
git commit -m "feat: redesign public report page UI"
echo.
echo [3/4] Push commit ขึ้น GitHub (main branch)...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo ⚠️  Push ไม่สำเร็จ — กรุณา login GitHub ใน Git Credential Manager
    echo     หรือรัน: git remote set-url origin https://YOUR_TOKEN@github.com/nddsmed-cloud/nondindaeng-smart-garage.git
    pause
    exit /b 1
)
echo.
echo ✅ Push สำเร็จ!
echo.
echo [4/4] Vercel จะ deploy อัตโนมัติ ติดตามได้ที่:
echo     https://vercel.com/erp-nondindaeng/6-ndd-smart-garage
echo.
echo 🌐 Production URL:
echo     https://6-ndd-smart-garage.vercel.app
echo.
pause
