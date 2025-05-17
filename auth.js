// Файл для обробки авторизації та рівнів користувача
class UserAuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.initElements();
        this.initEventListeners();
        this.checkAuthentication();
    }

    initElements() {
        // Авторизація
        this.authContainer = document.getElementById('authContainer');
        this.weatherContainer = document.getElementById('weatherContainer');
        
        // Елементи форм входу та реєстрації
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.authTabs = document.querySelectorAll('.auth-tab');
        
        // Кнопки та поля входу
        this.loginButton = document.getElementById('loginButton');
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.loginMessage = document.getElementById('loginMessage');
        
        // Кнопки та поля реєстрації
        this.registerButton = document.getElementById('registerButton');
        this.registerName = document.getElementById('registerName');
        this.registerEmail = document.getElementById('registerEmail');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
        this.registerMessage = document.getElementById('registerMessage');
        
        // Елементи інформації користувача
        this.userName = document.getElementById('userName');
        this.userLevel = document.getElementById('userLevel');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.upgradeBtn = document.getElementById('upgradeBtn');
        
        // Елементи преміум функцій
        this.premiumFeatures = document.getElementById('premiumFeatures');
        this.forecastBtn = document.getElementById('forecastBtn');
        this.alertsBtn = document.getElementById('alertsBtn');
        this.forecastContainer = document.getElementById('forecastContainer');
        
        // Елементи адмін-панелі
        this.adminPanel = document.getElementById('adminPanel');
        this.usersBtn = document.getElementById('usersBtn');
        this.statsBtn = document.getElementById('statsBtn');
        this.adminContent = document.getElementById('adminContent');
        
        // Модальне вікно покращення акаунту
        this.upgradeModal = document.getElementById('upgradeModal');
        this.closeModal = document.querySelector('.close-modal');
        this.upgradeOptionBtns = document.querySelectorAll('.upgrade-option-btn');
    }

    initEventListeners() {
        // Перемикання між формами входу та реєстрації
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Прибрати активний клас з усіх вкладок
                this.authTabs.forEach(t => t.classList.remove('active'));
                // Додати активний клас до поточної вкладки
                tab.classList.add('active');
                
                // Приховати всі форми
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                
                // Показати відповідну форму
                const tabName = tab.getAttribute('data-tab');
                document.getElementById(`${tabName}Form`).classList.add('active');
            });
        });
        
        // Обробка входу
        this.loginButton.addEventListener('click', () => this.login());
        
        // Обробка реєстрації
        this.registerButton.addEventListener('click', () => this.register());
        
        // Обробка виходу
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Обробка покращення акаунту
        this.upgradeBtn.addEventListener('click', () => {
            this.upgradeModal.style.display = 'block';
        });
        
        // Закриття модального вікна
        this.closeModal.addEventListener('click', () => {
            this.upgradeModal.style.display = 'none';
        });
        
        // Закриття модального вікна при кліку поза ним
        window.addEventListener('click', (e) => {
            if (e.target === this.upgradeModal) {
                this.upgradeModal.style.display = 'none';
            }
        });
        
        // Обробка натискання кнопок покращення
        this.upgradeOptionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = btn.getAttribute('data-level');
                this.upgradeUserLevel(level);
                this.upgradeModal.style.display = 'none';
            });
        });
        
        // Кнопки преміум та адмін функцій
        this.forecastBtn.addEventListener('click', () => this.showForecast());
        this.alertsBtn.addEventListener('click', () => this.showAlerts());
        this.usersBtn.addEventListener('click', () => this.showUsers());
        this.statsBtn.addEventListener('click', () => this.showStats());
    }

    // Завантаження списку користувачів з localStorage
    loadUsers() {
        const users = localStorage.getItem('weatherAppUsers');
        return users ? JSON.parse(users) : [
            // Додаємо адміністратора за замовчуванням
            {
                name: 'Адміністратор',
                email: 'admin@example.com',
                password: 'admin123',
                level: 'admin'
            }
        ];
    }

    // Збереження списку користувачів в localStorage
    saveUsers() {
        localStorage.setItem('weatherAppUsers', JSON.stringify(this.users));
    }

    // Перевірка автентифікації користувача
    checkAuthentication() {
        const loggedInUser = localStorage.getItem('weatherAppCurrentUser');
        if (loggedInUser) {
            this.currentUser = JSON.parse(loggedInUser);
            this.showWeatherApp();
            this.updateUserInfo();
        } else {
            this.showAuthForm();
        }
    }

    // Показати форму авторизації
    showAuthForm() {
        this.authContainer.style.display = 'flex';
        this.weatherContainer.style.display = 'none';
    }

    // Показати додаток погоди
    showWeatherApp() {
        this.authContainer.style.display = 'none';
        this.weatherContainer.style.display = 'block';
        
        // Показати чи приховати функції залежно від рівня користувача
        this.setUserFeatures();
    }

    // Оновлення інформації про користувача
    updateUserInfo() {
        if (this.currentUser) {
            this.userName.textContent = this.currentUser.name;
            
            // Встановлення рівня користувача
            let levelText;
            switch (this.currentUser.level) {
                case 'premium':
                    levelText = 'Преміум';
                    break;
                case 'admin':
                    levelText = 'Адміністратор';
                    break;
                default:
                    levelText = 'Стандарт';
            }
            this.userLevel.textContent = levelText;
            
            // Приховати кнопку покращення для адміна
            if (this.currentUser.level === 'admin') {
                this.upgradeBtn.style.display = 'none';
            } else {
                this.upgradeBtn.style.display = 'block';
            }
        }
    }

    // Встановлення функцій відповідно до рівня користувача
    setUserFeatures() {
        switch (this.currentUser.level) {
            case 'premium':
                this.premiumFeatures.style.display = 'block';
                this.adminPanel.style.display = 'none';
                break;
            case 'admin':
                this.premiumFeatures.style.display = 'block';
                this.adminPanel.style.display = 'block';
                break;
            default:
                this.premiumFeatures.style.display = 'none';
                this.adminPanel.style.display = 'none';
        }
    }

    // Вхід користувача
    login() {
        const email = this.loginEmail.value.trim();
        const password = this.loginPassword.value;
        
        if (!email || !password) {
            this.loginMessage.textContent = 'Будь ласка, заповніть всі поля';
            return;
        }
        
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password; // Не зберігаємо пароль у сесії
            localStorage.setItem('weatherAppCurrentUser', JSON.stringify(this.currentUser));
            this.showWeatherApp();
            this.updateUserInfo();
        } else {
            this.loginMessage.textContent = 'Невірний email або пароль';
        }
    }

    // Реєстрація користувача
    register() {
        const name = this.registerName.value.trim();
        const email = this.registerEmail.value.trim();
        const password = this.registerPassword.value;
        const passwordConfirm = this.registerPasswordConfirm.value;
        
        // Перевірка заповнення всіх полів
        if (!name || !email || !password || !passwordConfirm) {
            this.registerMessage.textContent = 'Будь ласка, заповніть всі поля';
            return;
        }
        
        // Перевірка збігу паролів
        if (password !== passwordConfirm) {
            this.registerMessage.textContent = 'Паролі не збігаються';
            return;
        }
        
        // Перевірка на існування користувача з таким email
        if (this.users.some(u => u.email === email)) {
            this.registerMessage.textContent = 'Користувач з таким email вже існує';
            return;
        }
        
        // Створення нового користувача
        const newUser = {
            name,
            email,
            password,
            level: 'standard' // За замовчуванням стандартний рівень
        };
        
        // Додавання користувача до списку
        this.users.push(newUser);
        this.saveUsers();
        
        // Автоматичний вхід після реєстрації
        this.currentUser = { ...newUser };
        delete this.currentUser.password;
        localStorage.setItem('weatherAppCurrentUser', JSON.stringify(this.currentUser));
        this.showWeatherApp();
        this.updateUserInfo();
        
        // Очищення полів форми
        this.registerName.value = '';
        this.registerEmail.value = '';
        this.registerPassword.value = '';
        this.registerPasswordConfirm.value = '';
    }

    // Вихід користувача
    logout() {
        this.currentUser = null;
        localStorage.removeItem('weatherAppCurrentUser');
        this.showAuthForm();
    }

    // Покращення рівня користувача
    upgradeUserLevel(level) {
        if (!this.currentUser) return;
        
        // Зміна рівня поточного користувача
        this.currentUser.level = level;
        
        // Оновлення користувача в загальному списку
        const userIndex = this.users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            this.users[userIndex].level = level;
            this.saveUsers();
        }
        
        // Оновлення інформації та функцій
        localStorage.setItem('weatherAppCurrentUser', JSON.stringify(this.currentUser));
        this.updateUserInfo();
        this.setUserFeatures();
    }

    // Функція для показу 5-денного прогнозу
    showForecast() {
        const city = document.querySelector('.search-box input').value.trim();
        if (!city) {
            alert('Будь ласка, введіть назву міста');
            return;
        }
        
        const APIKey = '9303ca75581fd3f9d2558f1fb20e9f46';
        
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === '404') {
                    alert('Місто не знайдено');
                    return;
                }
                
                // Очищення контейнера прогнозу
                this.forecastContainer.innerHTML = '';
                
                // Отримуємо прогноз на 5 днів (з інтервалом 24 години)
                const forecasts = data.list.filter((item, index) => index % 8 === 0);
                
                // Створення елементів прогнозу
                forecasts.forEach(forecast => {
                    const date = new Date(forecast.dt * 1000);
                    const day = date.toLocaleDateString('uk-UA', { weekday: 'short' });
                    
                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    
                    forecastItem.innerHTML = `
                        <div class="forecast-date">${day}</div>
                        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                        <div class="forecast-temp">${parseInt(forecast.main.temp)}°C</div>
                        <div class="forecast-desc">${forecast.weather[0].description}</div>
                    `;
                    
                    this.forecastContainer.appendChild(forecastItem);
                });
            });
    }

    // Функція для показу сповіщень про погоду
    showAlerts() {
        const city = document.querySelector('.search-box input').value.trim();
        if (!city) {
            alert('Будь ласка, введіть назву міста');
            return;
        }
        
        const APIKey = '9303ca75581fd3f9d2558f1fb20e9f46';
        
        // Отримуємо координати міста
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === '404') {
                    alert('Місто не знайдено');
                    return;
                }
                
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                
                // Отримуємо попередження про погоду за координатами
                fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${APIKey}`)
                    .then(response => response.json())
                    .then(alertData => {
                        if (alertData.alerts && alertData.alerts.length > 0) {
                            let alertsText = 'Попередження про погоду:\n\n';
                            alertData.alerts.forEach(alert => {
                                alertsText += `- ${alert.event}: ${alert.description}\n`;
                            });
                            alert(alertsText);
                        } else {
                            alert('Немає попереджень про погоду для цього міста');
                        }
                    })
                    .catch(() => {
                        alert('Не вдалося отримати попередження про погоду');
                    });
            });
    }

    // Функція для показу списку користувачів (для адміністратора)
     showUsers() {
    if (!this.currentUser || this.currentUser.level !== 'admin') return;
    
    // Очищення контейнера адмін-контенту
    this.adminContent.innerHTML = '';
    
    // Створення таблиці користувачів
    const usersTable = document.createElement('table');
    usersTable.className = 'users-table';
    
    // Додавання заголовка таблиці
    usersTable.innerHTML = `
        <tr>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Рівень</th>
            <th>Дії</th>
        </tr>
    `;
    
    // Додавання рядків з користувачами
    this.users.forEach(user => {
        const row = document.createElement('tr');
        
        let levelText;
        switch (user.level) {
            case 'premium':
                levelText = 'Преміум';
                break;
            case 'admin':
                levelText = 'Адміністратор';
                break;
            default:
                levelText = 'Стандарт';
        }
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${levelText}</td>
            <td>
                <button class="change-level-btn" data-email="${user.email}" data-level="standard">Standard</button>
                <button class="change-level-btn" data-email="${user.email}" data-level="premium">Premium</button>
                <button class="change-level-btn" data-email="${user.email}" data-level="admin">Admin</button>
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Додавання таблиці до адмін-контенту
    this.adminContent.appendChild(usersTable);
    
    // Додавання обробників для кнопок зміни рівня
    const changeLevelBtns = document.querySelectorAll('.change-level-btn');
    const self = this; // Зберігаємо посилання на контекст
    
    changeLevelBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const email = this.getAttribute('data-email');
            const level = this.getAttribute('data-level');
            
            // Зміна рівня користувача
            const userIndex = self.users.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                self.users[userIndex].level = level;
                self.saveUsers();
                
                // Оновлення поточного користувача, якщо це він
                if (self.currentUser && self.currentUser.email === email) {
                    self.currentUser.level = level;
                    localStorage.setItem('weatherAppCurrentUser', JSON.stringify(self.currentUser));
                    self.updateUserInfo();
                    self.setUserFeatures();
                }
                
                // Оновлення списку користувачів
                self.showUsers();
            }
        });
    });
    }

    initAdminEvents() {
    // Кнопки преміум та адмін функцій
    this.forecastBtn.addEventListener('click', () => this.showForecast());
    this.alertsBtn.addEventListener('click', () => this.showAlerts());
    
    // Виправлені обробники для кнопок адміна
    if (this.usersBtn) {
        this.usersBtn.addEventListener('click', () => this.showUsers.call(this));
    }
    
    if (this.statsBtn) {
        this.statsBtn.addEventListener('click', () => this.showStats.call(this));
    }
}

    // Функція для показу статистики (для адміністратора)
    showStats() {
        if (this.currentUser.level !== 'admin') return;
        
        // Очищення контейнера адмін-контенту
        this.adminContent.innerHTML = '';
        
        // Підрахунок кількості користувачів по рівням
        const standardCount = this.users.filter(u => u.level === 'standard').length;
        const premiumCount = this.users.filter(u => u.level === 'premium').length;
        const adminCount = this.users.filter(u => u.level === 'admin').length;
        
        // Створення статистики
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats-container';
        
        statsDiv.innerHTML = `
            <h4>Статистика користувачів:</h4>
            <p>Загальна кількість: ${this.users.length}</p>
            <p>Стандартні користувачі: ${standardCount}</p>
            <p>Преміум користувачі: ${premiumCount}</p>
            <p>Адміністратори: ${adminCount}</p>
        `;
        
        this.adminContent.appendChild(statsDiv);
    }
}

// Ініціалізація системи авторизації при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    const authSystem = new UserAuthSystem();
});