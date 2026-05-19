#define WIN32_LEAN_AND_MEAN
#include "httplib.h"
#include "json.hpp"
#include "EventManager.h"
#include <iostream>
#include <string>
#include <chrono>
#include <iomanip>
#include <sstream>

using json = nlohmann::json;

// Helper to convert ISO string to time_t
std::time_t iso_to_time(const std::string& iso) {
    std::tm t = {};
    std::istringstream ss(iso);
    ss >> std::get_time(&t, "%Y-%m-%dT%H:%M");
    return std::mktime(&t);
}

// Helper to convert time_t to ISO string
std::string time_to_iso(std::time_t time) {
    std::tm* t = std::localtime(&time);
    std::ostringstream ss;
    ss << std::put_time(t, "%Y-%m-%dT%H:%M:%S.000Z");
    return ss.str();
}

int priority_to_int(const std::string& p) {
    if (p == "high") return 1;
    if (p == "low") return 3;
    return 2;
}

std::string int_to_priority(int p) {
    if (p == 1) return "high";
    if (p == 3) return "low";
    return "medium";
}

int main() {
    httplib::Server svr;
    EventManager manager;

    // Default tasks for UI
    manager.addEvent(Event("Quarterly Planning Meeting", "work|Prepare Q3 OKRs.", std::time(nullptr) + 86400, 1));
    manager.addEvent(Event("Pay Electricity Bill", "personal|Due on the 15th.", std::time(nullptr) + 86400*3, 2));

    // Expose API
    svr.Get("/api/events", [&](const httplib::Request& req, httplib::Response& res) {
        json j = json::array();
        for (const auto& ev : manager.getAllEvents()) {
            json item;
            item["id"] = ev.getId();
            item["title"] = ev.getTitle();
            
            std::string full_desc = ev.getDescription();
            std::string cat = "other";
            std::string desc = full_desc;
            size_t pos = full_desc.find('|');
            if (pos != std::string::npos) {
                cat = full_desc.substr(0, pos);
                desc = full_desc.substr(pos + 1);
            }
            
            item["category"] = cat;
            item["desc"] = desc;
            item["date"] = time_to_iso(ev.getEventTime());
            item["priority"] = int_to_priority(ev.getPriority());
            item["status"] = ev.getIsCompleted() ? "completed" : (ev.isDue() ? "overdue" : "pending");
            j.push_back(item);
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/events", [&](const httplib::Request& req, httplib::Response& res) {
        auto j = json::parse(req.body);
        std::string full_desc = j.value("category", "other") + "|" + j.value("desc", "");
        
        Event ev(
            j.value("title", ""),
            full_desc,
            iso_to_time(j.value("date", "")),
            priority_to_int(j.value("priority", "medium"))
        );
        
        if (j.contains("status") && j["status"] == "completed") {
            ev.setCompleted(true);
        }
        
        manager.addEvent(ev);
        
        json ret = j;
        ret["id"] = ev.getId(); // Return the newly generated ID
        res.set_content(ret.dump(), "application/json");
    });

    svr.Delete(R"(/api/events/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        manager.removeEvent(id);
        res.set_content("{\"status\":\"success\"}", "application/json");
    });
    
    svr.Put(R"(/api/events/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        auto j = json::parse(req.body);
        std::string full_desc = j.value("category", "other") + "|" + j.value("desc", "");
        
        Event ev(
            j.value("title", ""),
            full_desc,
            iso_to_time(j.value("date", "")),
            priority_to_int(j.value("priority", "medium"))
        );
        
        if (j.contains("status") && j["status"] == "completed") {
            ev.setCompleted(true);
        }
        
        ev.setId(id);
        manager.updateEvent(id, ev);
        res.set_content("{\"status\":\"success\"}", "application/json");
    });

    // Serve static files from e:/projectpep
    svr.set_mount_point("/", "e:/projectpep");

    std::cout << "Starting C++ Server on http://localhost:8080 ...\n";
    svr.listen("0.0.0.0", 8080);
    return 0;
}
