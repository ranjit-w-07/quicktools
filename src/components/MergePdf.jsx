import "./shared-tools.css";
import "./MergePdf.css";
import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";

const MergePdf = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [fileName, setFileName] = useState("merged-document");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mergedPdfUrl, setMergedPdfUrl] = useState("");

  useEffect(() => {
    return () => {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
    };
  }, [mergedPdfUrl]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFiles = (selectedFiles) => {
    const incomingFiles = Array.from(selectedFiles || []);

    if (incomingFiles.length === 0) {
      return;
    }

    const pdfFiles = incomingFiles.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      setErrorMessage("Please select PDF files only.");
      return;
    }

    const newFiles = pdfFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
    }));

    setFiles((previousFiles) => [
      ...previousFiles,
      ...newFiles,
    ]);

    setErrorMessage("");
    setSuccessMessage("");
  };

  const removeFile = (id) => {
    setFiles((previousFiles) =>
      previousFiles.filter((item) => item.id !== id)
    );

    setSuccessMessage("");
  };

  const clearAll = () => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }

    setMergedPdfUrl("");
    setFiles([]);
    setErrorMessage("");
    setSuccessMessage("");
    setFileName("merged-document");
  };

  const moveFile = (index, direction) => {
    setFiles((previousFiles) => {
      const newFiles = [...previousFiles];
      const targetIndex = index + direction;

      if (
        targetIndex < 0 ||
        targetIndex >= newFiles.length
      ) {
        return newFiles;
      }

      [newFiles[index], newFiles[targetIndex]] = [
        newFiles[targetIndex],
        newFiles[index],
      ];

      return newFiles;
    });

    setSuccessMessage("");
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setErrorMessage(
        "Please select at least 2 PDF files to merge."
      );
      return;
    }

    setIsMerging(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
        setMergedPdfUrl("");
      }

      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();

        const sourcePdf = await PDFDocument.load(
          fileBytes
        );

        const copiedPages =
          await mergedPdf.copyPages(
            sourcePdf,
            sourcePdf.getPageIndices()
          );

        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes =
        await mergedPdf.save();

      const blob = new Blob(
        [mergedPdfBytes],
        {
          type: "application/pdf",
        }
      );

      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);

      setSuccessMessage(
        `Successfully merged ${files.length} PDF files.`
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Unable to merge the selected PDFs. One of the files may be damaged or password protected."
      );
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMergedPdf = () => {
    if (!mergedPdfUrl) {
      return;
    }

    const safeName =
      fileName.trim() || "merged-document";

    const finalName = safeName
      .toLowerCase()
      .endsWith(".pdf")
      ? safeName
      : `${safeName}.pdf`;

    const link = document.createElement("a");

    link.href = mergedPdfUrl;
    link.download = finalName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    handleFiles(event.dataTransfer.files);
  };

  const totalSize = files.reduce(
    (total, item) => total + item.file.size,
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
            Merge <span>PDF</span>
          </h1>

          <p>
            Combine multiple PDF files into one
            PDF directly in your browser.
          </p>
        </div>

        {/* UPLOAD */}
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
            📚
          </div>

          <h3>
            Upload your PDF files
          </h3>

          <p>
            Select two or more PDF files
          </p>

          <label className="upload-button">
            Choose PDF Files

            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          <small>
            You can select multiple PDFs
          </small>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="tool-error">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="tool-success">
            ✓ {successMessage}
          </div>
        )}

        {files.length > 0 && (
          <>
            {/* FILE SETTINGS */}
            <div className="settings-panel">

              <div className="settings-heading">
                <p className="hero-label">
                  MERGE SETTINGS
                </p>

                <h2>
                  Output PDF
                </h2>
              </div>

              <div className="compressor-options">
                <div className="compressor-option">
                  <label htmlFor="merge-file-name">
                    File Name
                  </label>

                  <input
                    id="merge-file-name"
                    type="text"
                    value={fileName}
                    onChange={(event) =>
                      setFileName(
                        event.target.value
                      )
                    }
                    placeholder="merged-document"
                  />
                </div>

                <div className="merge-summary-box">
                  <span>
                    Selected PDFs
                  </span>

                  <strong>
                    {files.length} files
                  </strong>

                  <small>
                    {formatFileSize(totalSize)}
                  </small>
                </div>
              </div>

              <button
                className="convert-button"
                onClick={mergePdfs}
                disabled={
                  files.length < 2 ||
                  isMerging
                }
              >
                {isMerging
                  ? "Merging PDFs..."
                  : "Merge PDF Files"}
              </button>
            </div>

            {/* FILE LIST */}
            <div className="selected-section">

              <div className="selected-header">

                <div className="selected-title">
                  <h2>
                    PDF Files
                  </h2>

                  <span>
                    {files.length}{" "}
                    {files.length === 1
                      ? "file"
                      : "files"}
                  </span>
                </div>

                <div className="selected-actions">

                  <label className="add-more-button">
                    + Add More PDFs

                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={(event) => {
                        handleFiles(
                          event.target.files
                        );
                        event.target.value = "";
                      }}
                    />
                  </label>

                  <button
                    className="clear-all-button"
                    onClick={clearAll}
                  >
                    Clear All
                  </button>

                  {mergedPdfUrl && (
                    <button
                      className="download-all-button"
                      onClick={downloadMergedPdf}
                    >
                      ↓ Download Merged PDF
                    </button>
                  )}

                </div>
              </div>

              <div className="merge-file-list">

                {files.map((item, index) => (
                  <div
                    className="merge-file-card"
                    key={item.id}
                  >
                    <div className="merge-file-number">
                      {index + 1}
                    </div>

                    <div className="merge-file-icon">
                      📄
                    </div>

                    <div className="merge-file-details">
                      <strong
                        title={item.file.name}
                      >
                        {item.file.name}
                      </strong>

                      <span>
                        {formatFileSize(
                          item.file.size
                        )}
                      </span>
                    </div>

                    <div className="merge-file-actions">

                      <button
                        onClick={() =>
                          moveFile(
                            index,
                            -1
                          )
                        }
                        disabled={index === 0}
                        aria-label="Move PDF up"
                        title="Move up"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() =>
                          moveFile(
                            index,
                            1
                          )
                        }
                        disabled={
                          index ===
                          files.length - 1
                        }
                        aria-label="Move PDF down"
                        title="Move down"
                      >
                        ↓
                      </button>

                      <button
                        className="merge-remove-button"
                        onClick={() =>
                          removeFile(
                            item.id
                          )
                        }
                        aria-label="Remove PDF"
                        title="Remove"
                      >
                        ×
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default MergePdf;