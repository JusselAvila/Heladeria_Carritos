// ========================================
// AUTHENTICATION HELPER
// ========================================

/**
 * Verificar si el usuario está autenticado
 * @param {string} requiredRole - Rol requerido (Admin o Empleado)
 * @returns {boolean} - true si está autenticado
 */
function checkAuth(requiredRole = null) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Si no hay token o usuario, redirigir al login
    if (!token || !userStr) {
        console.warn('⚠️ No autenticado - Redirigiendo al login');
        window.location.href = '/';
        return false;
    }

    try {
        const user = JSON.parse(userStr);

        // Verificar que tenga username
        if (!user.username) {
            throw new Error('Usuario inválido');
        }

        // Si se requiere un rol específico
        if (requiredRole && user.rol !== requiredRole) {
            console.warn(`⚠️ Rol requerido: ${requiredRole}, pero usuario tiene: ${user.rol}`);
            alert('No tienes permisos para acceder a esta página');
            window.location.href = '/';
            return false;
        }

        // Verificar si el token expiró
        if (isTokenExpired()) {
            console.warn('⚠️ Token expirado');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return false;
        }

        return true;

    } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return false;
    }
}

/**
 * Obtener los datos del usuario actual
 * @returns {object|null} - Datos del usuario o null
 */
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('❌ Error al obtener usuario:', error);
        return null;
    }
}

/**
 * Verificar si el token JWT expiró
 * @returns {boolean} - true si expiró
 */
function isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
        // Decodificar el payload del JWT (parte central)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Verificar si expiró (exp está en segundos, Date.now() en milisegundos)
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        console.error('❌ Error al verificar expiración del token:', error);
        return true;
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

/**
 * Guardar sesión
 */
function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Verificar si el usuario es Admin
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.rol === 'Admin';
}

/**
 * Verificar si el usuario es Empleado
 */
function isEmpleado() {
    const user = getCurrentUser();
    return user && user.rol === 'Empleado';
}