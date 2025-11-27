"use client"

import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { calculateAndSaveDistance, deleteAddress } from "@/lib/actions/google"
import { RiPinDistanceFill } from "react-icons/ri";
import CalculateDistanceButton from "../address-distance/CalculateDistanceButton";

export const columns = [
    {
        accessorKey: "secondaryText",
        header: "Város",
    },
    {
        accessorKey: "mainText",
        header: "Út / Utca",
    },
    {
        accessorKey: "address",
        header: "Teljes cím",
    },
    {
        accessorKey: "addressType",
        header: "Típus",
    },
    {
        id: "actions",
        cell: ({ row }) => {

            const addressId = row.original._id

            return (
                <Button
                    onClick={() => deleteAddress(addressId)}
                    variant="destructive"
                    size="icon"
                >
                    <span className="sr-only">Delete address</span>
                    <Trash2 />
                </Button>
            )
        }
    },
]
export const columnsDistance = [
    {
        accessorKey: "secondaryText",
        header: "Város",
    },
    {
        accessorKey: "mainText",
        header: "Út / Utca",
    },
    {
        accessorKey: "address",
        header: "Teljes cím",
    },
    // {
    //     accessorKey: "addressType",
    //     header: "Típus",
    // },
    {
        accessorKey: "distance",
        header: "Távolság (km)",
        cell: ({ row }) => {
            const distance = row.original.distance

            if (distance?.roundTripKm) {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {distance.roundTripKm} km (oda-vissza)
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Egy irány: {distance.oneWayKm} km
                        </span>
                    </div>
                )
            }

            return (
                <span className="text-muted-foreground text-sm">
                    Nincs kiszámolva
                </span>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const addressId = row.original._id

            return <CalculateDistanceButton addressId={addressId} />
        }
    },
]