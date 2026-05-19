// ===== DSA LAB + POMODORO + STACK UNDO =====
// Loaded after script.js

// ===== UNDO/REDO VISUAL =====
function renderStackVisual() {
    const el=document.getElementById('stackVisual'); if (!el) return;
    if (!undoStack.length) { el.innerHTML='<div class="stack-empty">Stack is empty. Create, edit or delete tasks to see operations here.</div>'; document.getElementById('stackLog').textContent='Empty stack.'; return; }
    el.innerHTML=undoStack.map((op,i)=>{
        const top=i===undoStack.length-1;
        return `<div class="stack-card ${top?'top':''}"><span>${op.title.slice(0,30)}</span><div style="display:flex;align-items:center;gap:.4rem">${top?'<span style="font-size:.7rem;color:var(--accent)">TOP</span>':''}<span class="op-type op-${op.type}">${op.type.toUpperCase()}</span></div></div>`;
    }).join('');
    const top=undoStack[undoStack.length-1];
    document.getElementById('stackLog').textContent=`Stack depth: ${undoStack.length} | TOP: "${top.title}" [${top.type}]`;
}

function doUndo() {
    if (!undoStack.length) { Swal.fire({icon:'info',title:'Nothing to undo',toast:true,position:'top-end',showConfirmButton:false,timer:1500}); return; }
    const op=undoStack.pop(); redoStack.push(op);
    if (op.type==='create') tasks=tasks.filter(t=>t.id!==op.taskId);
    else if (op.type==='delete') tasks.push(op.snapshot);
    else if (op.type==='edit') { const i=tasks.findIndex(t=>t.id===op.taskId); if(i>-1) tasks[i]=op.snapshot; }
    saveTasks(); computeStatuses(); renderAll(); renderStackVisual();
    document.getElementById('stackLog').textContent=`Undid [${op.type.toUpperCase()}]: "${op.title}"`;
}

function doRedo() {
    if (!redoStack.length) { Swal.fire({icon:'info',title:'Nothing to redo',toast:true,position:'top-end',showConfirmButton:false,timer:1500}); return; }
    const op=redoStack.pop(); undoStack.push(op);
    if (op.type==='create') tasks.push(op.snapshot);
    else if (op.type==='delete') tasks=tasks.filter(t=>t.id!==op.taskId);
    else if (op.type==='edit') { const i=tasks.findIndex(t=>t.id===op.taskId); if(i>-1) tasks[i]=op.snapshot; }
    saveTasks(); computeStatuses(); renderAll(); renderStackVisual();
    document.getElementById('stackLog').textContent=`Redid [${op.type.toUpperCase()}]: "${op.title}"`;
}

// ===== DSA TAB SWITCHER =====
function initDSATabs() {
    document.querySelectorAll('.dsa-tab').forEach(tab=>{
        tab.addEventListener('click',()=>{
            document.querySelectorAll('.dsa-tab').forEach(t=>t.classList.remove('active'));
            document.querySelectorAll('.dsa-panel').forEach(p=>p.classList.remove('active-dsa'));
            tab.classList.add('active');
            document.getElementById('dsa-'+tab.dataset.dsa)?.classList.add('active-dsa');
        });
    });
    document.getElementById('undoBtn')?.addEventListener('click', doUndo);
    document.getElementById('redoBtn')?.addEventListener('click', doRedo);
}

// ===== HEAP VISUALIZER =====
let heapArr=[];
function initHeap() {
    document.getElementById('heapBuildBtn')?.addEventListener('click', buildHeap);
    document.getElementById('heapExtractBtn')?.addEventListener('click', extractHeap);
}
function buildHeap() {
    const pMap={high:3,medium:2,low:1};
    heapArr=tasks.map(t=>({label:t.title.slice(0,12), val:pMap[t.priority]||1, priority:t.priority}));
    heapArr.sort((a,b)=>b.val-a.val);
    drawHeap();
    document.getElementById('heapLog').textContent=`Heapified ${heapArr.length} tasks. Root = "${heapArr[0]?.label}" [priority:${heapArr[0]?.priority}]. Build: O(n). Extract: O(log n).`;
}
function extractHeap() {
    if (!heapArr.length) { buildHeap(); return; }
    const ex=heapArr.shift(); drawHeap();
    document.getElementById('heapLog').textContent=`Extracted max: "${ex.label}" [${ex.priority}]. New root: "${heapArr[0]?.label||'(empty)'}" [${heapArr[0]?.priority||''}].`;
}
function drawHeap() {
    const canvas = document.getElementById('heapCanvas'); if (!canvas) return;
    const W = canvas.parentElement.offsetWidth - 40 || 640;
    canvas.width = W; canvas.height = 320;
    const ctx = canvas.getContext('2d');
    // Use theme-aware background color
    const cs = getComputedStyle(document.documentElement);
    const bg2 = cs.getPropertyValue('--bg2').trim() || '#1a1d2e';
    const textColor = cs.getPropertyValue('--text').trim() || '#e8ecf4';
    const textMuted = cs.getPropertyValue('--text-muted').trim() || '#7b8299';
    const accentColor = cs.getPropertyValue('--accent').trim() || '#4f8ef7';
    ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, 320);
    if (!heapArr.length) {
        ctx.fillStyle = textMuted; ctx.font = '14px Inter'; ctx.textAlign = 'center';
        ctx.fillText('Click "Build Heap from Tasks" to visualize', W/2, 160); return;
    }
    const nodeColors = { high: '#ff5f6d', medium: '#f8c23a', low: '#2dd4a0' };
    const pos = [];
    heapArr.forEach((node, i) => {
        const lv = Math.floor(Math.log2(i + 1));
        const posInLv = i - (Math.pow(2, lv) - 1);
        const totalInLv = Math.pow(2, lv);
        const x = (W / (totalInLv + 1)) * (posInLv + 1);
        const y = 44 + lv * 78;
        pos.push({ x, y });
        if (i > 0) {
            const pi = Math.floor((i - 1) / 2);
            ctx.beginPath(); ctx.moveTo(pos[pi].x, pos[pi].y); ctx.lineTo(x, y);
            ctx.strokeStyle = accentColor + '66'; ctx.lineWidth = 2; ctx.stroke();
        }
        const r = 28;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeColors[node.priority] || accentColor;
        ctx.globalAlpha = 0.92; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = i === 0 ? 2.5 : 1; ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${node.label.length > 9 ? '8' : '10'}px Inter`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(node.label.slice(0, 12), x, y);
        if (i === 0) {
            ctx.font = '9px Inter'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText('ROOT (MAX)', x, y + r + 12);
        }
    });
}


// ===== LINKED LIST VISUALIZER =====
function initLinkedList() {
    document.getElementById('llBuildBtn')?.addEventListener('click', buildLinkedList);
    document.getElementById('llSearchBtn')?.addEventListener('click', animateTraversal);
}
function buildLinkedList() {
    const wrap=document.getElementById('llCanvas'); if (!wrap) return;
    wrap.innerHTML='';
    const pMap={high:0,medium:1,low:2};
    const sorted=[...tasks].sort((a,b)=>pMap[a.priority]-pMap[b.priority]);
    const catL={work:'Work',personal:'Home',study:'Study',health:'Health',other:'Other'};
    sorted.forEach((t,i)=>{
        const node=document.createElement('div'); node.className='ll-node';
        node.innerHTML=`<div class="ll-box" id="llbox-${i}"><div class="ll-title">${t.title.slice(0,16)}</div><div class="ll-sub">${catL[t.category]||t.category} | ${t.priority}</div></div><span class="ll-arrow">${i<sorted.length-1?'&rarr;':''}</span>`;
        wrap.appendChild(node);
    });
    const nullEl=document.createElement('div'); nullEl.className='ll-null'; nullEl.textContent='NULL';
    wrap.appendChild(nullEl);
    document.getElementById('llLog').textContent=`Built linked list: ${sorted.length} nodes. Head="${sorted[0]?.title.slice(0,20)}". Tail-->NULL. Insert O(1), Search O(n).`;
}
function animateTraversal() {
    const boxes=document.querySelectorAll('[id^="llbox-"]');
    if (!boxes.length) { buildLinkedList(); return; }
    boxes.forEach(b=>b.classList.remove('highlight','found'));
    let i=0;
    const iv=setInterval(()=>{
        if (i>0) boxes[i-1]?.classList.remove('highlight');
        if (i>=boxes.length) { clearInterval(iv); document.getElementById('llLog').textContent=`Traversal complete. Visited ${boxes.length} nodes in O(n)=O(${boxes.length}) steps.`; return; }
        boxes[i].classList.add('highlight');
        document.getElementById('llLog').textContent=`Visiting node [${i}]: "${boxes[i].querySelector('.ll-title').textContent}"`;
        i++;
    },500);
}

// ===== BINARY SEARCH =====
let bsSorted=[];
function initBinarySearch() {
    document.getElementById('bsRunBtn')?.addEventListener('click', runBinarySearch);
}
function runBinarySearch() {
    bsSorted=[...tasks].sort((a,b)=>a.title.localeCompare(b.title));
    const query=(document.getElementById('bsInput')?.value||'').trim().toLowerCase();
    const wrap=document.getElementById('bsArray'); if (!wrap) return;
    wrap.innerHTML=bsSorted.map((t,i)=>`<div class="bs-cell" id="bscell-${i}"><div class="bs-cell-label">${t.title.slice(0,12)}</div><div class="bs-cell-idx">[${i}]</div></div>`).join('');
    if (!query) { document.getElementById('bsLog').textContent='Enter a task title keyword above then click Run.'; return; }
    let lo=0, hi=bsSorted.length-1, steps=0, found=-1;
    const cells=document.querySelectorAll('[id^="bscell-"]');
    const log=document.getElementById('bsLog'), msgs=[];
    const iv=setInterval(()=>{
        if (lo>hi) { clearInterval(iv); cells.forEach(c=>{if(!c.classList.contains('found'))c.classList.add('eliminated');}); log.textContent=found>=0?`Found at [${found}] in ${steps} steps. O(log ${bsSorted.length})~${Math.ceil(Math.log2(bsSorted.length))} steps max.`:`"${query}" not found after ${steps} steps. O(log n) search.`; return; }
        const mid=Math.floor((lo+hi)/2); steps++;
        cells.forEach(c=>c.classList.remove('active'));
        cells[mid]?.classList.add('active');
        const cmp=bsSorted[mid].title.toLowerCase().localeCompare(query);
        msgs.push(`Step ${steps}: mid=[${mid}] "${bsSorted[mid].title.slice(0,12)}" -> ${cmp===0?'FOUND':cmp>0?'go left':'go right'}`);
        log.textContent=msgs.slice(-2).join(' | ');
        if (cmp===0) { found=mid; cells[mid]?.classList.add('found'); clearInterval(iv); log.textContent=`Found "${bsSorted[mid].title}" at index [${mid}] in ${steps} steps. Binary search O(log n).`; }
        else if (cmp>0) hi=mid-1; else lo=mid+1;
    },650);
}

// ===== SORTING VISUALIZER =====
let sortArr=[], sortRunning=false;
function initSortingViz() {
    document.getElementById('sortRunBtn')?.addEventListener('click', runSortingViz);
    document.getElementById('sortResetBtn')?.addEventListener('click', resetSortViz);
}
function resetSortViz() {
    sortRunning=false;
    const field=document.getElementById('sortFieldSelect')?.value||'priority';
    const pMap={high:3,medium:2,low:1};
    sortArr=tasks.map(t=>({label:t.title.slice(0,8), val:field==='priority'?pMap[t.priority]:t.title.charCodeAt(0)%26+1}));
    sortArr.sort(()=>Math.random()-.5);
    renderSortBars(); document.getElementById('sortLog').textContent='Array shuffled. Press Run to animate.';
}
function renderSortBars(comparing=[],swapping=[],sorted=[]) {
    const wrap=document.getElementById('sortBars'); if (!wrap||!sortArr.length) return;
    const maxVal=Math.max(...sortArr.map(b=>b.val),1);
    wrap.innerHTML=sortArr.map((b,i)=>{
        const h=Math.max(20,(b.val/maxVal)*170);
        let cls='sort-bar';
        if (comparing.includes(i)) cls+=' comparing';
        if (swapping.includes(i)) cls+=' swapping';
        if (sorted.includes(i)) cls+=' sorted';
        return `<div class="${cls}" style="height:${h}px"><div class="sort-bar-label">${b.label}</div></div>`;
    }).join('');
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function runSortingViz() {
    if (sortRunning) return;
    if (!sortArr.length) resetSortViz();
    sortRunning=true;
    const algo=document.getElementById('sortAlgoSelect')?.value||'bubble';
    const log=document.getElementById('sortLog');
    const arr=[...sortArr]; const n=arr.length; const si=new Set();
    log.textContent=`Running ${algo} sort on ${n} items...`;
    if (algo==='bubble') {
        for (let i=0;i<n-1;i++) {
            for (let j=0;j<n-i-1;j++) {
                if (!sortRunning) return;
                sortArr=[...arr]; renderSortBars([j,j+1],[],[...si]); await sleep(200);
                if (arr[j].val>arr[j+1].val) { [arr[j],arr[j+1]]=[arr[j+1],arr[j]]; sortArr=[...arr]; renderSortBars([],[j,j+1],[...si]); await sleep(200); }
            }
            si.add(n-1-i);
        }
        si.add(0);
    } else if (algo==='selection') {
        for (let i=0;i<n-1;i++) {
            let mi=i;
            for (let j=i+1;j<n;j++) { if (!sortRunning) return; sortArr=[...arr]; renderSortBars([mi,j],[],[...si]); await sleep(160); if (arr[j].val<arr[mi].val) mi=j; }
            if (mi!==i) { [arr[i],arr[mi]]=[arr[mi],arr[i]]; sortArr=[...arr]; renderSortBars([],[i,mi],[...si]); await sleep(200); }
            si.add(i);
        }
        si.add(n-1);
    } else if (algo==='merge') {
        const merge=async(a,l,r)=>{
            if (l>=r||!sortRunning) return;
            const m=Math.floor((l+r)/2);
            await merge(a,l,m); await merge(a,m+1,r);
            const left=a.slice(l,m+1), right=a.slice(m+1,r+1);
            let i=0,j=0,k=l;
            while(i<left.length&&j<right.length){sortArr=[...a];renderSortBars([k]);await sleep(160);if(left[i].val<=right[j].val)a[k++]=left[i++];else a[k++]=right[j++];sortArr=[...a];}
            while(i<left.length)a[k++]=left[i++];
            while(j<right.length)a[k++]=right[j++];
            sortArr=[...a];
        };
        await merge(arr,0,n-1);
    }
    sortArr=[...arr]; renderSortBars([],[],Array.from({length:n},(_,i)=>i));
    log.textContent=`Done! ${n} tasks sorted using ${algo} sort.`;
    sortRunning=false;
}

// ===== POMODORO =====
let pomoInterval=null, pomoSecs=25*60, pomoRunning=false, pomoFocus=true, pomoSession=0;
const FOCUS=25*60, BREAK=5*60;
function initPomodoro() {
    const toggle=document.getElementById('pomoToggle'), panel=document.getElementById('pomoPanel');
    if (!toggle||!panel) return;
    toggle.addEventListener('click',e=>{e.stopPropagation();panel.classList.toggle('open');});
    document.addEventListener('click',e=>{if(!document.getElementById('pomodoroWidget')?.contains(e.target))panel.classList.remove('open');});
    document.getElementById('pomoStart')?.addEventListener('click',startPomo);
    document.getElementById('pomoPause')?.addEventListener('click',pausePomo);
    document.getElementById('pomoReset')?.addEventListener('click',resetPomo);
    updatePomoDisplay();
}
function startPomo() {
    if (pomoRunning) return; pomoRunning=true;
    pomoInterval=setInterval(()=>{
        pomoSecs--; updatePomoDisplay();
        if (pomoSecs<=0) {
            clearInterval(pomoInterval); pomoRunning=false; pomoFocus=!pomoFocus; pomoSecs=pomoFocus?FOCUS:BREAK;
            if (!pomoFocus){pomoSession++;updatePomoDots();}
            updatePomoDisplay();
            Swal.fire({icon:'info',title:pomoFocus?'Focus Time!':'Break Time!',toast:true,position:'top-end',showConfirmButton:false,timer:3000});
            if (Notification.permission==='granted') new Notification('TaskSync Pomodoro',{body:pomoFocus?'Break over! Back to work.':'Focus done! Take a break.'});
        }
    },1000);
}
function pausePomo(){clearInterval(pomoInterval);pomoRunning=false;}
function resetPomo(){pausePomo();pomoFocus=true;pomoSecs=FOCUS;updatePomoDisplay();}
function updatePomoDisplay(){
    const m=String(Math.floor(pomoSecs/60)).padStart(2,'0'),sec=String(pomoSecs%60).padStart(2,'0'),str=`${m}:${sec}`;
    const d1=document.getElementById('pomoDisplay'),d2=document.getElementById('pomoTimeBig');
    if(d1)d1.textContent=str; if(d2)d2.textContent=str;
    const total=pomoFocus?FOCUS:BREAK, pct=1-(pomoSecs/total);
    const ring=document.getElementById('pomoRing');
    if(ring)ring.style.strokeDashoffset=276.46*pct;
    const mEl=document.getElementById('pomoMode'); if(mEl)mEl.textContent=pomoFocus?'Focus':'Break';
}
function updatePomoDots(){[1,2,3,4].forEach(i=>{const d=document.getElementById('pd'+i);if(d)d.classList.toggle('active',i<=(pomoSession%4||4));});}

// ===== BOOT ALL DSA FEATURES =====
document.addEventListener('DOMContentLoaded', ()=>{
    initPomodoro(); initDSATabs(); initHeap(); initLinkedList();
    initBinarySearch(); initSortingViz(); renderStackVisual();
    setTimeout(resetSortViz, 500);
});

// ===== RIGHT PANEL =====
function initRightPanel() {
    const trigger = document.getElementById('rpTrigger');
    const panel = document.getElementById('rightPanel');
    const backdrop = document.getElementById('rpBackdrop');
    const closeBtn = document.getElementById('rpClose');
    if (!trigger || !panel) return;

    function openPanel() {
        panel.classList.add('open');
        backdrop.classList.add('open');
        trigger.querySelector('.material-icons-round').textContent = 'chevron_right';
        renderRPContent('overview');
    }
    function closePanel() {
        panel.classList.remove('open');
        backdrop.classList.remove('open');
        trigger.querySelector('.material-icons-round').textContent = 'chevron_left';
    }

    trigger.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
    closeBtn?.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);

    document.querySelectorAll('.rp-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.rp-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderRPContent(tab.dataset.rp);
        });
    });
}

function renderRPContent(tab) {
    const body = document.getElementById('rpBody');
    if (!body) return;

    if (tab === 'overview') {
        const p = tasks.filter(t => t.status === 'pending').length;
        const u = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
        const c = tasks.filter(t => t.status === 'completed').length;
        const o = tasks.filter(t => t.status === 'overdue').length;
        const rate = tasks.length ? Math.round((c / tasks.length) * 100) : 0;
        body.innerHTML = `
        <div class="rp-stat-row">
            <div class="rp-stat"><div class="rp-stat-num" style="color:var(--accent)">${p}</div><div class="rp-stat-lbl">Pending</div></div>
            <div class="rp-stat"><div class="rp-stat-num" style="color:var(--high)">${o}</div><div class="rp-stat-lbl">Overdue</div></div>
            <div class="rp-stat"><div class="rp-stat-num" style="color:var(--low)">${c}</div><div class="rp-stat-lbl">Completed</div></div>
            <div class="rp-stat"><div class="rp-stat-num" style="color:var(--medium)">${u}</div><div class="rp-stat-lbl">High Priority</div></div>
        </div>
        <div>
            <div class="rp-section-title">Completion Rate</div>
            <div style="background:var(--bg3);border-radius:8px;height:10px;overflow:hidden;border:1px solid var(--border);">
                <div style="height:100%;width:${rate}%;background:var(--low);border-radius:8px;transition:width .6s;"></div>
            </div>
            <div style="text-align:right;font-size:.72rem;color:var(--text-muted);margin-top:4px;">${rate}% done</div>
        </div>
        <div>
            <div class="rp-section-title">By Category</div>
            ${['work','personal','study','health','other'].map(cat => {
                const n = tasks.filter(t => t.category === cat).length;
                const pct = tasks.length ? Math.round(n/tasks.length*100) : 0;
                if (!n) return '';
                return `<div style="margin-bottom:.5rem;">
                    <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:3px;"><span style="color:var(--text);font-weight:600;">${cat}</span><span style="color:var(--text-muted)">${n}</span></div>
                    <div style="background:var(--bg3);border-radius:4px;height:6px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:4px;transition:width .5s;"></div>
                    </div></div>`;
            }).join('')}
        </div>`;
    }

    else if (tab === 'upcoming') {
        const upcoming = tasks
            .filter(t => t.status !== 'completed')
            .sort((a,b) => new Date(a.date) - new Date(b.date))
            .slice(0, 10);
        body.innerHTML = `<div class="rp-section-title">Next ${upcoming.length} tasks</div>` +
        (upcoming.length ? upcoming.map(t => `
        <div class="rp-task-mini ${t.status === 'overdue' ? 'overdue' : t.priority}">
            <div style="flex:1;">
                <div class="rp-task-name">${t.title}</div>
                <div class="rp-task-time">${dayjs().to(dayjs(t.date))} &bull; ${t.category}</div>
            </div>
            <span style="font-size:.68rem;font-weight:700;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,.1);color:var(--text-muted)">${t.priority}</span>
        </div>`).join('') : '<div style="color:var(--text-muted);font-size:.85rem;padding:.5rem 0">All tasks completed!</div>');
    }

    else if (tab === 'dsa') {
        body.innerHTML = `
        <div class="dsa-cheat-card">
            <h4>Priority Queue (Max-Heap)</h4>
            <table><tr><td>Insert</td><td>O(log n)</td></tr><tr><td>Extract Max</td><td>O(log n)</td></tr><tr><td>Peek</td><td>O(1)</td></tr><tr><td>Build Heap</td><td>O(n)</td></tr></table>
        </div>
        <div class="dsa-cheat-card">
            <h4>Linked List</h4>
            <table><tr><td>Insert Head</td><td>O(1)</td></tr><tr><td>Delete Head</td><td>O(1)</td></tr><tr><td>Search</td><td>O(n)</td></tr><tr><td>Access [i]</td><td>O(n)</td></tr></table>
        </div>
        <div class="dsa-cheat-card">
            <h4>Stack (Undo)</h4>
            <table><tr><td>Push</td><td>O(1)</td></tr><tr><td>Pop</td><td>O(1)</td></tr><tr><td>Peek</td><td>O(1)</td></tr></table>
        </div>
        <div class="dsa-cheat-card">
            <h4>Binary Search</h4>
            <table><tr><td>Search</td><td>O(log n)</td></tr><tr><td>Requires</td><td>Sorted array</td></tr></table>
        </div>
        <div class="dsa-cheat-card">
            <h4>Sorting</h4>
            <table><tr><td>Bubble Sort</td><td>O(n²)</td></tr><tr><td>Selection</td><td>O(n²)</td></tr><tr><td>Merge Sort</td><td>O(n log n)</td></tr></table>
        </div>`;
    }

    else if (tab === 'export') {
        body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem;">
            <div class="rp-section-title" style="font-size:.95rem;font-weight:800;letter-spacing:.06em;color:var(--accent);">&#128229; EXPORT TASKS</div>

            <div style="display:flex;flex-direction:column;gap:.6rem;">
                <label style="font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Filter by Status</label>
                <select id="rpExpStatus" onchange="rpRefreshPreview()" style="background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;font-size:.82rem;width:100%;">
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            <div style="display:flex;flex-direction:column;gap:.6rem;">
                <label style="font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Filter by Priority</label>
                <select id="rpExpPriority" onchange="rpRefreshPreview()" style="background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;font-size:.82rem;width:100%;">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            <div style="display:flex;flex-direction:column;gap:.6rem;">
                <label style="font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Filter by Category</label>
                <select id="rpExpCat" onchange="rpRefreshPreview()" style="background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;font-size:.82rem;width:100%;">
                    <option value="all">All Categories</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div id="rpExpCount" style="font-size:.8rem;color:var(--text-muted);font-weight:600;">0 tasks selected</div>

            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:1rem;">
                <div style="font-size:.68rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.6rem;">PREVIEW</div>
                <pre id="rpExpPreview" style="font-size:.72rem;color:var(--text);white-space:pre-wrap;word-break:break-word;line-height:1.6;max-height:240px;overflow-y:auto;font-family:'Courier New',monospace;margin:0;"></pre>
            </div>

            <button onclick="rpDownloadTXT()" style="background:var(--accent);color:#fff;border:none;border-radius:10px;padding:.75rem 1rem;font-size:.85rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem;transition:opacity .2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
                &#8659; Download as Plain Text (.txt)
            </button>
        </div>`;
        rpRefreshPreview();
    }
}

// ===== RIGHT PANEL EXPORT HELPERS =====
window.rpRefreshPreview = function() {
    const s = document.getElementById('rpExpStatus')?.value || 'all';
    const p = document.getElementById('rpExpPriority')?.value || 'all';
    const c = document.getElementById('rpExpCat')?.value || 'all';
    const ft = tasks.filter(t =>
        (s === 'all' || t.status === s) &&
        (p === 'all' || t.priority === p) &&
        (c === 'all' || t.category === c)
    );
    const countEl = document.getElementById('rpExpCount');
    if (countEl) countEl.textContent = `${ft.length} task${ft.length !== 1 ? 's' : ''} selected`;
    const preview = document.getElementById('rpExpPreview');
    if (!preview) return;
    if (!ft.length) { preview.textContent = '(no tasks match the selected filters)'; return; }
    const lines = ft.map((t, i) =>
        `${i+1}. [${t.status.toUpperCase()}] ${t.title}\n   Priority: ${t.priority} | Category: ${t.category} | Due: ${new Date(t.date).toLocaleString('en-IN')}`
    ).join('\n\n');
    preview.textContent = lines;
};

window.rpDownloadTXT = function() {
    const s = document.getElementById('rpExpStatus')?.value || 'all';
    const p = document.getElementById('rpExpPriority')?.value || 'all';
    const c = document.getElementById('rpExpCat')?.value || 'all';
    const ft = tasks.filter(t =>
        (s === 'all' || t.status === s) &&
        (p === 'all' || t.priority === p) &&
        (c === 'all' || t.category === c)
    );
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
    const bar  = '\u2550'.repeat(60);
    const thin = '\u2500'.repeat(60);
    const lines = [
        bar,
        '       T A S K S Y N C   \u2014   T A S K   E X P O R T',
        bar,
        '',
        `  Generated  :  ${now}`,
        `  Tasks      :  ${ft.length} selected`,
        `  Filters    :  Status: ${s} | Priority: ${p} | Category: ${c}`,
        '',
        bar,
        ''
    ];
    ft.forEach((t, i) => {
        const subs = (t.subtasks||[]);
        const subsDone = subs.filter(s=>s.done).length;
        lines.push(
            `  ${i+1}. ${t.title}`,
            thin,
            `     \u25BA Status   :  ${t.status.toUpperCase()}`,
            `     \u25BA Priority :  ${t.priority.toUpperCase()}`,
            `     \u25BA Category :  ${t.category}`,
            `     \u25BA Due Date :  ${new Date(t.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`,
            t.desc ? `     \u25BA Notes    :  ${t.desc}` : '',
            subs.length ? `     \u25BA Subtasks :  ${subsDone}/${subs.length} done` : '',
            subs.length ? subs.map(st => `         ${st.done ? '[\u2713]' : '[ ]'} ${st.text}`).join('\n') : '',
            ''
        );
    });
    lines.push(bar, '  END OF EXPORT', bar);
    const content = lines.filter(l => l !== undefined).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tasksync-export-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    Swal.fire({ icon:'success', title:'Downloaded!', text: a.download, toast:true, position:'top-end', showConfirmButton:false, timer:2500 });
};

document.addEventListener('DOMContentLoaded', () => {
    initRightPanel();
});

// ===== EXPORT FUNCTIONS =====
function generateTXT() {
    const lines = [
        'TaskSync — Task Export',
        '=' .repeat(50),
        `Exported: ${new Date().toLocaleString('en-IN')}`,
        `Total Tasks: ${tasks.length}`,
        '=' .repeat(50), ''
    ];
    tasks.forEach((t, i) => {
        const subs = (t.subtasks||[]).map(s => `   [${s.done?'x':' '}] ${s.text}`).join('\n');
        lines.push(
            `${i+1}. ${t.title}`,
            `   Status   : ${t.status.toUpperCase()}`,
            `   Priority : ${t.priority}`,
            `   Category : ${t.category}`,
            `   Due      : ${new Date(t.date).toLocaleString('en-IN')}`,
            t.desc ? `   Notes    : ${t.desc}` : '',
            subs ? `   Subtasks :\n${subs}` : '',
            ''
        );
    });
    return lines.filter(l => l !== '').join('\n');
}

function generateCSV() {
    const headers = ['ID','Title','Status','Priority','Category','Due Date','Description','Subtasks Done','Subtasks Total'];
    const rows = tasks.map(t => {
        const subs = t.subtasks||[];
        return [
            t.id,
            `"${t.title.replace(/"/g,'""')}"`,
            t.status,
            t.priority,
            t.category,
            new Date(t.date).toLocaleString('en-IN'),
            `"${(t.desc||'').replace(/"/g,'""')}"`,
            subs.filter(s=>s.done).length,
            subs.length
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

function generateJSON() {
    return JSON.stringify(tasks, null, 2);
}

function generateReport() {
    const total = tasks.length;
    const done = tasks.filter(t=>t.status==='completed').length;
    const over = tasks.filter(t=>t.status==='overdue').length;
    const pend = tasks.filter(t=>t.status==='pending').length;
    const rate = total ? Math.round(done/total*100) : 0;
    const cats = ['work','personal','study','health','other'];
    const sep = '='.repeat(60);
    const lines = [
        sep,
        '         TASKSYNC — TASK SUMMARY REPORT',
        sep,
        `  Generated : ${new Date().toLocaleString('en-IN')}`,
        `  Total Tasks: ${total}`,
        sep,
        '',
        '  STATUS BREAKDOWN',
        `  Completed  : ${done}   (${rate}% completion rate)`,
        `  Pending    : ${pend}`,
        `  Overdue    : ${over}`,
        '',
        '  PRIORITY BREAKDOWN',
        `  High   : ${tasks.filter(t=>t.priority==='high').length}`,
        `  Medium : ${tasks.filter(t=>t.priority==='medium').length}`,
        `  Low    : ${tasks.filter(t=>t.priority==='low').length}`,
        '',
        '  CATEGORY BREAKDOWN',
        ...cats.map(c => `  ${c.padEnd(10)}: ${tasks.filter(t=>t.category===c).length}`),
        '',
        sep,
        '  OVERDUE TASKS',
        sep,
        ...tasks.filter(t=>t.status==='overdue').map(t=>`  - ${t.title} (due: ${new Date(t.date).toLocaleDateString('en-IN')})`),
        '',
        sep,
        '  UPCOMING (next 5)',
        sep,
        ...tasks.filter(t=>t.status==='pending').sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5)
              .map(t=>`  - ${t.title} — ${new Date(t.date).toLocaleString('en-IN')}`),
        '',
        sep,
    ];
    return lines.join('\n');
}

function getContent(type) {
    if (type==='txt')    return generateTXT();
    if (type==='csv')    return generateCSV();
    if (type==='json')   return generateJSON();
    if (type==='report') return generateReport();
    return '';
}

window.exportFile = function(type) {
    const content = getContent(type);
    const exts = { txt:'txt', csv:'csv', json:'json', report:'txt' };
    const names = { txt:'tasksync-tasks', csv:'tasksync-tasks', json:'tasksync-backup', report:'tasksync-report' };
    const mime = type==='json' ? 'application/json' : type==='csv' ? 'text/csv' : 'text/plain';
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${names[type]}-${new Date().toISOString().slice(0,10)}.${exts[type]}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    Swal.fire({ icon:'success', title:'Downloaded!', toast:true, position:'top-end', showConfirmButton:false, timer:2000 });
};

window.copyToClipboard = function(type) {
    navigator.clipboard.writeText(getContent(type)).then(()=>{
        Swal.fire({ icon:'success', title:'Copied to clipboard!', toast:true, position:'top-end', showConfirmButton:false, timer:1800 });
    });
};

function updateExportPreview() {
    const preview = document.getElementById('exportPreview');
    const count = document.getElementById('exportTaskCount');
    if (!preview) return;
    const txt = generateTXT();
    preview.textContent = txt.slice(0, 600) + (txt.length > 600 ? '\n...' : '');
    if (count) count.textContent = `${tasks.length} tasks`;
}

// ===== IMPORT =====
window.importTasks = function() {
    const input = document.getElementById('importFileInput');
    const status = document.getElementById('importStatus');
    if (!input.files.length) { if(status) status.textContent = 'No file selected.'; return; }
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('Invalid format');
            const existingIds = new Set(tasks.map(t=>t.id));
            const newTasks = imported.filter(t=>!existingIds.has(t.id));
            tasks.push(...newTasks);
            saveTasks(); computeStatuses(); renderAll(); updateExportPreview();
            Swal.fire({ icon:'success', title:`Imported ${newTasks.length} new tasks!`, toast:true, position:'top-end', showConfirmButton:false, timer:2500 });
            if(status) status.textContent = `Imported ${newTasks.length} new tasks.`;
            input.value = '';
        } catch(err) {
            Swal.fire({ icon:'error', title:'Invalid JSON file', text:'Make sure you select a TaskSync JSON export.', timer:3000 });
        }
    };
    reader.readAsText(input.files[0]);
};

// Refresh export preview when nav to export tab
document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.target === 'export-view') setTimeout(updateExportPreview, 80);
        });
    });
});

// ===== FILTERED EXPORT HELPERS =====
function getFilteredTasks() {
    const s = document.getElementById('expFilterStatus')?.value || 'all';
    const p = document.getElementById('expFilterPriority')?.value || 'all';
    const c = document.getElementById('expFilterCat')?.value || 'all';
    return tasks.filter(t =>
        (s === 'all' || t.status === s) &&
        (p === 'all' || t.priority === p) &&
        (c === 'all' || t.category === c)
    );
}

window.refreshExportPreview = function() {
    const ft = getFilteredTasks();
    const preview = document.getElementById('exportPreview');
    const count = document.getElementById('exportTaskCount');
    if (count) count.textContent = ft.length;
    if (!preview) return;
    if (!ft.length) { preview.textContent = '(no tasks match the selected filters)'; return; }
    const lines = ft.map((t, i) =>
        `${i+1}. [${t.status.toUpperCase()}] ${t.title}\n   Priority: ${t.priority} | Category: ${t.category} | Due: ${new Date(t.date).toLocaleString('en-IN')}`
    ).join('\n\n');
    preview.textContent = lines.slice(0, 800) + (lines.length > 800 ? '\n...' : '');
};

// ===== MARKDOWN GENERATOR =====
function generateMD(ft) {
    const lines = [
        '# TaskSync — Task Export',
        `> Exported: ${new Date().toLocaleString('en-IN')} | Total: ${ft.length} tasks`,
        '',
        '---',
        ''
    ];
    const byStatus = ['pending','overdue','completed'];
    byStatus.forEach(s => {
        const group = ft.filter(t => t.status === s);
        if (!group.length) return;
        lines.push(`## ${s.charAt(0).toUpperCase()+s.slice(1)} Tasks (${group.length})`,'');
        group.forEach(t => {
            const subs = (t.subtasks||[]);
            lines.push(`### ${t.status==='completed'?'~~':''}${t.title}${t.status==='completed'?'~~':''}`);
            lines.push(`- **Priority:** ${t.priority} | **Category:** ${t.category}`);
            lines.push(`- **Due:** ${new Date(t.date).toLocaleString('en-IN')}`);
            if (t.desc) lines.push(`- **Notes:** ${t.desc}`);
            if (subs.length) {
                lines.push('- **Subtasks:**');
                subs.forEach(s => lines.push(`  - [${s.done?'x':' '}] ${s.text}`));
            }
            lines.push('');
        });
    });
    return lines.join('\n');
}

// ===== HTML GENERATOR =====
window.getHTMLContent = function() {
    const ft = getFilteredTasks();
    const rows = ft.map(t => `
        <tr style="background:${t.status==='overdue'?'#fff0f0':t.status==='completed'?'#f0fff4':''}">
            <td>${t.title}${t.status==='completed'?' <em>(done)</em>':''}</td>
            <td><span style="padding:2px 8px;border-radius:10px;background:${t.priority==='high'?'#ff5f6d':t.priority==='medium'?'#f8c23a':'#2dd4a0'};color:#fff;font-size:.75rem">${t.priority}</span></td>
            <td>${t.category}</td>
            <td>${new Date(t.date).toLocaleString('en-IN')}</td>
            <td>${t.status}</td>
            <td>${t.desc||''}</td>
        </tr>`).join('');
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>TaskSync Export</title>
<style>
body{font-family:Inter,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#222}
h1{color:#1a1d2e;border-bottom:3px solid #4f8ef7;padding-bottom:.5rem}
p{color:#666;margin:.3rem 0 1.2rem}
table{width:100%;border-collapse:collapse;font-size:.88rem}
th{background:#1a1d2e;color:#fff;padding:10px 12px;text-align:left}
td{padding:9px 12px;border-bottom:1px solid #eee}
tr:hover td{background:#f8f9ff}
.stat{display:inline-block;background:#f0f4ff;border-radius:8px;padding:.6rem 1.2rem;margin:.3rem;text-align:center}
.stat-num{font-size:1.8rem;font-weight:800;color:#4f8ef7}
.stat-lbl{font-size:.75rem;color:#666}
</style></head><body>
<h1>&#128229; TaskSync Task Report</h1>
<p>Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; Total: ${ft.length} tasks exported</p>
<div>
<div class="stat"><div class="stat-num">${ft.filter(t=>t.status==='pending').length}</div><div class="stat-lbl">Pending</div></div>
<div class="stat"><div class="stat-num">${ft.filter(t=>t.status==='completed').length}</div><div class="stat-lbl">Completed</div></div>
<div class="stat"><div class="stat-num">${ft.filter(t=>t.status==='overdue').length}</div><div class="stat-lbl">Overdue</div></div>
<div class="stat"><div class="stat-num">${ft.filter(t=>t.priority==='high').length}</div><div class="stat-lbl">High Priority</div></div>
</div>
<br>
<table><thead><tr><th>Title</th><th>Priority</th><th>Category</th><th>Due Date</th><th>Status</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;
};

// ===== ICS GENERATOR =====
function generateICS(ft) {
    const fmt = d => {
        const dt = new Date(d);
        return dt.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    };
    const uid = () => Math.random().toString(36).slice(2) + '@tasksync';
    const events = ft.map(t => [
        'BEGIN:VEVENT',
        `UID:${uid()}`,
        `DTSTAMP:${fmt(Date.now())}`,
        `DTSTART:${fmt(t.date)}`,
        `DTEND:${fmt(new Date(new Date(t.date).getTime()+3600000))}`,
        `SUMMARY:${t.title}`,
        `DESCRIPTION:Priority: ${t.priority}\\nCategory: ${t.category}${t.desc?'\\n'+t.desc:''}`,
        `STATUS:${t.status==='completed'?'COMPLETED':'NEEDS-ACTION'}`,
        'END:VEVENT'
    ].join('\r\n')).join('\r\n');
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TaskSync//EN','CALSCALE:GREGORIAN',events,'END:VCALENDAR'].join('\r\n');
}

// ===== OVERRIDE getContent TO USE FILTERS + NEW FORMATS =====
window.getContent = function(type) {
    const ft = getFilteredTasks();
    if (type==='txt')    return generateTXT(ft);
    if (type==='csv')    return generateCSV(ft);
    if (type==='json')   return JSON.stringify(ft, null, 2);
    if (type==='md')     return generateMD(ft);
    if (type==='html')   return getHTMLContent();
    if (type==='ics')    return generateICS(ft);
    if (type==='report') return generateReport(ft);
    return '';
};

// Update generateTXT + generateCSV + generateReport to accept filtered list
const _origTXT = generateTXT, _origCSV = generateCSV, _origReport = generateReport;
window.generateTXT = function(ft) {
    ft = ft || tasks;
    const lines = [
        'TaskSync - Task Export',
        '='.repeat(50),
        'Exported : ' + new Date().toLocaleString('en-IN'),
        'Tasks    : ' + ft.length,
        '='.repeat(50), ''
    ];
    ft.forEach((t, i) => {
        const subs = (t.subtasks||[]).map(s => '   [' + (s.done?'x':' ') + '] ' + s.text).join('\n');
        lines.push(
            (i+1) + '. ' + t.title,
            '   Status   : ' + t.status.toUpperCase(),
            '   Priority : ' + t.priority,
            '   Category : ' + t.category,
            '   Due      : ' + new Date(t.date).toLocaleString('en-IN'),
            t.desc ? '   Notes    : ' + t.desc : '',
            subs ? '   Subtasks :\n' + subs : '',
            ''
        );
    });
    return lines.filter(l => l !== undefined && l !== '').join('\n');
};
window.generateCSV = function(ft) {
    ft = ft || tasks;
    const headers = ['ID','Title','Status','Priority','Category','Due Date','Description','Subtasks Done','Subtasks Total'];
    const rows = ft.map(t => {
        const subs = t.subtasks||[];
        return [t.id, '"'+t.title.replace(/"/g,'""')+'"', t.status, t.priority, t.category,
            new Date(t.date).toLocaleString('en-IN'), '"'+(t.desc||'').replace(/"/g,'""')+'"',
            subs.filter(s=>s.done).length, subs.length].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
};
window.generateReport = function(ft) {
    ft = ft || tasks;
    const done=ft.filter(t=>t.status==='completed').length, over=ft.filter(t=>t.status==='overdue').length;
    const pend=ft.filter(t=>t.status==='pending').length, rate=ft.length?Math.round(done/ft.length*100):0;
    const sep='='.repeat(60);
    return [sep,'         TASKSYNC - TASK SUMMARY REPORT',sep,
        '  Generated : '+new Date().toLocaleString('en-IN'),
        '  Total Tasks: '+ft.length, sep,'',
        '  STATUS BREAKDOWN',
        '  Completed  : '+done+' ('+rate+'% completion rate)',
        '  Pending    : '+pend,'  Overdue    : '+over,'',
        '  PRIORITY','  High: '+ft.filter(t=>t.priority==='high').length,
        '  Medium: '+ft.filter(t=>t.priority==='medium').length,
        '  Low: '+ft.filter(t=>t.priority==='low').length,'',
        '  BY CATEGORY',
        ...['work','personal','study','health','other'].map(c=>'  '+c.padEnd(10)+': '+ft.filter(t=>t.category===c).length),
        '',sep,'  OVERDUE TASKS',sep,
        ...ft.filter(t=>t.status==='overdue').map(t=>'  - '+t.title+' ('+new Date(t.date).toLocaleDateString('en-IN')+')'),
        '',sep,'  UPCOMING (next 5)',sep,
        ...ft.filter(t=>t.status==='pending').sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5)
            .map(t=>'  - '+t.title+' - '+new Date(t.date).toLocaleString('en-IN')),
        '',sep
    ].join('\n');
};

// ===== OVERRIDE exportFile =====
window.exportFile = function(type) {
    const content = window.getContent(type);
    const exts = { txt:'txt', csv:'csv', json:'json', md:'md', html:'html', ics:'ics', report:'txt' };
    const names = { txt:'tasks', csv:'tasks', json:'backup', md:'tasks', html:'report', ics:'calendar', report:'summary' };
    const mimes = { csv:'text/csv', json:'application/json', html:'text/html', ics:'text/calendar' };
    const mime = mimes[type] || 'text/plain';
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tasksync-' + (names[type]||type) + '-' + new Date().toISOString().slice(0,10) + '.' + (exts[type]||'txt');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    Swal.fire({ icon:'success', title:'Downloaded!', text: a.download, toast:true, position:'top-end', showConfirmButton:false, timer:2500 });
};

// ===== PRINT =====
window.printTasks = function() {
    const w = window.open('', '_blank');
    w.document.write(getHTMLContent());
    w.document.close();
    setTimeout(() => w.print(), 500);
};

// ===== COPY =====
window.copyToClipboard = function(type) {
    navigator.clipboard.writeText(window.getContent(type)).then(() => {
        Swal.fire({ icon:'success', title:'Copied!', toast:true, position:'top-end', showConfirmButton:false, timer:1800 });
    });
};

// (export filters handled via inline onchange in the right panel)
