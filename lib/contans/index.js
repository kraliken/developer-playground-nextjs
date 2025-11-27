import { MapPinCheck, Route } from "lucide-react";


export const googleAPILinks = [
    {
        label: "Places API (New)",
        icon: <MapPinCheck />,
        href: "/dashboard/google-search",
    },
    {
        label: "Routes API",
        icon: <Route />,
        href: "/dashboard/google-calculate",
    },
]