import React, { useState, useEffect, useRef } from "react";

const TagSuggestions = ({
  message,
  cursorPosition,
  onSelectTag,
  isVisible,
  setIsVisible,
  tags,
  isLoading,
  error,
}) => {
  const [filteredTags, setFilteredTags] = useState([]);
  const [currentTagQuery, setCurrentTagQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedParents, setExpandedParents] = useState({});
  const suggestionRef = useRef(null);
  const listRef = useRef(null);

  // Structure les tags en hiérarchie
  const structureTagHierarchy = (tagsData) => {
    if (!tagsData || !Array.isArray(tagsData)) return [];

    const hierarchy = [];

    // Fonction pour traiter récursivement la structure hiérarchique des tags
    const processTagsRecursively = (items, level = 0, parentPath = "") => {
      if (!items || !Array.isArray(items)) return [];

      items.forEach((item) => {
        if (!item || typeof item !== "object") return;

        // Construire le chemin complet pour ce tag
        const path = parentPath ? `${parentPath}/${item.name}` : item.name;

        // Créer le nœud pour ce tag
        const node = {
          name: item.name,
          chatID: item.chatID,
          level,
          path,
          parent: parentPath || null,
          children: [],
        };

        // Ajouter le nœud à la liste des nœuds
        hierarchy.push(node);

        // Si ce tag a des sous-tags, les traiter récursivement
        if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
          // Stocker les chemins des enfants
          item.tags.forEach((childTag) => {
            const childPath = `${path}/${childTag.name}`;
            node.children.push(childPath);
          });

          // Traiter récursivement tous les tags enfants
          processTagsRecursively(item.tags, level + 1, path);
        }
      });
    };

    // Démarrer le traitement avec les tags de premier niveau
    processTagsRecursively(tagsData);

    // Ajouter des logs de débogage
    console.log("Hiérarchie construite:", hierarchy);

    return hierarchy;
  };

  // Filtrer la hiérarchie en fonction de la requête
  const filterHierarchy = (nodes, query) => {
    if (!nodes || nodes.length === 0) return [];

    const result = [];
    const queryLower = query.toLowerCase();

    // Créer un index des nœuds par chemin pour faciliter la recherche
    const nodesByPath = {};
    nodes.forEach((node) => {
      nodesByPath[node.path] = node;
    });

    // Filtre pour uniquement les nœuds de premier niveau
    const rootNodes = nodes.filter((node) => node.level === 0);

    // Filtrer les nœuds
    rootNodes.forEach((node) => {
      // Vérifier si le nom correspond à la requête
      const matches = node.name.toLowerCase().includes(queryLower);

      // Fonction pour vérifier si un nœud ou ses descendants correspondent à la requête
      const hasMatchingDescendant = (nodePath) => {
        const node = nodesByPath[nodePath];
        if (!node) return false;

        if (node.name.toLowerCase().includes(queryLower)) {
          return true;
        }

        // Vérifier récursivement les enfants
        return node.children.some((childPath) =>
          hasMatchingDescendant(childPath)
        );
      };

      // Fonction pour récupérer les enfants filtrés
      const getFilteredChildren = (nodePath) => {
        const node = nodesByPath[nodePath];
        if (!node || !node.children || node.children.length === 0) return [];

        const filteredChildren = [];

        node.children.forEach((childPath) => {
          const childNode = nodesByPath[childPath];
          if (!childNode) return;

          const childMatches = childNode.name
            .toLowerCase()
            .includes(queryLower);
          const hasMatchingChild = childNode.children.some((grandchildPath) =>
            hasMatchingDescendant(grandchildPath)
          );

          if (childMatches || hasMatchingChild || query === "") {
            filteredChildren.push({
              ...childNode,
              filteredChildren: getFilteredChildren(childPath),
            });
          }
        });

        return filteredChildren;
      };

      // Ajouter ce nœud s'il correspond ou s'il a des enfants qui correspondent ou si la requête est vide
      if (
        matches ||
        node.children.some((childPath) => hasMatchingDescendant(childPath)) ||
        query === ""
      ) {
        result.push({
          ...node,
          filteredChildren: getFilteredChildren(node.path),
        });
      }
    });

    // Log pour débogage
    console.log("Résultat du filtrage:", result);

    return result;
  };

  // Mettre à jour les suggestions filtrées lorsque le message ou la position du curseur change
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // Trouver le texte après le # le plus proche avant le curseur
    const textBeforeCursor = message.substring(0, cursorPosition);
    const lastHashIndex = textBeforeCursor.lastIndexOf("#");

    if (lastHashIndex === -1) {
      setIsVisible(false);
      return;
    }

    // Vérifier s'il y a un espace entre le dernier # et la position du curseur
    const textBetweenHashAndCursor = textBeforeCursor.substring(
      lastHashIndex + 1
    );

    if (textBetweenHashAndCursor.includes(" ")) {
      setIsVisible(false);
      return;
    }

    // Extraire la requête (le texte après #)
    const query = textBetweenHashAndCursor.trim().toLowerCase();
    setCurrentTagQuery(query);

    console.log("Tags data:", tags);

    // Vérifier si des tags sont disponibles
    if (!tags || tags.length === 0) {
      setFilteredTags([]);
      return;
    }

    // Par défaut, ouvrir tous les parents au premier affichage
    if (Object.keys(expandedParents).length === 0) {
      const newExpandedState = {};
      tags.forEach((tag) => {
        newExpandedState[tag.name] = true;
      });
      setExpandedParents(newExpandedState);
    }

    // Structurer les tags en hiérarchie
    const hierarchyNodes = structureTagHierarchy(tags);
    console.log("Hierarchical nodes:", hierarchyNodes);

    // Filtrer les tags basés sur la requête
    const filtered = filterHierarchy(hierarchyNodes, query);
    console.log("Filtered hierarchy:", filtered);

    setFilteredTags(filtered);
  }, [message, cursorPosition, isVisible, tags, setIsVisible]);

  // Réinitialiser l'index sélectionné quand les tags filtrés changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTags]);

  // Faire défiler pour voir la sélection
  useEffect(() => {
    if (listRef.current && filteredTags.length > 0) {
      const selectedElement = listRef.current.querySelector(
        ".tag-item.selected"
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Fonction pour basculer l'expansion d'un parent
  const toggleExpand = (path, e) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Gérer les touches fléchées pour la navigation
  const handleKeyDown = (e) => {
    if (!isVisible || filteredTags.length === 0) return;

    // Créer une liste plate de tous les éléments sélectionnables
    const getFlattenedTags = (nodes, expanded = {}) => {
      let result = [];

      nodes.forEach((node) => {
        result.push(node);
        if (
          node.filteredChildren &&
          node.filteredChildren.length > 0 &&
          expanded[node.path]
        ) {
          result = [
            ...result,
            ...getFlattenedTags(node.filteredChildren, expanded),
          ];
        }
      });

      return result;
    };

    const flattenedTags = getFlattenedTags(filteredTags, expandedParents);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flattenedTags.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? flattenedTags.length - 1 : prev - 1
        );
        break;
      case "Enter":
        if (flattenedTags.length > 0) {
          e.preventDefault();
          handleSelectTag(flattenedTags[selectedIndex].path);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsVisible(false);
        break;
      default:
        break;
    }
  };

  // Fonction pour sélectionner un tag
  // Fonction pour sélectionner un tag
  // Fonction pour sélectionner un tag
const handleSelectTag = (tag) => {
  // Trouver le nœud correspondant pour obtenir son ID
  const allNodes = [...filteredTags];
  
  // Fonction pour aplatir la hiérarchie et trouver tous les nœuds
  const flattenHierarchy = (nodes) => {
    let result = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.filteredChildren && node.filteredChildren.length > 0) {
        result = [...result, ...flattenHierarchy(node.filteredChildren)];
      }
    });
    return result;
  };
  
  const flatNodes = flattenHierarchy(allNodes);
  const selectedNode = flatNodes.find(node => node.path === tag);
  
  if (selectedNode) {
    // Créer le format de lien markdown
    const urlBase = window.location.origin; // URL de base de votre application
    const tagLink = `[${selectedNode.name}](${urlBase}/messages/${selectedNode.chatID})`;
    
    // Trouver l'index du dernier # avant le curseur
    const textBeforeCursor = message.substring(0, cursorPosition);
    const lastHashIndex = textBeforeCursor.lastIndexOf("#");

    if (lastHashIndex === -1) {
      console.warn("No # found before cursor");
      return;
    }

    // Remplacer le texte entre # et le curseur par le lien markdown
    const textBeforeHash = message.substring(0, lastHashIndex);
    const textAfterCursor = message.substring(cursorPosition);

    // Construire le nouveau message avec le lien markdown
    const updatedMessage = `${textBeforeHash}${tagLink} ${textAfterCursor}`;
    
    // Passer le message mis à jour à la fonction de rappel
    onSelectTag(updatedMessage);
    setIsVisible(false);
    
    // Log pour débogage
    console.log("Tag inséré comme lien:", tagLink);
  } else {
    // Comportement par défaut si le nœud n'est pas trouvé
    onSelectTag(tag);
    setIsVisible(false);
  }
};

  // Ajouter un écouteur d'événements pour les touches fléchées
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, filteredTags, selectedIndex, expandedParents]);

  // Compter les éléments plats pour le suivi de l'index de sélection
  const countNodesFlat = (accIndex, nodes) => {
    let currentIndex = accIndex;

    nodes.forEach((node) => {
      node._flatIndex = currentIndex++;

      if (
        node.filteredChildren &&
        node.filteredChildren.length > 0 &&
        expandedParents[node.path]
      ) {
        currentIndex = countNodesFlat(currentIndex, node.filteredChildren);
      }
    });

    return currentIndex;
  };

  // Rendu récursif des éléments de la hiérarchie
  const renderHierarchyItems = (nodes, accIndex = 0) => {
    // Assigner des indices plats pour la sélection
    countNodesFlat(0, filteredTags);

    return nodes.map((node) => {
      const isSelected = node._flatIndex === selectedIndex;
      const isExpanded = expandedParents[node.path];
      const hasChildren =
        node.filteredChildren && node.filteredChildren.length > 0;

      // Calculer l'indentation - augmentation significative du décalage
      const indentationStyle = {
        paddingLeft: `${node.level * 24 + 12}px`,
      };

      return (
        <React.Fragment key={node.path}>
          <li
            className={`tag-item ${isSelected ? "selected" : ""}`}
            style={{
              ...indentationStyle,
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              cursor: "pointer",
              borderLeft: node.level > 0 ? "2px solid #cfe2ff" : "none",
              backgroundColor: isSelected ? "#e9ecef" : "transparent",
              transition: "background-color 0.2s ease",
              position: "relative",
              marginLeft: node.level > 0 ? "10px" : "0",
            }}
            onClick={() => handleSelectTag(node.path)}
          >
            {/* Indicateur de niveau hiérarchique plus prononcé */}
            {node.level > 0 && (
              <span
                className="hierarchy-indicator"
                style={{
                  position: "absolute",
                  left: `${(node.level - 1) * 24}px`,
                  width: "16px",
                  height: "50%",
                  borderBottom: "2px solid #cfe2ff",
                  borderLeft: "2px solid #cfe2ff",
                  bottom: "50%",
                }}
              />
            )}

            {/* Icône pour les parents avec style amélioré */}
            {hasChildren ? (
              <button
                type="button"
                className="expand-button"
                onClick={(e) => toggleExpand(node.path, e)}
                style={{
                  background: isExpanded ? "#e7f1ff" : "transparent",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px",
                  marginRight: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0d6efd",
                  transition: "all 0.2s ease",
                }}
              >
                <i
                  className={`bi ${
                    isExpanded ? "bi-dash-square-fill" : "bi-plus-square"
                  }`}
                ></i>
              </button>
            ) : (
              <span style={{ width: "28px", marginRight: "8px" }}>
                {node.level > 0 && (
                  <i
                    className="bi bi-arrow-return-right"
                    style={{ color: "#6c757d", fontSize: "12px" }}
                  ></i>
                )}
              </span>
            )}

            {/* Contenu du tag avec styles améliorés */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: node.level === 0 ? "#f0f7ff" : "transparent",
                padding: node.level === 0 ? "4px 8px" : "0",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              <span
                className="tag-symbol"
                style={{
                  color: "#0d6efd",
                  fontWeight: "bold",
                  marginRight: "4px",
                }}
              >
                #
              </span>
              <span
                className="tag-name"
                style={{
                  fontWeight:
                    hasChildren || node.level === 0 ? "600" : "normal",
                  color:
                    node.level === 0
                      ? "#0a58ca"
                      : hasChildren
                      ? "#212529"
                      : "#495057",
                  fontSize: node.level === 0 ? "14px" : "13px",
                }}
              >
                {node.name}
              </span>

              {/* Badge pour indiquer le niveau (optionnel) */}
              {node.level > 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    backgroundColor: "#f1f3f5",
                    color: "#6c757d",
                  }}
                >
                  Niveau {node.level}
                </span>
              )}
            </div>
          </li>

          {/* Nœuds enfants (si déployés) */}
          {hasChildren &&
            isExpanded &&
            renderHierarchyItems(node.filteredChildren)}
        </React.Fragment>
      );
    });
  };

  // Si pas visible, ne rien afficher
  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={suggestionRef}
      className="tag-suggestions-container"
      style={{
        position: "absolute",
        bottom: "65px",
        left: "20px",
        width: "300px",
        maxHeight: "300px",
        backgroundColor: "#fff",
        boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        borderRadius: "0.25rem",
        border: "1px solid rgba(0, 0, 0, 0.125)",
        zIndex: 1050,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* En-tête */}
      <div
        className="tag-suggestions-header"
        style={{
          padding: "10px 15px",
          borderBottom: "1px solid #dee2e6",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h6 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
          Mentions et tags
        </h6>
        <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
          {currentTagQuery
            ? `Recherche: #${currentTagQuery}`
            : "Sélectionnez un tag"}
        </p>
      </div>

      {/* Corps */}
      <div
        ref={listRef}
        className="tag-suggestions-body"
        style={{
          overflowY: "auto",
          maxHeight: "220px",
          padding: "5px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "#6c757d #f8f9fa",
        }}
      >
        {isLoading ? (
          <div
            className="loading-state"
            style={{
              padding: "20px 15px",
              color: "#6c757d",
              textAlign: "center",
            }}
          >
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></div>
            <span style={{ marginLeft: "8px" }}>Chargement des tags...</span>
          </div>
        ) : error ? (
          <div
            className="error-state"
            style={{ padding: "15px", color: "#dc3545" }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : filteredTags.length === 0 ? (
          <div
            className="empty-state"
            style={{ padding: "20px 15px", color: "#6c757d" }}
          >
            <div style={{ marginBottom: "10px", textAlign: "center" }}>
              <i
                className="bi bi-search"
                style={{ fontSize: "1.5rem", opacity: "0.5" }}
              ></i>
            </div>
            <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
              Aucun tag ne correspond à votre recherche
            </p>
            <p style={{ margin: 0, fontSize: "12px", opacity: "0.7" }}>
              Essayez avec un autre terme ou effacez votre recherche
            </p>
          </div>
        ) : (
          <ul
            className="tag-list"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {renderHierarchyItems(filteredTags)}
          </ul>
        )}
      </div>

      {/* Pied de page */}
      <div
        className="tag-suggestions-footer"
        style={{
          padding: "8px 15px",
          borderTop: "1px solid #dee2e6",
          backgroundColor: "#f8f9fa",
          fontSize: "12px",
          color: "#6c757d",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <i className="bi bi-arrow-up-down me-1"></i>
          <span>Naviguer</span>
        </span>
        <span style={{ display: "flex", alignItems: "center" }}>
          <i className="bi bi-enter me-1"></i>
          <span>Sélectionner</span>
        </span>
        <span style={{ display: "flex", alignItems: "center" }}>
          <i className="bi bi-escape me-1"></i>
          <span>Fermer</span>
        </span>
      </div>
    </div>
  );
};

export default TagSuggestions;
