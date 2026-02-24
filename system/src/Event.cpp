#include "../include/Event.h"
#include <sstream>
#include <iomanip>

int Event::nextId = 1;

Event::Event() : id(nextId++), title(""), description(""), eventTime(0), priority(2), isCompleted(false) {}

Event::Event(const std::string& title, const std::string& description, 
             std::time_t eventTime, int priority) 
    : id(nextId++), title(title), description(description), 
      eventTime(eventTime), priority(priority), isCompleted(false) {}

std::string Event::getFormattedTime() const {
    std::tm* timeinfo = std::localtime(&eventTime);
    std::ostringstream oss;
    oss << std::put_time(timeinfo, "%Y-%m-%d %H:%M:%S");
    return oss.str();
}

std::string Event::getPriorityString() const {
    switch(priority) {
        case 1: return "High";
        case 2: return "Medium";
        case 3: return "Low";
        default: return "Unknown";
    }
}

bool Event::isUpcoming() const {
    std::time_t now = std::time(nullptr);
    return eventTime > now && !isCompleted;
}

bool Event::isDue() const {
    std::time_t now = std::time(nullptr);
    return eventTime <= now && !isCompleted;
}

bool Event::operator<(const Event& other) const {
    if (priority != other.priority) {
        return priority < other.priority; // Lower number = higher priority
    }
    return eventTime < other.eventTime;
}

bool Event::operator>(const Event& other) const {
    return other < *this;
}

bool Event::operator==(const Event& other) const {
    return id == other.id;
}

std::string Event::serialize() const {
    std::ostringstream oss;
    oss << id << "|" << title << "|" << description << "|" 
        << eventTime << "|" << priority << "|" << isCompleted;
    return oss.str();
}

Event Event::deserialize(const std::string& data) {
    std::istringstream iss(data);
    std::string token;
    Event event;
    
    // Parse ID
    std::getline(iss, token, '|');
    event.id = std::stoi(token);
    if (event.id >= nextId) nextId = event.id + 1;
    
    // Parse title
    std::getline(iss, event.title, '|');
    
    // Parse description
    std::getline(iss, event.description, '|');
    
    // Parse event time
    std::getline(iss, token, '|');
    event.eventTime = std::stoll(token);
    
    // Parse priority
    std::getline(iss, token, '|');
    event.priority = std::stoi(token);
    
    // Parse completion status
    std::getline(iss, token, '|');
    event.isCompleted = (token == "1");
    
    return event;
}

void Event::display() const {
    std::cout << "ID: " << id << std::endl;
    std::cout << "Title: " << title << std::endl;
    std::cout << "Description: " << description << std::endl;
    std::cout << "Date & Time: " << getFormattedTime() << std::endl;
    std::cout << "Priority: " << getPriorityString() << std::endl;
    std::cout << "Status: " << (isCompleted ? "Completed" : (isDue() ? "Due" : "Upcoming")) << std::endl;
    std::cout << "----------------------------------------" << std::endl;
}
