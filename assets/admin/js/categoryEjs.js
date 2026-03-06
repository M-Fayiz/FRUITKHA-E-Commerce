// ─── Image preview for Add Category ─────────────────────────────────────────
document.getElementById("image").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

  if (!file || !allowedTypes.includes(file.type)) {
    showToast("Invalid file type! Please upload a PNG or JPEG image.", "info");
    this.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("modalImage").src = e.target.result;
    document.getElementById("imageModal").style.display = "block";
  };
  reader.readAsDataURL(file);
});

document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("imageModal").style.display = "none";
});


// ─── List / Unlist category ──────────────────────────────────────────────────
function toggleItemStatus(itemId, condition) {
  fetch(`/admin/api/categories/${itemId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ condition }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message, "success");
        setTimeout(() => location.reload(), 800);
      } else {
        showToast(data.message, "error");
      }
    })
    .catch(() => showToast("Something went wrong.", "error"));
}


// ─── Edit Category ────────────────────────────────────────────────────────────
// Populate the edit modal fields and store the current productId
let currentEditId = null;

function editCategory(itemId, category, description, img) {
  currentEditId = itemId;
  document.getElementById("modalTitle").value       = category;
  document.getElementById("modalDescription").value = description;
  // img is now a full Cloudinary URL — use it directly
  document.getElementById("editImg").src = img;
  document.getElementById("editModal").style.display = "flex";
}

document.addEventListener("DOMContentLoaded", function () {
  const modal           = document.getElementById("editModal");
  const closeUpdateModal = document.getElementById("closeUpdateModal");

  // Close on X button
  closeUpdateModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Close on outside click
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Submit handler — attached once here, not inside editCategory()
  document.getElementById("edit-category").addEventListener("submit", function (e) {
    e.preventDefault();

    const productId        = currentEditId;
    const modalTitle       = document.getElementById("modalTitle").value.trim();
    const modalDescription = document.getElementById("modalDescription").value.trim();
    const imageFile        = document.getElementById("modalImageInput").files[0];
    const allowedTypes     = ["image/png", "image/jpeg", "image/jpg"];

    // At least title or description must be provided
    if (!modalTitle && !modalDescription && !imageFile) {
      showToast("Please update at least one field.", "info");
      return;
    }

    // Validate title/description characters (if provided)
    if (modalTitle && !/^[A-Za-z ]+$/.test(modalTitle)) {
      showToast("Title should contain only letters and spaces.", "info");
      return;
    }
    if (modalDescription && !/^[A-Za-z ]+$/.test(modalDescription)) {
      showToast("Description should contain only letters and spaces.", "info");
      return;
    }

    // Validate image type only if a file was actually selected
    if (imageFile && !allowedTypes.includes(imageFile.type)) {
      showToast("Invalid file type! Please upload a PNG or JPEG image.", "info");
      return;
    }

    const formData = new FormData();
    if (modalTitle)       formData.append("modalTitle",       modalTitle);
    if (modalDescription) formData.append("modalDescription", modalDescription);
    if (imageFile)        formData.append("image",            imageFile);
    formData.append("productId", productId);

    fetch(`/admin/api/categories/${productId}`, {
      method: "PATCH",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          modal.style.display = "none";
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message, "error");
        }
      })
      .catch(() => showToast("Something went wrong.", "error"));
  });
});


// ─── Add Category ─────────────────────────────────────────────────────────────
document.getElementById("form-category").addEventListener("submit", (e) => {
  e.preventDefault();

  const title       = document.getElementById("title").value.trim();
  const discription = document.getElementById("discr").value.trim();
  const file        = document.getElementById("image").files[0];
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

  if (!title || !discription) {
    showToast("Title and description are required.", "info");
    return;
  }

  if (!title.match(/^[A-Za-z ]+$/)) {
    showToast("Title should contain only letters and spaces.", "info");
    return;
  }

  if (!discription.match(/^[A-Za-z ]+$/)) {
    showToast("Description should contain only letters and spaces.", "info");
    return;
  }

  if (!file || !allowedTypes.includes(file.type)) {
    showToast("Invalid file type! Please upload a PNG or JPEG image.", "info");
    return;
  }

  const formData = new FormData();
  formData.append("title",       title);
  formData.append("discription", discription);
  formData.append("image",       file);

  fetch("/admin/api/categories", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message, "success");
        setTimeout(() => location.reload(), 1000);
      } else {
        showToast(data.message, "error");
      }
    })
    .catch(() => showToast("Server error. Try again later.", "error"));
});
