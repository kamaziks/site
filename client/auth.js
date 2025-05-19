document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('weatherAppCurrentUser') || 'null');
    if (token && user) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('weatherContainer').style.display = 'block';
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userLevel').textContent = user.level.charAt(0).toUpperCase() + user.level.slice(1);

        if (user.level === 'premium' || user.level === 'admin') {
            document.getElementById('premiumFeatures').style.display = 'block';
        } else {
            document.getElementById('premiumFeatures').style.display = 'none';
        }
        if (user.level === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        } else {
            document.getElementById('adminPanel').style.display = 'none';
        }
    } else {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('weatherContainer').style.display = 'none';
    }

    // Перемикання вкладок Вхід/Реєстрація
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(this.dataset.tab + 'Form').classList.add('active');
        });
    });

    // Обробка входу
    document.getElementById('loginButton').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const msg = document.getElementById('loginMessage');
        msg.textContent = '';
        try {
            const res = await window.api.loginUser(email, password);
            if (res.success) {
                localStorage.setItem('token', res.token);
                localStorage.setItem('weatherAppCurrentUser', JSON.stringify(res.user));
                msg.style.color = 'green';
                msg.textContent = 'Вхід успішний!';
                setTimeout(() => {
                    document.getElementById('authContainer').style.display = 'none';
                    document.getElementById('weatherContainer').style.display = 'block';
                    // Оновити інтерфейс користувача
                    document.getElementById('userName').textContent = res.user.name;
                    document.getElementById('userLevel').textContent = res.user.level.charAt(0).toUpperCase() + res.user.level.slice(1);

                    // ДОДАЙТЕ ЦЕ:
                    if (res.user.level === 'premium' || res.user.level === 'admin') {
                        document.getElementById('premiumFeatures').style.display = 'block';
                    } else {
                        document.getElementById('premiumFeatures').style.display = 'none';
                    }
                    if (res.user.level === 'admin') {
                        document.getElementById('adminPanel').style.display = 'block';
                    } else {
                        document.getElementById('adminPanel').style.display = 'none';
                    }
                }, 700);
            } else {
                msg.style.color = '#e74c3c';
                msg.textContent = res.message || 'Помилка входу';
            }
        } catch (e) {
            msg.style.color = '#e74c3c';
            msg.textContent = 'Помилка сервера';
        }
    });

    // Обробка реєстрації
    document.getElementById('registerButton').addEventListener('click', async () => {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const password2 = document.getElementById('registerPasswordConfirm').value;
        const msg = document.getElementById('registerMessage');
        msg.textContent = '';
        if (password !== password2) {
            msg.style.color = '#e74c3c';
            msg.textContent = 'Паролі не співпадають';
            return;
        }
        try {
            const res = await window.api.registerUser(name, email, password);
            if (res.success) {
                msg.style.color = 'green';
                msg.textContent = 'Реєстрація успішна! Увійдіть.';
                setTimeout(() => {
                    document.getElementById('authContainer').style.display = 'none';
                    document.getElementById('weatherContainer').style.display = 'block';
    // Оновити інтерфейс користувача
                     document.getElementById('userName').textContent = res.user.name;
                     document.getElementById('userLevel').textContent = res.user.level.charAt(0).toUpperCase() + res.user.level.slice(1);

                     if (res.user.level === 'premium' || res.user.level === 'admin') {
                        document.getElementById('premiumFeatures').style.display = 'block';
                    } else {
                        document.getElementById('premiumFeatures').style.display = 'none';
                    }
                    if (res.user.level === 'admin') {
                        document.getElementById('adminPanel').style.display = 'block';
                    } else {
                        document.getElementById('adminPanel').style.display = 'none';
                    }
                }, 700);
            } else {
                msg.style.color = '#e74c3c';
                msg.textContent = res.message || 'Помилка реєстрації';
            }
        } catch (e) {
            msg.style.color = '#e74c3c';
            msg.textContent = 'Помилка сервера';
        }
    });
});