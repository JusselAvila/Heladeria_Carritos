// Verificar autenticación
function checkAuth(requiredRole = null) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return;
    }
    
    if (requiredRole) {
        const userData = JSON.parse(user);
        if (userData.rol !== requiredRole) {
            alert('No tienes permisos para acceder a esta página');
            window.location.href = 'index.html';
        }
    }
}

// Obtener usuario actual
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Verificar si el token expiró
function isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
}