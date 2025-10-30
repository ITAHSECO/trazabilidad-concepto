// src/services/db.service.js
const sql = require('mssql');
const config = require('../../config/config');

const pool = new sql.ConnectionPool(
    {...config.db,
        requestTimeout: 60000
    });
let connection;

/**
 * Establece la conexión con la base de datos.
 */
async function connect() {
    try {
        if (!connection || !connection.connected) {
            console.log('[DB] 🔗 Intentando conectar a la base de datos...');
            connection = await pool.connect();
            console.log('[DB] ✅ Conexión exitosa a la base de datos.');
        }
        return connection;
    } catch (err) {
        console.error(`[DB] ❌ ERROR de conexión a la base de datos: ${err.message}`);
        throw new Error('Fallo la conexión a la base de datos.');
    }
}

/**
 * Ejecuta un Stored Procedure y retorna los resultados.
 * @param {string} spName Nombre del Stored Procedure.
 * @param {Object} parameters Objeto de parámetros { name: value }.
 * @returns {Promise<Array>} El resultado de la consulta.
 */
async function executeSp(spName, parameters = {}) {
    await connect(); // Asegura que la conexión esté activa

    try {
        const request = pool.request();
        
        console.log(`[SP] 📞 Ejecutando ${spName} con params:`, parameters);
        
        // Agregar parámetros al request
        for (const name in parameters) {
            // Asumimos que los parámetros son de tipo string/number para simplicidad
            if (typeof parameters[name] === 'number') {
                request.input(name, sql.Int, parameters[name]);
            } else {
                 request.input(name, sql.NVarChar, parameters[name]);
            }
        }
        
        const result = await request.execute(spName);
        console.log(`[SP] ✅ Ejecución de ${spName} completada. Registros: ${result.recordset.length}`);
        
        return result.recordset;

    } catch (err) {
        console.error(`[SP] ❌ ERROR al ejecutar ${spName}: ${err.message}`);
        throw err;
    }
}

// Cierra la conexión si el proceso finaliza
process.on('SIGINT', () => {
    if (connection) {
        connection.close(() => {
            console.log('[DB] 🛑 Conexión de base de datos cerrada.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

module.exports = {
    executeSp
};