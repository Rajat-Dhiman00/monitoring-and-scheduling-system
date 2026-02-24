# Event Reminder System Makefile
# Supports Windows (MinGW), Linux, and cross-compilation

# Compiler settings
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2
INCLUDES = -Iinclude
SRCDIR = src
OBJDIR = obj
BINDIR = bin

# Source files
SOURCES = $(wildcard $(SRCDIR)/*.cpp)
OBJECTS = $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

# Target executable names
TARGET_LINUX = $(BINDIR)/event_reminder_linux
TARGET_WINDOWS = $(BINDIR)/event_reminder_windows.exe
TARGET_ANDROID = $(BINDIR)/event_reminder_android

# Default target
.PHONY: all clean linux windows android install

all: linux

# Create directories
$(OBJDIR):
	mkdir -p $(OBJDIR)

$(BINDIR):
	mkdir -p $(BINDIR)

# Linux build
linux: $(TARGET_LINUX)

$(TARGET_LINUX): $(OBJECTS) | $(BINDIR)
	$(CXX) $(OBJECTS) -o $@ -static-libgcc -static-libstdc++

# Windows build (using MinGW)
windows: CXX = x86_64-w64-mingw32-g++
windows: $(TARGET_WINDOWS)

$(TARGET_WINDOWS): $(OBJECTS) | $(BINDIR)
	$(CXX) $(OBJECTS) -o $@ -static-libgcc -static-libstdc++ -static

# Android build (for Termux)
android: CXXFLAGS += -DANDROID_BUILD
android: $(TARGET_ANDROID)

$(TARGET_ANDROID): $(OBJECTS) | $(BINDIR)
	$(CXX) $(OBJECTS) -o $@ -static-libgcc -static-libstdc++

# Object file compilation
$(OBJDIR)/%.o: $(SRCDIR)/%.cpp | $(OBJDIR)
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Clean build files
clean:
	rm -rf $(OBJDIR) $(BINDIR)

# Install (Linux only)
install: linux
	sudo cp $(TARGET_LINUX) /usr/local/bin/event-reminder
	sudo chmod +x /usr/local/bin/event-reminder
	@echo "Event Reminder System installed to /usr/local/bin/event-reminder"

# Help
help:
	@echo "Event Reminder System Build System"
	@echo "Available targets:"
	@echo "  all      - Build for current platform (default: Linux)"
	@echo "  linux    - Build for Linux"
	@echo "  windows  - Build for Windows (requires MinGW)"
	@echo "  android  - Build for Android/Termux"
	@echo "  clean    - Remove build files"
	@echo "  install  - Install Linux binary to system (requires sudo)"
	@echo "  help     - Show this help message"
