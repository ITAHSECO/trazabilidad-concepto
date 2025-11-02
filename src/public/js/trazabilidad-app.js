// src/public/js/trazabilidad-app.js

class TrazabilityApp {
    constructor() {
        this.inventarioTable = null;
        this.movimientoTable = null;
        this.liquidacionTable = null;
        this.ventasTable = null;
    }

    initialize() {
        this._initInventarioTable();
        this._initMovimientoTable();
        this._initLiquidacionTable();
        this._initVentasTable();
    }

    // --- Inicialización de Tablas ---

    _initInventarioTable() {
        this.inventarioTable = new Tabulator("#inventario-table", {
            ajaxURL: "/api/inventario",
            layout: "fitColumns",
            height: "250px",
            columns: [
                // **AJUSTA ESTOS CAMPOS (field) A TUS COLUMNAS DE SQL**
                { title: "Almacen", field: "ALMACEN", width: 150},
                { title: "Fabricante", field: "FABRICANTE", width: 150},
                { title: "Lote", field: "SERIE/LOTE", width: 100, headerFilter: true },
                { title: "Código", field: "CODIGO", width: 100, headerFilter: true },
                { title: "Artículo", field: "DESCRIPCION" },
                { title: "Stock", field: "DISPONIBLE", hozAlign: "center" },
                { title: "Vencimiento", field: "VCTO", hozAlign: "center" }
            ],
            rowClick: (e, row) => this._handleInventarioSelection(row.getData()),
        });
    }

    _initMovimientoTable() {
        this.movimientoTable = new Tabulator("#movimiento-table", {
            data: [], // Vacía inicialmente
            layout: "fitColumns",
            height: "200px",
            columns: [
                // **AJUSTA ESTOS CAMPOS (field)**
                { title: "TIPO", field: "TIPO_DOC_COD" },
                { title: "Fecha", field: "FECHA_MOVIMIENTO", hozAlign: "center" },
                { title: "Num. Liq.", field: "NUM_LIQUIDACION", hozAlign: "center" }, // CRÍTICO
                { title: "N° Documento", field: "NUM_DOCUMENTO" },
            ],
            rowClick: (e, row) => this._handleMovimientoSelection(row.getData()),
        });
    }

    _initLiquidacionTable() {
        this.liquidacionTable = new Tabulator("#liquidacion-table", {
            data: [], // Vacía inicialmente
            layout: "fitColumns",
            height: "200px",
            columns: [
                // **AJUSTA ESTOS CAMPOS (field)**
                { title: "Documento", field: "TIPO_DOC" },
                { title: "Costo Total", field: "COSTO_TOTAL", formatter: "money" },
                { title: "Proveedor", field: "PROVEEDOR" },
            ],
        });
    }

    _initVentasTable() {
        this.ventasTable = new Tabulator("#ventas-table", {
            data: [], // Vacía inicialmente
            layout: "fitColumns",
            height: "200px",
            columns: [
                // **AJUSTA ESTOS CAMPOS (field)**
                { title: "N° Venta", field: "NUM_VENTA", width: 100 },
                { title: "Cliente", field: "CLIENTE" },
                { title: "Cantidad", field: "CANTIDAD", hozAlign: "center" },
                { title: "Fecha Venta", field: "FECHA_VENTA", hozAlign: "center" },
            ],
        });
    }

    // --- Manejo de Eventos de Selección (Flujo de Trazabilidad) ---

    /**
     * T1 (Inventario) Seleccionado: Dispara T2 (Movimientos) y T4 (Ventas).
     */
    async _handleInventarioSelection(inventarioData) {
        const serieLote = inventarioData.SerieLote;
        const codigo = inventarioData.CODIGO;

        if (!serieLote || !codigo) {
            console.error("[T1] Datos incompletos en la fila seleccionada.");
            return;
        }

        console.log(`[T1] Rastreando: Lote=${serieLote}, Código=${codigo}`);
        document.getElementById('trazado-id-title').innerText = `${serieLote} / ${codigo}`;
        
        // 1. Limpiar T3 y T4
        this.movimientoTable.clearData();
        this.liquidacionTable.clearData();
        this.ventasTable.clearData();
        document.getElementById('liquidacion-id-title').innerText = 'N/A';

        // 2. Cargar T2 (Movimientos)
        const urlMov = `/api/movimiento?serieLote=${serieLote}&codigo=${codigo}`;
        this._loadTable(this.movimientoTable, urlMov, 'Movimientos (T2)');

        // 3. Cargar T4 (Ventas) - Flujo paralelo
        const urlVentas = `/api/ventas?serieLote=${serieLote}&codigo=${codigo}`;
        this._loadTable(this.ventasTable, urlVentas, 'Ventas (T4)');
    }

    /**
     * T2 (Movimientos) Seleccionado: Dispara T3 (Liquidación) usando NUM_LIQUIDACION.
     */
    async _handleMovimientoSelection(movimientoData) {
        const numLiquidacion = movimientoData.NUM_LIQUIDACION;

        if (!numLiquidacion) {
            console.warn("[T2] Fila seleccionada no contiene NUM_LIQUIDACION. Limpiando T3.");
            this.liquidacionTable.clearData();
            document.getElementById('liquidacion-id-title').innerText = 'N/A';
            return;
        }

        console.log(`[T2] Rastreando Liquidación N°: ${numLiquidacion}`);
        document.getElementById('liquidacion-id-title').innerText = numLiquidacion;
        
        // 1. Cargar T3 (Liquidación)
        const urlLiq = `/api/liquidacion/${numLiquidacion}`;
        this._loadTable(this.liquidacionTable, urlLiq, 'Liquidación (T3)');
    }

    /**
     * Función genérica para cargar datos en una tabla.
     */
    async _loadTable(tableInstance, url, tableDescription) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            tableInstance.setData(data);
            console.log(`[FETCH] ✅ Datos cargados en ${tableDescription}. Registros: ${data.length}`);
        } catch (error) {
            console.error(`[FETCH] ❌ Error al cargar ${tableDescription}:`, error);
            tableInstance.clearData();
        }
    }
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const app = new TrazabilityApp();
    app.initialize();
});