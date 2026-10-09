import ImageToolCore from "./ImageToolCore.jsx";
import "./ImageResizer.css";

export default function ImageResizer() {
  return <ImageToolCore mode="resize" title="Image Resizer" description="Resize an image to a specific width and height in pixels." className="imageResizer-tool" />;
}
