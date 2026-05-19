// ===== GREETING =====

function updateGreeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good Morning! ☀️' : h < 17 ? 'Good Afternoon! 🌤️' : 'Good Evening! 🌙';
    const el = document.getElementById('greetingText');
    const de = document.getElementById('greetingDate');
    if (el) el.textContent = g;
    if (de) de.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
