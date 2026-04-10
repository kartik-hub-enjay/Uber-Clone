import React, { useContext, useEffect, useState } from 'react'
import {CaptainDataContext} from '../context/CaptainContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
const CaptainProtectedWrapper = ({children}) => {
    const token = localStorage.getItem('captainToken') || localStorage.getItem('token')
    const {captain,setCaptain} = useContext(CaptainDataContext)
    const [isLoading,setIsLoading] = useState(true)
    const navigate = useNavigate()
    useEffect(()=>{
        if(!token){
            navigate("/captain-login")
            return
        }
        axios.get(`${import.meta.env.VITE_BASE_URL}api/captains/profile`,{
            headers: {
                Authorization : `Bearer ${token}`
            }
        }).then((response) =>{
            if(response.status === 200){
                setCaptain(response.data.captain)
                setIsLoading(false)
            }
            
        }).catch((err)=>{
            console.log(err)
            localStorage.removeItem('captainToken')
            localStorage.removeItem('token')
            navigate("/captain-login")
        })
    },[token, navigate, setCaptain])
    if(isLoading){
        return <div>Loading ...</div>
    }
  return (
    <div>{children}</div>
  )
}

export default CaptainProtectedWrapper