#include "Event.h"
#include <iomanip>
#include <sstream>

// Default constructor
Event::Event() {
    title = "";
    description = "";
    day = month = year = 0;
    hour = minute = 0;
}

// Parameterized constructor
Event::Event(std::string t, std::string desc, int d, int m, int y, int h, int min) {
    title = t;
    description = desc;
    day = d;
    month = m;
    year = y;
    hour = h;
    minute = min;
}

// Getter functions
std::string Event::getTitle() const { return title; }
std::string Event::getDescription() const { return description; }
int Event::getDay() const { return day; }
int Event::getMonth() const { return month; }
int Event::getYear() const { return year; }
int Event::getHour() const { return hour; }
int Event::getMinute() const { return minute; }

// Setter functions
void Event::setTitle(std::string t) { title = t; }
void Event::setDescription(std::string desc) { description = desc; }
void Event::setDate(int d, int m, int y) { day = d; month = m; year = y; }
void Event::setTime(int h, int min) { hour = h; minute = min; }

// Display event information in a nice format
void Event::displayEvent() const {
    std::cout << "\n=== EVENT DETAILS ===" << std::endl;
    std::cout << "Title: " << title << std::endl;
    std::cout << "Description: " << description << std::endl;
    std::cout << "Date: " << std::setfill('0') << std::setw(2) << day << "/"
              << std::setw(2) << month << "/" << year << std::endl;
    std::cout << "Time: " << std::setw(2) << hour << ":" 
              << std::setw(2) << minute << std::endl;
    std::cout << "===================" << std::endl;
}

// Compare two events to see which comes first (for sorting)
bool Event::isEarlierThan(const Event& other) const {
    if (year != other.year) return year < other.year;
    if (month != other.month) return month < other.month;
    if (day != other.day) return day < other.day;
    if (hour != other.hour) return hour < other.hour;
    return minute < other.minute;
}

// Convert event to string format for file saving
std::string Event::toString() const {
    std::stringstream ss;
    ss << title << "|" << description << "|" 
       << day << "|" << month << "|" << year << "|"
       << hour << "|" << minute;
    return ss.str();
}
