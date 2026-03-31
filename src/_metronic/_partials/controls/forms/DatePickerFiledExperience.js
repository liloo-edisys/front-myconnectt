import React, {forwardRef} from "react";

import {useField, useFormikContext} from "formik";
import DatePicker from "react-datepicker";
import moment from 'moment'
import "./styles.scss"

const getFieldCSSClasses = (touched, errors) => {
  const classes = ["form-control, col-lg-12"];
  if (touched && errors) {
    classes.push("is-invalid");
  }

  if (touched && !errors) {
    classes.push("is-valid");
  }

  return classes.join(" ");
};

export function DatePickerFieldExperience({ ...props }) {
  const { setFieldValue, errors, touched } = useFormikContext();
  const [field] = useField(props);
    const ExampleCustomInput = forwardRef(
    ({ value, onClick }, ref) => (
      <div className={props.className} onClick={onClick} ref={ref}>
        {value}
      </div>
    ),
  );
  return (
                      <div className={props.iconHeight === "36px"? "input-group datepicker_container_36" : props.iconHeight === "55px"&& "input-group datepicker_container_55"}>
                        <div
                          className="input-group-prepend"
                          style={{ height: props.iconHeight }}
                        >
                          <span className="input-group-text">
                            <i className="icon-xl far fa-calendar-alt text-primary"></i>
                          </span>
                        </div>
      <DatePicker
        className={`${getFieldCSSClasses(touched[field.name], errors[field.name])} col-lg-12 `}
        style={{ width: "100%"}}
        {...field}
        {...props}
        selected={(field.value && new Date(field.value)) || null}
        onChange={val => {
          setFieldValue(field.name, val);
          props.onChange(moment(
           val
          )
          .locale("fr")
            .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS))
        }}
        dateFormat="dd/MM/yyyy"
        popperPlacement="top-start"
        customInput={<ExampleCustomInput />}

      />
      {/* {errors[field.name] && touched[field.name] && (
        <div className="invalid-datepicker-feedback">
          {errors[field.name].toString()}
        </div>
      )} */}
    </div>
  );
}
