// src/public/js/trazabilidad-app.js

class TrazabilityApp {
    constructor() {
        this.inventarioTable = null;
        this.selectedRowData = null; // Almacena la fila seleccionada
        this.selectionModalElement = null; // Referencia al elemento DOM del modal
    }

    initialize() {
        this.selectionModalElement = document.getElementById('selectionModal');
        this._initInventarioTable();
        this._setupFormHandlers();
        
        // Carga inicial de la tabla (sin filtros al inicio)
        this._loadInventario(); 
    }

    // --- Inicialización de Tabla 1 (Tabulator) ---

    _initInventarioTable() {
        this.inventarioTable = new Tabulator("#inventario-table", {
            layout: "fitColumns",
            height: "400px",
            data: [], 
            columns: [
                { title: "Lote/Serie", field: "SERIE/LOTE", width: 120, headerFilter: false }, 
                { title: "Código", field: "CODIGO", width: 100, headerFilter: false },
                { title: "Artículo", field: "DESCRIPCION" },
                { title: "Fabricante", field: "FABRICANTE", width: 120 },
                { title: "Stock", field: "DISPONIBLE", hozAlign: "center", width: 80 },
                { title: "Vencimiento", field: "VCTO", hozAlign: "center", width: 100 },
                { title: "Almacén", field: "ALMACEN" },
            ],
            // Evento rowClick para mostrar el pop-up
            rowClick: (e, row) => this._handleInventarioSelection(row.getData()),
        });
    }

    // --- Manejo de Eventos del Formulario y Modal ---

    _setupFormHandlers() {
        const form = document.getElementById('search-form');
        const clearButton = document.getElementById('clear-filters');
        
        // 1. Manejo del Submit del Formulario
        form.addEventListener('submit', (e) => {
            // CRÍTICO: Previene el refresco de la página al enviar el formulario
            e.preventDefault(); 
            this._loadInventario();
        });

        // 2. Manejo del Botón Limpiar
        clearButton.addEventListener('click', () => {
            form.reset();
            this._loadInventario(); 
        });

        // 3. Manejo del Botón de Confirmación en el Modal
        document.getElementById('confirm-selection').addEventListener('click', () => {
            // Oculta el modal de la forma más sencilla: usando los atributos data-bs-*
            // Pero si usamos la API JS, lo cerramos con JS:
            const modalInstance = bootstrap.Modal.getInstance(this.selectionModalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            console.log("Rastreo iniciado para:", this.selectedRowData["SERIE/LOTE"], this.selectedRowData.CODIGO);
            alert(`Rastreo iniciado para Serie/Lote: ${this.selectedRowData["SERIE/LOTE"]} y Código: ${this.selectedRowData.CODIGO}. (Implementación de T2/T4 pendiente)`);
        });
    }

    // --- Lógica de Consulta (Fetch) ---

    async _loadInventario() {
        const form = document.getElementById('search-form');
        const searchParams = new URLSearchParams(new FormData(form));

        const url = `/api/inventario?${searchParams.toString()}`;
        console.log(`[FETCH T1] Consultando: ${url}`);

        try {
            // Pequeño indicador visual de carga (opcional)
            this.inventarioTable.setData([{id:0, CODIGO:"Cargando...", DESCRIPCION:"Consultando datos, por favor espere..."}]);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            this.inventarioTable.setData(data);
            console.log(`[FETCH T1] ✅ Datos cargados. Registros: ${data.length}`);
        } catch (error) {
            console.error(`[FETCH T1] ❌ Error al cargar Inventario:`, error);
            this.inventarioTable.clearData();
            // Mostrar mensaje de error dentro de la tabla si falla
            this.inventarioTable.setData([{id:0, CODIGO:"ERROR", DESCRIPCION:`Fallo al cargar datos: ${error.message}`}]);
        }
    }

    // --- Lógica de Interacción con Fila (Pop-up/Modal) ---

    _handleInventarioSelection(rowData) {
        this.selectedRowData = rowData; 
        
        // Extracción de datos con manejo de null/undefined
        const serieLote = rowData && rowData["SERIE/LOTE"] ? rowData["SERIE/LOTE"] : 'N/A';
        const codigo = rowData && rowData.CODIGO ? rowData.CODIGO : 'N/A';

        // 1. Llenar el Modal
        document.getElementById('modal-serie-lote').innerText = serieLote;
        document.getElementById('modal-codigo').innerText = codigo;

        // 2. Mostrar el Modal: Usamos la API de Bootstrap para inicializar y mostrar
        // Esto es lo que fallaba: debemos asegurarnos de que 'bootstrap' exista.
        if (typeof bootstrap !== 'undefined' && this.selectionModalElement) {
            // Creamos o obtenemos la instancia para poder llamar a .show()
            const myModal = new bootstrap.Modal(this.selectionModalElement);
            myModal.show();
        } else {
            console.error("Bootstrap JS no cargado o elemento modal no encontrado. Imposible mostrar el popup.");
        }
    }
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const app = new TrazabilityApp();
    app.initialize();
});


// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const app = new TrazabilityApp();
    app.initialize();
});