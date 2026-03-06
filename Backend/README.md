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

### 4. Logout User

**Endpoint:** `GET /api/users/logout`

**Description:**  
Logs out the authenticated user by blacklisting their JWT token and clearing the authentication cookie. This is a protected route that requires a valid JWT token.

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
  "message": "Logged Out"
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

**3. Already Logged Out (Blacklisted Token):**
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
curl -X GET http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Request (JavaScript Fetch):**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/users/logout', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data); // { message: "Logged Out" }

// Clear token from storage
localStorage.removeItem('token');
```

**Example Request (Axios):**
```javascript
const token = localStorage.getItem('token');

const { data } = await axios.get('http://localhost:3000/api/users/logout', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(data); // { message: "Logged Out" }

// Clear token from storage
localStorage.removeItem('token');
```

**Complete Logout Flow Example:**
```javascript
async function logout() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/api/users/logout', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Remove token from storage
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

**Notes:**
- This is a protected route - authentication token is required
- The token is added to a **blacklist** in the database to prevent reuse
- The authentication cookie is cleared from the browser
- Blacklisted tokens are automatically deleted after **24 hours** using MongoDB TTL index
- Once logged out, the same token cannot be used again (even if not expired)
- After logout, make sure to:
  1. Remove token from localStorage/sessionStorage
  2. Clear any Redux/Vuex auth state
  3. Redirect user to login page
- Token can be sent via Authorization header or cookie (both work)
- The blacklist prevents security issues from stolen tokens

**How Token Blacklisting Works:**
1. User logs out
2. Server adds token to `blackListToken` collection
3. MongoDB TTL index automatically deletes entry after 24 hours
4. Future requests with this token are rejected by auth middleware
5. Database stays clean (no accumulation of old tokens)

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200` | Success - Login successful, profile retrieved, or logged out |
| `201` | Resource successfully created (User or Captain registered) |
| `400` | Bad request - validation errors, missing fields, or duplicate entry |
| `401` | Unauthorized - invalid credentials or missing/invalid token |
| `500` | Internal server error |

---

## Authentication

After successful registration, use the returned JWT token for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Captain Endpoints

### 1. Register Captain

**Endpoint:** `POST /api/captains/register`

**Description:**  
Registers a new captain (driver) in the system. Creates a captain account with vehicle details, hashed password, and returns a JWT authentication token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Smith"
  },
  "email": "jane.smith@example.com",
  "password": "password123",
  "vehicle": {
    "color": "Black",
    "plate": "ABC-1234",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

**Required Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `fullname.firstname` | String | Yes | Min 2 characters | Captain's first name |
| `fullname.lastname` | String | Optional | Min 3 characters | Captain's last name |
| `email` | String | Yes | Valid email format | Captain's email address (must be unique) |
| `password` | String | Yes | Min 6 characters | Captain's password (will be hashed) |
| `vehicle.color` | String | Yes | Not empty | Vehicle color |
| `vehicle.plate` | String | Yes | Not empty | Vehicle plate number (must be unique) |
| `vehicle.capacity` | Number | Yes | Min 1 | Vehicle passenger capacity |
| `vehicle.vehicleType` | String | Yes | One of: "car", "motorcycle", "auto" | Type of vehicle |

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "message": "Captain registered successfully",
  "captain": {
    "_id": "60d5ec49f1b2c72b8c8e4f3b",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Smith"
    },
    "email": "jane.smith@example.com",
    "status": "inactive",
    "vehicle": {
      "color": "Black",
      "plate": "ABC-1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**Status Code:** `400 Bad Request`

**1. Validation Errors:**
```json
{
  "errors": [
    {
      "msg": "First name is required",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password should contain at least 6 characters",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Vehicle color is required",
      "param": "vehicle.color",
      "location": "body"
    },
    {
      "msg": "Vehicle plate is required",
      "param": "vehicle.plate",
      "location": "body"
    },
    {
      "msg": "Vehicle capacity should be at least 1",
      "param": "vehicle.capacity",
      "location": "body"
    },
    {
      "msg": "Invalid vehicle type",
      "param": "vehicle.vehicleType",
      "location": "body"
    }
  ]
}
```

**2. Duplicate Email:**
```json
{
  "message": "Captain with this email already exists"
}
```

**Status Code:** `500 Internal Server Error`
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "Jane",
      "lastname": "Smith"
    },
    "email": "jane.smith@example.com",
    "password": "password123",
    "vehicle": {
      "color": "Black",
      "plate": "ABC-1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

**Example Request (JavaScript Fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/captains/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: {
      firstname: 'Jane',
      lastname: 'Smith'
    },
    email: 'jane.smith@example.com',
    password: 'password123',
    vehicle: {
      color: 'Black',
      plate: 'ABC-1234',
      capacity: 4,
      vehicleType: 'car'
    }
  })
});

const data = await response.json();
console.log(data);

// Store token for future requests
localStorage.setItem('captainToken', data.token);
```

**Example Request (Axios):**
```javascript
const { data } = await axios.post('http://localhost:3000/api/captains/register', {
  fullname: {
    firstname: 'Jane',
    lastname: 'Smith'
  },
  email: 'jane.smith@example.com',
  password: 'password123',
  vehicle: {
    color: 'Black',
    plate: 'ABC-1234',
    capacity: 4,
    vehicleType: 'car'
  }
});

console.log(data);

// Store token for future requests
localStorage.setItem('captainToken', data.token);
```

**Notes:**
- Password is automatically hashed using bcrypt before storing in database
- JWT token is returned with 24-hour expiration
- Both email and vehicle plate number must be unique
- Default captain status is "inactive" (changes to "active" when captain is available)
- Valid vehicle types: "car", "motorcycle", "auto"
- Vehicle capacity must be at least 1
- The token should be stored securely for authentication in subsequent requests
- Use the token in Authorization header for protected routes: `Authorization: Bearer <token>`

**Vehicle Types:**
- **car**: Standard 4-wheeler vehicle
- **motorcycle**: Two-wheeler vehicle  
- **auto**: Auto-rickshaw (3-wheeler)

---

_More endpoints documentation coming soon..._
