// config/config.js

require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        port: parseInt(process.env.DB_PORT, 10),
        options: {
            encrypt: false, // Cambiar a true si usas Azure o SSL
            trustServerCertificate: true // Necesario para conexiones locales sin certificado
        }
    }
};

module.exports = config;