let currentUser = localStorage.getItem('currentUser');
let persistentSession = localStorage.getItem('persistentSession');

// Redirect to login if not authenticated
if (!currentUser || persistentSession !== 'true') {
    window.location.href = 'login.html';
}

// Update last activity timestamp to maintain session
localStorage.setItem('lastActivity', new Date().toISOString());

function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    // Clear persistent session flags
    localStorage.removeItem('persistentSession');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionValid');
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem('lastActivity');

    // Redirect to login
    window.location.href = 'login.html';
}

// Inspiration functionality
function loadInspiration() {
    const inspiration = localStorage.getItem(`inspiration_${currentUser}`);
    if (inspiration) {
        document.getElementById('inspirationText').textContent = inspiration;
    }
}

function enableEdit() {
    const currentText = document.getElementById('inspirationText').textContent;
    document.getElementById('inspirationTextarea').value = currentText;
    document.getElementById('inspirationContent').style.display = 'none';
    document.getElementById('inspirationEdit').style.display = 'block';
    document.getElementById('editBtn').style.display = 'none';
}

function saveInspiration() {
    const newText = document.getElementById('inspirationTextarea').value;
    document.getElementById('inspirationText').textContent = newText;
    localStorage.setItem(`inspiration_${currentUser}`, newText);
    cancelEdit();
}

function cancelEdit() {
    document.getElementById('inspirationContent').style.display = 'block';
    document.getElementById('inspirationEdit').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
}

// Initialize
document.getElementById('profileName').textContent = currentUser;
loadInspiration();
