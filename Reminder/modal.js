// ===== MODAL =====

let currentSubtasks = [];

function openModal(editId = null) {
    const backdrop = document.getElementById('modalBackdrop');
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('modalTitle').textContent = 'New Task';
    currentSubtasks = [];
    renderSubtaskList();

    if (editId) {
        const t = tasks.find(x => x.id === editId);
        if (!t) return;
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = t.id;
        document.getElementById('taskTitle').value = t.title;
        const local = new Date(new Date(t.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('taskDate').value = local;
        document.getElementById('taskPriority').value = t.priority;
        document.getElementById('taskCategory').value = t.category;
        document.getElementById('taskDesc').value = t.desc || '';
        currentSubtasks = t.subtasks ? JSON.parse(JSON.stringify(t.subtasks)) : [];
        renderSubtaskList();
    } else {
        const tom = new Date(Date.now() + 86400 * 1000);
        tom.setHours(12, 0, 0, 0);
        document.getElementById('taskDate').value = new Date(tom.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    backdrop.classList.add('open');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
    refreshPomoTaskList();
}

function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('open');
}

function setupModal() {
    document.getElementById('createTaskBtn').addEventListener('click', () => openModal());
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', e => {
        if (e.target === document.getElementById('modalBackdrop')) closeModal();
    });

    const addSubBtn = document.getElementById('addSubtaskBtn');
    const subInput  = document.getElementById('subtaskInput');
    if (addSubBtn && subInput) {
        const addSub = () => {
            const v = subInput.value.trim();
            if (!v) return;
            currentSubtasks.push({ id: Date.now(), text: v, done: false });
            subInput.value = '';
            renderSubtaskList();
        };
        addSubBtn.addEventListener('click', addSub);
        subInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } });
    }

    document.getElementById('taskForm').addEventListener('submit', e => {
        e.preventDefault();
        const id       = document.getElementById('taskId').value;
        const title    = document.getElementById('taskTitle').value.trim();
        const date     = document.getElementById('taskDate').value;
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const desc     = document.getElementById('taskDesc').value.trim();

        if (!title || !date) {
            Swal.fire({ icon: 'warning', title: 'Missing fields', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            return;
        }

        if (id) {
            const idx = tasks.findIndex(t => t.id == id);
            if (idx > -1) {
                pushUndo({ type: 'edit', taskId: tasks[idx].id, title: tasks[idx].title, snapshot: { ...tasks[idx], subtasks: [...(tasks[idx].subtasks || [])] } });
                tasks[idx] = { ...tasks[idx], title, date: new Date(date).toISOString(), priority, category, desc, subtasks: [...currentSubtasks] };
            }
        } else {
            const newTask = { id: Date.now(), title, date: new Date(date).toISOString(), priority, category, desc, status: 'pending', subtasks: [...currentSubtasks] };
            tasks.push(newTask);
            pushUndo({ type: 'create', taskId: newTask.id, title: newTask.title, snapshot: { ...newTask } });
        }

        saveTasks(); computeStatuses(); renderAll(); closeModal();
        Swal.fire({ icon: 'success', title: id ? 'Task Updated!' : 'Task Created!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    });
}

function renderSubtaskList() {
    const el = document.getElementById('subtaskList');
    if (!el) return;
    el.innerHTML = currentSubtasks.map((s, i) => `
        <div class="subtask-item">
            <input type="checkbox" ${s.done ? 'checked' : ''} onchange="toggleSubtask(${i})">
            <span class="${s.done ? 'done' : ''}">${s.text}</span>
            <button class="subtask-del" onclick="removeSubtask(${i})"><span class="material-icons-round" style="font-size:.9rem">close</span></button>
        </div>`).join('');
}

window.toggleSubtask = i => { currentSubtasks[i].done = !currentSubtasks[i].done; renderSubtaskList(); };
window.removeSubtask = i => { currentSubtasks.splice(i, 1); renderSubtaskList(); };
