import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { getBackOfficeContractList } from "../../../../business/actions/backoffice/recruiterActions";
import InterimairesCard from "./interimairesCard.jsx";

function Interimaires(props) {
  const { user } = useSelector(state => state.recruiterReducerData);
  const dispatch = useDispatch();
  const intl = useIntl();

  useEffect(() => {
    if (user) {
      let body = {
        tenantID: user.tenantID,
        status: 0,
        pageSize: 10,
        pageNumber: 1
      };
      getBackOfficeContractList(body, dispatch);
    }
  }, [user]);

  return <InterimairesCard />;
}

export default Interimaires;
{
}
