const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('./database');

const SALT_ROUNDS = 10;

// Validation middleware
const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('username')
        .isLength({ min: 3, max: 50 })
        .trim()
        .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
];

const validateLogin = [
    body('username')
        .notEmpty()
        .trim()
        .withMessage('Usuario requerido'),
    body('password')
        .notEmpty()
        .withMessage('Contraseña requerida')
];

// Register new user
async function register(req, res) {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, username, password } = req.body;

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El usuario o email ya está registrado'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert user
        const result = await pool.query(
            'INSERT INTO usuarios (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [email, username, passwordHash]
        );

        const user = result.rows[0];

        // Create initial user_data
        await pool.query(
            'INSERT INTO user_data (user_id, start_date) VALUES ($1, NOW())',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
}

// Login user
async function login(req, res) {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Get user from database
        const result = await pool.query(
            'SELECT id, email, username, password_hash, is_active FROM usuarios WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Usuario desactivado'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE usuarios SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
}

// Verify JWT token middleware
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
}

module.exports = {
    register,
    login,
    validateRegister,
    validateLogin,
    verifyToken
};
