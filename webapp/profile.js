let currentUser = localStorage.getItem('currentUser');

// Redirect to login if not authenticated
if (!currentUser) {
    window.location.href = 'login.html';
}

function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize
document.getElementById('profileName').textContent = currentUser;
