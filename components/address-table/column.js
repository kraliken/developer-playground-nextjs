"use client"

import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { deleteAddress } from "@/lib/actions/google"

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