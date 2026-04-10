import React, { useRef, useState } from 'react'
import uberLogo from "../assets/uber-logo.png";
import {useGSAP} from "@gsap/react"
import gsap from "gsap"
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';

const Home = () => {
  const [pickup , setPickup] = useState('')
  const [destination,setDestination] = useState('')
  const [panelOpen,setPanelOpen] = useState(false)
  const [vehiclePanelOpen , setVehiclePanelOpen] = useState(false)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelOpenRef = useRef(null)

  const submitHandler = (e) =>{
    e.preventDefault();
  }

  useGSAP(function(){
    if(panelOpen){
      gsap.to(panelRef.current,{
        height:'70%',
        padding: 24
      })
      gsap.to(panelCloseRef.current,{
        opacity:1
      })
    }else{
      gsap.to(panelRef.current,{
        height:'0%',
        padding: 0
      })
      gsap.to(panelCloseRef.current,{
        opacity:0
      })
    }
  },[panelOpen])

  useGSAP(function(){
    if(vehiclePanelOpen){
      gsap.to(vehiclePanelOpenRef.current,{
        transform:'translateY(0)',
      })
    }else{
      gsap.to(vehiclePanelOpenRef.current,{
        transform:'translateY(100%)'
      })
    }
  })
  return (
    <div className='h-screen relative'>
       <img className="w-15 absolute m-3 mt-1" src={uberLogo} alt="Uber Logo" />
       <div className='w-screen'>
          {/* Image to be updated */}
          <img className="h-full w-full object-cover" src="https://www.medianama.com/wp-content/uploads/2018/06/Screenshot_20180619-112715.png.png" alt="" />
       </div>
       <div className=' flex flex-col justify-end h-screen absolute w-full top-0'>
          <div className='h-[30%] bg-white p-6 relative'>
            <h5 onClick={()=>{
              setPanelOpen(false)
            }} 
            className='absolute opacity-0 right-6 top-6 text-2xl'
            ref={panelCloseRef}
            >
              <i className='ri-arrow-down-wide-line'></i>
            </h5>
            <h4 className='text-2xl font-semibold'>Find a trip</h4>
          <form onSubmit={(e)=>{
            submitHandler(e);
          }}>
            <input  
            className='bg-[#eee] px-8 py-2 text-base rounded-lg w-full mt-4 focus:outline-none' type="text" 
            onClick={(e)=>{
              setPanelOpen(true)
            }}
            value={pickup}
            onChange={(e)=>{
              setPickup(e.target.value)
            }}
            placeholder="Add a pickup location"
             />
            <input
            className='bg-[#eee] px-8 py-2 text-base rounded-lg w-full mt-3 focus:outline-none' type="text"
            value={destination}
            onClick={(e)=>{
              setPanelOpen(true)
            }}
            onChange={(e)=>{
              setDestination(e.target.value)
            }}
            placeholder="Add a drop location"/>
          </form>
          </div>
          <div ref={panelRef} className='bg-white h-0'>
            <LocationSearchPanel  setPanelOpen={setPanelOpen}  setVehiclePanelOpen={setVehiclePanelOpen}/>
          </div>
       </div>
       <div ref={vehiclePanelOpenRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
            <VehiclePanel setVehiclePanelOpen={setVehiclePanelOpen}/>
       </div>
    </div>
  )
}
 
export default Home