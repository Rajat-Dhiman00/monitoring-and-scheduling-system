#include "EventManager.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <ctime>

// Constructor - initialize empty event list
EventManager::EventManager() {
    eventCount = 0;
}

// Add a new event to the list
bool EventManager::addEvent(const Event& event) {
    // Check if we have space for more events
    if (eventCount >= MAX_EVENTS) {
        std::cout << "Error: Cannot add more events. Maximum limit reached!" << std::endl;
        return false;
    }
    
    // Validate date and time
    if (!isValidDate(event.getDay(), event.getMonth(), event.getYear())) {
        std::cout << "Error: Invalid date!" << std::endl;
        return false;
    }
    
    if (!isValidTime(event.getHour(), event.getMinute())) {
        std::cout << "Error: Invalid time!" << std::endl;
        return false;
    }
    
    // Add event to array
    events[eventCount] = event;
    eventCount++;
    
    // Sort events to keep them in chronological order
    sortEvents();
    
    std::cout << "Event added successfully!" << std::endl;
    return true;
}

// Delete an event by index
bool EventManager::deleteEvent(int index) {
    if (index < 0 || index >= eventCount) {
        std::cout << "Error: Invalid event number!" << std::endl;
        return false;
    }
    
    // Shift all events after the deleted one to fill the gap
    for (int i = index; i < eventCount - 1; i++) {
        events[i] = events[i + 1];
    }
    
    eventCount--;
    std::cout << "Event deleted successfully!" << std::endl;
    return true;
}

// Display all events in a nice format
void EventManager::displayAllEvents() const {
    if (eventCount == 0) {
        std::cout << "\nNo events found!" << std::endl;
        return;
    }
    
    std::cout << "\n=== ALL EVENTS ===" << std::endl;
    for (int i = 0; i < eventCount; i++) {
        std::cout << "\nEvent #" << (i + 1) << ":";
        events[i].displayEvent();
    }
}

// Display only upcoming events (future events)
void EventManager::displayUpcomingEvents() const {
    if (eventCount == 0) {
        std::cout << "\nNo events found!" << std::endl;
        return;
    }
    
    // Get current time
    time_t now = time(0);
    tm* currentTime = localtime(&now);
    int currentYear = currentTime->tm_year + 1900;
    int currentMonth = currentTime->tm_mon + 1;
    int currentDay = currentTime->tm_mday;
    int currentHour = currentTime->tm_hour;
    int currentMinute = currentTime->tm_min;
    
    std::cout << "\n=== UPCOMING EVENTS ===" << std::endl;
    bool foundUpcoming = false;
    
    for (int i = 0; i < eventCount; i++) {
        // Check if event is in the future
        bool isUpcoming = false;
        
        if (events[i].getYear() > currentYear) isUpcoming = true;
        else if (events[i].getYear() == currentYear) {
            if (events[i].getMonth() > currentMonth) isUpcoming = true;
            else if (events[i].getMonth() == currentMonth) {
                if (events[i].getDay() > currentDay) isUpcoming = true;
                else if (events[i].getDay() == currentDay) {
                    if (events[i].getHour() > currentHour) isUpcoming = true;
                    else if (events[i].getHour() == currentHour && events[i].getMinute() >= currentMinute) {
                        isUpcoming = true;
                    }
                }
            }
        }
        
        if (isUpcoming) {
            std::cout << "\nEvent #" << (i + 1) << ":";
            events[i].displayEvent();
            foundUpcoming = true;
        }
    }
    
    if (!foundUpcoming) {
        std::cout << "\nNo upcoming events found!" << std::endl;
    }
}

// Search for an event by title
int EventManager::searchEventByTitle(const std::string& title) const {
    for (int i = 0; i < eventCount; i++) {
        if (events[i].getTitle() == title) {
            return i;
        }
    }
    return -1; // Not found
}

// Save all events to a file
bool EventManager::saveToFile(const std::string& filename) const {
    std::ofstream file(filename.c_str());
    if (!file.is_open()) {
        std::cout << "Error: Cannot create file!" << std::endl;
        return false;
    }
    
    file << eventCount << std::endl;
    for (int i = 0; i < eventCount; i++) {
        file << events[i].toString() << std::endl;
    }
    
    file.close();
    std::cout << "Events saved successfully!" << std::endl;
    return true;
}

// Load events from a file
bool EventManager::loadFromFile(const std::string& filename) {
    std::ifstream file(filename.c_str());
    if (!file.is_open()) {
        std::cout << "No saved events found. Starting fresh!" << std::endl;
        return false;
    }
    
    int count;
    file >> count;
    file.ignore(); // Ignore newline after number
    
    eventCount = 0; // Clear existing events
    
    for (int i = 0; i < count && i < MAX_EVENTS; i++) {
        std::string line;
        std::getline(file, line);
        
        // Parse the line (format: title|description|day|month|year|hour|minute)
        std::stringstream ss(line);
        std::string title, description;
        int day, month, year, hour, minute;
        
        std::getline(ss, title, '|');
        std::getline(ss, description, '|');
        ss >> day; ss.ignore();
        ss >> month; ss.ignore();
        ss >> year; ss.ignore();
        ss >> hour; ss.ignore();
        ss >> minute;
        
        Event event(title, description, day, month, year, hour, minute);
        events[eventCount] = event;
        eventCount++;
    }
    
    sortEvents();
    file.close();
    std::cout << "Events loaded successfully!" << std::endl;
    return true;
}

// Simple bubble sort to keep events in chronological order
void EventManager::sortEvents() {
    for (int i = 0; i < eventCount - 1; i++) {
        for (int j = 0; j < eventCount - i - 1; j++) {
            if (!events[j].isEarlierThan(events[j + 1])) {
                // Swap events
                Event temp = events[j];
                events[j] = events[j + 1];
                events[j + 1] = temp;
            }
        }
    }
}

// Validate date input
bool EventManager::isValidDate(int day, int month, int year) const {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Check days in month (simplified)
    if (month == 2 && day > 29) return false;
    if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30) return false;
    
    return true;
}

// Validate time input
bool EventManager::isValidTime(int hour, int minute) const {
    return (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59);
}

// Get current number of events
int EventManager::getEventCount() const {
    return eventCount;
}

// Get event by index
Event EventManager::getEvent(int index) const {
    if (index >= 0 && index < eventCount) {
        return events[index];
    }
    return Event(); // Return empty event if invalid index
}

// Clear all events
void EventManager::clearAllEvents() {
    eventCount = 0;
    std::cout << "All events cleared!" << std::endl;
}
