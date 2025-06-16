// =============================================
// CVDrawer - SANS DÉPENDANCES EXTERNES
// Compatible React 16.12.0
// =============================================

import React, { useState, useEffect, useCallback, useRef } from "react";

const CVDrawer = ({
  isOpen = false,
  onClose,
  pdfUrl,
  title = "Document PDF",
  width = "60%",
  overlay = true,
  backdrop = true,
  position = "right", // "left" ou "right"
  showControls = true,
  downloadFileName = "document.pdf",
  className = "",
  style = {},
  onError,
  onLoad
}) => {
  // États
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [viewerMethod, setViewerMethod] = useState("google"); // google, blob, pdfjs

  // Refs
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // Styles CSS en ligne pour éviter les dépendances
  const drawerStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1040,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? "visible" : "hidden",
      transition: "opacity 0.3s ease, visibility 0.3s ease"
    },
    drawer: {
      position: "fixed",
      top: 0,
      bottom: 0,
      [position]: 0,
      width: width,
      maxWidth: "100vw",
      background: "white",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      zIndex: 1050,
      display: "flex",
      flexDirection: "column",
      transform: isOpen
        ? "translateX(0)"
        : `translateX(${position === "right" ? "100%" : "-100%"})`,
      transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
    },
    header: {
      padding: "1rem 1.5rem",
      borderBottom: "1px solid #e9ecef",
      background: "#f8f9fa",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
      minHeight: "70px"
    },
    title: {
      fontWeight: "600",
      fontSize: "1.1rem",
      color: "#495057",
      display: "flex",
      alignItems: "center",
      flex: 1,
      minWidth: 0
    },
    content: {
      flex: 1,
      overflow: "hidden",
      position: "relative",
      background: "#fff"
    },
    footer: {
      padding: "0.75rem 1.5rem",
      borderTop: "1px solid #e9ecef",
      background: "#f8f9fa",
      textAlign: "center",
      flexShrink: 0
    },
    loading: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      textAlign: "center",
      padding: "2rem"
    },
    spinner: {
      width: "3rem",
      height: "3rem",
      border: "3px solid #f3f3f3",
      borderTop: "3px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "1rem"
    },
    error: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      textAlign: "center",
      padding: "2rem",
      color: "#dc3545"
    },
    pdfFrame: {
      width: "100%",
      height: "100%",
      border: "none",
      background: "white"
    }
  };

  // Animation CSS pour le spinner
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @media (max-width: 768px) {
        .cv-drawer-mobile {
          width: 90% !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch et conversion en blob
  const fetchPDFBlob = useCallback(
    async url => {
      if (!url) return;

      try {
        setLoading(true);
        setError("");

        console.log("Fetching PDF:", url);

        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/pdf,*/*"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Le fichier PDF est vide");
        }

        const localBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(localBlobUrl);
        setPdfData(blob);

        if (onLoad) onLoad(blob);
      } catch (err) {
        const errorMessage = `Erreur de chargement: ${err.message}`;
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onLoad, onError]
  );

  // Charger le PDF quand ouvert
  useEffect(() => {
    if (isOpen && pdfUrl) {
      fetchPDFBlob(pdfUrl);
    }
  }, [isOpen, pdfUrl, fetchPDFBlob]);

  // Nettoyer les blob URLs
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Gestion clavier
  useEffect(() => {
    const handleKeyDown = e => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose && onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Click sur overlay
  const handleOverlayClick = useCallback(
    e => {
      if (backdrop && e.target === overlayRef.current) {
        onClose && onClose();
      }
    },
    [backdrop, onClose]
  );

  // Téléchargement
  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Changer de méthode de visualisation
  const switchViewerMethod = method => {
    setViewerMethod(method);
    setError("");
  };

  // Rendu du contenu PDF
  const renderPDFContent = () => {
    if (loading) {
      return (
        <div style={drawerStyles.loading}>
          <div style={drawerStyles.spinner}></div>
          <p>Chargement du PDF...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={drawerStyles.error}>
          <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <h5>Erreur d'affichage</h5>
          <p>{error}</p>
          <div className="btn-group mt-3">
            <button
              className="btn btn-outline-primary btn-sm mr-2"
              onClick={() => fetchPDFBlob(pdfUrl)}
            >
              <i className="fas fa-redo mr-1"></i>
              Réessayer
            </button>
            <button
              className="btn btn-outline-info btn-sm mr-2"
              onClick={() => switchViewerMethod("google")}
            >
              Google Viewer
            </button>
            <button
              className="btn btn-outline-success btn-sm mr-2"
              onClick={() => switchViewerMethod("blob")}
            >
              Viewer Direct
            </button>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm"
              >
                <i className="fas fa-external-link-alt mr-1"></i>
                Ouvrir
              </a>
            )}
          </div>
        </div>
      );
    }

    if (!blobUrl && !pdfUrl) return null;

    // Sélection de la méthode de visualisation
    let viewerUrl = "";

    switch (viewerMethod) {
      case "google":
        viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          pdfUrl
        )}&embedded=true`;
        break;
      case "pdfjs":
        viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
          blobUrl || pdfUrl
        )}`;
        break;
      case "blob":
      default:
        viewerUrl = blobUrl || pdfUrl;
        break;
    }

    return (
      <iframe
        src={viewerUrl}
        style={drawerStyles.pdfFrame}
        title="PDF Viewer"
        onError={() => {
          if (viewerMethod === "google") {
            switchViewerMethod("blob");
          } else if (viewerMethod === "blob") {
            switchViewerMethod("pdfjs");
          } else {
            setError("Impossible d'afficher le PDF");
          }
        }}
      />
    );
  };

  // Ne pas rendre si fermé
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          ref={overlayRef}
          style={drawerStyles.overlay}
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          ...drawerStyles.drawer,
          ...style
        }}
        className={`cv-drawer ${
          window.innerWidth <= 768 ? "cv-drawer-mobile" : ""
        } ${className}`}
      >
        {/* Header */}
        <div style={drawerStyles.header}>
          <div style={drawerStyles.title}>
            <i className="fas fa-file-pdf text-danger mr-2"></i>
            {title}
            {pdfData && (
              <small className="text-muted ml-2">
                ({Math.round(pdfData.size / 1024)} KB)
              </small>
            )}
          </div>

          {showControls && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {/* Sélecteur de viewer */}
              <div className="btn-group btn-group-sm mr-2">
                <button
                  className={`btn ${
                    viewerMethod === "google"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => switchViewerMethod("google")}
                  title="Google Viewer"
                  style={{ fontSize: "0.75rem" }}
                >
                  G
                </button>
                <button
                  className={`btn ${
                    viewerMethod === "blob"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => switchViewerMethod("blob")}
                  title="Viewer Direct"
                  style={{ fontSize: "0.75rem" }}
                >
                  D
                </button>
                <button
                  className={`btn ${
                    viewerMethod === "pdfjs"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => switchViewerMethod("pdfjs")}
                  title="PDF.js"
                  style={{ fontSize: "0.75rem" }}
                >
                  P
                </button>
              </div>

              {/* Téléchargement */}
              {blobUrl && (
                <button
                  className="btn btn-outline-primary btn-sm mr-2"
                  onClick={handleDownload}
                  title="Télécharger"
                >
                  <i className="fas fa-download"></i>
                </button>
              )}

              {/* Fermer */}
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                title="Fermer (Échap)"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div style={drawerStyles.content}>{renderPDFContent()}</div>

        {/* Footer */}
        {!loading && !error && (
          <div style={drawerStyles.footer}>
            <small className="text-muted">
              <i className="fas fa-info-circle mr-1"></i>
              Viewer: {viewerMethod.toUpperCase()} • Échap pour fermer
            </small>
          </div>
        )}
      </div>
    </>
  );
};

// Hook personnalisé
export const useCVDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");

  const openDrawer = useCallback(pdfUrl => {
    setCurrentPdfUrl(pdfUrl);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    currentPdfUrl,
    openDrawer,
    closeDrawer
  };
};

export default CVDrawer;
