import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const token = request.cookies.get('token')?.value;
  const isAuth = Boolean(token);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');
  const isPrivate = pathname.startsWith('/operacoes');

  if (pathname === '/') {
    const url = nextUrl.clone();
    url.pathname = isAuth ? '/operacoes' : '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isAuth) {
    const url = nextUrl.clone();
    url.pathname = '/operacoes';
    return NextResponse.redirect(url);
  }

  if (isPrivate && !isAuth) {
    const url = nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login/:path*', '/cadastro/:path*', '/operacoes/:path*'],
};