import React, { useEffect } from "react";

import { LoadingDialog } from "metronic/_partials/controls";
import { shallowEqual, useSelector } from "react-redux";
import { useIntl } from "react-intl";

export function CustomersLoadingDialog() {
  const intl = useIntl();
  // Customers Redux state
  const { isLoading } = useSelector(
    state => ({ isLoading: state.customers.listLoading }),
    shallowEqual
  );
  // looking for loading/dispatch
  useEffect(() => {}, [isLoading]);
  return (
    <LoadingDialog
      isLoading={isLoading}
      text={intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })}
    />
  );
}
