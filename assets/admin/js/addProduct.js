document.addEventListener('DOMContentLoaded', function () {
    const imageInputs = document.querySelectorAll('.primaryImageInput');
    const imageCropModal = document.getElementById('imageCropModal');
    const cropImage = document.getElementById('cropImage');
    const cropButton = document.getElementById('cropButton');
    let cropper;
    let croppedBlobs = []; // Array to store cropped blobs for each image input

    console.log(croppedBlobs);
    

    function handleImageCrop(file, inputIndex) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            console.log('reader',reader);
            
            reader.onload = function (e) {
                cropImage.src = e.target.result;
                imageCropModal.style.display = 'block';

                if (cropper) cropper.destroy(); // Destroy any previous cropper instance

                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                    responsive: true,
                });

                // Set cropping action for the current input's cropped image
                cropButton.onclick = () => {
                    if (cropper) {
                        const canvas = cropper.getCroppedCanvas();
                        canvas.toBlob(blob => {
                            croppedBlobs[inputIndex] = blob; // Store cropped blob by input index
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

    imageInputs.forEach((input, index) => {
        console.log(input,index,'primary');
        
        input.addEventListener('change', event => {
            const file = event.target.files[0];
            handleImageCrop(file, index);
        });
    });

    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        if (!title.match(/^[A-Za-z][A-Za-z ]*$/)) {
            showToast("Name should contain only letters and spaces.",'error');
            return;
        }
        const expiry = document.getElementById('expiry').value.trim();
        const expiryTimestamp = new Date(expiry).getTime();


        if (expiryTimestamp < Date.now()) {
        showToast('The date should be valid and in the future', 'error');
        return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', document.getElementById('description').value.trim());
        formData.append('regularPrice', document.getElementById('regularPrice').value.trim());
        formData.append('expiryDate',expiryTimestamp);
        formData.append('category', document.getElementById('category').value.trim());
        formData.append('quantity', document.getElementById('stock').value.trim());

        imageInputs.forEach((input, index) => {
            const file = input.files[0];
            if (croppedBlobs[index]) {
    formData.append('primaryImageInput', croppedBlobs[index], `image-${index}-cropped.jpg`);
}

        });

        fetch('/admin/addProduct', {
            method: 'POST',
            body: formData
        }).then(res => res.json())
        .then(data =>{
            if(data.success){
                showToast(data.message, 'success');
                setTimeout(()=>{
                    location.reload()
                },1000)
                
            }else{
                showToast(data.message, 'error')
            }
            
        } )
      
    });
});

                