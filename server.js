// server.js

const express = require('express');
// 🚨 1. Importar la librería
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const config = require('./config/config');
const trazabilidadRoutes = require('./src/routes/trazabilidad.routes'); // Usamos el nuevo router

// Inicialización
const app = express();

// 1. Configuraciones de la Aplicación
app.set('port', config.port);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// 2. Middlewares (para procesar solicitudes)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// 🚨 2. Usar el middleware de layouts
app.use(expressLayouts); 
// 🚨 Opcional: Especificar que el archivo de layout principal es 'layout.ejs' (es el default, pero es buena práctica)
app.set('layout', 'layout');
// 3. Archivos Estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'src', 'public')));

// 4. Rutas (Uso del router centralizado)
app.use('/', trazabilidadRoutes);

// 5. Iniciar Servidor
app.listen(app.get('port'), () => {
    console.log(`[SERVER] 🚀 Servidor iniciado en http://localhost:${app.get('port')}`);
});