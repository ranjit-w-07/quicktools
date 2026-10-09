import "./shared-tools.css";
import "./JpgToPdf.css";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

function JpgToPdf() {
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [fileName, setFileName] = useState("converted-images");
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedPdf, setGeneratedPdf] = useState(null);

  const [settings, setSettings] = useState({
    pageSize: "a4",
    orientation: "portrait",
    margin: 10,
    fit: "fit",
  });
  useEffect(() => {
  return () => {
    if (generatedPdf?.url) {
      URL.revokeObjectURL(generatedPdf.url);
    }
  };
}, [generatedPdf]);

  const addFiles = (files) => {
    const selectedFiles = Array.from(files);

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );

    if (validFiles.length === 0) {
      alert("Please select JPG or PNG images.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...newImages]);
  };

  const handleFiles = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    addFiles(event.dataTransfer.files);
  };

  const removeImage = (id) => {
    setImages((previous) => {
      const imageToRemove = previous.find(
        (image) => image.id === id
      );

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return previous.filter((image) => image.id !== id);
    });
  };
  const moveImage = (index, direction) => {
  const newImages = [...images];
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= newImages.length) {
    return;
  }

  [newImages[index], newImages[newIndex]] = [
    newImages[newIndex],
    newImages[index],
  ];

  setImages(newImages);
};
  const clearAllImages = () => {
  images.forEach((image) => {
    URL.revokeObjectURL(image.url);
  });

  setImages([]);
};

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    const cleanFileName =
      fileName.trim() || "converted-images";

    setIsConverting(true);
    setSuccessMessage("");

    try {
      const pdf = new jsPDF({
        orientation: settings.orientation,
        unit: "mm",
        format: settings.pageSize,
      });

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (i > 0) {
          pdf.addPage(
            settings.pageSize,
            settings.orientation
          );
        }

        const img = new Image();

        img.src = image.url;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const pageWidth =
          settings.orientation === "portrait"
            ? settings.pageSize === "a4"
              ? 210
              : 215.9
            : settings.pageSize === "a4"
              ? 297
              : 279.4;

        const pageHeight =
          settings.orientation === "portrait"
            ? settings.pageSize === "a4"
              ? 297
              : 279.4
            : settings.pageSize === "a4"
              ? 210
              : 215.9;

        const margin = Number(settings.margin);

        const availableWidth =
          pageWidth - margin * 2;

        const availableHeight =
          pageHeight - margin * 2;

        const imageRatio = img.width / img.height;

        let width;
        let height;

        if (settings.fit === "fit") {
          width = availableWidth;
          height = width / imageRatio;

          if (height > availableHeight) {
            height = availableHeight;
            width = height * imageRatio;
          }
        } else {
          height = availableHeight;
          width = height * imageRatio;

          if (width < availableWidth) {
            width = availableWidth;
            height = width / imageRatio;
          }
        }

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        const imageType =
          image.file.type === "image/png"
            ? "PNG"
            : "JPEG";

        pdf.addImage(
          img,
          imageType,
          x,
          y,
          width,
          height
        );
      }
if (generatedPdf?.url) {
  URL.revokeObjectURL(generatedPdf.url);
}
   const pdfBlob = pdf.output("blob");

const pdfUrl = URL.createObjectURL(pdfBlob);

setGeneratedPdf({
  url: pdfUrl,
  fileName: `${cleanFileName}.pdf`,
});

pdf.save(`${cleanFileName}.pdf`);

setSuccessMessage(
  `${cleanFileName}.pdf created successfully!`
);
    } catch (error) {
    console.error(error);
    alert("Something went wrong while creating the PDF.");

  } finally {
    setIsConverting(false);
  }
  };

  return (
    <section className="converter-section">
      <div className="converter-container">

        <div className="converter-header">
          <p className="hero-label">IMAGE TO PDF</p>

          <h1>JPG to PDF Converter</h1>

          <p>
            Convert JPG and PNG images into a PDF file quickly
            and easily.
          </p>
        </div>

        <div
          className={`upload-box ${
            isDragging ? "upload-box-dragging" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📁</div>

          <h3>
            {isDragging
              ? "Drop your images here"
              : "Select or drop your images"}
          </h3>

          <p>
            JPG and PNG files are supported
          </p>

          <label className="upload-button">
            Select Images

            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFiles}
            />
          </label>

          <small>
            You can select multiple images or drag & drop them here
          </small>
        </div>

        {images.length > 0 && (
          <>
            {/* PDF SETTINGS */}

            <div className="settings-panel">

              <div className="settings-heading">
                <p className="hero-label">
                  PDF SETTINGS
                </p>

                <h2>Customize your PDF</h2>
              </div>

              <div className="settings-grid">

                <div className="setting-group">
                  <label>Page Size</label>

                  <select
                    value={settings.pageSize}
                    onChange={(event) =>
                      updateSetting(
                        "pageSize",
                        event.target.value
                      )
                    }
                  >
                    <option value="a4">
                      A4
                    </option>

                    <option value="letter">
                      Letter
                    </option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Orientation</label>

                  <select
                    value={settings.orientation}
                    onChange={(event) =>
                      updateSetting(
                        "orientation",
                        event.target.value
                      )
                    }
                  >
                    <option value="portrait">
                      Portrait
                    </option>

                    <option value="landscape">
                      Landscape
                    </option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Margin</label>

                  <select
                    value={settings.margin}
                    onChange={(event) =>
                      updateSetting(
                        "margin",
                        event.target.value
                      )
                    }
                  >
                    <option value="5">
                      Small
                    </option>

                    <option value="10">
                      Normal
                    </option>

                    <option value="20">
                      Large
                    </option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Image Fit</label>

                  <select
                    value={settings.fit}
                    onChange={(event) =>
                      updateSetting(
                        "fit",
                        event.target.value
                      )
                    }
                  >
                    <option value="fit">
                      Fit to page
                    </option>

                    <option value="fill">
                      Fill page
                    </option>
                  </select>
                </div>

              </div>
            </div>

            {/* FILE NAME */}

            <div className="filename-panel">

              <div className="filename-info">
                <p className="hero-label">
                  OUTPUT FILE
                </p>

                <h2>Choose PDF file name</h2>
              </div>

              <div className="filename-input-wrapper">

                <input
                  type="text"
                  value={fileName}
                  onChange={(event) =>
                    setFileName(event.target.value)
                  }
                  placeholder="Enter PDF file name"
                />

                <span>.pdf</span>

              </div>

            </div>

            {/* SELECTED IMAGES */}

            <div className="selected-section">

              <div className="selected-header">
  <div className="selected-title">
    <h2>Selected Images</h2>

    <span>
      {images.length}{" "}
      {images.length === 1
        ? "image"
        : "images"}
    </span>
  </div>

  <button
    className="clear-all-button"
    onClick={clearAllImages}
  >
    Clear All
  </button>
</div>

             <div className="image-grid">

  {images.map((image, index) => (

    <div
      className="image-card"
      key={image.id}
    >

      <div className="image-number">
        {index + 1}
      </div>

      <div className="image-order-buttons">

        <button
          onClick={() => moveImage(index, -1)}
          disabled={index === 0}
          title="Move Up"
          aria-label="Move image up"
        >
          ↑
        </button>

        <button
          onClick={() => moveImage(index, 1)}
          disabled={index === images.length - 1}
          title="Move Down"
          aria-label="Move image down"
        >
          ↓
        </button>

      </div>

      <button
        className="remove-button"
        onClick={() =>
          removeImage(image.id)
        }
        aria-label="Remove image"
      >
        ×
      </button>

      <img
        src={image.url}
        alt={image.file.name}
      />

      <p title={image.file.name}>
        {image.file.name}
      </p>

    </div>

  ))}

</div>

              <button
  className="convert-button"
  onClick={convertToPdf}
  disabled={isConverting || images.length === 0}
>
  {isConverting ? "Creating PDF..." : "Convert & Download PDF"}
</button>
{successMessage && (
  <div className="success-message">
    ✓ {successMessage}
  </div>
)}
{generatedPdf && (
  <a
    className="download-again-button"
    href={generatedPdf.url}
    download={generatedPdf.fileName}
  >
    ↓ Download Again
  </a>
)}

            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default JpgToPdf;