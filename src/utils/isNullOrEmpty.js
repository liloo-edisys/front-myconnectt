import * as R from "ramda";

const isNullOrEmpty = value => {
  return R.isNil(value) || R.isEmpty(value);
};

export default isNullOrEmpty;
