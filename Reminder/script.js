// ===== DAY.JS SETUP =====
dayjs.extend(dayjs_plugin_relativeTime);
dayjs.extend(dayjs_plugin_customParseFormat);

// ===== STATE =====
const STORAGE_KEY = 'tasksync_v3';
let tasks = [];
let calendarInstance = null;
let statusChart = null, priorityChart = null, weekChart = null;

const defaultTasks = [
    { id: 1, title: 'Team Stand-up Meeting', date: new Date(Date.now() + 3600*1000*2).toISOString(), priority: 'high', category: 'work', desc: 'Daily sync with the product team.', status: 'pending', subtasks: [] },
    { id: 2, title: 'Pay Electricity Bill', date: new Date(Date.now() + 86400*1000*2).toISOString(), priority: 'medium', category: 'personal', desc: 'Due by end of week.', status: 'pending', subtasks: [] },
    { id: 3, title: 'React Course - Hooks', date: new Date(Date.now() + 86400*1000*4).toISOString(), priority: 'low', category: 'study', desc: 'Finish useEffect section.', status: 'pending', subtasks: [{id:1,text:'Watch lecture',done:true},{id:2,text:'Do exercises',done:false}] },
    { id: 4, title: 'Submit Expense Report', date: new Date(Date.now() - 86400*1000).toISOString(), priority: 'high', category: 'work', desc: 'For the last quarter trip.', status: 'pending', subtasks: [] },
    { id: 5, title: 'Doctor Appointment', date: new Date(Date.now() + 86400*1000*6).toISOString(), priority: 'medium', category: 'health', desc: 'Annual check-up.', status: 'completed', subtasks: [] }
];

function loadTasks() {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : defaultTasks; }
    catch(e) { return defaultTasks; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function computeStatuses() {
    const now = Date.now();
    tasks.forEach(t => {
        if (t.status === 'completed') return;
        t.status = new Date(t.date).getTime() < now ? 'overdue' : 'pending';
    });
}

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const el = document.getElementById('digitalTime');
    const de = document.getElementById('digitalDate');
    if (el) el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (de) de.textContent = now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
    drawAnalogClock(now);
}

function drawAnalogClock(now) {
    const canvas = document.getElementById('analogClock');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2, r = cx - 4;
    const s = getComputedStyle(document.documentElement);
    const accent = s.getPropertyValue('--accent').trim() || '#4f8ef7';
    const textC = s.getPropertyValue('--text').trim() || '#e8ecf4';
    const bg2 = s.getPropertyValue('--bg2').trim() || '#1a1d27';
    const border = s.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.1)';
    ctx.clearRect(0,0,W,H);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=bg2; ctx.fill();
    ctx.strokeStyle=border; ctx.lineWidth=1.5; ctx.stroke();
    for(let i=0;i<12;i++){
        const a=(i/12)*Math.PI*2-Math.PI/2;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*(r-6),cy+Math.sin(a)*(r-6));
        ctx.lineTo(cx+Math.cos(a)*(r-12),cy+Math.sin(a)*(r-12));
        ctx.strokeStyle=border; ctx.lineWidth=i%3===0?2:1; ctx.stroke();
    }
    const hA=((now.getHours()%12+now.getMinutes()/60)/12)*Math.PI*2-Math.PI/2;
    const mA=((now.getMinutes()+now.getSeconds()/60)/60)*Math.PI*2-Math.PI/2;
    const sA=(now.getSeconds()/60)*Math.PI*2-Math.PI/2;
    [[hA,r*0.5,3,textC],[mA,r*0.72,2,textC],[sA,r*0.82,1.5,accent]].forEach(([a,len,w,c])=>{
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);
        ctx.strokeStyle=c; ctx.lineWidth=w; ctx.lineCap='round'; ctx.stroke();
    });
    ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fillStyle=accent; ctx.fill();
}

// ===== THEME =====
function initTheme() {
    const saved = localStorage.getItem('tasksync_theme') || 'dark';
    applyTheme(saved);
    document.getElementById('themeBtn').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('themeDropdown').classList.toggle('open');
    });
    document.addEventListener('click', e => {
        if (!document.getElementById('themeDropdown')?.contains(e.target) && e.target.id !== 'themeBtn')
            document.getElementById('themeDropdown')?.classList.remove('open');
    });
    document.querySelectorAll('.theme-swatch').forEach(btn => {
        btn.addEventListener('click', () => { applyTheme(btn.dataset.theme); document.getElementById('themeDropdown').classList.remove('open'); });
    });
}
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tasksync_theme', theme);
    document.querySelectorAll('.theme-swatch').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    // Redraw clock immediately so it picks up new theme CSS vars
    setTimeout(() => drawAnalogClock(new Date()), 50);
    if (statusChart) setTimeout(updateCharts, 80);
}

// ===== GREETING =====
function updateGreeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good Morning! ☀️' : h < 17 ? 'Good Afternoon! 🌤️' : 'Good Evening! 🌙';
    const el = document.getElementById('greetingText'), de = document.getElementById('greetingDate');
    if (el) el.textContent = g;
    if (de) de.textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// ===== NAVIGATION =====
function setupNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-section'));
            item.classList.add('active');
            const target = item.dataset.target;
            document.getElementById(target)?.classList.add('active-section');
            if (target === 'calendar-view') {
                setTimeout(() => { if (calendarInstance) { calendarInstance.updateSize(); syncCalendar(); } }, 80);
            }
            if (target === 'analytics') setTimeout(updateCharts, 80);
        });
    });
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        setTimeout(() => calendarInstance?.updateSize(), 320);
    });
}

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
        const local = new Date(new Date(t.date).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
        document.getElementById('taskDate').value = local;
        document.getElementById('taskPriority').value = t.priority;
        document.getElementById('taskCategory').value = t.category;
        document.getElementById('taskDesc').value = t.desc || '';
        currentSubtasks = t.subtasks ? JSON.parse(JSON.stringify(t.subtasks)) : [];
        renderSubtaskList();
    } else {
        const tom = new Date(Date.now() + 86400*1000); tom.setHours(12,0,0,0);
        document.getElementById('taskDate').value = new Date(tom.getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
    }
    backdrop.classList.add('open');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
    refreshPomoTaskList();
}

function closeModal() { document.getElementById('modalBackdrop').classList.remove('open'); }

function setupModal() {
    document.getElementById('createTaskBtn').addEventListener('click', () => openModal());
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', e => { if (e.target === document.getElementById('modalBackdrop')) closeModal(); });

    const addSubBtn = document.getElementById('addSubtaskBtn');
    const subInput = document.getElementById('subtaskInput');
    if (addSubBtn && subInput) {
        const addSub = () => { const v = subInput.value.trim(); if (!v) return; currentSubtasks.push({id:Date.now(),text:v,done:false}); subInput.value=''; renderSubtaskList(); };
        addSubBtn.addEventListener('click', addSub);
        subInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } });
    }

    document.getElementById('taskForm').addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const date = document.getElementById('taskDate').value;
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const desc = document.getElementById('taskDesc').value.trim();
        if (!title || !date) { Swal.fire({icon:'warning',title:'Missing fields',toast:true,position:'top-end',showConfirmButton:false,timer:2000}); return; }
        if (id) {
            const idx = tasks.findIndex(t => t.id == id);
            if (idx > -1) {
                pushUndo({type:'edit', taskId:tasks[idx].id, title:tasks[idx].title, snapshot:{...tasks[idx], subtasks:[...tasks[idx].subtasks||[]]}});
                tasks[idx] = {...tasks[idx], title, date:new Date(date).toISOString(), priority, category, desc, subtasks:[...currentSubtasks]};
            }
        } else {
            const newTask = {id:Date.now(), title, date:new Date(date).toISOString(), priority, category, desc, status:'pending', subtasks:[...currentSubtasks]};
            tasks.push(newTask);
            pushUndo({type:'create', taskId:newTask.id, title:newTask.title, snapshot:{...newTask}});
        }
        saveTasks(); computeStatuses(); renderAll(); closeModal();
        Swal.fire({icon:'success', title: id ? 'Task Updated!' : 'Task Created!', toast:true, position:'top-end', showConfirmButton:false, timer:2000});
    });
}

function renderSubtaskList() {
    const el = document.getElementById('subtaskList');
    if (!el) return;
    el.innerHTML = currentSubtasks.map((s,i) => `
        <div class="subtask-item">
            <input type="checkbox" ${s.done?'checked':''} onchange="toggleSubtask(${i})">
            <span class="${s.done?'done':''}">${s.text}</span>
            <button class="subtask-del" onclick="removeSubtask(${i})"><span class="material-icons-round" style="font-size:.9rem">close</span></button>
        </div>`).join('');
}
window.toggleSubtask = i => { currentSubtasks[i].done = !currentSubtasks[i].done; renderSubtaskList(); };
window.removeSubtask = i => { currentSubtasks.splice(i,1); renderSubtaskList(); };

// ===== DELETE =====
function deleteTask(id) {
    Swal.fire({title:'Delete this task?', text:"This cannot be undone.", icon:'warning', showCancelButton:true, confirmButtonColor:'#ff5f6d', cancelButtonColor:'#555', confirmButtonText:'Delete!'})
    .then(r => {
        if (r.isConfirmed) {
            const snap = tasks.find(t => t.id===id);
            if (snap) pushUndo({type:'delete', taskId:id, title:snap.title, snapshot:{...snap}});
            tasks = tasks.filter(t => t.id !== id);
            saveTasks(); renderAll();
            Swal.fire({icon:'success', title:'Deleted!', toast:true, position:'top-end', showConfirmButton:false, timer:1500});
        }
    });
}

function toggleComplete(id) {
    const t = tasks.find(x => x.id===id);
    if (!t) return;
    t.status = t.status === 'completed' ? 'pending' : 'completed';
    if (t.status !== 'completed') computeStatuses();
    saveTasks(); renderAll();
}

// ===== RENDER TASKS =====
function renderTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;
    const search = (document.getElementById('searchInput')?.value||'').toLowerCase();
    const filterStatus = document.getElementById('filterStatus')?.value||'all';
    const sortBy = document.getElementById('sortSelect')?.value||'priority';
    const pOrder = {high:0,medium:1,low:2};
    let filtered = tasks.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (search && !t.title.toLowerCase().includes(search) && !(t.desc||'').toLowerCase().includes(search)) return false;
        return true;
    });
    filtered.sort((a,b) => {
        if (sortBy==='priority') { const d=pOrder[a.priority]-pOrder[b.priority]; return d!==0?d:new Date(a.date)-new Date(b.date); }
        if (sortBy==='date') return new Date(a.date)-new Date(b.date);
        if (sortBy==='title') return a.title.localeCompare(b.title);
        return 0;
    });
    if (!filtered.length) { list.innerHTML='<div class="empty-state"><span class="material-icons-round">task_alt</span><p>No tasks found.</p></div>'; return; }
    const catLabels = {work:'Work',personal:'Home',study:'Study',health:'Health',other:'Other'};
    list.innerHTML = filtered.map(t => {
        const done=t.status==='completed', over=t.status==='overdue';
        const dateStr=dayjs(t.date).format('D MMM, h:mm A'), rel=dayjs().to(dayjs(t.date));
        const subs = t.subtasks||[];
        const subsDone = subs.filter(s=>s.done).length;
        const subBar = subs.length ? `<div class="task-subtask-bar"><span style="font-size:.7rem;color:var(--text-muted)">${subsDone}/${subs.length} subtasks</span><div class="subtask-progress"><div class="subtask-fill" style="width:${Math.round(subsDone/subs.length*100)}%"></div></div></div>` : '';
        return `<div class="task-item" data-id="${t.id}">
            <div class="task-check ${done?'checked':''}" onclick="toggleComplete(${t.id})"><span class="material-icons-round">check</span></div>
            <div class="task-body">
                <div class="task-title-row">
                    <span class="task-title ${done?'done-text':''}">${t.title}</span>
                    <span class="badge ${t.priority}">${t.priority}</span>
                    ${over?'<span class="badge overdue">Overdue</span>':''}
                    ${done?'<span class="badge completed">Done</span>':''}
                </div>
                <div class="task-meta">
                    <span class="meta-chip"><span class="material-icons-round">schedule</span>${dateStr} (${rel})</span>
                    <span class="meta-chip">${catLabels[t.category]||t.category}</span>
                </div>
                ${t.desc?`<div class="task-desc">${t.desc}</div>`:''}
                ${subBar}
            </div>
            <div class="task-actions">
                <button class="icon-btn" onclick="openModal(${t.id})" title="Edit"><span class="material-icons-round">edit</span></button>
                <button class="icon-btn" onclick="deleteTask(${t.id})" title="Delete"><span class="material-icons-round">delete_outline</span></button>
            </div>
        </div>`;
    }).join('');
}

// ===== STATS =====
function renderStats() {
    const p=tasks.filter(t=>t.status==='pending').length, u=tasks.filter(t=>t.priority==='high'&&t.status!=='completed').length;
    const c=tasks.filter(t=>t.status==='completed').length, o=tasks.filter(t=>t.status==='overdue').length;
    document.getElementById('pendingCount').textContent=p;
    document.getElementById('urgentCount').textContent=u;
    document.getElementById('completedCount').textContent=c;
    document.getElementById('overdueCount').textContent=o;
    document.getElementById('sidebarPending').textContent=p+o;
    document.getElementById('sidebarDone').textContent=c;
}

function renderUrgentBanner() {
    const banner=document.getElementById('urgentBanner'); if (!banner) return;
    const active=tasks.filter(t=>t.status!=='completed');
    if (!active.length) { banner.style.display='none'; return; }
    const pMap={high:0,medium:1,low:2};
    const next=[...active].sort((a,b)=>{const d=pMap[a.priority]-pMap[b.priority];return d!==0?d:new Date(a.date)-new Date(b.date);})[0];
    const isUrgent=next.priority==='high'||next.status==='overdue'||new Date(next.date)-Date.now()<86400*1000;
    if (!isUrgent) { banner.style.display='none'; return; }
    banner.style.display='flex';
    document.getElementById('urgentTitle').textContent=next.title;
    document.getElementById('urgentTime').textContent=next.status==='overdue'?'OVERDUE':'Due '+dayjs().to(dayjs(next.date));
    document.getElementById('urgentDoneBtn').onclick=()=>toggleComplete(next.id);
}

// ===== CALENDAR =====
function buildCalendarEvents() {
    const colors={high:'#ff5f6d',medium:'#f8c23a',low:'#2dd4a0'};
    return tasks.map(t=>({id:String(t.id), title:t.title, start:t.date, backgroundColor:t.status==='completed'?'#6b7280':colors[t.priority]||'#4f8ef7', borderColor:'transparent', textColor:'#fff'}));
}

function syncCalendar() {
    if (!calendarInstance) return;
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(buildCalendarEvents());
}

function initCalendar() {
    const el=document.getElementById('calendar'); if (!el) return;
    calendarInstance=new FullCalendar.Calendar(el,{
        initialView:'dayGridMonth',
        headerToolbar:{left:'prev,next today',center:'title',right:'dayGridMonth,timeGridWeek,listWeek'},
        height:'auto', events:buildCalendarEvents(),
        eventClick: info => openModal(parseInt(info.event.id)),
        dateClick: info => {
            openModal();
            // Use the clicked date directly without timezone offset manipulation
            setTimeout(()=>{
                const dateVal = info.dateStr + 'T12:00';
                document.getElementById('taskDate').value=dateVal;
            },50);
        }
    });
    calendarInstance.render();
}

// ===== CHARTS =====
function getChartColors() {
    const s=getComputedStyle(document.documentElement);
    return {text:s.getPropertyValue('--text').trim(), muted:s.getPropertyValue('--text-muted').trim(), high:s.getPropertyValue('--high').trim()||'#ff5f6d', medium:s.getPropertyValue('--medium').trim()||'#f8c23a', low:s.getPropertyValue('--low').trim()||'#2dd4a0', accent:s.getPropertyValue('--accent').trim()||'#4f8ef7', border:s.getPropertyValue('--border').trim()};
}

function initCharts() {
    const c=getChartColors();
    const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:c.text,font:{family:'Inter',size:12}}}}};
    const ctxS=document.getElementById('statusChart');
    if (ctxS) statusChart=new Chart(ctxS,{type:'doughnut',data:{labels:['Pending','Completed','Overdue'],datasets:[{data:[0,0,0],backgroundColor:[c.accent,c.low,c.high],borderWidth:0}]},options:{...base,cutout:'65%'}});
    const ctxP=document.getElementById('priorityChart');
    if (ctxP) priorityChart=new Chart(ctxP,{type:'bar',data:{labels:['High','Medium','Low'],datasets:[{label:'Tasks',data:[0,0,0],backgroundColor:[c.high,c.medium,c.low],borderRadius:6}]},options:{...base,scales:{y:{beginAtZero:true,ticks:{color:c.muted,stepSize:1},grid:{color:c.border}},x:{ticks:{color:c.muted},grid:{display:false}}}}});
    const ctxW=document.getElementById('weekChart');
    if (ctxW) {
        const days=[],counts=[];
        for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400*1000);days.push(d.toLocaleDateString('en-IN',{weekday:'short'}));counts.push(tasks.filter(t=>t.date.slice(0,10)===d.toISOString().slice(0,10)).length);}
        weekChart=new Chart(ctxW,{type:'line',data:{labels:days,datasets:[{label:'Tasks Due',data:counts,borderColor:c.accent,backgroundColor:c.accent+'22',tension:0.4,fill:true,pointBackgroundColor:c.accent,pointRadius:5}]},options:{...base,scales:{y:{beginAtZero:true,ticks:{color:c.muted,stepSize:1},grid:{color:c.border}},x:{ticks:{color:c.muted},grid:{display:false}}}}});
    }
    updateCharts();
}

function updateCharts() {
    const c=getChartColors();
    if (statusChart) { statusChart.data.datasets[0].data=[tasks.filter(t=>t.status==='pending').length,tasks.filter(t=>t.status==='completed').length,tasks.filter(t=>t.status==='overdue').length]; statusChart.data.datasets[0].backgroundColor=[c.accent,c.low,c.high]; statusChart.update(); }
    if (priorityChart) { priorityChart.data.datasets[0].data=[tasks.filter(t=>t.priority==='high').length,tasks.filter(t=>t.priority==='medium').length,tasks.filter(t=>t.priority==='low').length]; priorityChart.data.datasets[0].backgroundColor=[c.high,c.medium,c.low]; priorityChart.update(); }
    if (weekChart) {
        const counts=[];
        for(let i=6;i>=0;i--){const day=new Date(Date.now()-i*86400*1000).toISOString().slice(0,10);counts.push(tasks.filter(t=>t.date.slice(0,10)===day).length);}
        weekChart.data.datasets[0].data=counts; weekChart.data.datasets[0].borderColor=c.accent; weekChart.data.datasets[0].backgroundColor=c.accent+'22'; weekChart.update();
    }
}

// ===== RENDER ALL =====
function renderAll() {
    computeStatuses(); renderStats(); renderTasks(); renderUrgentBanner();
    syncCalendar();
    updateCharts();
    refreshPomoTaskList();
    // Sync right panel if it's open
    const rp = document.getElementById('rightPanel');
    if (rp && rp.classList.contains('open')) {
        const activeTab = document.querySelector('.rp-tab.active');
        if (activeTab && typeof renderRPContent === 'function') renderRPContent(activeTab.dataset.rp);
    }
}

function refreshPomoTaskList() {
    const sel=document.getElementById('pomoTask');
    if (sel) sel.innerHTML='<option value="">-- Link to task --</option>'+tasks.map(t=>`<option value="${t.id}">${t.title}</option>`).join('');
}

// ===== CONTROLS =====
function setupControls() {
    document.getElementById('searchInput')?.addEventListener('input', renderTasks);
    document.getElementById('filterStatus')?.addEventListener('change', renderTasks);
    document.getElementById('sortSelect')?.addEventListener('change', renderTasks);
}

// ===== NOTIFICATIONS =====
function initNotifications() {
    const btn=document.getElementById('notifyBtn'); if (!btn) return;
    if (Notification.permission==='granted') btn.style.color='var(--low)';
    btn.addEventListener('click', ()=>{
        if (Notification.permission==='denied') { alert('Notifications blocked in browser settings.'); return; }
        Notification.requestPermission().then(p=>{ if(p==='granted'){ btn.style.color='var(--low)'; new Notification('TaskSync', {body:'Notifications enabled!'}); } });
    });
    setInterval(()=>{
        if (Notification.permission!=='granted') return;
        tasks.filter(t=>t.status!=='completed'&&new Date(t.date)-Date.now()<900000&&new Date(t.date)-Date.now()>0)
             .forEach(t=>new Notification('TaskSync Reminder',{body:`"${t.title}" due in <15 mins!`}));
    }, 60000);
}

// ===== UNDO STACK =====
const undoStack=[], redoStack=[];
function pushUndo(op) { undoStack.push(op); redoStack.length=0; if (typeof renderStackVisual==='function') renderStackVisual(); }

// ===== EXPOSE GLOBALS =====
window.openModal=openModal; window.deleteTask=deleteTask; window.toggleComplete=toggleComplete;

// ===== INIT =====
function init() {
    tasks=loadTasks(); computeStatuses();
    initTheme(); updateGreeting(); updateClock();
    setupNav(); setupModal(); setupControls();
    renderAll(); initCalendar(); initCharts(); initNotifications();
    setInterval(updateClock, 1000);
    // Every minute: recompute overdue statuses, refresh dashboard, update greeting
    setInterval(()=>{ computeStatuses(); renderStats(); renderUrgentBanner(); renderTasks(); updateGreeting(); syncCalendar(); }, 60000);
}
document.addEventListener('DOMContentLoaded', init);
