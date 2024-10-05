document.getElementById('downloadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const baseUrl = 'http://dlib.ptit.edu.vn/flowpaper/services/view.php';
    const inputLink = document.getElementById('urlInput').value;
    const numPages = document.getElementById('numPages').value;

    if (!inputLink || !numPages) {
        alert("Vui lòng nhập đường link và số trang.");
        return;
    }

    const docId = inputLink.split("doc=")[1].split("&")[0];
    const subfolder = inputLink.split("subfolder=")[1].split("&")[0];

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const downloadLink = document.getElementById('downloadLink');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    let imageUrls = [];
    for (let i = 1; i <= numPages; i++) {
        const url = `${baseUrl}?doc=${docId}&format=jpg&page=${i}&subfolder=${subfolder}`;
        imageUrls.push(url);
    }

    // Tổng hợp các ảnh từ URL
    let images = [];
    for (let i = 0; i < imageUrls.length; i++) {
        try {
            const image = await loadImageFromUrl(imageUrls[i]);
            images.push(image);

            // Cập nhật tiến trình
            const progressPercent = ((i + 1) / numPages) * 100;
            progressBar.style.width = `${progressPercent}%`;
        } catch (error) {
            console.error(`Lỗi khi tải trang ${i + 1}:`, error);
        }
    }

    if (images.length === 0) {
        alert("Không tải được ảnh nào.");
        return;
    }

    // Tạo PDF từ các ảnh đã tải
    try {
        const pdfBlob = createPdfFromImages(images);

        // Tạo link tải xuống
        const pdfUrl = URL.createObjectURL(pdfBlob);
        downloadLink.href = pdfUrl;
        downloadLink.style.display = 'block';
        downloadLink.innerText = 'Tải xuống PDF';
        downloadLink.download = 'output.pdf';
    } catch (error) {
        console.error("Lỗi khi tạo PDF:", error);
    }

    progressContainer.style.display = 'none';
});

// Hàm tải ảnh từ URL
function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';  // Để tải được ảnh từ nguồn khác domain
        img.onload = () => {
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
}

// Tạo file PDF từ các ảnh
function createPdfFromImages(images) {
    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = getBase64Image(img);

        if (i === 0) {
            pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
        } else {
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
        }
    }

    return pdf.output('blob');
}

// Chuyển đổi ảnh thành base64
function getBase64Image(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
