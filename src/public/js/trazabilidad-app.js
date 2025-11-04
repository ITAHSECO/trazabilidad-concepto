// src/public/js/trazabilidad-app.js

class TrazabilityApp {
    constructor() {
        this.inventarioTable = null;
        this.movimientoTable = null; // Tabla de Movimiento de Lote (TRZ_p2)
        this.liquidacionTable = null; // Tabla de Liquidación (TRZ_p3)
        this.ventasTable = null;     // Tabla de Ventas de Lote (TRZ_p4)
        this.selectedRowData = null; 
        this.selectionModalElement = null;
        this.inventarioTableElement = null; 
        this.initialLiquidationNum = null; // Para guardar el NUM_LIQUIDACION del ingreso inicial.
        this.tracingResultsContainer = null; // Contenedor de las tablas de rastreo (T2, T3, T4)
    }

    initialize() {
        this.selectionModalElement = document.getElementById('selectionModal');
        this.inventarioTableElement = document.getElementById('inventario-table');
        this.tracingResultsContainer = document.getElementById('tracing-results-container');
        
        this._initInventarioTable();
        this._initMovimientoTable(); // Inicialización de T2
        this._initLiquidacionTable(); // Inicialización de T3
        this._initVentasTable();     // Inicialización de T4
        this._setupFormHandlers();
        
        // La búsqueda inicial está desactivada, se espera el clic del usuario.
    }

    // --- Inicialización de Tabla 1: Inventario (TRZ_p1) ---

    _initInventarioTable() {
        this.inventarioTable = new Tabulator("#inventario-table", {
            layout: "fitColumns",
            height: "400px",
            data: [], 
            placeholder: "Realice una búsqueda o espere a la carga inicial...", 
            columns: [
                { title: "Lote/Serie", field: "SERIE/LOTE", width: 120, headerFilter: false }, 
                { title: "Código", field: "CODIGO", width: 100, headerFilter: false },
                { title: "Artículo", field: "DESCRIPCION" },
                { title: "Fabricante", field: "FABRICANTE", width: 120 },
                { title: "Stock", field: "DISPONIBLE", hozAlign: "center", width: 80 },
                { title: "Vencimiento", field: "VCTO", hozAlign: "center", width: 100 },
                { title: "Almacén", field: "ALMACEN" },
            ],
        });
        
        // Registro de eventos de clic después de que la tabla se construye
        this.inventarioTable.on("tableBuilt", () => {
             this._setupTableEvents();
        });
    }

    // --- Inicialización de Tabla 2: Movimiento de Lote (TRZ_p2) ---

    _initMovimientoTable() {
        this.movimientoTable = new Tabulator("#movimiento-table", {
            layout: "fitColumns",
            height: "300px",
            data: [], 
            placeholder: "Seleccione un artículo de Inventario para ver el Movimiento de Lote.", 
            columns: [
                // Columnas ajustadas para el SP TRZ_movimiento
                { title: "Fecha Mov.", field: "FECHA_MOVIMIENTO", width: 100 }, 
                { title: "Tipo Doc.", field: "TIPO_DOC_COD", width: 100 },
                { title: "N° Documento", field: "NUM_DOCUMENTO" },
                { title: "Cantidad", field: "CANTIDAD_MOVIMIENTO", hozAlign: "right" },
                { title: "Almacén/Ubicación", field: "NOMBRE_ALMACEN" },
                { title: "Usuario", field: "USUARIO_CREACION" },
                { title: "NUM_LIQUIDACION", field: "NUM_LIQUIDACION", visible: false }, 
                { title: "ES_INGRESO_INICIAL", field: "ES_INGRESO_INICIAL", visible: false },
            ],
        });
    }

    // --- Inicialización de Tabla 3: Liquidación (TRZ_liquidacion) ---

    _initLiquidacionTable() {
        this.liquidacionTable = new Tabulator("#liquidacion-table", {
            layout: "fitColumns",
            height: "300px",
            data: [], 
            placeholder: "La Liquidación se cargará automáticamente después del Movimiento de Lote.", 
            columns: [
                // ** COLUMNAS ACTUALIZADAS para TRZ_liquidacion **
                { title: "Orden Compra", field: "ORDEN_COMPRA", width: 120 },
                { title: "N° Liquidación", field: "NUM_LIQUIDACION", width: 150 },
                { title: "Fecha Liquidación", field: "FECHA_LIQUIDACION", width: 120 },
                { title: "Tipo Gasto", field: "TIPO_GASTO_COD", width: 100 },
                { title: "N° Documento", field: "NUM_DOCUMENTO_ASOCIADO" },
                { title: "Costo (USD)", field: "COSTO_USD", hozAlign: "right", width: 100 },
                { title: "Costo (MN)", field: "COSTO_MN", hozAlign: "right", width: 100 },
                { title: "Cód. Artículo", field: "CODIGO_ARTICULO", visible: false },
            ],
        });
    }

    // --- Inicialización de Tabla 4: Ventas de Lote (TRZ_venta) ---

    _initVentasTable() {
        this.ventasTable = new Tabulator("#ventas-table", {
            layout: "fitColumns",
            height: "300px",
            data: [], 
            placeholder: "Seleccione un artículo de Inventario para ver las Ventas de Lote.", 
            columns: [
                 // ** COLUMNAS ACTUALIZADAS para TRZ_venta **
                { title: "Fecha Creación", field: "FECHA_CREACION", width: 120 },
                { title: "Tipo Doc.", field: "TIPO_DOC_COD", width: 100 },
                { title: "N° Doc. Serie", field: "NUM_SERIE_DOC", width: 100 },
                { title: "N° Doc.", field: "NUM_DOCUMENTO" },
                { title: "Cliente", field: "CLIENTE" },
                { title: "Cantidad Vendida", field: "CANTIDAD_VENDIDA", hozAlign: "right" },
                { title: "Cantidad Devuelta", field: "CANTIDAD_DEVUELTA", hozAlign: "right" },
                { title: "Usuario", field: "USUARIO_CREACION" },
                { title: "Cód. Almacén", field: "COD_ALMACEN", visible: false },
                { title: "Cód. Artículo", field: "CODIGO_ARTICULO", visible: false },
                { title: "Serie/Lote", field: "SERIE_LOTE", visible: false },
            ],
        });
    }


    // --- Configuración de Eventos (rowClick) ---

    _setupTableEvents() {
        console.log("[TRZ_p1] ✅ Tabulator Built. Setting up rowClick listener.");
        
        let modalInstance = null; 

        try {
            // 1. Instanciamos el Modal de Bootstrap UNA SOLA VEZ
            if (this.selectionModalElement && typeof bootstrap !== 'undefined') {
                modalInstance = new bootstrap.Modal(this.selectionModalElement);
            } else {
                console.error("[TRZ_p1] ❌ Bootstrap JS o elemento modal no disponible.");
            }
        } catch (error) {
            // Capturamos si la creación del modal falla por un problema de Bootstrap
            console.error("[TRZ_p1] ❌ Error al inicializar new bootstrap.Modal():", error);
        }

        // 2. Registramos el rowClick
        if (this.inventarioTable) {
            this.inventarioTable.on("rowClick", (e, row) => {
                console.log("[TRZ_p1] 🚨 Tabulator rowClick Fired.");
                this._handleInventarioSelection(row.getData(), modalInstance);
            });
        }
    }


    // --- Manejo de Eventos del Formulario y Modal ---

    _setupFormHandlers() {
        const form = document.getElementById('search-form');
        const clearButton = document.getElementById('clear-filters');
        
        // 1. Manejo del Submit del Formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            this._loadInventario();
        });

        // 2. Manejo del Botón Limpiar
        clearButton.addEventListener('click', () => {
            form.reset();
            
            // OCULTAR CONTENEDOR DE RASTREO (T2, T3, T4)
            if (this.tracingResultsContainer) {
                this.tracingResultsContainer.style.display = 'none';
            }

            // Limpiar también las tablas de rastreo al limpiar filtros
            this.movimientoTable.clearData();
            this.liquidacionTable.clearData(); // Limpiar T3
            this.ventasTable.clearData();
            this.initialLiquidationNum = null; // Limpiar liquidación inicial
            this._loadInventario(); 
        });

        // 3. Manejo del Botón de Confirmación en el Modal (Iniciar Rastreo)
        document.getElementById('confirm-selection').addEventListener('click', () => {
            const modalInstance = bootstrap.Modal.getInstance(this.selectionModalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            // 🚨 ACCIÓN: Cargar las tablas de rastreo (T2, T3 y T4)
            this._loadTracingData();
        });
    }

    // --- Lógica de Consulta (Fetch) T1 ---

    async _loadInventario() {
        const form = document.getElementById('search-form');
        const searchParams = new URLSearchParams(new FormData(form));

        const url = `/api/inventario?${searchParams.toString()}`;
        console.log(`[FETCH T1] Consultando: ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            this.inventarioTable.setData(data);
            console.log(`[FETCH T1] ✅ Datos cargados. Registros: ${data.length}`);
        } catch (error) {
            console.error(`[FETCH T1] ❌ Error al cargar Inventario:`, error);
            this.inventarioTable.clearData();
            this.inventarioTable.setPlaceholder("Error de conexión o servidor. Revise la consola."); 
        }
    }

    // --- Lógica de Interacción con Fila (Pop-up/Modal) ---

    _handleInventarioSelection(rowData, modalInstance) {
        console.log("[TRZ_p1] Fila seleccionada (rowData):", rowData);

        this.selectedRowData = rowData; 
        
        // Extracción de datos para BÚSQUEDA (CRÍTICO: SERIE/LOTE y CODIGO)
        const serieLote = rowData && rowData["SERIE/LOTE"] ? rowData["SERIE/LOTE"] : 'N/A';
        const codigo = rowData && rowData.CODIGO ? rowData.CODIGO : 'N/A';
        
        // Extracción de datos para VISUALIZACIÓN EN MODAL (NUEVOS CAMPOS)
        const descripcion = rowData && rowData.DESCRIPCION ? rowData.DESCRIPCION : 'N/A';
        const fabricante = rowData && rowData.FABRICANTE ? rowData.FABRICANTE : 'N/A';

        console.log(`[TRZ_p1] Extracción de datos: Serie/Lote=${serieLote}, Código=${codigo}, Descripción=${descripcion}, Fabricante=${fabricante}`);

        // Función auxiliar para establecer innerText de forma segura
        const setInnerText = (id, text) => {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = text;
            } else {
                // Advertencia en consola si el ID no existe en el HTML
                console.warn(`[TRZ_p1] Advertencia: Elemento HTML con ID '${id}' no encontrado.`);
            }
        };

        // 1. Llenar el Modal (Usando la función segura)
        setInnerText('modal-serie-lote', serieLote);
        setInnerText('modal-codigo', codigo);
        setInnerText('modal-descripcion', descripcion); 
        setInnerText('modal-fabricante', fabricante); 


        // 2. Mostrar el Modal
        if (modalInstance) {
            modalInstance.show();
        } else {
            console.error("No se pudo obtener la instancia del modal. ¿Se ejecutó _setupTableEvents?");
        }
    }
    
    // --- Lógica de Consulta de Rastreo (Fetch) T2, T3 y T4 ---

    async _fetchDataWithLoading(table, url, logPrefix, tableName) {
        console.log(`${logPrefix} Consultando: ${url}`);
        
        // Mostrar indicador de carga
        table.setData([{id:0, FECHA_MOVIMIENTO: "Cargando...", NOMBRE_CLIENTE: `Consultando datos de ${tableName}, por favor espere...`}]);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data; // Retorna los datos crudos
        } catch (error) {
            console.error(`${logPrefix} ❌ Error al cargar ${tableName}:`, error);
            table.clearData();
            table.setPlaceholder("Error al cargar datos. Revise la conexión/servidor."); 
            return null;
        }
    }
    
    // Método específico para la lógica de Movimiento (T2)
    async _loadMovimientoData(serieLote, codigo) {
        // Uso de parámetros ya recortados (trimmed)
        const url = `/api/movimiento?serieLote=${serieLote}&codigo=${codigo}`;
        const logPrefix = "[FETCH T2]";
        const tableName = "Movimiento de Lote";
        
        // 1. Fetch y manejo de loading/errores
        const rawData = await this._fetchDataWithLoading(this.movimientoTable, url, logPrefix, tableName);

        if (!rawData) {
            this.movimientoTable.clearData();
            return;
        }
        
        // 2. Procesamiento de datos: Extracción del NUM_LIQUIDACION inicial
        this.initialLiquidationNum = null;
        
        // El SP devuelve '1' para el ingreso inicial
        const initialMovement = rawData.find(row => row.ES_INGRESO_INICIAL === 1 || row.ES_INGRESO_INICIAL === '1'); 
        
        if (initialMovement) {
            this.initialLiquidationNum = initialMovement.NUM_LIQUIDACION;
            console.log(`[TRZ_p2] ✅ NUM_LIQUIDACION inicial extraído: ${this.initialLiquidationNum}`);
        } else {
            console.warn("[TRZ_p2] ⚠️ No se encontró el registro de Ingreso Inicial (ES_INGRESO_INICIAL = 1).");
        }
        
        // 3. Setear los datos en la tabla
        this.movimientoTable.setData(rawData);
        console.log(`${logPrefix} ✅ Datos cargados. Registros: ${rawData.length}`);
    }

    // Método específico para la lógica de Liquidación (T3)
    async _loadLiquidacionData(codigoArticulo) { // Ahora recibe codigoArticulo
        const liquidacionNum = this.initialLiquidationNum;
        const displayElement = document.getElementById('liquidacion-num-display');
        
        // 1. Mostrar el número de liquidación en el título de T3
        if (displayElement) {
            displayElement.innerText = liquidacionNum || 'N/A (No Inicial)';
        }

        if (!liquidacionNum) {
            this.liquidacionTable.setPlaceholder("No se requiere rastreo de Liquidación (No hay número de liquidación inicial).");
            this.liquidacionTable.clearData();
            return;
        }
        
        // ** CAMBIO CRÍTICO: Se pasan los dos parámetros requeridos por TRZ_liquidacion **
        const url = `/api/liquidacion?numLiq=${liquidacionNum}&codigoArticulo=${codigoArticulo}`;
        const logPrefix = "[FETCH T3]";
        const tableName = "Liquidación";

        // 2. Carga genérica (asumiendo que T3 está implementada en el servidor)
        const data = await this._fetchDataWithLoading(this.liquidacionTable, url, logPrefix, tableName);
        
        if (data) {
            this.liquidacionTable.setData(data);
            console.log(`${logPrefix} ✅ Datos cargados. Registros: ${data.length}`);
        }
    }


    // Método genérico para la carga de otras tablas de rastreo (T4)
    async _loadGenericTracingData(table, url, logPrefix, tableName) {
        const data = await this._fetchDataWithLoading(table, url, logPrefix, tableName);
        
        if (data) {
            table.setData(data);
            console.log(`${logPrefix} ✅ Datos cargados. Registros: ${data.length}`);
        }
    }

    
    async _loadTracingData() {
        if (!this.selectedRowData) {
            console.error("[TRZ] No hay fila seleccionada para rastrear.");
            return;
        }
        
        // MOSTRAR CONTENEDOR DE RASTREO (T2, T3, T4)
        if (this.tracingResultsContainer) {
             this.tracingResultsContainer.style.display = 'block';
        }

        // 🚨 TRIMEO CRÍTICO: Elimina los espacios en blanco de los campos CHAR
        const serieLote = this.selectedRowData["SERIE/LOTE"].trim(); 
        const codigo = this.selectedRowData.CODIGO.trim();

        console.log(`[TRZ] Iniciando rastreo para Lote/Serie: ${serieLote}, Código: ${codigo}`);

        // 1. Carga de T2: Movimiento de Lote (Establece this.initialLiquidationNum)
        await this._loadMovimientoData(serieLote, codigo);
        
        // 2. Carga de T3: Liquidación (Usa this.initialLiquidationNum y el Código)
        await this._loadLiquidacionData(codigo); // Se pasa el código
        
        // 3. Carga de T4: Ventas de Lote
        await this._loadGenericTracingData(
            this.ventasTable,
            `/api/ventas?serieLote=${serieLote}&codigo=${codigo}`,
            "[FETCH T4]",
            "Ventas de Lote"
        );
    }
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const app = new TrazabilityApp();
    app.initialize();
});
