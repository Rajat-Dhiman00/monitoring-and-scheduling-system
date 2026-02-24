#include "../include/FileHandler.h"
#include <fstream>
#include <iostream>

FileHandler::FileHandler(const std::string& filename) : filename(filename) {}

bool FileHandler::saveEvents(const EventManager& manager) {
    std::ofstream file(filename, std::ios::binary);
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file for writing: " << filename << std::endl;
        return false;
    }
    
    std::vector<Event> events = manager.getAllEvents();
    
    // Write number of events
    size_t eventCount = events.size();
    file.write(reinterpret_cast<const char*>(&eventCount), sizeof(eventCount));
    
    // Write each event
    for (const Event& event : events) {
        std::string serialized = event.serialize();
        size_t length = serialized.length();
        file.write(reinterpret_cast<const char*>(&length), sizeof(length));
        file.write(serialized.c_str(), length);
    }
    
    file.close();
    return true;
}

bool FileHandler::loadEvents(EventManager& manager) {
    std::ifstream file(filename, std::ios::binary);
    if (!file.is_open()) {
        std::cout << "No existing data file found. Starting with empty event list." << std::endl;
        return true; // Not an error, just no existing data
    }
    
    try {
        // Read number of events
        size_t eventCount;
        file.read(reinterpret_cast<char*>(&eventCount), sizeof(eventCount));
        
        if (file.fail()) {
            std::cerr << "Error reading event count from file." << std::endl;
            file.close();
            return false;
        }
        
        // Read each event
        for (size_t i = 0; i < eventCount; ++i) {
            size_t length;
            file.read(reinterpret_cast<char*>(&length), sizeof(length));
            
            if (file.fail()) {
                std::cerr << "Error reading event length from file." << std::endl;
                file.close();
                return false;
            }
            
            std::string serialized(length, '\0');
            file.read(&serialized[0], length);
            
            if (file.fail()) {
                std::cerr << "Error reading event data from file." << std::endl;
                file.close();
                return false;
            }
            
            Event event = Event::deserialize(serialized);
            manager.addEvent(event);
        }
        
        file.close();
        std::cout << "Successfully loaded " << eventCount << " events from file." << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Error loading events: " << e.what() << std::endl;
        file.close();
        return false;
    }
}

bool FileHandler::fileExists() const {
    std::ifstream file(filename);
    return file.good();
}

bool FileHandler::createBackup() const {
    if (!fileExists()) return false;
    
    std::string backupName = filename + ".backup";
    std::ifstream src(filename, std::ios::binary);
    std::ofstream dst(backupName, std::ios::binary);
    
    if (!src.is_open() || !dst.is_open()) {
        return false;
    }
    
    dst << src.rdbuf();
    return true;
}

bool FileHandler::restoreFromBackup() {
    std::string backupName = filename + ".backup";
    std::ifstream src(backupName, std::ios::binary);
    std::ofstream dst(filename, std::ios::binary);
    
    if (!src.is_open() || !dst.is_open()) {
        return false;
    }
    
    dst << src.rdbuf();
    return true;
}
