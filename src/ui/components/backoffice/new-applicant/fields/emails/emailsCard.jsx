import React from "react";
import { useIntl } from "react-intl";

import {
  Card,
  CardHeader,
  CardBody} from "../../../../../../_metronic/_partials/controls";
import "./styles.scss";

//import MissionsTable from "./MissionsTable";
import EmailsTable from "./emailsTable.jsx";

function EmailsCard(props) {
  const intl = useIntl();
  return (
    <Card className="contract-table-width-100">
      <CardHeader
        title={intl.formatMessage({ id: "EMAIL.LIST.TITLE" })}
      ></CardHeader>
      <CardBody>
        <EmailsTable />
      </CardBody>
    </Card>
  );
}

export default EmailsCard;
