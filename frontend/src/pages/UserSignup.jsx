import React, { useState, useContext } from 'react'
import uberLogo from "../assets/uber-logo.png";
import { Link, useNavigate } from "react-router-dom";
import {  UserDataContext } from '../context/UserContext';
import axios from "axios"
// TODO : Understand axios (what it do , how it do , how to use it and why use we use it )
const UserSignup = () => {
  const [firstname,setFirstName] = useState("")
  const [lastname,setLastName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [userData,setUserData] = useState({})

  const {user, setUser} = useContext(UserDataContext)
  const navigate = useNavigate();
  const submitHandler = async (e)=>{
    e.preventDefault();
      const newUser = {
        fullname:{
          firstname:firstname,
          lastname:lastname,
        },
        password:password,
        email:email
      }
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/users/register`,newUser)
      if(response.status === 201){
        const data = response.data
        localStorage.setItem('token',data.token)
        setUser(data.user)
        navigate('/home') //TODO:Understand useNavigate
      }
      setEmail("")
      setFirstName("")
      setLastName("")
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
          <h3 className='text-lg font-medium mb-2'>What's your name?</h3>
          <div className='flex gap-4 mb-5'>
            <input
            className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-lg placeholder:text-sm "
            type="text"
            required
            placeholder="firstname"
            value={firstname}
            
            onChange={(e)=>{
              setFirstName(e.target.value)
            }}
          />
          <input
            className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-lg placeholder:text-sm "
            type="text"
            required
            placeholder="lastname"
            value={lastname}
            onChange={(e)=>{
              setLastName(e.target.value)
            }}
          />
          </div>
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-lg placeholder:text-sm"
           value={email}
           onChange={(e)=>{
              setEmail(e.target.value)
           }}
            type="email"
            required
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>

          <input
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-lg placeholder:text-sm"
            required
            type="password"
            placeholder="password"
            value={password}
            onChange={(e)=>{
              setPassword(e.target.value)
            }}
          />
          <button
            type="submit"
            className="bg-black mb-5 text-white  rounded px-4 py-2  w-full text-lg placeholder:text-sm"
          >
            SignUp
          </button>
        </form>
        <p className="text-center">
          Already have an Account?{" "}
          <Link to="/login" className="text-blue-600">
            Login here
          </Link>
        </p>
      </div>

      <div>
        
      </div>
    </div>
  )
}

export default UserSignup