-- 1. TABLA ROLES
CREATE TABLE Roles (
    id_rol INT PRIMARY KEY IDENTITY(1,1),
    nombre_rol VARCHAR(20) NOT NULL UNIQUE CHECK (nombre_rol IN ('Admin', 'Empleado', 'Gerente'))
);

-- 2. TABLA CARGOS
CREATE TABLE Cargos (
    id_cargo INT PRIMARY KEY IDENTITY(1,1),
    nombre_cargo VARCHAR(50) NOT NULL UNIQUE,
    salario DECIMAL(10,2) NOT NULL
);

-- 3. TABLA EMPLEADOS
CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    id_cargo INT NOT NULL,
    fecha_contratacion DATE NOT NULL,
    FOREIGN KEY (id_cargo) REFERENCES Cargos(id_cargo)
);

-- 4. TABLA USUARIOS
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    id_empleado INT NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol),
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado)
);

-- 5. TABLA CARRITOS
CREATE TABLE Carritos (
    id_carrito INT PRIMARY KEY IDENTITY(1,1),
    codigo_carrito VARCHAR(20) NOT NULL UNIQUE,
    ubicacion VARCHAR(100),
    estado VARCHAR(20) CHECK (estado IN ('Activo', 'Inactivo', 'Disponible')) DEFAULT 'Disponible'
);

-- 6. TABLA EMPLEADO_CARRITO
CREATE TABLE Empleado_Carrito (
    id_asignacion INT PRIMARY KEY IDENTITY(1,1),
    id_empleado INT NOT NULL,
    id_carrito INT NOT NULL,
    fecha_inicio DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_fin DATETIME NULL,
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado),
    FOREIGN KEY (id_carrito) REFERENCES Carritos(id_carrito)
);

-- 7. TABLA CLIENTES
CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200) NULL
);

-- 8. TABLA PRODUCTOS
CREATE TABLE Productos (
    id_producto INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    tipo VARCHAR(30) CHECK (tipo IN ('cono', 'paleta', 'vaso', 'litro', 'otro')),
    stock_central INT NOT NULL DEFAULT 0  -- Stock en tienda central
);

-- 9. TABLA INVENTARIO_CARRITO (Control de productos por carrito)
CREATE TABLE Inventario_Carrito (
    id_inventario INT PRIMARY KEY IDENTITY(1,1),
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_cargada INT NOT NULL,  -- Cuánto se cargó inicialmente
    cantidad_actual INT NOT NULL,   -- Cuánto queda ahora
    fecha_carga DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_cierre DATETIME NULL,     -- Cuando se devuelve el carrito
    FOREIGN KEY (id_carrito) REFERENCES Carritos(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- 10. TABLA VENTAS
CREATE TABLE Ventas (
    id_venta INT PRIMARY KEY IDENTITY(1,1),
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    id_carrito INT NULL,  -- NULL si es venta en tienda central
    fecha_venta DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado),
    FOREIGN KEY (id_carrito) REFERENCES Carritos(id_carrito)
);

-- 11. TABLA DETALLE_VENTA
CREATE TABLE Detalle_Venta (
    id_detalle INT PRIMARY KEY IDENTITY(1,1),
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- 12. TABLA DEVOLUCIONES
CREATE TABLE Devoluciones (
    id_devolucion INT PRIMARY KEY IDENTITY(1,1),
    id_venta INT NOT NULL,
    id_empleado INT NOT NULL,  -- Quién procesó la devolución
    fecha_devolucion DATETIME NOT NULL DEFAULT GETDATE(),
    motivo VARCHAR(255),
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado)
);

-- 13. TABLA DETALLE_DEVOLUCION
CREATE TABLE Detalle_Devolucion (
    id_detalle_dev INT PRIMARY KEY IDENTITY(1,1),
    id_devolucion INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,  -- Cuántos productos se devolvieron
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_devolucion) REFERENCES Devoluciones(id_devolucion) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);