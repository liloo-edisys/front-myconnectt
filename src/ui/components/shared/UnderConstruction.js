import React, { Component } from "react";

class UnderConstruction extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="d-flex flex-row-fluid under-div">
              <div className="d-flex flex-row-fluid under-background"></div>
              <div className="container d-flex flex-row-fluid flex-column justify-content-md-center p-12">
                <h1 className="error-title font-weight-boldest text-info mt-10 mt-md-0 mb-12">
                  ...
                </h1>
                <p className="font-weight-boldest display-4">
                  Bientôt disponible.
                </p>
                <p className="font-size-h3">
                  La réalisation de cette page est en cours. Nous mettons tout
                  en oeuvre pour qu'elle soit disponible le plus rapidement
                  possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default UnderConstruction;
