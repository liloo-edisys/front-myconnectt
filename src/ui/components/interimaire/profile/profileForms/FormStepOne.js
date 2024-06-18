/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Field } from "formik";
import _ from "lodash";
import { Input } from "metronic/_partials/controls";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { useDropzone } from "react-dropzone";
import { cancelEdit } from "../../../../../business/actions/interimaire/InterimairesActions";
import { getInterimaire, parseResume } from "api/interimaire/InterimairesApi";
import IframeGoogleDocs from "../../../../../utils/GoogleHacks";
import { parseResume as parseResumeActions } from "actions/interimaire/InterimairesActions";

import { updateApplicant } from "../../../../../business/actions/client/ApplicantsActions";
function FormStepOne(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const { isLoading, interimaire, parsed } = useSelector(
    state => ({
      companies: state.companies.companies,
      interimaire: state.interimairesReducerData.interimaire,
      parsed: state.interimairesReducerData.parsedInterimaire,
      isLoading: state.interimairesReducerData.loading
    }),
    shallowEqual
  );
  const [url, setUrl] = useState(null);

  useEffect(() => {
    interimaire &&
      interimaire.primaryCurriculumVitaeUrl &&
      isNullOrEmpty(resume) &&
      setResume(interimaire.primaryCurriculumVitaeUrl);
    isNullOrEmpty(url) &&
      interimaire &&
      !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl) &&
      setUrl(encoreUrl(interimaire.primaryCurriculumVitaeUrl));
  }, [interimaire, url]);

  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
    height: 500,
    width: "100%",
    overflowY: "hidden"
  };

  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(
    interimaire && interimaire.primaryCurriculumVitaeUrl
      ? interimaire.primaryCurriculumVitaeUrl
      : null
  );

  const createOption = (label, value) => ({
    label,
    value
  });
  const getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  const [files, setFiles] = useLocalStorage("resume", []);
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx",
    onDrop: acceptedFiles => {
      let { file } = files;
      setUrl(null);
      file = acceptedFiles[0];
      setLoading(true);
      getBase64(file)
        .then(result => {
          setLoading(true);
          file["base64"] = result;
          let stringBase64 = result.split(",")[1];
          parseResume({
            tenantID: TENANTID,
            applicantID: interimaire.id,
            document: stringBase64,
            Filename: file.name
          }).then(data => {
            dispatch(parseResumeActions.success(data));
            setUrl(encoreUrl(data.data.primaryCurriculumVitaeUrl));
          });
          return file;
        })
        .then(res => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          setFiles(res);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });

  function encoreUrl(str) {
    let newUrl = "";
    const len = str && str.length;
    let url;
    for (let i = 0; i < len; i++) {
      let c = str.charAt(i);
      let code = str.charCodeAt(i);

      if (c === " ") {
        newUrl += "+";
      } else if (
        (code < 48 && code !== 45 && code !== 46) ||
        (code < 65 && code > 57) ||
        (code > 90 && code < 97 && code !== 95) ||
        code > 122
      ) {
        newUrl += "%" + code.toString(16);
      } else {
        newUrl += c;
      }
    }
    if (newUrl.indexOf(".doc") > 0 || newUrl.indexOf(".docx") > 0) {
      url = "https://view.officeapps.live.com/op/embed.aspx?src=" + newUrl;
    } else {
      url =
        "https://docs.google.com/gview?url=" +
        newUrl +
        "&embedded=true&SameSite=None";
    }
    return url;
  }

  const valueRef = useRef();

  if (valueRef.current !== url) {
    valueRef.current = url;
  }

  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <MissionWizzardHeader props={props} />
          <div className="wizard-body py-8 px-8">
            <div className="row mx-10">
              <div className="pb-5 width-full">
                <div className="row">
                  <section
                    style={{ height: "600px" }}
                    className={
                      !isNullOrEmpty(interimaire) &&
                      !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl)
                        ? "filled-dropzone dropzone-container"
                        : "dropzone-container-sm d-flex justify-content-center"
                    }
                  >
                    {!isNullOrEmpty(interimaire) &&
                    !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl) ? (
                      <>
                        {" "}
                        <div
                          {...getRootProps({
                            className:
                              "custom-dropzone w-500 h-500 d-flex justify-content-center"
                          })}
                        >
                          <input {...getInputProps()} />
                          <h3 className="file-input-button">
                            Déposez votre CV
                          </h3>
                        </div>{" "}
                        <aside id="frame" style={thumbsContainer}>
                          {loading || isLoading ? (
                            <span className="ml-3 spinner spinner-primary"></span>
                          ) : (
                            <IframeGoogleDocs loading={loading} url={url} />
                          )}
                        </aside>
                      </>
                    ) : (
                      <div
                        {...getRootProps({
                          className:
                            "custom-dropzone w-500 h-500 d-flex justify-content-center"
                        })}
                      >
                        <input {...getInputProps()} />
                        <h3 className="file-input-button">Déposez votre CV</h3>
                      </div>
                    )}
                  </section>
                </div>

                <div className="d-flex bottom-0  justify-content-between border-top mt-5 pt-10">
                  <div>
                    <button
                      type="button"
                      className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      onClick={() => {
                        dispatch(cancelEdit.request());
                        props.history.push("/int-dashboard");
                      }}
                    >
                      <FormattedMessage id="BUTTON.CANCEL" />
                    </button>
                  </div>
                  <div>
                    {isLoading || loading ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() =>
                          props.history.push("/int-profile-edit/step-two")
                        }
                        disabled
                      >
                        <FormattedMessage id="TEXT.LOADING" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() =>
                          props.history.push("/int-profile-edit/step-two")
                        }
                      >
                        <FormattedMessage id="BUTTON.NEXT" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(FormStepOne);
