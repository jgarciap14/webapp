// Check if already logged in
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    window.location.href = 'index.html';
}

function register() {
    const email = document.getElementById('emailInput').value;
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Validate email
    if (!email.trim()) {
        showError('Por favor ingresa tu correo electrónico');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Por favor ingresa un correo electrónico válido');
        return;
    }

    // Validate username
    if (!username.trim()) {
        showError('Por favor ingresa un nombre de usuario');
        return;
    }

    if (username.length < 3) {
        showError('El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    // Validate password
    if (!password) {
        showError('Por favor ingresa una contraseña');
        return;
    }

    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    // Check if user already exists
    const userKey = `sobrietyApp_${username}`;
    if (localStorage.getItem(userKey)) {
        showError('Este nombre de usuario ya está registrado');
        return;
    }

    // Save user data
    const userData = {
        email: email,
        username: username,
        password: password, // In production, this should be hashed
        startDate: new Date(),
        relapses: [],
        topics: []
    };

    localStorage.setItem(userKey, JSON.stringify(userData));
    localStorage.setItem('currentUser', username);

    // Redirect to home
    window.location.href = 'index.html';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Allow registration with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                register();
            }
        });
    });
});
