import React, { Component } from "react";

class CustomFileReader extends Component {
  render() {
    let style = {
      width: this.props.width,
      height: this.props.height,
      border: "none"
    };

    return (
      <div>
        <iframe
          title="resume"
          width="100%"
          height="100%"
          src={this.props.fileUrl}
          key={this.props.fileUrl + Math.floor(Math.random() * Math.floor(999))}
          sandbox
          importance="high"
          style={style}
        ></iframe>
      </div>
    );
  }
}

export default CustomFileReader;
