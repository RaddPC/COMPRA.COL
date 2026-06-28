/* =====================================================
   COMPRACOL — TIENDA MULTI-PRODUCTO
   Lógica: catálogo dinámico + carrito + checkout WhatsApp
   ===================================================== */

/* =========== 1. CONFIGURACIÓN EDITABLE =========== */
const CONFIG = {
  // Número de WhatsApp SIN signos ni espacios, con código de país.
  // Ejemplo Colombia: "573001234567"
  whatsappNumber: "573332420240",

  // Nombre de la empresa / marca (se usa en el mensaje de WhatsApp)
  nombreEmpresa: "CompraCol",

  // Símbolo / formato de moneda mostrado en pantalla
  moneda: "$",

  // Mensaje que se abre al tocar el botón flotante de WhatsApp (sin pedido)
  mensajeFlotante: "Hola, quiero más información sobre los productos 🙋📦✅",

  // Mensaje del botón "Preguntar" del hero
  mensajeHero: "Hola, vi su catálogo y quiero más información 🙋📦✅"
};

/* =========== 2. CATÁLOGO DE PRODUCTOS (EDITABLE) =========== */
/* Agregá, quitá o editá productos aquí. "id" debe ser único.   */
/* "tag" es opcional: úsalo para "Nuevo", "-20%", "Más vendido". */
const PRODUCTS = [
  { id: "p1",  name: "Tensiometro Digital",  price: 79900,  oldPrice: 99900,  tag: "Más vendido", img: "007.png" },
  { id: "p2",  name: "Manilla Repelente de Mosquito",  price: 49900,  oldPrice: null,   tag: null, img: "008.png" },
  { id: "p3",  name: "Dispositivo Neurocontrol del sueño",  price: 79900,  oldPrice: 119900, tag: "-25%", img: "10.png" },
  { id: "p4",  name: "Banda Elastica GYM X5",  price: 49900,  oldPrice: null,   tag: "Nuevo", img: "003.png" },
  { id: "p5",  name: "SHILAJIT Combo X3",  price: 99900,  oldPrice: 139900,  tag: null, img: "004.png" },
  { id: "p6",  name: "SmileKit Blanqueador Dental",  price: 49900,  oldPrice: null,   tag: null, img: "005.png" },
  { id: "p7",  name: "Rodillera Termica Electrica",  price: 79900,  oldPrice: 99900, tag: "-29%", img: "006.png" },
  { id: "p8",  name: "Reflector Solar X3",  price: 99900,  oldPrice: null,   tag: null, img: "001.png" },
  { id: "p9",  name: "Rodilleras De Bebe AntiDeslizante",  price: 39900,  oldPrice: 59900,  tag: null, img: "009.png" },
  { id: "p10", name: "Bascula electronica con bluethoot", price: 79900,  oldPrice: null,   tag: "Nuevo", img: "02.png" }
];

/* =========== 3. ESTADO DEL CARRITO =========== */
let cart = {}; // { productId: cantidad }

/* =========== 4. UTILIDADES =========== */
function formatearPrecio(valor) {
  return CONFIG.moneda + valor.toLocaleString("es-CO");
}

function construirLinkWhatsapp(mensaje) {
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${texto}`;
}

function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function cartTotalItems() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotalPrice() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = getProduct(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

/* =========== 5. RENDER DEL CATÁLOGO =========== */
function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <div class="product-card__media">
        <img src="${p.img}" alt="${p.name}" data-edit="imagen-${p.id}">
        ${p.tag ? `<span class="product-card__tag">${p.tag}</span>` : ""}
      </div>
      <div class="product-card__body">
        <span class="product-card__name" data-edit="nombre-${p.id}">${p.name}</span>
        <div class="product-card__prices">
          <span class="product-card__price" data-edit="precio-${p.id}">${formatearPrecio(p.price)}</span>
          ${p.oldPrice ? `<span class="product-card__price-old">${formatearPrecio(p.oldPrice)}</span>` : ""}
        </div>
        <button class="product-card__add" data-id="${p.id}">Agregar al pedido</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".product-card__add").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      btn.textContent = "✓ Agregado";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = "Agregar al pedido";
        btn.classList.remove("added");
      }, 1200);
    });
  });
}

/* =========== 6. LÓGICA DEL CARRITO =========== */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  updateCartCount();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  document.getElementById("cart-count").textContent = cartTotalItems();
}

function renderCart() {
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty" id="cart-empty">Tu carrito está vacío. Agregá productos del catálogo.</p>';
  } else {
    itemsEl.innerHTML = entries.map(([id, qty]) => {
      const p = getProduct(id);
      if (!p) return "";
      return `
        <div class="cart-item" data-id="${id}">
          <img src="${p.img}" alt="${p.name}">
          <div class="cart-item__info">
            <span class="cart-item__name">${p.name}</span>
            <span class="cart-item__price">${formatearPrecio(p.price)}</span>
          </div>
          <div class="cart-item__qty">
            <button class="qty-minus" data-id="${id}">−</button>
            <span>${qty}</span>
            <button class="qty-plus" data-id="${id}">+</button>
          </div>
          <button class="cart-item__remove" data-id="${id}">Quitar</button>
        </div>
      `;
    }).join("");

    itemsEl.querySelectorAll(".qty-minus").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.id, -1)));
    itemsEl.querySelectorAll(".qty-plus").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.id, 1)));
    itemsEl.querySelectorAll(".cart-item__remove").forEach(b => b.addEventListener("click", () => removeFromCart(b.dataset.id)));
  }

  document.getElementById("cart-total").textContent = formatearPrecio(cartTotalPrice());
}

/* =========== 7. ABRIR / CERRAR CARRITO Y CHECKOUT =========== */
function openCart() {
  document.getElementById("cart-drawer").classList.add("active");
  document.getElementById("cart-overlay").classList.add("active");
}
function closeCart() {
  document.getElementById("cart-drawer").classList.remove("active");
  document.getElementById("cart-overlay").classList.remove("active");
}
function openCheckout() {
  if (cartTotalItems() === 0) {
    alert("Agregá al menos un producto antes de finalizar el pedido.");
    return;
  }
  renderCheckoutSummary();
  closeCart();
  document.getElementById("checkout-modal").classList.add("active");
  document.getElementById("checkout-overlay").classList.add("active");
}
function closeCheckout() {
  document.getElementById("checkout-modal").classList.remove("active");
  document.getElementById("checkout-overlay").classList.remove("active");
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById("checkout-summary");
  summaryEl.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const p = getProduct(id);
    if (!p) return "";
    return `
      <div class="checkout-form__summary-row">
        <span>${qty} × ${p.name}</span>
        <span>${formatearPrecio(p.price * qty)}</span>
      </div>
    `;
  }).join("");

  document.getElementById("checkout-form-total").textContent = formatearPrecio(cartTotalPrice());
}

/* =========== 7.1 MODAL DE POLÍTICAS DE ENVÍO Y DEVOLUCIONES =========== */
function openPolicies() {
  document.getElementById("policies-modal").classList.add("active");
  document.getElementById("policies-overlay").classList.add("active");
}
function closePolicies() {
  document.getElementById("policies-modal").classList.remove("active");
  document.getElementById("policies-overlay").classList.remove("active");
}

/* =========== 8. INICIALIZACIÓN =========== */
/* bindClick / bindHref: si el elemento no existe en el HTML, se avisa en   */
/* consola pero el resto del script sigue funcionando con normalidad.      */
function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("click", handler);
  } else {
    console.warn(`[CompraCol] No se encontró el elemento #${id} (revisa el HTML).`);
  }
}

function bindHref(id, url) {
  const el = document.getElementById(id);
  if (el) {
    el.href = url;
  } else {
    console.warn(`[CompraCol] No se encontró el elemento #${id} (revisa el HTML).`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  renderCart();

  bindHref("float-whatsapp", construirLinkWhatsapp(CONFIG.mensajeFlotante));
  bindHref("hero-whatsapp", construirLinkWhatsapp(CONFIG.mensajeHero));
  bindHref("policies-whatsapp", construirLinkWhatsapp("Hola, tengo una duda sobre mi pedido 🙋"));

  bindClick("open-cart", openCart);
  bindClick("close-cart", closeCart);
  bindClick("cart-overlay", closeCart);

  bindClick("go-checkout", openCheckout);
  bindClick("close-checkout", closeCheckout);
  bindClick("checkout-overlay", closeCheckout);

  bindClick("open-policies", openPolicies);
  bindClick("close-policies", closePolicies);
  bindClick("policies-overlay", closePolicies);

  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    if (!nombre || !telefono || !direccion) {
      alert("Por favor completá todos los campos antes de continuar.");
      return;
    }

    const lineas = Object.entries(cart).map(([id, qty]) => {
      const p = getProduct(id);
      return `• ${qty} × ${p.name} — ${formatearPrecio(p.price * qty)}`;
    }).join("\n");

    const mensaje =
      `🛒 *Nuevo pedido — ${CONFIG.nombreEmpresa}*\n\n` +
      `${lineas}\n\n` +
      `*Total:* ${formatearPrecio(cartTotalPrice())}\n\n` +
      `*Nombre:* ${nombre}\n` +
      `*Teléfono:* ${telefono}\n` +
      `*Dirección de envío:* ${direccion}\n\n` +
      `Quedo a la espera de la confirmación. ¡Gracias!`;

      window.open(construirLinkWhatsapp(mensaje), "_blank");
    });
  }
});
