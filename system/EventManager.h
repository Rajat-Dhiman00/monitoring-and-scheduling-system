#ifndef EVENTMANAGER_H
#define EVENTMANAGER_H

#include "Event.h"
#include <string>

// Simple array-based event storage (beginner-friendly)
class EventManager {
private:
    static const int MAX_EVENTS = 100;  // Maximum number of events
    Event events[MAX_EVENTS];           // Array to store events
    int eventCount;                     // Current number of events
    
    // Helper functions
    void sortEvents();                  // Sort events by date/time
    bool isValidDate(int day, int month, int year) const;
    bool isValidTime(int hour, int minute) const;
    
public:
    // Constructor
    EventManager();
    
    // Main operations
    bool addEvent(const Event& event);
    bool deleteEvent(int index);
    void displayAllEvents() const;
    void displayUpcomingEvents() const;
    int searchEventByTitle(const std::string& title) const;
    
    // File operations
    bool saveToFile(const std::string& filename) const;
    bool loadFromFile(const std::string& filename);
    
    // Utility functions
    int getEventCount() const;
    Event getEvent(int index) const;
    void clearAllEvents();
};

#endif
