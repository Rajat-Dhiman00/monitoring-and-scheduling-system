#include "../include/UserInterface.h"
#include <iostream>
#include <iomanip>
#include <sstream>
#include <limits>

UserInterface::UserInterface() : fileHandler("events.dat") {
    fileHandler.loadEvents(eventManager);
}

void UserInterface::clearScreen() {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

void UserInterface::pauseScreen() {
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
    std::cin.get();
}

void UserInterface::displayMenu() {
    std::cout << "\n╔══════════════════════════════════════╗" << std::endl;
    std::cout << "║        EVENT REMINDER SYSTEM         ║" << std::endl;
    std::cout << "╠══════════════════════════════════════╣" << std::endl;
    std::cout << "║  1. Add New Event                    ║" << std::endl;
    std::cout << "║  2. View Events                      ║" << std::endl;
    std::cout << "║  3. Search Events                    ║" << std::endl;
    std::cout << "║  4. Update Event                     ║" << std::endl;
    std::cout << "║  5. Delete Event                     ║" << std::endl;
    std::cout << "║  6. Mark Event as Completed          ║" << std::endl;
    std::cout << "║  7. View Reminders                   ║" << std::endl;
    std::cout << "║  8. Settings & Backup                ║" << std::endl;
    std::cout << "║  0. Exit                             ║" << std::endl;
    std::cout << "╚══════════════════════════════════════╝" << std::endl;
    std::cout << "Total Events: " << eventManager.getEventCount() << std::endl;
}

std::string UserInterface::getStringInput(const std::string& prompt) {
    std::string input;
    std::cout << prompt;
    std::cin.ignore();
    std::getline(std::cin, input);
    return input;
}

int UserInterface::getIntInput(const std::string& prompt) {
    int input;
    std::cout << prompt;
    while (!(std::cin >> input)) {
        std::cout << "Invalid input. Please enter a number: ";
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
    return input;
}

std::time_t UserInterface::getDateTimeInput() {
    std::tm timeinfo = {};
    
    std::cout << "Enter date and time:" << std::endl;
    timeinfo.tm_year = getIntInput("Year (YYYY): ") - 1900;
    timeinfo.tm_mon = getIntInput("Month (1-12): ") - 1;
    timeinfo.tm_mday = getIntInput("Day (1-31): ");
    timeinfo.tm_hour = getIntInput("Hour (0-23): ");
    timeinfo.tm_min = getIntInput("Minute (0-59): ");
    timeinfo.tm_sec = 0;
    
    return std::mktime(&timeinfo);
}

int UserInterface::getPriorityInput() {
    int priority;
    do {
        std::cout << "Priority (1=High, 2=Medium, 3=Low): ";
        std::cin >> priority;
        if (priority < 1 || priority > 3) {
            std::cout << "Invalid priority. Please enter 1, 2, or 3." << std::endl;
        }
    } while (priority < 1 || priority > 3);
    return priority;
}

void UserInterface::handleAddEvent() {
    clearScreen();
    std::cout << "=== ADD NEW EVENT ===" << std::endl;
    
    std::string title = getStringInput("Event Title: ");
    std::string description = getStringInput("Event Description: ");
    std::time_t eventTime = getDateTimeInput();
    int priority = getPriorityInput();
    
    Event newEvent(title, description, eventTime, priority);
    eventManager.addEvent(newEvent);
    
    std::cout << "\nEvent added successfully!" << std::endl;
    fileHandler.saveEvents(eventManager);
    pauseScreen();
}

void UserInterface::handleViewEvents() {
    clearScreen();
    std::cout << "=== VIEW EVENTS ===" << std::endl;
    std::cout << "1. All Events" << std::endl;
    std::cout << "2. Upcoming Events" << std::endl;
    std::cout << "3. Due Events" << std::endl;
    std::cout << "4. Events by Priority" << std::endl;
    
    int choice = getIntInput("Choose option: ");
    
    switch (choice) {
        case 1:
            eventManager.displayAllEvents();
            break;
        case 2:
            eventManager.displayUpcomingEvents();
            break;
        case 3:
            eventManager.displayDueEvents();
            break;
        case 4: {
            int priority = getPriorityInput();
            eventManager.displayEventsByPriority(priority);
            break;
        }
        default:
            std::cout << "Invalid option." << std::endl;
    }
    
    pauseScreen();
}

void UserInterface::handleSearchEvents() {
    clearScreen();
    std::cout << "=== SEARCH EVENTS ===" << std::endl;
    
    std::string searchTerm = getStringInput("Enter search term (title): ");
    std::vector<Event> results = eventManager.searchByTitle(searchTerm);
    
    if (results.empty()) {
        std::cout << "No events found matching '" << searchTerm << "'" << std::endl;
    } else {
        std::cout << "Found " << results.size() << " event(s):" << std::endl;
        for (const Event& event : results) {
            event.display();
        }
    }
    
    pauseScreen();
}

void UserInterface::handleUpdateEvent() {
    clearScreen();
    std::cout << "=== UPDATE EVENT ===" << std::endl;
    
    int id = getIntInput("Enter Event ID to update: ");
    Event* event = eventManager.findEvent(id);
    
    if (event == nullptr) {
        std::cout << "Event not found." << std::endl;
        pauseScreen();
        return;
    }
    
    std::cout << "Current event details:" << std::endl;
    event->display();
    
    std::string title = getStringInput("New Title (or press Enter to keep current): ");
    if (title.empty()) title = event->getTitle();
    
    std::string description = getStringInput("New Description (or press Enter to keep current): ");
    if (description.empty()) description = event->getDescription();
    
    std::cout << "Update date/time? (y/n): ";
    char updateTime;
    std::cin >> updateTime;
    
    std::time_t eventTime = event->getEventTime();
    if (updateTime == 'y' || updateTime == 'Y') {
        eventTime = getDateTimeInput();
    }
    
    std::cout << "Update priority? (y/n): ";
    char updatePriority;
    std::cin >> updatePriority;
    
    int priority = event->getPriority();
    if (updatePriority == 'y' || updatePriority == 'Y') {
        priority = getPriorityInput();
    }
    
    Event updatedEvent(title, description, eventTime, priority);
    if (eventManager.updateEvent(id, updatedEvent)) {
        std::cout << "Event updated successfully!" << std::endl;
        fileHandler.saveEvents(eventManager);
    } else {
        std::cout << "Failed to update event." << std::endl;
    }
    
    pauseScreen();
}

void UserInterface::handleDeleteEvent() {
    clearScreen();
    std::cout << "=== DELETE EVENT ===" << std::endl;
    
    int id = getIntInput("Enter Event ID to delete: ");
    Event* event = eventManager.findEvent(id);
    
    if (event == nullptr) {
        std::cout << "Event not found." << std::endl;
        pauseScreen();
        return;
    }
    
    std::cout << "Event to delete:" << std::endl;
    event->display();
    
    std::cout << "Are you sure you want to delete this event? (y/n): ";
    char confirm;
    std::cin >> confirm;
    
    if (confirm == 'y' || confirm == 'Y') {
        if (eventManager.removeEvent(id)) {
            std::cout << "Event deleted successfully!" << std::endl;
            fileHandler.saveEvents(eventManager);
        } else {
            std::cout << "Failed to delete event." << std::endl;
        }
    } else {
        std::cout << "Delete cancelled." << std::endl;
    }
    
    pauseScreen();
}

void UserInterface::handleMarkCompleted() {
    clearScreen();
    std::cout << "=== MARK EVENT AS COMPLETED ===" << std::endl;
    
    int id = getIntInput("Enter Event ID to mark as completed: ");
    Event* event = eventManager.findEvent(id);
    
    if (event == nullptr) {
        std::cout << "Event not found." << std::endl;
        pauseScreen();
        return;
    }
    
    if (event->getIsCompleted()) {
        std::cout << "Event is already marked as completed." << std::endl;
    } else {
        eventManager.markEventCompleted(id);
        std::cout << "Event marked as completed!" << std::endl;
        fileHandler.saveEvents(eventManager);
    }
    
    pauseScreen();
}

void UserInterface::handleReminders() {
    clearScreen();
    std::cout << "=== REMINDERS ===" << std::endl;
    
    // Show due events
    std::vector<Event> dueEvents = eventManager.getDueReminders();
    if (!dueEvents.empty()) {
        std::cout << "\n🚨 DUE EVENTS (" << dueEvents.size() << "):" << std::endl;
        for (const Event& event : dueEvents) {
            event.display();
        }
    }
    
    // Show upcoming events (next 24 hours)
    std::vector<Event> upcomingEvents = eventManager.getUpcomingReminders(24);
    if (!upcomingEvents.empty()) {
        std::cout << "\n⏰ UPCOMING EVENTS (Next 24 hours) (" << upcomingEvents.size() << "):" << std::endl;
        for (const Event& event : upcomingEvents) {
            event.display();
        }
    }
    
    if (dueEvents.empty() && upcomingEvents.empty()) {
        std::cout << "No immediate reminders." << std::endl;
    }
    
    pauseScreen();
}

void UserInterface::handleSettings() {
    clearScreen();
    std::cout << "=== SETTINGS & BACKUP ===" << std::endl;
    std::cout << "1. Create Backup" << std::endl;
    std::cout << "2. Restore from Backup" << std::endl;
    std::cout << "3. Save Current Data" << std::endl;
    std::cout << "4. Reload Data from File" << std::endl;
    
    int choice = getIntInput("Choose option: ");
    
    switch (choice) {
        case 1:
            if (fileHandler.createBackup()) {
                std::cout << "Backup created successfully!" << std::endl;
            } else {
                std::cout << "Failed to create backup." << std::endl;
            }
            break;
        case 2:
            if (fileHandler.restoreFromBackup()) {
                std::cout << "Backup restored successfully! Reloading data..." << std::endl;
                fileHandler.loadEvents(eventManager);
            } else {
                std::cout << "Failed to restore backup." << std::endl;
            }
            break;
        case 3:
            if (fileHandler.saveEvents(eventManager)) {
                std::cout << "Data saved successfully!" << std::endl;
            } else {
                std::cout << "Failed to save data." << std::endl;
            }
            break;
        case 4:
            fileHandler.loadEvents(eventManager);
            std::cout << "Data reloaded from file." << std::endl;
            break;
        default:
            std::cout << "Invalid option." << std::endl;
    }
    
    pauseScreen();
}

void UserInterface::showWelcome() {
    clearScreen();
    std::cout << "╔══════════════════════════════════════════════════════════╗" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║              WELCOME TO EVENT REMINDER SYSTEM           ║" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║  A comprehensive C++ application for managing your      ║" << std::endl;
    std::cout << "║  personal events, reminders, and schedule efficiently.  ║" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║  Features:                                               ║" << std::endl;
    std::cout << "║  • Add, Update, Delete Events                            ║" << std::endl;
    std::cout << "║  • Priority-based Event Management                      ║" << std::endl;
    std::cout << "║  • Smart Reminders & Notifications                      ║" << std::endl;
    std::cout << "║  • Data Persistence & Backup                            ║" << std::endl;
    std::cout << "║  • Search & Filter Capabilities                         ║" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════════════════╝" << std::endl;
    
    // Show immediate reminders
    std::vector<Event> dueEvents = eventManager.getDueReminders();
    if (!dueEvents.empty()) {
        std::cout << "\n🚨 You have " << dueEvents.size() << " due event(s)!" << std::endl;
    }
    
    pauseScreen();
}

void UserInterface::showGoodbye() {
    clearScreen();
    std::cout << "╔══════════════════════════════════════════════════════════╗" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║                    GOODBYE!                              ║" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║         Thank you for using Event Reminder System       ║" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║              Your data has been saved.                  ║" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════════════════╝" << std::endl;
}

void UserInterface::run() {
    showWelcome();
    
    int choice;
    do {
        clearScreen();
        displayMenu();
        choice = getIntInput("\nEnter your choice: ");
        
        switch (choice) {
            case 1: handleAddEvent(); break;
            case 2: handleViewEvents(); break;
            case 3: handleSearchEvents(); break;
            case 4: handleUpdateEvent(); break;
            case 5: handleDeleteEvent(); break;
            case 6: handleMarkCompleted(); break;
            case 7: handleReminders(); break;
            case 8: handleSettings(); break;
            case 0: 
                fileHandler.saveEvents(eventManager);
                showGoodbye();
                break;
            default:
                std::cout << "Invalid choice. Please try again." << std::endl;
                pauseScreen();
        }
    } while (choice != 0);
}
