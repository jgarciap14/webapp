const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {
    register,
    login,
    validateRegister,
    validateLogin,
    verifyToken
} = require('./auth');

const pool = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../webapp')); // Serve static files from webapp

// Rate limiting in-memory store (for production, use Redis)
const rateLimitStore = new Map();

// Rate limiting middleware
function rateLimit(maxAttempts = 5, windowMs = 60000, lockoutMs = 900000) {
    return (req, res, next) => {
        const identifier = req.ip;
        const now = Date.now();

        const userAttempts = rateLimitStore.get(identifier) || { attempts: [], lockedUntil: null };

        // Check if locked out
        if (userAttempts.lockedUntil && now < userAttempts.lockedUntil) {
            const remainingTime = Math.ceil((userAttempts.lockedUntil - now) / 60000);
            return res.status(429).json({
                success: false,
                message: `Demasiados intentos. Intenta de nuevo en ${remainingTime} minuto(s).`
            });
        }

        // Clear lockout if time has passed
        if (userAttempts.lockedUntil && now >= userAttempts.lockedUntil) {
            userAttempts.attempts = [];
            userAttempts.lockedUntil = null;
        }

        // Remove old attempts
        userAttempts.attempts = userAttempts.attempts.filter(timestamp => now - timestamp < windowMs);

        // Check max attempts
        if (userAttempts.attempts.length >= maxAttempts) {
            userAttempts.lockedUntil = now + lockoutMs;
            rateLimitStore.set(identifier, userAttempts);
            return res.status(429).json({
                success: false,
                message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
            });
        }

        // Record attempt
        userAttempts.attempts.push(now);
        rateLimitStore.set(identifier, userAttempts);

        next();
    };
}

// Auth routes
app.post('/api/auth/register', rateLimit(), validateRegister, register);
app.post('/api/auth/login', rateLimit(), validateLogin, login);

// Protected route example
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT u.id, u.email, u.username, u.created_at, ud.start_date, ud.inspiration FROM usuarios u LEFT JOIN user_data ud ON u.id = ud.user_id WHERE u.id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil'
        });
    }
});

// User data routes
app.get('/api/user/data', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_data WHERE user_id = $1',
            [req.user.userId]
        );

        res.json({
            success: true,
            data: result.rows[0] || null
        });
    } catch (error) {
        console.error('User data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos'
        });
    }
});

app.put('/api/user/inspiration', verifyToken, async (req, res) => {
    try {
        const { inspiration } = req.body;

        await pool.query(
            'UPDATE user_data SET inspiration = $1, updated_at = NOW() WHERE user_id = $2',
            [inspiration, req.user.userId]
        );

        res.json({
            success: true,
            message: 'Inspiración actualizada'
        });
    } catch (error) {
        console.error('Update inspiration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar inspiración'
        });
    }
});

// Relapses routes
app.get('/api/relapses', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM relapses WHERE user_id = $1 ORDER BY relapse_date DESC',
            [req.user.userId]
        );

        res.json({
            success: true,
            relapses: result.rows
        });
    } catch (error) {
        console.error('Get relapses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recaídas'
        });
    }
});

app.post('/api/relapses', verifyToken, async (req, res) => {
    try {
        const { relapseDate, notes } = req.body;

        const result = await pool.query(
            'INSERT INTO relapses (user_id, relapse_date, notes) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, relapseDate, notes]
        );

        res.status(201).json({
            success: true,
            relapse: result.rows[0]
        });
    } catch (error) {
        console.error('Create relapse error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar recaída'
        });
    }
});

// Forum routes
app.get('/api/forum/topics', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT t.*, u.username FROM forum_topics t JOIN usuarios u ON t.user_id = u.id ORDER BY t.created_at DESC'
        );

        res.json({
            success: true,
            topics: result.rows
        });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener temas'
        });
    }
});

app.post('/api/forum/topics', verifyToken, async (req, res) => {
    try {
        const { title, content } = req.body;

        const result = await pool.query(
            'INSERT INTO forum_topics (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, title, content]
        );

        res.status(201).json({
            success: true,
            topic: result.rows[0]
        });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear tema'
        });
    }
});

app.get('/api/forum/topics/:id/comments', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT c.*, u.username FROM forum_comments c JOIN usuarios u ON c.user_id = u.id WHERE c.topic_id = $1 ORDER BY c.created_at ASC',
            [id]
        );

        res.json({
            success: true,
            comments: result.rows
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener comentarios'
        });
    }
});

app.post('/api/forum/topics/:id/comments', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const result = await pool.query(
            'INSERT INTO forum_comments (topic_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [id, req.user.userId, content]
        );

        res.status(201).json({
            success: true,
            comment: result.rows[0]
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear comentario'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});
