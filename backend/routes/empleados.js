const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // ← IMPORTANTE
const { getConnection } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ========================================
// LISTAR TODOS LOS EMPLEADOS
// ========================================
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    e.id_empleado,
                    e.nombre,
                    e.apellido,
                    e.documento_identidad,
                    e.telefono,
                    c.nombre_cargo AS cargo,
                    c.salario,
                    e.fecha_contratacion,
                    u.username,
                    CASE WHEN u.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
                FROM Empleados e
                INNER JOIN Cargos c ON e.id_cargo = c.id_cargo
                LEFT JOIN Usuarios u ON e.id_empleado = u.id_empleado
                ORDER BY e.apellido, e.nombre
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error listando empleados:', err);
        res.status(500).json({ error: 'Error al listar empleados' });
    }
});

// ========================================
// OBTENER UN EMPLEADO POR ID
// ========================================
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query(`
                SELECT 
                    e.id_empleado,
                    e.nombre,
                    e.apellido,
                    e.documento_identidad,
                    e.telefono,
                    e.id_cargo,
                    c.nombre_cargo AS cargo,
                    c.salario,
                    e.fecha_contratacion
                FROM Empleados e
                INNER JOIN Cargos c ON e.id_cargo = c.id_cargo
                WHERE e.id_empleado = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('❌ Error obteniendo empleado:', err);
        res.status(500).json({ error: 'Error al obtener empleado' });
    }
});

// ========================================
// CREAR NUEVO EMPLEADO + USUARIO AUTOMÁTICO
// ========================================
router.post('/', verifyToken, isAdmin, async (req, res) => {
    console.log('📥 POST /api/empleados - Datos recibidos:', req.body);

    const { nombre, apellido, documento_identidad, telefono, id_cargo } = req.body;

    if (!nombre || !apellido || !documento_identidad || !id_cargo) {
        console.log('❌ Campos faltantes');
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        console.log('🔄 Iniciando transacción...');
        const pool = await getConnection();
        const transaction = pool.transaction();

        await transaction.begin();

        try {
            // 1. Verificar que no exista el documento
            const existeDoc = await transaction.request()
                .input('documento', documento_identidad)
                .query('SELECT id_empleado FROM Empleados WHERE documento_identidad = @documento');

            if (existeDoc.recordset.length > 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'El documento de identidad ya está registrado' });
            }

            // 2. Crear empleado
            const empleadoResult = await transaction.request()
                .input('nombre', nombre)
                .input('apellido', apellido)
                .input('documento_identidad', documento_identidad)
                .input('telefono', telefono || null)
                .input('id_cargo', id_cargo)
                .query(`
                    INSERT INTO Empleados (nombre, apellido, documento_identidad, telefono, id_cargo, fecha_contratacion)
                    OUTPUT INSERTED.id_empleado
                    VALUES (@nombre, @apellido, @documento_identidad, @telefono, @id_cargo, GETDATE())
                `);

            const id_empleado = empleadoResult.recordset[0].id_empleado;
            console.log('✅ Empleado creado con ID:', id_empleado);

            // 3. Generar username y password
            const nombreLimpio = nombre.toLowerCase().replace(/\s+/g, '');
            const apellidoLimpio = apellido.toLowerCase().replace(/\s+/g, '');

            // Username: nombreapellido (Juan Arnez -> juanarnez)
            const username = `${nombreLimpio}${apellidoLimpio}`;

            // Password sin hashear: apellido.documento (Arnez + 12446261 -> arnez.12446261)
            const passwordPlain = `${apellidoLimpio}.${documento_identidad}`;

            // Password hasheado con bcrypt
            console.log('🔐 Hasheando contraseña...');
            const passwordHash = await bcrypt.hash(passwordPlain, 10);

            console.log('🔐 Credenciales generadas:');
            console.log('   Nombre completo:', nombre, apellido);
            console.log('   Username:', username);
            console.log('   Password (sin hashear):', passwordPlain);
            console.log('   Password (hasheado):', passwordHash.substring(0, 20) + '...');

            // 4. Verificar que el username no exista
            const existeUsername = await transaction.request()
                .input('username', username)
                .query('SELECT id_usuario FROM Usuarios WHERE username = @username');

            if (existeUsername.recordset.length > 0) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'El username generado ya existe',
                    username_generado: username
                });
            }

            // 5. Obtener ID del rol "Empleado"
            const rolResult = await transaction.request()
                .query("SELECT id_rol FROM Roles WHERE nombre_rol = 'Empleado'");

            if (rolResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(500).json({ error: 'Rol Empleado no encontrado en la base de datos' });
            }

            const id_rol_empleado = rolResult.recordset[0].id_rol;

            // 6. Crear usuario con contraseña hasheada
            console.log('💾 Insertando usuario en BD:');
            console.log('   username:', username);
            console.log('   password_hash:', passwordHash.substring(0, 20) + '...');

            await transaction.request()
                .input('username', username)
                .input('password_hash', passwordHash)
                .input('id_rol', id_rol_empleado)
                .input('id_empleado', id_empleado)
                .query(`
                    INSERT INTO Usuarios (username, password_hash, id_rol, id_empleado, activo, fecha_creacion)
                    VALUES (@username, @password_hash, @id_rol, @id_empleado, 1, GETDATE())
                `);

            await transaction.commit();

            console.log('✅ Empleado y usuario creados exitosamente');

            // Devolver la contraseña SIN HASHEAR para que el admin se la dé al empleado
            res.status(201).json({
                message: 'Empleado y usuario creados exitosamente',
                id_empleado: id_empleado,
                username: username,
                password: passwordPlain,
                info: 'Guarda estas credenciales y entrégalas al empleado'
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('❌ Error creando empleado:', err);
        res.status(500).json({
            error: 'Error al crear empleado',
            details: err.message
        });
    }
});

// ========================================
// ACTUALIZAR EMPLEADO
// ========================================
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { nombre, apellido, documento_identidad, telefono, id_cargo } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', req.params.id)
            .input('nombre', nombre)
            .input('apellido', apellido)
            .input('documento_identidad', documento_identidad)
            .input('telefono', telefono || null)
            .input('id_cargo', id_cargo)
            .query(`
                UPDATE Empleados
                SET nombre = @nombre,
                    apellido = @apellido,
                    documento_identidad = @documento_identidad,
                    telefono = @telefono,
                    id_cargo = @id_cargo
                WHERE id_empleado = @id
            `);

        res.json({ message: 'Empleado actualizado exitosamente' });
    } catch (err) {
        console.error('❌ Error actualizando empleado:', err);
        res.status(500).json({ error: 'Error al actualizar empleado' });
    }
});

// ========================================
// ELIMINAR (DESACTIVAR) EMPLEADO
// ========================================
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();

        // Desactivar el usuario asociado en lugar de eliminar
        await pool.request()
            .input('id_empleado', req.params.id)
            .query(`
                UPDATE Usuarios
                SET activo = 0
                WHERE id_empleado = @id_empleado
            `);

        res.json({ message: 'Empleado desactivado exitosamente' });
    } catch (err) {
        console.error('❌ Error desactivando empleado:', err);
        res.status(500).json({ error: 'Error al desactivar empleado' });
    }
});

// ========================================
// LISTAR CARGOS (para dropdown)
// ========================================
router.get('/cargos/lista', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT id_cargo, nombre_cargo, salario FROM Cargos ORDER BY nombre_cargo');
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error listando cargos:', err);
        res.status(500).json({ error: 'Error al listar cargos' });
    }
});

module.exports = router;