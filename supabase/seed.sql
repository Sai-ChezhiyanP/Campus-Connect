-- ====================================================================
-- CAMPUS CONNECT: SRMIST Ramapuram Initial Seed Data
-- File: supabase/seed.sql
-- ====================================================================

-- 1. Departments
INSERT INTO departments (id, code, name) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'CSE', 'Computer Science and Engineering'),
  ('d1000000-0000-0000-0000-000000000002', 'IT', 'Information Technology'),
  ('d1000000-0000-0000-0000-000000000003', 'ECE', 'Electronics and Communication Engineering'),
  ('d1000000-0000-0000-0000-000000000004', 'EEE', 'Electrical and Electronics Engineering'),
  ('d1000000-0000-0000-0000-000000000005', 'BIO', 'Biotechnology & Biomedical Engineering'),
  ('d1000000-0000-0000-0000-000000000006', 'CIVIL', 'Civil Engineering'),
  ('d1000000-0000-0000-0000-000000000007', 'MECH', 'Mechanical Engineering')
ON CONFLICT (code) DO NOTHING;

-- 2. 18 Proposed B.Tech Programmes
INSERT INTO programmes (id, department_id, code, name, degree, is_active) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'BTECH-AI', 'Artificial Intelligence', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000005', 'BTECH-BME', 'Biomedical Engineering', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005', 'BTECH-BT', 'Biotechnology', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000006', 'BTECH-CIVIL', 'Civil Engineering', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSBS', 'Computer Science and Business Systems', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE', 'Computer Science and Engineering', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-AIML', 'CSE — Artificial Intelligence and Machine Learning', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-BDA', 'CSE — Big Data Analytics', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-CC', 'CSE — Cloud Computing', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-CS', 'CSE — Cyber Security', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-DS', 'CSE — Data Science', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-GT', 'CSE — Gaming Technology', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000001', 'BTECH-CSE-IOT', 'CSE — Internet of Things', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000014', 'd1000000-0000-0000-0000-000000000004', 'BTECH-EEE', 'Electrical and Electronics Engineering', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000015', 'd1000000-0000-0000-0000-000000000003', 'BTECH-ECE', 'Electronics and Communication Engineering', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000016', 'd1000000-0000-0000-0000-000000000003', 'BTECH-ECE-DS', 'ECE — Data Science', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000017', 'd1000000-0000-0000-0000-000000000002', 'BTECH-IT', 'Information Technology', 'B.Tech', true),
  ('p1000000-0000-0000-0000-000000000018', 'd1000000-0000-0000-0000-000000000007', 'BTECH-MECH', 'Mechanical Engineering', 'B.Tech', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Student Roster Records (Authorized Enrollment verification test data)
INSERT INTO student_roster (registration_number, full_name, official_email, programme_code, admission_year) VALUES
  ('RA2411003010001', 'Aarav Sharma (Test Student)', 'student.test@srmist.edu.in', 'BTECH-CSE-AIML', 2024),
  ('RA2411003010002', 'Priya Raman (Test Coordinator)', 'coordinator.test@srmist.edu.in', 'BTECH-CSE', 2023),
  ('RA2411003010003', 'Karthik Raja (Test Student 2)', 'karthik.test@srmist.edu.in', 'BTECH-IT', 2024)
ON CONFLICT (registration_number) DO NOTHING;

-- 4. Clubs Directory
INSERT INTO clubs (id, name, category, description, logo_url, contact_email) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Computing & Coding Club (C3)', 'Technical', 'Official computer science and programming community organizing hackathons, open source initiatives, and tech talks.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300', 'c3club@srmist.edu.in'),
  ('c1000000-0000-0000-0000-000000000002', 'Robotics and Automation Society', 'Technical', 'Designing autonomous rovers, competitive combat bots, and IoT hardware projects for national competitions.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300', 'robotics@srmist.edu.in'),
  ('c1000000-0000-0000-0000-000000000003', 'SRM Ramapuram Literary & Debating Society', 'Cultural', 'Fostering public speaking, parliamentary debates, creative writing, and model United Nations.', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300', 'litdeb@srmist.edu.in'),
  ('c1000000-0000-0000-0000-000000000004', 'Google Developer Student Club (GDSC)', 'Technical', 'Peer-to-peer learning environment for students interested in Google developer technologies, mobile dev, and cloud.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300', 'gdsc@srmist.edu.in')
ON CONFLICT (name) DO NOTHING;
