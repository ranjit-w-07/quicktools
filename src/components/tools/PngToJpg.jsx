import ImageToolCore from "./ImageToolCore.jsx";
import "./PngToJpg.css";

export default function PngToJpg() {
  return <ImageToolCore mode="png-jpg" title="PNG to JPG" description="Convert a PNG image to JPG. Transparent areas are filled with white." className="pngToJpg-tool" />;
}
