const dom = {
  applyFiltersBtn: document.getElementById("applyFiltersBtn"),
  searchInput: document.getElementById("search-input"),
  productsContainer: document.getElementById("productsContainer"),
  shopMessage: document.getElementById("shopMessage"),
  sortBy: document.getElementById("sortBy"),
  priceRange: document.getElementById("priceRange"),
  priceValue: document.getElementById("priceValue"),
  filterPanel: document.getElementById("filterPanel"),
  overlay: document.getElementById("overlay"),
  filterToggleBtn: document.getElementById("filterToggleBtn"),
  closeFilterBtn: document.getElementById("closeFilterBtn"),
};

document.addEventListener("DOMContentLoaded", () => {
  bindFilters();
});

function bindFilters() {
  if (dom.applyFiltersBtn) {
    dom.applyFiltersBtn.addEventListener("click", async () => {
      await handleSearch();
      toggleFilter(false);
    });
  }

  if (dom.searchInput) {
    dom.searchInput.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        await handleSearch();
      }
    });
  }

  if (dom.priceRange && dom.priceValue) {
    dom.priceRange.addEventListener("input", (event) => {
      dom.priceValue.textContent = `\u20B9${event.target.value}`;
    });
  }

  if (dom.filterToggleBtn) {
    dom.filterToggleBtn.addEventListener("click", () => toggleFilter(true));
  }

  if (dom.closeFilterBtn) {
    dom.closeFilterBtn.addEventListener("click", () => toggleFilter(false));
  }

  if (dom.overlay) {
    dom.overlay.addEventListener("click", () => toggleFilter(false));
  }
}

function toggleFilter(open) {
  if (!dom.filterPanel || !dom.overlay) {
    return;
  }
  dom.filterPanel.classList.toggle("active", open);
  dom.overlay.classList.toggle("active", open);
}

async function handleSearch() {
  const query = dom.searchInput ? dom.searchInput.value.trim() : "";
  const selectedCategories = Array.from(
    document.querySelectorAll(".category-check:checked"),
  ).map((checkbox) => checkbox.value);
  const selectedSortBy = dom.sortBy ? dom.sortBy.value : "";
  const selectedPriceRange = dom.priceRange ? dom.priceRange.value : "";

  const params = new URLSearchParams();

  if (query) {
    params.append("search", query);
  }

  if (selectedCategories.length > 0) {
    params.append("selectedCategories", selectedCategories.join(","));
  }

  if (selectedSortBy) {
    params.append("sortOrder", selectedSortBy);
  }

  if (selectedPriceRange) {
    params.append("priceRange", selectedPriceRange);
  }

  try {
    const response = await fetch(`/search?${params.toString()}`);
    const payload = await response.json();

    if (Array.isArray(payload)) {
      displayProducts(payload);
      return;
    }

    if (payload && payload.message) {
      displayProducts([]);
      return;
    }

    displayProducts([]);
  } catch (error) {
    console.error("Error fetching search results:", error);
    if (dom.shopMessage) {
      dom.shopMessage.textContent = "Could not load filtered results.";
    }
  }
}

function displayProducts(products) {
  if (!dom.productsContainer) {
    return;
  }

  if (!products || products.length === 0) {
    dom.productsContainer.innerHTML = "";
    if (dom.shopMessage) {
      dom.shopMessage.textContent = "No products found.";
    }
    return;
  }

  if (dom.shopMessage) {
    dom.shopMessage.textContent = "";
  }

  dom.productsContainer.innerHTML = products.map((item) => productCardTemplate(item)).join("");
}

function productCardTemplate(item) {
  const title = escapeHtml(item.productTitle || "Product");
  const image = escapeHtml(item.primaryImage || "");
  const productId = item._id || item.id;
  const regularPrice = Number(item.RegulerPrice || 0);
  const offerPrice = Number(
    item.OfferPrice || (item.Offer && item.Offer.OfferPrice) || 0,
  );
  const displayPrice = offerPrice > 0 ? offerPrice : regularPrice;
  const totalStock = Number(item.totalStock || item.Stock || 0);
  const wishlistClass = item.isInWishlist ? "is-active" : "";
  const heartIcon = item.isInWishlist ? "fas fa-heart" : "far fa-heart";

  let stockHtml = '<span class="stock-pill stock-out">Out of Stock</span>';
  if (totalStock > 10) {
    stockHtml = `<span class="stock-pill stock-in">In Stock: ${totalStock} kg</span>`;
  } else if (totalStock > 0) {
    stockHtml = `<span class="stock-pill stock-low">Low Stock: ${totalStock} kg</span>`;
  }

  let offerTag = "";
  if (offerPrice > 0 && regularPrice > 0 && regularPrice > offerPrice) {
    const discount = Math.round(((regularPrice - offerPrice) / regularPrice) * 100);
    if (discount > 0) {
      offerTag = `<span class="offer-tag">${discount}% OFF</span>`;
    }
  }

  const priceHtml =
    offerPrice > 0
      ? `<span class="price-now">\u20B9${offerPrice}</span><span class="price-old">\u20B9${regularPrice}</span>`
      : `<span class="price-now">\u20B9${regularPrice}</span>`;

  return `
    <article class="product-card">
      <div class="product-thumb">
        ${offerTag}
        <button class="wishlist-btn ${wishlistClass}" id="wishlistIcon-${productId}" onclick="wishList('${productId}')" aria-label="Toggle wishlist">
          <i class="${heartIcon}"></i>
        </button>
        <a href="/product/${productId}">
          <img src="/images/${image}" alt="${title}">
        </a>
      </div>
      <div class="product-content">
        <h3 class="product-title">${title}</h3>
        <div class="price-block">${priceHtml}</div>
        ${stockHtml}
        <button class="cart-btn" onclick="addToCart('${productId}')" ${totalStock > 0 ? "" : "disabled"}>
          <i class="fas fa-shopping-cart"></i> ${totalStock > 0 ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function addToCart(productId) {
  fetch("/api/cart/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      quantity: 1,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.login === false) {
        window.location.href = "/login";
        return;
      }

      if (data.success) {
        showToast(data.message || "Added to cart", "success");
      } else {
        showToast(data.message || "Could not add item to cart", "error");
      }
    })
    .catch((error) => {
      console.error("Cart error:", error);
      showToast("Something went wrong.", "error");
    });
}

function wishList(val) {
  fetch("/api/wishlist/items/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ val }),
  })
    .then((res) => res.json())
    .then((data) => {
      const iconButton = document.getElementById(`wishlistIcon-${val}`);
      const countW = document.getElementById("countW");

      if (!data.success) {
        showToast(data.message || "Wishlist update failed.", "error");
        return;
      }

      showToast(data.message || "Wishlist updated.", "success");

      if (iconButton) {
        iconButton.classList.toggle("is-active", Boolean(data.isWishList));
        const icon = iconButton.querySelector("i");
        if (icon) {
          icon.className = data.isWishList ? "fas fa-heart" : "far fa-heart";
        }
      }

      if (countW && Number.isFinite(Number(data.aa))) {
        countW.innerText = data.aa;
      }
    })
    .catch((error) => {
      console.error("Wishlist error:", error);
      showToast("Something went wrong.", "error");
    });
}

window.handleSearch = handleSearch;
window.addToCart = addToCart;
window.wishList = wishList;
