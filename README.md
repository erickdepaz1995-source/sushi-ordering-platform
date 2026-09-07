# Sushi Ordering Platform

**Sushi Ordering Platform** is a multi-tenant SaaS platform that helps sushi restaurants manage online orders efficiently. Customers can browse the menu, place orders online, and receive order confirmations, while restaurant staff manage products and incoming orders from a single dashboard.

## Live Prototype

https://erickdepaz1995-source.github.io/sushi-ordering-platform/

The current D2 prototype allows users to browse the menu, filter products by category, and open a product detail view. Shopping cart, orders, login, and dashboard functionality are planned for future development.

## The Three Musts

- Customers can browse the sushi menu and place orders online.
- Restaurants can manage menu items and prices.
- Restaurants receive and manage customer orders in real time.

## Core Features at a Glance

| Feature | Priority |
|----------|----------|
| Browse Menu | Must |
| Online Ordering | Must |
| Order Management | Must |
### Live Product

Nori House is deployed and available on Vercel:

https://sushi-ordering-platform.vercel.app/

The product includes the sushi menu, product navigation, and an order form connected to Supabase for saving customer orders.

### Delivery 4: chatbot del catálogo de Nori House

El botón «¿Dudas del menú?» consulta `POST /api/chat`. La función serverless `api/chat.mjs` lee exclusivamente `data/products.json` y responde con nombres, precios en quetzales, disponibilidad, categorías, descripciones, detalles e ingredientes registrados.

El chatbot utiliza reglas sencillas y búsquedas del catálogo, sin modelos de IA, llamadas externas, API keys ni servicios de pago adicionales. No necesita `OPENAI_API_KEY`. No consulta ni modifica Supabase o pedidos.

Reconoce nombres completos, palabras del catálogo y preguntas sencillas, ignorando mayúsculas y tildes. «Rollos» incluye los productos identificados como roll en el nombre, categoría o descripción, incluyendo especialidades. Las consultas son independientes; mencionar el producto en cada pregunta. Las preguntas externas o no reconocidas reciben un mensaje que limita la ayuda a Nori House. No inventa horarios, promociones ni datos ausentes.

Ejemplos:

- «¿Cuánto cuesta el California Roll?» → Q45.00 según el catálogo actual.
- «¿Qué rollos tienen?» → California Roll, Philadelphia Roll, Spicy Tuna Roll y Ebi Tempura Roll.
- «¿Está disponible el Salmon Nigiri?» → disponibilidad registrada.
- «¿Qué productos tienen salmón?» → Philadelphia Roll y Salmon Nigiri.
- «¿Qué entradas tienen?» → Dumplings de cerdo.
- «¿Qué categorías tienen?» → categorías del catálogo.
- «¿Quién es el presidente?» → respuesta de alcance limitado al restaurante.

Para activar los cambios, desplegar nuevamente en el proyecto Vercel existente. No hay dependencias ni configuración nueva. GitHub Pages y los servidores de archivos estáticos no ejecutan la función serverless. La función acepta hasta 500 caracteres y devuelve `{ reply }`; si no puede leer el catálogo, devuelve un error genérico.

Pruebas con Node.js: `node --test tests/chat.test.mjs`. Comprueban consultas, cambios del catálogo, disponibilidad, rechazo de temas externos, validación HTTP y funcionamiento sin clave ni llamadas de red.

Después del despliegue, probar los ejemplos desde el botón del chat y comprobar que «Hacer un pedido» sigue abriendo el formulario existente.
