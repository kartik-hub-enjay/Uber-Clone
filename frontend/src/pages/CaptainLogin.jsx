import { React, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import uberLogo from "../assets/uber-logo.png";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from 'axios'

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { captain, setCaptain } = useContext(CaptainDataContext);

  const navigate = useNavigate()
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const captainData = {
        email: email,
        password: password,
      }
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/captains/login`,captainData)

      if(response.status == 200){
        const data = response.data
        localStorage.setItem('token',data.token)
        setCaptain(data.captain)
        navigate('/captain-home')
      }
       setEmail("");
        setPassword("");
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert(error.response?.data?.message || "Login failed")
    }
    
  };
  return (
    <div className="p-5 pt-3 h-screen flex flex-col justify-between ">
      <div>
        <div>
          <img className="w-15" src={uberLogo} alt="Uber Logo" />
        </div>
        <form
          onSubmit={(e) => {
            submitHandler(e);
          }}
        >
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 w-full text-lg placeholder:text-sm"
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
          <Link to="/captain-signup" className="text-blue-600">
            Register as a Captain
          </Link>
        </p>
      </div>

      <div>
        <Link
          to="/login"
          className="bg-[#305CDE] mb-3 flex items-center justify-center text-white font-semibold rounded px-4 py-2  w-full text-lg placeholder:text-sm"
        >
          Sign In as User
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
