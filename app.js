// =========================
// Global Cart Utilities
// =========================

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
}

function addToCart(productCard) {
  const id = productCard.dataset.id;
  const title = productCard.dataset.title;
  const price = parseFloat(productCard.dataset.price);

  let cart = getCart();
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, title, price, quantity: 1 });
  }

  setCart(cart);
  updateCartCount();
  alert(`${title} added to cart!`);
}


// =========================
// Initializers
// =========================

document.addEventListener('DOMContentLoaded', function () {
  initCategoryFilter();
  initSearch();
  initContactForm();
  initCart();
  initQuickView();
  initCheckoutForm();
  updateCartCount();
  updateCheckoutTotal();
  showStep(currentStep);
  initScrollToTop();
});

// =========================
// Category Filtering
// =========================
function initCategoryFilter() {
  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get('category') || 'all';
  filterProducts(categoryFromURL);
}

function filterProducts(category) {
  const products = document.querySelectorAll('.product-card');
  let matchCount = 0;

  products.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const noResults = document.getElementById('no-results');
  if (noResults) noResults.style.display = matchCount === 0 ? 'block' : 'none';
}

// =========================
// Search Modal & Redirect
// =========================
function initSearch() {
  const searchBtn = document.getElementById("contact-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      const input = document.getElementById("searchInput").value.toLowerCase();
      const cards = document.querySelectorAll(".card");
      let matchCount = 0;

      cards.forEach(card => {
        const category = card.getAttribute("data-category").toLowerCase();
        card.style.display = category.includes(input) ? "block" : "none";
        if (category.includes(input)) matchCount++;
      });

      const noResults = document.getElementById('no-results');
      if (noResults) noResults.style.display = matchCount === 0 ? 'block' : 'none';

      const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
      if (modal) modal.hide();
    });
  }

  const redirectBtn = document.getElementById("searchBtn");
  if (redirectBtn) {
    redirectBtn.addEventListener("click", function () {
      const input = document.getElementById("searchInput").value.trim();
      if (input) {
        window.location.href = `./collections.html?category=${encodeURIComponent(input)}`;
      }
    });
  }
}

// =========================
// Contact Form
// =========================
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const popup = document.getElementById("thank-you-popup");

    fetch("https://formspree.io/f/xwpbewzk", {
      method: "POST",
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    }).then(response => {
      if (response.ok) {
        popup?.classList.remove("d-none");
        setTimeout(() => popup?.classList.add("d-none"), 4000);
        form.reset();
      } else {
        alert("Oops! Something went wrong. Please try again.");
      }
    });
  });
}

// =========================
// Cart & Checkout
// =========================
function initCart() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.querySelectorAll('.order-btn, button[title="Add to Cart"]').forEach(btn => {
      btn.addEventListener('click', () => addToCart(card));
    });
  });
}

function updateCheckoutTotal() {
  const cart = getCart();
  let total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const totalAmountEl = document.getElementById('total-amount');
  if (totalAmountEl) totalAmountEl.textContent = total.toLocaleString();
}

function initCheckoutForm() {
  const stateOptions = {
    nigeria: ["Calabar", "Lagos", "Abuja", "Kano", "Port Harcourt", "Kaduna", "Ibadan"],
    ghana: ["Accra", "Kumasi", "Tamale", "Takoradi"]
  };

  document.getElementById("country")?.addEventListener("change", function () {
    const selected = this.value;
    const stateSelect = document.getElementById("state");
    stateSelect.innerHTML = '<option value="">Select State/City</option>';
    stateOptions[selected]?.forEach(state => {
      const opt = document.createElement("option");
      opt.value = state.toLowerCase().replace(/\s+/g, '-');
      opt.textContent = state;
      stateSelect.appendChild(opt);
    });
  });

  document.getElementById('pay-button')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (!validateStep(3)) return;

    const total = document.getElementById('total-amount').textContent.replace(/[^0-9]/g, '');
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    const handler = PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxx',
      email,
      amount: parseInt(total) * 100,
      currency: 'NGN',
      ref: 'ref-' + Math.floor(Math.random() * 1000000000),
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: name }
        ]
      },
      callback: function (response) {
        alert('Payment successful! Reference: ' + response.reference);
      },
      onClose: function () {
        alert('Payment window closed.');
      }
    });

    handler.openIframe();
  });
}

let currentStep = 1;
function showStep(step) {
  document.querySelectorAll('.step').forEach((el, i) => {
    el.style.display = (i + 1 === step) ? 'block' : 'none';
  });
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  currentStep++;
  showStep(currentStep);
}

function prevStep() {
  currentStep--;
  showStep(currentStep);
}

function validateStep(step) {
  const stepEl = document.querySelector(`#step-${step}`);
  return Array.from(stepEl.querySelectorAll('input, select')).every(input => input.checkValidity() || input.reportValidity());
}

// =========================
// Quick View Modal
// =========================
function initQuickView() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.querySelector(".modal .close");

  document.querySelectorAll('.quick-view-btn').forEach(button => {
    button.addEventListener('click', () => {
      const imageUrl = button.closest('.product-card').dataset.image;
      modal.style.display = "block";
      modalImg.src = imageUrl;
    });
  });

  closeBtn?.addEventListener('click', () => modal.style.display = "none");
  window.addEventListener('click', (event) => {
    if (event.target === modal) modal.style.display = "none";
  });
}

// =========================
// Scroll to Top
// =========================
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


