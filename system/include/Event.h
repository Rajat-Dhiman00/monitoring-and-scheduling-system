#ifndef EVENT_H
#define EVENT_H

#include <string>
#include <ctime>
#include <iostream>

class Event {
private:
    static int nextId;
    int id;
    std::string title;
    std::string description;
    std::time_t eventTime;
    int priority; // 1 = High, 2 = Medium, 3 = Low
    bool isCompleted;

public:
    // Constructors
    Event();
    Event(const std::string& title, const std::string& description, 
          std::time_t eventTime, int priority = 2);
    
    // Getters
    int getId() const { return id; }
    std::string getTitle() const { return title; }
    std::string getDescription() const { return description; }
    std::time_t getEventTime() const { return eventTime; }
    int getPriority() const { return priority; }
    bool getIsCompleted() const { return isCompleted; }
    
    // Setters
    void setTitle(const std::string& title) { this->title = title; }
    void setDescription(const std::string& description) { this->description = description; }
    void setEventTime(std::time_t eventTime) { this->eventTime = eventTime; }
    void setPriority(int priority) { this->priority = priority; }
    void setCompleted(bool completed) { this->isCompleted = completed; }
    
    // Utility methods
    std::string getFormattedTime() const;
    std::string getPriorityString() const;
    bool isUpcoming() const;
    bool isDue() const;
    
    // Comparison operators for sorting
    bool operator<(const Event& other) const;
    bool operator>(const Event& other) const;
    bool operator==(const Event& other) const;
    
    // File I/O methods
    std::string serialize() const;
    static Event deserialize(const std::string& data);
    
    // Display method
    void display() const;
};

#endif
