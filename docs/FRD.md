# Functional Requirements Document (FRD) — Nori House

## Alcance actual

Este documento describe el comportamiento implementado en el código actual de Nori House: consulta del menú y del detalle de producto, selección y confirmación de pedidos, almacenamiento en Supabase y chatbot de consultas del catálogo.

## 1. Menú público

**Archivos:** `index.html`, `script.js` y `data/products.json`.

### Qué ve el cliente

- Nombre de Nori House y enlace «Hacer un pedido».
- Categorías del catálogo y filtro «Todos».
- Tarjetas de productos disponibles con imagen, nombre, categoría, descripción, precio en quetzales y acceso al detalle.
- Indicador de carga mientras se consulta el catálogo.

### Comportamiento

- El menú lee `data/products.json`.
- La lista muestra los productos cuyo campo `available` no sea `false`.
- Elegir una categoría filtra los productos mostrados.
- Seleccionar una tarjeta abre el detalle mediante `#product/{id}`.
- Si falla la carga o no hay productos disponibles para mostrar, aparece un mensaje de ausencia de productos.

## 2. Detalle del producto e inicio del pedido

### Qué ve el cliente

- Imagen, nombre, categoría, disponibilidad y precio.
- Descripción, detalles e ingredientes registrados en el catálogo.
- Enlace «Volver al menú».
- Enlace «Hacer un pedido» en el encabezado de la página.

### Flujo desde el producto

1. El cliente abre un producto desde el menú.
2. Consulta sus detalles.
3. Pulsa «Hacer un pedido» en el encabezado.
4. Se abre `pedido.html`, donde selecciona los productos y sus cantidades.

El enlace abre el formulario general: el producto consultado no se transfiere ni se preselecciona automáticamente.

Si el identificador no corresponde a un producto existente o el producto tiene `available: false`, el detalle muestra «Este producto no está disponible» y permite volver al menú.

## 3. Selección de productos y confirmación

**Archivo:** `pedido.html`.

### Qué ve el cliente

- Formulario «Haz tu pedido».
- Campo obligatorio «Cliente», con un máximo de 100 caracteres.
- Productos disponibles del catálogo con nombre, precio, casilla de selección y cantidad.
- Botón «Confirmar pedido».
- Mensaje de confirmación o error.

### Entradas y comportamiento

- El formulario carga `data/products.json` y excluye los productos con `available: false`.
- El cliente puede seleccionar uno o varios productos.
- La cantidad comienza en 1, admite valores enteros entre 1 y 20 y se habilita al marcar el producto.
- Para enviar, debe indicar su nombre y seleccionar al menos un producto.
- El botón permanece deshabilitado durante la carga inicial y durante el envío; al enviar muestra «Enviando…».
- La solicitud a `POST /api/pedidos` contiene `cliente` y un arreglo `productos` con `nombre` y `cantidad`.
- El cliente no introduce folio, estado ni hora.
- El enlace de Nori House en el encabezado permite regresar a `index.html`.

### Resultado

- Si la API confirma el guardado, aparece «¡Pedido confirmado! Folio: {folio}. Estado: {estado}.».
- La confirmación se muestra en el mismo formulario.
- Tras el éxito, el formulario se limpia y los campos de cantidad vuelven a quedar deshabilitados.
- La hora devuelta por la API no se muestra en el mensaje de confirmación.
- Si no hay productos seleccionados, aparece «Selecciona al menos un producto.».
- Si falla la carga del catálogo, se muestra un error y el botón de confirmación permanece deshabilitado.
- Si falla el envío, se muestra el error, se conserva la selección y se habilita nuevamente el botón.

## 4. Guardado del pedido en Supabase

**Función serverless:** `api/pedidos.mjs`, accesible mediante `POST /api/pedidos`.

### Validaciones implementadas

- Solo se acepta el método POST.
- El nombre del cliente debe contener texto y tener como máximo 100 caracteres después de eliminar espacios al inicio y al final.
- Debe existir al menos un producto.
- Cada producto debe tener un nombre no vacío de hasta 100 caracteres y una cantidad entera entre 1 y 20.
- El resumen de productos no puede superar 500 caracteres.

### Almacenamiento y respuesta

- La función utiliza `SUPABASE_SERVICE_KEY` exclusivamente en el servidor.
- Inserta en la tabla `pedidos` el nombre del cliente y un resumen textual de productos, por ejemplo: `2 x California Roll, 1 x Salmon Nigiri`.
- El folio, estado y hora se obtienen del registro devuelto por Supabase; la solicitud de inserción no establece esos campos.
- La función exige recibir folio y estado para devolver éxito.
- Devuelve HTTP 201 con `ok`, `message`, `folio`, `estado` y `hora`.
- Si Supabase guarda el pedido pero no devuelve folio o estado, la API responde con un error 502 que explica esa situación.
- Los errores de validación, configuración, conexión o de Supabase se devuelven como errores al formulario.

La selección disponible se controla en el formulario mediante el catálogo. La API valida nombres y cantidades, pero no vuelve a consultar el catálogo para comprobar existencia o disponibilidad. Los precios se muestran al cliente; el guardado actual almacena el resumen de nombres y cantidades, sin calcular ni almacenar un total desde esta función.

## 5. Chatbot del catálogo

**Archivos:** `chatbot.js`, `chatbot.css`, `api/chat.mjs` y `data/products.json`.

### Acceso e interacción

- El botón flotante «¿Dudas del menú?» está disponible en la página pública `index.html`, tanto en el menú como en el detalle del producto.
- Abre una ventana con saludo, mensajes, campo de pregunta y botón «Enviar».
- La ventana se cierra con el botón de cierre, el botón flotante o Escape cuando el foco está dentro del chatbot.
- Admite preguntas de hasta 500 caracteres y evita enviar otra consulta mientras espera una respuesta.
- Durante la consulta muestra «Consultando el menú…».
- Si falla la consulta o supera 15 segundos, muestra un error y permite reintentar.

### Fuente y funcionamiento

- El navegador envía `{ message }` a `POST /api/chat`.
- La función serverless `api/chat.mjs` lee `data/products.json` y devuelve `{ reply }`.
- Las respuestas se construyen mediante reglas y búsquedas del catálogo, sin OpenAI, modelos externos ni claves de API.
- Utiliza nombres, precios, disponibilidad, categorías, descripciones, detalles e ingredientes registrados.
- Reconoce preguntas sencillas, normaliza mayúsculas y tildes y contempla variantes como «rollos», «rollo» y «roll».
- Cada pregunta se procesa de manera independiente, sin utilizar los mensajes anteriores como contexto.
- Las consultas externas o no reconocidas reciben una indicación de que el chatbot solo ayuda con información de Nori House y su menú.
- Cuando una búsqueda reconocida no encuentra coincidencias, informa que no encontró productos.
- El chatbot no crea pedidos ni consulta Supabase.
- Si la función no puede consultar el catálogo, devuelve un error 503. Los mensajes inválidos reciben un error de validación.

### Ejemplos admitidos

- «¿Cuánto cuesta el California Roll?» muestra su precio y datos del catálogo.
- «¿Qué rollos tienen?» muestra los productos identificados como rollos, incluidas las especialidades que coincidan.
- «¿Está disponible el Salmon Nigiri?» muestra la disponibilidad registrada de ese producto.
- «¿Qué productos tienen salmón?» busca coincidencias en los datos del catálogo.
- «¿Qué entradas tienen?» muestra las entradas registradas.
- «¿Qué categorías tienen?» enumera las categorías del catálogo.
- «¿Qué productos están disponibles?» filtra por disponibilidad.
- «¿Quién es el presidente?» recibe el mensaje que limita la ayuda al restaurante.

## 6. Límites del alcance implementado

El flujo actual utiliza un formulario de selección y confirmación. No incluye carrito independiente, cálculo de total, pago en línea, datos de entrega ni seguimiento del pedido después de la confirmación.

No hay pantallas implementadas de inicio de sesión, registro de restaurantes, dashboard, edición del menú, administración de pedidos o suscripciones. Esas pantallas no forman parte de los requisitos funcionales actuales descritos aquí.

Las rutas `/api/pedidos` y `/api/chat` requieren un entorno que ejecute las funciones serverless del proyecto; un servidor de archivos estáticos por sí solo no ejecuta esas rutas.
