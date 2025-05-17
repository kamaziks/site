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
    // Перевіряємо, чи користувач адміністратор
    const currentUser = JSON.parse(localStorage.getItem('weatherAppCurrentUser') || '{}');
    if (currentUser.level !== 'admin') return;
    
    // Отримуємо історію пошуків
    let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
    
    // Додаємо новий запис
    searchHistory.push({
        city,
        user: currentUser.name,
        time: new Date().toISOString()
    });
    
    // Обмежуємо історію до 50 останніх пошуків
    if (searchHistory.length > 50) {
        searchHistory = searchHistory.slice(-50);
    }
    
    // Зберігаємо оновлену історію
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
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

// Оригінальні обробники подій
searchButton.addEventListener('click', fetchWeather);

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        fetchWeather();
    }
});

// Додаємо додаткові методи для адмін-панелі

// Функція для показу всіх пошуків (тільки для адміна)
function showAllSearches() {
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    
    // Отримуємо історію пошуків
    const searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
    
    // Очищаємо контейнер
    adminContent.innerHTML = '';
    
    if (searchHistory.length === 0) {
        adminContent.innerHTML = '<p>Немає історії пошуків</p>';
        return;
    }
    
    // Створюємо таблицю пошуків
    const searchTable = document.createElement('table');
    searchTable.className = 'search-history-table';
    
    // Додаємо заголовок таблиці
    searchTable.innerHTML = `
        <tr>
            <th>Користувач</th>
            <th>Місто</th>
            <th>Час</th>
        </tr>
    `;
    
    // Додаємо рядки з пошуками
    searchHistory.forEach(search => {
        const date = new Date(search.time);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${search.user}</td>
            <td>${search.city}</td>
            <td>${formattedDate}</td>
        `;
        
        searchTable.appendChild(row);
    });
    
    // Додавання таблиці до адмін-контенту
    adminContent.appendChild(searchTable);
}

// Додаємо обробник для кнопки статистики
document.addEventListener('DOMContentLoaded', () => {
    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            // Додаємо розділ статистики пошуків для адміна
            const currentUser = JSON.parse(localStorage.getItem('weatherAppCurrentUser') || '{}');
            if (currentUser.level === 'admin') {
                showAllSearches();
            }
        });
    }
});