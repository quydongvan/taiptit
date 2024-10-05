const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');

upload.addEventListener('change', (event) => {
    const files = event.target.files;
    const images = [];

    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                images.push(img);
                if (images.length === files.length) {
                    drawImages(images);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(files[i]);
    }
});

function drawImages(images) {
    canvas.width = 800; // Kích thước canvas
    canvas.height = 600;

    images.forEach((img, index) => {
        const x = index * (canvas.width / images.length); // Vị trí X
        ctx.drawImage(img, x, 0, canvas.width / images.length, canvas.height); // Vẽ ảnh
    });
}

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'image-collage.png';
    link.href = canvas.toDataURL();
    link.click();
});
