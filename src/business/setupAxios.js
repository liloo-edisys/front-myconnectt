export default function setupAxios(axios, store) {
  axios.interceptors.request.use(
    config => {
      const {
        auth: { authToken }
      } = store.getState();

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // Add required headers for all API calls
      config.headers['X-Client-Type'] = 'webapp';
      config.headers['X-Api-Version'] = '2';

      return config;
    },
    err => Promise.reject(err)
  );
}
