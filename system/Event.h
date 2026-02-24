#ifndef EVENT_H
#define EVENT_H

#include <string>
#include <iostream>

// Simple Event class to store event information
class Event {
private:
    std::string title;
    std::string description;
    int day, month, year;
    int hour, minute;
    
public:
    // Constructor
    Event();
    Event(std::string t, std::string desc, int d, int m, int y, int h, int min);
    
    // Getters (to access private data)
    std::string getTitle() const;
    std::string getDescription() const;
    int getDay() const;
    int getMonth() const;
    int getYear() const;
    int getHour() const;
    int getMinute() const;
    
    // Setters (to modify private data)
    void setTitle(std::string t);
    void setDescription(std::string desc);
    void setDate(int d, int m, int y);
    void setTime(int h, int min);
    
    // Utility functions
    void displayEvent() const;
    bool isEarlierThan(const Event& other) const;
    std::string toString() const;
};

#endif
