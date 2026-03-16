// AinePdf - Main JavaScript File
// Handles PDF operations entirely in the browser using pdf-lib and PDF.js

// ============================================
// PDF-LIB & PDF.JS LOADING
// ============================================

// Load pdf-lib dynamically
const loadPdfLib = async () => {
    if (window.pdfLib) return window.pdfLib;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
        script.onload = () => resolve(window.PDFLib);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Load PDF.js dynamically
const loadPdfJs = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension
const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

// Validate file type
const isValidPdf = (file) => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

const isValidImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
};

// Show toast notification
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ============================================
// DROP ZONE HANDLING
// ============================================

class DropZone {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            accept: options.accept || ['.pdf', '.jpg', '.jpeg', '.png'],
            maxFiles: options.maxFiles || 10,
            maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB
            onFilesSelected: options.onFilesSelected || (() => {}),
            onFileError: options.onFileError || (() => {})
        };
        
        this.files = [];
        this.init();
    }
    
    init() {
        // Click to browse
        this.element.addEventListener('click', () => this.createInput());
        
        // Drag events
        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.element.classList.add('drag-over');
        });
        
        this.element.addEventListener('dragleave', () => {
            this.element.classList.remove('drag-over');
        });
        
        this.element.addEventListener('drop', (e) => {
            e.preventDefault();
            this.element.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
    }
    
    createInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = this.options.accept.join(',');
        input.multiple = this.options.maxFiles > 1;
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        document.body.appendChild(input);
        input.click();
        input.remove();
    }
    
    handleFiles(fileList) {
        const validFiles = [];
        
        Array.from(fileList).forEach(file => {
            // Check file size
            if (file.size > this.options.maxSize) {
                this.options.onFileError(file, `File "${file.name}" exceeds maximum size of ${formatFileSize(this.options.maxSize)}`);
                return;
            }
            
            // Check file type
            const ext = getFileExtension(file.name);
            const acceptedExts = this.options.accept.map(e => e.replace('.', ''));
            
            if (!acceptedExts.includes(ext)) {
                this.options.onFileError(file, `File "${file.name}" is not a supported file type`);
                return;
            }
            
            validFiles.push(file);
        });
        
        if (validFiles.length > 0) {
            this.files = [...this.files, ...validFiles];
            this.options.onFilesSelected(this.files);
        }
    }
    
    clear() {
        this.files = [];
    }
}

// ============================================
// PDF OPERATIONS
// ============================================

class PdfOperations {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
    }
    
    // Load PDF document
    async loadDocument(file) {
        const pdfLib = await loadPdfLib();
        const arrayBuffer = await file.arrayBuffer();
        this.pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer);
        this.totalPages = this.pdfDoc.getPageCount();
        return this.pdfDoc;
    }
    
    // Merge multiple PDFs
    async mergePdfs(files) {
        const pdfLib = await loadPdfLib();
        const mergedPdf = await pdfLib.PDFDocument.create();
        
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Split PDF
    async splitPdf(file, pageRanges) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        const newDoc = await pdfLib.PDFDocument.create();
        
        for (const range of pageRanges) {
            const pages = await newDoc.copyPages(srcDoc, [range.start - 1]);
            pages.forEach(page => newDoc.addPage(page));
        }
        
        const pdfBytes = await newDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Extract pages from PDF
    async extractPages(file, pages) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        const newDoc = await pdfLib.PDFDocument.create();
        
        const pageIndices = pages.map(p => p - 1);
        const extractedPages = await newDoc.copyPages(srcDoc, pageIndices);
        extractedPages.forEach(page => newDoc.addPage(page));
        
        const pdfBytes = await newDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Compress PDF
    async compressPdf(file, quality = 0.5) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        // Simple compression by recreating the document
        const newDoc = await pdfLib.PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        pages.forEach(page => newDoc.addPage(page));
        
        const pdfBytes = await newDoc.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Rotate PDF pages
    async rotatePages(file, pageNumbers, degrees) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        for (const pageNum of pageNumbers) {
            const page = srcDoc.getPage(pageNum - 1);
            const currentRotation = page.getRotation().angle;
            page.setRotation(pdfLib.degrees(currentRotation + degrees));
        }
        
        const pdfBytes = await srcDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Add watermark to PDF
    async addWatermark(file, text, options = {}) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        const {
            fontSize = 48,
            opacity = 0.3,
            color = [128, 128, 128],
            angle = 45,
            x = 200,
            y = 400
        } = options;
        
        const helveticaFont = await pdfLib.embedFont(pdfLib.StandardFonts.HelveticaBold);
        
        const pages = srcDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            page.drawText(text, {
                x: width / 2 - (text.length * fontSize) / 4,
                y: height / 2,
                size: fontSize,
                font: helveticaFont,
                color: pdfLib.rgb(color[0] / 255, color[1] / 255, color[2] / 255),
                opacity: opacity,
                rotate: pdfLib.degrees(angle)
            });
        }
        
        const pdfBytes = await srcDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Add page numbers
    async addPageNumbers(file, options = {}) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        const {
            fontSize = 12,
            color = [0, 0, 0],
            position = 'bottom-center'
        } = options;
        
        const helveticaFont = await pdfLib.embedFont(pdfLib.StandardFonts.Helvetica);
        const pages = srcDoc.getPages();
        
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            let x, y;
            
            switch (position) {
                case 'bottom-left':
                    x = 20;
                    y = 20;
                    break;
                case 'bottom-center':
                    x = width / 2 - 10;
                    y = 20;
                    break;
                case 'bottom-right':
                    x = width - 40;
                    y = 20;
                    break;
                default:
                    x = width / 2 - 10;
                    y = 20;
            }
            
            page.drawText(`${index + 1}`, {
                x,
                y,
                size: fontSize,
                font: helveticaFont,
                color: pdfLib.rgb(color[0] / 255, color[1] / 255, color[2] / 255)
            });
        });
        
        const pdfBytes = await srcDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Add text to PDF (for editing)
    async addText(file, text, pageNumber, options = {}) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        const {
            x = 100,
            y = 100,
            fontSize = 16,
            color = [0, 0, 0]
        } = options;
        
        const helveticaFont = await pdfLib.embedFont(pdfLib.StandardFonts.Helvetica);
        const page = srcDoc.getPage(pageNumber - 1);
        
        page.drawText(text, {
            x,
            y,
            size: fontSize,
            font: helveticaFont,
            color: pdfLib.rgb(color[0] / 255, color[1] / 255, color[2] / 255)
        });
        
        const pdfBytes = await srcDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Add shapes to PDF
    async addShape(file, shape, pageNumber, options = {}) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        const {
            x = 100,
            y = 100,
            width = 100,
            height = 100,
            color = [255, 0, 0],
            borderColor = [0, 0, 0],
            borderWidth = 1
        } = options;
        
        const page = srcDoc.getPage(pageNumber - 1);
        
        if (shape === 'rectangle') {
            page.drawRectangle({
                x,
                y,
                width,
                height,
                borderWidth,
                borderColor: pdfLib.rgb(borderColor[0] / 255, borderColor[1] / 255, borderColor[2] / 255),
                color: pdfLib.rgb(color[0] / 255, color[1] / 255, color[2] / 255)
            });
        } else if (shape === 'ellipse') {
            page.drawEllipse({
                x: x + width / 2,
                y: y + height / 2,
                xScale: width / 2,
                yScale: height / 2,
                borderWidth,
                borderColor: pdfLib.rgb(borderColor[0] / 255, borderColor[1] / 255, borderColor[2] / 255),
                color: pdfLib.rgb(color[0] / 255, color[1] / 255, color[2] / 255)
            });
        }
        
        const pdfBytes = await srcDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Delete pages
    async deletePages(file, pagesToDelete) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        
        const pageIndices = pagesToDelete.map(p => p - 1).sort((a, b) => b - a);
        
        for (const index of pageIndices) {
            srcDoc.removePage(index);
        }
        
        const pdfBytes = await srcDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // Reorder pages
    async reorderPages(file, newOrder) {
        const pdfLib = await loadPdfLib();
        const srcDoc = await pdfLib.PDFDocument.load(await file.arrayBuffer());
        const newDoc = await pdfLib.PDFDocument.create();
        
        const pageIndices = newOrder.map(p => p - 1);
        const pages = await newDoc.copyPages(srcDoc, pageIndices);
        pages.forEach(page => newDoc.addPage(page));
        
        const pdfBytes = await newDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
}

// ============================================
// PDF TO IMAGE CONVERSION
// ============================================

class PdfToImage {
    constructor() {
        this.pdfDoc = null;
    }
    
    async loadPdf(file) {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        return this.pdfDoc;
    }
    
    async convertPageToJpeg(pageNumber, scale = 1.5) {
        const page = await this.pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        return canvas.toDataURL('image/jpeg', 0.92);
    }
    
    async convertPageToPng(pageNumber, scale = 1.5) {
        const page = await this.pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        return canvas.toDataURL('image/png');
    }
    
    async convertAllPages(format = 'jpeg', scale = 1.5) {
        const images = [];
        for (let i = 1; i <= this.pdfDoc.numPages; i++) {
            const image = format === 'png' 
                ? await this.convertPageToPng(i, scale)
                : await this.convertPageToJpeg(i, scale);
            images.push(image);
        }
        return images;
    }
}

// ============================================
// IMAGE TO PDF CONVERSION
// ============================================

class ImageToPdf {
    async convert(images) {
        const pdfLib = await loadPdfLib();
        const pdfDoc = await pdfLib.PDFDocument.create();
        
        for (const image of images) {
            // Load image
            const img = new Image();
            const canvas = document.createElement('canvas');
            
            await new Promise((resolve) => {
                img.onload = resolve;
                img.src = image;
            });
            
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.92);
            const imageBytes = await fetch(imageData).then(res => res.arrayBuffer());
            
            // Embed image based on type
            let pdfImage;
            if (image.type === 'image/png') {
                pdfImage = await pdfDoc.embedPng(imageBytes);
            } else {
                pdfImage = await pdfDoc.embedJpg(imageBytes);
            }
            
            // Add page
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(pdfImage, {
                x: 0,
                y: 0,
                width: img.width,
                height: img.height
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
}

// ============================================
// DOWNLOAD UTILITIES
// ============================================

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const downloadDataUrl = (dataUrl, filename) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// ============================================
// DARK MODE TOGGLE
// ============================================

class DarkModeToggle {
    constructor() {
        this.toggle = document.getElementById('darkModeToggle');
        this.init();
    }
    
    init() {
        if (!this.toggle) return;
        
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        
        // Check localStorage
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            document.documentElement.classList.add('dark');
        }
        
        this.updateIcons();
        
        this.toggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
            this.updateIcons();
        });
    }
    
    updateIcons() {
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        
        if (document.documentElement.classList.contains('dark')) {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        } else {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        }
    }
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================

class MobileMenu {
    constructor() {
        this.btn = document.getElementById('mobileMenuBtn');
        this.menu = document.getElementById('mobileMenu');
        this.init();
    }
    
    init() {
        if (!this.btn || !this.menu) return;
        
        this.btn.addEventListener('click', () => {
            this.menu.classList.toggle('hidden');
        });
    }
}

// ============================================
// PROGRESS BAR
// ============================================

class ProgressBar {
    constructor(element) {
        this.element = element;
        this.fill = element.querySelector('.progress-bar-fill');
    }
    
    setProgress(percent) {
        if (this.fill) {
            this.fill.style.width = `${percent}%`;
        }
    }
    
    show() {
        this.element?.classList.remove('hidden');
    }
    
    hide() {
        this.element?.classList.add('hidden');
    }
}

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
    new MobileMenu();
});

// Export to global scope
window.AinePdf = {
    DropZone,
    PdfOperations,
    PdfToImage,
    ImageToPdf,
    downloadBlob,
    downloadDataUrl,
    formatFileSize,
    getFileExtension,
    isValidPdf,
    isValidImage,
    showToast,
    ProgressBar,
    loadPdfLib,
    loadPdfJs
};
