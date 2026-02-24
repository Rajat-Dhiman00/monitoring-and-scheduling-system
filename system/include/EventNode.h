#ifndef EVENTNODE_H
#define EVENTNODE_H

#include "Event.h"

// Node for linked list implementation
class EventNode {
public:
    Event event;
    EventNode* next;
    
    EventNode(const Event& event) : event(event), next(nullptr) {}
};

#endif
