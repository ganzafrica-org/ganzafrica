# Authentication Flow - Task Management Platform

## Overview
This document explains how authentication works when a user selects the Task Management platform after logging into the Portal.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

1. PORTAL LOGIN
   ┌─────────────┐
   │ User Login  │
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ POST /auth/login (Backend)                   │
   │ - Validates email/password                   │
   │ - Checks account status                      │
   │ - Generates JWT accessToken                  │
   │ - Returns token + user data                  │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Portal stores in localStorage:                │
   │ - accessToken (JWT)                           │
   │ - user (user object)                         │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Redirect to /platform-selection              │
   └──────────────────────────────────────────────┘

2. PLATFORM SELECTION
   ┌──────────────────────────────────────────────┐
   │ User clicks "Access Task Management"         │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Portal extracts from localStorage:           │
   │ - accessToken                                 │
   │ - user (JSON string)                         │
   │                                                │
   │ Creates URL:                                  │
   │ http://localhost:3003/auth-callback?          │
   │   token=<JWT>&user=<encoded_user_data>       │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ window.location.href = taskManagementUrl      │
   │ (Redirects to Task App)                       │
   └──────────────────────────────────────────────┘

3. TASK APP AUTH CALLBACK
   ┌──────────────────────────────────────────────┐
   │ GET /auth-callback?token=xxx&user=xxx        │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Task App auth-callback page:                  │
   │ - Extracts token from URL params              │
   │ - Extracts user from URL params               │
   │ - Stores in localStorage:                     │
   │   * accessToken                               │
   │   * user                                      │
   │   * task_user                                 │
   │ - Redirects to /board                         │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ AuthProvider Initializes                     │
   └──────┬───────────────────────────────────────┘

4. TASK APP INITIALIZATION
   ┌──────────────────────────────────────────────┐
   │ AuthProvider.initializeAuth()                 │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Calls fetchUserProfile()                     │
   │ GET /users/profile/me                        │
   │ Headers: Authorization: Bearer <token>       │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Backend authenticate middleware:              │
   │ - Extracts token from header                  │
   │ - Verifies JWT signature                     │
   │ - Decodes user ID from token                  │
   │ - Fetches user from database                  │
   │ - Checks account is_active                   │
   │ - Loads user roles                           │
   │ - Attaches req.user                          │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Backend returns fresh user profile            │
   └──────┬───────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────┐
   │ Task App:                                     │
   │ - Updates task_user in localStorage           │
   │ - Validates user role (blocks Alumni)        │
   │ - Sets user state                            │
   │ - User is authenticated! ✅                   │
   └──────────────────────────────────────────────┘
```

## Key Components

### 1. Portal Platform Selection
**File:** `apps/portal/app/platform-selection/page.tsx`
- Line 151-174: `handlePlatformSelect()` function
- Extracts token and user data from localStorage
- Creates redirect URL with authentication parameters
- Redirects to Task app's `/auth-callback` endpoint

### 2. Task App Auth Callback
**File:** `apps/task/app/auth-callback/page.tsx`
- Extracts `token` and `user` from URL query parameters
- Stores authentication data in localStorage
- Redirects to `/board` on success
- Redirects to portal login on failure

### 3. Task App Auth Provider
**File:** `apps/task/src/components/auth-provider.tsx`
- Initializes authentication on app load
- Calls `fetchUserProfile()` to validate token with backend
- Handles role-based access control (blocks Alumni users)
- Manages user state throughout the app

### 4. Backend Authentication Middleware
**File:** `backend/src/middlewares/auth.middleware.ts`
- `authenticate()` middleware function
- Verifies JWT token signature
- Fetches user from database
- Validates account status
- Loads user roles
- Attaches user object to `req.user`

### 5. API Client (Token Management)
**File:** `apps/task/src/lib/api-client.ts`
- Request interceptor adds `Authorization: Bearer <token>` header
- Checks token expiration
- Response interceptor handles 401 errors
- Redirects to portal login on authentication failure

### 6. Auth Utils
**File:** `apps/task/src/lib/auth-utils.ts`
- `fetchUserProfile()`: Calls backend to get fresh user profile
- `shouldBlockUser()`: Blocks Alumni users from accessing platform
- Role checking utilities

## Authentication Data Storage

### Portal App (localStorage)
- `accessToken`: JWT token from backend
- `user`: User object (JSON string)

### Task App (localStorage)
- `accessToken`: Same JWT token (passed from portal)
- `user`: User object
- `task_user`: User object (used by task app specifically)

## Security Features

1. **JWT Token Validation**: Backend verifies token signature on every API call
2. **Account Status Check**: Backend validates user is active
3. **Role-Based Access Control**: Task app blocks Alumni users
4. **Token Expiration**: Frontend checks token expiration before API calls
5. **Automatic Redirect**: On 401 errors, app redirects to portal login

## Error Handling

1. **Missing Token/User**: Redirects to portal login
2. **Invalid Token**: Backend returns 401, frontend redirects to portal login
3. **Inactive Account**: Backend returns 401, frontend redirects to portal login
4. **Alumni User**: Task app blocks access and redirects to portal login
5. **Token Expired**: Frontend clears token and redirects to portal login

## API Endpoints Used

1. **POST /auth/login**: Initial login (Portal → Backend)
2. **GET /users/profile/me**: Get user profile (Task App → Backend)
3. All task-related endpoints use `authenticate` middleware

## Environment Variables

- `NEXT_PUBLIC_PORTAL_URL`: Portal app URL (default: http://localhost:3001)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3002/api)

## User Flow Summary

1. User logs into Portal → Gets JWT token
2. User selects Task Management platform
3. Portal redirects to Task app with token + user data in URL
4. Task app stores token + user data in localStorage
5. Task app validates token with backend API
6. Backend verifies token and returns user profile
7. Task app initializes user session
8. User can now access Task Management features

