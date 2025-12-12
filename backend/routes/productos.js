const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ========================================
// LISTAR TODOS LOS PRODUCTOS
// ========================================
router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    id_producto,
                    nombre,
                    descripcion,
                    precio,
                    tipo,
                    stock_central
                FROM Productos
                ORDER BY id_producto
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error listando productos:', err);
        res.status(500).json({ error: 'Error al listar productos' });
    }
});

// ========================================
// OBTENER PRODUCTO POR ID
// ========================================
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('SELECT * FROM Productos WHERE id_producto = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('❌ Error obteniendo producto:', err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// ========================================
// CREAR NUEVO PRODUCTO
// ========================================
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { nombre, descripcion, precio, tipo, stock_central } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', nombre)
            .input('descripcion', descripcion || null)
            .input('precio', precio)
            .input('tipo', tipo || 'otro')
            .input('stock_central', stock_central || 0)
            .query(`
                INSERT INTO Productos (nombre, descripcion, precio, tipo, stock_central)
                OUTPUT INSERTED.id_producto
                VALUES (@nombre, @descripcion, @precio, @tipo, @stock_central)
            `);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            id_producto: result.recordset[0].id_producto
        });
    } catch (err) {
        console.error('❌ Error creando producto:', err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// ========================================
// ACTUALIZAR PRODUCTO
// ========================================
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { nombre, descripcion, precio, tipo, stock_central } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', req.params.id)
            .input('nombre', nombre)
            .input('descripcion', descripcion)
            .input('precio', precio)
            .input('tipo', tipo)
            .input('stock_central', stock_central)
            .query(`
                UPDATE Productos
                SET nombre = @nombre,
                    descripcion = @descripcion,
                    precio = @precio,
                    tipo = @tipo,
                    stock_central = @stock_central
                WHERE id_producto = @id
            `);

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (err) {
        console.error('❌ Error actualizando producto:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// ========================================
// ELIMINAR PRODUCTO
// ========================================
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', req.params.id)
            .query('DELETE FROM Productos WHERE id_producto = @id');

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (err) {
        console.error('❌ Error eliminando producto:', err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// ========================================
// INVENTARIO DEL EMPLEADO (para vendedor)
// ========================================
router.get('/mi-inventario/:id_empleado', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_empleado', req.params.id_empleado)
            .query(`
                SELECT 
                    p.id_producto,
                    p.nombre,
                    p.precio,
                    p.tipo,
                    ic.cantidad_actual AS stock
                FROM Inventario_Carrito ic
                INNER JOIN Productos p ON ic.id_producto = p.id_producto
                INNER JOIN Carritos c ON ic.id_carrito = c.id_carrito
                INNER JOIN Empleado_Carrito ec ON c.id_carrito = ec.id_carrito
                WHERE ec.id_empleado = @id_empleado
                  AND ec.fecha_fin IS NULL
                  AND ic.fecha_cierre IS NULL
                  AND ic.cantidad_actual > 0
                ORDER BY p.nombre
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error obteniendo inventario:', err);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

module.exports = router;