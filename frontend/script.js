// ===== ТЕМА (как было)
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    localStorage.setItem('theme', mode);
}
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== ПОКАЗ ПЛИТОК И СЕКЦИЙ
function revealTiles() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 80 * i);
    });
}
function revealSectionsOnScroll() {
    const sections = document.querySelectorAll('.section-block');
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        },
        { threshold: 0.15 }
    );
    sections.forEach((s) => io.observe(s));
}

// Плавный скролл к секциям по клику на плитки
function bindTilesNavigation() {
    document.querySelectorAll('.tile[data-target]').forEach((tile) => {
        tile.addEventListener('click', () => {
            const id = tile.getAttribute('data-target');
            const el = id ? document.getElementById(id) : null;
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ====== МОДАЛКА ЛОГИН/СИГНАП ======
const loginBtn = document.getElementById('login-btn');
const modal = document.getElementById('auth-modal');
const modalClose = document.getElementById('auth-close');
const tabs = document.querySelectorAll('.tab');
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const msg = document.getElementById('auth-message');

function openModal() { modal?.classList.add('open'); }
function closeModal() { modal?.classList.remove('open'); msg && (msg.textContent = ''); }
function setTab(name) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    formLogin?.classList.toggle('active', name === 'login');
    formSignup?.classList.toggle('active', name === 'signup');
}
loginBtn?.addEventListener('click', openModal);
modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
tabs.forEach((t) => {
    t.addEventListener('click', () => setTab(t.dataset.tab));
});
setTab('login'); // вкладка по умолчанию

// ===== МАЛЕНЬКИЙ ХЕЛПЕР ДЛЯ ЗАПРОСОВ
async function apiPost(url, payload) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // если перейдёшь на cookie-сессии: credentials: 'include',
    });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
    if (!res.ok) {
        const msg = data?.error || data?.message || `HTTP ${res.status}`;
        const e = new Error(msg); e.status = res.status; e.data = data; throw e;
    }
    return data;
}
function saveToken(token) { if (token) localStorage.setItem('auth_token', token); }
function clearToken() { localStorage.removeItem('auth_token'); }

// ===== ФОРМЫ АВТОРИЗАЦИИ/РЕГИСТРАЦИИ
formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const submitBtn = formLogin.querySelector('button[type="submit"]');
    submitBtn.disabled = true; submitBtn.textContent = 'Входим…';
    try {
        const data = Object.fromEntries(new FormData(formLogin).entries());
        if (!data.email || !data.password) throw new Error('Заполните e-mail и пароль.');
        const resp = await apiPost('/api/auth/login', {
            email: String(data.email).trim(),
            password: String(data.password),
        });
        saveToken(resp.token);
        msg.textContent = '✅ Успешный вход';
        setTimeout(closeModal, 700);
    } catch (err) {
        msg.textContent = `❌ ${err.message || 'Ошибка авторизации'}`;
    } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Войти';
    }
});

formSignup?.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const submitBtn = formSignup.querySelector('button[type="submit"]');
    submitBtn.disabled = true; submitBtn.textContent = 'Создаём…';
    try {
        const data = Object.fromEntries(new FormData(formSignup).entries());
        if (!data.name || !data.email || !data.password) throw new Error('Заполните все поля.');
        if (String(data.password).length < 6) throw new Error('Пароль от 6 символов.');
        const resp = await apiPost('/api/auth/signup', {
            name: String(data.name).trim(),
            email: String(data.email).trim(),
            password: String(data.password),
        });
        if (resp.token) saveToken(resp.token);
        msg.textContent = '✅ Аккаунт создан';
        setTimeout(() => setTab('login'), 800);
    } catch (err) {
        msg.textContent = `❌ ${err.message || 'Ошибка регистрации'}`;
    } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Создать аккаунт';
    }
});

// ===== СТАРТ
document.addEventListener('DOMContentLoaded', () => {
    revealTiles();
    revealSectionsOnScroll();
    bindTilesNavigation();
});