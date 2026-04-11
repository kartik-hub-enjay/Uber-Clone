# Backend Development Notes - Uber Project

## CORS (Cross-Origin Resource Sharing)

### What is CORS?
CORS is a security mechanism that allows or restricts web applications running at one origin to access resources from a different origin.

### Why Do We Need CORS?

**Same-Origin Policy Problem:**
- Browsers enforce the Same-Origin Policy by default
- Blocks requests between different origins (domain, protocol, or port)
- Example:
  - Frontend: `http://localhost:3000` (React/Vue)
  - Backend: `http://localhost:5000` (Express)
  - Different ports = Different origins ❌
  - Browser blocks the request without CORS

### How CORS Works

1. **Response Headers:**
   - `Access-Control-Allow-Origin`: Specifies which origins can access the resource
   - `Access-Control-Allow-Methods`: Allowed HTTP methods (GET, POST, PUT, DELETE, etc.)
   - `Access-Control-Allow-Headers`: Allowed headers (Content-Type, Authorization, etc.)
   - `Access-Control-Allow-Credentials`: Whether cookies/auth tokens are allowed

2. **Preflight Requests:**
   - Browser sends an OPTIONS request first
   - Checks if the actual request is allowed
   - Server responds with allowed methods and headers
   - If approved, browser sends the actual request

3. **Simple vs Preflight Requests:**
   - **Simple requests**: GET, POST, HEAD with standard headers
   - **Preflight requests**: PUT, DELETE, custom headers, authentication

### Our Current Implementation

```javascript
const cors = require("cors");
app.use(cors());
```

**What this does:**
- Allows ALL origins (`*`) to access our API
- Good for: Development and testing
- Not recommended for: Production environments

### Production Configuration

**Basic Restriction:**
```javascript
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true // Allow cookies/auth headers
}));
```

**Multiple Origins:**
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-production-domain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Dynamic Origin Check:**
```javascript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = ['http://localhost:3000', 'https://your-production-domain.com'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

### Benefits of CORS

✅ **Security**: Controls who can access your API  
✅ **Flexibility**: Allows legitimate cross-origin requests  
✅ **Modern Web Apps**: Essential for SPA (Single Page Applications) + REST API architecture  
✅ **Resource Protection**: Prevents unauthorized access from unknown domains  
✅ **Credentials Support**: Can handle authentication tokens and cookies  

### Common CORS Errors

**Error: "No 'Access-Control-Allow-Origin' header"**
- Solution: Add `app.use(cors())` to your Express app

**Error: "CORS policy: Credentials flag is true"**
- Solution: Set `credentials: true` in CORS config and use specific origin (not `*`)

**Error: "Method not allowed by CORS"**
- Solution: Add the HTTP method to `methods` array in CORS config

### Best Practices

1. **Development**: Use `cors()` with no restrictions
2. **Production**: Always specify exact origins
3. **Authentication**: Use `credentials: true` with specific origins
4. **API Keys**: Include custom headers in `allowedHeaders`
5. **Security**: Never use `origin: '*'` with `credentials: true`

---

## Express Server vs http.createServer()

### Two Ways to Start a Server

**Method 1: Express Only (Simple)**
```javascript
const app = express();
app.listen(3000);
```

**Method 2: http.createServer + Express (Our Current Setup)**
```javascript
const app = express();
const server = http.createServer(app);
server.listen(3000);
```

### What's the Difference?

When you use `app.listen()`, Express internally does this:
```javascript
// app.listen(3000) is a shortcut for:
http.createServer(app).listen(3000);
```

**So `app.listen()` is just a convenience wrapper around `http.createServer()`!**

### Why Use http.createServer(app)?

We use `http.createServer(app)` when we need **direct access to the HTTP server instance** for advanced features:

#### 1. WebSockets (Socket.io) - Primary Reason
```javascript
const server = http.createServer(app);
const io = require('socket.io')(server);
// Essential for real-time features in Uber (live location tracking, ride updates)
```

#### 2. HTTPS Server
```javascript
const https = require('https');
const server = https.createServer(credentials, app);
```

#### 3. Server Management
```javascript
const server = http.createServer(app);
server.close(); // Gracefully shut down
server.setTimeout(30000); // Set custom timeouts
```

#### 4. Connection Event Handling
```javascript
server.on('connection', (socket) => {
    console.log('New connection established');
});
```

### Our Implementation

**app.js:**
```javascript
const express = require("express");
const app = express();
// Configure middleware and routes
module.exports = app;
```

**server.js:**
```javascript
const app = require("./app");
const http = require("http");
const server = http.createServer(app);
server.listen(PORT);
```

### Why This Setup for Uber Project?

✅ **Real-time Features**: Future Socket.io integration for live driver tracking  
✅ **Separation of Concerns**: app.js handles logic, server.js handles server startup  
✅ **Scalability**: Easy to add WebSockets, clustering, or graceful shutdown  
✅ **Professional Structure**: Industry-standard pattern for production apps  
✅ **Testing**: Easier to test app logic separately from server startup  

### Comparison

| Feature | `app.listen()` | `http.createServer(app)` |
|---------|----------------|--------------------------|
| **Simplicity** | ✅ Very simple, one-liner | ⚠️ Requires more setup |
| **WebSockets** | ❌ Can't attach Socket.io easily | ✅ Direct Socket.io support |
| **HTTPS** | ❌ Need workaround | ✅ Use `https.createServer()` |
| **Server Control** | ❌ Limited access | ✅ Full server instance access |
| **Event Handling** | ❌ Limited | ✅ Listen to server events |
| **Best For** | Simple REST APIs, Learning | Production apps, Real-time apps |

### How It Works

```javascript
const server = http.createServer(app);
```
1. Creates an HTTP server instance
2. Uses Express app as the request handler function
3. Returns server object for further configuration
4. Enables advanced features like WebSockets, custom timeouts, graceful shutdown

```javascript
server.listen(PORT)
```
1. Binds server to specified PORT
2. Starts listening for incoming HTTP connections
3. Passes all HTTP requests to Express app middleware chain
4. Keeps server running until manually stopped

### When to Use Which?

**Use `app.listen()`:**
- Simple REST APIs without real-time features
- Quick prototyping and learning
- No need for WebSockets or HTTPS
- Minimal requirements

**Use `http.createServer(app)`:**
- ✅ **Production applications** (like our Uber clone)
- Real-time features (Socket.io for live location, chat, notifications)
- Need HTTPS configuration
- Require server-level control (graceful shutdown, connection monitoring)
- Better code organization (separation of app logic and server startup)

### Best Practices

1. **Separate Files**: Keep app configuration (app.js) separate from server startup (server.js)
2. **Export App**: Export Express app for easier testing
3. **Environment Variables**: Use PORT from env variables for flexibility
4. **Error Handling**: Add error handlers for server startup failures
5. **Graceful Shutdown**: Implement cleanup logic when server stops

---

## Express Body Parsing Middleware

### express.urlencoded({extended: true})

### What It Does

Parses **URL-encoded data** from incoming requests and makes it available in `req.body`.

### What is URL-Encoded Data?

URL-encoded data is the format used when HTML forms are submitted:

```
firstname=John&lastname=Doe&email=john@example.com
```

**Content-Type:** `application/x-www-form-urlencoded`

### Two Middleware for Two Data Formats

```javascript
app.use(express.json());                      // Parses JSON data
app.use(express.urlencoded({extended:true})); // Parses form data
```

| Middleware | Parses | Content-Type | Example Source |
|------------|--------|--------------|----------------|
| `express.json()` | JSON data | `application/json` | Fetch/Axios, Mobile apps, REST APIs |
| `express.urlencoded()` | Form data | `application/x-www-form-urlencoded` | HTML forms, Form submissions |

### The `extended` Option Explained

**`extended: true`** - Uses `qs` library (more powerful)
- ✅ Can parse **nested objects** and arrays
- ✅ Supports complex data structures
- ✅ Recommended for modern applications
- Example: `user[name][first]=John` → `{user: {name: {first: "John"}}}`

**`extended: false`** - Uses `querystring` library (simpler)
- ❌ Cannot parse nested objects
- Only flat key-value pairs
- Faster but limited functionality
- Example: `name=John&age=25` → `{name: "John", age: "25"}`

### Real-World Examples

**HTML Form Submission:**
```html
<form action="/api/users/register" method="POST">
  <input name="fullname[firstname]" value="John">
  <input name="fullname[lastname]" value="Doe">
  <input name="email" value="john@example.com">
  <input name="password" value="password123">
  <button type="submit">Register</button>
</form>
```

**Without `express.urlencoded()`:**
```javascript
req.body // undefined ❌
// Cannot access form data at all
```

**With `express.urlencoded({extended: true})`:**
```javascript
req.body = {
  fullname: {
    firstname: "John",
    lastname: "Doe"
  },
  email: "john@example.com",
  password: "password123"
}
// Perfectly parsed nested structure ✅
```

**With `express.urlencoded({extended: false})`:**
```javascript
req.body = {
  "fullname[firstname]": "John",  // Not parsed as nested object ❌
  "fullname[lastname]": "Doe",
  email: "john@example.com",
  password: "password123"
}
// Cannot handle nested objects properly
```

### Why Use Both Middleware?

```javascript
app.use(express.json());                      // For API calls (JSON)
app.use(express.urlencoded({extended:true})); // For form submissions
```

Your API might receive data from multiple sources:

| Source | Data Format | Middleware Required |
|--------|-------------|---------------------|
| **React/Vue/Angular** | JSON | `express.json()` |
| **HTML Forms** | URL-encoded | `express.urlencoded()` |
| **Mobile Apps** | JSON | `express.json()` |
| **Postman/cURL** | Either | Both |
| **jQuery AJAX** | Either | Both |

### In Our Uber Project

**Our setup:**
```javascript
app.use(express.json());
app.use(express.urlencoded({extended:true}));
```

**Why we need both:**
1. **`express.json()`** - For modern frontend API calls (React/Vue sending JSON)
2. **`express.urlencoded()`** - For any HTML forms or traditional submissions
3. **`extended: true`** - Because user registration uses nested objects (`fullname.firstname`, `fullname.lastname`)

### How It Works Internally

**Request Flow:**
```
1. Client sends form data
   ↓
2. express.urlencoded() middleware intercepts request
   ↓
3. Reads Content-Type header
   ↓
4. If Content-Type is "application/x-www-form-urlencoded"
   ↓
5. Parses the request body using qs library (if extended: true)
   ↓
6. Adds parsed data to req.body
   ↓
7. Next middleware in chain receives req.body
```

### Comparison: With and Without

**Without Middleware (Raw Request):**
```javascript
// req.body is undefined
// Raw data in buffer: "fullname[firstname]=John&fullname[lastname]=Doe&email=john@example.com"
// You would need to manually parse this string
```

**With Middleware:**
```javascript
// req.body is automatically parsed
req.body.fullname.firstname // "John"
req.body.fullname.lastname  // "Doe"
req.body.email              // "john@example.com"
```

### Common Use Cases

**1. Traditional HTML Forms:**
```html
<form method="POST" action="/login">
  <input name="email" type="email">
  <input name="password" type="password">
  <button type="submit">Login</button>
</form>
```

**2. AJAX Form Submissions:**
```javascript
$.ajax({
  url: '/api/users/register',
  type: 'POST',
  data: {
    fullname: { firstname: 'John', lastname: 'Doe' },
    email: 'john@example.com'
  }
});
```

**3. URLSearchParams API:**
```javascript
const params = new URLSearchParams();
params.append('email', 'john@example.com');
params.append('password', 'password123');

fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params
});
```

### Best Practices

1. **Always use both** `express.json()` and `express.urlencoded()` for flexibility
2. **Use `extended: true`** for modern applications with nested data
3. **Place before routes** - middleware must be registered before route handlers
4. **Order matters** - register body parsers early in middleware chain
5. **Consider size limits** - Add limits to prevent large payloads:
   ```javascript
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ extended: true, limit: '10mb' }));
   ```

### Security Considerations

**Limit Payload Size:**
```javascript
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',              // Prevent huge payloads
  parameterLimit: 10000       // Limit number of parameters
}));
```

**Why limit?**
- Prevents DoS attacks with massive payloads
- Protects server memory
- Ensures consistent performance

### Summary Table

| Feature | Value |
|---------|-------|
| **Purpose** | Parse form data from HTML forms and URL-encoded requests |
| **Makes available** | `req.body` object with parsed data |
| **Data format** | `key=value&key2=value2` |
| **Extended: true** | Supports nested objects ✅ (uses `qs` library) |
| **Extended: false** | Only flat key-value pairs (uses `querystring`) |
| **Use with** | `express.json()` for complete coverage |
| **Order** | Must come before route handlers |
| **Required for** | HTML forms, traditional POST requests |

### Quick Reference

```javascript
// Basic setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// With security limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 10000 
}));
```

Without these middleware, you'd have to manually parse request bodies - these make your life much easier! 🎯

---

## Maps API - getCoordinates Flow

### Endpoint Overview

This endpoint converts a text address into latitude/longitude.

- Route path: `GET /maps/get-coordinates`
- Required query param: `address`
- Protected route: Yes (requires logged-in user token)

### Where It Is Implemented

1. Route layer: `Backend/routes/mapRoute.js`
2. Controller layer: `Backend/controllers/mapController.js`
3. Service layer: `Backend/services/mapsService.js`
4. Mounted in app: `Backend/app.js` using `app.use('/maps', mapsRoutes)`

### Full Request Lifecycle (Step by Step)

#### Step 1: Client sends request

Example request:

```http
GET /maps/get-coordinates?address=Connaught%20Place%20Delhi
Authorization: Bearer <jwt_token>
```

#### Step 2: Route validation runs (`mapRoute.js`)

Route applies:

```javascript
query('address').isString().isLength({ min: 3 })
```

Meaning:
- `address` must exist as query string
- It must be a string
- Minimum length must be 3

If validation fails, controller returns `400` with validation errors.

#### Step 3: Auth middleware runs (`authMiddelware.js`)

`authUser` checks:
- Token in cookie or `Authorization` header
- Token validity (JWT verify)
- Token not blacklisted

If auth fails, request is rejected with `401`.

#### Step 4: Controller handles business flow (`mapController.js`)

Controller logic:
1. Reads validation result with `validationResult(req)`
2. If errors -> `res.status(400).json({ errors })`
3. Reads `address` from `req.query`
4. Calls service: `mapService.getAddressCoordinate(address)`
5. If success -> `res.status(200).json(coordinates)`
6. If failure -> `res.status(404).json({ message: 'Coordinates not found' })`

#### Step 5: Service calls geocoding providers (`mapsService.js`)

Current implementation uses a **free two-layer geocoding strategy**:

1. **Primary**: OpenStreetMap Nominatim
2. **Fallback**: Photon (OpenStreetMap-based)

Service logic:
1. Normalize and validate input:
- Trim incoming address
- Reject if empty or too short (`< 3` chars)

2. Build URLs:

```javascript
// Primary
https://nominatim.openstreetmap.org/search?format=json&limit=1&q=<encoded-address>

// Fallback
https://photon.komoot.io/api/?q=<encoded-address>&limit=1
```

3. Primary request (Nominatim):
- Uses axios with `User-Agent` header (required by Nominatim policy)
- Uses timeout (`8000 ms`)
- If at least one result exists, return first match

4. Fallback request (Photon):
- Triggered only when Nominatim returns no results
- Reads coordinates from `features[0].geometry.coordinates` (`[lon, lat]`)
- Converts to app format

5. Return object in your app format:

```javascript
{ ltd: Number(lat), lng: Number(lng) }
```

6. If both providers fail -> throw `Unable to fetch coordinates`

### Response Contract in This Project

#### Success (`200`)

```json
{
  "ltd": 28.6304,
  "lng": 77.2177
}
```

#### Validation error (`400`)

```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "path": "address",
      "location": "query"
    }
  ]
}
```

#### Not found / geocoding failure (`404`)

```json
{
  "message": "Coordinates not found"
}
```

#### Invalid address in service (`404` currently)

If address is empty/too short, service throws `Invalid address`.
At the moment, controller catches all service errors and returns the same 404 response:

```json
{
  "message": "Coordinates not found"
}
```

### Why This Layered Design Is Good

1. Route handles request shape + middleware chain
2. Controller handles request/response logic and HTTP codes
3. Service handles third-party API details
4. Easier to swap providers (Google -> OpenStreetMap) without breaking route/controller

### Notes and Improvements

1. Key naming typo: `ltd` likely meant `lat`
   - Keep as-is for now because frontend may already depend on `ltd`
   - If you change it, update all consumers together

2. Better status split (optional):
   - Provider timeout/network issue could be `502`/`503` instead of `404`

3. Add small in-memory caching (optional):
   - Repeated same address lookups can be faster and reduce external API usage

4. Nominatim fair-use:
   - Keep valid User-Agent
   - Avoid aggressive high-frequency calling

5. Fallback behavior:
  - If Nominatim gives empty results, Photon is queried automatically
  - This improves success rate for short/ambiguous place names like "MG road"

### Quick Usage Example (Frontend Axios)

```javascript
const token = localStorage.getItem('token');

const res = await axios.get(
  `${import.meta.env.VITE_BASE_URL}maps/get-coordinates`,
  {
    params: { address: 'Connaught Place, Delhi' },
    headers: { Authorization: `Bearer ${token}` }
  }
);

console.log(res.data); // { ltd: ..., lng: ... }
```

---

## Additional Notes

_Add more backend development notes below as you learn..._

---

## Maps API - getDistanceTime Flow (Free Alternative to Google Distance Matrix)

### Endpoint Overview

This endpoint calculates **road distance** and **estimated travel time** between two addresses.

- Route path: `GET /maps/get-distance-time`
- Required query params: `origin`, `destination`
- Protected route: Yes (requires logged-in user token)
- Provider type: 100% free, no credit card

### Why This Implementation

Google Distance Matrix is paid in many production scenarios. To avoid cost while keeping similar behavior:

1. Geocode addresses (address -> coordinates) using free providers
2. Route coordinates (road distance/time) using free OSRM router

This gives practical Google-like output for an Uber-style app without billing.

### Where It Is Implemented

1. Route layer: `Backend/routes/mapRoute.js`
2. Controller layer: `Backend/controllers/mapController.js`
3. Service layer: `Backend/services/mapsService.js`

### Full Request Lifecycle (Step by Step)

#### Step 1: Client sends request

```http
GET /maps/get-distance-time?origin=Connaught%20Place%20Delhi&destination=India%20Gate%20Delhi
Authorization: Bearer <jwt_token>
```

#### Step 2: Route validation (`mapRoute.js`)

```javascript
query('origin').isString().isLength({ min: 3 })
query('destination').isString().isLength({ min: 3 })
```

If invalid -> `400` with validation errors.

#### Step 3: Auth middleware (`authMiddelware.js`)

`authUser` verifies token and blocks unauthorized requests.

#### Step 4: Controller (`mapController.js`)

Controller flow:
1. Validate request errors
2. Read `origin` and `destination` from `req.query`
3. Call service: `mapService.getDistanceTime(origin, destination)`
4. Return `200` with distance/time payload
5. On failure return `404` with message

#### Step 5: Service logic (`mapsService.js`)

Service performs a two-stage pipeline:

1. **Geocode both addresses**
   - Uses existing `getAddressCoordinate()`
   - Primary: Nominatim
   - Fallback: Photon

2. **Route using OSRM**
   - Calls: `https://router.project-osrm.org/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=false`
   - OSRM returns route distance (meters) and duration (seconds)

3. **Format output**
   - Distance text: meters/km
   - Duration text: mins/hr
   - Keeps raw numeric values for calculations in frontend

### Response Contract

#### Success (`200`)

```json
{
  "distance": {
    "text": "4.2 km",
    "value": 4245
  },
  "duration": {
    "text": "6 mins",
    "value": 337
  },
  "origin": {
    "address": "Connaught Place Delhi",
    "coordinates": {
      "ltd": 28.6314022,
      "lng": 77.2193791
    }
  },
  "destination": {
    "address": "India Gate Delhi",
    "coordinates": {
      "ltd": 28.6129332,
      "lng": 77.2294928
    }
  }
}
```

#### Validation failure (`400`)

```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "path": "origin",
      "location": "query"
    }
  ]
}
```

#### Not found / routing-geocoding failure (`404`)

```json
{
  "message": "Distance and time not found"
}
```

### Quick Frontend Usage Example

```javascript
const token = localStorage.getItem('token');

const res = await axios.get(
  `${import.meta.env.VITE_BASE_URL}maps/get-distance-time`,
  {
    params: {
      origin: 'Connaught Place, Delhi',
      destination: 'India Gate, Delhi'
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

console.log(res.data.distance.text); // e.g. "4.2 km"
console.log(res.data.duration.text); // e.g. "6 mins"
```

### Important Notes

1. This is road-based routing (not straight-line).
2. Public OSRM server is free but has fair-use limits.
3. For heavy production traffic, self-host OSRM or add retry/caching.
4. Key naming still uses `ltd` for compatibility with existing code.

---

## Maps API - getAutoCompleteSuggestions (Free Location Suggestions)

### Endpoint Overview

This endpoint provides address/location suggestions while user types in pickup/drop fields.

- Route path: `GET /maps/get-suggestions`
- Required query param: `input`
- Protected route: Yes (requires logged-in user token)
- Provider type: 100% free, no credit card

### Why This Endpoint

Google Places Autocomplete is paid in many cases. This endpoint gives a free autocomplete-like experience using OpenStreetMap ecosystem APIs.

### Where It Is Implemented

1. Route layer: `Backend/routes/mapRoute.js`
2. Controller layer: `Backend/controllers/mapController.js`
3. Service layer: `Backend/services/mapsService.js`

### Full Request Lifecycle

#### Step 1: Client sends request

```http
GET /maps/get-suggestions?input=Connaught
Authorization: Bearer <jwt_token>
```

#### Step 2: Route validation (`mapRoute.js`)

```javascript
query('input').isString().isLength({ min: 3 })
```

If invalid -> `400` with validation errors.

#### Step 3: Auth middleware (`authMiddelware.js`)

`authUser` verifies token and allows only authenticated requests.

#### Step 4: Controller (`mapController.js`)

Controller flow:
1. Reads validation errors
2. Extracts `input` from `req.query`
3. Calls `mapService.getAutoCompleteSuggestions(input)`
4. Returns `200` with suggestion list
5. Returns `404` if no suggestions found

#### Step 5: Service (`mapsService.js`)

Service strategy:

1. Normalize and validate input
   - Trim whitespace
   - Reject short values (`< 3`)

2. Primary provider: Photon
   - URL: `https://photon.komoot.io/api/?q=<input>&limit=5`
   - Better suited for search suggestion behavior

3. Fallback provider: Nominatim
   - Used only if Photon returns no suggestions
   - URL: `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=<input>`

4. Response mapping
   - Deduplicates by description
   - Returns max 5 suggestions
   - Output shape includes:
     - `description`
     - `placeId`
     - `ltd`
     - `lng`

### Response Contract

#### Success (`200`)

```json
[
  {
    "description": "Connaught Place, Delhi, India",
    "placeId": 561299050,
    "ltd": 28.6314022,
    "lng": 77.2193791
  }
]
```

#### Validation failure (`400`)

```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "path": "input",
      "location": "query"
    }
  ]
}
```

#### No suggestions (`404`)

```json
{
  "message": "Suggestions not found"
}
```

### Frontend Usage Example

```javascript
const token = localStorage.getItem('token');

const res = await axios.get(
  `${import.meta.env.VITE_BASE_URL}maps/get-suggestions`,
  {
    params: { input: 'Connaught' },
    headers: { Authorization: `Bearer ${token}` }
  }
);

console.log(res.data); // Array of suggestions
```

### Important Notes

1. This is free and works without billing/credit card.
2. Suggestion quality can differ from Google Places in some regions.
3. Apply debounce on frontend (e.g. 250-400ms) to avoid too many calls while typing.
4. Keep `ltd` key for compatibility with current frontend/backend conventions.

