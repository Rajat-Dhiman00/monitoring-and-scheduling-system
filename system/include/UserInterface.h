#ifndef USERINTERFACE_H
#define USERINTERFACE_H

#include "EventManager.h"
#include "FileHandler.h"
#include <string>

class UserInterface {
private:
    EventManager eventManager;
    FileHandler fileHandler;
    
    // Helper methods
    void displayMenu();
    void clearScreen();
    void pauseScreen();
    std::time_t getDateTimeInput();
    int getPriorityInput();
    std::string getStringInput(const std::string& prompt);
    int getIntInput(const std::string& prompt);
    
    // Menu handlers
    void handleAddEvent();
    void handleViewEvents();
    void handleSearchEvents();
    void handleUpdateEvent();
    void handleDeleteEvent();
    void handleMarkCompleted();
    void handleReminders();
    void handleSettings();
    
public:
    UserInterface();
    void run();
    void showWelcome();
    void showGoodbye();
};

#endif
