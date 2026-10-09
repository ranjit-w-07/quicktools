import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "./shared-new-tools.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeBaseName(filename) {
  return (filename || "document.pdf").replace(/\.pdf$/i, "").replace(/[<>:"\/\\|?*\u0000-\u001F]/g, "-").slice(0, 100) || "document";
}

function parsePageSelection(value, maxPages) {
  const selected = new Set();
  for (const part of value.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      let a = Number(range[1]), b = Number(range[2]);
      if (a > b) [a, b] = [b, a];
      for (let n = a; n <= b; n++) {
        if (n < 1 || n > maxPages) throw new Error(`Page numbers must be between 1 and ${maxPages}.`);
        selected.add(n - 1);
      }
    } else if (/^\d+$/.test(token)) {
      const n = Number(token);
      if (n < 1 || n > maxPages) throw new Error(`Page numbers must be between 1 and ${maxPages}.`);
      selected.add(n - 1);
    } else {
      throw new Error("Enter pages like 1,3-5.");
    }
  }
  return [...selected].sort((a, b) => a - b);
}

export default function PdfToolCore({ mode, title, description, className = "" }) {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState("1");
  const [rotation, setRotation] = useState("90");
  const [scale, setScale] = useState("1.5");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const selectFile = (nextFile) => {
    setFile(nextFile || null);
    setMessage("");
    setIsError(false);
  };

  const run = async () => {
    if (!file) {
      setIsError(true); setMessage("Please choose a PDF file first."); return;
    }
    if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setIsError(true); setMessage("Please select a valid PDF file."); return;
    }
    setBusy(true); setMessage(""); setIsError(false);
    try {
      const bytes = await file.arrayBuffer();
      const base = safeBaseName(file.name);
      if (mode === "compress") {
        const doc = await PDFDocument.load(bytes);
        const out = await doc.save({ useObjectStreams: true, addDefaultPage: false });
        saveBlob(new Blob([out], { type: "application/pdf" }), `${base}-optimized.pdf`);
        const reduction = file.size ? Math.max(0, (1 - out.byteLength / file.size) * 100) : 0;
        setMessage(`PDF optimized and downloaded. File size changed by ${reduction.toFixed(1)}%. Rewriting a PDF may not reduce files that are already optimized or contain large embedded images.`);
      } else if (mode === "rotate") {
        const doc = await PDFDocument.load(bytes);
        const angle = Number(rotation);
        doc.getPages().forEach((page) => page.setRotation(degrees(((page.getRotation().angle + angle) % 360 + 360) % 360)));
        const out = await doc.save({ useObjectStreams: true });
        saveBlob(new Blob([out], { type: "application/pdf" }), `${base}-rotated.pdf`);
        setMessage(`Rotated ${doc.getPageCount()} page(s) by ${angle}° and downloaded the result.`);
      } else if (mode === "extract" || mode === "split") {
        const source = await PDFDocument.load(bytes);
        const pageIndexes = parsePageSelection(pages, source.getPageCount());
        if (!pageIndexes.length) throw new Error("Enter at least one page number.");
        if (mode === "extract") {
          const outDoc = await PDFDocument.create();
          const copied = await outDoc.copyPages(source, pageIndexes);
          copied.forEach((page) => outDoc.addPage(page));
          const out = await outDoc.save({ useObjectStreams: true });
          saveBlob(new Blob([out], { type: "application/pdf" }), `${base}-pages-${pages.replace(/[^0-9,-]/g, "") || "selected"}.pdf`);
          setMessage(`Extracted ${copied.length} page(s) into a new PDF.`);
        } else {
          for (const pageIndex of pageIndexes) {
            const outDoc = await PDFDocument.create();
            const [page] = await outDoc.copyPages(source, [pageIndex]);
            outDoc.addPage(page);
            const out = await outDoc.save({ useObjectStreams: true });
            saveBlob(new Blob([out], { type: "application/pdf" }), `${base}-page-${pageIndex + 1}.pdf`);
          }
          setMessage(`Downloaded ${pageIndexes.length} individual PDF file(s). Your browser may ask to allow multiple downloads.`);
        }
      } else if (mode === "png") {
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
        const factor = Math.max(0.5, Math.min(3, Number(scale) || 1.5));
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: factor });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d", { alpha: false });
          await page.render({ canvasContext: context, viewport }).promise;
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
          if (blob) saveBlob(blob, `${base}-page-${pageNum}.png`);
          canvas.width = 1; canvas.height = 1;
          page.cleanup();
        }
        await pdf.destroy();
        setMessage(`Rendered ${pdf.numPages} page(s) as PNG. Your browser may ask to allow multiple downloads.`);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error?.message || "Could not process this PDF. Try another file.");
    } finally {
      setBusy(false);
    }
  };

  const needsPages = mode === "extract" || mode === "split";
  return (
    <section className={`new-tool-section ${className}`}>
      <div className="new-tool-container">
        <div className="new-tool-card">
          <h2 className="new-tool-title">{title}</h2>
          <p className="new-tool-description">{description}</p>
          <div className="new-tool-form">
            <div className="new-tool-field new-tool-span">
              <label htmlFor={`pdf-file-${mode}`}>Choose PDF file</label>
              <input id={`pdf-file-${mode}`} type="file" accept="application/pdf,.pdf" onChange={(e) => selectFile(e.target.files?.[0])} />
              {file && <span className="new-tool-small-note">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
            </div>
            {needsPages && <div className="new-tool-field new-tool-span">
              <label htmlFor={`pdf-pages-${mode}`}>{mode === "split" ? "Pages to split into separate PDFs" : "Pages to extract"}</label>
              <input id={`pdf-pages-${mode}`} value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1,3-5" />
              <span className="new-tool-small-note">Use page numbers separated by commas and ranges, such as 1,3-5.</span>
            </div>}
            {mode === "rotate" && <div className="new-tool-field">
              <label htmlFor="pdf-rotation">Rotation</label>
              <select id="pdf-rotation" value={rotation} onChange={(e) => setRotation(e.target.value)}><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select>
            </div>}
            {mode === "png" && <div className="new-tool-field">
              <label htmlFor="pdf-png-scale">PNG quality / scale</label>
              <select id="pdf-png-scale" value={scale} onChange={(e) => setScale(e.target.value)}><option value="1">Standard (1×)</option><option value="1.5">High (1.5×)</option><option value="2">Very high (2×)</option><option value="3">Maximum (3×)</option></select>
            </div>}
          </div>
          <div className="new-tool-actions"><button className="new-tool-primary" onClick={run} disabled={busy}>{busy ? "Processing…" : mode === "compress" ? "Optimize PDF" : mode === "split" ? "Split PDF" : mode === "extract" ? "Extract Pages" : mode === "rotate" ? "Rotate & Download" : "Convert to PNG"}</button><button className="new-tool-secondary" onClick={() => { setFile(null); setMessage(""); setIsError(false); }}>Clear</button></div>
          {message && <div className={`new-tool-message ${isError ? "error" : ""}`} role="status">{message}</div>}
          {mode === "compress" && <p className="new-tool-small-note">Note: this browser-based optimizer rewrites the PDF structure. It cannot guarantee a smaller file for every document, especially PDFs with large embedded images.</p>}
        </div>
      </div>
    </section>
  );
}
