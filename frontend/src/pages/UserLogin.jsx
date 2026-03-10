import React, { useState } from "react";
import uberLogo from "../assets/uber-logo.png";
import { Link } from "react-router-dom";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData,setUserData] = useState({})
  const submitHandler = (e) =>{
    setUserData({
      email:email,
      password:password
    })
    e.prventDefault();
    setEmail("")
    setPassword("")
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
