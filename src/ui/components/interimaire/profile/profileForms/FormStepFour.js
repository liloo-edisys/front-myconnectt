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
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { countMatching } from "actions/client/ApplicantsActions";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import moment from "moment";
import { Button, Collapse } from "react-bootstrap";
import SVG from "react-inlinesvg";
import BootstrapTable from "react-bootstrap-table-next";

import { toAbsoluteUrl } from "metronic/_helpers";
import { getMissionEquipment } from "../../../../../business/actions/shared/ListsActions";
import { ProfileReferencesModal } from "../profileModals/ProfileReferencesModal";
import ActionsColumnFormatter from "./ActionsColumnFormatter";
import { DeleteRefsModal } from "../profileModals/DeleteRefsModal";
import { updateApplicant } from "actions/client/ApplicantsActions";
import { getContractType } from "actions/shared/ListsActions";
function FormStepFour(props, formik) {
  const dispatch = useDispatch();
  const { interimaireId } = useParams();
  const { intl, selectedEquipment, setSelectedEquipment } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const { missionEquipment, parsed, contractTypes } = useSelector(
    state => ({
      missionEquipment: state.lists.missionEquipment,
      interimaire: state.interimairesReducerData.interimaire,
      parsed: interimaireId
        ? state.accountsReducerData.activeInterimaire
        : state.interimairesReducerData.interimaire,
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
  const useMountEffect = fun => useEffect(fun, [selectedEquipment]);
  /*useMountEffect(() => {
    missionEquipment.length &&
      isNullOrEmpty(selectedEquipment) &&
      formatEquipment(parsed.missionArrayEquipments);
  });*/
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
  };

  useEffect(() => {
    if (parsed) {
      formatEquipment(parsed.missionArrayEquipments);
      isNullOrEmpty(contractTypes) && dispatch(getContractType.request());
      isNullOrEmpty(missionEquipment) &&
        dispatch(getMissionEquipment.request());
      props.formik &&
        props.formik.values &&
        isNullOrEmpty(props.formik.values.missionArrayEquipments) &&
        props.formik.setFieldValue(
          "missionArrayEquipments",
          parsed.missionArrayEquipments
        );
    }
  }, [dispatch, contractTypes, parsed, missionEquipment]);
  let formatedEquipment = missionEquipment.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });
  const onHide = () => {
    setShow(false);
    setShowDelete(false);
    setShowEdit(false);
    setCurrentRow([]);
  };
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
    <div className="pb-5 width-full">
      <div className="row">
        <>
          <div className="col-xl-12">
            <div className="form-group mt-5">
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
        </>
      </div>
    </div>
  );
}

export default injectIntl(FormStepFour);
