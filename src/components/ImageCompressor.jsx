import "./shared-tools.css";
import "./ImageCompressor.css";
import { useEffect, useMemo, useState } from "react";

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ImageCompressor = () => {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("auto");
  const [maxWidth, setMaxWidth] = useState("1920");
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Cleanup all object URLs when the component is removed.
   */
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.url) {
          URL.revokeObjectURL(image.url);
        }

        if (image.compressedUrl) {
          URL.revokeObjectURL(image.compressedUrl);
        }
      });
    };
  }, [images]);

  /*
   * Add selected files.
   */
  const handleFiles = (files) => {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const imageFiles = selectedFiles.filter((file) =>
      SUPPORTED_TYPES.includes(file.type)
    );

    if (imageFiles.length === 0) {
      setErrorMessage(
        "Please select JPG, PNG or WebP images only."
      );
      return;
    }

    const newImages = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      compressedBlob: null,
      compressedUrl: null,
      originalSize: file.size,
      compressedSize: null,
      outputType: null,
      outputName: null,
      width: null,
      height: null,
    }));

    setImages((prevImages) => [
      ...prevImages,
      ...newImages,
    ]);

    setErrorMessage("");
  };

  /*
   * Remove one image.
   */
  const removeImage = (id) => {
    setImages((prevImages) => {
      const imageToRemove = prevImages.find(
        (image) => image.id === id
      );

      if (imageToRemove?.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      if (imageToRemove?.compressedUrl) {
        URL.revokeObjectURL(imageToRemove.compressedUrl);
      }

      return prevImages.filter(
        (image) => image.id !== id
      );
    });
  };

  /*
   * Remove all images.
   */
  const clearAllImages = () => {
    images.forEach((image) => {
      if (image.url) {
        URL.revokeObjectURL(image.url);
      }

      if (image.compressedUrl) {
        URL.revokeObjectURL(image.compressedUrl);
      }
    });

    setImages([]);
    setErrorMessage("");
  };

  /*
   * Format file size.
   */
  const formatFileSize = (bytes) => {
    if (!bytes || bytes < 1024) {
      return `${bytes || 0} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /*
   * Calculate percentage saved.
   */
  const getCompressionPercentage = (
    originalSize,
    compressedSize
  ) => {
    if (!originalSize || !compressedSize) {
      return 0;
    }

    return Math.max(
      0,
      Math.round(
        ((originalSize - compressedSize) / originalSize) *
          100
      )
    );
  };

  /*
   * Decide output MIME type.
   */
  const getOutputType = (fileType) => {
    if (outputFormat === "jpeg") {
      return "image/jpeg";
    }

    if (outputFormat === "webp") {
      return "image/webp";
    }

    if (outputFormat === "png") {
      return "image/png";
    }

    // Auto mode:
    // JPEG stays JPEG.
    // WebP stays WebP.
    // PNG becomes WebP for better compression.
    if (fileType === "image/jpeg") {
      return "image/jpeg";
    }

    if (fileType === "image/webp") {
      return "image/webp";
    }

    return "image/webp";
  };

  /*
   * Get file extension from MIME type.
   */
  const getExtension = (mimeType) => {
    if (mimeType === "image/jpeg") {
      return "jpg";
    }

    if (mimeType === "image/png") {
      return "png";
    }

    return "webp";
  };

  /*
   * Generate final output filename.
   */
  const getOutputFileName = (fileName, mimeType) => {
    const nameWithoutExtension =
      fileName.replace(/\.[^/.]+$/, "");

    return `${nameWithoutExtension}-compressed.${getExtension(
      mimeType
    )}`;
  };

  /*
   * Compress and optionally resize one image.
   */
  const compressImage = (image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          const maximumWidth = Number(maxWidth);

          if (
            maximumWidth > 0 &&
            width > maximumWidth
          ) {
            const scale =
              maximumWidth / width;

            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas =
            document.createElement("canvas");

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(
              new Error(
                "Your browser does not support image processing."
              )
            );
            return;
          }

          canvas.width = width;
          canvas.height = height;

          const outputType = getOutputType(
            image.file.type
          );

          /*
           * JPEG does not support transparency.
           * Use a white background when converting
           * PNG/WebP to JPEG.
           */
          if (outputType === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(
              0,
              0,
              width,
              height
            );
          }

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressionQuality =
            quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Image compression failed."
                  )
                );
                return;
              }

              resolve({
                blob,
                width,
                height,
                outputType,
              });
            },
            outputType,
            compressionQuality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(
          new Error(
            `Unable to process ${image.file.name}`
          )
        );
      };

      img.src = image.url;
    });
  };

  /*
   * Compress all selected images.
   */
  const handleCompress = async () => {
    if (images.length === 0) {
      setErrorMessage(
        "Please select at least one image."
      );
      return;
    }

    setIsCompressing(true);
    setErrorMessage("");

    try {
      const compressedImages = [];

      for (const image of images) {
        const result = await compressImage(image);

        if (image.compressedUrl) {
          URL.revokeObjectURL(
            image.compressedUrl
          );
        }

        compressedImages.push({
          ...image,
          compressedBlob: result.blob,
          compressedUrl:
            URL.createObjectURL(result.blob),
          originalSize: image.file.size,
          compressedSize: result.blob.size,
          outputType: result.outputType,
          outputName: getOutputFileName(
            image.file.name,
            result.outputType
          ),
          width: result.width,
          height: result.height,
        });
      }

      setImages(compressedImages);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Something went wrong while compressing the images."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  /*
   * Download one compressed image.
   */
  const downloadCompressedImage = (image) => {
    if (!image.compressedUrl) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = image.compressedUrl;
    link.download =
      image.outputName ||
      `compressed-${image.file.name}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /*
   * Download all compressed images.
   *
   * Downloads are spaced slightly apart to reduce
   * browser download blocking.
   */
  const downloadAllCompressedImages = () => {
    const compressedImages =
      images.filter(
        (image) => image.compressedUrl
      );

    if (compressedImages.length === 0) {
      return;
    }

    compressedImages.forEach(
      (image, index) => {
        setTimeout(() => {
          downloadCompressedImage(image);
        }, index * 400);
      }
    );
  };

  /*
   * Drag & Drop.
   */
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

    handleFiles(event.dataTransfer.files);
  };

  /*
   * Compression summary.
   */
  const compressionSummary = useMemo(() => {
    const compressedImages =
      images.filter(
        (image) =>
          image.compressedSize !== null
      );

    if (compressedImages.length === 0) {
      return null;
    }

    const originalTotal =
      compressedImages.reduce(
        (total, image) =>
          total + image.originalSize,
        0
      );

    const compressedTotal =
      compressedImages.reduce(
        (total, image) =>
          total + image.compressedSize,
        0
      );

    const savedTotal =
      Math.max(
        0,
        originalTotal - compressedTotal
      );

    const savedPercentage =
      originalTotal > 0
        ? Math.max(
            0,
            Math.round(
              (savedTotal / originalTotal) *
                100
            )
          )
        : 0;

    return {
      originalTotal,
      compressedTotal,
      savedTotal,
      savedPercentage,
    };
  }, [images]);

  return (
    <section className="converter-section">
      <div className="converter-container">

        {/* HEADER */}
        <div className="converter-header">
          <p className="hero-label">
            IMAGE TOOL
          </p>

          <h1>
            Compress <span>Images</span>
          </h1>

          <p>
            Reduce image file size while
            maintaining good image quality.
          </p>
        </div>

        {/* UPLOAD AREA */}
        <div
          className={`upload-box ${
            isDragging
              ? "upload-box-dragging"
              : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            🖼️
          </div>

          <h3>
            Upload your images
          </h3>

          <p>
            JPG, PNG or WebP files supported
          </p>

          <label className="upload-button">
            Choose Images

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                handleFiles(
                  event.target.files
                );

                event.target.value = "";
              }}
            />
          </label>

          <small>
            You can select multiple images
          </small>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="tool-error">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* SETTINGS */}
        <div className="settings-panel">
          <div className="settings-heading">
            <p className="hero-label">
              COMPRESSION SETTINGS
            </p>

            <h2>
              Optimize Your Images
            </h2>
          </div>

          {/* QUALITY */}
          <div className="quality-control">
            <div className="quality-label">
              <span>
                Image Quality
              </span>

              <strong>
                {quality}%
              </strong>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(event) =>
                setQuality(
                  Number(event.target.value)
                )
              }
            />

            <div className="quality-range-labels">
              <span>
                Smaller File
              </span>

              <span>
                Better Quality
              </span>
            </div>
          </div>

          {/* EXTRA SETTINGS */}
          <div className="compressor-options">

            <div className="compressor-option">
              <label htmlFor="output-format">
                Output Format
              </label>

              <select
                id="output-format"
                value={outputFormat}
                onChange={(event) =>
                  setOutputFormat(
                    event.target.value
                  )
                }
              >
                <option value="auto">
                  Auto — Recommended
                </option>

                <option value="jpeg">
                  JPEG
                </option>

                <option value="webp">
                  WebP
                </option>

                <option value="png">
                  PNG
                </option>
              </select>
            </div>

            <div className="compressor-option">
              <label htmlFor="max-width">
                Maximum Width
              </label>

              <select
                id="max-width"
                value={maxWidth}
                onChange={(event) =>
                  setMaxWidth(
                    event.target.value
                  )
                }
              >
                <option value="0">
                  Original Size
                </option>

                <option value="2560">
                  2560 px
                </option>

                <option value="1920">
                  1920 px — Recommended
                </option>

                <option value="1280">
                  1280 px
                </option>

                <option value="1024">
                  1024 px
                </option>
              </select>
            </div>

          </div>

          <button
            className="convert-button"
            onClick={handleCompress}
            disabled={
              images.length === 0 ||
              isCompressing
            }
          >
            {isCompressing
              ? "Compressing..."
              : "Compress Images"}
          </button>
        </div>

        {/* SELECTED IMAGES */}
        {images.length > 0 && (
          <>
            {/* SUMMARY */}
            {compressionSummary && (
              <div className="compression-summary">

                <div className="summary-card">
                  <span>
                    Total Images
                  </span>

                  <strong>
                    {images.length}
                  </strong>
                </div>

                <div className="summary-card">
                  <span>
                    Original Size
                  </span>

                  <strong>
                    {formatFileSize(
                      compressionSummary.originalTotal
                    )}
                  </strong>
                </div>

                <div className="summary-card">
                  <span>
                    Compressed Size
                  </span>

                  <strong>
                    {formatFileSize(
                      compressionSummary.compressedTotal
                    )}
                  </strong>
                </div>

                <div className="summary-card saved">
                  <span>
                    Space Saved
                  </span>

                  <strong>
                    {formatFileSize(
                      compressionSummary.savedTotal
                    )}{" "}
                    (
                    {
                      compressionSummary.savedPercentage
                    }
                    %)
                  </strong>
                </div>

              </div>
            )}

            {/* IMAGE SECTION */}
            <div className="selected-section">

              <div className="selected-header">

                <div className="selected-title">
                  <h2>
                    Selected Images
                  </h2>

                  <span>
                    {images.length}{" "}
                    {images.length === 1
                      ? "image"
                      : "images"}
                  </span>
                </div>

                <div className="selected-actions">

                  <label className="add-more-button">
                    + Add More Images

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) => {
                        handleFiles(
                          event.target.files
                        );

                        event.target.value =
                          "";
                      }}
                    />
                  </label>

                  <button
                    className="clear-all-button"
                    onClick={clearAllImages}
                  >
                    Clear All
                  </button>

                  {images.some(
                    (image) =>
                      image.compressedUrl
                  ) && (
                    <button
                      className="download-all-button"
                      onClick={
                        downloadAllCompressedImages
                      }
                    >
                      ↓ Download All
                    </button>
                  )}

                </div>
              </div>

              {/* IMAGE GRID */}
              <div className="image-grid">

                {images.map(
                  (image, index) => (
                    <div
                      className="image-card"
                      key={image.id}
                    >

                      <div className="image-number">
                        {index + 1}
                      </div>

                      <button
                        className="remove-button"
                        onClick={() =>
                          removeImage(
                            image.id
                          )
                        }
                        aria-label="Remove image"
                      >
                        ×
                      </button>

                      <img
                        src={
                          image.compressedUrl ||
                          image.url
                        }
                        alt={
                          image.file.name
                        }
                      />

                      <p
                        title={
                          image.file.name
                        }
                      >
                        {image.file.name}
                      </p>

                      {/* RESULT */}
                      {image.compressedSize !==
                        null && (
                        <div className="compression-result">

                          <div className="size-row">
                            <span>
                              Original
                            </span>

                            <strong>
                              {formatFileSize(
                                image.originalSize
                              )}
                            </strong>
                          </div>

                          <div className="size-row">
                            <span>
                              Compressed
                            </span>

                            <strong>
                              {formatFileSize(
                                image.compressedSize
                              )}
                            </strong>
                          </div>

                          <div className="size-row">
                            <span>
                              Dimensions
                            </span>

                            <strong>
                              {image.width} ×{" "}
                              {image.height}
                            </strong>
                          </div>

                          <div className="saved-badge">
                            {image.compressedSize <
                            image.originalSize
                              ? `${getCompressionPercentage(
                                  image.originalSize,
                                  image.compressedSize
                                )}% smaller`
                              : "No size reduction"}
                          </div>

                          <button
                            className="download-image-button"
                            onClick={() =>
                              downloadCompressedImage(
                                image
                              )
                            }
                          >
                            ↓ Download
                          </button>

                        </div>
                      )}

                    </div>
                  )
                )}

              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default ImageCompressor;