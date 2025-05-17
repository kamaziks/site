// Скрипт для патчу функціональності адміністратора та розмірів контейнера
document.addEventListener('DOMContentLoaded', function() {
    // Перевірка, чи завантажено систему авторизації
    if (typeof UserAuthSystem !== 'undefined') {
        // Розширення прототипу UserAuthSystem
        const originalInitEventListeners = UserAuthSystem.prototype.initEventListeners;
        
        // Заміняємо оригінальний метод ініціалізації обробників подій
        UserAuthSystem.prototype.initEventListeners = function() {
            // Виклик оригінального методу
            originalInitEventListeners.call(this);
            
            // Видаляємо старі обробники
            if (this.usersBtn) {
                const oldUsersClickListeners = this.usersBtn.getEventListeners 
                    ? this.usersBtn.getEventListeners('click') 
                    : [];
                
                if (oldUsersClickListeners.length) {
                    this.usersBtn.removeEventListener('click', oldUsersClickListeners[0]);
                }
                
                // Додаємо новий обробник з правильним контекстом
                this.usersBtn.addEventListener('click', () => {
                    console.log('Показуємо користувачів з правильним контекстом');
                    this.showUsers();
                });
            }
        };
        
        // Виправлення методу showUsers
        UserAuthSystem.prototype.showUsers = function() {
            if (!this.currentUser || this.currentUser.level !== 'admin') {
                console.log('Недостатньо прав для перегляду користувачів');
                return;
            }
            
            console.log('Показуємо користувачів');
            
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
        };
        
        // Виправлення функції оновлення висоти контейнера
        const originalUpdateContainerHeight = window.updateContainerHeight;
        
        // Змінюємо функцію оновлення висоти контейнера
        window.updateContainerHeight = function() {
            // Вже не потрібно змінювати висоту, оскільки ми використовуємо прокрутку
            console.log("Висоту контейнера не змінюємо - використовуємо прокрутку");
        };
        
        console.log('Патч функціональності адміністратора та розмірів контейнера застосовано');
    } else {
        console.error('Помилка: UserAuthSystem не знайдено. Перевірте порядок завантаження скриптів.');
    }
});