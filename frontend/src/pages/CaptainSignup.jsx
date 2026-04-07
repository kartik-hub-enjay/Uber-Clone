import React, { useContext, useState } from 'react'
import uberLogo from "../assets/uber-logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {CaptainDataContext} from "../context/CaptainContext"

const CaptainSignup = () => {
  const [firstName,setFirstName] = useState("")
  const [lastName,setLastName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [vehicleColor,setVehicleColor] = useState("")
  const [vehicleType,setVehicleType] = useState("")
  const [vehiclePlate,setVehiclePlate] = useState("")
  const [vehicleCapacity,setVehicleCapacity] = useState("")

  const {captain,setCaptain} = useContext(CaptainDataContext)
  const navigate = useNavigate();

  const submitHandler = async (e)=>{
    e.preventDefault();

    try {
      const newCaptain = {
        fullname:{
          firstname:firstName,
          lastname:lastName
        },
        email:email,
        password:password,
        vehicle: {
          color: vehicleColor,
          plate: vehiclePlate,
          capacity: Number(vehicleCapacity),
          vehicleType: vehicleType
        }
      }

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/captains/register`, newCaptain)

      if(response.status === 201){
        const data = response.data
        localStorage.setItem('captainToken', data.token)
        setCaptain(data.captain)
        navigate('/captain-home')
      }

      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
      setVehicleColor("")
      setVehicleType("")
      setVehiclePlate("")
      setVehicleCapacity("")
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert(error.response?.data?.message || "Captain signup failed")
    }
  }
  return (
    <div className="px-5 pt-3 pb-2 h-screen flex flex-col justify-between">
      <div>
        <div>
          <img className="w-15" src={uberLogo} alt="Uber Logo" />
        </div>
        <form onSubmit={(e)=>{
          submitHandler(e)
        }}>
          <h3 className='text-base font-medium mb-1'>What's your name?</h3>
          <div className='flex gap-3 mb-3'>
            <input
            className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
            type="text"
            required
            placeholder="firstname"
            value={firstName}
            onChange={(e)=>{
              setFirstName(e.target.value)
            }}
          />
          <input
            className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
            type="text"
            required
            placeholder="lastname"
            value={lastName}
            onChange={(e)=>{
              setLastName(e.target.value)
            }}
          />
          </div>
          <h3 className="text-base font-medium mb-1">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-3 rounded px-4 py-2 w-full text-base placeholder:text-sm"
           value={email}
           onChange={(e)=>{
              setEmail(e.target.value)
           }}
            type="email"
            required
            placeholder="email@example.com"
          />

          <h3 className="text-base font-medium mb-1">Enter Password</h3>

          <input
            className="bg-[#eeeeee] mb-3 rounded px-4 py-2 w-full text-base placeholder:text-sm"
            required
            type="password"
            placeholder="password"
            value={password}
            onChange={(e)=>{
              setPassword(e.target.value)
            }}
          />

          <h3 className="text-base font-medium mb-1">Vehicle Details</h3>
          <div className='flex gap-3 mb-3'>
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
              type="text"
              required
              placeholder="vehicle color"
              value={vehicleColor}
              onChange={(e)=>{
                setVehicleColor(e.target.value)
              }}
            />
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
              type="text"
              required
              placeholder="vehicle plate"
              value={vehiclePlate}
              onChange={(e)=>{
                setVehiclePlate(e.target.value)
              }}
            />
          </div>

          <div className='flex gap-3 mb-3'>
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
              type="number"
              min="1"
              required
              placeholder="capacity"
              value={vehicleCapacity}
              onChange={(e)=>{
                setVehicleCapacity(e.target.value)
              }}
            />
            <select
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base"
              required
              value={vehicleType}
              onChange={(e)=>{
                setVehicleType(e.target.value)
              }}
            >
              <option value="" disabled>Select vehicle type</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-black mb-3 text-white rounded px-4 py-2 w-full text-base placeholder:text-sm"
          >
            SignUp
          </button>
        </form>
        <p className="text-center">
          Already have an Account?{" "}
          <Link to="/captain-login" className="text-blue-600">
            Login here
          </Link>
        </p>
      </div>

      <div>
        <Link
        to="/signup"
        className="bg-[#305CDE] mb-1 flex items-center justify-center text-white font-semibold rounded px-4 py-2 w-full text-base placeholder:text-sm">
          Sign Up as User
        </Link>
      </div>
    </div>
  )
}

export default CaptainSignup