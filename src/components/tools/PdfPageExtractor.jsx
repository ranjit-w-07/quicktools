import PdfToolCore from "./PdfToolCore.jsx";
import "./PdfPageExtractor.css";

export default function PdfPageExtractor() {
  return <PdfToolCore mode="extract" title="PDF Page Extractor" description="Select the pages you need and save them as a separate PDF." className="pdfPageExtractor-tool" />;
}
