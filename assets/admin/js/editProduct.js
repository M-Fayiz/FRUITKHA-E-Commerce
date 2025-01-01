

     
     document.addEventListener('DOMContentLoaded', function () {
    const primaryImageInput = document.getElementById('primaryImageInput');
    const additionalImageInputs = document.querySelectorAll('.additionalImageInput');
    console.log(additionalImageInputs,'image input');
    
    const imageCropModal = document.getElementById('imageCropModal');
    const cropImage = document.getElementById('cropImage');
    const cropButton = document.getElementById('cropButton');
    let cropper;
    let croppedBlobs = {}; 
    function handleImageCrop(file, inputName) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!file || !allowedTypes.includes(file.type)) {
            
            showToast("Invalid file type! Please upload a PNG or JPEG image ..",'info');
            return; 
        }
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                cropImage.src = e.target.result;
                imageCropModal.style.display = 'block';

                if (cropper) cropper.destroy();

                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                    responsive: true,
                });

                cropButton.onclick = () => {
                    if (cropper) {
                        const canvas = cropper.getCroppedCanvas();
                        canvas.toBlob(blob => {
                            croppedBlobs[inputName] = blob;
                            console.log(croppedBlobs,'blobs');
                            
                            imageCropModal.style.display = 'none';
                            cropper.destroy();
                            cropper = null;
                        });
                    }
                };
            };
            reader.readAsDataURL(file);
        }
    }

    // Event listener for primary image input
    primaryImageInput.addEventListener('change', event => {
        const file = event.target.files[0];
        handleImageCrop(file, 'primaryImage');
    });

   
    additionalImageInputs.forEach((input, index) => {
    console.log(`Processing input at index ${index}:`, input); 
    
    input.addEventListener('change', event => {
        const file = event.target.files[0];
        console.log(`File selected at index ${index}:`, file); 
        handleImageCrop(file, `additionalImage${index}`);
    });
});

   
    document.getElementById('updateProductForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData();
        const title = document.getElementById("title").value.trim();

        
        const saveButton = document.querySelector('.save-button');
        const productId = saveButton.getAttribute("data-id");
        formData.append('productId', productId);
     console.log(formData.get('productId'));
     
        

        if (title && title.match(/^[A-Za-z][A-Za-z ]*$/)) {
            formData.append('title', title);
        }

       
        const fieldsToCheck = ['description', 'regularPrice', 'offerPrice', 'category', 'stock'];
        fieldsToCheck.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value.trim()) {
                formData.append(fieldId, field.value.trim());
            }
        });

        
        if (croppedBlobs['primaryImage']) {
    formData.append('primaryImage', croppedBlobs['primaryImage'], 'primary-image-cropped.jpg');
}


if (additionalImageInputs) {
    additionalImageInputs.forEach((input, index) => {
        if (croppedBlobs[`additionalImage${index}`]) {
           
            formData.append(`additionalImage${index}`, croppedBlobs[`additionalImage${index}`], `additional-image-${index}-cropped.jpg`);
            console.log(`Appended additionalImage${index} to formData`);
        } else {
          
            console.log(`No updated blob for additionalImage${index}, skipping formData append`);
        }
    });
}

       
        fetch('/admin/updateProduct', {
            method: 'PATCH', 
            body: formData
        })
        .then(res => res.json())
        .then(data =>{
            if(data.success){
                showToast(data.message, 'success');
            }else{
                showToast(data.message, 'error');
            }
        } )
        
    });
});

