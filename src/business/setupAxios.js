export default function setupAxios(axios, store) {
  // ============================================
  // Request Interceptor
  // ============================================
  axios.interceptors.request.use(
    config => {
      // Get access token from Redux state
      const {
        auth: { authToken }
      } = store.getState();

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // Add required headers for all API calls
      config.headers["X-Client-Type"] = "webapp";
      config.headers["X-Api-Version"] = "2";

      return config;
    },
    err => Promise.reject(err)
  );

  // ============================================
  // Response Interceptor - Handle 401
  // ============================================
  axios.interceptors.response.use(
    response => response,
    async error => {
      // If error is 401, redirect to login
      if (error.response?.status === 401) {
        // Dispatch logout action
        store.dispatch({ type: "REVOKE_TOKEN_SUCCESS" });

        // Redirect to appropriate login page
        const isBackoffice = window.location.href.includes("/backoffice");
        const isInterimaire = window.location.href.includes("/interimaire");

        let loginPath = "/auth";
        if (isBackoffice) {
          loginPath = "/auth-backoffice";
        } else if (isInterimaire) {
          loginPath = "/auth-interimaire";
        }

        window.location.href = loginPath + "/otp-request";
      }

      return Promise.reject(error);
    }
  );
}
