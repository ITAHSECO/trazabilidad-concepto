// src/controllers/trazabilidad.controller.js
const dbService = require('../services/db.service');
const controller = {};

// SP 1: Inventario (dbo.TRZ_p1) - Tabla Maestra
controller.getInventario = async (req, res) => {
    try {
        console.log('[API] Solicitud: /api/inventario con filtros:', req.query);
        
        // Extraemos TODOS los parámetros del Query String (enviados por el formulario)
        const params = req.query; 

        // Ejecutamos el SP TRZ_p1 con todos los parámetros recibidos.
        const inventario = await dbService.executeSp('dbo.TRZ_p1', {
            AlmacenNombre: params.AlmacenNombre || null,
            FabricanteNombre: params.FabricanteNombre || null,
            CodigoArticulo: params.CodigoArticulo || null,
            Descripcion: params.Descripcion || null,
            SerieLote: params.SerieLote || null,
            // Convertimos a INT si existe, si no, es NULL (necesario para la definición del SP)
            StockDisponible: params.StockDisponible ? parseInt(params.StockDisponible) : null 
        }); 
        res.json(inventario);
    } catch (error) {
        console.error('[API] Error en getInventario:', error);
        res.status(500).json({ error: 'Fallo al obtener Inventario (TRZ_p1).' });
    }
};

// 🚨 Dejamos las otras funciones vacías/con error temporalmente, ya que solo implementamos T1
controller.getMovimiento = async (req, res) => {
    res.status(501).json({ error: 'Tabla 2 (Movimiento) no implementada en este paso.' });
};

controller.getLiquidacion = async (req, res) => {
    res.status(501).json({ error: 'Tabla 3 (Liquidación) no implementada en este paso.' });
};

controller.getVentas = async (req, res) => {
    res.status(501).json({ error: 'Tabla 4 (Ventas) no implementada en este paso.' });
};

module.exports = controller;