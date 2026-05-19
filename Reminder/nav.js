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

// ===== SEARCH / FILTER / SORT CONTROLS =====

function setupControls() {
    document.getElementById('searchInput')?.addEventListener('input', renderTasks);
    document.getElementById('filterStatus')?.addEventListener('change', renderTasks);
    document.getElementById('sortSelect')?.addEventListener('change', renderTasks);
}
