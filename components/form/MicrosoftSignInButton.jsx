"use client"

import { SignInAction } from "@/lib/actions/auth"
import { Button } from "../ui/button"
import { TfiMicrosoftAlt } from "react-icons/tfi"

const MicrosoftSignInButton = () => {
    return (
        <Button
            onClick={() => SignInAction("microsoft-entra-id")}
            variant=""
            className="w-full gap-2 py-6 text-base font-medium"
        >
            <TfiMicrosoftAlt className="h-5 w-5" />
            Belépés Microsofttal
        </Button>
    )
}

export default MicrosoftSignInButton