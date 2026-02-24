#ifndef EVENTMANAGER_H
#define EVENTMANAGER_H

#include "Event.h"
#include "EventNode.h"
#include <vector>
#include <queue>

class EventManager {
private:
    EventNode* head; // Linked list for event storage
    int eventCount;
    
    // Helper methods
    void insertSorted(const Event& event);
    EventNode* findEventById(int id);
    void clearList();
    
public:
    EventManager();
    ~EventManager();
    
    // Core operations
    void addEvent(const Event& event);
    bool removeEvent(int id);
    bool updateEvent(int id, const Event& updatedEvent);
    Event* findEvent(int id);
    
    // Display operations
    void displayAllEvents() const;
    void displayUpcomingEvents() const;
    void displayDueEvents() const;
    void displayEventsByPriority(int priority) const;
    
    // Search operations
    std::vector<Event> searchByTitle(const std::string& title) const;
    std::vector<Event> searchByDate(const std::string& date) const;
    
    // Utility operations
    int getEventCount() const { return eventCount; }
    std::vector<Event> getAllEvents() const;
    void markEventCompleted(int id);
    
    // Reminder operations
    std::vector<Event> getDueReminders() const;
    std::vector<Event> getUpcomingReminders(int hours = 24) const;
    
    // Sorting operations
    void sortEventsByTime();
    void sortEventsByPriority();
};

#endif
