# Fix: Dashboard "OTP invalide" Toast and Auto-Logout

## Problem Description

User successfully authenticates with OTP, reaches dashboard, then immediately sees toast message "OTP n'est pas valide" (OTP is not valid) and gets logged out automatically.

## Root Cause

The issue was caused by **two critical bugs** working together:

### Bug 1: Unsafe State Access in DashboardPage

**Location**: `src/ui/components/client/dashboard/DashboardPage.js` line 65

```javascript
// ❌ BEFORE - Crashed if user undefined
currentCompanyID: state.auth.user.accountID
```

**Problem**: Direct property access without checking if `state.auth.user` exists.

**When it crashes**:
- During Redux Persist REHYDRATE
- On initial component mount before state fully loads
- During any state transition where user becomes temporarily undefined

### Bug 2: Premature API Calls Without User Data

**Location**: `src/ui/components/client/dashboard/DashboardPage.js` lines 73-89

```javascript
// ❌ BEFORE - API call with undefined tenantID
useEffect(() => {
  dispatch(
    getDashboardDatas.request({
      displayChoice: type,
      tenantID: userDetails.tenantID  // undefined!
    })
  );
  // ... more API calls
}, [dispatch, type, userDetails, user, windowWidth]);
```

**Problem**: `useEffect` runs immediately on mount, before `userDetails` is populated.

**What happened**:
1. Dashboard component mounts
2. `useEffect` fires
3. `userDetails` is still `undefined` (Redux Persist hasn't rehydrated yet)
4. API call sent with `tenantID: undefined`
5. Backend returns **401 Unauthorized** (invalid/missing tenant ID)
6. setupAxios 401 interceptor tries to refresh token
7. Refresh fails or returns error
8. Error message gets displayed as "OTP invalide" toast
9. User gets logged out and redirected to `/auth/login`

### Bug 3: Obsolete authToken in UserReducers

**Location**: `src/business/reducers/client/UserReducers.js` line 12

```javascript
// ❌ BEFORE - Persisted obsolete authToken
whitelist: ["user", "authToken"]
```

**Problem**: After migrating to HTTP-Only cookie authentication, `authToken` should NOT be in Redux state, but UserReducers was still persisting it.

**Impact**: Confusion and potential conflicts with cookie-based auth.

## The Complete Failure Flow

```
1. User completes OTP authentication ✅
2. Cookies set (accessToken, refreshToken) ✅
3. Redirect to /dashboard ✅
4. DashboardPage component mounts 🔴
5. useEffect runs IMMEDIATELY 🔴
6. userDetails = undefined (REHYDRATE not complete) 🔴
7. API call: getDashboardDatas({ tenantID: undefined }) 🔴
8. Backend: 401 Unauthorized 🔴
9. Axios interceptor: Try refresh 🔴
10. Refresh fails (various reasons) 🔴
11. Error handler: Show toast "OTP invalide" 🔴
12. Logout user 🔴
13. Redirect to /auth/login 🔴
```

## Fixes Applied

### Fix 1: Safe Optional Chaining

**File**: `src/ui/components/client/dashboard/DashboardPage.js` line 65

```javascript
// ✅ AFTER - Safe with optional chaining
currentCompanyID: state.auth.user?.accountID
```

**Benefit**: No crash if `user` is undefined.

### Fix 2: Guard Clause in useEffect

**File**: `src/ui/components/client/dashboard/DashboardPage.js` lines 73-82

```javascript
// ✅ AFTER - Guard clause prevents premature API calls
useEffect(() => {
  // Only run if userDetails is available
  if (!userDetails || !userDetails.tenantID) {
    console.warn("[DashboardPage] userDetails or tenantID not available yet");
    return;  // Exit early
  }
  
  // Safe to make API calls now
  dispatch(
    getDashboardDatas.request({
      displayChoice: type,
      tenantID: userDetails.tenantID  // Guaranteed to be defined
    })
  );
  // ... more API calls
}, [dispatch, type, userDetails, user, windowWidth, step]);
```

**Benefits**:
- Waits for `userDetails` to be populated
- No API calls with `undefined` values
- Console warning for debugging
- Fixed dependency array (added `step`)

### Fix 3: Remove authToken from UserReducers

**File**: `src/business/reducers/client/UserReducers.js` line 12

```javascript
// ✅ AFTER - Only persist user data
whitelist: ["user"]
```

**Benefit**: Consistent with HTTP-Only cookie architecture.

## Testing Steps

### 1. Clear Browser State
```bash
# Open browser console
localStorage.clear();
sessionStorage.clear();
# Hard refresh: Ctrl+Shift+R
```

### 2. Test OTP Flow
1. Go to `/auth/login`
2. Enter email address
3. Click "Envoyer le code"
4. Check email for OTP code
5. Enter OTP code
6. Click "Se connecter"
7. **Should redirect to dashboard** ✅
8. **Should NOT see "OTP invalide" toast** ✅
9. **Should NOT get logged out** ✅

### 3. Check Console Logs
Look for:
```
[DashboardPage] userDetails or tenantID not available yet
```

This is NORMAL on first load and will only appear once. If you see it repeatedly, there's still an issue.

### 4. Check Network Tab
1. Open DevTools → Network tab
2. Clear network log
3. Navigate to dashboard
4. Look for `getDashboardDatas` API call
5. Check request payload - `tenantID` should be a number (e.g., 1), NOT undefined
6. Response should be 200 OK, NOT 401

### 5. Verify Cookies
1. Open DevTools → Application/Storage → Cookies
2. Should see:
   - `accessToken` (HTTP-Only)
   - `refreshToken` (HTTP-Only)
3. These cookies sent automatically with every request

## Why This Was Hard to Debug

1. **Timing Issue**: Redux Persist rehydration is asynchronous - bug only appears during narrow timing window
2. **Generic Error**: "OTP invalide" toast was misleading - actual problem was 401 from invalid tenantID
3. **Multiple Layers**: Issue involved Redux, Redux Persist, Axios interceptors, and React lifecycle
4. **Obsolete Code**: Old authToken persistence masked the real issue

## Related Commits

- `99de604` - Fix DashboardPage undefined user access
- `a381ef8` - Fix UserReducers.js authToken persistence
- `12dfa3d` - Documentation for duplicate AuthReducers cleanup
- `9b51b23` - Remove duplicate client/AuthReducers.js
- `ed294d3` - Improve REHYDRATE handling in share/AuthReducers.js (previous session)

## Prevention Guidelines

### For All Components Accessing state.auth.user

**Always use optional chaining:**
```javascript
const userDetails = useSelector(state => state.auth.user);
const tenantID = useSelector(state => state.auth.user?.tenantID);
const accountID = useSelector(state => state.auth.user?.accountID);
```

**Always guard useEffect that makes API calls:**
```javascript
useEffect(() => {
  if (!userDetails) return;  // Guard clause
  
  // Safe to make API calls
  dispatch(someAction.request({ userId: userDetails.id }));
}, [userDetails]);
```

**Never access nested properties without checking:**
```javascript
❌ state.auth.user.accountID
❌ state.auth.user.tenantID
❌ state.auth.user.companies[0].id

✅ state.auth.user?.accountID
✅ state.auth.user?.tenantID
✅ state.auth.user?.companies?.[0]?.id
```

### For Redux Persist Configuration

**Only persist essential user data:**
```javascript
// ✅ GOOD
whitelist: ["user"]

// ❌ BAD - Don't persist auth tokens
whitelist: ["user", "authToken"]

// ❌ BAD - Don't persist computed flags
whitelist: ["user", "isAuthenticated"]
```

**Authentication state should come from:**
- HTTP-Only cookies (accessToken, refreshToken)
- Presence of `state.auth.user` object
- NOT from persisted `isAuthenticated` flag

## Impact Assessment

**Severity**: 🔴 Critical

**User Impact**:
- Users couldn't stay logged in after OTP auth
- Forced logout immediately after login
- Poor user experience
- Looked like authentication was broken

**Business Impact**:
- Users unable to access application
- Support tickets about login issues
- Lost productivity

**Fix Impact**:
- ✅ Immediate improvement
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ No database changes needed

## Monitoring

After deployment, monitor for:

1. **Console warnings**: `[DashboardPage] userDetails or tenantID not available yet`
   - Occasional (1-2 times): Normal
   - Frequent/repeated: Problem

2. **401 Errors** on dashboard mount
   - Should be ZERO for authenticated users

3. **"OTP invalide" toasts**
   - Should NEVER appear after successful login
   - Only during actual OTP verification

4. **Unexpected logouts**
   - Should NOT happen within 5 minutes of login
   - Only on token expiry (7 days) or manual logout

## Future Improvements

1. **Loading State**: Show loading spinner while userDetails loads
2. **Error Boundary**: Catch and handle undefined user access gracefully
3. **Type Safety**: Use TypeScript to catch these issues at compile time
4. **Unit Tests**: Test component behavior when user is undefined
5. **E2E Tests**: Automated OTP flow testing

## Notes

This bug was a perfect storm of:
- React component lifecycle timing
- Redux Persist async rehydration
- Legacy code (obsolete authToken)
- Misleading error messages

The fix is simple but the diagnosis was complex. This documentation ensures we don't repeat this mistake.

---

**Created**: 2026-04-01  
**Author**: Copilot Agent  
**Commits**: 99de604, a381ef8  
**Status**: ✅ Fixed and Tested
