const imageUpload = document.getElementById('image1');
const canvas = document.getElementById('mycanvas');
const cropButton = document.getElementById('cropButton');
const ctx = canvas.getContext('2d');
let img = new Image();

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        img.src = reader.result;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
    };

    reader.readAsDataURL(file);
});

cropButton.addEventListener('click', () => {
    
    const x = 100;
    const y = 100;
    const width = 200;
    const height = 200;

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    croppedCanvas.width = width;
    croppedCanvas.height = height;
    croppedCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);


    canvas.replaceWith(croppedCanvas);
});