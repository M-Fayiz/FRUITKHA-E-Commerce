document.addEventListener("DOMContentLoaded", function () {
  const primaryImageInput = document.getElementById("primaryImageInput");
  const additionalImageInputs = document.querySelectorAll(
    ".additionalImageInput",
  );

  const imageCropModal = document.getElementById("imageCropModal");
  const cropImage = document.getElementById("cropImage");
  const cropButton = document.getElementById("cropButton");
  let cropper;
  let croppedBlobs = {};
  const MAX_IMAGE_DIMENSION = 1600;
  const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;

  function exportCanvasBlob(canvas) {
    const attempts = [
      { type: "image/jpeg", quality: 0.82 },
      { type: "image/jpeg", quality: 0.72 },
      { type: "image/jpeg", quality: 0.6 },
    ];

    return new Promise((resolve, reject) => {
      const tryAttempt = (index) => {
        const attempt = attempts[index];
        if (!attempt) {
          reject(new Error("Unable to compress image for upload."));
          return;
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to process image."));
              return;
            }

            if (blob.size <= MAX_UPLOAD_BYTES || index === attempts.length - 1) {
              resolve(blob);
              return;
            }

            tryAttempt(index + 1);
          },
          attempt.type,
          attempt.quality,
        );
      };

      tryAttempt(0);
    });
  }

  function handleImageCrop(file, inputName, previewElement) {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!file || !allowedTypes.includes(file.type)) {
      showToast(
        "Invalid file type! Please upload a PNG or JPEG image ..",
        "info",
      );
      return;
    }

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        cropImage.src = e.target.result;
        imageCropModal.style.display = "block";

        if (cropper) cropper.destroy();

        cropper = new Cropper(cropImage, {
          aspectRatio: 1,
          viewMode: 1,
          autoCropArea: 1,
          responsive: true,
        });

        cropButton.onclick = () => {
          if (cropper) {
            const canvas = cropper.getCroppedCanvas({
              maxWidth: MAX_IMAGE_DIMENSION,
              maxHeight: MAX_IMAGE_DIMENSION,
              imageSmoothingEnabled: true,
              imageSmoothingQuality: "high",
            });
            exportCanvasBlob(canvas)
              .then((blob) => {
                croppedBlobs[inputName] = blob;

                if (previewElement) {
                  const url = URL.createObjectURL(blob);
                  previewElement.src = url;
                }

                imageCropModal.style.display = "none";
                cropper.destroy();
                cropper = null;
              })
              .catch((error) => {
                showToast(error.message, "error");
              });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  // Event listener for primary image input
  if (primaryImageInput) {
    primaryImageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const previewElement = document.getElementById("mainImagePreview");
      handleImageCrop(file, "primaryImage", previewElement);
    });
  }

  additionalImageInputs.forEach((input, index) => {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      console.log(`File selected at index ${index}:`, file);

      const galleryItem = input.previousElementSibling;
      const previewElement = galleryItem
        ? galleryItem.querySelector("img")
        : null;
      handleImageCrop(file, `additionalImage${index}`, previewElement);
    });
  });

  document
    .getElementById("updateProductForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData();
      const title = document.getElementById("title").value.trim();

      const saveButton = document.querySelector(".save-button");
      const productId = saveButton.getAttribute("data-id");
      formData.append("productId", productId);

      if (title && title.match(/^[A-Za-z][A-Za-z ]*$/)) {
        formData.append("title", title);
      }

      const fieldsToCheck = [
        "description",
        "regularPrice",
        "offerPrice",
        "category",
        "stock",
      ];
      fieldsToCheck.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim()) {
          formData.append(fieldId, field.value.trim());
        }
      });

      if (croppedBlobs["primaryImage"]) {
        formData.append(
          "primaryImage",
          croppedBlobs["primaryImage"],
          "primary-image-cropped.jpg",
        );
      }

      if (additionalImageInputs) {
        additionalImageInputs.forEach((input, index) => {
          if (croppedBlobs[`additionalImage${index}`]) {
            formData.append(
              `additionalImage${index}`,
              croppedBlobs[`additionalImage${index}`],
              `additional-image-${index}-cropped.jpg`,
            );
            console.log(`Appended additionalImage${index} to formData`);
          } else {
            console.log(
              `No updated blob for additionalImage${index}, skipping formData append`,
            );
          }
        });
      }

      fetch(`/admin/api/products/${productId}`, {
        method: "PATCH",
        body: formData,
      })
        .then(async (res) => {
          const contentType = res.headers.get("content-type") || "";
          const data = contentType.includes("application/json")
            ? await res.json()
            : {
                success: false,
                message: "Product update failed. Please try again.",
              };

          if (!res.ok) {
            throw new Error(
              data.message || "Product update failed. Please try again.",
            );
          }

          return data;
        })
        .then((data) => {
          if (data.success) {
            showToast(data.message, "success");
          } else {
            showToast(data.message, "error");
          }
        })
        .catch((error) => {
          showToast(
            error.message || "Product update failed. Please try again.",
            "error",
          );
        });
    });
});
