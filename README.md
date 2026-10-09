# QuickTools

QuickTools is a React + Vite browser-based utility site.

## Run locally

1. Install Node.js (the project was created with Vite and React).
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite.

To create a production build, run `npm run build`. The generated static site is placed in `dist/`.

## Project organization

- `src/App.jsx` — homepage, tool groups, lightweight URL routing and lazy-loaded tool registry.
- `src/App.css` — homepage layout, navigation, categories and responsive card grid.
- `src/components/<Tool>.jsx` and `.css` — existing tool components and their styles.
- `src/components/tools/` — new tools. Each public tool has its own JSX and CSS file.
- `src/components/tools/PdfToolCore.jsx` — shared PDF processing logic used by the PDF tool wrappers.
- `src/components/tools/ImageToolCore.jsx` — shared canvas/image processing logic used by image tool wrappers.
- `src/components/tools/shared-new-tools.css` — common responsive form and result styles.

## Performance and privacy

- Tools are loaded with `React.lazy()` and `Suspense`; a tool's component code is requested when its route is opened.
- Vite creates separate production chunks for dynamically imported tools and shared dependencies.
- PDF and image processing is done locally in the browser for the implemented tools.
- Image preview dimensions are constrained by CSS; the image tools reject files larger than 40 MB and cap output at 40 megapixels.
- Object URLs for previews and downloads are revoked after use.
- `public/_redirects` supports client-side tool URLs on static hosts that honor this file.

## Tool behavior notes

- PDF Compressor currently rewrites/optimizes the PDF structure. It cannot promise a smaller file for every PDF, particularly files with large embedded images. True image re-encoding compression would require a more involved PDF rasterization workflow and may reduce document quality.
- PDF Splitter downloads each selected page as an individual PDF. Browsers may ask permission for multiple downloads.
- PDF to PNG exports each page as a separate PNG; high scale settings can use significant memory on large PDFs.
- Image Cropper uses X/Y coordinates and crop width/height in original image pixels.

## Tool list

### PDF tools
JPG to PDF, PDF to JPG, Merge PDF, PDF Compressor, PDF Splitter, PDF Page Extractor, PDF to PNG, Rotate PDF.

### Image tools
Image Compressor, Image Resizer, JPG to PNG, PNG to JPG, WebP to JPG, Image Cropper.

### Calculators
Unit Converter, EMI Calculator, Percentage Calculator, Age Calculator, Discount Calculator, Date Calculator, GST Calculator.

## Deployment and SEO reminder

This is a client-rendered React application with distinct tool URLs such as `/tools/pdf-compressor/`. Use a static host with SPA fallback enabled. Client-side routes and title updates help navigation, but they do not guarantee indexing or search rankings by themselves. Add unique explanatory content and metadata per tool, plus About, Contact, Privacy Policy and Terms pages before applying for ad monetization.
