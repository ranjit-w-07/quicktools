import ImageToolCore from "./ImageToolCore.jsx";
import "./JpgToPng.css";

export default function JpgToPng() {
  return <ImageToolCore mode="jpg-png" title="JPG to PNG" description="Convert a JPG/JPEG image into a PNG file." className="jpgToPng-tool" />;
}
