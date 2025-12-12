// ========================================
// ADMIN DASHBOARD - JAVASCRIPT
// ========================================

// Estado global
let currentSection = 'dashboard';
let empleados = [];
let productos = [];
let carritos = [];
let ventas = [];

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Admin Dashboard...');

    // Verificar autenticación (debe ser Admin)
    if (!checkAuth('Admin')) {
        return;
    }

    // Cargar datos del usuario
    loadUserData();

    // Configurar event listeners
    setupEventListeners();

    // Cargar datos iniciales del dashboard
    loadDashboardData();

    console.log('✅ Admin Dashboard inicializado correctamente');
});

// ========================================
// CARGA DE DATOS DEL USUARIO
// ========================================

function loadUserData() {
    const user = getCurrentUser();

    if (!user) {
        console.error('❌ No se pudo cargar el usuario');
        return;
    }

    // Actualizar nombre en la topbar
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = user.nombre_completo || user.username || 'Admin';
    }

    // Actualizar rol
    const userRole = document.getElementById('userRole');
    if (userRole) {
        userRole.textContent = user.rol || 'Administrador';
    }

    // Actualizar avatar con iniciales
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        const nombre = user.nombre_completo || user.username || 'A';
        const initials = nombre.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        userAvatar.textContent = initials;
    }

    console.log('✅ Datos de usuario cargados:', user.username);
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Navegación del sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            if (section) {
                navigateToSection(section);
            }
        });
    });

    // Botón nuevo empleado
    const btnNuevoEmpleado = document.getElementById('btnNuevoEmpleado');
    if (btnNuevoEmpleado) {
        btnNuevoEmpleado.addEventListener('click', () => openModal('modalEmpleado'));
    }

    // Botón nuevo producto
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', () => {
            alert('Funcionalidad en desarrollo: Nuevo Producto');
        });
    }

    // Botón nuevo carrito
    const btnNuevoCarrito = document.getElementById('btnNuevoCarrito');
    if (btnNuevoCarrito) {
        btnNuevoCarrito.addEventListener('click', () => {
            alert('Funcionalidad en desarrollo: Nuevo Carrito');
        });
    }

    // Guardar empleado
    const btnGuardarEmpleado = document.getElementById('btnGuardarEmpleado');
    if (btnGuardarEmpleado) {
        btnGuardarEmpleado.addEventListener('click', guardarEmpleado);
    }

    console.log('✅ Event listeners configurados');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        console.log('🔄 Sidebar toggled');
    }
}

// ========================================
// NAVEGACIÓN ENTRE SECCIONES
// ========================================

function navigateToSection(section) {
    console.log('📍 Navegando a:', section);

    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(s => {
        s.classList.add('hidden');
    });

    // Mostrar sección seleccionada
    const sectionElement = document.getElementById(`section-${section}`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    } else {
        console.error(`❌ No se encontró la sección: section-${section}`);
    }

    // Actualizar navegación activa
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });

    // Actualizar título de la página
    const titles = {
        'dashboard': 'Dashboard',
        'empleados': 'Empleados',
        'productos': 'Productos',
        'carritos': 'Carritos',
        'ventas': 'Ventas',
        'reportes': 'Reportes'
    };

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[section] || 'Dashboard';
    }

    currentSection = section;

    // Cargar datos de la sección si es necesario
    loadSectionData(section);
}

// ========================================
// CARGA DE DATOS POR SECCIÓN
// ========================================

function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'empleados':
            loadEmpleados();
            break;
        case 'productos':
            loadProductos();
            break;
        case 'carritos':
            loadCarritos();
            break;
        case 'ventas':
            loadVentas();
            break;
        case 'reportes':
            console.log('📊 Sección de reportes - En desarrollo');
            break;
    }
}

// ========================================
// DASHBOARD - CONSUMIR API REAL
// ========================================

async function loadDashboardData() {
    console.log('📊 Cargando datos del dashboard desde API...');

    try {
        // Cargar estadísticas desde la API
        const stats = await apiGet('/dashboard/stats');

        if (stats) {
            updateStat('statCarritos', stats.carritosActivos || '0');
            updateStat('statVentas', `Bs. ${stats.ingresosHoy || '0'}`);
            updateStat('statProductos', stats.productos || '0');
            updateStat('statEmpleados', stats.empleadosActivos || '0');

            console.log('✅ Estadísticas cargadas:', stats);
        }

        // Cargar ventas recientes
        const ventasRecientes = await apiGet('/dashboard/ventasRecientes');

        if (ventasRecientes && ventasRecientes.length > 0) {
            const ventasHTML = ventasRecientes.map(v => `
                <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Venta #${v.id_venta}</strong>
                        <span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">Completada</span>
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                        ${v.codigo_carrito ? 'Carrito ' + v.codigo_carrito : 'Tienda Central'} - Bs. ${parseFloat(v.total).toFixed(2)}
                    </div>
                </div>
            `).join('');

            updateElement('ventasRecientes', ventasHTML);
            console.log('✅ Ventas recientes cargadas:', ventasRecientes.length);
        } else {
            updateElement('ventasRecientes', '<p class="text-center text-gray-500">No hay ventas recientes</p>');
        }

        // Cargar carritos en ruta
        const carritosRuta = await apiGet('/dashboard/carritosRuta');

        if (carritosRuta && carritosRuta.length > 0) {
            const carritosHTML = carritosRuta.map(c => `
                <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Carrito ${c.codigo_carrito}</strong>
                        <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">En Ruta</span>
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                        ${c.ubicacion || 'Sin ubicación'}
                    </div>
                </div>
            `).join('');

            updateElement('carritosEnRuta', carritosHTML);
            console.log('✅ Carritos en ruta cargados:', carritosRuta.length);
        } else {
            updateElement('carritosEnRuta', '<p class="text-center text-gray-500">No hay carritos en ruta</p>');
        }

    } catch (error) {
        console.error('❌ Error cargando dashboard:', error);

        // Mostrar valores por defecto en caso de error
        updateStat('statCarritos', '0');
        updateStat('statVentas', 'Bs. 0');
        updateStat('statProductos', '0');
        updateStat('statEmpleados', '0');

        updateElement('ventasRecientes', '<p class="text-center text-red-500">Error al cargar ventas</p>');
        updateElement('carritosEnRuta', '<p class="text-center text-red-500">Error al cargar carritos</p>');
    }
}

// ========================================
// EMPLEADOS - USAR DATOS SIMULADOS (hasta implementar API)
// ========================================

function loadEmpleados() {
    console.log('👥 Cargando empleados...');

    // Datos simulados (puedes cambiar esto por una llamada a API)
    empleados = [
        { id: 1, nombre: 'Juan', apellido: 'Pérez', cargo: 'Vendedor', telefono: '70123456', activo: true },
        { id: 2, nombre: 'María', apellido: 'González', cargo: 'Vendedor', telefono: '71234567', activo: true },
        { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', cargo: 'Supervisor', telefono: '72345678', activo: true },
        { id: 4, nombre: 'Ana', apellido: 'García', cargo: 'Vendedor', telefono: '73456789', activo: true }
    ];

    const tbody = document.getElementById('tablaEmpleados');
    if (!tbody) {
        console.error('❌ No se encontró elemento: tablaEmpleados');
        return;
    }

    tbody.innerHTML = empleados.map(emp => `
        <tr>
            <td>${emp.id}</td>
            <td>${emp.nombre}</td>
            <td>${emp.apellido}</td>
            <td>${emp.cargo}</td>
            <td>${emp.telefono}</td>
            <td>
                <span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">
                    Activo
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarEmpleado(${emp.id})" style="margin-right: 0.5rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEmpleado(${emp.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    console.log(`✅ ${empleados.length} empleados cargados`);
}

function loadProductos() {
    console.log('📦 Cargando productos...');

    // Datos simulados
    productos = [
        { id: 1, nombre: 'Helado de Chocolate', descripcion: '1 litro', precio: 15.00, stock: 50 },
        { id: 2, nombre: 'Helado de Vainilla', descripcion: '1 litro', precio: 15.00, stock: 45 },
        { id: 3, nombre: 'Helado de Fresa', descripcion: '1 litro', precio: 15.00, stock: 40 },
        { id: 4, nombre: 'Paleta Frutal', descripcion: 'Unidad', precio: 3.50, stock: 100 },
        { id: 5, nombre: 'Cono Simple', descripcion: 'Unidad', precio: 5.00, stock: 80 }
    ];

    const tbody = document.getElementById('tablaProductos');
    if (!tbody) {
        console.error('❌ No se encontró elemento: tablaProductos');
        return;
    }

    tbody.innerHTML = productos.map(prod => `
        <tr>
            <td>${prod.id}</td>
            <td>${prod.nombre}</td>
            <td>${prod.descripcion}</td>
            <td>Bs. ${prod.precio.toFixed(2)}</td>
            <td>${prod.stock}</td>
            <td>
                <button class="btn btn-sm btn-primary" style="margin-right: 0.5rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    console.log(`✅ ${productos.length} productos cargados`);
}

function loadCarritos() {
    console.log('🛒 Cargando carritos...');

    // Datos simulados
    carritos = [
        { id: 1, codigo: 'A1', ubicacion: 'Zona Norte', estado: 'En Ruta', empleado: 'Juan Pérez' },
        { id: 2, codigo: 'B2', ubicacion: 'Zona Sur', estado: 'En Ruta', empleado: 'María González' },
        { id: 3, codigo: 'C3', ubicacion: 'Almacén', estado: 'Disponible', empleado: '-' },
        { id: 4, codigo: 'D4', ubicacion: 'Zona Este', estado: 'En Ruta', empleado: 'Carlos Rodríguez' },
        { id: 5, codigo: 'E5', ubicacion: 'Almacén', estado: 'Disponible', empleado: '-' }
    ];

    const tbody = document.getElementById('tablaCarritos');
    if (!tbody) {
        console.error('❌ No se encontró elemento: tablaCarritos');
        return;
    }

    tbody.innerHTML = carritos.map(c => {
        const badgeColor = c.estado === 'En Ruta'
            ? 'background: #dbeafe; color: #1e40af;'
            : 'background: #d1fae5; color: #065f46;';

        return `
            <tr>
                <td>${c.id}</td>
                <td>${c.codigo}</td>
                <td>${c.ubicacion}</td>
                <td>
                    <span style="${badgeColor} padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">
                        ${c.estado}
                    </span>
                </td>
                <td>${c.empleado}</td>
                <td>
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    console.log(`✅ ${carritos.length} carritos cargados`);
}

function loadVentas() {
    console.log('💰 Cargando ventas...');

    // Datos simulados
    ventas = [
        { id: 1, fecha: '2025-12-12 10:30', carrito: 'A1', cliente: 'Cliente Anónimo', total: 85.00, estado: 'Completada' },
        { id: 2, fecha: '2025-12-12 11:15', carrito: 'B2', cliente: 'María López', total: 120.50, estado: 'Completada' },
        { id: 3, fecha: '2025-12-12 12:00', carrito: 'A1', cliente: 'Pedro Ruiz', total: 45.00, estado: 'Completada' },
        { id: 4, fecha: '2025-12-12 13:30', carrito: 'C3', cliente: 'Ana Torres', total: 95.00, estado: 'Completada' }
    ];

    const tbody = document.getElementById('tablaVentas');
    if (!tbody) {
        console.error('❌ No se encontró elemento: tablaVentas');
        return;
    }

    tbody.innerHTML = ventas.map(v => `
        <tr>
            <td>${v.id}</td>
            <td>${v.fecha}</td>
            <td>${v.carrito}</td>
            <td>${v.cliente}</td>
            <td>Bs. ${v.total.toFixed(2)}</td>
            <td>
                <span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">
                    ${v.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    console.log(`✅ ${ventas.length} ventas cargadas`);
}

// ========================================
// MODALES
// ========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ No se encontró modal: ${modalId}`);
        return;
    }

    modal.classList.add('active');

    // Limpiar formulario si es de empleado
    if (modalId === 'modalEmpleado') {
        const form = document.getElementById('formEmpleado');
        if (form) {
            form.reset();
        }
    }

    console.log(`✅ Modal abierto: ${modalId}`);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ No se encontró modal: ${modalId}`);
        return;
    }

    modal.classList.remove('active');
    console.log(`✅ Modal cerrado: ${modalId}`);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// ========================================
// CRUD EMPLEADOS
// ========================================

function guardarEmpleado() {
    const nombre = document.getElementById('empNombre')?.value;
    const apellido = document.getElementById('empApellido')?.value;
    const cargo = document.getElementById('empCargo')?.value;
    const telefono = document.getElementById('empTelefono')?.value;

    if (!nombre || !apellido || !cargo || !telefono) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Simular guardado
    console.log('💾 Guardando empleado:', { nombre, apellido, cargo, telefono });
    alert(`Empleado ${nombre} ${apellido} guardado exitosamente`);
    closeModal('modalEmpleado');
    loadEmpleados();
}

function editarEmpleado(id) {
    const emp = empleados.find(e => e.id === id);
    if (!emp) {
        console.error(`❌ No se encontró empleado con ID: ${id}`);
        return;
    }

    console.log('✏️ Editando empleado:', emp);

    const empNombre = document.getElementById('empNombre');
    const empApellido = document.getElementById('empApellido');
    const empTelefono = document.getElementById('empTelefono');

    if (empNombre) empNombre.value = emp.nombre;
    if (empApellido) empApellido.value = emp.apellido;
    if (empTelefono) empTelefono.value = emp.telefono;

    openModal('modalEmpleado');
}

function eliminarEmpleado(id) {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) {
        return;
    }

    console.log('🗑️ Eliminando empleado ID:', id);
    empleados = empleados.filter(e => e.id !== id);
    loadEmpleados();
    alert('Empleado eliminado exitosamente');
}

// ========================================
// UTILIDADES
// ========================================

function updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function updateElement(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = html;
    }
}

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================

window.editarEmpleado = editarEmpleado;
window.eliminarEmpleado = eliminarEmpleado;
window.closeModal = closeModal;