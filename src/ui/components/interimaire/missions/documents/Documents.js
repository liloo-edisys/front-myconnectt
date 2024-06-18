import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Fade } from "react-reveal";
import { useIntl } from "react-intl";
import SVG from "react-inlinesvg";
import { getContractList } from ".././../../../../business/actions/interimaire/InterimairesActions";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";
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
