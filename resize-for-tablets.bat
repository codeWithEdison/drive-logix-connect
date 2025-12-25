@echo off
REM Batch resize screenshots for 10-inch tablet Google Play requirements
REM Resizes to 1080x1920 (9:16 ratio)

echo ========================================
echo Resize Screenshots for 10-inch Tablet
echo ========================================
echo.

REM Create output directory
mkdir "play-store-assets\screenshots\tablet-correct" 2>nul

echo Converting screenshots to 1080x1920...
echo.

REM Using ImageMagick (if installed)
REM If you don't have ImageMagick, use online tools instead

magick "assets\app screenshhot\login.png" -resize 1080x1920! "play-store-assets\screenshots\tablet-correct\10inch-1-login.png"
magick "assets\app screenshhot\landing.png" -resize 1080x1920! "play-store-assets\screenshots\tablet-correct\10inch-2-landing.png"
magick "assets\app screenshhot\dashboard.PNG" -resize 1080x1920! "play-store-assets\screenshots\tablet-correct\10inch-3-dashboard.png"
magick "assets\app screenshhot\cargos.PNG" -resize 1080x1920! "play-store-assets\screenshots\tablet-correct\10inch-4-cargos.png"
magick "assets\app screenshhot\cargo-details.PNG" -resize 1080x1920! "play-store-assets\screenshots\tablet-correct\10inch-5-cargo-details.png"
magick "assets\app screenshhot\create-cargo.png" -resize 1080x1920! "play-store-assets\screenshots\tablet-correct\10inch-6-create-cargo.png"

echo.
echo ========================================
echo Done! Screenshots saved to:
echo play-store-assets\screenshots\tablet-correct\
echo ========================================
echo.
echo Your screenshots are now ready for upload!
echo They are exactly 1080x1920 pixels (9:16 ratio)
echo.
pause


