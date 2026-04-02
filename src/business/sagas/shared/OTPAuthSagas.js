import { call, put, takeLatest, all } from "redux-saga/effects";
import { toastr } from "react-redux-toastr";
import {
  SEND_OTP_REQUEST,
  AUTHENTICATE_OTP_REQUEST,
  REFRESH_TOKEN_REQUEST,
  REVOKE_TOKEN_REQUEST,
  sendOtpSuccess,
  sendOtpFailure,
  authenticateOtpSuccess,
  authenticateOtpFailure,
  refreshTokenSuccess,
  refreshTokenFailure,
  revokeTokenSuccess,
  revokeTokenFailure
} from "../../actions/shared/OTPAuthActions";
import {
  sendOtp as sendOtpApi,
  authenticateWithOtp as authenticateWithOtpApi
} from "../../api/shared/AuthApi";

/**
 * Saga: Send OTP code to user's email
 */
export function* sendOtpSaga({ payload }) {
  try {
    const { email } = payload;
    const response = yield call(sendOtpApi, email);
    yield put(sendOtpSuccess(response.data));

    toastr.success(
      "Code OTP envoyé",
      "Un code de vérification a été envoyé à votre adresse email"
    );
  } catch (error) {
    yield put(sendOtpFailure(error.response?.data || error.message));

    const errorMessage =
      error.response?.data?.message ||
      "Une erreur est survenue lors de l'envoi du code OTP";
    toastr.error("Erreur", errorMessage);
  }
}

/**
 * Saga: Authenticate user with OTP code
 */
export function* authenticateOtpSaga({ payload }) {
  try {
    const response = yield call(authenticateWithOtpApi, payload);
    yield put(authenticateOtpSuccess(response.data));

    toastr.success("Authentification réussie", "Vous êtes maintenant connecté");
  } catch (error) {
    yield put(authenticateOtpFailure(error.response?.data || error.message));

    const errorMessage =
      error.response?.data?.message || "Code OTP invalide ou expiré";
    toastr.error("Erreur d'authentification", errorMessage);
  }
}

/**
 * Saga: Refresh access token
 * Since tokens are stored in Redux state (not cookies), refresh is not supported
 * User will need to re-authenticate when token expires or page refreshes
 */
export function* refreshTokenSaga() {
  try {
    // No refresh mechanism - user needs to re-authenticate
    yield put(
      refreshTokenFailure({
        message: "Token refresh not supported. Please re-authenticate."
      })
    );

    console.log("Token refresh not supported with state-based auth");
  } catch (error) {
    yield put(refreshTokenFailure(error.response?.data || error.message));
    console.error("Token refresh error:", error);
  }
}

/**
 * Saga: Revoke user's tokens (logout)
 * Since tokens are stored in Redux state (not cookies), we only need to clear local state
 */
export function* revokeTokenSaga() {
  try {
    // Simply clear the Redux state - no API call needed since token is in state only
    yield put(revokeTokenSuccess());

    toastr.success(
      "Déconnexion réussie",
      "Vous avez été déconnecté avec succès"
    );
  } catch (error) {
    // Logout locally even if there's an error
    yield put(revokeTokenSuccess());

    toastr.info("Déconnexion", "Vous avez été déconnecté localement");
  }
}

/**
 * Root watcher saga
 */
export function* watchOTPAuthSagas() {
  yield all([
    takeLatest(SEND_OTP_REQUEST, sendOtpSaga),
    takeLatest(AUTHENTICATE_OTP_REQUEST, authenticateOtpSaga),
    takeLatest(REFRESH_TOKEN_REQUEST, refreshTokenSaga),
    takeLatest(REVOKE_TOKEN_REQUEST, revokeTokenSaga)
  ]);
}

export default watchOTPAuthSagas;
