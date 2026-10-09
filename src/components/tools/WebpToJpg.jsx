import ImageToolCore from "./ImageToolCore.jsx";
import "./WebpToJpg.css";

export default function WebpToJpg() {
  return <ImageToolCore mode="webp-jpg" title="WebP to JPG" description="Convert a WebP image into a JPG file." className="webpToJpg-tool" />;
}
