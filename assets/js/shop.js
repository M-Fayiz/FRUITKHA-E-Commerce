/* shop.js — Fruitkha shop page logic
   All filtering, searching and sorting is URL-based so pagination works correctly.
*/

const dom = {
  searchInput: document.getElementById('search-input'),
  searchSubmitBtn: document.getElementById('searchSubmitBtn'),
  productsContainer: document.getElementById('productsContainer'),
  shopMessage: document.getElementById('shopMessage'),
  sortBy: document.getElementById('sortBy'),
  priceRange: document.getElementById('priceRange'),
  priceValue: document.getElementById('priceValue'),
  filterPanel: document.getElementById('filterPanel'),
  overlay: document.getElementById('overlay'),
  filterToggleBtn: document.getElementById('filterToggleBtn'),
  closeFilterBtn: document.getElementById('closeFilterBtn'),
  applyFiltersBtn: document.getElementById('applyFiltersBtn'),
};

/* ── Helpers ── */
function getCurrentParams() {
  return new URLSearchParams(window.location.search);
}

function buildUrl(overrides = {}) {
  const p = getCurrentParams();
  if (!('page' in overrides)) p.delete('page');
  Object.entries(overrides).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') {
      p.delete(k);
    } else {
      p.set(k, v);
    }
  });
  return '/shop?' + p.toString();
}

/* ── Filter panel open/close ── */
function toggleFilter(open) {
  if (!dom.filterPanel || !dom.overlay) return;
  dom.filterPanel.classList.toggle('open', open);
  dom.overlay.classList.toggle('open', open);
}

/* ── Apply filters → navigate to new URL ── */
function applyFilters() {
  const sortBy = dom.sortBy ? dom.sortBy.value : '';
  const priceRng = dom.priceRange ? dom.priceRange.value : '';

  // Collect checked category IDs (ObjectIds) from filter panel
  const checkedCats = Array.from(
    document.querySelectorAll('.category-check:checked')
  ).map(cb => cb.value);

  const p = new URLSearchParams(window.location.search);

  // Keep search if already in url
  const existingSearch = p.get('search');

  if (existingSearch) p.set('search', existingSearch);

  if (checkedCats.length) {
    p.set('category', checkedCats[0]);
  } else {
    p.delete('category');
  }
  if (sortBy) p.set('sortOrder', sortBy);
  else p.delete('sortOrder');
  if (priceRng) p.set('priceRange', priceRng);
  else p.delete('priceRange');

  p.delete('page');
  window.location.href = '/shop?' + p.toString();
}

function bindSearch() {
  if (!dom.searchInput) return;
  const doSearch = () => {
    const q = dom.searchInput.value.trim();
    window.location.href = buildUrl({ search: q || null });
  };

  dom.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });
  if (dom.searchSubmitBtn) {
    dom.searchSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      doSearch();
    });
  }

  const p = getCurrentParams();
  if (p.get('search') && dom.searchInput) {
    dom.searchInput.value = p.get('search');
  }
}

/* ── Pre-select sort/price/category from URL ── */
function restoreFilterState() {
  const p = getCurrentParams();

  if (dom.sortBy && p.get('sortOrder')) {
    dom.sortBy.value = p.get('sortOrder');
  }
  if (dom.priceRange && p.get('priceRange')) {
    dom.priceRange.value = p.get('priceRange');
    if (dom.priceValue) dom.priceValue.textContent = '₹' + p.get('priceRange');
  }
  if (dom.priceRange && dom.priceValue) {
    dom.priceRange.addEventListener('input', (e) => {
      dom.priceValue.textContent = '₹' + e.target.value;
    });
  }

  // Mark checked category from URL (ObjectId match)
  const catId = p.get('category');
  if (catId) {
    const cb = document.getElementById('cat-' + catId);
    if (cb) cb.checked = true;
  }
}

/* ── Navigate to product detail — card click handler ── */
function goToProduct(url, e) {
  if (e && e.target.closest('button')) return;
  window.location.href = url;
}

/* ── Add to Cart ── */
function addToCart(productId, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  fetch('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.login === false) { window.location.href = '/login'; return; }
      showToast(data.message || (data.success ? 'Added to cart' : 'Could not add item'), data.success ? 'success' : 'error');
    })
    .catch(() => showToast('Something went wrong.', 'error'));
}


function wishList(val, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  fetch('/api/wishlist/items/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ val }),
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) { showToast(data.message || 'Wishlist update failed.', 'error'); return; }
      showToast(data.message || 'Wishlist updated.', 'success');

      const btn = document.getElementById('wishlistIcon-' + val);
      if (btn) {
        btn.classList.toggle('is-active', Boolean(data.isWishList));
        const icon = btn.querySelector('i');
        if (icon) icon.className = data.isWishList ? 'fas fa-heart' : 'far fa-heart';
      }
      const countW = document.getElementById('countW');
      if (countW && Number.isFinite(Number(data.aa))) countW.innerText = data.aa;
    })
    .catch(() => showToast('Something went wrong.', 'error'));
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  if (dom.filterToggleBtn) dom.filterToggleBtn.addEventListener('click', () => toggleFilter(true));
  if (dom.closeFilterBtn) dom.closeFilterBtn.addEventListener('click', () => toggleFilter(false));
  if (dom.overlay) dom.overlay.addEventListener('click', () => toggleFilter(false));
  if (dom.applyFiltersBtn) dom.applyFiltersBtn.addEventListener('click', () => applyFilters());

  bindSearch();
  restoreFilterState();
});

/* expose globals for inline onclick */
window.addToCart = addToCart;
window.wishList = wishList;
window.goToProduct = goToProduct;
