import PdfToolCore from "./PdfToolCore.jsx";
import "./PdfSplitter.css";

export default function PdfSplitter() {
  return <PdfToolCore mode="split" title="PDF Splitter" description="Split selected pages into individual PDF files. Enter page numbers or ranges." className="pdfSplitter-tool" />;
}
