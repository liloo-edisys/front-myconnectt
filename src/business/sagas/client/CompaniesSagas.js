import * as actionTypes from "constants/constants";

import {
  getCompanies as getCompaniesActions,
  getCustomers as getCustomersActions,
  createCompany as createCompanyActions,
  updateCompany as updateCompanyActions,
  deleteCompany as deleteCompanyActions,
  switchAccount as switchCompanyActions,
  checkFields as checkFieldsActions
} from "actions/client/companiesActions";
import {
  getCompaniesList,
  getCustomersList,
  createCompany as createCompanyApi,
  updateCompany as updateCompanyApi,
  deleteCompany as deleteCompanyApi,
  switchAccount as switchCompanyApi,
  checkFields as checkFieldsApi
} from "api/client/CompaniesApi";
import { toastr } from "react-redux-toastr";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getCompanies() {
  try {
    const response = yield call(getCompaniesList);
    yield put(getCompaniesActions.success(response));
  } catch (error) {
    yield put(getCompaniesActions.failure(error));
  }
}

export function* getCustomers({ payload: { data } }) {
  try {
    const response = yield call(getCustomersList, data);
    yield put(getCustomersActions.success(response));
  } catch (error) {
    yield put(getCustomersActions.failure(error));
  }
}

export function* checkFields() {
  try {
    const response = yield call(checkFieldsApi);
    yield put(checkFieldsActions.success(response));
  } catch (error) {
    yield put(checkFieldsActions.failure(error));
  }
}

export function* createCompany({ payload: { data, getData } }) {
  let val = {
    ...data,
    accountGroupID: data.accountGroupID === 0 ? null : data.accountGroupID
  };

  try {
    const response = yield call(createCompanyApi, val);
    yield put(createCompanyActions.success(response, val));
    if (response.status === 200) {
      if (getData != null) getData();
      const response = yield call(getCompaniesList);
      yield put(getCompaniesActions.success(response));
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(createCompanyActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* switchCompany({ payload: { data } }) {
  try {
    const response = yield call(switchCompanyApi, data);
    yield put(switchCompanyActions.success(response, data));
    if (response.status === 200) {
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(switchCompanyActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* updateCompany({ payload: { data } }) {
  let val = {
    ...data,
    accountGroupID: data.accountGroupID === 0 ? null : data.accountGroupID
  };
  try {
    const response = yield call(updateCompanyApi, val);
    yield put(updateCompanyActions.success(response, val));
    if (response.status === 200) {
      yield put(getCompaniesActions.request());
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
      yield call(checkFields);
    }
  } catch (error) {
    yield put(updateCompanyActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* deleteCompany({ payload: { id } }) {
  try {
    const response = yield call(deleteCompanyApi, id);
    yield put(deleteCompanyActions.success(response, id));
    if (response.status === 200) {
      yield put(getCompaniesActions.request());
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(deleteCompanyActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export default function* CompaniesSagas() {
  yield all([takeLatest(actionTypes.GET_COMPANIES_REQUEST, getCompanies)]);
  yield all([takeLatest(actionTypes.CREATE_COMPANY_REQUEST, createCompany)]);
  yield all([takeLatest(actionTypes.UPDATE_COMPANY_REQUEST, updateCompany)]);
  yield all([takeLatest(actionTypes.DELETE_COMPANY_REQUEST, deleteCompany)]);
  yield all([takeLatest(actionTypes.SWITCH_COMPANY_REQUEST, switchCompany)]);
  yield all([takeLatest(actionTypes.CHECK_COMPANY_REQUEST, checkFields)]);
}
