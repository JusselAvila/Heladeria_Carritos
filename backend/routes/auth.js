const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getConnection } = require('../config/database');     
const { SECRET_KEY } = require('../middleware/auth');        

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log('🔐 Intento de login:', username);
    
    try {
        const pool = await getConnection();
        
        console.log('✅ Conexión a DB exitosa');
        
        // Obtener usuario con su password_hash
        const result = await pool.request()
            .input('username', username)
            .query(`
                SELECT 
                    u.id_usuario,
                    u.username,
                    u.password_hash,
                    r.nombre_rol,
                    u.id_empleado,
                    ISNULL(e.nombre + ' ' + e.apellido, 'Administrador') AS nombre_completo
                FROM Usuarios u
                INNER JOIN Roles r ON u.id_rol = r.id_rol
                LEFT JOIN Empleados e ON u.id_empleado = e.id_empleado
                WHERE u.username = @username 
                  AND u.activo = 1
            `);
        
        console.log('📊 Resultados:', result.recordset.length);
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user = result.recordset[0];
        
        // Verificar contraseña con bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            console.log('❌ Contraseña incorrecta para usuario:', username);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        console.log('👤 Usuario autenticado:', user.username, '-', user.nombre_rol);
        
        const token = jwt.sign(
            { 
                id_usuario: user.id_usuario,
                username: user.username,
                rol: user.nombre_rol,
                id_empleado: user.id_empleado,
                nombre_completo: user.nombre_completo
            },
            SECRET_KEY,
            { expiresIn: '8h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id_usuario: user.id_usuario,
                username: user.username,
                rol: user.nombre_rol,
                id_empleado: user.id_empleado,
                nombre_completo: user.nombre_completo
            }
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ 
            error: 'Error en el servidor',
            message: error.message 
        });
    }
});

module.exports = router;