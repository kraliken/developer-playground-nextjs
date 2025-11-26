import { NextResponse } from 'next/server'
import { auth } from './auth'

const protectedRoutes = ["/dashboard"]

export async function proxy(request) {

    const session = await auth()

    const { pathname } = request.nextUrl

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtected && !session) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}