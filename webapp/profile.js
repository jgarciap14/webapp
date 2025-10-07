let currentUser = localStorage.getItem('currentUser');

// Redirect to login if not authenticated
if (!currentUser) {
    window.location.href = 'index.html';
}

function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize
document.getElementById('profileName').textContent = currentUser;
