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
    console.log('📊 Cargando datos reales del dashboard...');

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
// EMPLEADOS - USAR API REAL
// ========================================

async function loadEmpleados() {
    console.log('👥 Cargando empleados desde API...');

    const tbody = document.getElementById('tablaEmpleados');
    if (!tbody) {
        console.error('❌ No se encontró elemento: tablaEmpleados');
        return;
    }

    try {
        // Mostrar loading
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Cargando empleados...</td></tr>';

        // Cargar desde API
        empleados = await apiGet('/empleados');

        if (!empleados || empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay empleados registrados</td></tr>';
            return;
        }

        tbody.innerHTML = empleados.map(emp => `
            <tr>
                <td>${emp.id_empleado}</td>
                <td>${emp.nombre}</td>
                <td>${emp.apellido}</td>
                <td>${emp.documento_identidad || '-'}</td>
                <td>${emp.cargo}</td>
                <td>${emp.telefono || '-'}</td>
                <td>${emp.username || '-'}</td>
                <td>
                    <span class="badge ${emp.estado === 'Activo' ? 'badge-success' : 'badge-danger'}">
                        ${emp.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarEmpleado(${emp.id_empleado})" style="margin-right: 0.5rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarEmpleado(${emp.id_empleado})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log(`✅ ${empleados.length} empleados cargados desde API`);

    } catch (error) {
        console.error('❌ Error cargando empleados:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-red-500">Error al cargar empleados</td></tr>';
    }
}

async function loadProductos() {
    console.log('📦 Cargando productos desde API...');

    const tbody = document.getElementById('tablaProductos');
    if (!tbody) {
        console.error('❌ No se encontró elemento: tablaProductos');
        return;
    }

    try {
        // Mostrar loading
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando productos...</td></tr>';

        // Cargar desde API
        productos = await apiGet('/productos');

        if (!productos || productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = productos.map(prod => `
            <tr>
                <td>${prod.id_producto}</td>
                <td>${prod.nombre}</td>
                <td>${prod.descripcion || '-'}</td>
                <td>Bs. ${parseFloat(prod.precio).toFixed(2)}</td>
                <td>${prod.stock_central}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarProducto(${prod.id_producto})" style="margin-right: 0.5rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${prod.id_producto})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log(`✅ ${productos.length} productos cargados desde API`);

    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-500">Error al cargar productos</td></tr>';
    }
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
// CARGAR CARGOS AL ABRIR MODAL
// ========================================
async function loadCargos() {
    try {
        const cargos = await apiGet('/empleados/cargos/lista');

        const selectCargo = document.getElementById('empCargo');
        if (selectCargo && cargos) {
            selectCargo.innerHTML = '<option value="">Seleccionar...</option>' +
                cargos.map(c => `<option value="${c.id_cargo}">${c.nombre_cargo}</option>`).join('');
        }
    } catch (error) {
        console.error('❌ Error cargando cargos:', error);
    }
}

// ========================================
// PREVIEW DE CREDENCIALES
// ========================================
function setupCredentialsPreview() {
    const nombreInput = document.getElementById('empNombre');
    const apellidoInput = document.getElementById('empApellido');
    const documentoInput = document.getElementById('empDocumento');
    const previewDiv = document.getElementById('credencialesPreview');
    const previewUsername = document.getElementById('previewUsername');
    const previewPassword = document.getElementById('previewPassword');

    function updatePreview() {
        const nombre = nombreInput?.value.trim().toLowerCase().replace(/\s+/g, '');
        const apellido = apellidoInput?.value.trim().toLowerCase().replace(/\s+/g, '');
        const documento = documentoInput?.value.trim();

        if (nombre && apellido && documento) {
            // Username: nombreapellido
            const username = `${nombre}${apellido}`;

            // Password: apellido.documento
            const password = `${apellido}.${documento}`;

            previewUsername.textContent = username;
            previewPassword.textContent = password;
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    }

    if (nombreInput) nombreInput.addEventListener('input', updatePreview);
    if (apellidoInput) apellidoInput.addEventListener('input', updatePreview);
    if (documentoInput) documentoInput.addEventListener('input', updatePreview);
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

        // Ocultar preview
        const previewDiv = document.getElementById('credencialesPreview');
        if (previewDiv) {
            previewDiv.style.display = 'none';
        }

        // Cargar cargos
        loadCargos();

        // Setup preview listeners
        setupCredentialsPreview();
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

async function guardarEmpleado() {
    const nombre = document.getElementById('empNombre')?.value.trim();
    const apellido = document.getElementById('empApellido')?.value.trim();
    const documento_identidad = document.getElementById('empDocumento')?.value.trim();
    const cargo = document.getElementById('empCargo')?.value;
    const telefono = document.getElementById('empTelefono')?.value.trim();

    // Validar campos requeridos
    if (!nombre || !apellido || !documento_identidad || !cargo) {
        alert('Por favor completa todos los campos requeridos (*)');
        return;
    }

    // Validar formato de documento
    if (!/^\d+$/.test(documento_identidad)) {
        alert('El documento de identidad debe contener solo números');
        return;
    }

    // Deshabilitar botón mientras se guarda
    const btnGuardar = document.getElementById('btnGuardarEmpleado');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        console.log('💾 Guardando empleado:', { nombre, apellido, documento_identidad, cargo, telefono });

        // Hacer petición a la API
        const response = await apiPost('/empleados', {
            nombre,
            apellido,
            documento_identidad,
            telefono: telefono || null,
            id_cargo: parseInt(cargo)
        });

        console.log('✅ Empleado guardado:', response);

        // Mostrar credenciales generadas
        const mensaje = `¡Empleado creado exitosamente!

📋 Datos del empleado:
   Nombre: ${nombre} ${apellido}
   CI: ${documento_identidad}

🔐 Credenciales generadas:
   Usuario: ${response.username}
   Contraseña: ${response.password}

⚠️ IMPORTANTE: Entrega estas credenciales al empleado.
El empleado podrá cambiar su contraseña después.`;

        alert(mensaje);

        // Cerrar modal
        closeModal('modalEmpleado');

        // Recargar lista de empleados
        loadEmpleados();

    } catch (error) {
        console.error('❌ Error guardando empleado:', error);

        let errorMsg = 'Error al guardar el empleado';
        if (error.message) {
            errorMsg += ': ' + error.message;
        }

        alert(errorMsg);
    } finally {
        // Rehabilitar botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

function editarEmpleado(id) {
    const emp = empleados.find(e => e.id_empleado === id);
    if (!emp) {
        console.error(`❌ No se encontró empleado con ID: ${id}`);
        return;
    }

    console.log('✏️ Editando empleado:', emp);
    alert('Funcionalidad de edición en desarrollo');
}

async function eliminarEmpleado(id) {
    if (!confirm('¿Estás seguro de desactivar este empleado?\n\nEsto desactivará su usuario y no podrá iniciar sesión.')) {
        return;
    }

    try {
        console.log('🗑️ Desactivando empleado ID:', id);

        await apiDelete(`/empleados/${id}`);

        alert('Empleado desactivado exitosamente');
        loadEmpleados();

    } catch (error) {
        console.error('❌ Error desactivando empleado:', error);
        alert('Error al desactivar empleado: ' + error.message);
    }
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