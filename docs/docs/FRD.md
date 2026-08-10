# Functional Requirements Document (FRD)

## Project Overview

La plataforma es un sistema SaaS (Software as a Service) que permite a múltiples restaurantes de sushi administrar su negocio mediante una suscripción mensual. Cada restaurante cuenta con su propio espacio para gestionar su menú, recibir pedidos y administrar su operación, mientras que los clientes pueden realizar pedidos en línea desde el restaurante de su preferencia.

---

# Screen 1 – Restaurant Administrator Login

## Purpose
Permitir que el administrador del restaurante inicie sesión en la plataforma.

## What the user sees
- Logo de la plataforma.
- Campo de correo electrónico.
- Campo de contraseña.
- Botón "Iniciar sesión".
- Enlace "Olvidé mi contraseña".

## Inputs
- Correo electrónico.
- Contraseña.

## Outputs
- Acceso al Dashboard del restaurante.

## Edge Cases
- Correo inexistente.
- Contraseña incorrecta.
- Campos vacíos.
- Cuenta desactivada.

---

# Screen 2 – Restaurant Registration

## Purpose
Permitir que un nuevo restaurante se registre en la plataforma.

## What the user sees
- Nombre del restaurante.
- Nombre del administrador.
- Correo electrónico.
- Teléfono.
- Contraseña.
- Confirmar contraseña.
- Botón "Crear cuenta".

## Inputs
- Datos del restaurante.
- Datos del administrador.

## Outputs
- Creación de una nueva cuenta.

## Edge Cases
- Correo ya registrado.
- Contraseñas diferentes.
- Campos obligatorios vacíos.

---

# Screen 3 – Dashboard

## Purpose
Mostrar un resumen general del restaurante.

## What the user sees
- Total de pedidos del día.
- Pedidos pendientes.
- Pedidos completados.
- Ventas del día.
- Acceso rápido al menú y pedidos.

## Inputs
- Ninguno.

## Outputs
- Información actualizada del restaurante.

## Edge Cases
- No existen pedidos.
- Sin conexión al servidor.

---

# Screen 4 – Menu Management

## Purpose
Permitir administrar los productos del restaurante.

## What the user sees
- Lista de productos.
- Botón para agregar producto.
- Botón editar.
- Botón eliminar.

## Inputs
- Nombre del producto.
- Descripción.
- Precio.
- Imagen.
- Categoría.
- Disponibilidad.

## Outputs
- Menú actualizado.

## Edge Cases
- Precio inválido.
- Imagen no válida.
- Campos obligatorios vacíos.

---

# Screen 5 – Customer Menu

## Purpose
Permitir que el cliente visualice y explore el menú del restaurante.

## What the user sees
- Categorías.
- Productos.
- Precio.
- Fotografía.
- Controles para filtrar los productos por categoría.
- Acceso a la vista de detalle al seleccionar un producto.
- En la vista de detalle: imagen, categoría, disponibilidad, nombre, descripción, precio, detalles e ingredientes.
- Botón "Agregar al carrito" (trabajo futuro).

## Inputs
- Selección de una categoría para filtrar el menú.
- Selección de un producto para consultar su detalle.
- Selección de productos para agregarlos al carrito (trabajo futuro).

## Outputs
- Lista de productos filtrada por categoría.
- Información detallada del producto seleccionado.
- Productos agregados al carrito (trabajo futuro).

## D2 Implementation Status
- Implementado en D2: visualización del menú y de los productos disponibles.
- Implementado en D2: filtrado de productos por categoría.
- Implementado en D2: vista de detalle de producto con imagen, categoría, disponibilidad, nombre, descripción, precio, detalles e ingredientes.
- Trabajo futuro: carrito de compras y confirmación de pedidos.
- Trabajo futuro: inicio de sesión, registro, dashboard, administración del menú, administración de pedidos, suscripciones y demás funciones operativas descritas en este FRD.

## Edge Cases
- Producto agotado.
- Restaurante cerrado.
- Categoría sin productos disponibles.
- Producto seleccionado inexistente o no disponible.

---

# Screen 6 – Shopping Cart

## Purpose
Permitir revisar y confirmar el pedido.

## What the user sees
- Productos seleccionados.
- Cantidad.
- Precio.
- Total.
- Botón "Confirmar pedido".

## Inputs
- Modificación de cantidades.

## Outputs
- Pedido confirmado.

## Edge Cases
- Carrito vacío.
- Producto ya no disponible.

---

# Screen 7 – Order Management

## Purpose
Permitir al restaurante administrar los pedidos recibidos.

## What the user sees
- Lista de pedidos.
- Estado.
- Hora.
- Cliente.
- Botones para cambiar el estado.

## Inputs
- Cambio de estado del pedido.

## Outputs
- Pedido actualizado.

## Edge Cases
- Pedido cancelado.
- Error de conexión.

---

# Screen 8 – Subscription Management

## Purpose
Permitir administrar la suscripción del restaurante.

## What the user sees
- Plan contratado.
- Próxima fecha de pago.
- Historial de pagos.
- Botón para cambiar de plan.

## Inputs
- Selección del plan.

## Outputs
- Suscripción actualizada.

## Edge Cases
- Pago rechazado.
- Tarjeta vencida.
