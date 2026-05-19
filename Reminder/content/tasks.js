// ===== TASK LOGIC & RENDERING =====

function computeStatuses() {
    const now = Date.now();
    tasks.forEach(t => {
        if (t.status === 'completed') return;
        t.status = new Date(t.date).getTime() < now ? 'overdue' : 'pending';
    });
}

function renderTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;

    const search      = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';
    const sortBy      = document.getElementById('sortSelect')?.value || 'priority';
    const pOrder      = { high: 0, medium: 1, low: 2 };

    let filtered = tasks.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (search && !t.title.toLowerCase().includes(search) && !(t.desc || '').toLowerCase().includes(search)) return false;
        return true;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'priority') { const d = pOrder[a.priority] - pOrder[b.priority]; return d !== 0 ? d : new Date(a.date) - new Date(b.date); }
        if (sortBy === 'date')     return new Date(a.date) - new Date(b.date);
        if (sortBy === 'title')    return a.title.localeCompare(b.title);
        return 0;
    });

    if (!filtered.length) {
        list.innerHTML = '<div class="empty-state"><span class="material-icons-round">task_alt</span><p>No tasks found.</p></div>';
        return;
    }

    const catLabels = { work: 'Work', personal: 'Home', study: 'Study', health: 'Health', other: 'Other' };
    list.innerHTML = filtered.map(t => {
        const done = t.status === 'completed', over = t.status === 'overdue';
        const dateStr = dayjs(t.date).format('D MMM, h:mm A'), rel = dayjs().to(dayjs(t.date));
        const subs = t.subtasks || [];
        const subsDone = subs.filter(s => s.done).length;
        const subBar = subs.length
            ? `<div class="task-subtask-bar"><span style="font-size:.7rem;color:var(--text-muted)">${subsDone}/${subs.length} subtasks</span><div class="subtask-progress"><div class="subtask-fill" style="width:${Math.round(subsDone / subs.length * 100)}%"></div></div></div>`
            : '';
        return `<div class="task-item" data-id="${t.id}">
            <div class="task-check ${done ? 'checked' : ''}" onclick="toggleComplete(${t.id})"><span class="material-icons-round">check</span></div>
            <div class="task-body">
                <div class="task-title-row">
                    <span class="task-title ${done ? 'done-text' : ''}">${t.title}</span>
                    <span class="badge ${t.priority}">${t.priority}</span>
                    ${over  ? '<span class="badge overdue">Overdue</span>' : ''}
                    ${done  ? '<span class="badge completed">Done</span>'  : ''}
                </div>
                <div class="task-meta">
                    <span class="meta-chip"><span class="material-icons-round">schedule</span>${dateStr} (${rel})</span>
                    <span class="meta-chip">${catLabels[t.category] || t.category}</span>
                </div>
                ${t.desc ? `<div class="task-desc">${t.desc}</div>` : ''}
                ${subBar}
            </div>
            <div class="task-actions">
                <button class="icon-btn" onclick="openModal(${t.id})" title="Edit"><span class="material-icons-round">edit</span></button>
                <button class="icon-btn" onclick="deleteTask(${t.id})" title="Delete"><span class="material-icons-round">delete_outline</span></button>
            </div>
        </div>`;
    }).join('');
}

function renderStats() {
    const p = tasks.filter(t => t.status === 'pending').length;
    const u = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    const c = tasks.filter(t => t.status === 'completed').length;
    const o = tasks.filter(t => t.status === 'overdue').length;
    document.getElementById('pendingCount').textContent   = p;
    document.getElementById('urgentCount').textContent    = u;
    document.getElementById('completedCount').textContent = c;
    document.getElementById('overdueCount').textContent   = o;
    document.getElementById('sidebarPending').textContent = p + o;
    document.getElementById('sidebarDone').textContent    = c;
}

function renderUrgentBanner() {
    const banner = document.getElementById('urgentBanner');
    if (!banner) return;
    const active = tasks.filter(t => t.status !== 'completed');
    if (!active.length) { banner.style.display = 'none'; return; }
    const pMap = { high: 0, medium: 1, low: 2 };
    const next = [...active].sort((a, b) => { const d = pMap[a.priority] - pMap[b.priority]; return d !== 0 ? d : new Date(a.date) - new Date(b.date); })[0];
    const isUrgent = next.priority === 'high' || next.status === 'overdue' || new Date(next.date) - Date.now() < 86400 * 1000;
    if (!isUrgent) { banner.style.display = 'none'; return; }
    banner.style.display = 'flex';
    document.getElementById('urgentTitle').textContent = next.title;
    document.getElementById('urgentTime').textContent  = next.status === 'overdue' ? 'OVERDUE' : 'Due ' + dayjs().to(dayjs(next.date));
    document.getElementById('urgentDoneBtn').onclick   = () => toggleComplete(next.id);
}

function deleteTask(id) {
    Swal.fire({ title: 'Delete this task?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5f6d', cancelButtonColor: '#555', confirmButtonText: 'Delete!' })
        .then(r => {
            if (r.isConfirmed) {
                const snap = tasks.find(t => t.id === id);
                if (snap) pushUndo({ type: 'delete', taskId: id, title: snap.title, snapshot: { ...snap } });
                tasks = tasks.filter(t => t.id !== id);
                saveTasks(); renderAll();
                Swal.fire({ icon: 'success', title: 'Deleted!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            }
        });
}

function toggleComplete(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    t.status = t.status === 'completed' ? 'pending' : 'completed';
    if (t.status !== 'completed') computeStatuses();
    saveTasks(); renderAll();
}

function refreshPomoTaskList() {
    const sel = document.getElementById('pomoTask');
    if (sel) sel.innerHTML = '<option value="">-- Link to task --</option>' + tasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
}

// ===== RENDER ALL =====
// Central sync point — called after every data mutation
function renderAll() {
    computeStatuses();
    renderStats();
    renderTasks();
    renderUrgentBanner();
    syncCalendar();
    updateCharts();
    refreshPomoTaskList();
    // Keep Quick Panel in sync if it's open
    const rp = document.getElementById('rightPanel');
    if (rp && rp.classList.contains('open')) {
        const activeTab = document.querySelector('.rp-tab.active');
        if (activeTab && typeof renderRPContent === 'function') renderRPContent(activeTab.dataset.rp);
    }
}

// Expose to inline onclick handlers
window.openModal      = openModal;
window.deleteTask     = deleteTask;
window.toggleComplete = toggleComplete;
