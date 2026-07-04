import "./globals.css";
import { auth } from "../auth";
import AuthProvider from "../components/AuthProvider";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import GreetingToast from "../components/GreetingToast";

export const metadata = {
  title: "ระบบจัดการงานกองช่างเทศบาล",
  description: "ระบบจัดการงานกองช่างเทศบาลตำบลโนนดินแดง — ยานพาหนะและ GIS",
  manifest: "/manifest.json",
};


export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Ambient soft lights background */}
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(circle at 10% 20%, rgba(30, 58, 138, 0.03) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: -1,
        }} />

        <AuthProvider session={session}>
          {session ? (
            /* Authenticated layout — with Sidebar & BottomNav */
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <div className="page-container">{children}</div>
              </main>
              <BottomNav />
              <GreetingToast />
            </div>
          ) : (
            /* Unauthenticated — login page (no sidebar) */
            <>{children}</>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}