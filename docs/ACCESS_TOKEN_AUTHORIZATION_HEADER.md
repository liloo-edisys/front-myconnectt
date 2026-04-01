# Access Token in Authorization Header

## Overview

The application now correctly sends the access token in the `Authorization: Bearer` header for all API calls, while keeping the refresh token in HTTP-Only cookies.

## Architecture

### Token Storage

| Token | Storage Location | Purpose | Accessible to JS |
|-------|-----------------|---------|------------------|
| **Access Token** | Redux state (`auth.accessToken`) | API authorization | ✅ Yes (needed for headers) |
| **Refresh Token** | HTTP-Only Cookie | Token refresh only | ❌ No (security) |

### Authentication Flow

```
┌─────────────┐
│ User Login  │
│   (OTP)     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend Response:                       │
│ - User Data                             │
│ - accessToken (in response body)        │
│ - refreshToken (Set-Cookie header)      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend Stores:                        │
│ - user → Redux (persisted)              │
│ - accessToken → Redux (NOT persisted)   │
│ - refreshToken → Cookie (HTTP-Only)     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ API Request:                            │
│ Headers:                                │
│   Authorization: Bearer <accessToken>   │
│   X-Client-Type: webapp                 │
│   X-Api-Version: 2                      │
│ Cookies: refreshToken (auto-sent)      │
└─────────────────────────────────────────┘
```

### Token Refresh Flow

```
┌──────────────┐
│ API Call     │
│ Returns 401  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ POST /api/user/RefreshToken            │
│ - Cookies: refreshToken (auto-sent)    │
│ - withCredentials: true                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend Response:                       │
│ - New accessToken (in response body)    │
│ - New refreshToken (Set-Cookie header)  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend Updates:                       │
│ - Redux: auth.accessToken = new token  │
│ - Cookie: refreshToken auto-updated    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Retry Failed Request                    │
│ - Authorization: Bearer <new token>     │
└─────────────────────────────────────────┘
```

## Implementation Details

### 1. Redux State Structure

```javascript
{
  auth: {
    user: { /* user data */ },         // Persisted
    accessToken: "eyJhbGc...",         // NOT persisted (security)
    loading: false
  },
  otpAuth: {
    isAuthenticated: true,
    // ...
  }
}
```

### 2. Request Interceptor (setupAxios.js)

```javascript
axios.interceptors.request.use(config => {
  // Get access token from Redux
  const accessToken = store.getState().auth?.accessToken;
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // Always send cookies (for refresh token)
  config.withCredentials = true;
  
  return config;
});
```

### 3. Response Interceptor (401 Handler)

```javascript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token
      const refreshResponse = await axios.post('/api/user/RefreshToken');
      
      // Extract new access token
      const newAccessToken = refreshResponse.data?.accessToken;
      
      // Update Redux
      store.dispatch(updateAccessToken(newAccessToken));
      
      // Retry original request
      return axios(originalRequest);
    }
  }
);
```

### 4. Proactive Token Refresh (Every 4 Minutes)

```javascript
setInterval(async () => {
  const response = await axios.post('/api/user/RefreshToken');
  const newAccessToken = response.data?.accessToken;
  
  if (newAccessToken) {
    store.dispatch(updateAccessToken(newAccessToken));
  }
}, 4 * 60 * 1000); // 4 minutes
```

## Testing

### 1. Verify Authorization Header After Login

**Browser DevTools → Network Tab:**

1. Clear all filters
2. Login with OTP
3. Navigate to dashboard
4. Find any API call (e.g., `getDashboardData`)
5. Click on request → Headers tab
6. Look for:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2. Verify Token in Redux State

**Browser Console:**

```javascript
// After login, check Redux state
window.__REDUX_DEVTOOLS_EXTENSION__ || console.log(
  JSON.stringify(window.store.getState().auth, null, 2)
);

// Should show:
{
  "user": { "userID": 123, ... },
  "accessToken": "eyJhbGc...",  // Present
  "loading": false
}
```

### 3. Verify Token Not in LocalStorage

**Browser DevTools → Application → Local Storage:**

- Check `persist:myconnectt-auth` key
- Should contain `user` data
- Should NOT contain `accessToken` (security)

### 4. Verify Token Refresh

**Browser Console:**

```javascript
// Monitor Redux state changes
let prevToken = null;
setInterval(() => {
  const currentToken = window.store.getState().auth?.accessToken;
  if (currentToken !== prevToken) {
    console.log('Access token changed!');
    console.log('Old:', prevToken?.substring(0, 20) + '...');
    console.log('New:', currentToken?.substring(0, 20) + '...');
    prevToken = currentToken;
  }
}, 1000);
```

Wait 4-5 minutes, should see token change.

### 5. Verify 401 Handling

**Simulate expired token:**

1. Browser Console:
   ```javascript
   // Set invalid token
   window.store.dispatch({
     type: 'UPDATE_ACCESS_TOKEN',
     payload: { accessToken: 'invalid-token' }
   });
   ```

2. Make an API call (navigate to different page)
3. Should see in Network tab:
   - First request: 401 Unauthorized
   - POST /api/user/RefreshToken
   - Retry of first request: 200 OK

## Troubleshooting

### Issue: Authorization Header is Empty

**Check:**
1. Redux state has `accessToken`:
   ```javascript
   console.log(window.store.getState().auth.accessToken);
   ```

2. If null after login:
   - Check browser console for OTPAuthSaga logs
   - Look for "Access token extracted: present/missing"
   - Backend might not be sending accessToken in response

**Fix:**
- Verify backend returns `accessToken` in response body
- Check field name (might be `AccessToken` with capital A)

### Issue: Token Not Updating After Refresh

**Check:**
1. Network tab → RefreshToken response
2. Response body should contain `accessToken`
3. Check console for "[setupAxios] New access token received"

**Fix:**
- Verify backend returns new token in refresh response
- Check field name case sensitivity

### Issue: "Cannot read property 'accessToken' of undefined"

**Check:**
- State structure might be different
- Try: `state.auth?.accessToken` (optional chaining)

**Fix:**
- Ensure auth reducer is properly registered in rootReducer
- Check Redux DevTools for state structure

## Security Considerations

### ✅ Good Practices Implemented

1. **Access Token NOT Persisted**
   - Stored in Redux (memory only)
   - Lost on page refresh → user must re-login
   - Prevents token theft from localStorage

2. **Refresh Token in HTTP-Only Cookie**
   - Not accessible to JavaScript
   - Protected from XSS attacks
   - Auto-sent by browser

3. **Short-Lived Access Token**
   - Expires in 5 minutes
   - Limits damage if stolen
   - Proactive refresh at 4 minutes

4. **Long-Lived Refresh Token**
   - 7 days validity
   - Used only for /RefreshToken endpoint
   - Can be revoked server-side

### ⚠️ Important Notes

1. **Page Refresh Loses Access Token**
   - User stays logged in (user data persisted)
   - First API call will fail with 401
   - Automatically refreshes token
   - Might see brief delay on page load

2. **Token Rotation**
   - Each refresh provides new tokens
   - Old tokens invalidated
   - Prevents replay attacks

3. **Logout Clears Everything**
   - Redux state reset
   - POST /RevokeToken invalidates refresh token
   - Cookie deleted by browser

## Backend Requirements

For this implementation to work, the backend must:

1. **Authentication Endpoint** (`/api/user/Authenticate`)
   ```json
   {
     "userID": 123,
     "userName": "John Doe",
     "email": "john@example.com",
     "tenantID": 1,
     "userType": 1,
     "accessToken": "eyJhbGc..."  // ← Required in response body
   }
   ```
   + Set-Cookie: refreshToken (HTTP-Only)

2. **Refresh Endpoint** (`/api/user/RefreshToken`)
   - Expects: refreshToken cookie
   - Returns:
   ```json
   {
     "accessToken": "eyJhbGc..."  // ← New token
   }
   ```
   + Set-Cookie: refreshToken (new one)

3. **API Endpoints** (all others)
   - Expect: `Authorization: Bearer <accessToken>` header
   - Validate token
   - Return 401 if invalid/expired

4. **Revoke Endpoint** (`/api/user/RevokeToken`)
   - Expects: refreshToken cookie
   - Invalidates token server-side
   - Clears cookie

## Migration from Cookie-Only Auth

### Before (Cookie-Only)
```javascript
// All tokens in cookies
// Backend validates cookies automatically
// No Authorization header needed
```

### After (Authorization Header)
```javascript
// Access token in Authorization header
// Refresh token in cookies
// Backend validates Authorization header for APIs
// Refresh endpoint uses cookie
```

### Benefits of New Approach

1. ✅ **Standard OAuth 2.0 Pattern**
   - Industry best practice
   - Compatible with most auth libraries

2. ✅ **Granular Control**
   - Can revoke access without affecting refresh
   - Different expiry times

3. ✅ **Better Security**
   - Access token in memory (not localStorage)
   - Refresh token in HTTP-Only cookie

4. ✅ **Mobile Compatibility**
   - Authorization header works on mobile apps
   - Cookies can be problematic

## Related Documentation

- [OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md) - OTP authentication flow
- [COOKIE_AUTHENTICATION_FLOW.md](./COOKIE_AUTHENTICATION_FLOW.md) - Cookie handling
- [FIX_DASHBOARD_OTP_TOAST_LOGOUT.md](./FIX_DASHBOARD_OTP_TOAST_LOGOUT.md) - Previous auth issues

---

**Created**: 2026-04-01  
**Author**: Copilot Agent  
**Commit**: 03c6c4e  
**Status**: ✅ Implemented
