/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFileReader from "react-file-reader";

import { Field } from "formik";
import _, { set } from "lodash";
import { Input } from "metronic/_partials/controls";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useLocalStorage from "../../../shared/persistState";
import MissionWizzardHeader from "./missionWizzardHeader.jsx";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import moment from "moment";
import Dropzone, { useDropzone } from "react-dropzone";
import SVG from "react-inlinesvg";
import BootstrapTable from "react-bootstrap-table-next";
import { toAbsoluteUrl } from "metronic/_helpers";
import { Collapse } from "react-bootstrap";
import { DocumentModal } from "../profileModals/DocumentModal";
import DocTypes from "../../../../../utils/DocumentTypes.json";
import { updateInterimaire } from "actions/interimaire/InterimairesActions";
import DateColumnFormatter from "./DateColumnFormatter";
import DocActionsColumnFormatter from "./DocActionsColumnFormatter";
import { DeleteDocumentModal } from "../profileModals/DeleteDocumentModal";
import { PreviewDocumentModal } from "../profileModals/PreviewDocumentModal";
import { id } from "date-fns/locale";
import { IDEditModal } from "../profileModals/IDEditModal";
import { HealthEditModal } from "../profileModals/HealthEditModal";
import { BankEditModal } from "../profileModals/BankEditModal";
import LoadingOverlay from "react-loading-overlay";
import { toastr } from "react-redux-toastr";
import IdentityDocuments from "../../home/fieldsets/indentity-documents/IdentityDocuments";

function FormStepFive(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const [showDelete, setShowDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editID, setEditID] = useState(false);
  const [editHealth, setEditHealth] = useState(false);
  const [editBank, setEditBank] = useState(false);

  const [currentRow, setCurrentRow] = useState([]);

  const { companies, interimaire, parsed, loading } = useSelector(
    state => ({
      companies: state.companies.companies,
      interimaire: state.interimairesReducerData.interimaire,
      parsed: state.interimairesReducerData.interimaire,
      loading: state.interimairesReducerData.loading
    }),
    shallowEqual
  );

  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16
  };

  const thumb = {
    width: "240px",
    height: "150px"
  };

  const thumbInner = {
    display: "flex",
    width: "240px",
    height: "150px"
  };

  const img = {
    display: "block",
    borderRadius: "20px",
    width: "240px",
    height: "150px"
  };
  const [experience, setExperience] = useLocalStorage("experience", null);
  const [openId, setOpenId] = useState(true);
  const [openHealth, setOpenHealth] = useState(true);
  const [openHome, setOpenHome] = useState(true);
  const [openBank, setOpenBank] = useState(true);
  const [openOthers, setOpenOthers] = useState(true);
  const [openAuth, setOpenAuth] = useState(true);
  const [isVerso, setIsVerso] = useState(false);

  const [birthDate, setBirthDate] = useState(null);
  const [socialNumber, setSocialNumber] = useState(null);
  const [cityBirth, setCityBirth] = useState(null);
  const [birthDepartment, setBirthDepartment] = useState(null);

  const [openTypeSelect, setOpenTypeSelect] = useState(false);

  const [idFile, setIdFile] = useState([]);
  const [journeyFile, setJourneyFile] = useState([]);
  const [healthFile, setHealthFile] = useState([]);
  const [homeFile, setHomeFile] = useState([]);
  const [bankFile, setBankFile] = useState([]);
  const [otherFile, setOtherFile] = useState([]);
  const [identityFiles, setIdentityFiles] = useLocalStorage(
    "identityFiles",
    parsed && parsed.applicantDocuments ? parsed.applicantDocuments : []
  );

  const [identityCardRecto, setIdentityCardRecto] = useState(null);
  const [identityCardVerso, setIdentityCardVerso] = useState(null);
  const [vitalCard, setVitalCard] = useState();
  const [rib, setRib] = useState();

  useEffect(() => {
    if (interimaire) {
      const { applicantDocuments } = interimaire;
      for (let i = 0; i < applicantDocuments.length; i++) {
        if (
          applicantDocuments[i].documentType === 14 ||
          (applicantDocuments[i].documentType === 8 &&
            applicantDocuments[i].filename === "IdentityCardFront") ||
          applicantDocuments[i].documentType === 9 ||
          applicantDocuments[i].documentType === 16
        ) {
          setIdentityCardRecto(applicantDocuments[i]);
        }
        if (
          (applicantDocuments[i].documentType === 8 &&
            applicantDocuments[i].filename === "IdentityCardBack") ||
          applicantDocuments[i].documentType === 9 ||
          applicantDocuments[i].documentType === 16
        ) {
          setIdentityCardVerso(applicantDocuments[i]);
        }
        if (applicantDocuments[i].documentType === 10) {
          setVitalCard(applicantDocuments[i]);
        }
        if (applicantDocuments[i].documentType === 12) {
          setRib(applicantDocuments[i]);
        }
      }
    }
  }, [interimaire]);

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
  const onDrop = (acceptedFiles, fileRejections, fileType) => {
    fileRejections &&
      fileRejections.length &&
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        "Vous ne pouver choisir qu'un fichier à la fois."
      );
    let file = acceptedFiles[0];
    getBase64(file)
      .then(result => {
        file["base64"] = result;
        let stringBase64 = result.split(",")[1];
        file["index"] =
          file.filename + Math.floor(Math.random() * Math.floor(100));
        file["formatedBase64"] = stringBase64;
        setFiles(file);
        if (
          (currentDocType === 8 && !isVerso) ||
          currentDocType === 10 ||
          currentDocType === 12
        ) {
          setOpenTypeSelect({ open: true, file: file });
        } else {
          manageFile(file, currentDocType, file.name);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const [files, setFiles] = useLocalStorage("files", []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false
  });

  const thumbs = file => {
    return (
      !isNullOrEmpty(file) && (
        <div style={thumb} key={!isNullOrEmpty(file) && file.filename}>
          <div style={thumbInner}>
            {/* <img src={!isNullOrEmpty(files) && files.base64} style={img} alt="preview" /> */}
            <embed
              src={
                !isNullOrEmpty(file) && "data:image/jpeg;base64," + file.base64
              }
              type={file.type}
              style={img}
              width="100%"
              height="auto"
            />
          </div>
        </div>
      )
    );
  };

  const filterID = value => {
    let data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(
        x => x.documentType === 8 || x.documentType === 9
      );
    return data && data;
  };

  const deleteId = row => {
    let data;
    data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType !== 8);
    data = data && data.filter(x => x.documentType !== 9);
    props.formik.setFieldValue("applicantDocuments", data);
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        applicantDocuments: data
      })
    );
    setIdentityFiles(data);
    setShowDelete(false);
  };

  const deleteHealth = row => {
    let data;
    data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType !== 10);

    props.formik.setFieldValue("applicantDocuments", data);
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        applicantDocuments: data
      })
    );
    setIdentityFiles(data);

    setShowDelete(false);
  };

  const deleteBank = row => {
    let data;
    data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType !== 12);
    props.formik.setFieldValue("applicantDocuments", data);
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        applicantDocuments: data
      })
    );
    setIdentityFiles(data);

    setShowDelete(false);
  };

  const filterIDRecto = value => {
    let data;
    data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(
        x => x.documentType === 8 || x.documentType === 9
      );
    data =
      data &&
      !isNullOrEmpty(data) &&
      data.filter(x => x.documentNumber !== null);
    return data ? data : null;
  };
  const filterIDVerso = value => {
    let data;
    data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(
        x => x.documentType === 8 || x.documentType === 9
      );
    data =
      data &&
      !isNullOrEmpty(data) &&
      data.filter(x => x.documentNumber === null);
    return data ? data : null;
  };
  const filterHealth = value => {
    let data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType === 10);
    return data && data[0];
  };

  const filterHome = value => {
    let data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(
        x => x.documentType === 11 || x.documentType === 11
      );
    return data && data;
  };

  const filterBank = value => {
    let data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType === 12);
    return data && data;
  };

  const filterAuth = value => {
    let data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType === 13);
    return data && data;
  };

  const filterOthers = value => {
    let data =
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantDocuments) &&
      parsed.applicantDocuments.filter(x => x.documentType === 7);
    return data && data;
  };

  const formatDocumentText = value => {
    let data = DocTypes.filter(l => l.id === parseInt(value));
    return data[0].name;
  };
  const deleteDocument = row => {
    const updatedHero = parsed.applicantDocuments.filter(
      item => item.id !== currentRow.id
    );
    setIdentityFiles(updatedHero);
    props.formik.setFieldValue("applicantDocuments", updatedHero);
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        applicantDocuments: updatedHero
      })
    );

    setShowDelete(false);
  };

  const deleteRow = row => {
    const updatedHero =
      !isNullOrEmpty(parsed) && !isNullOrEmpty(parsed.applicantDocuments);
    parsed.applicantDocuments.filter(item => item.id === row.id);
    setIdentityFiles(updatedHero);
    props.formik.setFieldValue("applicantDocuments", updatedHero);
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        applicantDocuments: updatedHero
      })
    );
    setShowDelete(false);
  };

  let columns = [
    {
      dataField: "documentNumber",
      text: intl.formatMessage({ id: "TEXT.NUMBER" }),
      sort: true
    },
    {
      dataField: "issueDate",
      text: intl.formatMessage({ id: "MODEL.ID.STARTDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "expirationDate",
      text: intl.formatMessage({ id: "MODEL.ID.ENDDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "documentType",
      text: intl.formatMessage({ id: "MODEL.DOCUMENT.TYPE" }),
      sort: true,
      formatter: (value, row) => <span>{formatDocumentText(value)}</span>
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatter: DocActionsColumnFormatter,
      formatExtraData: {
        openPreviewModal: (row, rowIndex) => {
          setShowPreview(true);
          setCurrentRow({ ...row, index: rowIndex });
        },
        openDeleteModal: (row, rowIndex) => {
          setShowDelete(true);
          setCurrentRow({ ...row, index: rowIndex });
        },
        deleteExperience: row => deleteDocument(row)
      }
    }
  ];

  let homeColumns = [
    {
      dataField: "filename",
      text: intl.formatMessage({ id: "TEXT.FILENAME" }),
      sort: true
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatter: DocActionsColumnFormatter,
      formatExtraData: {
        openPreviewModal: (row, rowIndex) => {
          setShowPreview(true);
          setCurrentRow({ ...row, index: rowIndex });
        },
        openDeleteModal: (row, rowIndex) => {
          setShowDelete(true);
          setCurrentRow({ ...row, index: rowIndex });
        },
        deleteExperience: row => deleteRow(row)
      }
    }
  ];

  const manageFile = (
    files,
    docType,
    docName,
    startDate,
    endDate,
    docNumber,
    birthDepartment,
    birthLoaction,
    birthDate,
    bankName,
    rib,
    bic
  ) => {
    const newIdFiles = identityFiles;
    if (
      (currentDocType === 8 && docType === 8 && !isVerso) ||
      (currentDocType === 8 && docType === 9)
    ) {
      newIdFiles.push({
        base64: files.formatedBase64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: files.name,
        size: files.size,
        type: files.type,
        expirationDate: endDate,
        issueDate: startDate,
        documentType: parseInt(docType),
        documentNumber: docNumber,
        AdditionalInformation: null
      });
      setIdentityFiles(newIdFiles);
      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles,
          idCardNumber: docNumber,
          idCardIssueDate: startDate,
          idCardExpirationDate: endDate
        })
      );

      props.formik.setFieldValue("applicantDocuments", newIdFiles);
      props.formik.setFieldValue("idCardNumber", docNumber);
      props.formik.setFieldValue("idCardIssueDate", startDate);
      props.formik.setFieldValue("idCardExpirationDate", endDate);
    }

    if (currentDocType === 10) {
      newIdFiles.push({
        base64: files.formatedBase64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: files.name,
        size: files.size,
        type: files.type,
        expirationDate: endDate,
        issueDate: startDate,
        documentType: parseInt(currentDocType),
        documentNumber: docNumber,
        birthDepartment: birthDepartment,
        birthLoaction: birthLoaction,
        birthDate: birthDate
      });
      setIdentityFiles(newIdFiles);

      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles,
          birthDate: birthDate,
          birthPlace: birthLoaction,
          birthDepartment: birthDepartment,
          socialSecurityNumber: docNumber
        })
      );

      props.formik.setFieldValue("birthDate", birthDate);
      props.formik.setFieldValue("birthPlace", birthLoaction);
      props.formik.setFieldValue("birthDepartment", birthDepartment);
      props.formik.setFieldValue("socialSecurityNumber", docNumber);
      props.formik.setFieldValue("applicantDocuments", newIdFiles);

      setBirthDate(birthDate);
      setSocialNumber(docNumber);
      setCityBirth(birthLoaction);
      setBirthDepartment(birthDepartment);
    }
    if (currentDocType === 11) {
      newIdFiles.push({
        base64: files.formatedBase64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: docName,
        size: files.size,
        type: files.type,
        documentType: parseInt(docType),
        documentNumber: docNumber,
        AdditionalInformation: null
      });
      setIdentityFiles(newIdFiles);
      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles
        })
      );

      props.formik.setFieldValue("applicantDocuments", newIdFiles);
    }
    if (currentDocType === 12) {
      newIdFiles.push({
        base64: files.formatedBase64,
        binaries: files.base64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: docName,
        size: files.size,
        type: files.type,
        documentType: parseInt(docType),
        documentNumber: docNumber,
        AdditionalInformation: null
      });
      setIdentityFiles(newIdFiles);
      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles,
          bankName: bankName,
          iban: rib,
          bic: bic
        })
      );

      props.formik.setFieldValue("applicantDocuments", newIdFiles);
    }
    if (currentDocType === 7) {
      newIdFiles.push({
        base64: files.formatedBase64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: docName,
        size: files.size,
        type: files.type,
        documentType: parseInt(docType),
        documentNumber: docNumber,
        AdditionalInformation: null
      });
      setIdentityFiles(newIdFiles);
      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles
        })
      );

      props.formik.setFieldValue("applicantDocuments", newIdFiles);
    }
    if (currentDocType === 8 && isVerso) {
      newIdFiles.push({
        base64: files.formatedBase64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: docName,
        size: files.size,
        type: files.type,
        documentType: parseInt(docType),
        documentNumber: null,
        AdditionalInformation: null
      });
      setIdentityFiles(newIdFiles);
      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles
        })
      );

      props.formik.setFieldValue("applicantDocuments", newIdFiles);
    }
    if (currentDocType === 13) {
      newIdFiles.push({
        base64: files.formatedBase64,
        lastModified: files.lastModified,
        lastModifiedDate: files.lastModifiedDate,
        filename: docName,
        size: files.size,
        type: files.type,
        documentType: parseInt(docType),
        documentNumber: docNumber,
        AdditionalInformation: null
      });
      setIdentityFiles(newIdFiles);
      dispatch(
        updateInterimaire.request({
          ...props.formik.values,
          applicantDocuments: newIdFiles
        })
      );
      props.formik.setFieldValue("applicantDocuments", newIdFiles);
    }

    setIsVerso(false);
    onHide();
  };

  const onHide = () => {
    setCurrentDocType(null);
    setOpenTypeSelect({ open: false, file: openTypeSelect.file });
  };
  const onHideDelete = () => {
    setShowDelete(false);
  };
  const onHidePreview = () => {
    setShowPreview(false);
  };
  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">Aucun document chargé !</div>
      </div>
    </div>
  );
  const handleChangePage = () => {
    props.history.push("/int-profile-edit/step-six");
  };

  const handlePreview = (row, rowIndex) => {
    setShowPreview(true);
    setCurrentRow({ ...row, index: rowIndex });
  };
  const editIdInfos = (
    docType,
    startDate,
    endDate,
    docNumber,
    birthDepartment,
    birthLoaction,
    birthDate
  ) => {
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        idCardNumber: docNumber,
        idCardIssueDate: startDate,
        idCardExpirationDate: endDate
      })
    );
    setEditID(false);
  };

  const editHealthInfos = (
    docNumber,
    birthDate,
    birthLoaction,
    birthDepartment
  ) => {
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        socialSecurityNumber: docNumber,
        birthDate: birthDate,
        birthDepartment: birthDepartment,
        birthPlace: birthLoaction
      })
    );
    setEditHealth(false);
  };

  const editBankInfos = (bankName, iban, bic) => {
    dispatch(
      updateInterimaire.request({
        ...props.formik.values,
        bankName: bankName,
        iban: iban,
        bic: bic
      })
    );
    setEditBank(false);
  };

  return (
    <LoadingOverlay active={loading} spinner>
      <div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px">
          <MissionWizzardHeader props={props} />
        </div>
        <div className="flex-row-fluid ml-lg-8">
          <div className="card card-custom">
            <div className="card-body p-0">
              <div className="wizard wizard-2">
                <div className="wizard-body py-8 px-8 py-lg-20 px-lg-10">
                  <DocumentModal
                    show={openTypeSelect.open}
                    onHide={onHide}
                    intl={intl}
                    files={files}
                    file={openTypeSelect.file}
                    currentType={currentDocType}
                    manageFile={manageFile}
                    isVerso={isVerso}
                    isEdit={isEdit}
                  />
                  <IDEditModal
                    show={editID.open}
                    onHide={() => setEditID(false)}
                    intl={intl}
                    parsed={parsed}
                    files={files}
                    file={editID.file}
                    currentType={currentDocType}
                    editIdInfos={editIdInfos}
                    isVerso={isVerso}
                    isEdit={isEdit}
                  />
                  <HealthEditModal
                    show={editHealth.open}
                    onHide={() => setEditHealth(false)}
                    intl={intl}
                    files={files}
                    file={editHealth.file}
                    currentType={currentDocType}
                    editHealthInfos={editHealthInfos}
                    parsed={parsed}
                  />
                  <BankEditModal
                    show={editBank.open}
                    onHide={() => setEditBank(false)}
                    intl={intl}
                    files={files}
                    file={editBank.file}
                    currentType={currentDocType}
                    editBankInfos={editBankInfos}
                    parsed={parsed}
                  />
                  <DeleteDocumentModal
                    row={currentRow}
                    deleteDocument={deleteDocument}
                    show={showDelete}
                    onHide={onHideDelete}
                  />

                  <PreviewDocumentModal
                    row={currentRow}
                    show={showPreview}
                    onHide={onHidePreview}
                  />
                  <div className="row ">
                    <div className="pb-5 width-full">
                      <div className="mb-10">
                        <div className="row col-xl-12 d-flex flex-row justify-content-between">
                          <div
                            aria-controls="health"
                            aria-expanded={openId}
                            className="col-lg-4 col-md-12 d-flex flex-row "
                          >
                            {!isNullOrEmpty(identityFiles) &&
                            !isNullOrEmpty(filterIDRecto(identityFiles)) ? (
                              <span className="svg-icon svg-icon-success">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            ) : (
                              <span className="svg-icon svg-icon-white">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            )}
                            <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Communication/Address-card.svg"
                                )}
                              />{" "}
                            </span>
                            <h3>Document d'identité</h3>
                          </div>
                          <div className="docs-container ">
                            <div>
                              <a
                                onClick={() => {
                                  setCurrentDocType(8);
                                  setIsVerso(false);
                                  setIsEdit(true);
                                  setEditID({
                                    open: true,
                                    file:
                                      !isNullOrEmpty(
                                        filterIDRecto(identityFiles)
                                      ) && filterIDRecto(identityFiles)[0]
                                  });
                                }}
                                title="Modifier les informations d'identité"
                                className="btn btn-icon btn-light-info mr-2"
                              >
                                <i className="far fa-edit"></i>
                              </a>
                            </div>
                            {identityCardRecto && (
                              <a
                                onClick={() => deleteId()}
                                title="Supprimer le recto et le verso"
                                className="btn btn-icon btn-light-danger mr-2"
                              >
                                <i className="far fa-trash-alt"></i>
                              </a>
                            )}
                            {identityCardRecto ? (
                              <section className="dropzone-container-xs">
                                <div style={{ textAlign: "center" }}>
                                  <img
                                    src={identityCardRecto.documentUrl}
                                    style={{
                                      display: "block",
                                      width: "240px",
                                      height: "150px"
                                    }}
                                  />
                                </div>
                              </section>
                            ) : (
                              <Dropzone accept=".jpg,.jpeg,.png">
                                {({ getRootProps, getInputProps }) => (
                                  <section className="dropzone-container-xs">
                                    <div
                                      {...getRootProps()}
                                      style={{ textAlign: "center" }}
                                    >
                                      <div
                                        className="image-circle-wrapper"
                                        style={{ margin: "0 auto" }}
                                      >
                                        <i className="flaticon2-download-2 text-white" />
                                      </div>
                                      <input {...getInputProps()} />
                                      <p className="mt-1">
                                        Glissez votre{" "}
                                        <span className="font-weight-bolder font-size-sm">
                                          Rib
                                        </span>
                                      </p>
                                      <div className="break">ou</div>
                                      <button
                                        type="button"
                                        className="file-input-button"
                                      >
                                        <FormattedMessage id="BUTTON.CHOSE.FILE" />
                                      </button>
                                    </div>
                                  </section>
                                )}
                              </Dropzone>
                            )}
                            {identityCardRecto &&
                              identityCardRecto.documentType !== 14 && (
                                <div style={{ marginLeft: 20 }}>
                                  {identityCardVerso ? (
                                    <div style={{ display: "flex" }}>
                                      <a
                                        onClick={() => deleteId()}
                                        title="Supprimer le recto et le verso"
                                        className="btn btn-icon btn-light-danger mr-2"
                                      >
                                        <i className="far fa-trash-alt"></i>
                                      </a>
                                      <section className="dropzone-container-xs">
                                        <div style={{ textAlign: "center" }}>
                                          <img
                                            src={identityCardVerso.documentUrl}
                                            style={{
                                              display: "block",
                                              width: "240px",
                                              height: "150px"
                                            }}
                                          />
                                        </div>
                                      </section>
                                    </div>
                                  ) : (
                                    <Dropzone accept=".jpg,.jpeg,.png">
                                      {({ getRootProps, getInputProps }) => (
                                        <section className="dropzone-container-xs">
                                          <div
                                            {...getRootProps()}
                                            style={{ textAlign: "center" }}
                                          >
                                            <div
                                              className="image-circle-wrapper"
                                              style={{ margin: "0 auto" }}
                                            >
                                              <i className="flaticon2-download-2 text-white" />
                                            </div>
                                            <input {...getInputProps()} />
                                            <p className="mt-1">
                                              Glissez votre{" "}
                                              <span className="font-weight-bolder font-size-sm">
                                                Rib
                                              </span>
                                            </p>
                                            <div className="break">ou</div>
                                            <button
                                              type="button"
                                              className="file-input-button"
                                            >
                                              <FormattedMessage id="BUTTON.CHOSE.FILE" />
                                            </button>
                                          </div>
                                        </section>
                                      )}
                                    </Dropzone>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        <Collapse className="doc-infos" in={openId}>
                          <div className="row margin-x-10">
                            <div className="col-lg-12 d-flex flex-column justify-content">
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    <FormattedMessage id="TEXT.IDENTITY.ID" /> :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                    parsed.idCardNumber}
                                </p>
                              </div>
                              {!isNullOrEmpty(filterIDRecto(identityFiles)) && (
                                <div className="mt-2 d-flex flex-row justify-content-between">
                                  <p>
                                    <span className="font-weight-bolder font-size-sm">
                                      <FormattedMessage id="TEXT.IDENTITY.TYPE" />{" "}
                                      :
                                    </span>{" "}
                                    {!isNullOrEmpty(identityFiles) &&
                                    !isNullOrEmpty(
                                      filterIDRecto(identityFiles)
                                    ) &&
                                    filterIDRecto(identityFiles)[0]
                                      .documentType === 8
                                      ? intl.formatMessage({
                                          id: "DOCUMENT.ID.CARD"
                                        })
                                      : null}
                                    {!isNullOrEmpty(identityFiles) &&
                                    !isNullOrEmpty(
                                      filterIDRecto(identityFiles)
                                    ) &&
                                    filterIDRecto(identityFiles)[0]
                                      .documentType === 9
                                      ? "Carte de séjour"
                                      : null}
                                  </p>
                                </div>
                              )}
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Date de début :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.idCardIssueDate)
                                    ? moment(parsed.idCardIssueDate)
                                        .locale("fr")
                                        .format("DD/MM/YYYY")
                                    : null}
                                </p>
                              </div>
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Date de fin :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.idCardExpirationDate)
                                    ? moment(parsed.idCardExpirationDate)
                                        .locale("fr")
                                        .format("DD/MM/YYYY")
                                    : null}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className="mb-10">
                        <div className="row col-xl-12 d-flex flex-row justify-content-between">
                          <div
                            aria-controls="health"
                            aria-expanded={openHealth}
                            className="col-lg-4 col-md-12 d-flex flex-row "
                          >
                            {!isNullOrEmpty(identityFiles) &&
                            !isNullOrEmpty(filterHealth(identityFiles)) ? (
                              <span className="svg-icon svg-icon-success">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            ) : (
                              <span className="svg-icon svg-icon-white">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            )}
                            <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/General/Heart.svg"
                                )}
                              />{" "}
                            </span>
                            <h3>Carte Vitale</h3>
                          </div>
                          <div className="docs-container ">
                            <div>
                              <a
                                onClick={() => {
                                  setCurrentDocType(10);
                                  setIsVerso(false);
                                  setIsEdit(true);
                                  setEditHealth({
                                    open: true,
                                    file: filterHealth(identityFiles)
                                  });
                                }}
                                title="Modifier les informations de la carte vitale"
                                className="btn btn-icon btn-light-info mr-2"
                              >
                                <i className="far fa-edit"></i>
                              </a>
                              {vitalCard && (
                                <a
                                  onClick={() => deleteHealth()}
                                  title="Supprimer la carte vitale"
                                  className="btn btn-icon btn-light-danger mr-2"
                                >
                                  <i className="far fa-trash-alt"></i>
                                </a>
                              )}
                            </div>
                            {vitalCard ? (
                              <section className="dropzone-container-xs">
                                <div style={{ textAlign: "center" }}>
                                  <img
                                    src={vitalCard.documentUrl}
                                    style={{
                                      display: "block",
                                      width: "240px",
                                      height: "150px"
                                    }}
                                  />
                                </div>
                              </section>
                            ) : (
                              <Dropzone accept=".jpg,.jpeg,.png">
                                {({ getRootProps, getInputProps }) => (
                                  <section className="dropzone-container-xs">
                                    <div
                                      {...getRootProps()}
                                      style={{ textAlign: "center" }}
                                    >
                                      <div
                                        className="image-circle-wrapper"
                                        style={{ margin: "0 auto" }}
                                      >
                                        <i className="flaticon2-download-2 text-white" />
                                      </div>
                                      <input {...getInputProps()} />
                                      <p className="mt-1">
                                        Glissez votre{" "}
                                        <span className="font-weight-bolder font-size-sm">
                                          <FormattedMessage id="VITAL.CARD" />
                                        </span>
                                      </p>
                                      <div className="break">ou</div>
                                      <button
                                        type="button"
                                        className="file-input-button"
                                      >
                                        <FormattedMessage id="BUTTON.CHOSE.FILE" />
                                      </button>
                                    </div>
                                  </section>
                                )}
                              </Dropzone>
                            )}
                            {/*!isNullOrEmpty(identityFiles) &&
                              !isNullOrEmpty(filterHealth(identityFiles)) && (
                                <section
                                  onClick={() =>
                                    handlePreview(filterHealth(identityFiles))
                                  }
                                  className="dropzone-container-xs doc-preview"
                                >
                                  {thumbs(filterHealth(identityFiles))}
                                </section>
                              )*/}
                            {/*<section
                              style={{
                                display:
                                  !_.isEmpty(filterHealth(identityFiles)) &&
                                  "none",
                              }}
                              className="dropzone-container-xs"
                            >
                              <div
                                {...getRootProps({
                                  className: "custom-dropzone",
                                  onClick: (e) => {
                                    setCurrentDocType(10);
                                  },
                                  onDragEnter: () => {
                                    setCurrentDocType(10);
                                  },
                                })}
                              >
                                <div className="image-circle-wrapper">
                                  <i className="flaticon2-download-2 text-white" />
                                </div>
                                <input {...getInputProps()} />

                                <p className="mt-1">
                                  Glissez votre{" "}
                                  <span className="font-weight-bolder font-size-sm">
                                    Carte Vitale
                                  </span>
                                </p>
                                <div className="break">ou</div>
                                <button
                                  type="button"
                                  className="file-input-button"
                                >
                                  <FormattedMessage id="BUTTON.CHOSE.FILE" />
                                </button>
                              </div>
                            </section>*/}
                          </div>
                        </div>
                        <Collapse className="doc-infos" in={openHealth}>
                          <div className="row margin-x-10">
                            <div className="col-lg-12 d-flex flex-column justify-content">
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Numéro de sécurité sociale :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.socialSecurityNumber)
                                    ? parsed.socialSecurityNumber
                                    : null}
                                </p>
                              </div>
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Date de naissance :
                                  </span>{" "}
                                  {birthDate === null &&
                                  !isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.birthDate)
                                    ? moment(parsed.birthDate)
                                        .locale("fr")
                                        .format("DD/MM/YYYY")
                                    : null}
                                  {birthDate !== null
                                    ? moment(birthDate)
                                        .locale("fr")
                                        .format("DD/MM/YYYY")
                                    : null}
                                </p>
                              </div>
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Ville de naissance :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.birthPlace)
                                    ? parsed.birthPlace
                                    : null}
                                </p>
                              </div>
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Département de naissance :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.birthDepartment)
                                    ? parsed.birthDepartment
                                    : null}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className="mb-10">
                        <div className="row col-xl-12 d-flex flex-row justify-content-between">
                          <div
                            aria-controls="health"
                            aria-expanded={openBank}
                            className="col-lg-4 col-md-12 d-flex flex-row "
                          >
                            {!isNullOrEmpty(identityFiles) &&
                            !isNullOrEmpty(filterBank(identityFiles)) ? (
                              <span className="svg-icon svg-icon-success">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            ) : (
                              <span className="svg-icon svg-icon-white">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            )}
                            <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Shopping/Credit-card.svg"
                                )}
                              />{" "}
                            </span>
                            <h3>RIB</h3>
                          </div>
                          <div className="docs-container ">
                            <div>
                              <a
                                onClick={() => {
                                  setCurrentDocType(12);
                                  setIsVerso(false);
                                  setIsEdit(true);
                                  setEditBank({
                                    open: true,
                                    file: filterHealth(identityFiles)
                                  });
                                }}
                                title="Modifier les informations du RIB"
                                className="btn btn-icon btn-light-info mr-2"
                              >
                                <i className="far fa-edit"></i>
                              </a>
                              {rib && (
                                <a
                                  onClick={() => deleteBank()}
                                  title="Supprimer le RIB"
                                  className="btn btn-icon btn-light-danger mr-2"
                                >
                                  <i className="far fa-trash-alt"></i>
                                </a>
                              )}
                            </div>
                            {rib ? (
                              <section className="dropzone-container-xs">
                                <div style={{ textAlign: "center" }}>
                                  <img
                                    src={rib.documentUrl}
                                    style={{
                                      display: "block",
                                      width: "240px",
                                      height: "150px"
                                    }}
                                  />
                                </div>
                              </section>
                            ) : (
                              <Dropzone accept=".jpg,.jpeg,.png">
                                {({ getRootProps, getInputProps }) => (
                                  <section className="dropzone-container-xs">
                                    <div
                                      {...getRootProps()}
                                      style={{ textAlign: "center" }}
                                    >
                                      <div
                                        className="image-circle-wrapper"
                                        style={{ margin: "0 auto" }}
                                      >
                                        <i className="flaticon2-download-2 text-white" />
                                      </div>
                                      <input {...getInputProps()} />
                                      <p className="mt-1">
                                        Glissez votre{" "}
                                        <span className="font-weight-bolder font-size-sm">
                                          Rib
                                        </span>
                                      </p>
                                      <div className="break">ou</div>
                                      <button
                                        type="button"
                                        className="file-input-button"
                                      >
                                        <FormattedMessage id="BUTTON.CHOSE.FILE" />
                                      </button>
                                    </div>
                                  </section>
                                )}
                              </Dropzone>
                            )}
                            {/*!isNullOrEmpty(identityFiles) &&
                              !isNullOrEmpty(filterBank(identityFiles)) && (
                                <section
                                  onClick={() =>
                                    handlePreview(filterBank(identityFiles)[0])
                                  }
                                  className="dropzone-container-xs doc-preview"
                                >
                                  {thumbs(filterBank(identityFiles)[0])}
                                </section>
                              )*/}
                            {/*<section
                              style={{
                                display:
                                  !_.isEmpty(filterBank(identityFiles)) &&
                                  "none",
                              }}
                              className="dropzone-container-xs"
                            >
                              <div
                                {...getRootProps({
                                  className: "custom-dropzone",
                                  onClick: () => setCurrentDocType(12),
                                  onDragEnter: () => {
                                    setCurrentDocType(12);
                                  },
                                })}
                              >
                                <div className="image-circle-wrapper">
                                  <i
                                    className="flaticon2-download-2 text-white"
                                  />
                                </div>
                                <input {...getInputProps()} />

                                <p className="mt-1">
                                  Glissez votre{" "}
                                  <span className="font-weight-bolder font-size-sm">
                                    RIB
                                  </span>
                                </p>
                                <div className="break">ou</div>
                                <button
                                  type="button"
                                  className="file-input-button"
                                >
                                  <FormattedMessage id="BUTTON.CHOSE.FILE" />
                                </button>
                              </div>
                            </section>*/}
                          </div>
                        </div>
                        <Collapse className="doc-infos" in={openBank}>
                          <div className="row margin-x-10">
                            <div className="col-lg-12 d-flex flex-column justify-content">
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    Dénomination de la banque :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.bankName)
                                    ? parsed.bankName
                                    : null}
                                </p>
                              </div>
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    IBAN :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.iban)
                                    ? parsed.iban
                                    : null}
                                </p>
                              </div>
                              <div className="mt-2 d-flex flex-row justify-content-between">
                                <p>
                                  <span className="font-weight-bolder font-size-sm">
                                    BIC :
                                  </span>{" "}
                                  {!isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.bic)
                                    ? parsed.bic
                                    : null}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className=" mt-20 mb-10">
                        <div className="row col-xl-12 d-flex flex-row justify-content-between">
                          <div
                            aria-controls="health"
                            aria-expanded={openHome}
                            className="col-lg-8 col-md-12 d-flex flex-row "
                          >
                            {!isNullOrEmpty(identityFiles) &&
                            !isNullOrEmpty(filterHome(identityFiles)) ? (
                              <span className="svg-icon svg-icon-success">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            ) : (
                              <span className="svg-icon svg-icon-white">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            )}
                            <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Home/Home.svg"
                                )}
                              />{" "}
                            </span>
                            <h3>Justificatif de domicile</h3>
                          </div>

                          <section className="dropzone-container-xs">
                            <div
                              {...getRootProps({
                                className: "custom-dropzone",
                                onClick: () => setCurrentDocType(11),
                                onDragEnter: () => {
                                  setCurrentDocType(11);
                                }
                              })}
                            >
                              <div className="image-circle-wrapper">
                                <i
                                  className="flaticon2-download-2 text-white
                         "
                                />
                              </div>
                              <input {...getInputProps()} />

                              <p className="mt-1">
                                Glissez votre{" "}
                                <span className="font-weight-bolder font-size-sm">
                                  Justificatif de domicile
                                </span>
                              </p>
                              <div className="break">ou</div>
                              <button
                                type="button"
                                className="file-input-button"
                              >
                                <FormattedMessage id="BUTTON.CHOSE.FILE" />
                              </button>
                            </div>
                          </section>
                        </div>
                        <Collapse className="doc-infos" in={openHome}>
                          <div className="row margin-x-10">
                            <div className="pb-5 ">
                              <BootstrapTable
                                remote
                                wrapperClasses="table-responsive"
                                bordered={false}
                                classes="table table-head-custom table-vertical-center overflow-hidden"
                                bootstrap4
                                keyField="manager"
                                data={
                                  !isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.applicantDocuments)
                                    ? filterHome(parsed.applicantDocuments)
                                    : []
                                }
                                columns={homeColumns}
                                noDataIndication={() => <NoDataIndication />}
                              />
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className=" mt-20 mb-10">
                        <div className="row col-xl-12 d-flex flex-row justify-content-between">
                          <div
                            aria-controls="health"
                            aria-expanded={openAuth}
                            className="col-lg-8 col-md-12 d-flex flex-row "
                          >
                            {!isNullOrEmpty(identityFiles) &&
                            !isNullOrEmpty(filterAuth(identityFiles)) ? (
                              <span className="svg-icon svg-icon-success">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            ) : (
                              <span className="svg-icon svg-icon-white">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            )}
                            <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Communication/Clipboard-list.svg"
                                )}
                              />{" "}
                            </span>
                            <h3>
                              <FormattedMessage id="TEXT.HABILITATIONS" />
                            </h3>
                          </div>

                          <section className="dropzone-container-xs">
                            <div
                              {...getRootProps({
                                className: "custom-dropzone",
                                onClick: () => setCurrentDocType(13),
                                onDragEnter: () => {
                                  setCurrentDocType(13);
                                }
                              })}
                            >
                              <div className="image-circle-wrapper">
                                <i
                                  className="flaticon2-download-2 text-white
                         "
                                />
                              </div>
                              <input {...getInputProps()} />

                              <p className="mt-1">
                                Glissez vos{" "}
                                <span className="font-weight-bolder font-size-sm">
                                  <FormattedMessage id="TEXT.HABILITATIONS" />
                                </span>
                              </p>
                              <div className="break">ou</div>
                              <button
                                type="button"
                                className="file-input-button"
                              >
                                <FormattedMessage id="BUTTON.CHOSE.FILE" />
                              </button>
                            </div>
                          </section>
                        </div>
                        <Collapse className="doc-infos" in={openAuth}>
                          <div className="row margin-x-10">
                            <div className="pb-5 ">
                              <BootstrapTable
                                remote
                                wrapperClasses="table-responsive"
                                bordered={false}
                                classes="table table-head-custom table-vertical-center overflow-hidden"
                                bootstrap4
                                keyField="manager"
                                data={
                                  !isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.applicantDocuments)
                                    ? filterAuth(parsed.applicantDocuments)
                                    : []
                                }
                                columns={homeColumns}
                                noDataIndication={() => <NoDataIndication />}
                              />
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className=" mt-20 mb-10">
                        <div className="row col-xl-12 d-flex flex-row justify-content-between">
                          <div
                            aria-controls="health"
                            aria-expanded={openOthers}
                            className="col-lg-8 col-md-12 d-flex flex-row "
                          >
                            {!isNullOrEmpty(identityFiles) &&
                            !isNullOrEmpty(filterOthers(identityFiles)) ? (
                              <span className="svg-icon svg-icon-success">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            ) : (
                              <span className="svg-icon svg-icon-white">
                                <SVG
                                  className=""
                                  src={toAbsoluteUrl(
                                    "/media/svg/icons/Navigation/Check.svg"
                                  )}
                                />{" "}
                              </span>
                            )}
                            <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Files/File-plus.svg"
                                )}
                              />{" "}
                            </span>
                            <h3>Autres documents</h3>
                          </div>

                          <section className="dropzone-container-xs">
                            <div
                              {...getRootProps({
                                className: "custom-dropzone",
                                onClick: () => setCurrentDocType(7),
                                onDragEnter: () => {
                                  setCurrentDocType(7);
                                }
                              })}
                            >
                              <div className="image-circle-wrapper">
                                <i
                                  className="flaticon2-download-2 text-white
                         "
                                />
                              </div>
                              <input {...getInputProps()} />

                              <p className="mt-1">
                                Glissez vos{" "}
                                <span className="font-weight-bolder font-size-sm">
                                  Autres documents
                                </span>
                              </p>
                              <div className="break">ou</div>
                              <button
                                type="button"
                                className="file-input-button"
                              >
                                <FormattedMessage id="BUTTON.CHOSE.FILE" />
                              </button>
                            </div>
                          </section>
                        </div>
                        <Collapse className="doc-infos" in={openOthers}>
                          <div className="row margin-x-10">
                            <div className="pb-5 ">
                              <BootstrapTable
                                remote
                                wrapperClasses="table-responsive"
                                bordered={false}
                                classes="table table-head-custom table-vertical-center overflow-hidden"
                                bootstrap4
                                keyField="manager"
                                data={
                                  !isNullOrEmpty(parsed) &&
                                  !isNullOrEmpty(parsed.applicantDocuments)
                                    ? filterOthers(parsed.applicantDocuments)
                                    : []
                                }
                                columns={homeColumns}
                                noDataIndication={() => <NoDataIndication />}
                              />
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className="d-flex row justify-content-between border-top mt-5 pt-10">
                        <div className="mr-2">
                          <Link
                            to="/int-profile-edit/step-four"
                            className="next col-lg p-0"
                          >
                            <button
                              type="button"
                              className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                            >
                              <FormattedMessage id="BUTTON.BACK" />
                            </button>
                          </Link>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                            onClick={() => handleChangePage()}
                          >
                            <FormattedMessage id="BUTTON.NEXT" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
    </LoadingOverlay>
  );
}

export default injectIntl(FormStepFive);
