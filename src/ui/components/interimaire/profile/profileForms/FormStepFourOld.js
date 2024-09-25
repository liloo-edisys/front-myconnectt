/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import _ from "lodash";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./missionWizzardHeader.jsx";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { Collapse } from "react-bootstrap";
import SVG from "react-inlinesvg";
import BootstrapTable from "react-bootstrap-table-next";

import { toAbsoluteUrl } from "metronic/_helpers";
import { getMissionEquipment } from "../../../../../business/actions/shared/listsActions";
import { ProfileReferencesModal } from "../profileModals/ProfileReferencesModal";
import ActionsColumnFormatter from "./actionsColumnFormatter.jsx";
import { DeleteRefsModal } from "../profileModals/DeleteRefsModal";
import { updateApplicant } from "actions/client/applicantsActions";
import { getContractType } from "actions/shared/listsActions";
function FormStepFour(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;

  const { missionEquipment, parsed, contractTypes } = useSelector(
    state => ({
      missionEquipment: state.lists.missionEquipment,
      interimaire: state.interimairesReducerData.interimaire,
      parsed: state.interimairesReducerData.interimaire,
      contractTypes: state.lists.contractType
    }),
    shallowEqual
  );
  const [show, setShow] = useState(false);
  const [openEquipment, setOpenEquipment] = useState(true);
  const [openReferences, setOpenReferences] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentRow, setCurrentRow] = useState([]);

  const [refs, setRefs] = useLocalStorage(
    "refs",
    parsed ? parsed.applicantReferences : []
  );
  const createOption = (label, value) => ({
    label,
    value
  });
  const formatEquipment = data => {
    if (missionEquipment.length) {
      let newArray = [];
      !isNullOrEmpty(data) &&
        data.map(eq => {
          let value = missionEquipment.filter(l => l.id === eq);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].id
              )
            );
          }
        });

      return setSelectedEquipment(newArray);
    }
  };
  const useMountEffect = fun => useEffect(fun, []);
  useMountEffect(() => {
    missionEquipment.length &&
      isNullOrEmpty(selectedEquipment) &&
      formatEquipment(parsed.missionArrayEquipments);
  });
  const [selectedEquipment, setSelectedEquipment] = useLocalStorage(
    "selectedEquipment",
    null
  );
  const handleChangeEquipment = newValue => {
    let formikEquipment = [];
    let newArray = !isNullOrEmpty(selectedEquipment)
      ? [...selectedEquipment]
      : [];
    let difference =
      newValue !== null && selectedEquipment.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedEquipment.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map(tag =>
        newArray.push(createOption(tag.label, tag.value))
      );
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }

    !isNullOrEmpty(newValue) &&
      newValue.map(value => {
        return formikEquipment.push(value.value);
      });
    setSelectedEquipment(newArray);
    props.formik.setFieldValue("missionArrayEquipments", formikEquipment);
  };

  useEffect(() => {
    if (parsed) {
      isNullOrEmpty(contractTypes) && dispatch(getContractType.request());
      isNullOrEmpty(missionEquipment) &&
        dispatch(getMissionEquipment.request());
      missionEquipment.length &&
        selectedEquipment === null &&
        formatEquipment(parsed.missionArrayEquipments);
      props.formik &&
        props.formik.values &&
        isNullOrEmpty(props.formik.values.missionArrayEquipments) &&
        props.formik.setFieldValue(
          "missionArrayEquipments",
          parsed.missionArrayEquipments
        );
    }
  }, [dispatch, contractTypes, selectedEquipment, parsed, missionEquipment]);
  let formatedEquipment = missionEquipment.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });
  const onHide = () => {
    setShow(false);
    setShowDelete(false);
    setShowEdit(false);
    setCurrentRow([]);
  };
  const { errors, touched } = useFormikContext();
  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "transparent",
      margin: "-9px",
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      borderColor: "transparent",
      boxShadow: null,
      "&:hover": {
        borderColor: "transparent"
      }
    }),
    menu: base => ({
      ...base,
      borderRadius: 0,
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      padding: 0
    })
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
        <div className="alert-text">Aucune référence saisie !</div>
      </div>
    </div>
  );

  const formatJobTitle = value => {
    let res = contractTypes.filter(job => job.id === value);
    return res.length ? res[0].name : null;
  };

  let columns = [
    {
      dataField: "contactName",
      text: intl.formatMessage({ id: "MODEL.MANAGER" }),
      sort: true
    },
    {
      dataField: "contactEmail",
      text: intl.formatMessage({ id: "MODEL.EMAIL" }),
      sort: true
    },
    {
      dataField: "contactPhone",
      text: intl.formatMessage({ id: "MODEL.PHONE" }),
      sort: true
    },
    {
      dataField: "companyName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" }),
      sort: true
    },
    {
      dataField: "city",
      text: intl.formatMessage({ id: "TEXT.LOCATION" }),
      sort: true
    },
    {
      dataField: "jobTitle",
      text: intl.formatMessage({ id: "TEXT.PAST.JOB" }),
      sort: true
    },
    {
      dataField: "contractTypeID",
      text: intl.formatMessage({ id: "MODEL.CONTRACT.TYPE" }),
      sort: true,
      formatter: (value, row) => formatJobTitle(value)
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      formatter: ActionsColumnFormatter,
      style: {
        minWidth: "100px"
      },
      formatExtraData: {
        openEditModal: (row, rowIndex) => {
          setShowEdit(true);
          setCurrentRow({ ...row, index: rowIndex });
        },
        openDeleteModal: (row, rowIndex) => {
          setShowDelete(true);
          setCurrentRow({ ...row, index: rowIndex });
        },
        deleteRef: row => deleteRef(row),
        handleUpdateRefs: row => handleUpdateRefs(row)
      }
    }
  ];
  const handleEditRefs = xp => {
    let newExperiences =
      parsed && !isNullOrEmpty(parsed.applicantReferences)
        ? parsed.applicantReferences
        : [];

    newExperiences.push(xp);
    props.formik.setFieldValue("applicantReferences", newExperiences);
    setRefs(newExperiences);
  };

  const handleUpdateRefs = (xp, row) => {
    let newExperiences = refs;
    newExperiences[row] = xp;
    setRefs(newExperiences);
    props.formik.setFieldValue("applicantReferences", newExperiences);
  };
  const deleteRef = row => {
    let newRef = refs;
    newRef.splice(row, 1);
    setRefs(newRef);
    props.formik.setFieldValue("applicantReferences", newRef);
  };

  const handleChangePage = () => {
    dispatch(updateApplicant.request(props.formik.values));
    props.history.push("/int-profile-edit/step-five");
  };

  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <MissionWizzardHeader />
          <div className="wizard-body py-8 px-8">
            <div className="row mt-10 mx-10">
              <div className="pb-5 width-full">
                <div className="row mt-10">
                  <>
                    <div
                      onClick={() => setOpenReferences(!openReferences)}
                      aria-controls="example-collapse-text"
                      aria-expanded={openReferences}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                          <SVG
                            src={toAbsoluteUrl(
                              "/media/svg/icons/General/Bookmark.svg"
                            )}
                          />{" "}
                        </span>

                        <h3>Mes références</h3>
                      </div>
                      {openReferences ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={openReferences}>
                      <div className="row mx-10 width-full">
                        <div className="pb-5 width-full">
                          <button
                            type="button"
                            onClick={() => setShow(true)}
                            className="btn float-right  btn-primary  mr-5"
                          >
                            <span>Ajouter une référence</span>
                          </button>
                          <ProfileReferencesModal
                            intl={intl}
                            handleEditRefs={handleEditRefs}
                            show={show}
                            onHide={onHide}
                          />
                          <ProfileReferencesModal
                            row={currentRow}
                            handleUpdateRefs={handleUpdateRefs}
                            intl={intl}
                            show={showEdit}
                            onHide={onHide}
                          />
                          <DeleteRefsModal
                            row={currentRow}
                            deleteRef={deleteRef}
                            show={showDelete}
                            onHide={onHide}
                          />{" "}
                          <BootstrapTable
                            remote
                            wrapperClasses="table-responsive"
                            bordered={false}
                            classes="table table-head-custom table-vertical-center overflow-hidden"
                            bootstrap4
                            keyField="manager"
                            data={refs ? refs : []}
                            columns={columns}
                            noDataIndication={() => <NoDataIndication />}
                          />
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>

                <div className="row mt-10">
                  <>
                    <div
                      onClick={() => setOpenEquipment(!openEquipment)}
                      aria-controls="example-collapse-text"
                      aria-expanded={openEquipment}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <span className="svg-icon svg-icon-2x svg-icon-primary mr-5">
                          <SVG
                            src={toAbsoluteUrl(
                              "/media/svg/icons/Tools/Tools.svg"
                            )}
                          />{" "}
                        </span>

                        <h3>Mes équipements</h3>
                      </div>
                      {openEquipment ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={openEquipment}>
                      <div className="col-xl-12">
                        <div className="form-group mt-5 ml-5">
                          <label>
                            <FormattedMessage id="MODEL.VACANCY.EQUIPMENT" />
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl far fa-list-alt text-primary"></i>
                              </span>
                            </div>
                            <Select
                              isMulti
                              onChange={e => handleChangeEquipment(e)}
                              options={formatedEquipment}
                              styles={customStyles}
                              value={selectedEquipment}
                              className="col-lg-12 form-control"
                            ></Select>
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>

                <div className="d-flex row justify-content-between border-top mt-5 pt-10">
                  <div className="mr-2 col-sm-12 col-xl-3">
                    <Link
                      to="/int-profile-edit/step-three"
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
                  <div className="col-sm-12 col-xl-3">
                    <button
                      type="button"
                      className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      onClick={() =>
                        dispatch(updateApplicant.request(props.formik.values))
                      }
                    >
                      <FormattedMessage id="BUTTON.SAVE" />
                    </button>
                  </div>
                  <div className="col-sm-12 col-xl-3">
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
  );
}

export default injectIntl(FormStepFour);
