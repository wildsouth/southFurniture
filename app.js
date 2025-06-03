// =========================
// DOM READY
// =========================
document.addEventListener('DOMContentLoaded', function () {
    // On page load, check the URL for category filter
    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get('category');
    if (categoryFromURL) {
        filterProducts(categoryFromURL);
    } else {
        filterProducts('all');
    }

    // Handle search via modal input
    const searchBtn = document.getElementById("contact-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            const input = document.getElementById("searchInput").value.toLowerCase();
            const cards = document.querySelectorAll(".card");
            let matchCount = 0;

            cards.forEach(card => {
                const category = card.getAttribute("data-category").toLowerCase();
                if (category.includes(input)) {
                    card.style.display = "block";
                    matchCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Handle "no results"
            const noResults = document.getElementById('no-results');
            if (noResults) {
                noResults.style.display = matchCount === 0 ? 'block' : 'none';
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
            if (modal) modal.hide();
        });
    }

    // Form submission (contact form)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const popup = document.getElementById("thank-you-popup");

            fetch("https://formspree.io/f/xwpbewzk", {
                method: "POST",
                headers: {
                    'Accept': 'application/json'
                },
                body: new FormData(contactForm)
            }).then(response => {
                if (response.ok) {
                    if (popup) {
                        popup.classList.remove("d-none");
                        setTimeout(() => popup.classList.add("d-none"), 4000);
                    }
                    contactForm.reset();
                } else {
                    alert("Oops! Something went wrong. Please try again.");
                }
            });
        });
    }
});

// =========================
// Product Filter Buttons
// =========================
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
  if (noResults) {
    noResults.style.display = matchCount === 0 ? 'block' : 'none';
  }

  // ✅ Force reflow after DOM changes (correct usage)
  const container = document.querySelector('.product-container');
  if (container) {
    container.style.display = 'none';
    void container.offsetHeight; // trigger reflow
    container.style.display = 'flex'; // or 'block', depending on your layout
  }

  // Optional fallback: trigger global resize event
  window.dispatchEvent(new Event('resize'));
}

// =========================
// Arrow button
// =========================
 const scrollTopBtn = document.getElementById('scrollTopBtn');

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


// =========================
// Collection Page Filter via URL
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("category");

    if (query) {
        const cards = document.querySelectorAll(".card");
        cards.forEach(card => {
            const category = card.getAttribute("data-category").toLowerCase();
            card.style.display = category.includes(query.toLowerCase()) ? "block" : "none";
        });
    }
});

// =========================
// Search Redirection Button
// =========================
const searchRedirectBtn = document.getElementById("searchBtn");
if (searchRedirectBtn) {
    searchRedirectBtn.addEventListener("click", function () {
        const input = document.getElementById("searchInput").value.trim();
        if (input) {
            window.location.href = `./collections.html?category=${encodeURIComponent(input)}`;
        }
    });
}


// =========================
// Add To Cart
// =========================

document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function addToCart(productCard) {
        const id = productCard.dataset.id;
        const title = productCard.dataset.title;
        const price = parseFloat(productCard.dataset.price);

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, title, price, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${title} added to cart!`);
        updateCartCount();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const cartCount = document.querySelector('#cart-count');
        if (cartCount) cartCount.textContent = totalItems;
    }

    document.querySelectorAll('.product-card').forEach(card => {
        const orderBtn = card.querySelector('.order-btn');
        const addToCartBtn = card.querySelector('button[title="Add to Cart"]');

        if (orderBtn) orderBtn.addEventListener('click', () => addToCart(card));
        if (addToCartBtn) addToCartBtn.addEventListener('click', () => addToCart(card));
    });

    updateCartCount();
});

// 
// cart count
// 
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});



function addToCart(productCard) {
    const id = productCard.dataset.id;
    const title = productCard.dataset.title;
    const price = parseFloat(productCard.dataset.price);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // ✅ update count
    alert(`${title} added to cart!`);
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // update after change

});






// =========================
// Cart Settings (Improved)
// =========================

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('total');
    const clearCartButton = document.getElementById('clear-cart');
    const checkoutButton = document.getElementById('checkout-btn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
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

        // Remove buttons
        document.querySelectorAll('button[data-index]').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });
        });
    }

    // Clear cart
    clearCartButton?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the cart?')) {
            cart = [];
            localStorage.removeItem('cart');
            renderCart();
        }
    });

    // Checkout
    checkoutButton?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    // ✅ Redirect to checkout page
    window.location.href = "checkout.html";
});
    renderCart();
});



// =========================
// Quick view
// =========================

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal .close");

    // Attach event listeners to all quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            const imageUrl = card.getAttribute('data-image');
            modal.style.display = "block";
            modalImg.src = imageUrl;
        });
    });

    // Close modal when "x" is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Close modal when clicking outside the image
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});



// =========================
// Checkout-form
// =========================


let currentStep = 1;

  function showStep(step) {
    document.querySelectorAll('.step').forEach((el, index) => {
      el.style.display = (index + 1 === step) ? 'block' : 'none';
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
    const inputs = stepEl.querySelectorAll('input, select');

    for (const input of inputs) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }
    return true;
  }

  // Country > State selector
  const stateOptions = {
    nigeria: [
        "Calabar", "Lagos", "Abuja", "Kano", "Port Harcourt", "Kaduna", "Ibadan"
    ],
    ghana: [
        "Accra", "Kumasi", "Tamale", "Takoradi"
    ]
  };

  document.getElementById("country").addEventListener("change", function () {
    const selectedCountry = this.value;
    const stateSelect = document.getElementById("state");

    stateSelect.innerHTML = '<option value="">Select State/City</option>';

    if (stateOptions[selectedCountry]) {
      stateOptions[selectedCountry].forEach(state => {
        const option = document.createElement("option");
        option.value = state.toLowerCase().replace(/\s+/g, '-');
        option.textContent = state;
        stateSelect.appendChild(option);
      });
    }
  });

  // Paystack Payment
  document.getElementById('pay-button').addEventListener('click', function (e) {
    e.preventDefault();

    if (!validateStep(3)) return;

    const total = document.getElementById('total-amount').textContent.replace(/[^0-9]/g, '');
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    const handler = PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxx', // Replace with your real public key
      email: email,
      amount: parseInt(total) * 100, // Paystack uses kobo
      currency: 'NGN',
      ref: 'ref-' + Math.floor(Math.random() * 1000000000),
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: name }
        ]
      },
      callback: function (response) {
        alert('Payment successful! Reference: ' + response.reference);
        // Optionally clear localStorage/cart and redirect
      },
      onClose: function () {
        alert('Payment window closed.');
      }
    });

    handler.openIframe();
  });

  // Initialize first step
  document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);
  });
  

// =========================
// real amount
// =========================

function updateCheckoutTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = 0;

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    total += price * quantity;
  });

  const totalAmountEl = document.getElementById('total-amount');
  if (totalAmountEl) {
    totalAmountEl.textContent = total.toLocaleString();
  } else {
    console.warn("No element with ID 'total-amount' found");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCheckoutTotal();
});

// const stateOptions = {
//   nigeria: [
//     "Lagos", "Abuja", "Kano", "Port Harcourt", "Kaduna", "Ibadan", "Benin City", 
//   ],
//   ghana: [
//     "Accra", "Kumasi", "Tamale", "Takoradi"
//   ]
// };

// document.getElementById("country").addEventListener("change", function () {
//   const selectedCountry = this.value;
//   const stateSelect = document.getElementById("state");

//   // Clear existing options
//   stateSelect.innerHTML = '<option value="">Select State/City</option>';

//   if (stateOptions[selectedCountry]) {
//     stateOptions[selectedCountry].forEach(state => {
//       const option = document.createElement("option");
//       option.value = state.toLowerCase().replace(/\s+/g, '-');
//       option.textContent = state;
//       stateSelect.appendChild(option);
//     });
//   }
// });


// =========================
// Paypal
// =========================

 
// function payWithPaystack() {
//   const email = document.getElementById('email').value;
//   const amount = parseInt(document.getElementById('total-amount').innerText) * 100;

//   const handler = PaystackPop.setup({
//     key: 'YOUR_PUBLIC_KEY_HERE',
//     email: email,
//     amount: amount,
//     currency: 'NGN',
//     callback: function(response) {
//       alert('Payment successful! Reference: ' + response.reference);
//       // Submit form or redirect here
//     },
//     onClose: function() {
//       alert('Payment window closed.');
//     }
//   });
//   handler.openIframe();
// }
 
//   document.getElementById('pay-button').addEventListener('click', function (e) {
//     e.preventDefault();

//     const totalAmount = document.getElementById('total-amount').textContent.replace(/[^0-9]/g, '');
//     const email = document.querySelector('input[name="email"]')?.value || 'test@example.com'; // Change as needed

//     const handler = PaystackPop.setup({
//       key: 'pk_test_xxxxxxxxxxxxxxxx', // Replace with your actual public key
//       email: email,
//       amount: parseInt(totalAmount) * 100, // amount in kobo
//       currency: 'NGN',
//       ref: 'ref-' + Math.floor(Math.random() * 1000000000),
//       callback: function (response) {
//         alert('Payment complete! Reference: ' + response.reference);
//         // Optional: redirect or show success page
//       },
//       onClose: function () {
//         alert('Transaction was cancelled.');
//       }
//     });

//     handler.openIframe();
//   });