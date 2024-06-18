import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import CommercialAgreementsTable from "./CommercialAgreementsTable";
import { CommercialAgreementCreateDialog } from "./commercialAgreementsModals/CommercialAgreementCreateDialog";

function CommercialAgreementsCard(props) {
  const [
    toggleCommercialAgreementCreateModal,
    setToggleCommercialAgreementCreateModal
  ] = useState(false);

  const onHide = () => {
    setToggleCommercialAgreementCreateModal(false);
  };

  const showModal = () => {
    setToggleCommercialAgreementCreateModal(true);
  };

  const intl = useIntl();
  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({ id: "USER.COMMERCIAL.AGREEMENT" })}
      >
        <button
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          onClick={showModal}
        >
          <FormattedMessage id="BUTTON.CREATE.COMMERCIAL.AGREEMENT" />
        </button>
      </CardHeader>
      <CardBody>
        {toggleCommercialAgreementCreateModal && (
          <CommercialAgreementCreateDialog onHide={onHide} />
        )}
        <CommercialAgreementsTable />
      </CardBody>
    </Card>
  );
}

export default CommercialAgreementsCard;
