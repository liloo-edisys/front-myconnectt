import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Fade } from "react-reveal";
import { useIntl } from "react-intl";
import SVG from "react-inlinesvg";
import { getExtensions } from "../../../../../business/actions/client/missionsActions";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";
import ExtensionsCard from "./ExtensionsCard";

function Extensions(props) {
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
      getExtensions(body, dispatch);
    }
  }, [user]);

  return <ExtensionsCard />;
}

export default Extensions;
{
}
