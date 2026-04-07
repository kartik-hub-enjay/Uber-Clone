import React, { createContext, useState } from 'react'

export const CaptainDataContext = createContext();
export const CaptainContext = ({children}) => {
    const [captain,setCaptain] = useState({
        email:"",
        fullname:{
            firstname:"",
            lastname:""
        }, 
        status:"inactive",
        vehicle:{
            color:"",
            plate:"",
            capacity:0,
            vehicleType:""
        }
    })
  return (
    <div>
        <CaptainDataContext.Provider value={{captain,setCaptain}}>
        {children}
        </CaptainDataContext.Provider>
    </div>
  )
}
