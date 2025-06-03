// cart.js

export function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

export function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('total');
    if (!cartItemsContainer || !totalContainer) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        totalContainer.textContent = '';
        return;
    }

    let total = 0;

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

    // Add remove handlers
    document.querySelectorAll('button[data-index]').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        });
    });
}

// cart-page.js
import { renderCart, updateCartCount } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount();

    document.getElementById('clear-cart')?.addEventListener('click', () => {
        localStorage.removeItem('cart');
        renderCart();
        updateCartCount();
    });
});
