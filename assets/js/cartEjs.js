const pendingRequests = new Set();

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", onCartClick);
});

function onCartClick(event) {
  const qtyButton = event.target.closest(".qty-btn");
  if (qtyButton) {
    const productId = qtyButton.getAttribute("data-id");
    const action = qtyButton.getAttribute("data-action");
    const quantityDelta = action === "increase" ? 1 : -1;

    if (productId) {
      updateCartQuantity(productId, quantityDelta);
    }
    return;
  }

  const removeButton = event.target.closest(".remove-item-btn");
  if (removeButton) {
    const productId = removeButton.getAttribute("data-id");
    if (productId) {
      removeCartItem(productId);
    }
  }
}

function updateCartQuantity(productId, quantityDelta) {
  if (pendingRequests.has(productId)) {
    return;
  }

  const quantityInput = document.getElementById(`quantity-${productId}`);
  if (!quantityInput) {
    return;
  }

  const currentQuantity = Number(quantityInput.value || 0);
  if (quantityDelta < 0 && currentQuantity <= 1) {
    setButtonState(productId, currentQuantity);
    return;
  }

  pendingRequests.add(productId);
  setRowLoading(productId, true);

  fetch(`/api/cart/items/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, QNTY: quantityDelta }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        showToast(data.message || "Could not update quantity.", "error");
        return;
      }

      const updatedProduct = (data.cart.Products || []).find(
        (product) => String(product.productId) === String(productId),
      );

      if (!updatedProduct) {
        return;
      }

      updateRowTotals(productId, updatedProduct.quantity, updatedProduct.TOTAL);
      updateCartTotals(data.cart.subTotal);
      setButtonState(productId, updatedProduct.quantity);
    })
    .catch((error) => {
      console.error("Error while updating cart:", error);
      showToast("Something went wrong.", "error");
    })
    .finally(() => {
      pendingRequests.delete(productId);
      setRowLoading(productId, false);
    });
}

function updateRowTotals(productId, quantity, rowTotal) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  const subtotalElement = document.getElementById(`subtotal-${productId}`);

  if (quantityInput) {
    quantityInput.value = quantity;
  }

  if (subtotalElement) {
    subtotalElement.textContent = `\u20B9${rowTotal}`;
    subtotalElement.setAttribute("data-row-total-value", rowTotal);
  }
}

function updateCartTotals(subTotal) {
  const subtotalEl = document.getElementById("cart-subtotal");
  const grandTotalEl = document.getElementById("cart-grand-total");
  const value = Number(subTotal || 0);

  if (subtotalEl) {
    subtotalEl.textContent = `\u20B9${value}`;
  }
  if (grandTotalEl) {
    grandTotalEl.textContent = `\u20B9${value}`;
  }
}

function setButtonState(productId, quantity) {
  const decButton = document.getElementById(`dec-${productId}`);
  if (decButton) {
    decButton.disabled = Number(quantity) <= 1;
  }
}

function setRowLoading(productId, isLoading) {
  const incButton = document.getElementById(`inc-${productId}`);
  const decButton = document.getElementById(`dec-${productId}`);

  if (incButton) {
    incButton.disabled = isLoading;
  }

  if (decButton) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = Number(quantityInput ? quantityInput.value : 1);
    decButton.disabled = isLoading || quantity <= 1;
  }
}

function removeCartItem(productId) {
  if (pendingRequests.has(productId)) {
    return;
  }

  pendingRequests.add(productId);

  fetch(`/api/cart/items/${productId}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        showToast(data.message || "Could not remove item.", "error");
        return;
      }

      showToast(data.message || "Item removed.", "success");

      const row = document.getElementById(`cart-row-${productId}`);
      if (row) {
        row.remove();
      }

      refreshTotalsFromRows();
      handleEmptyCart();
    })
    .catch((error) => {
      console.error("Error while removing from cart:", error);
      showToast("Something went wrong.", "error");
    })
    .finally(() => {
      pendingRequests.delete(productId);
    });
}

function refreshTotalsFromRows() {
  const rowTotals = Array.from(document.querySelectorAll("[data-row-total-value]"));
  const nextSubtotal = rowTotals.reduce((sum, item) => {
    return sum + Number(item.getAttribute("data-row-total-value") || 0);
  }, 0);

  updateCartTotals(nextSubtotal);
}

function handleEmptyCart() {
  const rows = document.querySelectorAll("#cartRows tr");
  if (rows.length > 0) {
    return;
  }

  const cartContent = document.getElementById("cartContent");
  const emptyState = document.getElementById("emptyState");
  if (cartContent) {
    cartContent.style.display = "none";
  }
  if (emptyState) {
    emptyState.style.display = "block";
  }
}
