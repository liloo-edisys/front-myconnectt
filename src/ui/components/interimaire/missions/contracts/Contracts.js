import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import ContractsCard from "./ContractsCard";

function Contracts(props) {
  const { interimaire } = useSelector(state => state.interimairesReducerData);
  const dispatch = useDispatch();
  const intl = useIntl();

  return <ContractsCard />;
}

export default Contracts;
