import * as actionTypes from "constants/constants";

import { getMailTemplates as getMailTemplatesApi } from "../../api/backoffice/MailTemplatesApi";
import { updateMailTemplate as updateMailTemplateApi } from "../../api/backoffice/MailTemplatesApi";
import { getMailTemplateCategories as getMailTemplateCategoriesApi } from "../../api/backoffice/MailTemplatesApi";
import { getMailTemplates as getMailTemplatesActions } from "../../actions/backoffice/mailTemplatesActions";
import { updateMailTemplate as updateMailTemplateActions } from "../../actions/backoffice/mailTemplatesActions";
import { getMailTemplateCategories as getMailTemplateCategoriesActions } from "../../actions/backoffice/mailTemplatesActions";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { toastr } from "react-redux-toastr";

export function* getMailTemplates(data) {
  try {
    const response = yield call(getMailTemplatesApi, data.payload);
    yield put(getMailTemplatesActions.success(response));
  } catch (error) {
    yield put(getMailTemplatesActions.failure(error));
  }
}

export function* updateMailTemplate(data) {
  try {
    const response = yield call(updateMailTemplateApi, data.payload);
    yield put(updateMailTemplateActions.success(data.payload));
    if (response.status === 200) {
      toastr.success(
        "Succès",
        "La modification du modèle de mail a été effectuée."
      );
    }
  } catch (error) {
    yield put(updateMailTemplateActions.failure(error));
    toastr.error(
      "Erreur",
      "Une erreur est survenue lors de la modification du modèle de mail."
    );
  }
}

export function* getMailTemplateCategories(data) {
  try {
    const response = yield call(getMailTemplateCategoriesApi, data.payload);
    yield put(getMailTemplateCategoriesActions.success(response));
  } catch (error) {
    yield put(getMailTemplateCategoriesActions.failure(error));
  }
}

export default function* MailTemplatesSagas() {
  yield all([
    takeLatest(actionTypes.GET_MAIL_TEMPLATES_REQUEST, getMailTemplates)
  ]);
  yield all([
    takeLatest(actionTypes.PUT_MAIL_TEMPLATE_REQUEST, updateMailTemplate)
  ]);
  yield all([
    takeLatest(
      actionTypes.GET_MAIL_TEMPLATE_CATEGORIES_REQUEST,
      getMailTemplateCategories
    )
  ]);
}
