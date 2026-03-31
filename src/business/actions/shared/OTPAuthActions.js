// OTP Authentication Action Types
export const SEND_OTP_REQUEST = "SEND_OTP_REQUEST";
export const SEND_OTP_SUCCESS = "SEND_OTP_SUCCESS";
export const SEND_OTP_FAILURE = "SEND_OTP_FAILURE";

export const AUTHENTICATE_OTP_REQUEST = "AUTHENTICATE_OTP_REQUEST";
export const AUTHENTICATE_OTP_SUCCESS = "AUTHENTICATE_OTP_SUCCESS";
export const AUTHENTICATE_OTP_FAILURE = "AUTHENTICATE_OTP_FAILURE";

export const REFRESH_TOKEN_REQUEST = "REFRESH_TOKEN_REQUEST";
export const REFRESH_TOKEN_SUCCESS = "REFRESH_TOKEN_SUCCESS";
export const REFRESH_TOKEN_FAILURE = "REFRESH_TOKEN_FAILURE";

export const REVOKE_TOKEN_REQUEST = "REVOKE_TOKEN_REQUEST";
export const REVOKE_TOKEN_SUCCESS = "REVOKE_TOKEN_SUCCESS";
export const REVOKE_TOKEN_FAILURE = "REVOKE_TOKEN_FAILURE";

export const CLEAR_OTP_STATE = "CLEAR_OTP_STATE";

// ============================================
// Send OTP Actions
// ============================================

export function sendOtpRequest(email) {
  return {
    type: SEND_OTP_REQUEST,
    payload: { email }
  };
}

export function sendOtpSuccess(data) {
  return {
    type: SEND_OTP_SUCCESS,
    payload: data
  };
}

export function sendOtpFailure(error) {
  return {
    type: SEND_OTP_FAILURE,
    payload: error
  };
}

// ============================================
// Authenticate with OTP Actions
// ============================================

export function authenticateOtpRequest(data) {
  return {
    type: AUTHENTICATE_OTP_REQUEST,
    payload: data
  };
}

export function authenticateOtpSuccess(data) {
  return {
    type: AUTHENTICATE_OTP_SUCCESS,
    payload: data
  };
}

export function authenticateOtpFailure(error) {
  return {
    type: AUTHENTICATE_OTP_FAILURE,
    payload: error
  };
}

// ============================================
// Refresh Token Actions
// ============================================

export function refreshTokenRequest() {
  return {
    type: REFRESH_TOKEN_REQUEST
  };
}

export function refreshTokenSuccess() {
  return {
    type: REFRESH_TOKEN_SUCCESS
  };
}

export function refreshTokenFailure(error) {
  return {
    type: REFRESH_TOKEN_FAILURE,
    payload: error
  };
}

// ============================================
// Revoke Token Actions
// ============================================

export function revokeTokenRequest() {
  return {
    type: REVOKE_TOKEN_REQUEST
  };
}

export function revokeTokenSuccess() {
  return {
    type: REVOKE_TOKEN_SUCCESS
  };
}

export function revokeTokenFailure(error) {
  return {
    type: REVOKE_TOKEN_FAILURE,
    payload: error
  };
}

// ============================================
// Utility Actions
// ============================================

export function clearOtpState() {
  return {
    type: CLEAR_OTP_STATE
  };
}
