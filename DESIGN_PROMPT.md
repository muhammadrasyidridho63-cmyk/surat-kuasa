# Complete UI/UX Design Prompt for Google Stitch AI
## Court Online Power of Attorney Management System (Aplikasi Surat Kuasa Online)

```text
Design a complete, high-fidelity, and production-ready UI/UX for "Aplikasi Surat Kuasa Online Pengadilan" (Court Online Power of Attorney Management & Registration System).
This web application is a digital service platform for court institutions that enables attorneys (advokat) and the general public to register power of attorney documents electronically, track registration progress in real-time without physical queues at the court PTSP counter, provides court staff with a verification desk, enables court officials to perform digital approvals with PIN security, and produces QR-verified official registration certificates.

## Design Identity
- Style: Clean, Modern, Elegant, Prestigious, and Responsive (Mobile-First approach)
- Aesthetic: Card-based architecture, subtle elevation shadows, crisp borders, generous breathing room, official governmental judicial authority feel.
- Color Palette:
  Primary: Deep Court Green #0D5236 (symbolizing judicial integrity and state authority)
  Primary Hover: #0A3F29
  Accent / Secondary: Judicial Gold #C8963E (symbolizing honor, official stamps, and highlights)
  Accent Hover: #B58432
  Background: Soft Slate Gray #F8FAFC
  Surface / Card: Pure White #FFFFFF
  Text Primary: Deep Slate Charcoal #111827
  Text Secondary: Muted Steel #64748B
  Border / Divider: Neutral Gray #E2E8F0
  Focus Ring: #0D5236 with 20% opacity
- Status Colors:
  - Disahkan / Terdaftar (Approved/Registered): Bg #DCFCE7, Text #166534, Border #86EFAC
  - Menunggu Verifikasi / Pengesahan (Pending): Bg #FEF9C3, Text #854D0E, Border #FDE047
  - Perlu Revisi (Needs Revision): Bg #E0F2FE, Text #0369A1, Border #7DD3FC
  - Ditolak (Rejected): Bg #FEE2E2, Text #991B1B, Border #FCA5A5
- Typography: Font Family 'Plus Jakarta Sans' or 'Inter'
  - Display / H1: 28px - 32px, SemiBold / Bold, line-height 1.25, tracking -0.02em (#111827)
  - H2 / Section Title: 20px - 24px, SemiBold, line-height 1.3 (#111827)
  - H3 / Card Title: 16px - 18px, Medium / SemiBold (#111827)
  - Body Text: 14px, Regular, line-height 1.5 (#334155)
  - Caption / Microcopy: 12px, Medium (#64748B)
- Icons: Lucide / Heroicons outline style (20px default, 16px in badges, 24px in hero metrics)
- Visual Language Reference: Linear (clean typography & micro-interactions), Stripe Dashboard (card elevation & filters), and modern GovTech portals (gov.uk / Singapore Singpass elegance).
- Corner Radius: 12px for cards, 8px for buttons and inputs, 9999px (full pill) for status badges.
- Shadow: Subtle elevation (0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(13,82,54,0.06)).
- Grid System: 8px spacing baseline, responsive 12-column layout desktop, single column adaptive mobile.

## Application Overview
The application consists of 6 integrated screens:
1. Public Portal & Real-time Tracking (Hero landing, quick register CTA, and registration status checker)
2. Multi-Step Registration Wizard (4-step guided form for Advocate & General Public applicants)
3. Court Staff Verification Desk (Queue management, side-by-side document inspector, action modal)
4. Judicial Official Approval Portal (Executive signing desk, official PDF preview, PIN authorization)
5. Executive Admin Dashboard & Analytics (KPI metric cards, monthly trend charts, data table with Excel export)
6. Public QR Code Verification Page (Mobile-optimized certificate verification upon scanning QR)

---

### 1. PUBLIC PORTAL & REAL-TIME TRACKING
A prestigious institutional landing page designed to greet applicants and provide instant service access.
- Sticky Top Navbar: Height 68px, background #0D5236, white court crest logo on the left with title "PENGADILAN NEGERI - E-SURAT KUASA", navigation links (Beranda, Registrasi, Cek Status, Login Petugas), and a Gold Accent button "Daftar Sekarang" (#C8963E with dark text #0D5236, rounded-lg).
- Hero Section: Deep court green gradient background with subtle geometric law scale watermark. Prominent headline: "Pendaftaran & Legalisasi Surat Kuasa Online", subheadline explaining zero-queue digital service.
- Dual Action Hub:
  - Left Card: "Pendaftaran Baru" (Hero CTA card with icon, highlighting Advokat & Masyarakat Umum pathways).
  - Right Card: "Lacak Status Pengajuan" (Interactive input card with a search bar: "Masukkan Nomor Registrasi (contoh: REG-202611-0001) atau No. WhatsApp", with a prominent search button #0D5236).
- Instant Tracking Result Drawer / Modal: Shows visual progress stepper (Terkirim -> Verifikasi Berkas -> Pengesahan Pejabat -> Terdaftar Resmi) with timestamp, officer note alert box, and an "Unduh Bukti PDF" button when approved.
- Info Cards: 3 summary feature cards (Proses Cepat 1x24 Jam, QR Code Keaslian Terverifikasi, Layanan Resmi PTSP).

### 2. MULTI-STEP REGISTRATION WIZARD
A calm, non-intimidating multi-step form ensuring zero data loss and flawless mobile usability.
- Stepper Header: Sticky progress indicator with 4 numbered steps (1. Data Pemohon -> 2. Penerima Kuasa & Berkas -> 3. Materi & Wewenang Kuasa -> 4. Konfirmasi & Kirim). Completed steps in Green #0D5236 with checkmarks, active step in Gold #C8963E ring, pending in Gray #CBD5E1.
- Step 1 (Pemberi Kuasa): Category selector pills ("Advokat / Penasihat Hukum" vs "Masyarakat Umum / Pribadi"). Clean form fields: Nama Lengkap, NIK (16 digit validation), Pekerjaan, Nomor WhatsApp (with country prefix +62 badge), Email, and Alamat Domisili.
- Step 2 (Penerima Kuasa & Upload Berkas): Fields for Nama Advokat/Penerima, Nomor KTA Advokat / NIK, Kantor Hukum / Domisili. Drag-and-drop file uploaders with dashed green border (#0D5236), cloud upload icon, support preview thumbnail, file size limiter indicator (Maks. 5 MB - JPG/PNG/PDF), and client-side compression feedback badge.
- Step 3 (Materi Kuasa): Dropdown Jenis Perkara (Perdata, Pidana, PHI, Permohonan, dll.), Nomor Perkara (opsional jika perkara baru), and textarea for Ringkasan Wewenang/Keperluan Kuasa.
- Step 4 (Review & Disclaimer): Clean summary review card displaying all filled values with "Edit" shortcut links. Checkbox legally binding declaration of truth with signature checkbox. Primary CTA: "Kirim Permohonan Pendaftaran" (Large button, emerald green #0D5236 with subtle gold hover glow).
- Success Dialog: Congratulatory card with registration code REG-XXXXX in monospace font, QR code preview, and button "Unduh Lembar Tanda Terima".

### 3. COURT STAFF VERIFICATION DESK (MEJA VERIFIKATOR)
A high-efficiency queue workbench for court PTSP clerks.
- Layout: 240px dark green collapsible sidebar (#0A3F29) on the left with navigation (Antrean Baru [Badge: 12], Perlu Revisi, Riwayat Selesai, Pengaturan). Top search & notification bar with user profile.
- Main Workspace:
  - Filter Bar: Tab pills (Semua, Menunggu Verifikasi [Amber], Perlu Revisi [Blue], Disetujui [Green]), search by applicant name/nomor, and date range picker.
  - Verification Queue Table: Columns for No. Agenda, Tanggal, Nama Pemberi Kuasa, Kategori (Pill: Advokat / Umum), Penerima Kuasa, Berkas KTP/KTA (thumbnail quick-view icons), Status Badge, and Action Button "Periksa Berkas".
- Document Inspection Drawer (Slide-Over Panel 600px):
  - Split View: Left pane shows applicant metadata; right pane displays embedded high-resolution preview of uploaded KTP and Advocate Bar Card (KTA) with zoom and rotate controls.
  - Action Control Footer:
    - Button "Minta Revisi" (Secondary outlined, triggers prompt for rejection reason note to be sent to applicant).
    - Button "Tolak Permohonan" (Danger red text #DC2626).
    - Button "Loloskan ke Pejabat" (Primary Green #0D5236 with arrow right icon, forwards item to the Judge/Panitera desk).

### 4. JUDICIAL OFFICIAL APPROVAL PORTAL (MEJA PENGESAHAN PEJABAT)
An executive, dignified approval interface built for Court Registrars (Panitera) or Judges.
- Header: Institutional badge "RUANG PENGESAHAN DOKUMEN ELEKTRONIK", displaying current active official: "Panitera Pengadilan Negeri".
- Pending Approval Grid / List: Clean cards for items awaiting digital sign-off, displaying applicant name, registered matter, date verified by staff, and official draft registration number preview.
- Document Seal & Certificate Modal:
  - Live PDF Preview: Renders the official Court Power of Attorney Certificate with formal court header (Kop Garuda), legal clauses, assigned register number (e.g., W11-U1/123/HK.02/XI/2026), and a designated slot for the Digital HMAC QR Code Seal.
  - Secure Approval Flow: Input box for 6-digit Security PIN with masked bullet points.
  - Primary Action Button: "Sahkan & Terbitkan Dokumen" (Rich emerald green button with gold seal badge icon). On click, triggers animated success stamp effect "TERDAFTAR & DISAHKAN".

### 5. EXECUTIVE ADMIN DASHBOARD & ANALYTICS
A comprehensive control center for court administration and management reporting.
- Metric Cards Grid (4 Cards):
  1. Total Pendaftaran Kuasa (Value: "1,248", trend +12% this month, icon: Files).
  2. Menunggu Verifikasi (Value: "18", status warning amber indicator, icon: Clock).
  3. Siap Disahkan (Value: "7", status info blue indicator, icon: UserCheck).
  4. Kuasa Terdaftar Sah (Value: "1,223", success green indicator, icon: ShieldCheck).
- Visual Charts Row:
  - Left Card (2/3 width): Monthly Registration Trend (Interactive bar/area chart showing volume over the last 12 months, green gradient bars with gold average line).
  - Right Card (1/3 width): Donut Chart of Applicant Demographics (Advokat vs. Masyarakat Umum).
- Master Data Management Table:
  - Advanced search, multi-column sorting, bulk status filter.
  - Action Buttons: "Export to Excel (.xlsx)", "Cetak Rekap Buku Register (PDF)", and "Tambah Akun Pengguna".

### 6. PUBLIC QR CODE DOCUMENT AUTHENTICITY SCREEN
Mobile-optimized verification page rendered when third parties (judges in courtroom, counterparties) scan the QR code printed on the official document.
- Visual Header: Official court crest emblem with green badge "DOKUMEN RESMI TERDAFTAR DI PENGADILAN".
- Authenticity Verified Banner: Large green checkmark shield icon with text: "Keabsahan Surat Kuasa Terverifikasi".
- Document Identity Card:
  - Nomor Register Resmi: Monospace bold font with copy button.
  - Tanggal Pengesahan & Waktu WIB.
  - Nama Pejabat Pengesah & NIP.
  - Pihak Pemberi Kuasa & NIK (masked for privacy: 3201************).
  - Pihak Penerima Kuasa (Advokat) & Kantor Hukum.
  - Status Hukum: "Aktif & Berlaku".
- Security Hash Footer: Shows unique cryptographic SHA-256 fingerprint matching the physical certificate.

---

## Global Design Requirements
- Fully responsive design: Desktop-first layout for court back-office desks (1280px+), mobile-first adaptive layout for public registration and tracking pages (375px - 768px).
- Skeleton loading states for all queue tables, document drawers, and metric charts.
- Toast notifications: Success (Emerald Green #10B981), Error (Ruby Red #EF4444), Info (Sky Blue #0284C7), Warning (Amber #F59E0B).
- Empty states: Minimalist vector illustration of legal scale / folder with clear text (e.g., "Tidak ada antrean menunggu verifikasi") and a primary action button.
- Hover states: Subtle background shift, +2px card elevation shadow with smooth 150ms ease transition.
- Focus states: High-visibility 2px focus ring (#0D5236 with 20% glow) meeting WCAG AAA contrast guidelines.
- Form validation: Inline micro-copy in red below fields, green checkmark icon when field is valid.
- The overall feel: Dignified, highly trustworthy, modern public service with zero clutter and maximum clarity.
```
