require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const empleadosRoutes = require('./routes/empleados');
const productosRoutes = require('./routes/productos');
const carritosRoutes = require('./routes/carritos');
const ventasRoutes = require('./routes/ventas');
const clientesRoutes = require('./routes/clientes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ========================================
// RUTAS API
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carritos', carritosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/clientes', clientesRoutes);

// ========================================
// RUTAS HTML
// ========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

app.get('/vendedor', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vendedor-dashboard.html'));
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API funcionando correctamente' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🍦  SISTEMA DE HELADERÍA - BACKEND');
    console.log('========================================');
    console.log(`✅ Servidor: http://localhost:${PORT}`);
    console.log(`📱 Login: http://localhost:${PORT}`);
    console.log(`👤 Admin: http://localhost:${PORT}/admin`);
    console.log(`🛒 Vendedor: http://localhost:${PORT}/vendedor`);
    console.log('========================================');
});

process.on('SIGINT', () => {
    console.log('\n⚠️  Cerrando servidor...');
    process.exit(0);
});