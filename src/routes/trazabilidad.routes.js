// src/routes/trazabilidad.routes.js

const { Router } = require('express');
const router = Router();
const controller = require('../controllers/trazabilidad.controller');

// Ruta que renderiza la vista EJS
router.get('/', (req, res) => {
    res.render('trazabilidad', { pageTitle: 'Trazabilidad de Inventario' });
});

// Rutas API para consultas a SPs
router.get('/api/inventario', controller.getInventario); 
router.get('/api/movimiento', controller.getMovimiento); // Query Params
router.get('/api/liquidacion/:numLiquidacion', controller.getLiquidacion); // Path Param
router.get('/api/ventas', controller.getVentas); // Query Params

module.exports = router;