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

## Additional Notes

_Add more backend development notes below as you learn..._

