const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ========================================
// CREAR CLIENTE (o buscar existente)
// ========================================
router.post('/', verifyToken, async (req, res) => {
    const { nombre, apellido, telefono, direccion } = req.body;

    try {
        const pool = await getConnection();

        // Buscar cliente existente por nombre y apellido
        const existing = await pool.request()
            .input('nombre', nombre)
            .input('apellido', apellido)
            .query(`
                SELECT id_cliente FROM Clientes 
                WHERE nombre = @nombre AND apellido = @apellido
            `);

        if (existing.recordset.length > 0) {
            return res.json({ id_cliente: existing.recordset[0].id_cliente });
        }

        // Crear nuevo cliente
        const result = await pool.request()
            .input('nombre', nombre)
            .input('apellido', apellido)
            .input('telefono', telefono || null)
            .input('direccion', direccion || null)
            .query(`
                INSERT INTO Clientes (nombre, apellido, telefono, direccion)
                OUTPUT INSERTED.id_cliente
                VALUES (@nombre, @apellido, @telefono, @direccion)
            `);

        res.status(201).json({ id_cliente: result.recordset[0].id_cliente });

    } catch (err) {
        console.error('❌ Error con cliente:', err);
        res.status(500).json({ error: 'Error al procesar cliente' });
    }
});

module.exports = router;