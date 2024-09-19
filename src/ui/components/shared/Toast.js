import React from "react";

import { deleteErrors } from "actions/shared/errorsActions";
import { injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

let ErrorComponent = ({ requestError, intl }) => {
  const dispatch = useDispatch();
  const { errors } = useSelector(
    state => ({ errors: state.errors }),
    shallowEqual
  );

  const toastrMessageOptions = {
    onHideComplete: () => dispatch(deleteErrors.request())
  };

  return (
    <div>
      {errors &&
        errors.message &&
        toastr.error(
          intl.formatMessage({ id: errors.message }),
          toastrMessageOptions
        )}
    </div>
  );
};

export default injectIntl(ErrorComponent);
