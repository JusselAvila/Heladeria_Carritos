require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
// ========================================
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

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API funcionando correctamente' });
});

// ========================================
// RUTAS PARA SERVIR LOS HTML
// ========================================

// Página principal (Login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));  // ✅ CORREGIDO
});

// Dashboard Admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));  // ✅ CORREGIDO
});

// Dashboard Vendedor
app.get('/vendedor', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vendedor-dashboard.html'));  // ✅ CORREGIDO
});

// ========================================
// MANEJO DE ERRORES 404
// ========================================
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
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

// Manejo de cierre
process.on('SIGINT', () => {
    console.log('\n⚠️  Cerrando servidor...');
    process.exit(0);
});