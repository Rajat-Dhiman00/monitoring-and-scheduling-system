// ===== GLOBAL STATE =====
// Single source of truth — all other modules read/write these
const STORAGE_KEY = 'tasksync_v3';
let tasks = [];
let calendarInstance = null;
let statusChart = null, priorityChart = null, weekChart = null;
