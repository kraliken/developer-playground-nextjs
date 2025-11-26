import AppSidebar from '@/components/navigation/AppSidebar'
import Navbar from '@/components/navigation/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from "next/headers"

const DashboardLayout = async ({ children }) => {

    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <div className="w-full min-h-full">
                <Navbar />
                <main className="px-4">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout