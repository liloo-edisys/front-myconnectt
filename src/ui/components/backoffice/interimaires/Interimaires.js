import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Fade } from "react-reveal";
import { useIntl } from "react-intl";
import SVG from "react-inlinesvg";
import { getBackOfficeContractList } from "../../../../business/actions/backoffice/RecruiterActions";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";
import InterimairesCard from "./InterimairesCard";

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
