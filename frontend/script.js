// theme toggle
const btn = document.getElementById('theme-toggle');
btn.onclick = () => {
    const html = document.body;
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    html.dataset.theme = next;
    localStorage.theme = next;
};
// инициализируем из системы или из хранилища
(() => {
    const saved = localStorage.theme;
    if (saved) {
        document.body.dataset.theme = saved;
    } else {
        const prefersDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    }
})();

// IntersectionObserver для анимации плиток
const tiles = document.querySelectorAll('.tile');
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.1 });
tiles.forEach(t => io.observe(t));

// клик по плитке — подгрузка данных
const content = document.getElementById('content');
tiles.forEach(tile => {
    tile.addEventListener('click', async () => {
        const endpoint = tile.dataset.endpoint;
        content.innerHTML = `<p>Загрузка…</p>`;
        try {
            const res = await fetch(`https://lovit.tech/api${endpoint}`);
            const data = await res.json();
            content.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (err) {
            content.innerHTML = `<p style="color: red">Ошибка загрузки</p>`;
        }
    });
});