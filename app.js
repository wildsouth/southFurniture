// =========================
// Global Variables & Helpers
// =========================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
}


// =========================
// Render Cart Page
// =========================
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('total');
    if (!cartItemsContainer || !totalContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        totalContainer.textContent = '';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;

        const itemRow = document.createElement('div');
        itemRow.className = 'd-flex justify-content-between align-items-center border-bottom py-2';
        itemRow.innerHTML = `
            <div>
                <div class="fw-medium">${item.title}</div>
                <div class="text-muted">₦${itemTotal.toLocaleString()} (x${item.quantity || 1})</div>
            </div>
            <button class="btn btn-sm btn-outline-danger" data-index="${index}">Remove</button>
        `;
        cartItemsContainer.appendChild(itemRow);
    });

    totalContainer.textContent = `Total: ₦${total.toLocaleString()}`;

    document.querySelectorAll('button[data-index]').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            cart.splice(index, 1);
            saveCart();
            renderCart();
            updateCartCount();
        });
    });
}

// =========================
// DOM Ready
// =========================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();

    // Add to cart buttons
    document.querySelectorAll('.product-card').forEach(card => {
        const orderBtn = card.querySelector('.order-btn');
        const addToCartBtn = card.querySelector('button[title="Add to Cart"]');

        if (orderBtn) orderBtn.addEventListener('click', () => addToCart(card));
        if (addToCartBtn) addToCartBtn.addEventListener('click', () => addToCart(card));
    });

    // Clear cart
    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the cart?')) {
                cart = [];
                saveCart();
                renderCart();
                updateCartCount();
            }
        });
    }

    // Proceed to Checkout
    const checkoutButton = document.getElementById('checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            if (cart.length === 0) {
                alert('Your cart is empty.');
                e.preventDefault();
            }
        });
    }

    // Scroll to Top
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Quick View Modal
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal .close");

    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            const imageUrl = card.getAttribute('data-image');
            modal.style.display = "block";
            modalImg.src = imageUrl;
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Update Checkout Total
    const totalAmountEl = document.getElementById('total-amount');
    if (totalAmountEl) {
        const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        totalAmountEl.textContent = total.toLocaleString();
    }

    // Initialize Checkout Form Steps
    const steps = document.querySelectorAll('.step');
    if (steps.length) {
        let currentStep = 1;
        const showStep = (step) => {
            steps.forEach((el, i) => el.style.display = i + 1 === step ? 'block' : 'none');
        };
        showStep(currentStep);

        window.nextStep = function () {
            if (!validateStep(currentStep)) return;
            currentStep++;
            showStep(currentStep);
        };

        window.prevStep = function () {
            currentStep--;
            showStep(currentStep);
        };

        function validateStep(step) {
            const stepEl = document.querySelector(`#step-${step}`);
            const inputs = stepEl.querySelectorAll('input, select');
            for (const input of inputs) {
                if (!input.checkValidity()) {
                    input.reportValidity();
                    return false;
                }
            }
            return true;
        }
    }

    // Country/State Dropdown
    const stateOptions = {
        nigeria: ["Calabar", "Lagos", "Abuja", "Kano", "Port Harcourt", "Kaduna", "Ibadan"],
        ghana: ["Accra", "Kumasi", "Tamale", "Takoradi"]
    };

    const countrySelect = document.getElementById("country");
    const stateSelect = document.getElementById("state");
    if (countrySelect && stateSelect) {
        countrySelect.addEventListener("change", function () {
            const selectedCountry = this.value;
            stateSelect.innerHTML = '<option value="">Select State/City</option>';
            (stateOptions[selectedCountry] || []).forEach(state => {
                const option = document.createElement("option");
                option.value = state.toLowerCase().replace(/\s+/g, '-');
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        });
    }

    // Paystack Payment
    const payBtn = document.getElementById('pay-button');
    if (payBtn) {
        payBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const total = document.getElementById('total-amount').textContent.replace(/[^0-9]/g, '');
            const email = document.getElementById('email').value;
            const name = document.getElementById('name').value;

            if (!email || !name) {
                alert("Please fill in all fields.");
                return;
            }

            const handler = PaystackPop.setup({
                key: 'pk_test_xxxxxxxxxxxxxx', // Replace with real public key
                email: email,
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
                    cart = [];
                    saveCart();
                    updateCartCount();
                    window.location.href = 'thank-you.html';
                },
                onClose: function () {
                    alert('Payment window closed.');
                }
            });

            handler.openIframe();
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('#cart-count, .cart-count').forEach(el => el.textContent = totalItems);
  }

  function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    let matchCount = 0;

    products.forEach(card => {
      const cardCategory = card.dataset.category;
      if (category === 'all' || cardCategory === category) {
        card.style.display = 'block';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const grid = document.getElementById('product-grid');
    if (grid) {
      grid.style.display = 'none';
      void grid.offsetHeight;
      grid.style.display = 'flex';
    }

    window.dispatchEvent(new Event('resize'));
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function addToCart(card) {
    const id = card.dataset.id;
    const title = card.dataset.title;
    const price = parseFloat(card.dataset.price);

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, title, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${title} added to cart!`);
  }

  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.product-card');
      addToCart(card);
    });
  });

  document.querySelectorAll('button[title="Add to Cart"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.product-card');
      addToCart(card);
    });
  });

  updateCartCount();

  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get('category');
  if (categoryFromURL) {
    filterProducts(categoryFromURL);
  } else {
    filterProducts('all');
  }

  // Make filter globally callable for inline onclick=""
  window.filterProducts = filterProducts;
});
