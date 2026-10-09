import PdfToolCore from "./PdfToolCore.jsx";
import "./PdfToPng.css";

export default function PdfToPng() {
  return <PdfToolCore mode="png" title="PDF to PNG" description="Convert every page of a PDF into a downloadable PNG image." className="pdfToPng-tool" />;
}
