import React from "react";

const ImgUpload = ({ onChange, src }) => (
  <label htmlFor="photo-upload" className="custom-file-upload fas">
    <div className="img-wrap img-upload">
      <img alt="avatar upload" for="photo-upload" src={src} />
    </div>
    <input id="photo-upload" type="file" onChange={onChange} />
  </label>
);

const Profile = ({ onSubmit, src, name, status }) => (
  <div className="card">
    <form onSubmit={onSubmit}>
      <label className="custom-file-upload fas">
        <div className="img-wrap">
          <img alt="avatar" for="photo-upload" src={src} />
        </div>
      </label>
      <button type="submit" className="edit">
        Edit Profile{" "}
      </button>
    </form>
  </div>
);

const Edit = ({ onSubmit, children }) => (
  <div className="card">
    <form onSubmit={onSubmit}>{children}</form>
  </div>
);

class CardProfile extends React.Component {
  state = {
    file: "",
    imagePreviewUrl:
      "https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true",
    name: "",
    status: "",
    active: "edit"
  };
  photoUpload = e => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  };
  editName = e => {
    const name = e.target.value;
    this.setState({
      name
    });
  };

  editStatus = e => {
    const status = e.target.value;
    this.setState({
      status
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    let activeP = this.state.active === "edit" ? "profile" : "edit";
    this.setState({
      active: activeP
    });
  };

  render() {
    const { imagePreviewUrl, name, status, active } = this.state;

    return (
      <div className="avatar-container">
        {active === "edit" ? (
          <Edit onSubmit={this.handleSubmit}>
            <ImgUpload onChange={this.photoUpload} src={imagePreviewUrl} />
          </Edit>
        ) : (
          <Profile
            onSubmit={this.handleSubmit}
            src={imagePreviewUrl}
            name={name}
            status={status}
          />
        )}
        <label htmlFor="photo-upload" className="file-input-button">
          Ajouter une photo
          <input id="photo-upload" type="file" onChange={this.photoUpload} />
        </label>
      </div>
    );
  }
}

export default CardProfile;
