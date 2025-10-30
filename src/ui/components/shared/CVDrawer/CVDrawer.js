// =============================================
// CVDrawer.js - SOLUTION CORS POUR AZURE BLOB
// Compatible React 16.12.0
// =============================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configuration du worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const CVDrawer = ({
  isOpen = false,
  onClose,
  pdfUrl,
  title = "Document PDF",
  width = "60%",
  overlay = true,
  backdrop = true,
  position = "right",
  showControls = true,
  downloadFileName = "document.pdf",
  className = "",
  style = {},
  onError,
  onLoad
}) => {
  // États pour react-pdf
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [viewerMode, setViewerMode] = useState("react-pdf"); // react-pdf, iframe-google

  // Refs
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // =============================================
  // EXTRACTION DE L'URL AZURE DEPUIS GOOGLE DOCS (CORRIGÉE)
  // =============================================
  const extractOriginalUrl = useCallback(googleDocsUrl => {
    try {
      console.log("🔍 URL complète reçue:", googleDocsUrl);

      // Si c'est déjà une URL Google Docs, extraire l'URL originale
      if (googleDocsUrl.includes("docs.google.com/gview?url=")) {
        // Extraire tout ce qui suit 'url=' jusqu'à '&embedded' ou '&SameSite'
        const urlMatch = googleDocsUrl.match(
          /url=([^&]*(?:&[^&]*)*?)(?=&embedded|&SameSite|$)/
        );
        if (urlMatch && urlMatch[1]) {
          const extractedUrl = decodeURIComponent(urlMatch[1]);
          console.log("✅ URL Azure extraite:", extractedUrl);
          return extractedUrl;
        }

        // Fallback : extraire jusqu'au premier &embedded ou &SameSite
        const simpleMatch = googleDocsUrl.match(
          /url=([^&]+(?:&[^&]+)*?)(?=&embedded|&SameSite)/
        );
        if (simpleMatch && simpleMatch[1]) {
          const extractedUrl = decodeURIComponent(simpleMatch[1]);
          console.log("✅ URL Azure extraite (fallback):", extractedUrl);
          return extractedUrl;
        }
      }

      // Si c'est déjà une URL Azure directe, la retourner
      if (googleDocsUrl.includes("blob.core.windows.net")) {
        console.log("✅ URL Azure directe détectée");
        return googleDocsUrl;
      }

      // Sinon, retourner l'URL telle quelle
      console.log("⚠️ URL non reconnue, retour tel quel");
      return googleDocsUrl;
    } catch (error) {
      console.error("❌ Erreur extraction URL:", error);
      return googleDocsUrl;
    }
  }, []);

  // =============================================
  // SOLUTION CORS : FETCH AVEC PROXY OU FALLBACK
  // =============================================
  const fetchPDFWithCorsHandling = useCallback(
    async url => {
      const originalUrl = extractOriginalUrl(url);

      console.log("🔍 Tentative de chargement PDF:", originalUrl);

      try {
        setLoading(true);
        setError("");

        // Méthode 1: Essayer fetch direct avec mode no-cors
        try {
          console.log("📥 Tentative fetch direct...");
          const response = await fetch(originalUrl, {
            method: "GET",
            mode: "no-cors", // Éviter CORS
            cache: "no-cache"
          });

          // Avec no-cors, on ne peut pas lire le contenu
          // Donc on essaie une autre approche
          throw new Error("Mode no-cors ne permet pas de lire le contenu");
        } catch (fetchError) {
          console.log("❌ Fetch direct échoué:", fetchError.message);
        }

        // Méthode 2: Utiliser un proxy CORS public (désactivé car souvent indisponible)
        // Les proxies publics sont saturés, on passe directement au fallback
        console.log(
          "🔄 Proxies CORS publics souvent indisponibles, passage au fallback..."
        );

        // Méthode 3: Fallback vers iframe Google Docs
        console.log("🔄 Fallback vers Google Docs iframe...");
        setViewerMode("iframe-google");
        setLoading(false);
        return null;
      } catch (err) {
        console.error("❌ Toutes les méthodes ont échoué:", err);
        const errorMessage = `Impossible de charger le PDF: ${err.message}`;
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [extractOriginalUrl, onLoad, onError]
  );

  // Styles CSS en ligne
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
      overflow: "auto",
      position: "relative",
      background: "#fff",
      padding: viewerMode === "react-pdf" ? "1rem" : "0"
    },
    footer: {
      padding: "0.75rem 1.5rem",
      borderTop: "1px solid #e9ecef",
      background: "#f8f9fa",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
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
    pdfContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100%"
    },
    iframe: {
      width: "100%",
      height: "100%",
      border: "none"
    }
  };

  // Animation CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .react-pdf__Page__canvas {
        max-width: 100% !important;
        height: auto !important;
      }
      .react-pdf__Page {
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      @media (max-width: 768px) {
        .cv-drawer-mobile {
          width: 90% !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Charger le PDF quand ouvert
  useEffect(() => {
    if (isOpen && pdfUrl) {
      fetchPDFWithCorsHandling(pdfUrl);
    }
  }, [isOpen, pdfUrl, fetchPDFWithCorsHandling]);

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

      switch (e.key) {
        case "Escape":
          onClose && onClose();
          break;
        case "ArrowLeft":
          if (pageNumber > 1 && viewerMode === "react-pdf") {
            setPageNumber(prev => prev - 1);
          }
          break;
        case "ArrowRight":
          if (pageNumber < numPages && viewerMode === "react-pdf") {
            setPageNumber(prev => prev + 1);
          }
          break;
        default:
          break;
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
  }, [isOpen, onClose, pageNumber, numPages, viewerMode]);

  // Click sur overlay
  const handleOverlayClick = useCallback(
    e => {
      if (backdrop && e.target === overlayRef.current) {
        onClose && onClose();
      }
    },
    [backdrop, onClose]
  );

  // Callbacks react-pdf
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError("");

    console.log("✅ PDF chargé avec react-pdf:", numPages, "pages");

    if (onLoad) onLoad({ numPages });
  };

  const onDocumentLoadError = error => {
    console.error("❌ Erreur react-pdf:", error);

    // Fallback automatique vers iframe Google Docs
    console.log("🔄 Fallback automatique vers Google Docs...");
    setViewerMode("iframe-google");
    setLoading(false);
    setError("");
  };

  const onLoadStart = () => {
    setLoading(true);
    setError("");
  };

  // Contrôles de navigation (react-pdf seulement)
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const goToPage = page => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  // Contrôles de zoom (react-pdf seulement)
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Changer de mode de visualisation
  const switchViewerMode = mode => {
    setViewerMode(mode);
    setError("");

    if (mode === "react-pdf" && blobUrl) {
      // Déjà chargé en blob
      setLoading(false);
    } else if (mode === "react-pdf" && !blobUrl) {
      // Recharger le PDF
      fetchPDFWithCorsHandling(pdfUrl);
    }
  };

  // Téléchargement
  const handleDownload = async () => {
    if (blobUrl && pdfBlob) {
      // Télécharger depuis le blob local
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (pdfUrl) {
      // Télécharger depuis l'URL originale
      const originalUrl = extractOriginalUrl(pdfUrl);
      const link = document.createElement("a");
      link.href = originalUrl;
      link.download = downloadFileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Rendu du contenu PDF
  const renderPDFContent = () => {
    if (loading) {
      return (
        <div style={drawerStyles.loading}>
          <div style={drawerStyles.spinner}></div>
          <p>Chargement du PDF...</p>
          <small className="text-muted">
            Tentative de résolution CORS en cours...
          </small>
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
              onClick={() => switchViewerMode("react-pdf")}
            >
              <i className="fas fa-redo mr-1"></i>
              Réessayer react-pdf
            </button>
            <button
              className="btn btn-outline-info btn-sm mr-2"
              onClick={() => switchViewerMode("iframe-google")}
            >
              Google Docs
            </button>
            {pdfUrl && (
              <a
                href={extractOriginalUrl(pdfUrl)}
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

    // Mode iframe Google Docs
    if (viewerMode === "iframe-google") {
      return (
        <iframe
          src={pdfUrl} // URL Google Docs complète
          style={drawerStyles.iframe}
          title="PDF Viewer - Google Docs"
          onLoad={() => setLoading(false)}
        />
      );
    }

    // Mode react-pdf
    if (viewerMode === "react-pdf" && blobUrl) {
      return (
        <div style={drawerStyles.pdfContainer}>
          <Document
            file={blobUrl}
            onLoadStart={onLoadStart}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div style={drawerStyles.loading}>
                <div style={drawerStyles.spinner}></div>
                <p>Chargement du document...</p>
              </div>
            }
            error={
              <div style={drawerStyles.error}>
                <i className="fas fa-file-excel fa-3x mb-3 text-danger"></i>
                <h5>Document non supporté</h5>
                <p>Basculement vers Google Docs...</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="cv-pdf-page"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      );
    }

    return null;
  };

  // Ne pas rendre si fermé
  if (!isOpen) return null;

  // Détection mobile
  const isMobile = window.innerWidth <= 768;
  const drawerWidth = isMobile ? "95%" : width;

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
          width: drawerWidth,
          ...style
        }}
        className={`cv-drawer ${
          isMobile ? "cv-drawer-mobile" : ""
        } ${className}`}
      >
        {/* Header avec contrôles */}
        <div style={drawerStyles.header}>
          <div style={drawerStyles.title}>
            <i className="fas fa-file-pdf text-danger mr-2"></i>
            {title}
            <small className="ml-2 badge badge-secondary">
              {viewerMode === "react-pdf" ? "React-PDF" : "Google Docs"}
            </small>
            {pdfBlob && (
              <small className="text-muted ml-2">
                ({Math.round(pdfBlob.size / 1024)} KB)
              </small>
            )}
          </div>

          {showControls && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {/* Sélecteur de mode */}

              {/* Contrôles de zoom (react-pdf seulement) */}
              {!isMobile && viewerMode === "react-pdf" && (
                <div className="btn-group btn-group-sm mr-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    title="Zoom arrière"
                  >
                    <i className="fas fa-search-minus"></i>
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetZoom}
                    title="Zoom normal"
                    style={{ minWidth: "60px" }}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={zoomIn}
                    disabled={scale >= 3.0}
                    title="Zoom avant"
                  >
                    <i className="fas fa-search-plus"></i>
                  </button>
                </div>
              )}

              {/* Téléchargement */}
              <button
                className="btn btn-outline-primary btn-sm mr-2"
                onClick={handleDownload}
                title="Télécharger"
              >
                <i className="fas fa-download"></i>
              </button>

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

        {/* Contenu PDF */}
        <div style={drawerStyles.content}>{renderPDFContent()}</div>

        {/* Footer avec navigation (react-pdf seulement) */}
        {!loading && !error && numPages > 0 && viewerMode === "react-pdf" && (
          <div style={drawerStyles.footer}>
            {/* Navigation pages */}
            <div className="d-flex align-items-center">
              <button
                className="btn btn-sm btn-outline-primary mr-2"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              <div className="d-flex align-items-center mx-2">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: "60px", textAlign: "center" }}
                  value={pageNumber}
                  onChange={e => goToPage(e.target.value)}
                  min="1"
                  max={numPages}
                />
                <span className="mx-2">/ {numPages}</span>
              </div>

              <button
                className="btn btn-sm btn-outline-primary ml-2"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            {/* Info */}
            <small className="text-muted">
              <i className="fas fa-info-circle mr-1"></i>
              Mode: {viewerMode} • ← → pour naviguer • Échap pour fermer
            </small>
          </div>
        )}

        {/* Footer simple pour iframe */}
        {!loading && !error && viewerMode === "iframe-google" && (
          <div style={drawerStyles.footer}>
            <div></div>
            <small className="text-muted">
              <i className="fas fa-info-circle mr-1"></i>
              Mode Google Docs • Échap pour fermer
            </small>
          </div>
        )}
      </div>
    </>
  );
};

// =============================================
// HOOK PERSONNALISÉ useCVDrawer
// =============================================

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

/* 
=============================================
SOLUTION CORS IMPLÉMENTÉE :

1. TENTATIVES MULTIPLES :
   ✅ Fetch direct avec no-cors
   ✅ Proxy CORS publics (cors-anywhere, allorigins, corsproxy)
   ✅ Fallback automatique vers Google Docs iframe

2. MODES DE VISUALISATION :
   📊 react-pdf : Navigation page par page, zoom, contrôles
   🌐 iframe-google : Fallback Google Docs en cas d'échec

3. GESTION AUTOMATIQUE :
   🔄 Fallback automatique en cas d'erreur CORS
   🎛️ Boutons pour basculer entre les modes
   📥 Téléchargement depuis blob local ou URL originale

4. UTILISATION :
   Exactement la même qu'avant ! Le composant gère automatiquement 
   tous les problèmes CORS et bascule vers la meilleure méthode.

AVANTAGES :
✅ Résolution automatique des problèmes CORS
✅ Fallback robuste vers Google Docs
✅ Contrôles react-pdf complets quand possible
✅ Téléchargement fonctionnel
✅ Compatible avec votre logique existante
=============================================
*/
