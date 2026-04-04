# Frontend Development Notes - Uber Clone

## React Context API

### What is Context?

Context is a **React feature** that allows you to share data across the entire component tree without having to pass props down manually at every level. It's like a **global state** that any component can access.

**Simple Analogy:**
- Think of Context as a "TV broadcasting system"
- The Context Provider is the TV station that broadcasts data
- Any component can be a receiver (consumer) and tune in to watch that data
- No need to pass the remote control (props) from person to person

### Why Do We Need Context?

#### **Problem: Prop Drilling**

Without Context, you have to pass props through every intermediate component:

```jsx
// Without Context - Prop Drilling Hell 😫
<App>                          // Has user data
  <Header user={user}>         // Doesn't need it, just passes down
    <Navigation user={user}>   // Doesn't need it, just passes down
      <UserProfile user={user}>  // Finally uses it!
      </UserProfile>
    </Navigation>
  </Header>
  <Main user={user}>           // Doesn't need it, just passes down
    <Sidebar user={user}>      // Doesn't need it, just passes down
      <UserCard user={user}>   // Finally uses it!
      </UserCard>
    </Sidebar>
  </Main>
</App>
```

This is called **"Prop Drilling"** - passing props through components that don't need them, just to get them to deeper components.

#### **Solution: Context API**

With Context, any component can access the data directly:

```jsx
// With Context - Clean and Simple 😊
<UserContext>                  // Provides user data
  <App>
    <Header>
      <Navigation>
        <UserProfile />        // Directly accesses user from Context!
      </Navigation>
    </Header>
    <Main>
      <Sidebar>
        <UserCard />           // Directly accesses user from Context!
      </Sidebar>
    </Main>
  </App>
</UserContext>
```

### When to Use Context?

✅ **Use Context For:**
- User authentication data (login status, user info)
- Theme settings (dark mode, light mode)
- Language/localization settings
- Shopping cart data
- Global app settings
- Data needed by many components

❌ **Don't Use Context For:**
- Local component state
- Data that only 1-2 components need
- Frequently changing data (can cause performance issues)
- Everything (use it wisely!)

---

## How to Use Context - Step by Step

### Step 1: Create the Context

```jsx
import { createContext } from 'react';

// Create a context with default value (optional)
const UserDataContext = createContext();
```

**What `createContext()` does:**
- Creates a Context object
- Returns an object with `Provider` and `Consumer` components
- Takes an optional default value

### Step 2: Create the Provider Component

```jsx
import React, { createContext, useState } from 'react';

const UserDataContext = createContext();

const UserContext = ({ children }) => {
    const [user, setUser] = useState({
        email: "",
        fullname: {
            firstname: "",
            lastname: ""
        }
    });

    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {children}
        </UserDataContext.Provider>
    );
}

export { UserContext, UserDataContext };
```

**Key Parts:**
- **`UserDataContext`**: The Context object
- **`UserContext`**: Provider wrapper component
- **`value`**: The data you want to share (user state and setter)
- **`{children}`**: All child components that will have access to the context

### Step 3: Wrap Your App with the Provider

```jsx
import { UserContext } from './context/UserContext';

function App() {
    return (
        <UserContext>  {/* Wrap your app */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/signup" element={<UserSignup />} />
            </Routes>
        </UserContext>
    );
}
```

**What this does:**
- Makes the Context available to all components inside
- Any component in the tree can now access user data

### Step 4: Consume the Context in Components

**Method 1: Using `useContext` Hook (Modern & Recommended)**

```jsx
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';

function UserProfile() {
    const { user, setUser } = useContext(UserDataContext);

    return (
        <div>
            <h1>Welcome, {user.fullname.firstname}!</h1>
            <p>Email: {user.email}</p>
        </div>
    );
}
```

**Method 2: Using Context Consumer (Old Way)**

```jsx
import { UserDataContext } from '../context/UserContext';

function UserProfile() {
    return (
        <UserDataContext.Consumer>
            {({ user, setUser }) => (
                <div>
                    <h1>Welcome, {user.fullname.firstname}!</h1>
                </div>
            )}
        </UserDataContext.Consumer>
    );
}
```

---

## Our Uber Project Implementation

### What We're Doing in Our Project

We're using Context API to manage **user authentication state** globally across the Uber clone application.

### Our Context Structure

**File: `src/context/UserContext.jsx`**

```jsx
import React, { createContext, useState } from 'react'

// 1. Create the Context
const UserDataContext = createContext();

// 2. Create Provider Component
const UserContext = ({children}) => {
    // 3. Define shared state
    const [user, setUser] = useState({
        email: "",
        fullname: {
            firstname: "",
            lastname: ""
        }
    })

    // 4. Provide state to children
    return (
        <UserDataContext.Provider value={[user, setUser]}>
            {children}
        </UserDataContext.Provider>
    )
}

export default UserContext
```

### How It Works in Our App

**1. Provider Wraps the App (App.jsx):**
```jsx
import UserContext from './context/UserContext';

<UserContext>
    <Routes>
        <Route path='/signup' element={<UserSignup/>}/>
        <Route path='/login' element={<UserLogin/>}/>
        {/* Other routes */}
    </Routes>
</UserContext>
```

**2. Any Component Can Access User Data:**

```jsx
// In UserSignup.jsx or any component
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';

function UserSignup() {
    const [user, setUser] = useContext(UserDataContext);

    const handleSignup = (formData) => {
        // Update global user state
        setUser({
            email: formData.email,
            fullname: {
                firstname: formData.firstName,
                lastname: formData.lastName
            }
        });
    };

    return (/* signup form */);
}
```

### Benefits in Our Uber Project

✅ **Single Source of Truth**: User data stored in one place  
✅ **No Prop Drilling**: Any component can access user info without passing props  
✅ **Persistent State**: User data persists across page navigation  
✅ **Easy Updates**: Update user data from anywhere, reflects everywhere  
✅ **Clean Code**: No cluttered props in intermediate components  

### Use Cases in Uber Clone

1. **After Login**: Store user authentication token and profile
2. **Navigation Header**: Display logged-in user's name
3. **Profile Page**: Show and edit user information
4. **Booking Page**: Access user details for ride booking
5. **Protected Routes**: Check if user is authenticated

---

## Context vs Props vs Redux

### When to Use What?

| Scenario | Use |
|----------|-----|
| **Small app, simple state sharing** | Context API ✅ |
| **Parent to immediate child** | Props ✅ |
| **Large app, complex state** | Redux/Zustand |
| **Authentication state** | Context API ✅ |
| **Component-specific state** | useState ✅ |

### Context API Advantages

✅ Built into React (no extra library)  
✅ Simple and easy to understand  
✅ Perfect for small to medium apps  
✅ Good for theming, auth, localization  

### Context API Limitations

⚠️ Can cause unnecessary re-renders if not optimized  
⚠️ Not ideal for frequently changing data  
⚠️ Large apps might need Redux for better dev tools  
⚠️ No built-in middleware like Redux  

---

## Best Practices

### 1. Split Contexts by Concern

```jsx
// ✅ Good - Separate contexts for different concerns
<UserContext>
    <ThemeContext>
        <CartContext>
            <App />
        </CartContext>
    </ThemeContext>
</UserContext>

// ❌ Bad - One giant context for everything
<GlobalContext>  // Contains user, theme, cart, everything
    <App />
</GlobalContext>
```

### 2. Export Both Context and Provider

```jsx
// ✅ Good
export { UserContext, UserDataContext };

// This allows:
import { UserContext } from './context/UserContext';  // For wrapping
import { UserDataContext } from './context/UserContext';  // For useContext
```

### 3. Create Custom Hooks

```jsx
// Custom hook for easier access
export const useUser = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUser must be used within UserContext');
    }
    return context;
};

// Usage
const { user, setUser } = useUser();  // Cleaner!
```

### 4. Optimize Re-renders

```jsx
// Split context if some data changes frequently
const UserContext = createContext();    // Rarely changes
const UserActionsContext = createContext();  // Changes often

// Components only re-render when their specific context changes
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting to Wrap with Provider

```jsx
// Wrong - Components can't access context
<App>
    <UserProfile />  // ❌ Won't work!
</App>

// Correct
<UserContext>
    <App>
        <UserProfile />  // ✅ Works!
    </App>
</UserContext>
```

### ❌ Mistake 2: Not Exporting Context Object

```jsx
// Wrong
const UserDataContext = createContext();
export default UserContext;  // Only exports Provider

// Correct
export { UserContext, UserDataContext };  // Export both!
```

### ❌ Mistake 3: Using Context for Everything

```jsx
// Wrong - Using context for local state
const [isModalOpen, setIsModalOpen] = useContext(ModalContext);

// Correct - Use local state
const [isModalOpen, setIsModalOpen] = useState(false);
```

---

## Quick Reference

### Complete Context Setup

**1. Create Context File (`context/UserContext.jsx`):**
```jsx
import { createContext, useState } from 'react';

export const UserDataContext = createContext();

export const UserContext = ({ children }) => {
    const [user, setUser] = useState(null);
    
    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {children}
        </UserDataContext.Provider>
    );
};
```

**2. Wrap App (`App.jsx`):**
```jsx
import { UserContext } from './context/UserContext';

function App() {
    return (
        <UserContext>
            <Routes>{/* routes */}</Routes>
        </UserContext>
    );
}
```

**3. Use in Component:**
```jsx
import { useContext } from 'react';
import { UserDataContext } from './context/UserContext';

function MyComponent() {
    const { user, setUser } = useContext(UserDataContext);
    return <div>{user?.email}</div>;
}
```

---

## Axios - HTTP Client Library

### What is Axios?

Axios is a **JavaScript HTTP client library** that makes it easy to send HTTP requests from your frontend to your backend API. It's a promise-based library that simplifies making API calls like GET, POST, PUT, DELETE, etc.

**Simple Analogy:**
- Think of Axios as a **"postman"** 📮
- You give it a letter (request) with an address (API endpoint)
- It delivers it to the backend server
- It waits for a reply (response) and brings it back to you
- Axios handles all the complexity of sending/receiving data

### Why Do We Need Axios?

#### **Without Axios (Using Fetch API - Raw)**

```javascript
// The old way - verbose and error-prone
fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
  .then(response => {
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

**Problems:**
- ❌ Lots of boilerplate code
- ❌ Need to manually set headers
- ❌ Need to manually stringify data
- ❌ Need to check response.ok manually
- ❌ Error handling is basic
- ❌ No request/response interceptors
- ❌ No timeout support by default

#### **With Axios (Clean & Simple)**

```javascript
// The Axios way - clean and readable
axios.post('http://localhost:3000/api/users/login', {
  email: 'user@example.com',
  password: 'password123'
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error.response?.data || error.message));
```

**Advantages:**
- ✅ Much less code
- ✅ Automatically sets Content-Type
- ✅ Automatically serializes data
- ✅ Better error handling
- ✅ Request/response interceptors
- ✅ Timeout support
- ✅ Request cancellation
- ✅ Works in Node.js and browsers

### How Axios Works

#### **Step 1: Import Axios**

```javascript
import axios from 'axios';
```

#### **Step 2: Make a Request**

Axios supports all HTTP methods:

**GET Request:**
```javascript
// Fetch data
axios.get('http://localhost:3000/api/users/profile')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

**POST Request:**
```javascript
// Send data to create something
axios.post('http://localhost:3000/api/users/register', {
  fullname: { firstname: 'John', lastname: 'Doe' },
  email: 'john@example.com',
  password: 'password123'
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

**PUT Request:**
```javascript
// Update data
axios.put('http://localhost:3000/api/users/123', {
  email: 'newemail@example.com'
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

**DELETE Request:**
```javascript
// Delete data
axios.delete('http://localhost:3000/api/users/123')
  .then(response => console.log('Deleted successfully'))
  .catch(error => console.error('Error:', error));
```

#### **Step 3: Handle Response**

```javascript
const handleRequest = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    
    // response object contains:
    console.log(response.status);        // 200
    console.log(response.data);          // { user: {...}, token: '...' }
    console.log(response.headers);       // { 'content-type': 'application/json' }
    console.log(response.config);        // Request config
    
  } catch (error) {
    // error object contains:
    console.log(error.response?.status); // 401
    console.log(error.response?.data);   // { message: 'Unauthorized' }
    console.log(error.message);          // 'Request failed with status code 401'
  }
};
```

### How We're Using Axios in Our Uber Project

#### **In UserSignup.jsx**

```javascript
import axios from "axios"

const handleSignup = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Prepare data
    const newUser = {
      fullname: {
        firstname: firstname,
        lastname: lastname,
      },
      password: password,
      email: email
    }
    
    // 2. Send POST request to backend
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}api/users/register`, 
      newUser
    )
    
    // 3. Handle success
    if(response.status === 201){
      const data = response.data
      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/home')
    }
  } catch (error) {
    // 4. Handle error
    console.error('Signup error:', error.response?.data || error.message)
    alert('Signup failed: ' + (error.response?.data?.message || error.message))
  }
}
```

**What's happening:**
1. Import axios
2. Create request data object
3. Use `axios.post()` to send data to backend `/api/users/register`
4. Wait for response with `await`
5. If successful (201), store user and redirect
6. If failed, catch error and show alert

#### **Request URL Breakdown**

```javascript
`${import.meta.env.VITE_BASE_URL}api/users/register`
```

Breaking it down:
- `import.meta.env.VITE_BASE_URL` = `http://localhost:3000/` (from .env file)
- `api/users/register` = endpoint path
- **Final URL**: `http://localhost:3000/api/users/register` ✅

---

## Axios Response Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| `200` | OK - Request succeeded | Proceed with data |
| `201` | Created - Resource created | Proceed (signup/register) |
| `400` | Bad Request - Invalid data | Show error to user |
| `401` | Unauthorized - Auth required | Redirect to login |
| `404` | Not Found - Resource doesn't exist | Show "not found" error |
| `500` | Server Error - Backend issue | Show error, contact support |

---

## Axios Configuration

### Default Configuration

```javascript
// Set default base URL
axios.defaults.baseURL = 'http://localhost:3000/';

// Set default headers
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Set timeout (in milliseconds)
axios.defaults.timeout = 5000;
```

### With Async/Await (Modern)

```javascript
const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/api/users/profile')
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
    throw error
  }
}
```

### With .then()/.catch() (Older Style)

```javascript
const fetchUserProfile = () => {
  return axios.get('/api/users/profile')
    .then(response => response.data)
    .catch(error => {
      console.error('Error:', error.response?.data || error.message)
      throw error
    })
}
```

---

## Common Axios Patterns

### 1. Login with Axios

```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('/api/users/login', {
      email,
      password
    })
    
    // Store token
    localStorage.setItem('token', response.data.token)
    
    // Set token for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
    
    return response.data
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message)
    throw error
  }
}
```

### 2. Making Authenticated Requests

```javascript
// After login, send token with every request
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

// Now all requests include the token
const response = await axios.get('/api/users/profile')
```

### 3. Error Handling Pattern

```javascript
try {
  const response = await axios.post('/api/endpoint', data)
  // Success
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Status:', error.response.status)
    console.error('Data:', error.response.data)
  } else if (error.request) {
    // Request made but no response
    console.error('No response:', error.request)
  } else {
    // Error in request setup
    console.error('Error:', error.message)
  }
}
```

---

## Axios vs Fetch API

| Feature | Axios | Fetch |
|---------|-------|-------|
| **Syntax** | Simpler | More verbose |
| **Auto JSON** | ✅ Yes | ❌ Manual |
| **Error Handling** | ✅ Better | ❌ Manual |
| **Request Cancel** | ✅ Yes | ⚠️ AbortController |
| **Timeout** | ✅ Yes | ❌ Not built-in |
| **Interceptors** | ✅ Yes | ❌ Need middleware |
| **Bundle Size** | ~13KB | Built-in (0KB) |
| **Browser Support** | Modern | All modern |

**When to use:**
- **Axios**: Full-featured apps, complex requests, modern projects
- **Fetch API**: Lightweight apps, no external deps, learning basics

---

## Best Practices

### ✅ DO:

1. **Always use try-catch with async/await**
   ```javascript
   try {
     const response = await axios.post('/api/endpoint', data)
   } catch (error) {
     // Handle error
   }
   ```

2. **Store tokens securely**
   ```javascript
   localStorage.setItem('token', response.data.token)
   ```

3. **Set authorization headers globally**
   ```javascript
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
   ```

4. **Handle errors gracefully**
   ```javascript
   catch (error) {
     const message = error.response?.data?.message || 'Something went wrong'
     alert(message)
   }
   ```

### ❌ DON'T:

1. **Don't forget e.preventDefault() in forms**
   ```javascript
   const handleSubmit = (e) => {
     e.preventDefault() // MUST DO THIS
     axios.post('/api/endpoint', data)
   }
   ```

2. **Don't expose API base URL in code**
   ```javascript
   // ❌ Bad
   axios.post('http://localhost:3000/api/endpoint', data)
   
   // ✅ Good
   axios.post(`${import.meta.env.VITE_BASE_URL}api/endpoint`, data)
   ```

3. **Don't ignore CORS errors (configure backend)**
   ```javascript
   // Add CORS in backend: app.use(cors())
   ```

4. **Don't store sensitive data in localStorage**
   ```javascript
   // ❌ Bad - password exposed
   localStorage.setItem('password', password)
   
   // ✅ Good - only token
   localStorage.setItem('token', token)
   ```

---

## Summary

**Axios is:**
- A **HTTP client library** for making API requests
- **Cleaner than Fetch API** with less boilerplate
- **Promise-based** and compatible with async/await
- **Auto-handles JSON** serialization/parsing
- **Better error handling** than Fetch
- **Essential for frontend-backend communication**

**In our Uber project:**
- Uses Axios to send login/signup data to backend
- Stores JWT tokens for authentication
- Makes GET requests for user profile
- Handles errors and shows user-friendly messages

_Add more frontend notes as you learn..._

