import React from 'react'

const LocationSearchPanel = ({ suggestions, setVehiclePanel, setPanelOpen, setPickup, setPickupCoords, setDestination, setDestinationCoords, activeField }) => {

    const handleSuggestionClick = (suggestion) => {
        const label = suggestion?.description || suggestion
        const coords =
            suggestion && typeof suggestion === 'object'
                ? {
                    ltd: Number(suggestion.ltd),
                    lng: Number(suggestion.lng)
                }
                : null

        if (activeField === 'pickup') {
            setPickup(label)
            setPickupCoords(coords)
        } else if (activeField === 'destination') {
            setDestination(label)
            setDestinationCoords(coords)
        }
    }

    return (
        <div>
            {/* Display fetched suggestions */}
            {
                suggestions.map((elem, idx) => (
                    <div key={idx} onClick={() => handleSuggestionClick(elem)} className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start'>
                        <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'><i className="ri-map-pin-fill"></i></h2>
                        <h4 className='font-medium'>{elem?.description || elem}</h4>
                    </div>
                ))
            }
        </div>
    )
}

export default LocationSearchPanel