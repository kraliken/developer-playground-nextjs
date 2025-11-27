"use client"

import { useTransition } from 'react'
import { Button } from '../ui/button'
import { calculateAndSaveDistance } from '@/lib/actions/google'
import { RiPinDistanceFill } from 'react-icons/ri'
import { toast } from 'sonner'

const CalculateDistanceButton = ({ addressId }) => {
    const [isPending, startTransition] = useTransition()

    const handleCalculate = () => {
        startTransition(async () => {
            try {
                // Itt hívjuk meg a distance action-t
                // A headquartersId-t a page-ből kell átadni, vagy lekérni
                const result = await calculateAndSaveDistance(addressId)

                if (result.success) {
                    toast.success(result.message || "Távolság sikeresen kiszámolva!")
                } else {
                    toast.error(result.message || "Hiba történt a számítás során")
                }
            } catch (error) {
                toast.error("Hiba történt a számítás során")
                console.error(error)
            }
        })
    }

    return (
        <Button
            onClick={handleCalculate}
            variant="secondary"
            size="icon"
            disabled={isPending}
        >
            <span className="sr-only">Calculate distance</span>
            {isPending ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <RiPinDistanceFill />
            )}
        </Button>
    )
}

export default CalculateDistanceButton