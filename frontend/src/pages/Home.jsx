import React, { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';
import uberLogo from '../assets/uber-logo.png'


const Home = () => {
    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    const pickupDebounceRef = useRef(null)
    const destinationDebounceRef = useRef(null)
    const pickupAbortRef = useRef(null)
    const destinationAbortRef = useRef(null)
    const [ vehiclePanel, setVehiclePanel ] = useState(false)
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
    const [ vehicleFound, setVehicleFound ] = useState(false)
    const [ waitingForDriver, setWaitingForDriver ] = useState(false)
    const [ pickupSuggestions, setPickupSuggestions ] = useState([])
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
    const [ activeField, setActiveField ] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    useEffect(() => {
        socket.emit("join", { userType: "user", userId: user._id })
    }, [ user ])

    useEffect(() => {
        return () => {
            if (pickupDebounceRef.current) clearTimeout(pickupDebounceRef.current)
            if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current)
            if (pickupAbortRef.current) pickupAbortRef.current.abort()
            if (destinationAbortRef.current) destinationAbortRef.current.abort()
        }
    }, [])

    socket.on('ride-confirmed', ride => {


        setVehicleFound(false)
        setWaitingForDriver(true)
        setRide(ride)
    })

    socket.on('ride-started', ride => {
        console.log("ride")
        setWaitingForDriver(false)
        navigate('/riding', { state: { ride } }) // Updated navigate to include ride data
    })


    const handlePickupChange = async (e) => {
        const value = e.target.value
        setPickup(value)
        setPanelOpen(true)
        setActiveField('pickup')

        if (pickupDebounceRef.current) clearTimeout(pickupDebounceRef.current)
        if (pickupAbortRef.current) pickupAbortRef.current.abort()

        if (value.trim().length < 3) {
            setPickupSuggestions([])
            return
        }

        pickupDebounceRef.current = setTimeout(async () => {
            const controller = new AbortController()
            pickupAbortRef.current = controller

            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/maps/get-suggestions`, {
                    params: { input: value },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    signal: controller.signal
                })
                setPickupSuggestions(response.data)
            } catch (error) {
                if (error?.code !== 'ERR_CANCELED') {
                    setPickupSuggestions([])
                }
            }
        }, 350)
    }

    const handleDestinationChange = async (e) => {
        const value = e.target.value
        setDestination(value)
        setPanelOpen(true)
        setActiveField('destination')

        if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current)
        if (destinationAbortRef.current) destinationAbortRef.current.abort()

        if (value.trim().length < 3) {
            setDestinationSuggestions([])
            return
        }

        destinationDebounceRef.current = setTimeout(async () => {
            const controller = new AbortController()
            destinationAbortRef.current = controller

            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/maps/get-suggestions`, {
                    params: { input: value },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    signal: controller.signal
                })
                setDestinationSuggestions(response.data)
            } catch (error) {
                if (error?.code !== 'ERR_CANCELED') {
                    setDestinationSuggestions([])
                }
            }
        }, 350)
    }

    const submitHandler = (e) => {
        e.preventDefault()
    }

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
                // opacity:1
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
                // opacity:0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])


    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(110%)'
            })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(110%)'
            })
        }
    }, [ confirmRidePanel ])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(110%)'
            })
        }
    }, [ vehicleFound ])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(110%)'
            })
        }
    }, [ waitingForDriver ])


    async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/rides/get-fare`, {
            params: { pickup, destination },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })


        setFare(response.data)


    }

    async function createRide() {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/rides/create`, {
                pickup,
                destination,
                vehicleType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
        } catch (error) {
            console.error('Create ride failed:', error?.response?.data || error.message)
            setVehicleFound(false)
            setConfirmRidePanel(true)
        }
    }

    return (
        <div className='h-screen relative overflow-hidden'>
            <div className='absolute inset-0 z-0'>
                <LiveTracking />
            </div>

            { !panelOpen && <img className='w-16 absolute left-5 top-5 z-30' src={uberLogo} alt="" /> }

            <div className='absolute inset-0 z-20 flex flex-col justify-end'>
                <div className='h-[34%] min-h-65 p-6 pb-5 bg-white relative shadow-2xl'>
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false)
                    }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <input
                            onFocus={() => {
                                setPanelOpen(true)
                                setActiveField('pickup')
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onFocus={() => {
                                setPanelOpen(true)
                                setActiveField('destination')
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3'
                            type="text"
                            placeholder='Enter your destination' />
                    </form>
                    <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-3 rounded-lg mt-4 w-full'>
                        Find Trip
                    </button>
                </div>
                <div ref={panelRef} className='bg-white h-0 overflow-auto'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>
            <div ref={vehiclePanelRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-10 pt-12 max-h-[90vh] overflow-y-auto rounded-t-2xl'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 pb-8 max-h-[90vh] overflow-y-auto rounded-t-2xl'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}

                    setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 pb-8 max-h-[90vh] overflow-y-auto rounded-t-2xl'>
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound} />
            </div>
            <div ref={waitingForDriverRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 pb-8 max-h-[90vh] overflow-y-auto rounded-t-2xl'>
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver} />
            </div>
        </div>
    )
}

export default Home