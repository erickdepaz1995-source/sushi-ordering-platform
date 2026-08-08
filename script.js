const state = { products: [], cart: new Map(), category: "Todos" };
const grid = document.querySelector("#productGrid");
const filters = document.querySelector("#categoryFilters");
const loading = document.querySelector("#loadingState");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const cartSummary = document.querySelector("#cartSummary");
const money = value => `Q${Number(value).toFixed(2)}`;

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("No fue posible cargar el menú.");
    state.products = await response.json();
    renderFilters();
    renderProducts();
  } catch (error) {
    loading.innerHTML = `<p class="text-danger">${error.message} Ejecuta el sitio desde un servidor local.</p>`;
  }
}
function renderFilters() {
  const categories = ["Todos", ...new Set(state.products.map(product => product.category))];
  filters.innerHTML = categories.map(category => `<button class="filter-btn ${category === state.category ? "active" : ""}" type="button" data-category="${category}">${category}</button>`).join("");
}
function renderProducts() {
  const visible = state.category === "Todos" ? state.products : state.products.filter(product => product.category === state.category);
  loading.classList.add("d-none");
  grid.innerHTML = visible.map(product => `<article class="col-sm-6 col-lg-4"><div class="product-card"><div class="product-image-wrap"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-tag">${product.category}</span></div><div class="product-body"><h3>${product.name}</h3><p class="product-description">${product.description}</p><div class="d-flex justify-content-between align-items-center"><span class="price">${money(product.price)}</span><button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito">+</button></div></div></div></article>`).join("");
}
function updateCart() {
  const entries = [...state.cart.entries()];
  cartCount.textContent = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  if (!entries.length) {
    cartItems.innerHTML = `<div class="cart-empty"><div><span>🛍</span><h3 class="mt-3">Tu pedido está vacío</h3><p>Agrega tus favoritos del menú.</p></div></div>`;
    cartSummary.classList.add("d-none");
    return;
  }
  let total = 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = state.products.find(item => item.id === id);
    total += product.price * quantity;
    return `<div class="cart-item"><img src="${product.image}" alt=""><div><h3>${product.name}</h3><span class="cart-item-price">${money(product.price)}</span></div><div class="quantity-control"><button data-change="${id}" data-delta="-1" aria-label="Quitar uno">−</button><strong>${quantity}</strong><button data-change="${id}" data-delta="1" aria-label="Agregar uno">+</button></div></div>`;
  }).join("");
  cartTotal.textContent = money(total);
  cartSummary.classList.remove("d-none");
}
filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  renderFilters(); renderProducts();
});
grid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  updateCart(); button.textContent = "✓";
  window.setTimeout(() => { button.textContent = "+"; }, 650);
});
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;
  const id = Number(button.dataset.change);
  const next = state.cart.get(id) + Number(button.dataset.delta);
  next > 0 ? state.cart.set(id, next) : state.cart.delete(id);
  updateCart();
});
document.querySelector("#checkoutButton").addEventListener("click", () => {
  state.cart.clear(); updateCart();
  bootstrap.Offcanvas.getOrCreateInstance("#cartPanel").hide();
  bootstrap.Toast.getOrCreateInstance("#orderToast", { delay: 4000 }).show();
});
updateCart();
loadProducts();
