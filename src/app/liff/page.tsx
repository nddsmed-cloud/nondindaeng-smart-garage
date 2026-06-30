"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { signIn } from "next-auth/react";

export default function LiffLoginPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function initLiff() {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          setError("LIFF ID ไม่ได้รับการตั้งค่าในระบบ");
          setLoading(false);
          return;
        }

        // 1. เริ่มต้น LIFF
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        // 2. ดึงบริบท (Context) ว่าเปิดมาจากกลุ่มหรือไม่
        const context = liff.getContext();
        
        if (context?.type !== "group" || !context.groupId) {
          setError("กรุณาเปิดแอปพลิเคชันจากใน LINE กลุ่มของเทศบาลเท่านั้นครับ (ระบบล็อกอินผ่านกลุ่ม)");
          setLoading(false);
          return;
        }

        // 3. ขอ Access Token ของ LINE
        const accessToken = liff.getAccessToken();

        // 4. ส่งไปยืนยันกับ NextAuth (เรียก Provider id="liff")
        const result = await signIn("liff", {
          accessToken,
          groupId: context.groupId,
          redirect: false,
        });

        if (result?.error) {
          setError(`กลุ่มนี้ยังไม่ได้ลงทะเบียนในระบบ\n\nโปรดแจ้งผู้ดูแลระบบและส่ง Group ID ด้านล่างนี้เพื่อลงทะเบียน:\n\n${context.groupId}`);
          setLoading(false);
        } else {
          // ล็อกอินสำเร็จ เช็คว่ามี ?path= ต่อท้ายหรือไม่ ถ้ามีให้ไปหน้านั้น ถ้าไม่มีไป /dashboard
          const urlParams = new URLSearchParams(window.location.search);
          const targetPath = urlParams.get("path") || "/dashboard";
          window.location.href = targetPath;
        }

      } catch (err: any) {
        console.error("LIFF Init Error:", err);
        setError("ระบบขัดข้อง ไม่สามารถเชื่อมต่อ LINE ได้ (" + err.message + ")");
        setLoading(false);
      }
    }
    
    initLiff();
  }, []);

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      padding: "20px",
      textAlign: "center",
      background: "var(--bg-subtle)"
    }}>
      <div style={{
        background: "var(--bg-primary)",
        padding: "32px",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        maxWidth: "400px",
        width: "100%"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
        <h2 style={{ marginBottom: "8px", color: "var(--text-primary)" }}>NDD Smart Garage</h2>
        
        {loading ? (
          <div>
            <p style={{ color: "var(--text-muted)" }}>กำลังเข้าสู่ระบบอัตโนมัติผ่าน LINE...</p>
            <div style={{
              width: "24px", height: "24px", 
              border: "3px solid var(--blue-soft)", 
              borderTopColor: "var(--blue)", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite",
              margin: "16px auto"
            }}></div>
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : error ? (
          <div>
            <p style={{ color: "var(--red)", fontWeight: 500, marginBottom: "16px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{error}</p>
            <button 
              onClick={() => liff.closeWindow()}
              className="btn btn-secondary"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
