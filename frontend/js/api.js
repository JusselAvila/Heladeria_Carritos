// API Base URL
const API_URL = 'http://localhost:3000';

// Función para hacer peticiones autenticadas
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // Si no está autenticado, redirigir al login
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}