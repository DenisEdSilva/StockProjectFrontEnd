import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('stockproject.token')?.value;
    const userType = request.cookies.get('userType')?.value;
    const userStoreId = request.cookies.get('storeId')?.value;
    const { pathname } = request.nextUrl
    
    if (token && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/owner/select-store', request.url))
    }

    if (!token && (pathname.startsWith('/owner') || pathname.startsWith('/stores'))) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    if (!token && pathname.startsWith('/protected')) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    if (pathname.startsWith('/stores/')) {
        const segments = pathname.split('/');
        const urlStoreId = segments[2];

        if (userType === 'STORE_USER') {
            if (urlStoreId !== userStoreId) {
                return NextResponse.redirect(new URL(`/stores/${userStoreId}/dashboard`, request.url))
            }
        }
    }

    if (pathname.startsWith('/owner') && userType === 'STORE_USER') {
        return NextResponse.redirect(new URL(`/stores/${userStoreId}/dashboard`, request.url))
    }
 
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}