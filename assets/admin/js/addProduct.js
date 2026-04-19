document.addEventListener("DOMContentLoaded", function () {
  const imageInputs = document.querySelectorAll(".primaryImageInput");
  const imageCropModal = document.getElementById("imageCropModal");
  const cropImage = document.getElementById("cropImage");
  const cropButton = document.getElementById("cropButton");
  let cropper;
  let croppedBlobs = [];
  const MAX_IMAGE_DIMENSION = 1600;
  const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;

  console.log(croppedBlobs);

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

  function handleImageCrop(file, inputIndex, previewElement) {
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
      console.log("reader", reader);

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
                croppedBlobs[inputIndex] = blob;

                if (previewElement) {
                  previewElement.src = URL.createObjectURL(blob);
                  previewElement.style.display = "block";
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

  imageInputs.forEach((input, index) => {
    console.log(input, index, "primary");

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const previewElement = document.getElementById(`imagePreview${index}`);
      handleImageCrop(file, index, previewElement);
    });
  });

  document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    if (!title.match(/^[A-Za-z][A-Za-z ]*$/)) {
      showToast("Name should contain only letters and spaces.", "error");
      return;
    }
    const expiry = document.getElementById("expiry").value.trim();
    const expiryTimestamp = new Date(expiry).getTime();

    if (expiryTimestamp < Date.now()) {
      showToast("The date should be valid and in the future", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append(
      "description",
      document.getElementById("description").value.trim(),
    );
    formData.append(
      "regularPrice",
      document.getElementById("regularPrice").value.trim(),
    );
    formData.append("expiryDate", expiryTimestamp);
    formData.append(
      "category",
      document.getElementById("category").value.trim(),
    );
    formData.append("quantity", document.getElementById("stock").value.trim());

    imageInputs.forEach((input, index) => {
      if (croppedBlobs[index]) {
      
        formData.append(
          "primaryImageInput",
          croppedBlobs[index],
          `image-${index}-cropped.jpg`,
        );
      } else if (input.files[0]) {
      
        formData.append("primaryImageInput", input.files[0], input.files[0].name);
      }
    });

    fetch("/admin/api/products", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : {
              success: false,
              message: "Upload failed. Please try again.",
            };

        if (!res.ok) {
          throw new Error(data.message || "Upload failed. Please try again.");
        }

        return data;
      })
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          showToast(data.message, "error");
        }
      })
      .catch((error) => {
        showToast(error.message || "Upload failed. Please try again.", "error");
      });
  });
});
