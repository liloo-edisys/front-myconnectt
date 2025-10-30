import React, { useState } from "react";
import { Modal, Box, IconButton, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

// Composant Modal pour afficher le CV
const CVModal = ({ url, isOpen, onClose, title = "Curriculum Vitae" }) => {
  // Style pour la modal
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: "90%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 0,
    borderRadius: 1,
    display: "flex",
    flexDirection: "column"
  };

  // Style pour la barre de titre
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0"
  };

  // Style pour l'iframe
  const iframeStyle = {
    width: "100%",
    height: "100%",
    border: "none"
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="cv-modal-title"
      aria-describedby="cv-modal-description"
    >
      <Box sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography id="cv-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <iframe
            src={url}
            title="CV Document"
            style={iframeStyle}
            allowFullScreen
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default CVModal;
