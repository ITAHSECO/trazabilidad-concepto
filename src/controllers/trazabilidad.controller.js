// src/controllers/trazabilidad.controller.js
const dbService = require('../services/db.service');
const controller = {};

// SP 1: Inventario (dbo.TRZ_p1) - Tabla Maestra
controller.getInventario = async (req, res) => {
    try {
        console.log('[API] Solicitud: /api/inventario');
        const inventario = await dbService.executeSp('dbo.TRZ_p1'); 
        res.json(inventario);
    } catch (error) {
        console.error('[API] Error en getInventario:', error);
        res.status(500).json({ error: 'Fallo al obtener Inventario (TRZ_p1).' });
    }
};

// SP 2: Movimientos (dbo.TRZ_movimientoDetalle) - Usa SerieLote y CODIGO
controller.getMovimiento = async (req, res) => {
    const { serieLote, codigo } = req.query; 

    if (!serieLote || !codigo) {
        return res.status(400).json({ error: 'Faltan parámetros SerieLote o CODIGO para movimientos.' });
    }

    try {
        console.log(`[API] Solicitud: /api/movimiento. Lote: ${serieLote}, Código: ${codigo}`);
        const movimientos = await dbService.executeSp('dbo.TRZ_movimientoDetalle', {
            SerieLote: serieLote, 
            CODIGO: codigo
        });
        res.json(movimientos);
    } catch (error) {
        console.error('[API] Error en getMovimiento:', error);
        res.status(500).json({ error: `Fallo al obtener movimientos (TRZ_movimientoDetalle).` });
    }
};

// SP 3: Liquidación (dbo.TRZ_liquidacionDetalle) - Usa NUM_LIQUIDACION
controller.getLiquidacion = async (req, res) => {
    const { numLiquidacion } = req.params; 

    try {
        console.log(`[API] Solicitud: /api/liquidacion. N° Liquidación: ${numLiquidacion}`);
        const liquidacion = await dbService.executeSp('dbo.TRZ_liquidacionDetalle', {
            NUM_LIQUIDACION: numLiquidacion 
        });
        res.json(liquidacion);
    } catch (error) {
        console.error('[API] Error en getLiquidacion:', error);
        res.status(500).json({ error: `Fallo al obtener liquidación (TRZ_liquidacionDetalle).` });
    }
};

// SP 4: Ventas (dbo.TRZ_ventaDetalle) - Usa SerieLote y CODIGO
controller.getVentas = async (req, res) => {
    const { serieLote, codigo } = req.query; 

    if (!serieLote || !codigo) {
        return res.status(400).json({ error: 'Faltan parámetros SerieLote o CODIGO para ventas.' });
    }
    
    try {
        console.log(`[API] Solicitud: /api/ventas. Lote: ${serieLote}, Código: ${codigo}`);
        const ventas = await dbService.executeSp('dbo.TRZ_ventaDetalle', {
            SerieLote: serieLote, 
            CODIGO: codigo
        });
        res.json(ventas);
    } catch (error) {
        console.error('[API] Error en getVentas:', error);
        res.status(500).json({ error: `Fallo al obtener ventas (TRZ_ventaDetalle).` });
    }
};

module.exports = controller;