import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import MicrosoftSignInButton from "./MicrosoftSignInButton";

const SignInForm = () => {
    return (
        <Card className="w-full max-w-md mx-auto shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl">

            <CardHeader className="text-center space-y-1 p-6">
                <CardTitle className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Developer Playground
                </CardTitle>

                <CardDescription className="text-muted-foreground text-sm pt-2">
                    Jelentkezz be Microsoft-fiókoddal
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 p-6 flex flex-col gap-4">
                <MicrosoftSignInButton />
            </CardContent>

        </Card>
    )
}

export default SignInForm