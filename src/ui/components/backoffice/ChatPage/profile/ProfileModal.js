import React from "react";
import { Modal, IconButton, Button, Typography, Box } from "@material-ui/core";
import { Close } from "@material-ui/icons";

const ProfileModal = ({ isOpen, onClose, onSelectProfile }) => {
  const profiles = [
    {
      id: 1,
      name: "Support Technique",
      avatar: "/api/placeholder/40/40",
      status: "active"
    },
    {
      id: 2,
      name: "Service Client",
      avatar: "/api/placeholder/40/40",
      status: "active"
    },
    {
      id: 3,
      name: "Commercial",
      avatar: "/api/placeholder/40/40",
      status: "inactive"
    },
    { id: 4, name: "SAV", avatar: "/api/placeholder/40/40", status: "active" }
  ];

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  };

  const profileButtonStyle = {
    width: "100%",
    textAlign: "left",
    padding: "12px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    border: "none",
    background: "none",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f5f5f5"
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-profile-selection"
      aria-describedby="modal-select-profile-for-chat"
    >
      <Box sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h6" component="h2">
            Choisir un profil
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          {profiles.map(profile => (
            <Button
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              style={profileButtonStyle}
              disabled={profile.status === "inactive"}
            >
              <Box sx={{ position: "relative", marginRight: 2 }}>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%"
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    backgroundColor:
                      profile.status === "active" ? "#4caf50" : "#9e9e9e"
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" component="p">
                  {profile.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {profile.status === "active" ? "Disponible" : "Indisponible"}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfileModal;
