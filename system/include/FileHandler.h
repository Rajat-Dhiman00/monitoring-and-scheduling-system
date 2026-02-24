#ifndef FILEHANDLER_H
#define FILEHANDLER_H

#include "EventManager.h"
#include <string>

class FileHandler {
private:
    std::string filename;
    
public:
    FileHandler(const std::string& filename = "events.dat");
    
    bool saveEvents(const EventManager& manager);
    bool loadEvents(EventManager& manager);
    bool fileExists() const;
    bool createBackup() const;
    bool restoreFromBackup();
};

#endif
