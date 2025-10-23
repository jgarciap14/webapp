// Check if already logged in
const savedUser = localStorage.getItem('currentUser');
const authToken = localStorage.getItem('authToken');

if (savedUser && authToken) {
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

    if (rateLimitData.lockedUntil && now < rateLimitData.lockedUntil) {
        const remainingTime = Math.ceil((rateLimitData.lockedUntil - now) / 60000);
        return {
            allowed: false,
            message: `Demasiados intentos. Intenta de nuevo en ${remainingTime} minuto(s).`
        };
    }

    if (rateLimitData.lockedUntil && now >= rateLimitData.lockedUntil) {
        rateLimitData.attempts = [];
        rateLimitData.lockedUntil = null;
        saveRateLimitData(rateLimitData);
    }

    rateLimitData.attempts = rateLimitData.attempts.filter(timestamp => now - timestamp < RATE_WINDOW);

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

async function register() {
    // Check rate limit (client-side)
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

    // Client-side validation
    if (!email.trim()) {
        showError('Por favor ingresa tu correo electrónico');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Por favor ingresa un correo electrónico válido');
        return;
    }

    if (!username.trim()) {
        showError('Por favor ingresa un nombre de usuario');
        return;
    }

    if (username.length < 3) {
        showError('El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    if (!password) {
        showError('Por favor ingresa una contraseña');
        return;
    }

    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    // Record registration attempt (client-side)
    recordRegisterAttempt();

    // Disable button during request
    const button = document.getElementById('registerButton');
    button.disabled = true;
    button.textContent = 'Registrando...';

    try {
        // Call backend API
        const response = await authAPI.register(email, username, password);

        if (response.success) {
            // Clear rate limit on successful registration
            localStorage.removeItem('registerRateLimit');

            // Redirect to home
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Registration error:', error);

        if (error.message && error.message.includes('Demasiados intentos')) {
            showError(error.message);
        } else if (error.message) {
            showError(error.message);
        } else {
            showError('Error al registrar usuario. Por favor intenta nuevamente.');
        }

        button.disabled = false;
        button.textContent = 'Registrarse';
    }
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
