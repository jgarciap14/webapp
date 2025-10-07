// Check if already logged in
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    window.location.href = 'index.html';
}

function login() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    if (username.trim()) {
        localStorage.setItem('currentUser', username);

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

        window.location.href = 'index.html';
    }
}

// Allow login with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    });
});
