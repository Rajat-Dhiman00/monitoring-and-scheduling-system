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
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
            document.getElementById('themeDropdown').classList.remove('open');
        });
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tasksync_theme', theme);
    document.querySelectorAll('.theme-swatch').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    // Redraw clock so it picks up new CSS vars
    setTimeout(() => drawAnalogClock(new Date()), 50);
    if (statusChart) setTimeout(updateCharts, 80);
}
