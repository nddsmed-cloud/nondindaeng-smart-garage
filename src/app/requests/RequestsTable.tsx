"use client";

import { useState } from "react";
import { approveRequest, rejectRequest, deleteRequest } from "./actions";
import Link from "next/link";
import { formatThaiDate } from "../../lib/date-formatter";

type Request = {
  id: string;
  requesterName: string;
  department: string;
  purpose: string;
  vehicleType: string;
  travelDate: string;
  destination: string;
  status: string;
  vehicleId: string | null;
  startMileage: number | null;
  createdAt: Date;
};

export default function RequestsTable({ requests, role }: { requests: Request[]; role?: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = requests.filter((r) =>
    [r.requesterName, r.department, r.vehicleType, r.destination, r.status]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      "รออนุมัติ": "badge-yellow",
      "อนุมัติแล้ว": "badge-green",
      "ไม่อนุมัติ": "badge-red",
      "เสร็จสิ้น": "badge-green",
    };
    return map[status] || "badge-blue";
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveRequest(id);
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("ยืนยันการปฏิเสธคำขอนี้?")) return;
    setLoadingId(id);
    await rejectRequest(id);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบคำขอนี้?")) return;
    setLoadingId(id);
    await deleteRequest(id);
    setLoadingId(null);
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาชื่อผู้ขอ, แผนก, สถานะ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
          {filtered.length} / {requests.length} รายการ
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ผู้ขอ / แผนก</th>
              <th>ประเภทรถ</th>
              <th>วันที่เดินทาง</th>
              <th>ปลายทาง</th>
              <th>วัตถุประสงค์</th>
              <th>สถานะ</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="table-empty">
                    <div className="table-empty-icon">📋</div>
                    <div>{search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีคำขออนุญาตใช้รถ"}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className="td-primary">{req.requesterName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{req.department}</div>
                  </td>
                  <td>{req.vehicleType}</td>
                  <td>{formatThaiDate(req.travelDate)}</td>
                  <td>{req.destination || "—"}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {req.purpose}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(req.status)}`}>{req.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {req.status === "อนุมัติแล้ว" && (
                        <Link
                          href={`/logs/new?requestId=${req.id}&vehicleId=${req.vehicleId || ""}&startMileage=${req.startMileage || ""}&dept=${encodeURIComponent(req.department)}&dest=${encodeURIComponent(req.destination)}&purpose=${encodeURIComponent(req.purpose)}&driver=${encodeURIComponent(req.requesterName)}`}
                          className="btn btn-success btn-sm"
                          style={{ textDecoration: "none", fontSize: "11px", whiteSpace: "nowrap" }}
                        >
                          🚀 บันทึกเดินทาง
                        </Link>
                      )}
                      {req.status === "รออนุมัติ" && (role === "ADMIN" || role === "MANAGER") && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={loadingId === req.id}
                            className="btn btn-success btn-sm"
                          >
                            ✅ อนุมัติ
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={loadingId === req.id}
                            className="btn btn-danger btn-sm"
                          >
                            ❌ ปฏิเสธ
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(req.id)}
                        disabled={loadingId === req.id}
                        className="btn btn-ghost btn-sm"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
