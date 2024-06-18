import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import BootstrapTable from "react-bootstrap-table-next";

function CommercialAgreement(props) {
  const intl = useIntl();
  const { user } = useSelector(state => state.auth);
  const [agreementList, setAgreementList] = useState(null);
  useEffect(() => {
    const body = {
      tenantID: user.tenantID,
      accountID: user.accountID,
      groupID: 0,
      qualificationID: 0,
      pageSize: 10,
      pageNumber: 1
    };
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/Search`,
        body
      )
      .then(res => {
        setAgreementList(res.data);
      });
  }, []);
  const columns = [
    {
      dataField: "qualificationTitle",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" })
    },
    {
      dataField: "accountName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" })
    },
    {
      dataField: "groupName",
      text: intl.formatMessage({ id: "COLUMN.GROUP" })
    },
    {
      dataField: "coefficient",
      text: intl.formatMessage({ id: "TEXT.COEFFICIENT" })
    },
    {
      dataField: "validatedDate",
      text: intl.formatMessage({ id: "COLUMN.VALIDATION.DATE" }),
      formatter: value => (
        <span>{value ? new Date(value).toLocaleDateString("fr-FR") : ""}</span>
      )
    },
    {
      dataField: "validatedByName",
      text: intl.formatMessage({ id: "COLUMN.VALIDATED.BY" })
    }
  ];
  return (
    <div className="card card-custom">
      <div className="card-body">
        <h1 className="font-weight-boldest">Accords commerciaux</h1>
        {
          <BootstrapTable
            remote
            rowClasses={["dashed"]}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={agreementList ? agreementList.list : []}
            columns={columns}
          />
        }
      </div>
    </div>
  );
}

export default CommercialAgreement;
