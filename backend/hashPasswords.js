require('dotenv').config();
const bcrypt = require('bcrypt');
const { getConnection } = require('./config/database');

// Lista de usuarios con sus contraseñas en texto plano
const usuarios = [
    { username: 'admin', password: 'admin123' },
    { username: 'juan.perez', password: 'ven123' },
    { username: 'maria.lopez', password: 'ven123' },
    { username: 'cortezalvaro', password: 'alvaro123' },
    { username: 'pedro.gomez', password: 'ven123' },
    { username: 'lucia.ramirez', password: 'ven123' },
    { username: 'carlos.martinez', password: 'ven123' }
];

async function hashPasswords() {
    try {
        console.log('🔐 Iniciando proceso de hasheo de contraseñas...\n');

        const pool = await getConnection();
        console.log('✅ Conectado a la base de datos\n');

        for (const usuario of usuarios) {
            try {
                // Hashear la contraseña
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(usuario.password, salt);

                console.log(`👤 Usuario: ${usuario.username}`);
                console.log(`   Contraseña original: ${usuario.password}`);
                console.log(`   Hash generado: ${hashedPassword}`);

                // Actualizar en la base de datos
                await pool.request()
                    .input('username', usuario.username)
                    .input('password_hash', hashedPassword)
                    .query(`
                        UPDATE Usuarios 
                        SET password_hash = @password_hash 
                        WHERE username = @username
                    `);

                console.log(`   ✅ Actualizado en BD\n`);

            } catch (error) {
                console.error(`   ❌ Error con usuario ${usuario.username}:`, error.message, '\n');
            }
        }

        console.log('========================================');
        console.log('✅ Proceso completado exitosamente');
        console.log('========================================');
        console.log('\n🔒 Todas las contraseñas han sido hasheadas');
        console.log('📝 Ahora puedes probar el login con:');
        console.log('   - Usuario: admin / Contraseña: admin123');
        console.log('   - Usuario: juan.perez / Contraseña: ven123\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error general:', error);
        process.exit(1);
    }
}

// Ejecutar el script
hashPasswords();
