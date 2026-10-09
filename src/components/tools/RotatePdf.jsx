import PdfToolCore from "./PdfToolCore.jsx";
import "./RotatePdf.css";

export default function RotatePdf() {
  return <PdfToolCore mode="rotate" title="Rotate PDF" description="Rotate every page clockwise and download the updated PDF." className="rotatePdf-tool" />;
}
