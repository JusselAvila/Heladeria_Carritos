const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ========================================
// LISTAR TODOS LOS CARRITOS
// ========================================
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    c.id_carrito,
                    c.codigo_carrito,
                    c.ubicacion,
                    c.estado,
                    e.nombre + ' ' + e.apellido AS empleado_asignado,
                    ec.fecha_inicio
                FROM Carritos c
                LEFT JOIN Empleado_Carrito ec ON c.id_carrito = ec.id_carrito AND ec.fecha_fin IS NULL
                LEFT JOIN Empleados e ON ec.id_empleado = e.id_empleado
                ORDER BY c.codigo_carrito
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error listando carritos:', err);
        res.status(500).json({ error: 'Error al listar carritos' });
    }
});

// ========================================
// ASIGNAR CARRITO A EMPLEADO
// ========================================
router.post('/asignar', verifyToken, isAdmin, async (req, res) => {
    const { id_carrito, id_empleado } = req.body;

    if (!id_carrito || !id_empleado) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    try {
        const pool = await getConnection();
        const transaction = pool.transaction();

        await transaction.begin();

        try {
            // Cerrar asignaciones previas del carrito
            await transaction.request()
                .input('id_carrito', id_carrito)
                .query(`
                    UPDATE Empleado_Carrito
                    SET fecha_fin = GETDATE()
                    WHERE id_carrito = @id_carrito AND fecha_fin IS NULL
                `);

            // Crear nueva asignación
            await transaction.request()
                .input('id_empleado', id_empleado)
                .input('id_carrito', id_carrito)
                .query(`
                    INSERT INTO Empleado_Carrito (id_empleado, id_carrito, fecha_inicio)
                    VALUES (@id_empleado, @id_carrito, GETDATE())
                `);

            // Actualizar estado del carrito
            await transaction.request()
                .input('id_carrito', id_carrito)
                .query("UPDATE Carritos SET estado = 'Activo' WHERE id_carrito = @id_carrito");

            await transaction.commit();
            res.json({ message: 'Carrito asignado exitosamente' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('❌ Error asignando carrito:', err);
        res.status(500).json({ error: 'Error al asignar carrito' });
    }
});

// ========================================
// CARGAR INVENTARIO AL CARRITO
// ========================================
router.post('/cargar-inventario', verifyToken, isAdmin, async (req, res) => {
    const { id_carrito, productos } = req.body;
    // productos: [{ id_producto, cantidad }, ...]

    if (!id_carrito || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    try {
        const pool = await getConnection();
        const transaction = pool.transaction();

        await transaction.begin();

        try {
            // Cerrar inventario anterior
            await transaction.request()
                .input('id_carrito', id_carrito)
                .query(`
                    UPDATE Inventario_Carrito
                    SET fecha_cierre = GETDATE()
                    WHERE id_carrito = @id_carrito AND fecha_cierre IS NULL
                `);

            // Insertar nuevo inventario y descontar de stock central
            for (const prod of productos) {
                // Insertar en inventario
                await transaction.request()
                    .input('id_carrito', id_carrito)
                    .input('id_producto', prod.id_producto)
                    .input('cantidad', prod.cantidad)
                    .query(`
                        INSERT INTO Inventario_Carrito 
                        (id_carrito, id_producto, cantidad_cargada, cantidad_actual, fecha_carga)
                        VALUES (@id_carrito, @id_producto, @cantidad, @cantidad, GETDATE())
                    `);

                // Descontar de stock central
                await transaction.request()
                    .input('id_producto', prod.id_producto)
                    .input('cantidad', prod.cantidad)
                    .query(`
                        UPDATE Productos
                        SET stock_central = stock_central - @cantidad
                        WHERE id_producto = @id_producto
                    `);
            }

            await transaction.commit();
            res.json({ message: 'Inventario cargado exitosamente' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('❌ Error cargando inventario:', err);
        res.status(500).json({ error: 'Error al cargar inventario' });
    }
});

// ========================================
// CERRAR CARRITO (fin de día)
// ========================================
router.post('/cerrar/:id_carrito', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const transaction = pool.transaction();

        await transaction.begin();

        try {
            // Devolver productos sobrantes al stock central
            await transaction.request()
                .input('id_carrito', req.params.id_carrito)
                .query(`
                    UPDATE p
                    SET p.stock_central = p.stock_central + ic.cantidad_actual
                    FROM Productos p
                    INNER JOIN Inventario_Carrito ic ON p.id_producto = ic.id_producto
                    WHERE ic.id_carrito = @id_carrito AND ic.fecha_cierre IS NULL
                `);

            // Cerrar inventario
            await transaction.request()
                .input('id_carrito', req.params.id_carrito)
                .query(`
                    UPDATE Inventario_Carrito
                    SET fecha_cierre = GETDATE()
                    WHERE id_carrito = @id_carrito AND fecha_cierre IS NULL
                `);

            // Cerrar asignación
            await transaction.request()
                .input('id_carrito', req.params.id_carrito)
                .query(`
                    UPDATE Empleado_Carrito
                    SET fecha_fin = GETDATE()
                    WHERE id_carrito = @id_carrito AND fecha_fin IS NULL
                `);

            // Cambiar estado a Disponible
            await transaction.request()
                .input('id_carrito', req.params.id_carrito)
                .query("UPDATE Carritos SET estado = 'Disponible' WHERE id_carrito = @id_carrito");

            await transaction.commit();
            res.json({ message: 'Carrito cerrado exitosamente' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('❌ Error cerrando carrito:', err);
        res.status(500).json({ error: 'Error al cerrar carrito' });
    }
});

module.exports = router;