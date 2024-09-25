// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect } from "react";

import { updateCompany } from "actions/client/companiesActions";
import { Formik, Form } from "formik";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  getInvoicesTypes,
  getPaymentChoices,
  getAPE
} from "../../../../../business/actions/shared/listsActions";
import { checkFields } from "actions/client/companiesActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

function WorksitePreviewForm({ onHide, intl, history }) {
  const dispatch = useDispatch();

  const { invoiceTypes, paymentChoices, apeNumber } = useSelector(
    state => ({
      invoiceTypes: state.lists.invoiceTypes,
      paymentChoices: state.lists.paymentChoices,
      apeNumber: state.lists.apeNumber
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(getInvoicesTypes.request());
    dispatch(getPaymentChoices.request());
    dispatch(getAPE.request());
  });
  useEffect(() => {
    dispatch(checkFields.request());
  }, [dispatch]);
  const paymentConditions = [
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.BILL" }), id: 0 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.BILL" }), id: 1 },
    { name: intl.formatMessage({ id: "PAYMENT.60.DAYS.BILL" }), id: 2 },
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.END.MONTH" }), id: 3 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.END.MONTH" }), id: 4 },
    { name: intl.formatMessage({ id: "PAYMENT.BILL.RECEIVED" }), id: 5 }
  ];

  const currentCompany = history.location.state;
  const initialValues = {
    id: currentCompany ? currentCompany.id : "",
    name: currentCompany ? currentCompany.name : "",
    apeNumber: currentCompany ? currentCompany.apeNumber : "",
    companyStatus: currentCompany ? currentCompany.companyStatus : "",
    tvaNumber: currentCompany ? currentCompany.tvaNumber : "",
    address: currentCompany ? currentCompany.address : "",
    additionaladdress: currentCompany ? currentCompany.additionalAddress : "",
    postalCode: currentCompany ? currentCompany.postalCode : "",
    city: currentCompany ? currentCompany.city : "",
    coefficient: currentCompany ? currentCompany.coefficient : "",
    phoneNumber: currentCompany ? currentCompany.phoneNumber : "",
    description: currentCompany ? currentCompany.description : "",
    paymentCondition: currentCompany ? currentCompany.paymentCondition : 0,
    invoiceTypeID:
      currentCompany && currentCompany.invoiceTypeID
        ? currentCompany.invoiceTypeID
        : 1,
    accountGroupID:
      currentCompany && currentCompany.accountGroupID
        ? currentCompany.accountGroupID
        : null,
    paymentChoiceID:
      currentCompany && currentCompany.paymentChoiceID
        ? currentCompany.paymentChoiceID
        : 1
  };
  // Validation schema
  const CompanyCreateSchema = Yup.object().shape({
    name: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    companyStatus: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    postalCode: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    phoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  const formatInvoiceType = id => {
    let value = invoiceTypes.filter(invoice => invoice.id === id);
    return value && !isNullOrEmpty(value) ? value[0].name : null;
  };
  const formatPaymentType = id => {
    let value = paymentChoices.filter(invoice => invoice.id === id);
    return value && !isNullOrEmpty(value) ? value[0].name : null;
  };

  const formatPaymentCondition = id => {
    let value = paymentConditions.filter(invoice => invoice.id === id);
    return value && !isNullOrEmpty(value) ? value[0].name : null;
  };

  const handleClose = () => {
    onHide();
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={CompanyCreateSchema}
        onSubmit={values => {
          let data = {
            ...values,
            tenantID: currentCompany.tenantID,
            parentID: currentCompany.parentID
          };
          dispatch(updateCompany.request(data), onHide());
        }}
      >
        {({ handleSubmit, values }) => (
          <>
            <Modal.Header>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Fermer"
                onClick={() => handleClose()}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px"
                }}
              >
                <i aria-hidden="true" className="ki ki-close"></i>
              </button>
            </Modal.Header>
            <Modal.Body className="overlay overlay-block cursor-default">
              <Form className="form form-label-right">
                <div className="form-group row">
                  {/* Raison sociale */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.NAME" />
                    </label>
                    <div className="input-group">{initialValues.name}</div>
                  </div>
                  {/* N° APE/NAF */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.APENUMBER" />
                    </label>
                    <div className="input-group">{initialValues.apeNumber}</div>
                  </div>
                  {/* statut juridique de la société */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.COMPANYSTATUS" />
                    </label>
                    <div className="input-group">
                      {initialValues.companyStatus}
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* N° TVA intracommunautaire​ */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.TVANUMBER" />
                    </label>
                    <div className="input-group">{initialValues.tvaNumber}</div>
                  </div>
                </div>
                <div className="separator separator-solid-primary my-10 mx-30"></div>

                <div className="form-group row">
                  {/* Adresse */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.ADDRESS" />
                    </label>
                    <div className="input-group">{initialValues.address}</div>
                  </div>
                  {/* Complément d’adresse */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.ADDITIONALADDRESS" />
                    </label>
                    <div className="input-group">
                      {initialValues.additionalAddress}
                    </div>
                  </div>
                  {/* code postal */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                    </label>
                    <div className="input-group">
                      {initialValues.postalCode}
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* ville */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.CITY" />
                    </label>
                    <div className="input-group">{initialValues.city}</div>
                  </div>
                  {/* numéro de téléphone de la société */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.PHONENUMBER" />
                    </label>
                    <div className="input-group">
                      {initialValues.phoneNumber}
                    </div>
                  </div>
                </div>
                <div className="separator separator-solid-primary my-10 mx-30"></div>

                <div className="form-group row">
                  {/* mode de règlement */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.PAYMENT_CHOICE" />
                    </label>
                    <div className="input-group">
                      {formatPaymentType(initialValues.paymentChoiceID)}
                    </div>
                  </div>
                  {/* condition de paiment */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.PAYMENT_CONDITION" />
                    </label>
                    <div className="input-group">
                      {formatPaymentCondition(initialValues.paymentCondition)}
                    </div>
                  </div>
                  {/* Type de Facture souhaitée */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.INVOICE_TYPE" />
                    </label>
                    <div className="input-group">
                      {formatInvoiceType(initialValues.invoiceTypeID)}
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* description */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.DESCRIPTION" />
                    </label>
                    <div className="input-group">
                      {initialValues.description}
                    </div>
                  </div>
                  {/* coefficient négocié (accord commercial) */}
                  <div className="col-lg-4">
                    <label className=" col-form-label font-weight-bolder">
                      <FormattedMessage id="MODEL.ACCOUNT.COEFFICIENT" />
                    </label>
                    <div className="input-group">
                      {initialValues.coefficient}
                    </div>
                  </div>
                </div>
              </Form>
            </Modal.Body>
          </>
        )}
      </Formik>
    </>
  );
}

export default injectIntl(WorksitePreviewForm);
