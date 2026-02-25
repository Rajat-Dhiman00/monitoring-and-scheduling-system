# Event Reminder System

A comprehensive C++ application for managing personal events, reminders, and schedules efficiently using advanced Data Structures and Algorithms.

## Features

- **Event Management**: Add, update, delete, and search events
- **Priority System**: Organize events by priority (High, Medium, Low)
- **Smart Reminders**: Get notified about due and upcoming events
- **Data Persistence**: Automatic saving and loading of event data
- **Cross-Platform**: Runs on Windows, Linux, and Android (Termux)
- **Backup System**: Create and restore data backups
- **Efficient Algorithms**: Uses linked lists and priority queues for optimal performance

## System Requirements

### Windows
- Windows 7 or later
- No additional dependencies required (statically linked)

### Linux
- Any modern Linux distribution
- No additional dependencies required (statically linked)

### Android
- Android device with Termux installed
- No additional dependencies required

## Installation & Running

### Pre-built Binaries

1. Download the portable package: `event_reminder_portable.tar.gz`
2. Extract the archive
3. Run the appropriate executable for your platform:

#### Windows
\`\`\`cmd
# Double-click or run from command prompt
event_reminder_windows.exe

# Or use the batch script
run_windows.bat
\`\`\`

#### Linux
\`\`\`bash
# Make executable and run
chmod +x event_reminder_linux
./event_reminder_linux

# Or use the shell script
chmod +x run_linux.sh
./run_linux.sh
\`\`\`

#### Android (Termux)
\`\`\`bash
# Install Termux from F-Droid or Google Play
# Open Termux and run:
chmod +x event_reminder_android
./event_reminder_android

# Or use the shell script
chmod +x run_android.sh
./run_android.sh
\`\`\`

### Building from Source

#### Prerequisites
- C++17 compatible compiler (GCC 7+ or Clang 5+)
- Make (optional, for using Makefile)

#### Linux Build
\`\`\`bash
# Install build tools (Ubuntu/Debian)
sudo apt-get install build-essential

# Build
chmod +x build.sh
./build.sh linux

# Or using make
make linux
\`\`\`

#### Windows Build (Cross-compilation on Linux)
\`\`\`bash
# Install MinGW-w64 (Ubuntu/Debian)
sudo apt-get install mingw-w64

# Build
./build.sh windows

# Or using make
make windows
\`\`\`

#### Windows Build (Native)
\`\`\`cmd
# Install MinGW-w64 or Visual Studio Build Tools
# Run the build script
build.bat
\`\`\`

#### Android Build (in Termux)
\`\`\`bash
# In Termux, install required packages
pkg install clang make

# Build
chmod +x build.sh
./build.sh android

# Or using make
make android
\`\`\`

#### Build All Platforms
\`\`\`bash
# Build for all supported platforms
./build.sh all
\`\`\`

## Usage Guide

### Main Menu Options

1. **Add New Event**: Create a new event with title, description, date/time, and priority
2. **View Events**: Display events in various formats (all, upcoming, due, by priority)
3. **Search Events**: Find events by title or other criteria
4. **Update Event**: Modify existing event details
5. **Delete Event**: Remove events from the system
6. **Mark Event as Completed**: Mark events as done
7. **View Reminders**: See due and upcoming events
8. **Settings & Backup**: Manage data backups and settings

### Adding an Event

1. Select option 1 from the main menu
2. Enter event title and description
3. Provide date and time (year, month, day, hour, minute)
4. Set priority level (1=High, 2=Medium, 3=Low)
5. Event will be automatically saved

### Data Storage

- Events are stored in `events.dat` file in the same directory as the executable
- Data is automatically saved after each operation
- Backup files are created with `.backup` extension
- All data is stored in binary format for efficiency

### Reminders

The system automatically shows:
- **Due Events**: Events that should have happened but aren't completed
- **Upcoming Events**: Events scheduled within the next 24 hours
- Reminders are displayed when starting the application and in the reminders menu

## Technical Details

### Data Structures Used

- **Linked List**: For efficient event storage and sorted insertion
- **Priority Queue**: For organizing events by priority and time
- **Binary File I/O**: For fast data persistence
- **STL Containers**: For search operations and temporary storage

### Algorithms Implemented

- **Insertion Sort**: For maintaining sorted event list
- **Binary Search**: For efficient event lookup
- **Time Complexity**: O(n) for insertion, O(n) for search, O(1) for access
- **Space Complexity**: O(n) where n is the number of events

### File Format

Events are stored in binary format with the following structure:
\`\`\`
[Event Count (8 bytes)]
[Event 1 Length (8 bytes)][Event 1 Data (variable)]
[Event 2 Length (8 bytes)][Event 2 Data (variable)]
...
\`\`\`

Each event data contains: ID|Title|Description|Timestamp|Priority|Completion Status

## Troubleshooting

### Common Issues

1. **"Permission denied" error**
   - Make sure the executable has execute permissions: `chmod +x event_reminder_*`

2. **"File not found" error**
   - Ensure you're running the executable from the correct directory
   - Check that the binary exists in the `bin/` folder

3. **Data not saving**
   - Verify write permissions in the application directory
   - Check available disk space

4. **Build errors**
   - Ensure you have a C++17 compatible compiler
   - Install required build tools for your platform

### Platform-Specific Notes

#### Windows
- The executable is statically linked and doesn't require Visual C++ Redistributables
- Windows Defender might flag the executable as unknown - this is normal for new executables

#### Linux
- The binary is statically linked and should work on most distributions
- If you get "file not found" error, you might need to install 32-bit libraries on 64-bit systems

#### Android (Termux)
- Make sure Termux has storage permissions if you want to access external storage
- The app creates files in the current working directory

## Development

---
## Project Structure
```text
event-reminder-system/
├── include/           # Header files
│   ├── Event.h
│   ├── EventManager.h
│   ├── EventNode.h
│   ├── FileHandler.h
│   └── UserInterface.h
├── src/              # Source files
│   ├── Event.cpp
│   ├── EventManager.cpp
│   ├── FileHandler.cpp
│   ├── UserInterface.cpp
│   └── main.cpp
├── obj/              # Object files (generated)
├── bin/              # Executables (generated)
├── Makefile          # Build configuration
├── build.sh          # Linux/Unix build script
├── build.bat         # Windows build script
└── README.md         # This file
```
---
### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

### Future Enhancements

- GUI interface using a cross-platform framework
- Network synchronization between devices
- Calendar integration
- Email/SMS notifications
- Recurring events support
- Event categories and tags
- Import/export functionality (CSV, iCal)

## Support

For issues, questions, or contributions, please create an issue in the project repository.
