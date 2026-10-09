import ImageToolCore from "./ImageToolCore.jsx";
import "./ImageCropper.css";

export default function ImageCropper() {
  return <ImageToolCore mode="crop" title="Image Cropper" description="Crop an image using custom X/Y coordinates and pixel dimensions." className="imageCropper-tool" />;
}
