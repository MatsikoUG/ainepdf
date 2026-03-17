# AinePdf - Free Online PDF Tools

<p align="center">
  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z'/></svg>" alt="AinePdf Logo" width="64" height="64">
</p>

AinePdf is a **completely free, browser-based PDF toolkit** that allows you to merge, split, edit, convert, and manipulate PDF files entirely in your browser. No server uploads, no login required, 100% privacy-friendly.

## ✨ Features

### Organize & Edit
- **Merge PDF** - Combine multiple PDFs into one
- **Split PDF** - Extract pages or split into multiple files
- **Compress PDF** - Reduce file size while maintaining quality
- **Extract Pages** - Pull specific pages from a PDF
- **Edit PDF** - Add text, shapes, images, and annotations. Features include drag-and-drop repositioning, width/height sliders for images, page management (delete/add pages), zoom controls (50%-300%), and direct file drop onto canvas
- **Rotate PDF** - Rotate pages by 90°, 180°, or 270°

### Convert
- **PDF to JPG** - Convert PDF pages to JPEG images
- **PDF to PNG** - Convert PDF pages to PNG images
- **JPG to PDF** - Convert images to PDF document
- **Images to PDF** - Combine multiple images into PDF
- **Convert Tools** - All-in-one converter for PDF/JPG/PNG with multiple file support

### Security & Other
- **Add Watermark** - Add text watermark to PDFs with preview and download functionality
- **Add Page Numbers** - Number pages in your PDF
- **Unlock PDF** - Remove password protection (with known password)

### Monetization & SEO
- **SEO Optimized Pages** - Individual tool pages targeting specific keywords
- **Ad Integration** - Adsterra and Google AdSense ready placements
- **Fast Loading** - Optimized for SEO and user retention

## 🔒 Privacy First

- ✅ All processing happens locally in your browser
- ✅ Files never leave your device
- ✅ No database, no server storage
- ✅ No login or signup required

## 🚀 Quick Start

### Local Development

Simply open `index.html` in your browser:

```bash
# Using Python
python -m http.server 8000

# Then open http://localhost:8000 in your browser

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

### Deployment

AinePdf can be deployed to any static hosting provider:

#### GitHub Pages
1. Create a repository on GitHub
2. Push your files to the repository
3. Go to Settings → Pages
4. Select "main" branch and save

#### Netlify
1. Drag and drop your project folder to Netlify
2. Your site will be deployed automatically

#### Vercel
```bash
npm i -g vercel
vercel
```

#### GitLab Pages
1. Create a `.gitlab-ci.yml` file:
```yaml
pages:
  script:
    - mv . public
  artifacts:
    paths:
      - public
```

## 📁 Project Structure

```
AinePdf/
├── index.html              # Homepage
├── README.md               # This file
├── css/
│   └── styles.css          # Custom styles
├── js/
│   └── main.js            # PDF operations & utilities
└── pages/
    ├── all-tools.html      # All tools listing
    ├── merge-pdf.html     # Merge PDF tool
    ├── split-pdf.html    # Split PDF tool
    ├── compress-pdf.html  # Compress PDF tool
    ├── edit-pdf.html     # Edit PDF tool
    ├── pdf-to-jpg.html   # PDF to JPG converter
    ├── jpg-to-pdf.html   # JPG to PDF converter
    ├── pdf-to-png.html   # PDF to PNG converter
    ├── rotate-pdf.html   # Rotate PDF tool
    ├── add-watermark.html # Add watermark tool
    ├── add-page-numbers.html # Add page numbers
    ├── extract-pages.html # Extract pages
    ├── unlock-pdf.html   # Unlock PDF tool
    ├── convert.html      # Convert tools listing
    └── about.html        # About page
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling
- **TailwindCSS** - Utility-first CSS framework (via CDN)
- **JavaScript** - Vanilla JS (ES6+)
- **pdf-lib** - PDF manipulation library
- **PDF.js** - PDF rendering library

## 📋 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Opera 67+

## 📄 License

MIT License - Feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">Made with ❤️ for privacy</p>
