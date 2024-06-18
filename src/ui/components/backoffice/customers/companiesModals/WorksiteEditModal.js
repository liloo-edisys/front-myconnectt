import React, { Component, useEffect, useState } from "react";

import { ModalProgressBar } from "metronic/_partials/controls";
import { FormattedMessage, useIntl } from "react-intl";
import { Modal } from "react-bootstrap";
import { shallowEqual, useSelector } from "react-redux";

import WorksiteEditForm from "../companiesForms/WorksiteEditForm";
import {
  CommercialAgreements,
  Contracts,
  Missions,
  Emails,
  Contacts,
  VancancyTemplate
} from "./fields";
import ClientWizzardHeader from "./ClientWizzardHeader";

export function WorksiteCreateHeader({ id, companyName, companyStatus }) {
  const { actionsLoading } = useSelector(
    state => ({
      actionsLoading: state.companies.loading
    }),
    shallowEqual
  );
  const intl = useIntl();

  const [title, setTitle] = useState("");
  // Title couting
  useEffect(() => {
    let _title =
      intl.formatMessage({ id: "TITLE.MODIFICATION.OF" }) + companyName;

    setTitle(_title);
    // eslint-disable-next-line
  }, [, actionsLoading]);

  return (
    <>
      {actionsLoading && <ModalProgressBar />}
      <Modal.Header closeButton>
        <Modal.Title
          id="example-modal-sizes-title-lg"
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between"
            }}
          >
            <div>{title}</div>
            <div>
              {companyStatus === 1 ? (
                <span className="label label-light-dark label-inline mr-2">
                  <FormattedMessage id="STATUS.REGISTERED" />
                </span>
              ) : companyStatus === 2 ? (
                <span className="label label-light-info label-inline mr-2">
                  <FormattedMessage id="STATUS.MODIFIED" />
                </span>
              ) : companyStatus === 3 ? (
                <span className="label label-light-success label-inline mr-2">
                  <FormattedMessage id="STATUS.VALIDATED.COMMERCIALS.ENCOURS" />
                </span>
              ) : companyStatus === 4 ? (
                <span className="label label-light-warning label-inline mr-2">
                  <FormattedMessage id="STATUS.VALIDATED.COMMERCIALS" />
                </span>
              ) : companyStatus === 5 ? (
                <span className="label label-warning label-inline mr-2">
                  <FormattedMessage id="STATUS.VALIDATED.ENCOURS" />
                </span>
              ) : companyStatus === 6 ? (
                <span className="label label-success label-inline mr-2">
                  <FormattedMessage id="STATUS.ANAEL.UPDATED" />
                </span>
              ) : (
                <span className="label label-light-dark label-inline mr-2">
                  <FormattedMessage id="STATUS.REGISTERED" />
                </span>
              )}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
    </>
  );
}

class WorksiteEditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: "edit"
    };
  }
  onChangeStep = newStep => {
    this.setState({
      step: newStep
    });
  };
  onHideModal = () => {
    this.setState({
      step: "edit"
    });
    this.props.onHide();
  };
  render() {
    const { step } = this.state;
    const { id, show, onHide, updateCompany, history } = this.props;
    const companyName = history.location.state
      ? history.location.state.name
      : "";
    const companyStatus = history.location.state
      ? history.location.state.accountStatusID
      : "";
    return (
      <Modal
        dialogClassName="modal-90w"
        show={show}
        onHide={this.onHideModal}
        aria-labelledby="example-modal-sizes-title-xl"
      >
        <WorksiteCreateHeader
          id={id}
          companyName={companyName}
          companyStatus={companyStatus}
        />
        <div className="row">
          <div className="col-3 text-right mt-10">
            <ClientWizzardHeader step={step} onChangeStep={this.onChangeStep} />
          </div>
          <div className="col-9">
            {step === "edit" ? (
              <WorksiteEditForm
                updateCompany={updateCompany}
                onHide={onHide}
                history={history}
                getData={this.props.getData}
              />
            ) : step === "commercialAgreements" ? (
              <CommercialAgreements history={history} />
            ) : step === "contracts" ? (
              <Contracts history={history} />
            ) : step === "emails" ? (
              <Emails history={history} />
            ) : step === "contacts" ? (
              <Contacts history={history} />
            ) : step === "vacancy" ? (
              <VancancyTemplate history={history} />
            ) : (
              step === "missions" && <Missions history={history} />
            )}
          </div>
        </div>
        {/*<WorksiteEditForm
          updateCompany={updateCompany}
          onHide={onHide}
          history={history}
          getData={this.props.getData}
        />*/}
      </Modal>
    );
  }
}

export default WorksiteEditModal;
