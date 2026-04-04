import React from 'react'
import uberLogo from '../assets/uber-logo.png'
import uberHomeBg from "../assets/uber-home-bg.jpg"
import {Link} from "react-router-dom"

const Start = () => {
  return (
    <div>
        <div 
            className='h-screen w-full text-black flex flex-col justify-between bg-cover bg-center'
            style={{ backgroundImage: `url(${uberHomeBg})` }}
        >
            <div className='pt-3 pl-5'>
                <img className='w-20' src={uberLogo} alt="Uber Logo" />
            </div>
            
            <div className='bg-white py-4 px-4 pb-5'>
                <h2 className='text-2xl font-bold'>Get started with Uber</h2>
                <Link to="/login" className='flex items-center justify-center w-full bg-black text-white py-3 rounded mt-4.5 '>
                    Continue →
                </Link>
            </div>
        </div>
    </div>
  )
}

export default Start