"use client";
// src/app/login/page.tsx
import { useActionState, useEffect, useState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      {/* Background decoration */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(30,58,138,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.03) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, var(--blue) 0%, #3b82f6 100%)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 35, margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(30,58,138,0.15)",
          }}>⚡</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            ระบบจัดการงานกองช่างเทศบาล
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            เทศบาลตำบลโนนดินแดง — ยานพาหนะ & GIS กองช่าง
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.05)",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            เข้าสู่ระบบ
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
            กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน
          </p>

          {/* Error */}
          {state?.error && (
            <div style={{
              background: "var(--red-soft)",
              border: "1px solid var(--red)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--red)",
            }}>
              ⚠️ {state.error}
            </div>
          )}

          <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Username */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 6,
              }}>ชื่อผู้ใช้งาน</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 15,
                }}>👤</span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="กรอกชื่อผู้ใช้"
                  autoComplete="username"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 6,
              }}>รหัสผ่าน</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 15,
                }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete="current-password"
                  className="form-input"
                  style={{ paddingLeft: 38, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "var(--text-muted)",
                    fontSize: 15, padding: 0,
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                marginTop: 4,
                background: isPending
                  ? "var(--text-muted)"
                  : "linear-gradient(135deg, var(--blue) 0%, #3b82f6 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                cursor: isPending ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                width: "100%",
                letterSpacing: "0.02em",
                boxShadow: isPending ? "none" : "0 8px 16px rgba(30, 58, 138, 0.15)",
              }}
            >
              {isPending ? "⏳ กำลังเข้าสู่ระบบ..." : "🚀 เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          &copy; ระบบจัดการงานกองช่างเทศบาล v1.0<br/>
          เครดิต โดย ผอ.สรพงษ์
        </p>
      </div>
    </div>
  );
}
