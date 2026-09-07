import { readFile } from "node:fs/promises";

const normalize = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const aliases = { rollos: "roll", rollo: "roll", rolls: "roll", categorias: "categoria", entradas: "entrada" };
const words = text => (normalize(text).match(/[a-z0-9]+/g) ?? []).map(word => aliases[word] ?? word);
const ignored = new Set(words("que cuanto cuesta cuestan vale valen precio precios tienen tiene hay de del la el los las un una y en es son esta estan me dime muestra mostrar ver quiero saber conocer sobre por favor cual cuales con productos producto platos plato opciones opcion menu nori house categoria descripcion descripciones detalles ingredientes ingrediente disponible disponibles disponibilidad no agotado agotados"));
const fallback = "Solo puedo ayudar con información del restaurante Nori House y su menú. Pregunta por un producto, categoría, precio, ingrediente o disponibilidad.";
const searchable = product => words([product.name, product.category, product.description, product.details, product.ingredients].join(" "));

export function answerQuestion(message, products) {
  const tokens = words(message);
  if (/^(hola|buenas|buenos dias|buenas tardes|gracias)[! .¿?]*$/.test(normalize(message))) {
    return "¡Hola! Puedo ayudarte con los productos, precios, categorías y disponibilidad del menú de Nori House.";
  }
  const terms = tokens.filter(word => !ignored.has(word));
  const vocabulary = new Set(products.flatMap(searchable));
  // Reject unsupported words even if the question also mentions a real product.
  if (terms.some(word => !vocabulary.has(word))) return fallback;
  const menuIntent = tokens.some(word => ["menu", "producto", "productos", "plato", "platos", "opciones", "categoria", "precios", "disponibles", "disponibilidad", "agotados"].includes(word));
  if (!terms.length && !menuIntent) return fallback;
  if (tokens.includes("categoria") && !terms.length) {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.length ? `Las categorías de Nori House son: ${categories.join(", ")}.` : "El catálogo de Nori House está vacío.";
  }
  const phrase = ` ${tokens.join(" ")} `;
  const named = products.filter(product => phrase.includes(` ${words(product.name).join(" ")} `));
  let matches = products.filter(product => {
    const productWords = searchable(product);
    return terms.every(term => productWords.includes(term));
  });
  // A complete name takes precedence over ingredient matches for that name.
  if (named.length) matches = matches.filter(product => named.includes(product));
  const availabilityQuestion = tokens.some(word => ["disponible", "disponibles", "disponibilidad", "agotado", "agotados"].includes(word));
  if (availabilityQuestion && !named.length) {
    const unavailable = tokens.includes("no") || tokens.some(word => word.startsWith("agotad"));
    matches = matches.filter(product => unavailable ? product.available === false : product.available !== false);
  } else if (tokens.includes("no") && !availabilityQuestion) {
    return fallback;
  }
  if (!matches.length) return "No encontré productos que coincidan con esa consulta en el catálogo de Nori House.";
  return matches.map(product => `${product.name} — Q${Number(product.price).toFixed(2)}
Categoría: ${product.category}. ${product.available === false ? "No disponible" : "Disponible"}.
${product.description}${named.length ? `\n${product.details}\nIngredientes: ${product.ingredients}` : ""}`).join("\n\n");
}

function send(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  return response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Método no permitido." });
  }
  let body = request.body;
  if (typeof body === "string") {
    if (body.length > 4096) return send(response, 413, { error: "Mensaje demasiado largo." });
    try { body = JSON.parse(body); } catch { return send(response, 400, { error: "Solicitud inválida." }); }
  }
  if (typeof body?.message !== "string" || !body.message.trim() || body.message.length > 500) {
    return send(response, 400, { error: "Escribe una pregunta de entre 1 y 500 caracteres." });
  }
  try {
    const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
    return send(response, 200, { reply: answerQuestion(body.message.trim(), products) });
  } catch {
    return send(response, 503, { error: "No pude consultar el menú. Inténtalo de nuevo en un momento." });
  }
}
