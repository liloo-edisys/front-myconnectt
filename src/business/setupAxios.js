import { refreshTokenRequest, updateAccessToken } from "./actions/shared/OTPAuthActions";

const REFRESH_TOKEN_ENDPOINT = "/api/user/RefreshToken";
const PROACTIVE_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes in milliseconds (access token expires at 5 min)

let isRefreshing = false;
let failedQueue = [];
let refreshTimer = null;

const processQueue = error => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Start proactive token refresh timer
 * Refreshes token every 4 minutes to prevent 5-minute expiration
 */
const startProactiveRefresh = (axios, store) => {
  // Clear any existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Set up interval for proactive refresh
  refreshTimer = setInterval(async () => {
    try {
      console.log("Proactive token refresh triggered (4 minutes elapsed)");
      const response = await axios.post(
        REFRESH_TOKEN_ENDPOINT,
        {},
        {
          withCredentials: true
        }
      );
      console.log("Proactive token refresh successful");
      
      // Extract and update access token
      const newAccessToken = response.data?.accessToken || response.data?.AccessToken;
      if (newAccessToken && store) {
        console.log("Updating access token from proactive refresh");
        const { updateAccessToken } = require("./actions/shared/OTPAuthActions");
        store.dispatch(updateAccessToken(newAccessToken));
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
      // If proactive refresh fails, the 401 interceptor will handle it
    }
  }, PROACTIVE_REFRESH_INTERVAL);
};

/**
 * Stop proactive token refresh timer
 */
const stopProactiveRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

export default function setupAxios(axios, store) {
  // ============================================
  // Request Interceptor
  // ============================================
  axios.interceptors.request.use(
    config => {
      // Enable cookies to be sent with every request (for refresh token)
      config.withCredentials = true;

      // Get access token from Redux state
      const state = store.getState();
      const accessToken = state.auth?.accessToken;

      // Add access token to Authorization header if available
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log("[setupAxios] Added access token to Authorization header");
      } else {
        console.log("[setupAxios] No access token available in Redux state");
      }

      // Add required headers for all API calls
      config.headers["X-Client-Type"] = "webapp";
      config.headers["X-Api-Version"] = "2";

      return config;
    },
    err => Promise.reject(err)
  );

  // ============================================
  // Response Interceptor - Handle 401 and Token Refresh
  // ============================================
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // If error is not 401, or it's already a refresh token request, reject
      if (
        error.response?.status !== 401 ||
        originalRequest.url?.includes(REFRESH_TOKEN_ENDPOINT) ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Mark request as retry and start refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        console.log("[setupAxios] Attempting to refresh token due to 401 error");
        const refreshResponse = await axios.post(
          REFRESH_TOKEN_ENDPOINT,
          {},
          {
            withCredentials: true
          }
        );

        console.log("[setupAxios] Token refresh successful");
        
        // Extract new access token from refresh response
        const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.AccessToken;
        if (newAccessToken) {
          console.log("[setupAxios] New access token received, updating Redux state");
          store.dispatch(updateAccessToken(newAccessToken));
        } else {
          console.warn("[setupAxios] No access token in refresh response");
        }
        
        // Refresh successful - process queued requests
        processQueue(null);

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("[setupAxios] Token refresh failed:", refreshError);
        console.log("[setupAxios] Logging out user and redirecting to login");
        
        // Refresh failed - logout user
        processQueue(refreshError);

        // Stop proactive refresh timer
        stopProactiveRefresh();

        // Dispatch revoke token action (logout)
        store.dispatch({ type: "REVOKE_TOKEN_SUCCESS" });

        // Redirect to shared OTP login page
        // All user types (Client, BackOffice, Interimaire) now use the same OTP UI
        window.location.href = "/auth/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  // ============================================
  // Start Proactive Token Refresh
  // ============================================
  // Check if user is authenticated and start proactive refresh
  const state = store.getState();
  const isAuthenticated =
    state.otpAuth?.isAuthenticated || state.auth?.accessToken || state.auth?.user;

  if (isAuthenticated) {
    console.log("[setupAxios] User is authenticated, starting proactive refresh");
    startProactiveRefresh(axios, store);
  }

  // Listen to authentication state changes
  store.subscribe(() => {
    const currentState = store.getState();
    const currentlyAuthenticated =
      currentState.otpAuth?.isAuthenticated || 
      currentState.auth?.accessToken || 
      currentState.auth?.user;

    if (currentlyAuthenticated && !refreshTimer) {
      console.log("[setupAxios] Auth state changed to authenticated, starting proactive refresh");
      startProactiveRefresh(axios, store);
    } else if (!currentlyAuthenticated && refreshTimer) {
      console.log("[setupAxios] Auth state changed to unauthenticated, stopping proactive refresh");
      stopProactiveRefresh();
    }
  });
}

// Export for cleanup on unmount
export { stopProactiveRefresh };
