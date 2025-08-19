// ---------- ТЕМА / ЛОГО / ПРЕДЗАГРУЗКА ФОНОВ ----------
const themeToggle  = document.getElementById('theme-toggle');
const prefersDark  = window.matchMedia('(prefers-color-scheme: dark)');
const storedTheme  = localStorage.getItem('theme');

// предзагрузка фоновых изображений (убирает задержки на смене темы)
['images/back-light.jpg', 'images/back-dark.jpg'].forEach(src => {
    const img = new Image();
    img.src = src;
});

// небольшой «бамп» для Safari, чтобы он обновлял body::before
let bumpFlip = false;
function bumpBackgroundForSafari() {
    bumpFlip = !bumpFlip;
    document.documentElement.setAttribute('data-bg-bump', bumpFlip ? '1' : '0');
}

function setTheme(mode) {
    const isDark = mode === 'dark';
    const html = document.documentElement;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const logo = document.getElementById('logo');
    if (logo) {
        // меняем src и достраиваем query для обхода агрессивного кеша
        const url = isDark ? 'images/logo-dark.png' : 'images/logo-light.png';
        logo.src = `${url}?v=1`;
    }

    bumpBackgroundForSafari();
}

// начальная тема
setTheme(storedTheme || (prefersDark.matches ? 'dark' : 'light'));

// если пользователь не фиксировал тему — подстраиваемся под системную
prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
});

// ручное переключение темы
themeToggle?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(cur === 'dark' ? 'light' : 'dark');
});

// ---------- ВХОДНАЯ АНИМАЦИЯ КНОПОК В ХЕДЕРЕ ----------
window.addEventListener('load', () => {
    document.querySelectorAll('.header-actions .chip').forEach((chip, i) => {
        setTimeout(() => chip.classList.add('show'), 80 + i * 80);
    });
});

// ---------- КЛИК ПО ПЛИТКАМ: СКРОЛЛ К СЕКЦИЯМ ----------
function bindTilesNavigation() {
    document.querySelectorAll('.tile[data-target]').forEach(tile => {
        tile.addEventListener('click', () => {
            const id = tile.getAttribute('data-target');
            const el = id ? document.getElementById(id) : null;
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ---------- ПОКАЗ СЕКЦИЙ ПРИ ПРОКРУТКЕ ----------
function revealSections() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.section-block').forEach(s => io.observe(s));
}

// ---------- МОДАЛКА АВТОРИЗАЦИИ ----------
const loginBtn   = document.getElementById('login-btn');
const modal      = document.getElementById('auth-modal');
const modalClose = document.getElementById('auth-close');
const tabs       = document.querySelectorAll('.tab');
const formLogin  = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const msg        = document.getElementById('auth-message');

function openModal(){ modal?.classList.add('open');  modal?.setAttribute('aria-hidden','false'); }
function closeModal(){ modal?.classList.remove('open'); modal?.setAttribute('aria-hidden','true'); msg && (msg.textContent=''); }

function setTab(name){
    tabs.forEach(t => {
        const active = t.getAttribute('data-tab') === name;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    formLogin?.classList.toggle('active',  name === 'login');
    formSignup?.classList.toggle('active', name === 'signup');
}

loginBtn?.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); setTab('login'); });
modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

// Явные обработчики для Safari на ссылках с data-tab-switch
document.querySelectorAll('[data-tab-switch]').forEach(el=>{
    el.addEventListener('click', (e)=>{
        e.preventDefault();
        openModal();
        setTab(el.getAttribute('data-tab-switch') || 'login');
    }, { passive:false });
});

// Делегирование (если кнопки/ссылки будут добавляться динамически)
document.addEventListener('click', (e)=>{
    const raw = e.target;
    const target = raw && raw.nodeType === Node.TEXT_NODE ? raw.parentElement : raw;
    if (!(target instanceof Element)) return;
    const t = target.closest('[data-tab-switch]');
    if (t){
        e.preventDefault();
        openModal();
        setTab(t.getAttribute('data-tab-switch') || 'login');
    }
});

// Заглушки форм
async function apiPost(){ await new Promise(r=>setTimeout(r,500)); return {ok:true, token:'demo'}; }
function saveToken(t){ if(t) localStorage.setItem('auth_token', t); }

formLogin?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const btn = formLogin.querySelector('button[type="submit"]'); const status = msg; status.textContent='';
    btn.disabled=true; btn.textContent='Входим…';
    try{
        const data = Object.fromEntries(new FormData(formLogin).entries());
        if(!data.email || !data.password) throw new Error('Заполните e-mail и пароль');
        const resp = await apiPost('/api/auth/login', data); saveToken(resp.token);
        status.textContent='✅ Успешный вход'; setTimeout(closeModal, 700);
    }catch(err){ status.textContent=`❌ ${err.message||'Ошибка авторизации'}`; }
    finally{ btn.disabled=false; btn.textContent='Войти'; }
});

formSignup?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const btn = formSignup.querySelector('button[type="submit"]'); const status = msg; status.textContent='';
    btn.disabled=true; btn.textContent='Создаём…';
    try{
        const data = Object.fromEntries(new FormData(formSignup).entries());
        if(!data.name || !data.email || !data.password) throw new Error('Заполните все поля');
        if(String(data.password).length < 6) throw new Error('Пароль от 6 символов');
        const resp = await apiPost('/api/auth/signup', data); saveToken(resp.token);
        status.textContent='✅ Аккаунт создан'; setTimeout(()=>setTab('login'), 800);
    }catch(err){ status.textContent=`❌ ${err.message||'Ошибка регистрации'}`; }
    finally{ btn.disabled=false; btn.textContent='Создать аккаунт'; }
});

// Старт
document.addEventListener('DOMContentLoaded', ()=>{
    bindTilesNavigation();
    revealSections();
    setTab('login');
});