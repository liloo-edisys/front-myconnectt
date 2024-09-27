import React from "react";
import { useIntl } from "react-intl";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody} from "../../../../../../_metronic/_partials/controls";
import "./styles.scss";

//import MissionsTable from "./missionsTable.jsx";
import ContractsTable from "./contractsTable.jsx";

function ContractsCard(props) {
  const intl = useIntl();
  return (
    <Card className="contract-table-width-100">
      <CardHeader title={intl.formatMessage({ id: "CONTRACTS.LIST.TITLE" })}>
        <NavLink to="/documents">
          {/*<button className="btn btn-warning mt-5">
            {intl.formatMessage({ id: "TEXT.MY.DOCUMENTS" })}
          </button>*/}
        </NavLink>
      </CardHeader>
      <CardBody>
        <ContractsTable />
      </CardBody>
    </Card>
  );
}

export default ContractsCard;
