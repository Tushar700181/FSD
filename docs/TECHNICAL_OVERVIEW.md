# OneCampus: Full-Spectrum Technical Documentation

OneCampus is an integrated university management ecosystem built for scale, security, and superior user experience. This document details the architectural decisions, operational logic, and functional modules of the platform.

---

## 🏗️ 1. Technical Stack & Architecture

### Backend Core
- **Engine**: Node.js & Express.js.
- **Database**: Native MongoDB Driver (optimized for high-performance CRUD without the overhead of Mongoose).
- **Middleware Architecture**: Multi-tier authentication guards implemented in `src/middleware/auth.js` for role and department-level authorization.

### Frontend Layers
- **Technology**: Semantic HTML5, Vanilla JavaScript (ES6+), and Vanilla CSS/Tailwind.
- **UI Paradigm**: Glassmorphic, responsive design with dynamic theme tokens.
- **Security Guards**: `auth_check.js` enforced on every page to prevent unauthenticated access.

### DevOps & Deployment
- **Containerization**: Fully Docker-ready via `.devcontainer/docker-compose.yml`.
- **Environment**: Automated provisioning of Node.js 20 and MongoDB environments for seamless development across teams.

---

## 🚀 2. Functional Application Modules

### 🍔 CampusEats (Cafe Ordering)
- **Vendor Dashboard**: Complete menu management and order fulfillment pipeline, strictly isolated from campus administrators.
- **Student Portal**: Real-time menu browsing and secure order placement.

### 🎓 Career Growth (Placement Portal)
- **Drive Management**: End-to-end management of recruitment drives, company listings, and student eligibility tracking.
- **Analytics**: Live statistics dashboard for TPO officials.

### 👨‍🏫 Academic Sync (Faculty Availability)
- **Live Status**: Real-time availability updates for faculty (Available, Busy, Meeting).
- **Departmental Filtering**: Students can scan faculty by expertise, cabin number, and academic department.

### 📋 Institutional Governance (Leave & Complaints)
- **Leave Life-cycle**: Multi-tier approval system for Hostel administrators with read-only oversight for Academic and Mess departments.
- **Ticketing System**: Transparent grievance submission and status tracking for campus-wide complaints.

---

## 🛠️ 3. Key Methods & Operations

### Advanced Administrative Engine
- **`src/routes/admin_students.js`**:
    - `Batch Promotion`: Dynamic semester incrementing for departmental cohorts.
    - `Graduation Archival`: Automated CSV generation for graduating batches, followed by data archival and secure account pruning.
- **`src/routes/placements.js`**:
    - `Registration Pipeline`: Logical validation of student applications against drive-specific eligibility criteria.

### Security & UX Operations
- **Single-Window Logic**: Dynamic removal of `target="_blank"` for a unified app experience.
- **Zero-Trust Session Hardening**: Recursive `localStorage` and `sessionStorage` clearance on logout to guarantee session destruction.
- **RBAC Siloing**: Department-aware middleware that prevents horizontal privilege escalation between administrative units.

---

## 📂 4. Repository Structure

- `src/routes/`: Module-specific backend API definitions.
- `public/`: Modular frontend dashboards (Cafe, Faculty, Placement, Leave, Profile).
- `scripts/`: Database seeding and maintenance utilities.
- `.devcontainer/`: Standardized Docker environment configuration.
- `uploads/`: Centralized storage for CSV reports and user-generated media.

&copy; 2025 OneCampus Technical Team. All rights reserved.
