import React from 'react'
import dynamicImport from 'next/dynamic'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Dynamically import admin components to reduce initial bundle size
const AppSidebar = dynamicImport(() => import('@/components/Application/Admin/AppSidebar'), {
  loading: () => <div className="w-64 h-screen bg-gray-100 animate-pulse" />
})

const ThemeProvider = dynamicImport(() => import('@/components/Application/Admin/ThemeProvider'), {
  loading: () => null
})

const Topbar = dynamicImport(() => import('@/components/Application/Admin/Topbar'), {
  loading: () => <div className="h-16 bg-white border-b animate-pulse" />
})

const SidebarProvider = dynamicImport(() => import('@/components/ui/sidebar').then(mod => ({ default: mod.SidebarProvider })), {
  loading: () => null
})

const layout = ({ children }) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <AppSidebar />
                <main className="md:w-[calc(100vw-16rem)] w-full overflow-x-hidden bg-background" >
                    <div className='pt-[70px] md:px-8 px-5 min-h-[calc(100vh-40px)] pb-10'>
                        <Topbar />
                        {children}
                    </div>

                    <div className='border-t h-[40px] flex justify-center items-center bg-gray-50 dark:bg-background text-sm'>
                        © 2025 Tiger Bhai™. All Rights Reserved.
                    </div>
                </main>
            </SidebarProvider>
        </ThemeProvider>
    )
}

export default layout