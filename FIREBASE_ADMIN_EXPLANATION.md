# Firebase Admin SDK Usage in Real Estate Platform

## What is Firebase Admin SDK?

Firebase Admin SDK is a server-side library that allows your backend to interact with Firebase services with administrative privileges. It's different from the client-side Firebase SDK.

## Why Firebase Admin SDK is Used in This Project

### 1. **Token Verification** (Primary Use)
- **Location**: `elevenbackend/utils/firebaseAdmin.js`
- **Purpose**: Verify Firebase ID tokens sent from the client
- **How**: When users login with Firebase (Google/Email), the frontend sends ID tokens to backend
- **Verification**: Backend uses Admin SDK to verify these tokens are authentic

```javascript
// Backend verifies tokens like this:
const decodedToken = await auth.verifyIdToken(idToken);
const uid = decodedToken.uid;
const email = decodedToken.email;
```

### 2. **Role-Based Access Control**
- **Purpose**: Assign roles (user, agent, admin) in backend database
- **Process**: After token verification, backend creates/updates user with specific role
- **Security**: Only backend can assign roles, not frontend

### 3. **User Management**
- **Auto-Creation**: When new users login, backend creates them in MongoDB
- **Data Sync**: Sync Firebase user data with MongoDB backend
- **Role Assignment**: Default role is "user", admin can upgrade to "agent" or "admin"

## How Authentication Flow Works

```
1. User logs in via Firebase (Google/Email) → Frontend
2. Frontend gets Firebase ID token
3. Frontend sends ID token to backend → POST /api/auth/login
4. Backend verifies token using Admin SDK
5. Backend creates/finds user in MongoDB
6. Backend assigns role (user/agent/admin)
7. Backend returns user data with role
8. Frontend stores user data with role-based permissions
```

## Environment Variables Required

```
FIREBASE_PROJECT_ID=void-5a292
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## Security Benefits

1. **Token Verification**: Prevents fake login attempts
2. **Server-Side Control**: Role assignment happens on backend only
3. **Data Integrity**: MongoDB users always have verified Firebase authentication
4. **Scalability**: Can handle millions of users with proper permissions

## Where Admin SDK is NOT Used

- **Frontend**: Uses regular Firebase SDK for authentication
- **Client-Side**: No admin privileges on frontend
- **User Actions**: Regular users cannot access admin functions

## Current Implementation

- ✅ Firebase Admin SDK initialized in backend
- ✅ Token verification working
- ✅ Auto-user creation in MongoDB
- ✅ Role-based access control
- ✅ Google authentication integration
- ✅ Email/password authentication support

The Firebase Admin SDK is essential for secure, scalable user authentication and authorization in this real estate platform.