#include "../include/EventManager.h"
#include <iostream>
#include <algorithm>

EventManager::EventManager() : head(nullptr), eventCount(0) {}

EventManager::~EventManager() {
    clearList();
}

void EventManager::clearList() {
    while (head != nullptr) {
        EventNode* temp = head;
        head = head->next;
        delete temp;
    }
    eventCount = 0;
}

void EventManager::insertSorted(const Event& event) {
    EventNode* newNode = new EventNode(event);
    
    // If list is empty or new event should be first
    if (head == nullptr || event < head->event) {
        newNode->next = head;
        head = newNode;
        eventCount++;
        return;
    }
    
    // Find the correct position
    EventNode* current = head;
    while (current->next != nullptr && current->next->event < event) {
        current = current->next;
    }
    
    newNode->next = current->next;
    current->next = newNode;
    eventCount++;
}

EventNode* EventManager::findEventById(int id) {
    EventNode* current = head;
    while (current != nullptr) {
        if (current->event.getId() == id) {
            return current;
        }
        current = current->next;
    }
    return nullptr;
}

void EventManager::addEvent(const Event& event) {
    insertSorted(event);
}

bool EventManager::removeEvent(int id) {
    if (head == nullptr) return false;
    
    // If first node is to be deleted
    if (head->event.getId() == id) {
        EventNode* temp = head;
        head = head->next;
        delete temp;
        eventCount--;
        return true;
    }
    
    // Find the node to delete
    EventNode* current = head;
    while (current->next != nullptr && current->next->event.getId() != id) {
        current = current->next;
    }
    
    if (current->next == nullptr) return false;
    
    EventNode* temp = current->next;
    current->next = current->next->next;
    delete temp;
    eventCount--;
    return true;
}

bool EventManager::updateEvent(int id, const Event& updatedEvent) {
    EventNode* node = findEventById(id);
    if (node == nullptr) return false;
    
    // Remove old event and add updated one to maintain sorting
    removeEvent(id);
    addEvent(updatedEvent);
    return true;
}

Event* EventManager::findEvent(int id) {
    EventNode* node = findEventById(id);
    return node ? &(node->event) : nullptr;
}

void EventManager::displayAllEvents() const {
    if (head == nullptr) {
        std::cout << "No events found." << std::endl;
        return;
    }
    
    std::cout << "\n=== ALL EVENTS ===" << std::endl;
    EventNode* current = head;
    while (current != nullptr) {
        current->event.display();
        current = current->next;
    }
}

void EventManager::displayUpcomingEvents() const {
    std::cout << "\n=== UPCOMING EVENTS ===" << std::endl;
    bool found = false;
    EventNode* current = head;
    
    while (current != nullptr) {
        if (current->event.isUpcoming()) {
            current->event.display();
            found = true;
        }
        current = current->next;
    }
    
    if (!found) {
        std::cout << "No upcoming events." << std::endl;
    }
}

void EventManager::displayDueEvents() const {
    std::cout << "\n=== DUE EVENTS ===" << std::endl;
    bool found = false;
    EventNode* current = head;
    
    while (current != nullptr) {
        if (current->event.isDue()) {
            current->event.display();
            found = true;
        }
        current = current->next;
    }
    
    if (!found) {
        std::cout << "No due events." << std::endl;
    }
}

void EventManager::displayEventsByPriority(int priority) const {
    std::cout << "\n=== EVENTS BY PRIORITY ===" << std::endl;
    bool found = false;
    EventNode* current = head;
    
    while (current != nullptr) {
        if (current->event.getPriority() == priority) {
            current->event.display();
            found = true;
        }
        current = current->next;
    }
    
    if (!found) {
        std::cout << "No events found with specified priority." << std::endl;
    }
}

std::vector<Event> EventManager::searchByTitle(const std::string& title) const {
    std::vector<Event> results;
    EventNode* current = head;
    
    while (current != nullptr) {
        if (current->event.getTitle().find(title) != std::string::npos) {
            results.push_back(current->event);
        }
        current = current->next;
    }
    
    return results;
}

std::vector<Event> EventManager::getAllEvents() const {
    std::vector<Event> events;
    EventNode* current = head;
    
    while (current != nullptr) {
        events.push_back(current->event);
        current = current->next;
    }
    
    return events;
}

void EventManager::markEventCompleted(int id) {
    EventNode* node = findEventById(id);
    if (node != nullptr) {
        node->event.setCompleted(true);
    }
}

std::vector<Event> EventManager::getDueReminders() const {
    std::vector<Event> dueEvents;
    EventNode* current = head;
    
    while (current != nullptr) {
        if (current->event.isDue()) {
            dueEvents.push_back(current->event);
        }
        current = current->next;
    }
    
    return dueEvents;
}

std::vector<Event> EventManager::getUpcomingReminders(int hours) const {
    std::vector<Event> upcomingEvents;
    std::time_t now = std::time(nullptr);
    std::time_t futureTime = now + (hours * 3600); // Convert hours to seconds
    
    EventNode* current = head;
    while (current != nullptr) {
        if (current->event.getEventTime() > now && 
            current->event.getEventTime() <= futureTime &&
            !current->event.getIsCompleted()) {
            upcomingEvents.push_back(current->event);
        }
        current = current->next;
    }
    
    return upcomingEvents;
}
