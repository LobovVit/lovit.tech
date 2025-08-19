// ===== ТЕМА
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    localStorage.setItem('theme', mode);
}
applyTheme(savedTheme || (prefersDark.matches ? 'dark' : 'light'));

// слушаем системную смену темы
prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});

themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== ПЛИТКИ + СЕКЦИИ
function revealTiles() {
    document.querySelectorAll('.tile').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 80 * i);
    });
}
function revealSectionsOnScroll() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.section-block').forEach(s => io.observe(s));
}
function bindTilesNavigation() {
    document.querySelectorAll('.tile[data-target]').forEach((tile) => {
        tile.addEventListener('click', () => {
            const id = tile.getAttribute('data-target');
            const el = id ? document.getElementById(id) : null;
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ===== МОДАЛКА
const loginBtn   = document.getElementById('login-btn');
const modal      = document.getElementById('auth-modal');
const modalClose = document.getElementById('auth-close');
const tabs       = document.querySelectorAll('.tab');
const formLogin  = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const msg        = document.getElementById('auth-message');

function openModal() {
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
}
function closeModal() {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    if (msg) msg.textContent = '';
}

// — универсальная установка активной вкладки
function setTab(name) {
    // таб-кнопки
    tabs.forEach((t) => {
        const isActive = (t.dataset.tab === name) || (t.getAttribute('data-tab-switch') === name);
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    // формы
    formLogin?.classList.toggle('active', name === 'login');
    formSignup?.classList.toggle('active', name === 'signup');
}

loginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
    setTab('login');
});
modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// --- совместимо с Safari: вешаем явные обработчики на ВСЕ элементы data-tab-switch ---
document.querySelectorAll('[data-tab-switch]').forEach((el) => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
        const name = el.getAttribute('data-tab-switch') || 'login';
        setTab(name);
    });
});

// На всякий случай добавим и делегирование (если элементы динамически появятся)
document.addEventListener('click', (e) => {
    const raw = e.target;
    const target = raw && raw.nodeType === Node.TEXT_NODE ? raw.parentElement : raw;
    if (!(target instanceof Element)) return;

    const tabSwitch = target.closest('[data-tab-switch]');
    if (tabSwitch) {
        e.preventDefault();
        openModal();
        setTab(tabSwitch.getAttribute('data-tab-switch') || 'login');
    }
});

// ===== API helper (заглушка)
async function apiPost(url, payload) {
    // эмуляция запроса
    await new Promise(r => setTimeout(r, 500));
    return { ok: true, token: 'demo-token' };
}
function saveToken(t){ if(t) localStorage.setItem('auth_token', t); }

formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formLogin.querySelector('button[type="submit"]');
    const status = document.getElementById('auth-message');
    status.textContent = '';
    submitBtn.disabled = true; submitBtn.textContent = 'Входим…';
    try{
        const data = Object.fromEntries(new FormData(formLogin).entries());
        if(!data.email || !data.password) throw new Error('Заполните e-mail и пароль.');
        const resp = await apiPost('/api/auth/login', data);
        saveToken(resp.token);
        status.textContent = '✅ Успешный вход';
        setTimeout(closeModal, 700);
    }catch(err){
        status.textContent = `❌ ${err.message || 'Ошибка авторизации'}`;
    }finally{
        submitBtn.disabled = false; submitBtn.textContent = 'Войти';
    }
});

formSignup?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formSignup.querySelector('button[type="submit"]');
    const status = document.getElementById('auth-message');
    status.textContent = '';
    submitBtn.disabled = true; submitBtn.textContent = 'Создаём…';
    try{
        const data = Object.fromEntries(new FormData(formSignup).entries());
        if(!data.name || !data.email || !data.password) throw new Error('Заполните все поля.');
        if(String(data.password).length < 6) throw new Error('Пароль от 6 символов.');
        const resp = await apiPost('/api/auth/signup', data);
        saveToken(resp.token);
        status.textContent = '✅ Аккаунт создан';
        setTimeout(() => setTab('login'), 800);
    }catch(err){
        status.textContent = `❌ ${err.message || 'Ошибка регистрации'}`;
    }finally{
        submitBtn.disabled = false; submitBtn.textContent = 'Создать аккаунт';
    }
});

// ===== старт
document.addEventListener('DOMContentLoaded', () => {
    revealTiles();
    revealSectionsOnScroll();
    bindTilesNavigation();
    setTab('login'); // по умолчанию показываем вкладку входа
});