require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

const getConnection = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('✅ Conectado a SQL Server:', config.database);
        }
        return pool;
    } catch (error) {
        console.error('❌ Error de conexión a SQL Server:', error.message);
        throw error;
    }
};

const closeConnection = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('✅ Conexión cerrada');
        }
    } catch (error) {
        console.error('❌ Error al cerrar:', error);
    }
};

module.exports = { getConnection, closeConnection, sql };