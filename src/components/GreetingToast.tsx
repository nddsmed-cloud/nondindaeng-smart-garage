"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ROLE_LABELS, type UserRole } from "../lib/auth-helpers";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

export default function GreetingToast() {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const device = useDeviceDetection();

  useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;
    const key = `hasGreeted_ndd_${userId}`;
    
    // Check if user has already been greeted in this session
    const hasGreeted = sessionStorage.getItem(key);
    if (!hasGreeted) {
      // Delay showing slightly for better visual feedback after page load
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem(key, "true");
      }, 800);
      
      // Auto close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        setShow(false);
      }, 5800);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [session]);

  if (!show || !session?.user) return null;

  const role = (session.user?.role ?? "OFFICER") as UserRole;
  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <div className="greeting-toast-container">
      <div className="greeting-toast-glow"></div>
      <div className="greeting-toast-card">
        <div className="greeting-toast-header">
          <div className="greeting-toast-logo">⚡</div>
          <div className="greeting-toast-title">เชื่อมต่อยานยนต์อัจฉริยะ</div>
          <button className="greeting-toast-close" onClick={() => setShow(false)}>✕</button>
        </div>
        <div className="greeting-toast-body">
          <p className="greeting-toast-welcome">สวัสดีครับ ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
          <h2 className="greeting-toast-name">{session.user.name}</h2>
          <div className="greeting-toast-meta">
            <span className="greeting-toast-tag role">{roleLabel}</span>
            {session.user.department && (
              <span className="greeting-toast-tag dept">กอง{session.user.department}</span>
            )}
          </div>
          <div className="greeting-toast-divider"></div>
          <p className="greeting-toast-device">
            🖥 ตรวจพบการใช้งานบน {device.isIOS ? "iPhone/iPad" : device.isAndroid ? "Android Device" : device.isWindows ? "Windows PC" : "เครื่องคอมพิวเตอร์"}
          </p>
        </div>
        <div className="greeting-toast-actions">
          <button className="greeting-toast-btn" onClick={() => setShow(false)}>
            เข้าสู่แดชบอร์ด 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
