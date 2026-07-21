-- ============================================================
-- Supabase Migration: e-Office กองช่าง
-- รัน SQL นี้ใน Supabase Dashboard > SQL Editor
-- ============================================================

-- ตาราง building_permits (ใบอนุญาตก่อสร้าง)
-- หากยังไม่มี ให้สร้างใหม่:
CREATE TABLE IF NOT EXISTS building_permits (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_number      text UNIQUE NOT NULL,
  applicant_name     text NOT NULL,
  applicant_phone    text NOT NULL,
  national_id        text,
  building_type      text NOT NULL,
  building_size      text,
  location           text NOT NULL,
  purpose            text,
  status             text NOT NULL DEFAULT 'pending',  -- pending|inprogress|waiting_docs|approved|rejected

  -- เอกสารแนบ (URL จาก Supabase Storage)
  doc_id_card        text,
  doc_house_reg      text,
  doc_land_title     text,
  doc_blueprint      text,
  doc_owner_consent  text,
  doc_site_photo     text,

  -- การดำเนินการ
  officer_note       text DEFAULT '',
  processed_by       text,
  processed_at       timestamptz,

  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- เพิ่ม columns สำหรับ admin workflow (กรณีตารางมีอยู่แล้ว)
ALTER TABLE building_permits ADD COLUMN IF NOT EXISTS officer_note   text DEFAULT '';
ALTER TABLE building_permits ADD COLUMN IF NOT EXISTS processed_by   text;
ALTER TABLE building_permits ADD COLUMN IF NOT EXISTS processed_at   timestamptz;
ALTER TABLE building_permits ADD COLUMN IF NOT EXISTS updated_at     timestamptz DEFAULT now();

-- ตาราง citizen_reports (เรื่องร้องเรียน)
CREATE TABLE IF NOT EXISTS citizen_reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number  text UNIQUE NOT NULL,
  problem_type     text NOT NULL,
  location         text NOT NULL,
  description      text NOT NULL,
  contact_name     text NOT NULL,
  contact_phone    text NOT NULL,
  status           text NOT NULL DEFAULT 'pending',  -- pending|inprogress|completed|rejected

  -- การดำเนินการ
  officer_note     text DEFAULT '',
  resolved_by      text,
  resolved_at      timestamptz,

  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- เพิ่ม columns สำหรับ admin workflow (กรณีตารางมีอยู่แล้ว)
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS officer_note text DEFAULT '';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS resolved_by  text;
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS resolved_at  timestamptz;
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS updated_at   timestamptz DEFAULT now();

-- ตาราง citizen_scores (คะแนนความดี — เดิม)
CREATE TABLE IF NOT EXISTS citizen_scores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id  text NOT NULL,
  action_type  text NOT NULL,
  points       int  NOT NULL DEFAULT 0,
  reference_id text,
  created_at   timestamptz DEFAULT now()
);

-- RLS Policies (ปิด Public access, เปิดแค่ service_role)
ALTER TABLE building_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports  ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (ระบบใช้ service role key เสมอ)
CREATE POLICY IF NOT EXISTS "service_role_all_permits"  ON building_permits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "service_role_all_reports"  ON citizen_reports  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anon to INSERT only (ประชาชนยื่นได้ ดูไม่ได้)
CREATE POLICY IF NOT EXISTS "anon_insert_permits" ON building_permits FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon_insert_reports" ON citizen_reports  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to SELECT by tracking number only (ติดตามสถานะ)
CREATE POLICY IF NOT EXISTS "anon_select_report_by_tracking" ON citizen_reports
  FOR SELECT TO anon USING (true);  -- จำกัดผ่าน application logic

-- ============================================================
-- ตรวจสอบ
SELECT 'building_permits' as tbl, count(*) FROM building_permits
UNION ALL
SELECT 'citizen_reports', count(*) FROM citizen_reports;
