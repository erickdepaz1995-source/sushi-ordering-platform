const state = { products: [], category: "Todos", loaded: false };
const menuScreen = document.querySelector("#menuScreen");
const detailScreen = document.querySelector("#detailScreen");
const grid = document.querySelector("#productGrid");
const filters = document.querySelector("#categoryFilters");
const menuState = document.querySelector("#menuState");
const detail = document.querySelector("#productDetail");
const money = value => `Q${Number(value).toFixed(2)}`;

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error();
    state.products = await response.json();
    state.loaded = true;
    renderFilters(); renderProducts(); route();
  } catch {
    state.loaded = true;
    showMenuMessage("No products are available right now. Please check again soon.");
  }
}

function showMenuMessage(message) {
  grid.innerHTML = ""; filters.innerHTML = "";
  menuState.classList.remove("d-none");
  menuState.innerHTML = `<div class="empty-state"><span aria-hidden="true">—</span><p>${message}</p></div>`;
}

function renderFilters() {
  const categories = ["Todos", ...new Set(state.products.map(product => product.category))];
  filters.innerHTML = categories.map(category => `<button class="filter-btn ${category === state.category ? "active" : ""}" type="button" data-category="${category}" aria-pressed="${category === state.category}">${category}</button>`).join("");
}

function renderProducts() {
  const products = state.products.filter(product => product.available !== false);
  const visible = state.category === "Todos" ? products : products.filter(product => product.category === state.category);
  if (!visible.length) return showMenuMessage("No products are available right now. Please check again soon.");
  menuState.classList.add("d-none");
  grid.innerHTML = visible.map(product => `<article class="col-sm-6 col-lg-4"><a class="product-card" href="#product/${product.id}" aria-label="Ver detalles de ${product.name}"><div class="product-image-wrap"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-tag">${product.category}</span></div><div class="product-body"><div class="d-flex justify-content-between align-items-start gap-3"><h2>${product.name}</h2><span class="availability"><span></span> Disponible</span></div><p class="product-description">${product.description}</p><div class="d-flex justify-content-between align-items-center"><span class="price">${money(product.price)}</span><span class="view-detail">Ver detalles <span aria-hidden="true">→</span></span></div></div></a></article>`).join("");
}

function renderDetail(product) {
  if (!product || product.available === false) {
    detail.innerHTML = `<div class="detail-empty"><span class="eyebrow">Producto no disponible</span><h1 id="detailTitle">Este producto no está disponible</h1><p>This product is not available right now. Go back to the menu to explore other options.</p><a class="btn btn-accent" href="#menu">Volver al menú</a></div>`;
    return;
  }
  detail.innerHTML = `<article class="detail-card"><div class="detail-image-wrap"><img src="${product.image}" alt="${product.name}"></div><div class="detail-content"><div class="d-flex flex-wrap gap-2 mb-3"><span class="detail-badge">${product.category}</span><span class="detail-badge availability-badge"><span></span> Disponible</span></div><h1 id="detailTitle">${product.name}</h1><p class="detail-description">${product.description}</p><div class="detail-price">${money(product.price)}</div><hr><h2>Detalles del producto</h2><p>${product.details}</p><h2>Ingredientes</h2><p>${product.ingredients}</p></div></article>`;
}

function route() {
  if (!state.loaded) return;
  const match = location.hash.match(/^#product\/(\d+)$/);
  if (match) {
    menuScreen.classList.add("d-none"); detailScreen.classList.remove("d-none");
    renderDetail(state.products.find(product => product.id === Number(match[1])));
    document.title = "Nori House | Detalle del producto";
  } else {
    detailScreen.classList.add("d-none"); menuScreen.classList.remove("d-none");
    document.title = "Nori House | Menú";
  }
  window.scrollTo(0, 0);
}

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category; renderFilters(); renderProducts();
});
window.addEventListener("hashchange", route);
loadProducts();
