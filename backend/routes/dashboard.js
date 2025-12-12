const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ========================================
// STATS DEL DASHBOARD
// ========================================
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();

        // Carritos activos (estado = 'Activo')
        const carritosRes = await pool.request()
            .query("SELECT COUNT(*) AS total FROM Carritos WHERE estado = 'Activo'");

        // Ventas del día (total y suma)
        const ventasRes = await pool.request()
            .query(`
                SELECT 
                    COUNT(*) AS totalVentas,
                    ISNULL(SUM(dv.cantidad * dv.precio_unitario), 0) AS ingresos
                FROM Ventas v
                INNER JOIN Detalle_Venta dv ON v.id_venta = dv.id_venta
                WHERE CAST(v.fecha_venta AS DATE) = CAST(GETDATE() AS DATE)
            `);

        // Productos totales
        const productosRes = await pool.request()
            .query('SELECT COUNT(*) AS total FROM Productos');

        // Empleados activos (asumiendo que hay columna 'activo' en Empleados o en Usuarios)
        const empleadosRes = await pool.request()
            .query(`
                SELECT COUNT(DISTINCT u.id_empleado) AS total 
                FROM Usuarios u
                WHERE u.activo = 1 AND u.id_empleado IS NOT NULL
            `);

        res.json({
            carritosActivos: carritosRes.recordset[0]?.total || 0,
            ventasHoy: ventasRes.recordset[0]?.totalVentas || 0,
            ingresosHoy: ventasRes.recordset[0]?.ingresos || 0,
            productos: productosRes.recordset[0]?.total || 0,
            empleadosActivos: empleadosRes.recordset[0]?.total || 0
        });

    } catch (err) {
        console.error('❌ Error cargando stats:', err);
        res.status(500).json({
            carritosActivos: 0,
            ventasHoy: 0,
            ingresosHoy: 0,
            productos: 0,
            empleadosActivos: 0,
            error: 'Error al cargar estadísticas'
        });
    }
});

// ========================================
// VENTAS RECIENTES (últimas 5)
// ========================================
router.get('/ventasRecientes', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT TOP 5 
                    v.id_venta, 
                    c.codigo_carrito, 
                    v.fecha_venta,
                    SUM(dv.cantidad * dv.precio_unitario) AS total
                FROM Ventas v
                LEFT JOIN Carritos c ON v.id_carrito = c.id_carrito
                INNER JOIN Detalle_Venta dv ON v.id_venta = dv.id_venta
                GROUP BY v.id_venta, c.codigo_carrito, v.fecha_venta
                ORDER BY v.fecha_venta DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error cargando ventas recientes:', err);
        res.status(500).json([]);
    }
});

// ========================================
// CARRITOS EN RUTA
// ========================================
router.get('/carritosRuta', verifyToken, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    c.id_carrito, 
                    c.codigo_carrito, 
                    c.ubicacion,
                    e.nombre + ' ' + e.apellido AS empleado
                FROM Carritos c
                LEFT JOIN Empleado_Carrito ec ON c.id_carrito = ec.id_carrito AND ec.fecha_fin IS NULL
                LEFT JOIN Empleados e ON ec.id_empleado = e.id_empleado
                WHERE c.estado = 'Activo'
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error cargando carritos en ruta:', err);
        res.status(500).json([]);
    }
});

module.exports = router;