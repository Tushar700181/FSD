# OneCampus 🛡️ Unified Student Management System

OneCampus is a premium, full-stack campus management platform designed to unify student life, career placement, and administrative operations into a single, secure environment.

## 🌟 Key Features

- 🎓 **Career Hub (TPO)**: Full-lifecycle placement drive management, alumni tracking, and recruitment statistics.
- 📋 **Leave & Mess Management**: Digital leave forms with multi-department read-only oversight and Hostel-exclusive approvals.
- 👨‍🏫 **Faculty Availability**: Real-time faculty status tracking and appointment booking system.
- 🍔 **CampusEats**: A robust Cafe ordering system with a completely isolated vendor-management dashboard.
- ⚖️ **Complaints & Ticketing**: Role-based grievance submission and administrative resolution.
- 🚀 **Academic Management**: Automated batch promotion and graduation exports.

## 🔒 Security First

OneCampus implements a **Zero-Trust Administrative Model**:
- **Departmental Isolation**: TPOs, Academic Admins, and Hostel Admins are strictly barred from each other's sensitive management zones.
- **Isolated Vendor Logic**: The Cafe management portal is technically and logically separated from the broader academic environment.
- **Verified Operations**: Critical actions like batch graduation require high-level verification keys and multi-tier authorization.

## 🛠️ Technical Overview

The platform is built on a modern **Node.js, Express, and MongoDB** stack, utilizing a tailored RBAC (Role-Based Access Control) architecture.

- **Frontend**: Vanilla JS with premium Tailwind CSS and Phosphor Icons for a glassmorphic UI.
- **Backend Architecture**: Department-aware middleware guards every API endpoint.
- **Session Security**: Unified, secure session termination ensures no client-side persistence.

---

### [📄 Read the Full Technical Overview](docs/TECHNICAL_OVERVIEW.md)
*Detailed documentation on RBAC, Security Layers, and Batch Operations.*

## 🚀 Quick Start (Local)

1. **Install Dependencies**: `npm install`
2. **Configure Environment**: Set your MongoDB URI and Admin Keys in a `.env` file.
3. **Run Dev Server**: `npm run dev`
4. **Access Portal**: `http://localhost:5000/landing/index.html`

&copy; 2025 OneCampus Team. All rights reserved.
