(function () {
    const html = document.documentElement;
    const logoImg = document.getElementById('logoImg');
    const themeToggle = document.getElementById('themeToggle');
    const openAuth = document.getElementById('openAuth');
    const modal = document.getElementById('authModal');
    const closeEls = modal.querySelectorAll('[data-close]');
    const tabs = modal.querySelectorAll('.tab');
    const panes = modal.querySelectorAll('.pane');

    // --- Тема
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const saved = localStorage.getItem('theme');

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        // логотип по теме
        logoImg.src = theme === 'dark' ? 'images/logo-dark.png' : 'images/logo-light.png';
    }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
    } else {
        applyTheme(prefersDark.matches ? 'dark' : 'light');
    }

    prefersDark.addEventListener?.('change', (e) => {
        if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });

    themeToggle.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });

    // --- Переход к секциям
    function goTo(id) {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', () => goTo(el.getAttribute('data-goto')));
    });

    // --- Модалка
    openAuth.addEventListener('click', () => modal.classList.add('open'));
    closeEls.forEach(el => el.addEventListener('click', () => modal.classList.remove('open')));
    modal.addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal__backdrop')) modal.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('open');
    });

    // --- Вкладки (надёжно для Safari)
    function setTab(name) {
        tabs.forEach(t => {
            const active = t.getAttribute('data-tab') === name;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', String(active));
        });
        panes.forEach(p => {
            const show = p.id === 'pane-' + name;
            p.classList.toggle('active', show);
            if (show) p.querySelector('input')?.focus();
        });
    }
    tabs.forEach(tab => tab.addEventListener('click', (e) => {
        e.preventDefault();
        const name = tab.getAttribute('data-tab');
        if (name) setTab(name);
    }));
    setTab('login');
})();