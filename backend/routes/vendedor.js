const express = require('express');
const router = express.Router();

// Ejemplo de rutas para el vendedor
router.get('/', (req, res) => {
    res.sendFile(require('path').join(__dirname, '../../frontend/vendedor-dashboard.html'));
});

module.exports = router;
