"use client"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { useActionState, useEffect, useRef } from "react"
import { saveAddressAction } from "@/lib/actions/google"
import { toast } from "sonner"
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete"
import { AddressHiddenFields } from "../address-search/AddressHiddenFields"
import { AddressInputField } from "../address-search/AddressInputField"

const SearchAddressForm = () => {

    const [state, formAction, isPending] = useActionState(saveAddressAction, {
        success: false,
        message: '',
        address: null
    })

    const {
        inputValue,
        suggestions,
        isOpen,
        isLoading,
        selectedPlace,
        handleSelect,
        handleInputChange,
        resetForm,
        setIsOpen
    } = useAddressAutocomplete()

    // const sessionTokenRef = useRef(uuidv4())
    const formRef = useRef(null)

    // Form reset és feedback sikeres/sikertelen mentés után
    useEffect(() => {
        if (!state.message) return

        if (state.success) {
            toast.success(state.message)
            resetForm()
        } else {
            toast.error(state.message)
        }
    }, [state.message, state.success, resetForm])

    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 200)
    }

    const handleFocus = () => {
        if (suggestions.length > 0) setIsOpen(true)
    }

    // const isSubmitDisabled = isPending || !inputValue.trim() || !selectedPlace.placeId

    return (
        <Card>
            <CardContent className="">
                <form ref={formRef} action={formAction} className="flex w-full items-center gap-2 ">

                    <AddressHiddenFields selectedPlace={selectedPlace} />

                    <div className="flex w-full max-w-lg items-center gap-2 ">
                        <AddressInputField
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            disabled={isPending}
                            isOpen={isOpen}
                            isLoading={isLoading}
                            suggestions={suggestions}
                            onSelect={handleSelect}
                        />

                        <Button
                            type="submit"
                            variant="outline"
                            disabled={isPending || !inputValue.trim() || !selectedPlace.placeId}
                        >
                            {isPending ? 'Mentés...' : 'Mentés'}
                        </Button>

                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default SearchAddressForm