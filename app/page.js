import { auth } from "@/auth";
import SignInForm from "@/components/form/SignInForm";
import { redirect } from "next/navigation";


export default async function Home() {

    const session = await auth();

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <SignInForm />
        </div>
    );
}
