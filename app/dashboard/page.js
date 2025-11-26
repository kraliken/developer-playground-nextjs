import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DashboardPage = () => {
    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-68px)] py-4">
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Üdv a Developer Playgroundban
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p>
                        A bal oldali menüben találod az egyes modulokat, ahol API-kat, UI komponenseket és prototípus funkciókat próbálhatsz ki
                    </p>

                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>API demók (pl. Google Places API)</li>
                        <li>UI komponens példák</li>
                        <li>Gyors prototípusok és proof-of-concept megoldások</li>
                    </ul>

                    <p className="text-sm text-muted-foreground">
                        Ez a felület fejlesztési kísérletezésre készült
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardPage