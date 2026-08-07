@echo off
chcp 65001 >nul
rem Modes: 1 = barcode and EAC, 2 = type size by windows, 3 = caramel type and contrast,
rem crop = zoomed crop, img = webp images for the blog article.
rem Paths to the label files are set inside the scripts (DIR / SRC / FILES).
setlocal
set "PATHEXT=.COM;.EXE;.BAT;.CMD;.JS"
set "PATH=F:\Program Files\nodejs;%PATH%"
cd /d "F:\dev\design.kovtun.studio"
if "%~1"=="1" node.exe "docs\tools\label-measure\measure-1-barcode-eac.cjs"
if "%~1"=="2" node.exe "docs\tools\label-measure\measure-2-windows.cjs"
if "%~1"=="3" node.exe "docs\tools\label-measure\measure-3-type-and-color.cjs"
if "%~1"=="crop" node.exe "docs\tools\label-measure\crop.cjs"
if "%~1"=="img" node.exe "docs\tools\label-measure\make-blog-images.cjs"
if "%~1"=="" echo Modes: 1, 2, 3, crop, img
endlocal
