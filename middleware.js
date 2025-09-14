import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { verifyToken } from "./lib/authentication"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const hasToken = request.cookies.has('access_token')

        if (!hasToken) {
            // if the user is not loggedin and trying to access a protected route, redirect to login page. 
            if (!pathname.startsWith('/auth') && !pathname.startsWith('/vendor')) {
                return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            }
            return NextResponse.next() // Allow access to auth routes if not logged in. 
        }

        // verify token 
        const access_token = request.cookies.get('access_token').value
        const tokenResult = await verifyToken(access_token)

        // Handle token verification failure (expired, invalid, etc.)
        if (!tokenResult.success) {
            // Clear the invalid/expired token cookie
            const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            response.cookies.delete('access_token')
            return response
        }

        const { payload } = tokenResult
        const role = payload.role

        // prevent logged-in users from accessing auth routes 
        if (pathname.startsWith('/auth')) {
            if (role === 'admin') {
                return NextResponse.redirect(new URL(ADMIN_DASHBOARD, request.nextUrl))
            } else if (role === 'vendor') {
                return NextResponse.redirect(new URL('/vendor/dashboard', request.nextUrl))
            } else {
                return NextResponse.redirect(new URL(USER_DASHBOARD, request.nextUrl))
            }
        }


        // protect admin route  
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        // protect vendor route  
        if (pathname.startsWith('/vendor') && role !== 'vendor') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        // protect user route  
        if (pathname.startsWith('/my-account') && role !== 'user') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        return NextResponse.next()

    } catch (error) {
        console.log('Middleware error:', error)
        // Clear any potentially corrupted cookies and redirect to login
        const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        response.cookies.delete('access_token')
        return response
    }
}


export const config = {
    matcher: ['/admin/:path*', '/my-account/:path*', '/auth/:path*', '/vendor/:path*']
}