import { useEffect, useState } from "react";
import "./shared-new-tools.css";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const cleanName = (name) => (name || "image").replace(/\.[^.]+$/, "").replace(/[<>:"\/\\|?*\u0000-\u001F]/g, "-").slice(0, 90) || "image";

export default function ImageToolCore({ mode, title, description, className = "" }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropWidth, setCropWidth] = useState("400");
  const [cropHeight, setCropHeight] = useState("400");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const onFile = (next) => {
    setFile(next || null); setMessage(""); setError(false);
    setDimensions({ width: 0, height: 0 });
    if (!next) { setPreviewUrl(""); return; }
    if (next.size > 40 * 1024 * 1024) { setError(true); setMessage("Please choose an image smaller than 40 MB."); setFile(null); setPreviewUrl(""); return; }
    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
    const image = new Image();
    image.onload = () => {
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setWidth(String(image.naturalWidth)); setHeight(String(image.naturalHeight));
      setCropX("0"); setCropY("0");
      setCropWidth(String(Math.min(image.naturalWidth, 400)));
      setCropHeight(String(Math.min(image.naturalHeight, 400)));
    };
    image.onerror = () => { setError(true); setMessage("This image could not be opened. Try a JPG, PNG or WebP file."); };
    image.src = url;
  };

  const process = async () => {
    if (!file || !previewUrl) { setError(true); setMessage("Please choose an image first."); return; }
    if (!dimensions.width || !dimensions.height) { setError(true); setMessage("Wait for the image preview to finish loading."); return; }
    setBusy(true); setMessage(""); setError(false);
    let image;
    try {
      image = await new Promise((resolve, reject) => {
        const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = previewUrl;
      });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let outWidth = dimensions.width, outHeight = dimensions.height;
      let outputType = (mode === "resize" || mode === "crop") && ["image/png", "image/webp"].includes(file.type) ? file.type : "image/jpeg";
      let extension = outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
      if (mode === "resize") {
        outWidth = Math.floor(Number(width)); outHeight = Math.floor(Number(height));
        if (!Number.isFinite(outWidth) || !Number.isFinite(outHeight) || outWidth < 1 || outHeight < 1 || outWidth > 12000 || outHeight > 12000 || outWidth * outHeight > 40000000) throw new Error("Enter dimensions between 1 and 12,000 px, with no more than 40 megapixels.");
      } else if (mode === "crop") {
        const x = Math.floor(Number(cropX)), y = Math.floor(Number(cropY));
        outWidth = Math.floor(Number(cropWidth)); outHeight = Math.floor(Number(cropHeight));
        if (![x,y,outWidth,outHeight].every(Number.isFinite) || x < 0 || y < 0 || outWidth < 1 || outHeight < 1 || x + outWidth > dimensions.width || y + outHeight > dimensions.height) throw new Error(`Crop area must fit inside the original ${dimensions.width} × ${dimensions.height} image.`);
        canvas.width = outWidth; canvas.height = outHeight;
        if (outputType === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, outWidth, outHeight); }
        ctx.drawImage(image, x, y, outWidth, outHeight, 0, 0, outWidth, outHeight);
      } else {
        if (mode === "jpg-png") { outputType = "image/png"; extension = "png"; }
        if (mode === "png-jpg" || mode === "webp-jpg") { outputType = "image/jpeg"; extension = "jpg"; }
        if (outputType === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, outWidth, outHeight); }
      }
      if (mode !== "crop") {
        canvas.width = outWidth; canvas.height = outHeight;
        if (outputType === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, outWidth, outHeight); }
        ctx.drawImage(image, 0, 0, outWidth, outHeight);
      }
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality / 100));
      if (!blob) throw new Error("Your browser could not export this image in the selected format.");
      downloadBlob(blob, `${cleanName(file.name)}-${mode === "resize" ? "resized" : mode === "crop" ? "cropped" : "converted"}.${extension}`);
      setMessage(`Done. Output: ${outWidth} × ${outHeight} px · ${(blob.size / 1024).toFixed(1)} KB. The download is ready.`);
      canvas.width = 1; canvas.height = 1;
    } catch (err) {
      setError(true); setMessage(err?.message || "Could not process this image.");
    } finally { setBusy(false); }
  };

  const accept = mode === "webp-jpg" ? "image/webp,.webp" : mode === "jpg-png" ? "image/jpeg,.jpg,.jpeg" : mode === "png-jpg" ? "image/png,.png" : "image/*";
  const isResize = mode === "resize", isCrop = mode === "crop";
  return <section className={`new-tool-section ${className}`}><div className="new-tool-container"><div className="new-tool-card">
    <h2 className="new-tool-title">{title}</h2><p className="new-tool-description">{description}</p>
    <div className="new-tool-form">
      <div className="new-tool-field new-tool-span"><label htmlFor={`image-file-${mode}`}>Choose image</label><input id={`image-file-${mode}`} type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0])} />{file && <span className="new-tool-small-note">{file.name} · {(file.size / 1024).toFixed(1)} KB</span>}</div>
      {isResize && <>
        <div className="new-tool-field"><label htmlFor="resize-width">Width (px)</label><input id="resize-width" type="number" min="1" max="12000" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
        <div className="new-tool-field"><label htmlFor="resize-height">Height (px)</label><input id="resize-height" type="number" min="1" max="12000" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
      </>}
      {isCrop && <>
        <div className="new-tool-field"><label htmlFor="crop-x">Start X (px)</label><input id="crop-x" type="number" min="0" value={cropX} onChange={(e) => setCropX(e.target.value)} /></div>
        <div className="new-tool-field"><label htmlFor="crop-y">Start Y (px)</label><input id="crop-y" type="number" min="0" value={cropY} onChange={(e) => setCropY(e.target.value)} /></div>
        <div className="new-tool-field"><label htmlFor="crop-width">Crop width (px)</label><input id="crop-width" type="number" min="1" value={cropWidth} onChange={(e) => setCropWidth(e.target.value)} /></div>
        <div className="new-tool-field"><label htmlFor="crop-height">Crop height (px)</label><input id="crop-height" type="number" min="1" value={cropHeight} onChange={(e) => setCropHeight(e.target.value)} /></div>
        <p className="new-tool-small-note new-tool-span">Use the original image pixel coordinates. The preview below is scaled to fit and may not display at its original dimensions.</p>
      </>}
      {(mode === "png-jpg" || mode === "webp-jpg") && <div className="new-tool-field new-tool-span"><label htmlFor={`quality-${mode}`}>JPG quality: {quality}%</label><input id={`quality-${mode}`} type="range" min="50" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} /></div>}
    </div>
    {previewUrl && <><img className="new-tool-preview" src={previewUrl} alt="Selected image preview" /><p className="new-tool-small-note" style={{textAlign:"center"}}>Original dimensions: {dimensions.width || "…"} × {dimensions.height || "…"} px · Preview is limited to 420 px wide.</p></>}
    <div className="new-tool-actions"><button className="new-tool-primary" onClick={process} disabled={busy || !file}>{busy ? "Processing…" : isResize ? "Resize & Download" : isCrop ? "Crop & Download" : "Convert & Download"}</button><button className="new-tool-secondary" onClick={() => onFile(null)}>Clear</button></div>
    {message && <div className={`new-tool-message ${error ? "error" : ""}`} role="status">{message}</div>}
    <p className="new-tool-small-note">Processing happens in your browser. Large images may use significant memory; this tool limits uploads to 40 MB and output dimensions to 40 megapixels.</p>
  </div></div></section>;
}
