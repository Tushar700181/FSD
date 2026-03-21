# OneCampus 🛡️ The Ultimate Campus Ecosystem

OneCampus is a production-grade, full-stack university management platform designed to unify student life, career placement, and administrative governance.

## 🌟 Core Application Suite

### 🍔 CampusEats (Cafe & Hotel Management)
- **Vendors**: Manage your digital storefront, curate menu items, and track order fulfillment in real-time.
- **Item Management**: Dynamic pricing, availability toggling, and integrated customer rating analytics.
- **Students**: Browse live menus, place orders, and rate your culinary experience.

### 🏢 Governance & Support (Complaints & Leaves)
- **Hostel Management**: Dedicated dashboard for hostel leaves and facility complaints.
- **Mess Governance**: Specialized portal for mess rebate tracking and cafeteria grievances.
- **Ticketing System**: Sequential ID tracking (`CMP-1001+`) with departmental resolution pipelines.

### 🎓 Academic & Career (TPO & Faculty)
- **TPO Hub**: End-to-end placement drive management and recruiter statistics.
- **Faculty Sync**: Live availability tracking and appointment scheduling.
- **Admin Engine**: Automated semester promotions and batch graduation data archival.

## 🔒 Security Architecture

- **Departmental Isolation**: Absolute silos between Hostel, Academic, and Mess administrative units.
- **Zero-Trust Auth**: Multi-tier backend middleware (`auth.js`) and frontend route guards.
- **Session Hardening**: Unified, deep session destruction on logout.

## ⚙️ Deployment & Stack

- **Tech**: Node.js, Express, Native MongoDB.
- **DevOps**: Fully containerized via **Docker** (Node 20 + MongoDB).
- **Setup**: `npm install` -> `npm run seed` -> `npm run dev`.

---

### [📄 Full Operational Manual](docs/TECHNICAL_OVERVIEW.md)
*Deep-dive into API logic, Database Schema, and RBAC implementation.*

&copy; 2025 OneCampus Team. All rights reserved.
