// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    async register(email, username, password) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, username, password })
        });

        if (data.success && data.token) {
            setAuthToken(data.token);
            localStorage.setItem('currentUser', data.user.username);
            localStorage.setItem('persistentSession', 'true');
            localStorage.setItem('lastLoginTime', new Date().toISOString());
        }

        return data;
    },

    async login(username, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (data.success && data.token) {
            setAuthToken(data.token);
            localStorage.setItem('currentUser', data.user.username);
            localStorage.setItem('persistentSession', 'true');
            localStorage.setItem('lastLoginTime', new Date().toISOString());
        }

        return data;
    },

    logout() {
        removeAuthToken();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('persistentSession');
        localStorage.removeItem('sessionValid');
        localStorage.removeItem('lastLoginTime');
        localStorage.removeItem('lastActivity');
    }
};

// User API
const userAPI = {
    async getProfile() {
        return await apiRequest('/user/profile');
    },

    async getData() {
        return await apiRequest('/user/data');
    },

    async updateInspiration(inspiration) {
        return await apiRequest('/user/inspiration', {
            method: 'PUT',
            body: JSON.stringify({ inspiration })
        });
    }
};

// Relapses API
const relapsesAPI = {
    async getAll() {
        return await apiRequest('/relapses');
    },

    async create(relapseDate, notes = '') {
        return await apiRequest('/relapses', {
            method: 'POST',
            body: JSON.stringify({ relapseDate, notes })
        });
    }
};

// Forum API
const forumAPI = {
    async getTopics() {
        return await apiRequest('/forum/topics');
    },

    async createTopic(title, content) {
        return await apiRequest('/forum/topics', {
            method: 'POST',
            body: JSON.stringify({ title, content })
        });
    },

    async getComments(topicId) {
        return await apiRequest(`/forum/topics/${topicId}/comments`);
    },

    async createComment(topicId, content) {
        return await apiRequest(`/forum/topics/${topicId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }
};

// Export API modules
window.authAPI = authAPI;
window.userAPI = userAPI;
window.relapsesAPI = relapsesAPI;
window.forumAPI = forumAPI;
