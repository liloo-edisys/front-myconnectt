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
import { requestUser } from "../../actions/shared/AuthActions";
import {
  sendOtp as sendOtpApi,
  authenticateWithOtp as authenticateWithOtpApi,
  refreshToken as refreshTokenApi,
  revokeToken as revokeTokenApi
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
    console.log("[OTPAuthSaga] Authenticating with OTP, payload:", payload);
    const response = yield call(authenticateWithOtpApi, payload);
    console.log("[OTPAuthSaga] Authentication successful, response:", response.data);
    
    yield put(authenticateOtpSuccess(response.data));
    
    // Also update the main auth reducer with user data to enable proper authorization
    // This allows Routes.js to recognize the user as authenticated
    // API returns user data directly in response.data (not nested under response.data.user)
    console.log("[OTPAuthSaga] Updating main auth reducer with user data");
    yield put(requestUser.success(response.data));

    toastr.success("Authentification réussie", "Vous êtes maintenant connecté");
  } catch (error) {
    console.error("[OTPAuthSaga] Authentication failed:", error);
    yield put(authenticateOtpFailure(error.response?.data || error.message));

    const errorMessage =
      error.response?.data?.message || "Code OTP invalide ou expiré";
    toastr.error("Erreur d'authentification", errorMessage);
  }
}

/**
 * Saga: Refresh access token using refresh token
 */
export function* refreshTokenSaga() {
  try {
    yield call(refreshTokenApi);
    yield put(refreshTokenSuccess());

    // Silent success - no toastr needed for automatic refresh
    console.log("Token refreshed successfully");
  } catch (error) {
    yield put(refreshTokenFailure(error.response?.data || error.message));

    // Only show error for manual refresh attempts
    // Automatic refresh failures are handled in setupAxios
    console.error("Token refresh failed:", error);
  }
}

/**
 * Saga: Revoke user's tokens (logout)
 */
export function* revokeTokenSaga() {
  try {
    yield call(revokeTokenApi);
    yield put(revokeTokenSuccess());

    toastr.success(
      "Déconnexion réussie",
      "Vous avez été déconnecté avec succès"
    );
  } catch (error) {
    yield put(revokeTokenFailure(error.response?.data || error.message));

    // Even if revoke fails, we should still logout on frontend
    console.error("Token revocation failed:", error);

    toastr.warning("Déconnexion", "Vous avez été déconnecté localement");
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
