// === ... всё, что выше, оставить без изменений ===

// МАЛЕНЬКИЙ ХЕЛПЕР ДЛЯ ЗАПРОСОВ
async function apiPost(url, payload) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // если перейдёшь на cookie-сессии, добавь: credentials: 'include'
        body: JSON.stringify(payload),
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

// Фейковый хранилище токена (пока — localStorage; позже лучше cookie HttpOnly)
function saveToken(token) {
    if (token) localStorage.setItem('auth_token', token);
}
function clearToken() { localStorage.removeItem('auth_token'); }

// === ФОРМЫ АВТОРИЗАЦИИ С ФЕТЧЕМ К БЭКУ ===
formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const submitBtn = formLogin.querySelector('button[type="submit"]');
    submitBtn.disabled = true; submitBtn.textContent = 'Входим…';
    try {
        const data = Object.fromEntries(new FormData(formLogin).entries());
        if (!data.email || !data.password) throw new Error('Заполните e-mail и пароль.');
        // ОТПРАВКА НА БЭК
        const resp = await apiPost('/api/auth/login', {
            email: String(data.email).trim(),
            password: String(data.password),
        });
        // ожидаем { token, user: { id, name, email } }
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
        // ОТПРАВКА НА БЭК
        const resp = await apiPost('/api/auth/signup', {
            name: String(data.name).trim(),
            email: String(data.email).trim(),
            password: String(data.password),
        });
        // ожидаем { token, user: { id, name, email } } или { ok: true }
        if (resp.token) saveToken(resp.token);
        msg.textContent = '✅ Аккаунт создан';
        setTimeout(() => setTab('login'), 800);
    } catch (err) {
        msg.textContent = `❌ ${err.message || 'Ошибка регистрации'}`;
    } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Создать аккаунт';
    }
});