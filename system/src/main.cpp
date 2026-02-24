#include "../include/UserInterface.h"
#include <iostream>
#include <exception>

int main() {
    try {
        UserInterface ui;
        ui.run();
    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        std::cerr << "Press Enter to exit...";
        std::cin.get();
        return 1;
    } catch (...) {
        std::cerr << "Unknown fatal error occurred." << std::endl;
        std::cerr << "Press Enter to exit...";
        std::cin.get();
        return 1;
    }
    
    return 0;
}
