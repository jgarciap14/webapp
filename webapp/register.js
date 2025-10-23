// Check if already logged in
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    window.location.href = 'index.html';
}

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function getRateLimitData() {
    const data = localStorage.getItem('registerRateLimit');
    if (!data) {
        return { attempts: [], lockedUntil: null };
    }
    return JSON.parse(data);
}

function saveRateLimitData(data) {
    localStorage.setItem('registerRateLimit', JSON.stringify(data));
}

function checkRateLimit() {
    const rateLimitData = getRateLimitData();
    const now = Date.now();

    // Check if currently locked out
    if (rateLimitData.lockedUntil && now < rateLimitData.lockedUntil) {
        const remainingTime = Math.ceil((rateLimitData.lockedUntil - now) / 60000);
        return {
            allowed: false,
            message: `Demasiados intentos. Intenta de nuevo en ${remainingTime} minuto(s).`
        };
    }

    // Clear lockout if time has passed
    if (rateLimitData.lockedUntil && now >= rateLimitData.lockedUntil) {
        rateLimitData.attempts = [];
        rateLimitData.lockedUntil = null;
        saveRateLimitData(rateLimitData);
    }

    // Remove attempts older than 1 minute
    rateLimitData.attempts = rateLimitData.attempts.filter(timestamp => now - timestamp < RATE_WINDOW);

    // Check if max attempts reached
    if (rateLimitData.attempts.length >= MAX_ATTEMPTS) {
        rateLimitData.lockedUntil = now + LOCKOUT_TIME;
        saveRateLimitData(rateLimitData);
        return {
            allowed: false,
            message: 'Demasiados intentos de registro. Intenta de nuevo en 15 minutos.'
        };
    }

    return { allowed: true };
}

function recordRegisterAttempt() {
    const rateLimitData = getRateLimitData();
    rateLimitData.attempts.push(Date.now());
    saveRateLimitData(rateLimitData);
}

function disableRegisterButton(seconds) {
    const button = document.getElementById('registerButton');
    button.disabled = true;
    button.classList.add('disabled');

    let remaining = seconds;
    const interval = setInterval(() => {
        if (remaining <= 0) {
            clearInterval(interval);
            button.disabled = false;
            button.classList.remove('disabled');
            button.textContent = 'Registrarse';
        } else {
            button.textContent = `Espera ${remaining}s`;
            remaining--;
        }
    }, 1000);
}

function register() {
    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        showError(rateLimitCheck.message);
        const rateLimitData = getRateLimitData();
        if (rateLimitData.lockedUntil) {
            const remainingSeconds = Math.ceil((rateLimitData.lockedUntil - Date.now()) / 1000);
            disableRegisterButton(remainingSeconds);
        }
        return;
    }
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

    // Record registration attempt
    recordRegisterAttempt();

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
    localStorage.setItem('persistentSession', 'true');
    localStorage.setItem('lastLoginTime', new Date().toISOString());

    // Clear rate limit on successful registration
    localStorage.removeItem('registerRateLimit');

    // Redirect to home
    window.location.href = 'index.html';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Check rate limit on page load
function checkRateLimitOnLoad() {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        showError(rateLimitCheck.message);
        const rateLimitData = getRateLimitData();
        if (rateLimitData.lockedUntil) {
            const remainingSeconds = Math.ceil((rateLimitData.lockedUntil - Date.now()) / 1000);
            disableRegisterButton(remainingSeconds);
        }
    }
}

// Allow registration with Enter key
document.addEventListener('DOMContentLoaded', function() {
    // Check rate limit on load
    checkRateLimitOnLoad();

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                register();
            }
        });
    });
});
