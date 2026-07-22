export { auth as middleware } from './auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/reports/:path*',
    '/vehicles/:path*',
    '/logs/:path*',
    '/requests/:path*',
    '/gis/:path*',
    '/e-permit/:path*',
    '/e-service/:path*',
  ],
};
