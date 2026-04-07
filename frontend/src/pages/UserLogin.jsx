import React, { useState , useContext} from "react";
import uberLogo from "../assets/uber-logo.png";
import { Link,useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios"

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  const {user,setUser} = useContext(UserDataContext)
  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevent form reload
    
    try {
      const userData = {
        email: email,
        password: password
      }

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/users/login`, userData)

      if(response.status == 200){
        const data = response.data
        localStorage.setItem('token',data.token)
        setUser(data.user)
        navigate('/home')
      }
      
      setEmail("")
      setPassword("")
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert(error.response?.data?.message || "Login failed")
    }
  }
  return (
    <div className="p-5 pt-3 h-screen flex flex-col justify-between ">
      <div>
        <div>
          <img className="w-15" src={uberLogo} alt="Uber Logo" />
        </div>
        <form onSubmit={(e)=>{
          submitHandler(e)
        }}>
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-sm"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            required
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>

          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-sm"
            required
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <button
            type="submit"
            className="bg-black mb-5 text-white  rounded px-4 py-2  w-full text-lg placeholder:text-sm"
          >
            Login
          </button>
        </form>
        <p className="text-center">
          New here?{" "}
          <Link to="/signup" className="text-blue-600">
            Create new Account
          </Link>
        </p>
      </div>
 
      <div>
        <Link 
        to="/captain-login" 
        className="bg-[#EFBF04] mb-3 flex items-center justify-center text-white font-semibold rounded px-4 py-2  w-full text-lg placeholder:text-sm">
          Sign In as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
