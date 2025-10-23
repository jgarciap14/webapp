// Check if already logged in
const savedUser = localStorage.getItem('currentUser');
const persistentSession = localStorage.getItem('persistentSession');

if (savedUser && persistentSession === 'true') {
    window.location.href = 'index.html';
}

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function getRateLimitData() {
    const data = localStorage.getItem('loginRateLimit');
    if (!data) {
        return { attempts: [], lockedUntil: null };
    }
    return JSON.parse(data);
}

function saveRateLimitData(data) {
    localStorage.setItem('loginRateLimit', JSON.stringify(data));
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
            message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
        };
    }

    return { allowed: true };
}

function recordLoginAttempt() {
    const rateLimitData = getRateLimitData();
    rateLimitData.attempts.push(Date.now());
    saveRateLimitData(rateLimitData);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

function disableLoginButton(seconds) {
    const button = document.getElementById('loginButton');
    button.disabled = true;
    button.classList.add('disabled');

    let remaining = seconds;
    const interval = setInterval(() => {
        if (remaining <= 0) {
            clearInterval(interval);
            button.disabled = false;
            button.classList.remove('disabled');
            button.textContent = 'Iniciar Sesión';
        } else {
            button.textContent = `Espera ${remaining}s`;
            remaining--;
        }
    }, 1000);
}

function login() {
    hideError();

    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        showError(rateLimitCheck.message);
        const rateLimitData = getRateLimitData();
        if (rateLimitData.lockedUntil) {
            const remainingSeconds = Math.ceil((rateLimitData.lockedUntil - Date.now()) / 1000);
            disableLoginButton(remainingSeconds);
        }
        return;
    }

    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    if (!username.trim()) {
        showError('Por favor ingresa un nombre de usuario.');
        return;
    }

    // Record login attempt
    recordLoginAttempt();

    // Set persistent session flags
    localStorage.setItem('currentUser', username);
    localStorage.setItem('persistentSession', 'true');
    localStorage.setItem('lastLoginTime', new Date().toISOString());

    // Initialize user data if doesn't exist
    const key = `sobrietyApp_${username}`;
    if (!localStorage.getItem(key)) {
        const initialData = {
            startDate: new Date(),
            relapses: [],
            topics: []
        };
        localStorage.setItem(key, JSON.stringify(initialData));
    }

    // Clear rate limit on successful login
    localStorage.removeItem('loginRateLimit');

    // Force save to ensure data is written before navigation
    try {
        localStorage.setItem('sessionValid', 'true');
    } catch (e) {
        console.error('Error saving session:', e);
    }

    window.location.href = 'index.html';
}

// Check rate limit on page load
function checkRateLimitOnLoad() {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        showError(rateLimitCheck.message);
        const rateLimitData = getRateLimitData();
        if (rateLimitData.lockedUntil) {
            const remainingSeconds = Math.ceil((rateLimitData.lockedUntil - Date.now()) / 1000);
            disableLoginButton(remainingSeconds);
        }
    }
}

// Allow login with Enter key
document.addEventListener('DOMContentLoaded', function() {
    // Check rate limit on load
    checkRateLimitOnLoad();

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    });
});
