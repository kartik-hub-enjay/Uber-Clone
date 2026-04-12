import React, { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const defaultCenter = {
    lat: -3.745,
    lng: -38.523
}

const RecenterMap = ({ center }) => {
    const map = useMap()

    useEffect(() => {
        map.setView([center.lat, center.lng])
    }, [center, map])

    return null
}

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState(defaultCenter)

    useEffect(() => {
        if (!navigator.geolocation) {
            return
        }

        const updatePosition = (position) => {
            const { latitude, longitude } = position.coords
            setCurrentPosition({ lat: latitude, lng: longitude })
        }

        navigator.geolocation.getCurrentPosition(updatePosition)

        const watchId = navigator.geolocation.watchPosition(
            updatePosition,
            (error) => {
                console.error('Geolocation error:', error.message)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    return (
        <MapContainer
            center={[currentPosition.lat, currentPosition.lng]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <RecenterMap center={currentPosition} />
            <CircleMarker
                center={[currentPosition.lat, currentPosition.lng]}
                radius={8}
                pathOptions={{ color: '#111827', fillColor: '#2563eb', fillOpacity: 0.9 }}
            />
        </MapContainer>
    )
}

export default LiveTracking