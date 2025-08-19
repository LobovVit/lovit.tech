(function () {
    const html       = document.documentElement;
    const bg         = document.getElementById('bg');
    const logoImg    = document.getElementById('logoImg');
    const themeBtn   = document.getElementById('themeToggle');
    const openAuth   = document.getElementById('openAuth');
    const modal      = document.getElementById('authModal');
    const closeEls   = modal.querySelectorAll('[data-close]');
    const tabs       = modal.querySelectorAll('.tab');
    const panes      = modal.querySelectorAll('.pane');

    /* ---------- ТЕМА ---------- */
    const media   = window.matchMedia('(prefers-color-scheme: dark)');
    const saved   = localStorage.getItem('theme');

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        logoImg.src = theme === 'dark' ? 'images/logo-dark.png' : 'images/logo-light.png';
        // перезапуск анимации фона после смены темы (Safari-friendly)
        bg.style.animation = 'none';
        // следующий кадр
        requestAnimationFrame(() => {
            // ещё один — чтобы точно применилось
            requestAnimationFrame(() => {
                bg.style.animation = '';
            });
        });
    }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
    } else {
        applyTheme(media.matches ? 'dark' : 'light');
    }

    media.addEventListener?.('change', e => {
        if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });

    themeBtn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });

    /* ---------- Переходы к секциям ---------- */
    function goTo(id){ document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}); }
    document.querySelectorAll('[data-goto]').forEach(el => el.addEventListener('click', () => goTo(el.getAttribute('data-goto'))));

    /* ---------- Модалка ---------- */
    openAuth.addEventListener('click', () => modal.classList.add('open'));
    closeEls.forEach(el => el.addEventListener('click', () => modal.classList.remove('open')));
    modal.addEventListener('click', e => { if (e.target === modal.querySelector('.modal__backdrop')) modal.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });

    /* ---------- Вкладки (надёжно в Safari) ---------- */
    function setTab(name){
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
    tabs.forEach(tab => tab.addEventListener('click', e => { e.preventDefault(); setTab(tab.getAttribute('data-tab')); }));
    setTab('login');
})();