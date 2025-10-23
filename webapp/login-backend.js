// Check if already logged in
const savedUser = localStorage.getItem('currentUser');
const persistentSession = localStorage.getItem('persistentSession');
const authToken = localStorage.getItem('authToken');

if (savedUser && persistentSession === 'true' && authToken) {
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

async function login() {
    hideError();

    // Check rate limit (client-side)
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

    if (!password) {
        showError('Por favor ingresa una contraseña.');
        return;
    }

    // Record login attempt (client-side)
    recordLoginAttempt();

    // Disable button during request
    const button = document.getElementById('loginButton');
    button.disabled = true;
    button.textContent = 'Iniciando sesión...';

    try {
        // Call backend API
        const response = await authAPI.login(username, password);

        if (response.success) {
            // Clear rate limit on successful login
            localStorage.removeItem('loginRateLimit');

            // Redirect to home
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Login error:', error);

        // Check if it's a rate limit error from server
        if (error.message && error.message.includes('Demasiados intentos')) {
            showError(error.message);
        } else if (error.message) {
            showError(error.message);
        } else {
            showError('Error al iniciar sesión. Por favor verifica tus credenciales.');
        }

        button.disabled = false;
        button.textContent = 'Iniciar Sesión';
    }
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
