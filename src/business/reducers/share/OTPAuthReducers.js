import {
  SEND_OTP_REQUEST,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  AUTHENTICATE_OTP_REQUEST,
  AUTHENTICATE_OTP_SUCCESS,
  AUTHENTICATE_OTP_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  REVOKE_TOKEN_FAILURE,
  CLEAR_OTP_STATE
} from "../../actions/shared/OTPAuthActions";

const initialState = {
  user: null,
  userId: null,
  userName: null,
  tenantId: null,
  userRole: null,
  userType: null,
  accountId: null,
  applicantId: null,
  accessToken: null,
  loading: false,
  error: null,
  otpSent: false,
  isAuthenticated: false,
  email: null
};

function otpAuthReducer(state = initialState, action) {
  switch (action.type) {
    // Send OTP
    case SEND_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        otpSent: false,
        email: action.payload.email
      };

    case SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        otpSent: true,
        error: null
      };

    case SEND_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        otpSent: false,
        error: action.payload
      };

    // Authenticate with OTP
    case AUTHENTICATE_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        isAuthenticated: false
      };

    case AUTHENTICATE_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        userId: action.payload.userID || action.payload.userId,
        userName: action.payload.userName,
        tenantId: action.payload.tenantID || action.payload.tenantId,
        userRole: action.payload.userRole,
        userType: action.payload.userType,
        accountId: action.payload.accountID || action.payload.accountId,
        applicantId: action.payload.applicantID || action.payload.applicantId,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        error: null,
        otpSent: false
      };

    case AUTHENTICATE_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        error: action.payload
      };

    // Refresh Token
    case REFRESH_TOKEN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Revoke Token (Logout)
    case REVOKE_TOKEN_REQUEST:
      return {
        ...state,
        loading: true
      };

    case REVOKE_TOKEN_SUCCESS:
    case REVOKE_TOKEN_FAILURE:
      // Clear all auth data on logout (success or failure)
      return {
        ...initialState
      };

    // Clear State
    case CLEAR_OTP_STATE:
      return initialState;

    default:
      return state;
  }
}

export default otpAuthReducer;
