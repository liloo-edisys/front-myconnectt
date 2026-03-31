import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import fr from "date-fns/locale/fr";
import { useParams, useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import { useSelector, useDispatch } from "react-redux";
import _, { debounce, isNull } from "lodash";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { toastr } from "react-redux-toastr";
import axios from "axios";

function MissionEndingForm(props) {
  const { id } = useParams();
  const history = useHistory();
  const [otherReason, setOtherReason] = useState("");
  const [selectedCloseDate, setSelectedCloseDate] = useState("");
  const [reason, setReason] = useState(0);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const intl = useIntl();
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));

  useEffect(() => {
    const GET_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/${id}`;
    axios
      .get(GET_TIME_RECORDS_URL)
      .then(res => {
        setMinDate(res.data.firstDayPossibleClose);
        setMaxDate(res.data.lastDayPossibleClose);
      })
      .catch(err => console.log(err));
  }, [id]);

  const reasons = [
    {
      label: intl.formatMessage({ id: "REASON.END.OF.MISSION.TT" }),
      id: 32
    },
    {
      label: intl.formatMessage({ id: "REASON.END.TRIAL.EMPLOYER" }),
      id: 34
    },
    {
      label: intl.formatMessage({ id: "REASON.END.TRIAL.APPLICANT" }),
      id: 35
    },
    {
      label: intl.formatMessage({ id: "REASON.BREAK.UP.EMPLOYER" }),
      id: 36
    },
    {
      label: intl.formatMessage({ id: "REASON.BREAK.UP.APPLICANT" }),
      id: 37
    },
    {
      label: intl.formatMessage({ id: "REASON.APPLICANT.RECRUITED" }),
      id: 38
    },
    {
      label: intl.formatMessage({ id: "REASON.OTHER.REASON" }),
      id: 60
    }
  ];

  const closeMission = () => {
    const CLOSE_TIME_RECORDS_URL =
      `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/CloseMission/` + id;

    const body = {
      endingReason: reason,
      otherReason: reason === 60 ? otherReason : "",
      endDate: selectedCloseDate
    };
    axios
      .post(CLOSE_TIME_RECORDS_URL, body)
      .then(res => {
        toastr.success(
          intl.formatMessage({ id: "SUCCESS" }),
          intl.formatMessage({ id: "MISSION.ENDED.SUCCESSFULLY" })
        );
        history.goBack();
      })
      .catch(err => console.log(err));
  };

  return (
    <Modal
      show={true}
      onHide={() => history.goBack()}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-60w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage id="MISSION.CLOSING" />
          </p>
        </Modal.Title>
        <button
          onClick={() => history.goBack()}
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body>
        <label className="col-form-label">Raison</label>
        <select
          className="col-lg-12 form-control"
          name="reason"
          value={reason}
          onChange={e => setReason(parseInt(e.target.value))}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            {intl.formatMessage({ id: "REASON.SELECT.MESSAGE" })}
          </option>
          {reasons.map((rea, i) => (
            <option key={rea.id} value={rea.id}>
              {rea.label}
            </option>
          ))}
          ;
        </select>
        <label
          className="col-form-label"
          style={{
            color: reason !== 60 ? "lightgray" : ""
          }}
        >
          <FormattedMessage id="REASON.OTHER.REASON" />
        </label>
        <input
          type="text"
          id="otherReason"
          name="otherReason"
          className="col-lg-12 form-control"
          value={otherReason}
          readOnly={reason !== 60}
          onChange={e => setOtherReason(e.target.value)}
          style={{
            color: reason !== 60 ? "lightgray" : ""
          }}
        />
        <label className="col-form-label">Date de fermeture</label>
        <div className="row col-lg-12" style={{ paddingRight: 0 }}>
          <DatePicker
            className={`form-control`}
            style={{ width: "100%" }}
            dateFormat="dd/MM/yyyy"
            popperPlacement="bottom-middle"
            onChange={val => {
              setSelectedCloseDate(val);
            }}
            selected={selectedCloseDate}
            minDate={new Date(minDate)}
            maxDate={new Date(maxDate)}
            showMonthDropdown
            showYearDropdown
            yearItemNumber={9}
            locale={fr}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => history.goBack()}
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => closeMission()}
            disabled={
              reason == 0 ||
              (reason == 60 && isNullOrEmpty(otherReason)) ||
              isNullOrEmpty(selectedCloseDate)
            }
          >
            <FormattedMessage id="CONTACT.MODAL.SEND_BUTTON" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default MissionEndingForm;
