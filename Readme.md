# **Quick documentation of the API**

## JWT (JSON Web Tokens) Features
- **Installation of `jsonwebtoken`**
- **Token Generation During Login**
- Middleware to **Verify Tokens**
- **Refresh Token** Management for Long Sessions

## RESTful API for Authentication
- **Route `/auth/login`**: Login with username/password
- **Route `/auth/refresh`**: Refresh the token
- **Route `/auth/verify`**: Verify token validity
- **Route `/auth/logout`**: Logout

## RESTful API for admin
- **Route `/admin/invitations/generate`**: Generate an invitation code
- **Route `/admin/invitations/`**: List all invitations

## Database
- Installation of **MongoDB**
- User schema with the following fields:
  - `username`
  - `password` (hashed)
  - `created_at` (creation date)
  - `last_login` (last login date)
- **Seed Script** for Creating Test Users

## Additional Security (Recommended)
- **Password Hashing** with `bcrypt`
- **Rate Limiting** for Login Attempts
- Validation of Incoming Data
- Consistent Error Handling

## WebSocket Events
### Authentication
- Socket connection requires a valid JWT token in `auth.token`

### Server -> Client Events
- `users`: Sends the list of connected users
  ```typescript
  { id: string; username: string; }[]
  ```
- `incomingCall`: Notifies of an incoming call
  ```typescript
  { from: string; username: string; signalData: any; }
  ```
- `callAccepted`: Notifies that a call was answered
  ```typescript
  { from: string; signalData: any; }
  ```
- `callRejected`: Notifies that a call was rejected
  ```typescript
  { from: string; }
  ```
- `callEnded`: Notifies that a call was ended
  ```typescript
  { from: string; }
  ```
- `iceCandidate`: Receives ICE candidate for WebRTC
  ```typescript
  { from: string; candidate: RTCIceCandidate; }
  ```
- `userDisconnected`: Notifies when a user disconnects
  ```typescript
  { userId: string; }
  ```

### Client -> Server Events
- `callUser`: Initiates a call to another user
  ```typescript
  { targetUserId: string; signalData: any; }
  ```
- `answerCall`: Answers an incoming call
  ```typescript
  { targetUserId: string; signalData: any; }
  ```
- `rejectCall`: Rejects an incoming call
  ```typescript
  { targetUserId: string; }
  ```
- `endCall`: Ends an ongoing call
  ```typescript
  { targetUserId: string; }
  ```
- `iceCandidate`: Sends ICE candidate for WebRTC
  ```typescript
  { targetUserId: string; candidate: RTCIceCandidate; }
  ```

### Connection Flow
1. Client authenticates via REST `/auth/login`
2. Client connects to WebSocket with received JWT
3. Server authenticates socket connection
4. Server sends initial `users` event
5. WebRTC signaling can begin
