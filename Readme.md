# **JWT (JSON Web Tokens)**

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