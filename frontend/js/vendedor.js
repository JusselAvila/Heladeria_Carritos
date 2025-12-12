// ========================================
// VENDEDOR DASHBOARD - JAVASCRIPT
// ========================================

// Estado global
let currentSection = 'venta';
let carritoVenta = []; // Items en el carrito actual
let productos = [];
let inventario = [];
let ventasHoy = [];

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Vendedor Dashboard...');
    
    // Verificar autenticación (debe ser Empleado)
    if (!checkAuth('Empleado')) {
        return;
    }
    
    // Cargar datos del usuario
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar datos iniciales
    loadProductos();
    loadInventario();
    loadVentasHoy();
    
    console.log('✅ Vendedor Dashboard inicializado correctamente');
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
        userName.textContent = user.nombre_completo || user.username || 'Vendedor';
    }
    
    // Actualizar avatar con iniciales
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        const nombre = user.nombre_completo || user.username || 'V';
        const initials = nombre.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        userAvatar.textContent = initials;
    }
    
    // Actualizar info empleado en sección carrito-info
    const infoEmpleado = document.getElementById('infoEmpleado');
    if (infoEmpleado) {
        infoEmpleado.textContent = user.nombre_completo || user.username;
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
    
    // Búsqueda de productos
    const buscarProducto = document.getElementById('buscarProducto');
    if (buscarProducto) {
        buscarProducto.addEventListener('input', (e) => {
            filtrarProductos(e.target.value);
        });
    }
    
    // Botones del carrito
    const btnFinalizarVenta = document.getElementById('btnFinalizarVenta');
    if (btnFinalizarVenta) {
        btnFinalizarVenta.addEventListener('click', finalizarVenta);
    }
    
    const btnCancelarVenta = document.getElementById('btnCancelarVenta');
    if (btnCancelarVenta) {
        btnCancelarVenta.addEventListener('click', cancelarVenta);
    }
    
    const btnConfirmarVenta = document.getElementById('btnConfirmarVenta');
    if (btnConfirmarVenta) {
        btnConfirmarVenta.addEventListener('click', confirmarVenta);
    }
    
    console.log('✅ Event listeners configurados');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
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
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    // Actualizar título
    const titles = {
        'venta': 'Punto de Venta',
        'inventario': 'Mi Inventario',
        'historial': 'Mis Ventas',
        'carrito-info': 'Mi Carrito'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[section] || 'Dashboard';
    }
    
    currentSection = section;
    
    // Recargar datos si es necesario
    if (section === 'historial') {
        loadVentasHoy();
    }
}

// ========================================
// PRODUCTOS
// ========================================

function loadProductos() {
    console.log('📦 Cargando productos...');
    
    // Datos simulados
    productos = [
        { id: 1, nombre: 'Cono Simple', precio: 5.00, stock: 50, icon: '🍦' },
        { id: 2, nombre: 'Cono Doble', precio: 8.00, stock: 40, icon: '🍦🍦' },
        { id: 3, nombre: 'Paleta', precio: 3.50, stock: 100, icon: '🍡' },
        { id: 4, nombre: 'Vaso Pequeño', precio: 7.00, stock: 30, icon: '🥤' },
        { id: 5, nombre: 'Vaso Grande', precio: 12.00, stock: 25, icon: '🥤' },
        { id: 6, nombre: 'Litro Chocolate', precio: 25.00, stock: 15, icon: '🍫' },
        { id: 7, nombre: 'Litro Vainilla', precio: 25.00, stock: 12, icon: '🍨' },
        { id: 8, nombre: 'Litro Fresa', precio: 25.00, stock: 10, icon: '🍓' }
    ];
    
    renderProductos(productos);
    console.log(`✅ ${productos.length} productos cargados`);
}

function renderProductos(productosArray) {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;
    
    if (productosArray.length === 0) {
        grid.innerHTML = '<p class="text-center text-gray-500" style="grid-column: 1/-1; padding: 2rem;">No se encontraron productos</p>';
        return;
    }
    
    grid.innerHTML = productosArray.map(p => `
        <div class="producto-card" onclick="agregarAlCarrito(${p.id})">
            <div class="producto-icon">${p.icon}</div>
            <div class="producto-nombre">${p.nombre}</div>
            <div class="producto-precio">Bs. ${p.precio.toFixed(2)}</div>
            <div class="producto-stock">Stock: ${p.stock}</div>
        </div>
    `).join('');
}

function filtrarProductos(texto) {
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto.toLowerCase())
    );
    renderProductos(filtrados);
}

// ========================================
// CARRITO DE VENTA
// ========================================

function agregarAlCarrito(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;
    
    if (producto.stock <= 0) {
        alert('Producto sin stock');
        return;
    }
    
    // Verificar si ya está en el carrito
    const itemExistente = carritoVenta.find(item => item.id === idProducto);
    
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            alert('No hay más stock disponible');
            return;
        }
    } else {
        carritoVenta.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            stockDisponible: producto.stock
        });
    }
    
    renderCarrito();
    actualizarTotal();
    console.log('✅ Producto agregado al carrito:', producto.nombre);
}

function renderCarrito() {
    const container = document.getElementById('carritoItems');
    if (!container) return;
    
    if (carritoVenta.length === 0) {
        container.innerHTML = `
            <p class="text-center text-gray-400" style="padding: 3rem 1rem;">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                Selecciona productos para comenzar
            </p>
        `;
        
        // Deshabilitar botones
        document.getElementById('btnFinalizarVenta').disabled = true;
        document.getElementById('btnCancelarVenta').disabled = true;
        return;
    }
    
    container.innerHTML = carritoVenta.map(item => `
        <div class="carrito-item">
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombre}</div>
                <div class="carrito-item-precio">Bs. ${item.precio.toFixed(2)} c/u</div>
            </div>
            <div class="carrito-item-controls">
                <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="qty-value">${item.cantidad}</span>
                <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="qty-btn" onclick="eliminarDelCarrito(${item.id})" style="color: #dc2626; border-color: #dc2626;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Habilitar botones
    document.getElementById('btnFinalizarVenta').disabled = false;
    document.getElementById('btnCancelarVenta').disabled = false;
}

function cambiarCantidad(idProducto, delta) {
    const item = carritoVenta.find(i => i.id === idProducto);
    if (!item) return;
    
    const nuevaCantidad = item.cantidad + delta;
    
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(idProducto);
        return;
    }
    
    if (nuevaCantidad > item.stockDisponible) {
        alert('No hay más stock disponible');
        return;
    }
    
    item.cantidad = nuevaCantidad;
    renderCarrito();
    actualizarTotal();
}

function eliminarDelCarrito(idProducto) {
    carritoVenta = carritoVenta.filter(item => item.id !== idProducto);
    renderCarrito();
    actualizarTotal();
}

function actualizarTotal() {
    const total = carritoVenta.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const totalElement = document.getElementById('totalVenta');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
    
    const modalTotal = document.getElementById('modalTotal');
    if (modalTotal) {
        modalTotal.textContent = total.toFixed(2);
    }
}

function cancelarVenta() {
    if (carritoVenta.length > 0) {
        if (!confirm('¿Estás seguro de cancelar esta venta?')) {
            return;
        }
    }
    
    carritoVenta = [];
    renderCarrito();
    actualizarTotal();
    console.log('🗑️ Venta cancelada');
}

// ========================================
// FINALIZAR VENTA
// ========================================

function finalizarVenta() {
    if (carritoVenta.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    // Abrir modal para datos del cliente
    openModal('modalCliente');
}

function confirmarVenta() {
    const clienteNombre = document.getElementById('clienteNombre').value.trim() || 'Cliente Anónimo';
    const clienteTelefono = document.getElementById('clienteTelefono').value.trim();
    const clienteDireccion = document.getElementById('clienteDireccion').value.trim();
    
    const total = carritoVenta.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Crear venta
    const venta = {
        id: ventasHoy.length + 1,
        fecha: new Date().toLocaleString('es-BO'),
        cliente: clienteNombre,
        telefono: clienteTelefono,
        direccion: clienteDireccion,
        items: [...carritoVenta],
        total: total
    };
    
    ventasHoy.push(venta);
    
    // Actualizar stock (simulado)
    carritoVenta.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock -= item.cantidad;
        }
    });
    
    console.log('✅ Venta confirmada:', venta);
    
    // Mostrar mensaje de éxito
    alert(`¡Venta realizada con éxito!\n\nTotal: Bs. ${total.toFixed(2)}\nCliente: ${clienteNombre}`);
    
    // Limpiar carrito
    carritoVenta = [];
    renderCarrito();
    actualizarTotal();
    renderProductos(productos);
    
    // Cerrar modal
    closeModal('modalCliente');
    
    // Limpiar formulario
    document.getElementById('formCliente').reset();
    
    // Actualizar estadísticas si estamos en esa sección
    if (currentSection === 'historial') {
        loadVentasHoy();
    }
}

// ========================================
// INVENTARIO
// ========================================

function loadInventario() {
    console.log('📋 Cargando inventario...');
    
    // Simular inventario basado en productos
    inventario = productos.map(p => ({
        producto: p.nombre,
        stockActual: p.stock,
        stockInicial: p.stock + Math.floor(Math.random() * 20),
        precio: p.precio
    }));
    
    const tbody = document.getElementById('tablaInventario');
    if (!tbody) return;
    
    tbody.innerHTML = inventario.map(inv => {
        const vendidos = inv.stockInicial - inv.stockActual;
        return `
            <tr>
                <td>${inv.producto}</td>
                <td>${inv.stockActual}</td>
                <td>${inv.stockInicial}</td>
                <td>${vendidos}</td>
                <td>Bs. ${inv.precio.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
    
    // Actualizar info de productos cargados
    const infoProductosCargados = document.getElementById('infoProductosCargados');
    if (infoProductosCargados) {
        infoProductosCargados.textContent = inventario.length;
    }
    
    console.log('✅ Inventario cargado');
}

// ========================================
// HISTORIAL DE VENTAS
// ========================================

function loadVentasHoy() {
    console.log('💰 Cargando ventas de hoy...');
    
    const tbody = document.getElementById('tablaHistorial');
    if (!tbody) return;
    
    if (ventasHoy.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ventas registradas</td></tr>';
        
        // Actualizar stats
        updateElement('statVentasCount', '0');
        updateElement('statVentasTotal', 'Bs. 0.00');
        updateElement('statVentasPromedio', 'Bs. 0.00');
        return;
    }
    
    tbody.innerHTML = ventasHoy.map(v => `
        <tr>
            <td>${v.fecha.split(' ')[1]}</td>
            <td>${v.cliente}</td>
            <td>${v.items.length} items</td>
            <td>Bs. ${v.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="verDetalleVenta(${v.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Calcular estadísticas
    const totalVentas = ventasHoy.length;
    const totalVendido = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const promedio = totalVentas > 0 ? totalVendido / totalVentas : 0;
    
    updateElement('statVentasCount', totalVentas.toString());
    updateElement('statVentasTotal', `Bs. ${totalVendido.toFixed(2)}`);
    updateElement('statVentasPromedio', `Bs. ${promedio.toFixed(2)}`);
    
    console.log(`✅ ${totalVentas} ventas cargadas`);
}

function verDetalleVenta(idVenta) {
    const venta = ventasHoy.find(v => v.id === idVenta);
    if (!venta) return;
    
    const detalles = venta.items.map(item => 
        `${item.cantidad}x ${item.nombre} - Bs. ${(item.precio * item.cantidad).toFixed(2)}`
    ).join('\n');
    
    alert(`DETALLE DE VENTA #${venta.id}\n\n${detalles}\n\nTOTAL: Bs. ${venta.total.toFixed(2)}\nCliente: ${venta.cliente}`);
}

// ========================================
// MODALES
// ========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    console.log(`✅ Modal abierto: ${modalId}`);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
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
// UTILIDADES
// ========================================

function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================

window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.verDetalleVenta = verDetalleVenta;
window.closeModal = closeModal;
