import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import DocumentsCard from "./DocumentsCard";

function Documents(props) {
  const { interimaire } = useSelector(state => state.interimairesReducerData);
  const dispatch = useDispatch();
  const intl = useIntl();

  /*useEffect(() => {
    if (interimaire) {
      let body = {
        tenantID: interimaire.tenantID,
        accountID: 0,
        applicantID: interimaire.id,
        status: 0,
        pageSize: 10,
        pageNumber: 1
      };
      getContractList(body, dispatch);
    }
  }, [interimaire]);*/

  return <DocumentsCard />;
}

export default Documents;
