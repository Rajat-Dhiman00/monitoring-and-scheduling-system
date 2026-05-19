// ===== DEFAULT TASKS & STORAGE =====

const defaultTasks = [
    { id: 1, title: 'Team Stand-up Meeting', date: new Date(Date.now() + 3600*1000*2).toISOString(), priority: 'high', category: 'work', desc: 'Daily sync with the product team.', status: 'pending', subtasks: [] },
    { id: 2, title: 'Pay Electricity Bill', date: new Date(Date.now() + 86400*1000*2).toISOString(), priority: 'medium', category: 'personal', desc: 'Due by end of week.', status: 'pending', subtasks: [] },
    { id: 3, title: 'React Course - Hooks', date: new Date(Date.now() + 86400*1000*4).toISOString(), priority: 'low', category: 'study', desc: 'Finish useEffect section.', status: 'pending', subtasks: [{id:1,text:'Watch lecture',done:true},{id:2,text:'Do exercises',done:false}] },
    { id: 4, title: 'Submit Expense Report', date: new Date(Date.now() - 86400*1000).toISOString(), priority: 'high', category: 'work', desc: 'For the last quarter trip.', status: 'pending', subtasks: [] },
    { id: 5, title: 'Doctor Appointment', date: new Date(Date.now() + 86400*1000*6).toISOString(), priority: 'medium', category: 'health', desc: 'Annual check-up.', status: 'completed', subtasks: [] }
];

function loadTasks() {
    try {
        const r = localStorage.getItem(STORAGE_KEY);
        return r ? JSON.parse(r) : defaultTasks;
    } catch(e) { return defaultTasks; }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
