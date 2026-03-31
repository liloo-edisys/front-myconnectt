import React, { Component } from "react";

export default class IframeGoogleDocs extends Component {
  prevRef = null;

  constructor(props) {
    super();
    this.bindActions();

    this.url = React.createRef();
  }
  bindActions() {
    this.updateIframeSrc = this.updateIframeSrc.bind(this);
    this.iframeLoaded = this.iframeLoaded.bind(this);
  }
  iframeLoaded() {
    clearInterval(this.iframeTimeoutId);
  }
  getIframeLink() {
    return this.props.url;
  }
  updateIframeSrc() {
    if (this.url && this.url.current)
      this.url.current.src = this.getIframeLink();
  }

  componentDidMount() {
    this.iframeTimeoutId = setInterval(this.updateIframeSrc, 1000);
  }

  componentDidUpdate() {
    if (this.prevRef !== this.url.current) {
      this.prevRef = this.url.current;
    }
  }

  render() {
    if (this.props.loading === true) {
      return this.updateIframeSrc;
    }
    return this.props.loading === false ? (
      <iframe
        title="resume"
        onLoad={this.iframeLoaded}
        onError={this.updateIframeSrc}
        ref={this.url}
        width="100%"
        height="100%"
        src={this.getIframeLink()}
        frameborder="0"
        allowfullscreen
      ></iframe>
    ) : (
      <span className="ml-3 spinner spinner-primary"></span>
    );
  }
}
