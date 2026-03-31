import React, { useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useIntl } from "react-intl";
import ContractsClientCard from "./ContractsClientCard";

function ContractsClient(props) {
  const { user } = useSelector(
    state => ({
      user: state.auth.user
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const intl = useIntl();

  return <ContractsClientCard />;
}

export default ContractsClient;
