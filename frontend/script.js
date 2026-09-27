// script.js
(function () {
    const html     = document.documentElement;
    const bg       = document.getElementById('bg');
    const logoImg  = document.getElementById('logoImg');
    const themeBtn = document.getElementById('themeToggle');

    const openAuth = document.getElementById('openAuth');
    const modal    = document.getElementById('authModal');

    const closeEls = modal.querySelectorAll('[data-close]');

    /* ---------- Фавиконки по теме ---------- */
    function getOrCreateLink(rel, sizes) {
        let link = document.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}`);
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            if (sizes) link.sizes = sizes;
            document.head.appendChild(link);
        }
        return link;
    }

    function setFavicon(theme) {
        const icon32 = 'icons/favicon-light-32.png';
        const apple180 = 'icons/favicon-light-180.png';

        const iconLink   = getOrCreateLink('icon', '32x32');
        iconLink.type    = 'image/png';
        iconLink.href    = icon32;

        const appleLink  = getOrCreateLink('apple-touch-icon', '180x180');
        appleLink.href   = apple180;

        // Для старых браузеров оставим generic <link rel="icon"> без sizes
        const genericIcon = document.querySelector('link[rel="icon"]:not([sizes])') || (() => {
            const l = document.createElement('link');
            l.rel = 'icon';
            document.head.appendChild(l);
            return l;
        })();
        genericIcon.type = 'image/png';
        genericIcon.href = icon32;
    }

    /* ---------- Тема ---------- */
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const saved = localStorage.getItem('theme');

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        logoImg.src = theme === 'dark' ? 'images/logo-dark.png' : 'images/logo-light.png';
        setFavicon(theme);

        // Перезапуск анимации фона (важно для Safari)
        if (bg) {
            bg.style.animation = 'none';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bg.style.animation = '';
                });
            });
        }
    }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
    } else {
        applyTheme(media.matches ? 'dark' : 'light');
    }

    media.addEventListener?.('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    themeBtn?.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });

    /* ---------- Навигация к блокам ---------- */
    function goTo(id) {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    document.querySelectorAll('[data-goto]')
        .forEach(el => el.addEventListener('click', () => goTo(el.getAttribute('data-goto'))));

    /* ---------- Модалка ---------- */
    openAuth?.addEventListener('click', () => modal.classList.add('open'));
    closeEls.forEach(el => el.addEventListener('click', () => modal.classList.remove('open')));
    modal.addEventListener('click', e => {
        if (e.target === modal.querySelector('.modal__backdrop')) modal.classList.remove('open');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });

    async function refreshSession() {
        try {
            const response = await fetch('/auth/me', {cache: 'no-store'});
            if (!response.ok) throw new Error('session');
            const {authenticated} = await response.json();
            document.getElementById('signedIn').hidden = !authenticated;
            document.getElementById('signedOut').hidden = authenticated;
            openAuth.querySelector('.pill-label').textContent = authenticated ? 'Аккаунт' : 'Войти';
        } catch { document.getElementById('authStatus').textContent = 'Не удалось проверить вход. Попробуйте ещё раз.'; }
    }
    document.getElementById('logout').addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', {method:'POST'});
            if (!response.ok) throw new Error('logout');
            await refreshSession();
        } catch { document.getElementById('authStatus').textContent = 'Не удалось выйти. Попробуйте ещё раз.'; }
    });
    refreshSession();
})();
