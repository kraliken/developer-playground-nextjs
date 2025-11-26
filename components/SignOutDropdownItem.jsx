"use client"

import { LogOut } from "lucide-react"
import { DropdownMenuItem } from "./ui/dropdown-menu"
import { SignOutAction } from "@/lib/actions/auth"


const SignOutDropdownItem = () => {
    return (
        <DropdownMenuItem onClick={() => SignOutAction()}>
            <LogOut />
            Kilépés
        </DropdownMenuItem>
    )
}

export default SignOutDropdownItem