// ========================================
// API HELPER - PETICIONES AL BACKEND
// ========================================

const API_URL = 'http://localhost:3000/api';

/**
 * Función principal para hacer peticiones API
 * @param {string} endpoint - Ruta del endpoint (ej: '/empleados')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} body - Datos a enviar (opcional)
 * @returns {Promise} - Respuesta del servidor
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Agregar token si existe
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Agregar body si existe y no es GET
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        // Si no está autenticado (401) o sin permisos (403), redirigir al login
        if (response.status === 401 || response.status === 403) {
            console.warn('⚠️ Sesión expirada o sin permisos');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return null;
        }

        // Parsear respuesta
        const data = await response.json();

        // Si hay error en la respuesta
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Error en la petición');
        }

        return data;

    } catch (error) {
        console.error('❌ Error en API Request:', error);
        throw error;
    }
}

/**
 * Petición GET simplificada
 */
async function apiGet(endpoint) {
    return await apiRequest(endpoint, 'GET');
}

/**
 * Petición POST simplificada
 */
async function apiPost(endpoint, body) {
    return await apiRequest(endpoint, 'POST', body);
}

/**
 * Petición PUT simplificada
 */
async function apiPut(endpoint, body) {
    return await apiRequest(endpoint, 'PUT', body);
}

/**
 * Petición DELETE simplificada
 */
async function apiDelete(endpoint) {
    return await apiRequest(endpoint, 'DELETE');
}