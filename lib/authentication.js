import { jwtVerify } from "jose"
import { cookies } from "next/headers"

/**
 * Authentication utilities with comprehensive token expiration handling
 * 
 * This module provides:
 * - Token verification with specific error handling for expired tokens
 * - Role-based authentication
 * - Helper functions for API route authentication
 * 
 * Token Error Types:
 * - TOKEN_EXPIRED: JWT has passed its expiration time
 * - TOKEN_INVALID: JWT is malformed or corrupted
 * - TOKEN_ERROR: Other JWT verification errors
 * - NO_TOKEN: No token provided in request
 * - INSUFFICIENT_ROLE: User doesn't have required role
 */

export const verifyToken = async (token) => {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SECRET_KEY))
        return { success: true, payload }
    } catch (error) {
        // Check if token is expired
        if (error.code === 'ERR_JWT_EXPIRED') {
            return { success: false, error: 'TOKEN_EXPIRED', message: 'Token has expired' }
        }
        // Check if token is invalid/malformed
        if (error.code === 'ERR_JWT_INVALID') {
            return { success: false, error: 'TOKEN_INVALID', message: 'Invalid token' }
        }
        // Other JWT errors
        return { success: false, error: 'TOKEN_ERROR', message: 'Token verification failed' }
    }
}
export const isAuthenticated = async (role) => {
    try {
        const cookieStore = await cookies()
        if (!cookieStore.has('access_token')) {
            return {
                isAuth: false,
                error: 'NO_TOKEN',
                message: 'No access token found'
            }
        }

        const access_token = cookieStore.get('access_token')
        const tokenResult = await verifyToken(access_token.value)

        if (!tokenResult.success) {
            return {
                isAuth: false,
                error: tokenResult.error,
                message: tokenResult.message
            }
        }

        const { payload } = tokenResult

        if (payload.role !== role) {
            return {
                isAuth: false,
                error: 'INSUFFICIENT_ROLE',
                message: 'Insufficient permissions'
            }
        }

        return {
            isAuth: true,
            userId: payload._id,
            user: payload
        }

    } catch (error) {
        return {
            isAuth: false,
            error: 'AUTH_ERROR',
            message: 'Authentication error'
        }
    }
}

// Helper function to handle token verification in API routes
export const handleTokenVerification = async (token, requiredRole = null) => {
    if (!token) {
        return {
            success: false,
            status: 401,
            message: "Authentication required",
            error: "NO_TOKEN"
        }
    }

    const tokenResult = await verifyToken(token)
    
    if (!tokenResult.success) {
        // Handle specific token errors
        if (tokenResult.error === 'TOKEN_EXPIRED') {
            return {
                success: false,
                status: 401,
                message: "Session expired. Please login again.",
                error: "TOKEN_EXPIRED"
            }
        }
        
        if (tokenResult.error === 'TOKEN_INVALID') {
            return {
                success: false,
                status: 401,
                message: "Invalid token. Please login again.",
                error: "TOKEN_INVALID"
            }
        }
        
        return {
            success: false,
            status: 401,
            message: "Authentication failed",
            error: tokenResult.error
        }
    }
    
    const user = tokenResult.payload
    
    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
        return {
            success: false,
            status: 403,
            message: `${requiredRole} access required`,
            error: "INSUFFICIENT_ROLE"
        }
    }
    
    return {
        success: true,
        user: user
    }
}
