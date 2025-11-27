// hooks/useAddressAutocomplete.js
import { useCallback, useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { callAutocompletePlaces, getPlaceDetails } from "@/lib/actions/google"

export const useAddressAutocomplete = () => {

    const [inputValue, setInputValue] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [skipSearch, setSkipSearch] = useState(false)
    const [selectedPlace, setSelectedPlace] = useState({
        placeId: "",
        mainText: "",
        secondaryText: "",
        latitude: "",
        longitude: ""
    })

    const sessionTokenRef = useRef(uuidv4())

    const regenerateToken = useCallback(() => {
        sessionTokenRef.current = uuidv4()
        console.log("🔄 Új Session Token generálva:", sessionTokenRef.current)
    }, [])

    // Autocomplete keresés
    useEffect(() => {
        if (skipSearch || inputValue.length < 3) {
            setSuggestions([])
            if (!skipSearch && inputValue.length >= 3) {
                setIsOpen(true)   // Csak ha NEM skipSearch ÉS hosszú az input
            } else {
                setIsOpen(false)  // Minden más esetben zárd be
            }
            return
        }

        setSuggestions([])
        setIsOpen(true)
        setIsLoading(true)

        const delayDebounceFn = setTimeout(async () => {
            try {
                const data = await callAutocompletePlaces({
                    query: inputValue,
                    sessionToken: sessionTokenRef.current
                })
                setSuggestions(data || [])
            } catch (error) {
                console.error("Hiba a keresés során:", error)
                setSuggestions([])
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(delayDebounceFn)
            setIsLoading(false)
        }
    }, [inputValue, skipSearch])

    const handleSelect = async (place) => {
        setSkipSearch(true)
        setSuggestions([])
        setIsOpen(false)

        const currentToken = sessionTokenRef.current

        const placeDetails = await getPlaceDetails({
            placeId: place.id,
            sessionToken: currentToken,
        })

        regenerateToken()

        if (placeDetails?.formattedAddress) {
            setInputValue(placeDetails.formattedAddress)
            setSelectedPlace({
                placeId: place.id,
                mainText: place.mainText,
                secondaryText: place.secondaryText,
                latitude: placeDetails.location?.latitude || "",
                longitude: placeDetails.location?.longitude || ""
            })

            console.log("📍 Kiválasztott hely részletei:", {
                address: placeDetails.formattedAddress,
                placeId: place.id,
                location: placeDetails.location
            })
        } else {
            const fullAddress = `${place.secondaryText}, ${place.mainText}`
            setInputValue(fullAddress)
            setSelectedPlace({
                placeId: place.id,
                mainText: place.mainText,
                secondaryText: place.secondaryText,
                latitude: "",
                longitude: ""
            })
        }
    }

    const resetForm = useCallback(() => {
        setInputValue("")
        setSelectedPlace({
            placeId: "",
            mainText: "",
            secondaryText: "",
            latitude: "",
            longitude: ""
        })
        setSuggestions([])
        setIsOpen(false)
        setSkipSearch(false)
    }, [])

    const handleInputChange = useCallback((value) => {
        setSkipSearch(false)
        setInputValue(value)
    }, [])

    return {
        inputValue,
        suggestions,
        isOpen,
        isLoading,
        selectedPlace,
        handleSelect,
        handleInputChange,
        resetForm,
        setIsOpen
    }
}