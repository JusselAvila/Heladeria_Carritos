const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

// ========================================
// MIDDLEWARE: Verificar Token JWT
// ========================================
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Formato esperado: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Agregar usuario decodificado al request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// ========================================
// MIDDLEWARE: Verificar que sea Admin
// ========================================
function isAdmin(req, res, next) {
    // req.user fue seteado por verifyToken
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.rol !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador' });
    }

    next();
}

// ========================================
// MIDDLEWARE: Verificar que sea Empleado
// ========================================
function isEmpleado(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.rol !== 'Empleado') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Empleado' });
    }

    next();
}

module.exports = {
    SECRET_KEY,
    verifyToken,
    isAdmin,
    isEmpleado
};