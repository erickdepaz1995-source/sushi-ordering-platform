const SUPABASE_URL = "https://yqilxusgnttmatpvqbfq.supabase.co";

function sendJson(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json");
  return response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return sendJson(response, 500, {
      error: "SUPABASE_SERVICE_KEY is not configured"
    });
  }

  const { cliente, productos } = request.body ?? {};
  const productosNormalizados = Array.isArray(productos)
    ? productos
        .filter(item => item && typeof item.nombre === "string" && Number.isInteger(item.cantidad))
        .map(item => ({ nombre: item.nombre.trim(), cantidad: item.cantidad }))
    : [];

  if (
    typeof cliente !== "string" || !cliente.trim() || cliente.trim().length > 100 ||
    productosNormalizados.length !== productos?.length ||
    !productosNormalizados.length ||
    productosNormalizados.some(item => !item.nombre || item.nombre.length > 100 || item.cantidad < 1 || item.cantidad > 20)
  ) {
    return sendJson(response, 400, {
      error: "Solicitud inválida. Se requiere cliente y al menos un producto con cantidad entre 1 y 20."
    });
  }

  const resumenProductos = productosNormalizados
    .map(item => `${item.cantidad} x ${item.nombre}`)
    .join(", ");

  if (resumenProductos.length > 500) {
    return sendJson(response, 400, { error: "La selección de productos es demasiado larga." });
  }

  try {
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/pedidos?select=folio,estado,hora`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        cliente: cliente.trim(),
        productos: resumenProductos
      })
    });

    if (!supabaseResponse.ok) {
      const error = await supabaseResponse.json().catch(() => ({
        message: "Supabase returned an unreadable error response"
      }));
      return sendJson(response, supabaseResponse.status, { error });
    }

    const rows = await supabaseResponse.json();
    const pedidoCreado = rows[0];

    if (!pedidoCreado?.folio || !pedidoCreado?.estado) {
      return sendJson(response, 502, {
        error: "Supabase guardó el pedido, pero no devolvió el folio y el estado."
      });
    }

    return sendJson(response, 201, {
      ok: true,
      message: "Pedido guardado correctamente",
      folio: pedidoCreado.folio,
      estado: pedidoCreado.estado,
      hora: pedidoCreado.hora
    });
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
