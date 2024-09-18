import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IframeGoogleDocs from "../../../utils/googleHacks";

function DocumentDisplay(props) {
  const [docType, setDocType] = useState(null);
  const [loading, setLoading] = useState(false);
  const path =
    window.location.pathname.substring(18, window.location.pathname.length) +
    window.location.search;
  useEffect(() => {
    setLoading(true);
    if (path.indexOf("docs.google.com") > 0) {
      setDocType("pdf");
      setLoading(false);
    } else if (path.indexOf("officeapps") > 0) {
      setDocType("word");
      setLoading(false);
    } else {
      setDocType(null);
      setLoading(false);
    }
  }, []);

  const valueRef = useRef();

  if (valueRef.current !== path) {
    valueRef.current = path;
  }
  return (
    <div>
      {docType === "pdf" ? (
        <div style={{ width: "100vw", height: "100vh" }}>
          {loading ? (
            <span className="ml-3 spinner spinner-primary"></span>
          ) : (
            <IframeGoogleDocs loading={loading} url={path} />
          )}
        </div>
      ) : docType === "word" ? (
        <div style={{ width: "100vw", height: "100vh" }}>
          <iframe
            title="resume"
            width="100%"
            height="100%"
            src={path}
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      ) : (
        <img src={path} style={{ height: "100%", width: "100%" }} />
      )}
    </div>
  );
}

export default DocumentDisplay;
