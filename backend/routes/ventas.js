const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ========================================
// CREAR NUEVA VENTA
// ========================================
router.post('/', verifyToken, async (req, res) => {
    const { id_cliente, id_empleado, id_carrito, productos } = req.body;
    // productos: [{ id_producto, cantidad, precio_unitario }, ...]

    if (!id_cliente || !id_empleado || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    try {
        const pool = await getConnection();
        const transaction = pool.transaction();

        await transaction.begin();

        try {
            // Insertar venta
            const ventaResult = await transaction.request()
                .input('id_cliente', id_cliente)
                .input('id_empleado', id_empleado)
                .input('id_carrito', id_carrito || null)
                .query(`
                    INSERT INTO Ventas (id_cliente, id_empleado, id_carrito, fecha_venta)
                    OUTPUT INSERTED.id_venta
                    VALUES (@id_cliente, @id_empleado, @id_carrito, GETDATE())
                `);

            const id_venta = ventaResult.recordset[0].id_venta;

            // Insertar detalle y descontar inventario
            for (const prod of productos) {
                // Insertar detalle
                await transaction.request()
                    .input('id_venta', id_venta)
                    .input('id_producto', prod.id_producto)
                    .input('cantidad', prod.cantidad)
                    .input('precio_unitario', prod.precio_unitario)
                    .query(`
                        INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario)
                        VALUES (@id_venta, @id_producto, @cantidad, @precio_unitario)
                    `);

                // Descontar del inventario del carrito
                if (id_carrito) {
                    await transaction.request()
                        .input('id_carrito', id_carrito)
                        .input('id_producto', prod.id_producto)
                        .input('cantidad', prod.cantidad)
                        .query(`
                            UPDATE Inventario_Carrito
                            SET cantidad_actual = cantidad_actual - @cantidad
                            WHERE id_carrito = @id_carrito 
                              AND id_producto = @id_producto
                              AND fecha_cierre IS NULL
                        `);
                }
            }

            await transaction.commit();
            res.status(201).json({
                message: 'Venta registrada exitosamente',
                id_venta
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('❌ Error registrando venta:', err);
        res.status(500).json({ error: 'Error al registrar venta' });
    }
});

// ========================================
// VENTAS DEL EMPLEADO (día actual)
// ========================================
router.get('/mis-ventas/:id_empleado', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_empleado', req.params.id_empleado)
            .query(`
                SELECT 
                    v.id_venta,
                    v.fecha_venta,
                    c.codigo_carrito,
                    cl.nombre + ' ' + cl.apellido AS cliente,
                    SUM(dv.cantidad * dv.precio_unitario) AS total,
                    COUNT(dv.id_detalle) AS num_productos
                FROM Ventas v
                INNER JOIN Clientes cl ON v.id_cliente = cl.id_cliente
                INNER JOIN Detalle_Venta dv ON v.id_venta = dv.id_venta
                LEFT JOIN Carritos c ON v.id_carrito = c.id_carrito
                WHERE v.id_empleado = @id_empleado
                  AND CAST(v.fecha_venta AS DATE) = CAST(GETDATE() AS DATE)
                GROUP BY v.id_venta, v.fecha_venta, c.codigo_carrito, cl.nombre, cl.apellido
                ORDER BY v.fecha_venta DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error obteniendo ventas:', err);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// ========================================
// DETALLE DE UNA VENTA
// ========================================
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query(`
                SELECT 
                    p.nombre AS producto,
                    dv.cantidad,
                    dv.precio_unitario,
                    dv.cantidad * dv.precio_unitario AS subtotal
                FROM Detalle_Venta dv
                INNER JOIN Productos p ON dv.id_producto = p.id_producto
                WHERE dv.id_venta = @id
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error obteniendo detalle:', err);
        res.status(500).json({ error: 'Error al obtener detalle' });
    }
});

module.exports = router;