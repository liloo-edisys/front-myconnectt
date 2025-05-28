import React, { useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";

import CompaniesTable from "./CompaniesTable";

function CompaniesCard({ createCompany, companies }) {
  const [show, setShow] = useState(null);
  const intl = useIntl();

  const handleClose = () => {
    setShow(null);
  };

  console.log("<--------- CompaniesCard show value --------->", show);

  const handleShow = (id) => () => {
    setShow(id);
  };

  const filteredCompanies = companies.length
    ? companies.filter((company) => company.parentID === null)
    : [];

  const worksites = companies.length
    ? companies.filter((company) => company.parentID !== null)
    : [];

  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "COMPANIES.TITLE" })}>
        <CardHeaderToolbar>
          <button
            type="button"
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={handleShow("new")}
          >
            <FormattedMessage id="COMPANIES.ADD.ACCOUNT" />
          </button>
        </CardHeaderToolbar>
      </CardHeader>
      <CardBody>
        <CompaniesTable
          createCompany={createCompany}
          companies={filteredCompanies}
          handleClose={handleClose}
          worksites={worksites}
          show={show}
        />
      </CardBody>
    </Card>
  );
}

export default CompaniesCard;
