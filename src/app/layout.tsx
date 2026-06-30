import "./globals.css";
import { auth } from "../auth";
import AuthProvider from "../components/AuthProvider";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "NDD Smart Garage",
  description: "ระบบบริหารจัดการรถยนต์ส่วนกลาง",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider session={session}>
          {session ? (
            /* Authenticated layout — with Sidebar */
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <div className="page-container">{children}</div>
              </main>
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