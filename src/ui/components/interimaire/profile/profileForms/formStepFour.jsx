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
import { useParams } from "react-router-dom";
import Select from "react-select";
import useLocalStorage from "../../../shared/persistState.js";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty.js";

import { getMissionEquipment } from "../../../../../business/actions/shared/listsActions.js";
import ActionsColumnFormatter from "./actionsColumnFormatter.jsx";
import { updateApplicant } from "actions/client/applicantsActions";
import { getContractType } from "actions/shared/listsActions";
function FormStepFour(props, formik) {
  const dispatch = useDispatch();
  const { interimaireId } = useParams();
  const { selectedEquipment, setSelectedEquipment } = props;

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
