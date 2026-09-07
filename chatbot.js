(() => {
  const widget = document.createElement("aside");
  widget.className = "nh-chat";
  widget.setAttribute("aria-label", "Asistente de Nori House");
  widget.innerHTML = `
    <section class="nh-chat-panel" id="nh-chat-panel" aria-labelledby="nh-chat-title" hidden>
      <header class="nh-chat-header"><h2 id="nh-chat-title">Nori House · Chat</h2><button type="button" class="nh-chat-close" aria-label="Cerrar chat">×</button></header>
      <div class="nh-chat-messages" role="log" aria-label="Conversación" aria-live="polite" tabindex="0"></div>
      <form class="nh-chat-form">
        <label for="nh-chat-input">Tu pregunta sobre el menú</label>
        <div class="nh-chat-controls"><input id="nh-chat-input" name="message" maxlength="500" required autocomplete="off" placeholder="¿Qué productos tienen salmón?"><button type="submit">Enviar</button></div>
        <span class="nh-chat-status" role="status"></span>
      </form>
    </section>
    <button class="nh-chat-toggle" type="button" aria-expanded="false" aria-controls="nh-chat-panel">¿Dudas del menú?</button>`;
  document.body.append(widget);
  const panel = widget.querySelector(".nh-chat-panel");
  const toggle = widget.querySelector(".nh-chat-toggle");
  const input = widget.querySelector("input");
  const form = widget.querySelector("form");
  const submit = form.querySelector("button");
  const messages = widget.querySelector(".nh-chat-messages");
  const status = widget.querySelector(".nh-chat-status");
  let pending = false;

  function addMessage(text, author) {
    const item = document.createElement("p");
    item.className = `nh-chat-message nh-chat-${author}`;
    item.textContent = `${author === "user" ? "Tú" : "Nori House"}: ${text}`;
    messages.append(item);
    while (messages.children.length > 40) messages.firstElementChild.remove();
    messages.scrollTop = messages.scrollHeight;
  }
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    (open ? input : toggle).focus();
  }
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  widget.querySelector(".nh-chat-close").addEventListener("click", () => setOpen(false));
  widget.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  addMessage("¡Hola! Consulta precios, ingredientes, categorías y disponibilidad de nuestro menú. Por ejemplo: ¿Cuánto cuesta el Philadelphia Roll?", "bot");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || pending) return;
    pending = true;
    submit.disabled = true;
    input.value = "";
    addMessage(message, "user");
    status.textContent = "Consultando el menú…";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Chat unavailable");
      const data = await response.json();
      if (typeof data.reply !== "string") throw new Error("Invalid reply");
      addMessage(data.reply, "bot");
    } catch {
      addMessage("No pude consultar el menú. Inténtalo de nuevo en un momento.", "bot");
      if (!input.value) input.value = message;
    } finally {
      clearTimeout(timeout);
      pending = false;
      submit.disabled = false;
      status.textContent = "";
    }
  });
})();
