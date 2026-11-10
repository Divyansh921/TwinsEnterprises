import { products } from "./products.js";

const imagePath = (filename) => encodeURIComponent(filename).replaceAll("%2F", "/");
const whatsappUrl = (message) => `https://wa.me/919015763074?text=${encodeURIComponent(message)}`;
const categories = ["All pieces", ...new Set(products.map((product) => product.category))];

const grid = document.querySelector("#product-grid");
const filters = document.querySelector("#category-filters");
const search = document.querySelector("#product-search");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const homeView = document.querySelector("#home-view");
const detailView = document.querySelector("#product-view");
let activeCategory = "All pieces";
let query = "";

function productCard(product) {
  const image = imagePath(product.image);
  return `
    <article class="product-card">
      <a class="product-card-image" href="?product=${encodeURIComponent(product.id)}" aria-label="View ${product.name} details">
        <img src="${image}" alt="${product.name} — original product catalogue artwork" loading="lazy" width="816" height="816">
        <span class="card-view">View piece <span aria-hidden="true">↗</span></span>
      </a>
      <div class="product-card-info">
        <div class="product-card-meta"><span>${product.category}</span><span aria-hidden="true">·</span><span>${product.materials?.[0] ?? "Details in catalogue"}</span></div>
        <h3><a href="?product=${encodeURIComponent(product.id)}">${product.name}</a></h3>
        <p>${product.description}</p>
        <a class="card-inquiry" href="${whatsappUrl(`Hello Twins Enterprises, I would like to enquire about the ${product.name}.`)}" target="_blank" rel="noopener noreferrer">Enquire about this piece <span aria-hidden="true">↗</span></a>
      </div>
    </article>`;
}

function renderFilters() {
  filters.innerHTML = categories.map((category) => `
    <button class="filter-button${category === activeCategory ? " is-active" : ""}" type="button" aria-pressed="${category === activeCategory}" data-category="${category}">${category}</button>
  `).join("");
}

function renderProducts() {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All pieces" || product.category === activeCategory;
    const searchable = `${product.name} ${product.category} ${product.description} ${product.materials.join(" ")} ${product.features.join(" ")}`.toLocaleLowerCase();
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  grid.innerHTML = visibleProducts.map(productCard).join("");
  resultCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`;
  emptyState.hidden = visibleProducts.length !== 0;
  grid.hidden = visibleProducts.length === 0;
}

function renderDetail(product) {
  document.title = `${product.name} | Twins Enterprises`;
  homeView.hidden = true;
  detailView.hidden = false;
  const materialList = product.materials?.length ? `<div class="detail-spec"><dt>Materials</dt><dd>${product.materials.map((material) => `<span>${material}</span>`).join("")}</dd></div>` : "";
  const dimensions = product.dimensions ? `<div class="detail-spec"><dt>Dimensions</dt><dd>${product.dimensions}${product.dimensionNote ? '<small>As indicated in the supplied product artwork.</small>' : ""}</dd></div>` : "";
  const features = product.features?.length ? `<div class="detail-spec"><dt>Details</dt><dd><ul>${product.features.map((feature) => `<li>${feature}</li>`).join("")}</ul></dd></div>` : "";
  const customization = product.features?.some((feature) => feature.toLowerCase().includes("custom")) ? '<p class="customization-note">Custom designs and sizes are mentioned in the supplied product artwork. Ask us about this piece.</p>' : "";

  detailView.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="./">Home</a><span aria-hidden="true">/</span><a href="./#collection">Collection</a><span aria-hidden="true">/</span><span aria-current="page">${product.name}</span></nav>
    <div class="detail-grid">
      <div class="detail-image"><img src="${imagePath(product.image)}" alt="${product.name} — original product catalogue artwork" width="816" height="816"></div>
      <div class="detail-content">
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
        <p class="detail-description">${product.description}</p>
        <dl class="detail-specs">${dimensions}${materialList}${features}</dl>
        ${customization}
        <a class="button button-dark detail-cta" href="${whatsappUrl(`Hello Twins Enterprises, I would like to enquire about the ${product.name}.`)}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp <span aria-hidden="true">↗</span></a>
        <p class="detail-contact-note">Ask us about this product, a custom design, or a bulk inquiry.</p>
        <a class="back-link" href="./#collection">← Back to the collection</a>
      </div>
    </div>`;
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

search.addEventListener("input", () => {
  query = search.value;
  renderProducts();
});

document.querySelectorAll("[data-category-link]").forEach((link) => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.categoryLink;
    renderFilters();
    renderProducts();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});

renderFilters();
renderProducts();
document.querySelector("#current-year").textContent = String(new Date().getFullYear());

const productId = new URLSearchParams(window.location.search).get("product");
if (productId) {
  const product = products.find((entry) => entry.id === productId);
  if (product) {
    renderDetail(product);
  } else {
    document.title = "Product not found | Twins Enterprises";
    homeView.hidden = true;
    detailView.hidden = false;
    detailView.innerHTML = `<div class="not-found"><p class="eyebrow">PRODUCT NOT FOUND</p><h1>This piece isn’t in the collection.</h1><a class="button button-dark" href="./#collection">Browse the collection <span aria-hidden="true">↗</span></a></div>`;
  }
}
