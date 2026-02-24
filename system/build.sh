#!/bin/bash

# Event Reminder System Build Script
# Supports Linux, Windows (MinGW), and Android builds

set -e

echo "Event Reminder System - Cross-Platform Build Script"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to build for Linux
build_linux() {
    echo "Building for Linux..."
    if ! command_exists g++; then
        echo "Error: g++ not found. Please install build-essential:"
        echo "  Ubuntu/Debian: sudo apt-get install build-essential"
        echo "  CentOS/RHEL: sudo yum groupinstall 'Development Tools'"
        exit 1
    fi
    
    make clean
    make linux
    echo "✓ Linux build completed: bin/event_reminder_linux"
}

# Function to build for Windows
build_windows() {
    echo "Building for Windows..."
    if ! command_exists x86_64-w64-mingw32-g++; then
        echo "Error: MinGW-w64 not found. Please install:"
        echo "  Ubuntu/Debian: sudo apt-get install mingw-w64"
        echo "  CentOS/RHEL: sudo yum install mingw64-gcc-c++"
        exit 1
    fi
    
    make clean
    make windows
    echo "✓ Windows build completed: bin/event_reminder_windows.exe"
}

# Function to build for Android
build_android() {
    echo "Building for Android/Termux..."
    if ! command_exists g++; then
        echo "Error: g++ not found. In Termux, install with:"
        echo "  pkg install clang"
        exit 1
    fi
    
    make clean
    make android
    echo "✓ Android build completed: bin/event_reminder_android"
}

# Function to create portable package
create_package() {
    echo "Creating portable package..."
    
    # Create package directory
    PACKAGE_DIR="event_reminder_portable"
    rm -rf "$PACKAGE_DIR"
    mkdir -p "$PACKAGE_DIR"
    
    # Copy binaries if they exist
    [ -f "bin/event_reminder_linux" ] && cp "bin/event_reminder_linux" "$PACKAGE_DIR/"
    [ -f "bin/event_reminder_windows.exe" ] && cp "bin/event_reminder_windows.exe" "$PACKAGE_DIR/"
    [ -f "bin/event_reminder_android" ] && cp "bin/event_reminder_android" "$PACKAGE_DIR/"
    
    # Copy documentation
    cp README.md "$PACKAGE_DIR/" 2>/dev/null || echo "README.md not found, skipping..."
    
    # Create run scripts
    cat > "$PACKAGE_DIR/run_linux.sh" << 'EOF'
#!/bin/bash
echo "Starting Event Reminder System for Linux..."
./event_reminder_linux
EOF

    cat > "$PACKAGE_DIR/run_windows.bat" << 'EOF'
@echo off
echo Starting Event Reminder System for Windows...
event_reminder_windows.exe
pause
EOF

    cat > "$PACKAGE_DIR/run_android.sh" << 'EOF'
#!/bin/bash
echo "Starting Event Reminder System for Android/Termux..."
./event_reminder_android
EOF

    chmod +x "$PACKAGE_DIR"/*.sh
    
    # Create archive
    tar -czf "event_reminder_portable.tar.gz" "$PACKAGE_DIR"
    
    echo "✓ Portable package created: event_reminder_portable.tar.gz"
}

# Main script logic
case "${1:-all}" in
    "linux")
        build_linux
        ;;
    "windows")
        build_windows
        ;;
    "android")
        build_android
        ;;
    "all")
        echo "Building for all platforms..."
        build_linux
        if command_exists x86_64-w64-mingw32-g++; then
            build_windows
        else
            echo "⚠ Skipping Windows build (MinGW not available)"
        fi
        build_android
        create_package
        ;;
    "package")
        create_package
        ;;
    "clean")
        make clean
        rm -rf event_reminder_portable*
        echo "✓ Cleaned build files"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [target]"
        echo ""
        echo "Targets:"
        echo "  linux    - Build for Linux only"
        echo "  windows  - Build for Windows only (requires MinGW)"
        echo "  android  - Build for Android/Termux only"
        echo "  all      - Build for all platforms (default)"
        echo "  package  - Create portable package from existing builds"
        echo "  clean    - Clean build files"
        echo "  help     - Show this help"
        ;;
    *)
        echo "Unknown target: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo "Build script completed!"
