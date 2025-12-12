const jwt = require('jsonwebtoken');

// Secret key para JWT (debe coincidir con el .env)
const SECRET_KEY = process.env.JWT_SECRET || 'aymigatitomiaumiau';

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Agregar datos del usuario a la request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
    if (req.user.rol !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

// Middleware para verificar rol de vendedor
const isVendedor = (req, res, next) => {
    if (req.user.rol !== 'Vendedor') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de vendedor' });
    }
    next();
};

module.exports = {
    SECRET_KEY,
    verifyToken,
    isAdmin,
    isVendedor
};
