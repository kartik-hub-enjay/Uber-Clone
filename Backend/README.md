# Uber Clone - Backend API Documentation

## Base URL
```
http://localhost:PORT
```

---

## User Endpoints

### 1. Register User

**Endpoint:** `POST /api/users/register`

**Description:**  
Registers a new user in the system. Creates a user account with hashed password and returns a JWT authentication token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Required Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `fullname.firstname` | String | Yes | Min 2 characters | User's first name |
| `fullname.lastname` | String | Optional | Min 3 characters | User's last name |
| `email` | String | Yes | Valid email format | User's email address (must be unique) |
| `password` | String | Yes | Min 6 characters | User's password (will be hashed) |

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4f3a",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

**Error Responses:**

**Status Code:** `400 Bad Request`

**1. Validation Errors:**
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "First name must be atleast 2 character long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "Password must be atleast 6 character long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**2. Missing Fields:**
```json
{
  "error": "All fields are required"
}
```

**Status Code:** `500 Internal Server Error`
```json
{
  "error": "Internal server error message"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Example Request (JavaScript Fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: {
      firstname: 'John',
      lastname: 'Doe'
    },
    email: 'john.doe@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

**Example Request (Axios):**
```javascript
const { data } = await axios.post('http://localhost:3000/api/users/register', {
  fullname: {
    firstname: 'John',
    lastname: 'Doe'
  },
  email: 'john.doe@example.com',
  password: 'password123'
});

console.log(data);
```

**Notes:**
- Password is automatically hashed using bcrypt before storing in database
- JWT token is returned in the response for authentication in subsequent requests
- Email must be unique (duplicate emails will result in an error)
- The token should be stored securely (localStorage, sessionStorage, or cookies)
- Use the token in Authorization header for protected routes: `Authorization: Bearer <token>`

---

### 2. Login User

**Endpoint:** `POST /api/users/login`

**Description:**  
Authenticates an existing user with email and password. Returns a JWT authentication token upon successful login.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Required Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | String | Yes | Valid email format | User's registered email address |
| `password` | String | Yes | Min 6 characters | User's password |

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4f3a",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

**Error Responses:**

**Status Code:** `400 Bad Request`

**Validation Errors:**
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must contain atleast 6 chars",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Status Code:** `401 Unauthorized`

**1. Invalid Email:**
```json
{
  "message": "Invalid email or password"
}
```

**2. Invalid Password:**
```json
{
  "message": "invalid password"
}
```

**Status Code:** `500 Internal Server Error`
```json
{
  "error": "Internal server error message"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Example Request (JavaScript Fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);

// Store token for future requests
localStorage.setItem('token', data.token);
```

**Example Request (Axios):**
```javascript
const { data } = await axios.post('http://localhost:3000/api/users/login', {
  email: 'john.doe@example.com',
  password: 'password123'
});

console.log(data);

// Store token for future requests
localStorage.setItem('token', data.token);
```

**Notes:**
- Password is compared with the hashed password stored in the database using bcrypt
- JWT token is returned in the response for authentication in subsequent requests
- User must be registered before attempting to login
- The token should be stored securely (localStorage, sessionStorage, or cookies)
- Use the token in Authorization header for protected routes: `Authorization: Bearer <token>`
- Token does not expire in current implementation (consider adding expiration in production)

---

### 3. Get User Profile

**Endpoint:** `GET /api/users/profile`

**Description:**  
Retrieves the authenticated user's profile information. This is a protected route that requires a valid JWT token.

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**OR**

Token can be sent via cookies with key `token`.

**Request Body:**  
No request body required.

**Authentication Required:** ✅ Yes

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f3a",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "socketId": null
}
```

**Error Responses:**

**Status Code:** `401 Unauthorized`

**1. Missing Token:**
```json
{
  "message": "Unauthorized"
}
```

**2. Invalid Token:**
```json
{
  "message": "Unauthorized"
}
```

**3. Expired Token:**
```json
{
  "message": "Unauthorized"
}
```

**Status Code:** `500 Internal Server Error`
```json
{
  "error": "Internal server error message"
}
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Request (JavaScript Fetch):**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const userData = await response.json();
console.log(userData);
```

**Example Request (Axios):**
```javascript
const token = localStorage.getItem('token');

const { data } = await axios.get('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(data);
```

**Example Request with Axios Interceptor:**
```javascript
// Set default authorization header for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Now you can make requests without manually adding the header
const { data } = await axios.get('http://localhost:3000/api/users/profile');
console.log(data);
```

**Notes:**
- This is a protected route - authentication token is required
- Token can be sent in two ways:
  1. **Authorization Header**: `Authorization: Bearer <token>` (Recommended)
  2. **Cookie**: Automatically sent if token was set as cookie during login
- The middleware verifies the JWT token and attaches the user to `req.user`
- Password field is excluded from the response (due to `select: false` in schema)
- Use this endpoint to verify if user is authenticated and get user details
- Common use case: Check authentication status on page load

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200` | Success - Login successful or profile retrieved |
| `201` | User successfully created |
| `400` | Bad request - validation errors or missing fields |
| `401` | Unauthorized - invalid credentials or missing/invalid token |
| `500` | Internal server error |

---

## Authentication

After successful registration, use the returned JWT token for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

_More endpoints documentation coming soon..._
