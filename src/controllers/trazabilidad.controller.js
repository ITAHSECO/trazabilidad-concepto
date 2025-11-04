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

// SP 2: Movimiento de Lote (dbo.TRZ_p2) 
controller.getMovimiento = async (req, res) => {
    try {
        // Los parámetros ya vienen recortados desde el cliente (serieLote, codigo)
        const serieLote = req.query.serieLote;
        const codigo = req.query.codigo;
        
        console.log(`[API] Solicitud: /api/movimiento (T2) para Lote: ${serieLote}, Código: ${codigo}`);

        if (!serieLote || !codigo) {
            return res.status(400).json({ error: 'Parámetros serieLote y codigo son requeridos.' });
        }

        // Ejecutamos el SP TRZ_p2 (o el nombre real del SP de movimiento, que asumimos es TRZ_p2 por el flujo)
        const movimiento = await dbService.executeSp('dbo.TRZ_movimiento', {
            SerieLote: serieLote,
            CodigoArticulo: codigo
        });
        
        res.json(movimiento);
    } catch (error) {
        console.error('[API] Error en getMovimiento (T2):', error);
        res.status(500).json({ error: 'Fallo al obtener Movimiento de Lote (TRZ_p2).' });
    }
};

// SP 3: Liquidación (dbo.TRZ_liquidacion) - Llama al nuevo SP
controller.getLiquidacion = async (req, res) => {
    try {
        const numLiq = req.query.numLiq;
        const codigoArticulo = req.query.codigoArticulo; // Nuevo parámetro
        
        console.log(`[API] Solicitud: /api/liquidacion (T3) para N° Liquidación: ${numLiq}, Código: ${codigoArticulo}`);

        if (!numLiq || !codigoArticulo) {
            return res.status(400).json({ error: 'Parámetros numLiq y codigoArticulo son requeridos.' });
        }
        
        // ** CAMBIO CRÍTICO: Se usa el nombre del SP 'TRZ_liquidacion' y se envían los dos parámetros. **
        const liquidacion = await dbService.executeSp('dbo.TRZ_liquidacion', {
            NumLiq: numLiq,
            CodigoArticulo: codigoArticulo
        });
        
        res.json(liquidacion);
    } catch (error) {
        console.error('[API] Error en getLiquidacion (T3):', error);
        res.status(500).json({ error: 'Fallo al obtener Liquidación (TRZ_liquidacion).' });
    }
};

// SP 4: Ventas (dbo.TRZ_venta) - Llama al nuevo SP
controller.getVentas = async (req, res) => {
    try {
        // Los parámetros ya vienen recortados desde el cliente (serieLote, codigo)
        const serieLote = req.query.serieLote;
        const codigo = req.query.codigo;

        console.log(`[API] Solicitud: /api/ventas (T4) para Lote: ${serieLote}, Código: ${codigo}`);
        
        if (!serieLote || !codigo) {
            return res.status(400).json({ error: 'Parámetros serieLote y codigo son requeridos.' });
        }

        // ** CAMBIO CRÍTICO: Se usa el nombre del SP 'TRZ_venta' **
        const ventas = await dbService.executeSp('dbo.TRZ_venta', {
            SerieLote: serieLote,
            CodigoArticulo: codigo
        });
        
        res.json(ventas);
    } catch (error) {
        console.error('[API] Error en getVentas (T4):', error);
        res.status(500).json({ error: 'Fallo al obtener Ventas de Lote (TRZ_venta).' });
    }
};

module.exports = controller;
