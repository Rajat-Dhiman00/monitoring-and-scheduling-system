@echo off
REM Event Reminder System Build Script for Windows
REM Requires MinGW-w64 or Visual Studio Build Tools

echo Event Reminder System - Windows Build Script
echo =============================================

REM Check if g++ is available
where g++ >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: g++ not found in PATH
    echo Please install MinGW-w64 or Visual Studio Build Tools
    echo Download from: https://www.mingw-w64.org/downloads/
    pause
    exit /b 1
)

REM Create directories
if not exist obj mkdir obj
if not exist bin mkdir bin

echo Building Event Reminder System for Windows...

REM Compile source files
echo Compiling source files...
g++ -std=c++17 -Wall -Wextra -O2 -Iinclude -c src/Event.cpp -o obj/Event.o
if %ERRORLEVEL% NEQ 0 goto :error

g++ -std=c++17 -Wall -Wextra -O2 -Iinclude -c src/EventManager.cpp -o obj/EventManager.o
if %ERRORLEVEL% NEQ 0 goto :error

g++ -std=c++17 -Wall -Wextra -O2 -Iinclude -c src/FileHandler.cpp -o obj/FileHandler.o
if %ERRORLEVEL% NEQ 0 goto :error

g++ -std=c++17 -Wall -Wextra -O2 -Iinclude -c src/UserInterface.cpp -o obj/UserInterface.o
if %ERRORLEVEL% NEQ 0 goto :error

g++ -std=c++17 -Wall -Wextra -O2 -Iinclude -c src/main.cpp -o obj/main.o
if %ERRORLEVEL% NEQ 0 goto :error

REM Link executable
echo Linking executable...
g++ obj/Event.o obj/EventManager.o obj/FileHandler.o obj/UserInterface.o obj/main.o -o bin/event_reminder_windows.exe -static-libgcc -static-libstdc++ -static
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ✓ Build completed successfully!
echo ✓ Executable created: bin/event_reminder_windows.exe
echo.
echo To run the program:
echo   bin\event_reminder_windows.exe
echo.
pause
exit /b 0

:error
echo.
echo ✗ Build failed!
echo Please check the error messages above.
pause
exit /b 1
