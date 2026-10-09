import "./shared-tools.css";
import "./PdfToJpg.css";
import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const PdfToJpg = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pages, setPages] = useState([]);
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(1.5);
  const [fileName, setFileName] = useState("converted-pages");
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Cleanup generated URLs when component is removed.
   */
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      pages.forEach((page) => {
        if (page.url) {
          URL.revokeObjectURL(page.url);
        }
      });
    };
  }, [pdfUrl, pages]);

  /*
   * Format file size.
   */
  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 B";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /*
   * Clear generated page URLs.
   */
  const clearPageUrls = () => {
    pages.forEach((page) => {
      if (page.url) {
        URL.revokeObjectURL(page.url);
      }
    });
  };

  /*
   * Handle PDF selection.
   */
  const handleFile = (file) => {
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setErrorMessage(
        "Please select a PDF file only."
      );
      return;
    }

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    clearPageUrls();

    const newPdfUrl =
      URL.createObjectURL(file);

    setPdfFile(file);
    setPdfUrl(newPdfUrl);
    setPages([]);
    setProgress(0);
    setErrorMessage("");

    const nameWithoutExtension =
      file.name.replace(/\.pdf$/i, "");

    setFileName(
      `${nameWithoutExtension}-pages`
    );
  };

  /*
   * Handle file input.
   */
  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    handleFile(file);

    event.target.value = "";
  };

  /*
   * Drag events.
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

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  /*
   * Convert PDF pages into JPG images.
   */
  const convertPdfToJpg = async () => {
    if (!pdfFile) {
      setErrorMessage(
        "Please select a PDF file first."
      );
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setErrorMessage("");

    clearPageUrls();
    setPages([]);

    try {
      const arrayBuffer =
        await pdfFile.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: arrayBuffer,
        }).promise;

      const generatedPages = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page =
          await pdf.getPage(pageNumber);

        const viewport =
          page.getViewport({
            scale: Number(scale),
          });

        const canvas =
          document.createElement("canvas");

        const context =
          canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Your browser does not support canvas rendering."
          );
        }

        canvas.width =
          Math.ceil(viewport.width);

        canvas.height =
          Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const blob =
          await new Promise(
            (resolve, reject) => {
              canvas.toBlob(
                (result) => {
                  if (result) {
                    resolve(result);
                  } else {
                    reject(
                      new Error(
                        `Could not convert page ${pageNumber}.`
                      )
                    );
                  }
                },
                "image/jpeg",
                Number(quality) / 100
              );
            }
          );

        const url =
          URL.createObjectURL(blob);

        generatedPages.push({
          id: crypto.randomUUID(),
          pageNumber,
          blob,
          url,
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
        });

        setProgress(
          Math.round(
            (pageNumber / pdf.numPages) * 100
          )
        );
      }

      setPages(generatedPages);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Something went wrong while converting the PDF."
      );
    } finally {
      setIsConverting(false);
    }
  };

  /*
   * Download one page.
   */
  const downloadPage = (page) => {
    if (!page?.url) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = page.url;

    link.download =
      `${fileName}-page-${page.pageNumber}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /*
   * Download all converted pages.
   */
  const downloadAllPages = () => {
    if (pages.length === 0) {
      return;
    }

    pages.forEach((page, index) => {
      setTimeout(() => {
        downloadPage(page);
      }, index * 400);
    });
  };

  /*
   * Clear everything.
   */
  const clearAll = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    clearPageUrls();

    setPdfFile(null);
    setPdfUrl("");
    setPages([]);
    setProgress(0);
    setErrorMessage("");
    setFileName("converted-pages");
  };

  /*
   * Calculate total output size.
   */
  const totalOutputSize = pages.reduce(
    (total, page) =>
      total + page.size,
    0
  );

  return (
    <section className="converter-section">
      <div className="converter-container">

        {/* HEADER */}
        <div className="converter-header">
          <p className="hero-label">
            PDF TOOL
          </p>

          <h1>
            PDF <span>to JPG</span>
          </h1>

          <p>
            Convert PDF pages into high-quality
            JPG images directly in your browser.
          </p>
        </div>

        {/* UPLOAD */}
        {!pdfFile && (
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
              📄
            </div>

            <h3>
              Upload your PDF
            </h3>

            <p>
              Select a PDF file to convert
            </p>

            <label className="upload-button">
              Choose PDF

              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileInput}
              />
            </label>

            <small>
              PDF files only
            </small>
          </div>
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="tool-error">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* PDF INFORMATION */}
        {pdfFile && (
          <>
            <div className="pdf-selected-card">

              <div className="pdf-file-icon">
                📄
              </div>

              <div className="pdf-file-info">
                <strong
                  title={pdfFile.name}
                >
                  {pdfFile.name}
                </strong>

                <span>
                  {formatFileSize(
                    pdfFile.size
                  )}
                </span>
              </div>

              <button
                className="clear-all-button"
                onClick={clearAll}
              >
                Remove PDF
              </button>

            </div>

            {/* SETTINGS */}
            <div className="settings-panel">

              <div className="settings-heading">
                <p className="hero-label">
                  CONVERSION SETTINGS
                </p>

                <h2>
                  JPG Output Settings
                </h2>
              </div>

              {/* QUALITY */}
              <div className="quality-control">

                <div className="quality-label">
                  <span>
                    JPG Quality
                  </span>

                  <strong>
                    {quality}%
                  </strong>
                </div>

                <input
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(event) =>
                    setQuality(
                      Number(
                        event.target.value
                      )
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

              {/* OPTIONS */}
              <div className="compressor-options">

                <div className="compressor-option">
                  <label htmlFor="pdf-scale">
                    Image Resolution
                  </label>

                  <select
                    id="pdf-scale"
                    value={scale}
                    onChange={(event) =>
                      setScale(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >
                    <option value="1">
                      Standard
                    </option>

                    <option value="1.5">
                      High — Recommended
                    </option>

                    <option value="2">
                      Very High
                    </option>

                    <option value="2.5">
                      Maximum
                    </option>
                  </select>
                </div>

                <div className="compressor-option">
                  <label htmlFor="pdf-filename">
                    File Name
                  </label>

                  <input
                    id="pdf-filename"
                    type="text"
                    value={fileName}
                    onChange={(event) =>
                      setFileName(
                        event.target.value
                      )
                    }
                    placeholder="converted-pages"
                  />
                </div>

              </div>

              {/* CONVERT BUTTON */}
              <button
                className="convert-button"
                onClick={convertPdfToJpg}
                disabled={isConverting}
              >
                {isConverting
                  ? `Converting... ${progress}%`
                  : "Convert PDF to JPG"}
              </button>

              {/* PROGRESS */}
              {isConverting && (
                <div className="pdf-progress-wrapper">

                  <div className="pdf-progress-bar">
                    <div
                      className="pdf-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <span>
                    Converting page {progress}%
                  </span>

                </div>
              )}

            </div>

            {/* RESULTS */}
            {pages.length > 0 && (
              <div className="pdf-jpg-results">

                <div className="selected-header">

                  <div className="selected-title">
                    <h2>
                      Converted Pages
                    </h2>

                    <span>
                      {pages.length}{" "}
                      {pages.length === 1
                        ? "page"
                        : "pages"}
                    </span>
                  </div>

                  <div className="selected-actions">

                    <button
                      className="download-all-button"
                      onClick={
                        downloadAllPages
                      }
                    >
                      ↓ Download All
                    </button>

                  </div>

                </div>

                {/* SUMMARY */}
                <div className="compression-summary">

                  <div className="summary-card">
                    <span>
                      PDF Pages
                    </span>

                    <strong>
                      {pages.length}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>
                      JPG Size
                    </span>

                    <strong>
                      {formatFileSize(
                        totalOutputSize
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>
                      Quality
                    </span>

                    <strong>
                      {quality}%
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>
                      Resolution
                    </span>

                    <strong>
                      {scale}×
                    </strong>
                  </div>

                </div>

                {/* PAGE GRID */}
                <div className="pdf-page-grid">

                  {pages.map((page) => (
                    <div
                      className="pdf-page-card"
                      key={page.id}
                    >

                      <div className="pdf-page-number">
                        Page{" "}
                        {page.pageNumber}
                      </div>

                      <img
                        src={page.url}
                        alt={`PDF page ${page.pageNumber}`}
                      />

                      <div className="pdf-page-info">

                        <div>
                          <span>
                            Size
                          </span>

                          <strong>
                            {formatFileSize(
                              page.size
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Resolution
                          </span>

                          <strong>
                            {page.width} ×{" "}
                            {page.height}
                          </strong>
                        </div>

                      </div>

                      <button
                        className="download-image-button"
                        onClick={() =>
                          downloadPage(page)
                        }
                      >
                        ↓ Download JPG
                      </button>

                    </div>
                  ))}

                </div>

              </div>
            )}

          </>
        )}

      </div>
    </section>
  );
};

export default PdfToJpg;