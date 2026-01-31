# Sprint 1 - Authentication Flow Testing Guide

## Test Environment Status

### ✅ Backend Server
- **Status**: Running
- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **All API Tests**: PASSED ✅

### ✅ Frontend Server
- **Status**: Running
- **URL**: http://localhost:3000
- **Build**: Successful (No TypeScript errors)

### ✅ Database
- **PostgreSQL**: Running on port 5433
- **Migrations**: Applied successfully
- **Tables**: users, sessions, settings

### ✅ Implemented Features
- **Authentication**: Login, Register, Logout, JWT token management
- **Pages**:
  - `/login` - Login page
  - `/register` - Registration page
  - `/dashboard` - Dashboard with navigation and quick actions
  - `/sessions` - Sessions list (create, view, star, delete)
  - `/session/[id]` - Session detail (view, edit, delete)
  - `/settings` - User settings (view and update preferences)
- **Navigation**: Header with links to Dashboard, Sessions, Settings
- **Protected Routes**: All authenticated pages require login
- **State Management**: Zustand stores for auth and sessions

---

## Manual Testing Checklist

### Step 1: Initial Page Load
- [ ] Open http://localhost:3000 in browser
- [ ] Verify page loads without errors
- [ ] Check browser console for any errors (F12 → Console tab)
- [ ] Verify automatic redirect to `/login` page (for unauthenticated users)

### Step 2: User Registration Flow

**Test Case 2.1: Successful Registration**
- [ ] Navigate to registration page (should have link from login page)
- [ ] Fill in the form:
  - Email: `testuser@example.com`
  - Username: `testuser123` (alphanumeric + underscores only)
  - Password: `password123` (minimum 8 characters)
- [ ] Click "Register" button
- [ ] Verify success message or automatic login
- [ ] Verify redirect to dashboard page
- [ ] Check browser console - no errors
- [ ] Open DevTools → Application → Local Storage
  - Verify `auth-storage` contains: user, accessToken, refreshToken, isAuthenticated

**Test Case 2.2: Registration Validation**
- [ ] Try registering with invalid email → Should show error
- [ ] Try registering with username containing special chars → Should show error
- [ ] Try registering with password < 8 chars → Should show error
- [ ] Try registering with existing email → Should show "Email already registered" error

### Step 3: User Login Flow

**Test Case 3.1: Successful Login**
- [ ] Logout if currently logged in
- [ ] Navigate to `/login`
- [ ] Enter credentials:
  - Email: `testuser@example.com`
  - Password: `password123`
- [ ] Click "Login" button
- [ ] Verify successful login
- [ ] Verify redirect to `/dashboard`
- [ ] Verify user information displayed correctly (username, email)
- [ ] Check Local Storage for JWT tokens

**Test Case 3.2: Invalid Login**
- [ ] Try login with wrong password → Should show "Incorrect email or password"
- [ ] Try login with non-existent email → Should show error
- [ ] Try login with empty fields → Should show validation errors

### Step 4: Protected Routes Access

**Test Case 4.1: Authenticated Access**
- [ ] While logged in, navigate to `/dashboard`
- [ ] Verify page loads successfully
- [ ] Verify user data displayed (username, email, user ID)
- [ ] Navigate to `/sessions` (if exists)
- [ ] Navigate to `/settings` (if exists)
- [ ] All protected pages should load without redirect

**Test Case 4.2: Unauthenticated Access**
- [ ] Logout
- [ ] Try to access `/dashboard` directly
- [ ] Verify automatic redirect to `/login`
- [ ] Verify `returnUrl` parameter in URL (e.g., `/login?returnUrl=%2Fdashboard`)

### Step 5: Session Management ✅ IMPLEMENTED

**Test Case 5.1: Create Session**
- [ ] Login
- [ ] Navigate to `/sessions` page
- [ ] Click "New Session" button
- [ ] Fill in session name: "Test Chat Session"
- [ ] Select type: "chat" or "picture"
- [ ] Click "Create"
- [ ] Verify redirect to session detail page
- [ ] Verify session appears in sessions list

**Test Case 5.2: View Sessions List**
- [ ] Navigate to `/sessions`
- [ ] Verify all sessions are displayed
- [ ] Verify session cards show: name, type badge, created date
- [ ] Verify star and delete icons are visible

**Test Case 5.3: Update Session (Star/Unstar)**
- [ ] On sessions list, click star icon on a session
- [ ] Verify star fills in (becomes yellow)
- [ ] Click star again
- [ ] Verify star becomes unfilled (gray)

**Test Case 5.4: View Session Detail**
- [ ] Click on a session card
- [ ] Verify redirect to `/session/[id]`
- [ ] Verify session details displayed: name, type, ID, created date, updated date
- [ ] Verify action buttons: star, edit, delete

**Test Case 5.5: Edit Session Name**
- [ ] On session detail page, click edit button
- [ ] Modal opens with current session name
- [ ] Change name to "Updated Session Name"
- [ ] Click "Save"
- [ ] Verify success message
- [ ] Verify name updated on page

**Test Case 5.6: Delete Session**
- [ ] On session detail page, click delete button
- [ ] Confirmation modal appears
- [ ] Click "Delete"
- [ ] Verify redirect to `/sessions`
- [ ] Verify session removed from list

### Step 6: Settings Management ✅ IMPLEMENTED

**Test Case 6.1: View Settings**
- [ ] Navigate to `/settings` page
- [ ] Verify current settings displayed:
  - Language: en
  - Theme: system
  - Font Size: 14
- [ ] Verify additional info section shows: User ID, Last Updated

**Test Case 6.2: Update Settings**
- [ ] Change language to "Spanish" or another language
- [ ] Change theme to "dark"
- [ ] Change font size to 16
- [ ] Click "Save Settings"
- [ ] Verify success message appears
- [ ] Reload page
- [ ] Verify settings persisted (values remain as changed)

### Step 7: Logout Flow

**Test Case 7.1: Successful Logout**
- [ ] Click "Logout" button (in header or dashboard)
- [ ] Verify redirect to `/login` or home page
- [ ] Check Local Storage → `auth-storage` should be cleared or set to null
- [ ] Try accessing `/dashboard` → Should redirect to login
- [ ] Verify no authentication errors in console

### Step 8: Token Refresh (Advanced)

**Test Case 8.1: Automatic Token Refresh**
- [ ] Login successfully
- [ ] Wait for access token to expire (30 minutes) OR
- [ ] Manually trigger refresh by making API call after token expiry
- [ ] Verify automatic token refresh happens
- [ ] Verify user remains authenticated
- [ ] No logout or redirect should occur

### Step 9: Error Handling

**Test Case 9.1: Network Errors**
- [ ] Login successfully
- [ ] Stop the backend server (in terminal, press Ctrl+C)
- [ ] Try to create a session or update settings
- [ ] Verify appropriate error message shown
- [ ] Restart backend server
- [ ] Verify app recovers and works normally

**Test Case 9.2: API Errors**
- [ ] Check browser console for any API errors
- [ ] Verify all errors are handled gracefully
- [ ] No unhandled promise rejections

---

## Expected Results Summary

### ✅ Success Criteria
- [ ] All registration validations work correctly
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows appropriate error
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Authenticated users can access all protected routes
- [ ] JWT tokens stored correctly in Local Storage
- [ ] Logout clears tokens and redirects appropriately
- [ ] No console errors during normal operation
- [ ] UI is responsive and user-friendly
- [ ] All API calls include Authorization header when authenticated

### 📊 Test Results
**Date**: _____________
**Tester**: _____________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Initial Load | ⬜ Pass / ⬜ Fail | |
| Registration | ⬜ Pass / ⬜ Fail | |
| Login | ⬜ Pass / ⬜ Fail | |
| Protected Routes | ⬜ Pass / ⬜ Fail | |
| Logout | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |

---

## Issues Found

### Issue Template
```
**Issue #**: 
**Severity**: Critical / High / Medium / Low
**Component**: Frontend / Backend / Database
**Description**: 
**Steps to Reproduce**:
1. 
2. 
3. 
**Expected Behavior**: 
**Actual Behavior**: 
**Screenshots**: 
**Console Errors**: 
```

---

## Next Steps After Testing

1. Document all issues found
2. Fix critical and high-severity issues
3. Verify fixes with regression testing
4. Update this document with final test results
5. Proceed to Sprint 2 planning

