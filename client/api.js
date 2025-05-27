const API_URL = 'http://localhost:5000/api';

// Авторизація: реєстрація
async function registerUser(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    return await res.json();
}

// Авторизація: вхід
async function loginUser(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
}

// Отримати дані поточного користувача
async function getCurrentUser(token) {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
}

// Логування пошуку погоди
async function logWeatherSearch(city, token) {
    const res = await fetch(`${API_URL}/weather/log-search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ city })
    });
    return await res.json();
}

// Отримати історію пошуків (для користувача або адміна)
async function getWeatherSearches(token) {
    const res = await fetch(`${API_URL}/weather/searches`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
}

// Отримати статистику пошуків погоди (тільки для адміна)
async function getWeatherStats(token) {
    const res = await fetch(`${API_URL}/weather/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
}

// Експорт функцій
window.api = {
    registerUser,
    loginUser,
    getCurrentUser,
    logWeatherSearch,
    getWeatherSearches,
    getWeatherStats
};