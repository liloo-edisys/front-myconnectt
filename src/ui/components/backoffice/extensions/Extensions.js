import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import ExtensionsCard from "./ExtensionsCard";

function Extensions(props) {
  const { user } = useSelector(state => state.recruiterReducerData);
  const dispatch = useDispatch();
  const intl = useIntl();

  /*useEffect(() => {
    if (user) {
      let body = {
        tenantID: user.tenantID,
        status: 0,
        pageSize: 12,
        pageNumber: 1,
      };
      getExtensions(body, dispatch);
    }
  }, [user]);*/

  return <ExtensionsCard />;
}

export default Extensions;
{
}
