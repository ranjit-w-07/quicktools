import PdfToolCore from "./PdfToolCore.jsx";
import "./PdfCompressor.css";

export default function PdfCompressor() {
  return <PdfToolCore mode="compress" title="PDF Compressor" description="Optimize a PDF by rewriting its document structure locally in your browser." className="pdfCompressor-tool" />;
}
