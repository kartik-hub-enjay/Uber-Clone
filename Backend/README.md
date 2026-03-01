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

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `201` | User successfully created |
| `400` | Bad request - validation errors or missing fields |
| `500` | Internal server error |

---

## Authentication

After successful registration, use the returned JWT token for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

_More endpoints documentation coming soon..._
