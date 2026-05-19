// ===== CLOCK =====

function updateClock() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const el = document.getElementById('digitalTime');
    const de = document.getElementById('digitalDate');
    if (el) el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (de) de.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    drawAnalogClock(now);
}

function drawAnalogClock(now) {
    const canvas = document.getElementById('analogClock');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, r = cx - 4;
    const s = getComputedStyle(document.documentElement);
    const accent = s.getPropertyValue('--accent').trim() || '#4f8ef7';
    const textC  = s.getPropertyValue('--text').trim()   || '#e8ecf4';
    const bg2    = s.getPropertyValue('--bg2').trim()    || '#1a1d27';
    const border = s.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.1)';

    ctx.clearRect(0, 0, W, H);
    // Face
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bg2; ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke();
    // Hour ticks
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6));
        ctx.lineTo(cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12));
        ctx.strokeStyle = border; ctx.lineWidth = i % 3 === 0 ? 2 : 1; ctx.stroke();
    }
    // Hands
    const hA = ((now.getHours() % 12 + now.getMinutes() / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    const mA = ((now.getMinutes() + now.getSeconds() / 60) / 60) * Math.PI * 2 - Math.PI / 2;
    const sA = (now.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
    [[hA, r * 0.5, 3, textC], [mA, r * 0.72, 2, textC], [sA, r * 0.82, 1.5, accent]].forEach(([a, len, w, c]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
    });
    // Center dot
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = accent; ctx.fill();
}
