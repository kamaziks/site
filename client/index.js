// Модифікований оригінальний файл index.js для роботи з реєстрацією

// Ініціалізація змінних погоди
const container = document.querySelector('.container');
const searchButton = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const searchInput = document.querySelector('.search-box input');

// Функція для отримання погоди із сервера OpenWeatherMap
function fetchWeather() {
    const APIKey = '9303ca75581fd3f9d2558f1fb20e9f46';
    const city = searchInput.value;

    if (city === '') return;

    // Логування пошуку (для користувача адмін)
    logSearch(city);

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => {

            if (json.cod === '404') {
                container.style.height = '400px';
                weatherBox.style.display = 'none';
                weatherDetails.style.display = 'none';
                error404.style.display = 'block';
                error404.classList.add('fadeIn');
                return;
            }

            error404.style.display = 'none';
            error404.classList.remove('fadeIn');

            const image = document.querySelector('.weather-box img');
            const temperature = document.querySelector('.weather-box .temperature');
            const description = document.querySelector('.weather-box .description');
            const humidity = document.querySelector('.weather-details .humidity span');
            const wind = document.querySelector('.weather-details .wind span');

            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'images/clear.png';
                    break;

                case 'Rain':
                    image.src = 'images/rain.png';
                    break;

                case 'Snow':
                    image.src = 'images/snow.png';
                    break;

                case 'Clouds':
                    image.src = 'images/cloud.png';
                    break;

                case 'Haze':
                case 'Mist':
                    image.src = 'images/mist.png';
                    break;

                default:
                    image.src = '';
            }

            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;

            weatherBox.style.display = '';
            weatherDetails.style.display = '';
            weatherBox.classList.add('fadeIn');
            weatherDetails.classList.add('fadeIn');
            
            // Динамічно змінюємо висоту контейнера залежно від рівня користувача
            updateContainerHeight();
        });
}


// Функція для логування пошуків (для адміністратора)
function logSearch(city) {
    const token = localStorage.getItem('token');
    if (!token) return;
    window.api.logWeatherSearch(city, token);
}

// Функція для динамічної зміни висоти контейнера залежно від рівня користувача
function updateContainerHeight() {
    const currentUser = JSON.parse(localStorage.getItem('weatherAppCurrentUser') || '{}');
    
    // Базова висота для звичайного користувача
    let height = '590px';
    
    // Додаткова висота для преміум і адмін функцій
    if (currentUser.level === 'premium') {
        height = '800px';
    } else if (currentUser.level === 'admin') {
        height = '1000px';
    }
    
    container.style.height = height;
}

// Оголосіть функцію fetchForecast ОКРЕМО, поза обробником!
async function fetchForecast(city) {
    const APIKey = '9303ca75581fd3f9d2558f1fb20e9f46';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${APIKey}&units=metric&lang=ua`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не вдалося отримати прогноз');
    return await res.json();
}

document.getElementById('forecastBtn').addEventListener('click', async () => {
    const user = JSON.parse(localStorage.getItem('weatherAppCurrentUser'));
        if (!user || (user.level !== 'premium' && user.level !== 'admin')) {
    alert('Доступно лише для преміум користувачів!');
    return;
}
    const city = document.querySelector('.search-box input').value.trim();
    if (!city) {
        alert('Введіть місто!');
        return;
    }
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = 'Завантаження...';
    try {
        const data = await fetchForecast(city);
        // Відобразити прогноз (по 1 на добу)
        let html = '<h4>5-денний прогноз</h4><div class="forecast-list">';
        const days = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            // Вибираємо прогноз на 12:00 кожного дня
            if (!days[date] && item.dt_txt.includes('12:00:00')) {
                days[date] = item;
            }
        });
        Object.values(days).slice(0, 5).forEach(item => {
            html += `
                <div class="forecast-day">
                    <div>${new Date(item.dt_txt).toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="">
                    <div>${Math.round(item.main.temp)}°C</div>
                    <div>${item.weather[0].description}</div>
                </div>
            `;
        });
        html += '</div>';
        forecastContainer.innerHTML = html;
    } catch (e) {
        forecastContainer.innerHTML = 'Не вдалося отримати прогноз';
    }
});

// Оригінальні обробники подій
searchButton.addEventListener('click', fetchWeather);

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        fetchWeather();
    }
});

// Показати всіх користувачів (тільки для адміна)
async function showAllUsers() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = 'Завантаження...';
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) {
        adminContent.innerHTML = data.message || 'Помилка отримання користувачів';
        return;
    }
    let html = `<table class="users-table">
        <tr>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Рівень</th>
            <th>Дії</th>
        </tr>`;
    data.users.forEach(user => {
        html += `<tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.level}</td>
            <td>
                <button class="change-level-btn" data-id="${user._id}" data-level="standard">Стандарт</button>
                <button class="change-level-btn" data-id="${user._id}" data-level="premium">Преміум</button>
                <button class="change-level-btn" data-id="${user._id}" data-level="admin">Адмін</button>
                <button class="delete-user-btn" data-id="${user._id}">Видалити</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    adminContent.innerHTML = html;

    // Зміна рівня
    document.querySelectorAll('.change-level-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.dataset.id;
            const level = this.dataset.level;
            if (!confirm(`Змінити рівень користувача на "${level}"?`)) return;
            const res = await fetch(`http://localhost:5000/api/auth/users/${userId}/level`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ level })
            });
            const data = await res.json();
            if (data.success) {
                alert('Рівень змінено');
                showAllUsers();
            } else {
                alert(data.message || 'Помилка');
            }
        });
    });

    // Видалення користувача
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.dataset.id;
            if (!confirm('Видалити користувача?')) return;
            const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert('Користувача видалено');
                showAllUsers();
            } else {
                alert(data.message || 'Помилка');
            }
        });
    });
}

// Показати статистику пошуків
async function showStats() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = 'Завантаження...';
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/weather/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) {
        adminContent.innerHTML = data.message || 'Помилка отримання статистики';
        return;
    }
    const stats = data.stats;
    let html = `<div class="stats-container">
        <h4>Статистика пошуків</h4>
        <p>Всього пошуків: ${stats.totalSearches}</p>
        <p>Пошуків за тиждень: ${stats.weeklySearches}</p>
        <h5>Топ-5 міст:</h5>
        <ul>`;
    stats.popularCities.forEach(city => {
        html += `<li>${city._id}: ${city.count} разів</li>`;
    });
    html += '</ul></div>';
    adminContent.innerHTML = html;
}

// Додаємо обробник для кнопки статистики
document.addEventListener('DOMContentLoaded', () => {
    // Вихід з акаунту
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('weatherAppCurrentUser');
            document.getElementById('authContainer').style.display = 'flex';
            document.getElementById('weatherContainer').style.display = 'none';
        });
    }


    const alertsBtn = document.getElementById('alertsBtn');
    if (alertsBtn) {
        alertsBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('weatherAppCurrentUser') || '{}');
            if (user.level === 'premium' || user.level === 'admin') {
                alert('Update API for using this!');
            } else {
                alert('Сповіщення доступні лише для преміум користувачів!');
            }
        });
    }

    // Відкрити модальне вікно покращення акаунту
    const upgradeBtn = document.getElementById('upgradeBtn');
    const upgradeModal = document.getElementById('upgradeModal');
    const closeModal = document.querySelector('.close-modal');
    if (upgradeBtn && upgradeModal) {
        upgradeBtn.addEventListener('click', () => {
            upgradeModal.style.display = 'block';
        });
    }
    if (closeModal && upgradeModal) {
        closeModal.addEventListener('click', () => {
            upgradeModal.style.display = 'none';
        });
    }
    window.onclick = function(event) {
        if (event.target === upgradeModal) {
            upgradeModal.style.display = 'none';
        }
    };

    // Кнопка "Вибрати" для преміум
    document.querySelectorAll('.upgrade-option-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const token = localStorage.getItem('token');
            if (!token) return alert('Авторизуйтесь!');
            const res = await fetch('http://localhost:5000/api/auth/upgrade', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                // Оновити localStorage і інтерфейс без reload
                localStorage.setItem('weatherAppCurrentUser', JSON.stringify(data.user));
                document.getElementById('userLevel').textContent = 'Преміум';
                document.getElementById('upgradeModal').style.display = 'none';
                document.getElementById('premiumFeatures').style.display = 'block';
                alert('Ваш акаунт оновлено до преміум!');
            } else {
                alert(data.message || 'Помилка оновлення акаунту');
            }
        });
    });

    // Обробник для кнопки статистики
    const usersBtn = document.getElementById('usersBtn');
    if (usersBtn) {
        usersBtn.addEventListener('click', showAllUsers);
    }

    // Обробник для кнопки "Статистика"
    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) {
        statsBtn.addEventListener('click', showStats);
    }
});