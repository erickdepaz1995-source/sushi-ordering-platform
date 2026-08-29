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

  const { cliente, estado, hora, productos } = request.body ?? {};

  if (
    typeof cliente !== "string" || !cliente.trim() || cliente.length > 100 ||
    typeof estado !== "string" || !estado.trim() || estado.length > 30 ||
    typeof hora !== "string" || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(hora) ||
    typeof productos !== "string" || !productos.trim() || productos.length > 500
  ) {
    return sendJson(response, 400, {
      error: "Invalid request. cliente, estado, hora, and productos are required."
    });
  }

  try {
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        cliente: cliente.trim(),
        estado: estado.trim(),
        hora,
        productos: productos.trim()
      })
    });

    if (!supabaseResponse.ok) {
      const error = await supabaseResponse.json().catch(() => ({
        message: "Supabase returned an unreadable error response"
      }));
      return sendJson(response, supabaseResponse.status, { error });
    }

    return sendJson(response, 201, {
      ok: true,
      message: "Pedido guardado correctamente"
    });
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
