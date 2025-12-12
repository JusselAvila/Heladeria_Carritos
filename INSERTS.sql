-- 1. ROLES
INSERT INTO Roles (nombre_rol) VALUES 
('Admin'),
('Empleado');

GO

-- 2. CARGOS
INSERT INTO Cargos (nombre_cargo, salario) VALUES 
('Vendedor', 2500.00),
('Supervisor', 3500.00),
('Gerente General', 5000.00),
('Encargado de Almacén', 2800.00);

GO

-- 3. EMPLEADOS
INSERT INTO Empleados (nombre, apellido, telefono, id_cargo, fecha_contratacion) VALUES 
('Carlos', 'Mendoza', '79999999', 3, '2023-01-15'),      -- Gerente
('Juan', 'Pérez', '77777777', 1, '2024-01-20'),          -- Vendedor
('María', 'López', '78888888', 1, '2024-02-10'),         -- Vendedor
('Ana', 'García', '76666666', 2, '2023-11-05'),          -- Supervisor
('Pedro', 'Ramírez', '75555555', 1, '2024-03-01'),       -- Vendedor
('Sofia', 'Torres', '74444444', 4, '2023-12-10');        -- Almacén

GO

-- 4. USUARIOS
INSERT INTO Usuarios (username, password_hash, id_rol, id_empleado, activo) VALUES 
('admin', 'admin123', 1, 1, 1),              -- Admin Carlos
('juan.perez', 'ven123', 2, 2, 1),           -- Empleado Juan
('maria.lopez', 'ven456', 2, 3, 1),          -- Empleado María
('ana.garcia', 'sup789', 1, 4, 1),           -- Admin Ana
('pedro.ramirez', 'ven321', 2, 5, 1),        -- Empleado Pedro
('sofia.torres', 'alm654', 2, 6, 1);         -- Empleado Sofía

GO

-- 5. CARRITOS
INSERT INTO Carritos (codigo_carrito, ubicacion, estado) VALUES 
('C001', 'Zona Sur - Calacoto', 'Disponible'),
('C002', 'Zona Norte - Villa Fátima', 'Disponible'),
('C003', 'Centro - Plaza Murillo', 'Disponible'),
('C004', 'El Alto - Ciudad Satélite', 'Disponible'),
('C005', 'Zona Sur - Achumani', 'Disponible');

GO

-- 6. EMPLEADO_CARRITO (Asignaciones históricas y actuales)
INSERT INTO Empleado_Carrito (id_empleado, id_carrito, fecha_inicio, fecha_fin) VALUES 
-- Asignaciones cerradas (históricas)
(2, 1, '2024-12-01 08:00:00', '2024-12-01 18:00:00'),  -- Juan tuvo C001 el 1 de dic
(3, 2, '2024-12-01 08:00:00', '2024-12-01 18:00:00'),  -- María tuvo C002 el 1 de dic
(5, 3, '2024-12-01 08:00:00', '2024-12-01 18:00:00'),  -- Pedro tuvo C003 el 1 de dic

-- Asignaciones actuales (fecha_fin NULL)
(2, 1, '2024-12-12 08:00:00', NULL),  -- Juan tiene C001 HOY
(3, 2, '2024-12-12 08:00:00', NULL),  -- María tiene C002 HOY
(5, 4, '2024-12-12 08:00:00', NULL);  -- Pedro tiene C004 HOY

-- Actualizar estado de carritos activos
UPDATE Carritos SET estado = 'Activo' WHERE id_carrito IN (1, 2, 4);

GO

-- 7. CLIENTES
INSERT INTO Clientes (nombre, apellido, telefono) VALUES 
('Roberto', 'Flores', '70111111'),
('Laura', 'Mamani', '71222222'),
('Diego', 'Quispe', '72333333'),
('Carla', 'Rojas', '73444444'),
('Miguel', 'Vargas', '70555555'),
('Patricia', 'Condori', '71666666'),
('Javier', 'Morales', '72777777'),
('Daniela', 'Cruz', '73888888'),
('Fernando', 'Sánchez', '70999999'),
('Gabriela', 'Choque', '71000000');

GO

-- 8. PRODUCTOS
INSERT INTO Productos (nombre, descripcion, precio, tipo, stock_central) VALUES 
('Cono Vainilla', 'Cono de helado sabor vainilla cremosa', 10.00, 'cono', 500),
('Cono Chocolate', 'Cono de helado sabor chocolate belga', 10.00, 'cono', 450),
('Cono Frutilla', 'Cono de helado sabor fresa natural', 10.00, 'cono', 400),
('Paleta Frutilla', 'Paleta de agua sabor fresa', 8.00, 'paleta', 300),
('Paleta Limón', 'Paleta de agua sabor limón', 8.00, 'paleta', 280),
('Paleta Naranja', 'Paleta de agua sabor naranja', 8.00, 'paleta', 250),
('Vaso Chocolate', 'Helado de chocolate en vaso mediano', 12.00, 'vaso', 200),
('Vaso Vainilla', 'Helado de vainilla en vaso mediano', 12.00, 'vaso', 180),
('Vaso Mixto', 'Helado mixto chocolate-vainilla', 14.00, 'vaso', 150),
('Litro Vainilla', 'Helado de vainilla 1 litro', 45.00, 'litro', 50),
('Litro Chocolate', 'Helado de chocolate 1 litro', 45.00, 'litro', 45),
('Litro Frutilla', 'Helado de fresa 1 litro', 45.00, 'litro', 40),
('Sundae Especial', 'Sundae con frutas y chocolate', 18.00, 'otro', 100),
('Milkshake Vainilla', 'Batido de vainilla 500ml', 15.00, 'otro', 120);

GO


-- 9. INVENTARIO_CARRITO (Carga del día actual)
INSERT INTO Inventario_Carrito (id_carrito, id_producto, cantidad_cargada, cantidad_actual, fecha_carga, fecha_cierre) VALUES 
-- Carrito C001 (Juan) - Inventario actual
(1, 1, 50, 45, '2025-12-12 08:00:00', NULL),  -- 50 conos vainilla, quedan 45
(1, 2, 40, 35, '2025-12-12 08:00:00', NULL),  -- 40 conos chocolate, quedan 35
(1, 4, 30, 25, '2025-12-12 08:00:00', NULL),  -- 30 paletas frutilla, quedan 25

-- Carrito C002 (María) - Inventario actual
(2, 1, 45, 40, '2025-12-12 08:00:00', NULL),  -- 45 conos vainilla, quedan 40
(2, 3, 35, 30, '2025-12-12 08:00:00', NULL),  -- 35 conos frutilla, quedan 30
(2, 5, 40, 35, '2025-12-12 08:00:00', NULL),  -- 40 paletas limón, quedan 35

-- Carrito C004 (Pedro) - Inventario actual
(4, 2, 50, 42, '2025-12-12 08:00:00', NULL),  -- 50 conos chocolate, quedan 42
(4, 7, 30, 26, '2025-12-12 08:00:00', NULL),  -- 30 vasos chocolate, quedan 26
(4, 4, 35, 30, '2025-12-12 08:00:00', NULL),  -- 35 paletas frutilla, quedan 30

-- Inventario cerrado del día anterior (1 dic)
(1, 1, 50, 0, '2025-12-01 08:00:00', '2025-12-01 18:00:00'),  -- Todo vendido
(1, 4, 30, 0, '2025-12-01 08:00:00', '2024-12-01 18:00:00'),  -- Todo vendido
(2, 1, 45, 5, '2025-12-01 08:00:00', '2024-12-01 18:00:00'),  -- Sobraron 5
(2, 5, 40, 8, '2025-12-01 08:00:00', '2024-12-01 18:00:00');  -- Sobraron 8

GO

-- 10. VENTAS
INSERT INTO Ventas (id_cliente, id_empleado, id_carrito, fecha_venta) VALUES 
-- Ventas del día anterior (1 dic)
(1, 2, 1, '2025-12-01 10:30:00'),
(2, 2, 1, '2025-12-01 11:45:00'),
(3, 3, 2, '2025-12-01 12:15:00'),
(4, 3, 2, '2025-12-01 14:30:00'),
(5, 5, 3, '2025-12-01 15:00:00'),

-- Ventas de HOY (12 dic)
(6, 2, 1, '2025-12-12 10:00:00'),
(7, 2, 1, '2025-12-12 11:20:00'),
(8, 3, 2, '2025-12-12 10:45:00'),
(9, 3, 2, '2025-12-12 12:30:00'),
(10, 5, 4, '2025-12-12 11:00:00');

GO


-- 11. DETALLE_VENTA
INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario) VALUES 
-- Detalles de venta 1 (Cliente Roberto)
(1, 1, 2, 10.00),  -- 2 conos vainilla
(1, 4, 1, 8.00),   -- 1 paleta frutilla

-- Detalles de venta 2
(2, 1, 3, 10.00),  -- 3 conos vainilla
(2, 4, 2, 8.00),   -- 2 paletas frutilla

-- Detalles de venta 3
(3, 1, 1, 10.00),  -- 1 cono vainilla
(3, 5, 3, 8.00),   -- 3 paletas limón

-- Detalles de venta 4
(4, 1, 2, 10.00),  -- 2 conos vainilla
(4, 3, 1, 10.00),  -- 1 cono frutilla

-- Detalles de venta 5
(5, 2, 2, 10.00),  -- 2 conos chocolate

-- Detalles de venta 6 (HOY)
(6, 1, 3, 10.00),  -- 3 conos vainilla
(6, 2, 2, 10.00),  -- 2 conos chocolate

-- Detalles de venta 7 (HOY)
(7, 4, 2, 8.00),   -- 2 paletas frutilla

-- Detalles de venta 8 (HOY)
(8, 1, 2, 10.00),  -- 2 conos vainilla
(8, 3, 3, 10.00),  -- 3 conos frutilla

-- Detalles de venta 9 (HOY)
(9, 5, 5, 8.00),   -- 5 paletas limón

-- Detalles de venta 10 (HOY)
(10, 2, 4, 10.00), -- 4 conos chocolate
(10, 7, 2, 12.00), -- 2 vasos chocolate
(10, 4, 3, 8.00);  -- 3 paletas frutilla

