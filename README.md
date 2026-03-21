# OneCampus 🛡️ Unified University Ecosystem

OneCampus is a premium, full-stack management platform that unifies student life, career growth, and administrative governance. Designed with a security-first philosophy, it provides a seamless interface for students, faculty, and campus administrators.

## 🚀 The OneCampus Experience

### For Students
- **CampusEats**: Pre-order meals and skip the queue.
- **Expertise Hub**: Locate and connect with faculty based on expertise.
- **Digital Governance**: Submit leave forms and track complaints in real-time.

### For Faculty
- **Presence Management**: Update availability status instantly for student transparency.
- **Appointment Management**: Streamline student-faculty interactions.

### For TPO & Administrators
- **Career Portal**: Manage placement drives and recruitment analytics.
- **Operations Engine**: Automate batch promotions and graduation archival.
- **Security Silos**: Department-specific isolation for Hostel, Academic, and Mess administrators.

## 🛠️ Technical Prowess

- **Modern Stack**: Node.js, Express, and Native MongoDB.
- **Containerized**: Instant setup via **Docker** and DevContainers.
- **Security**: Robust RBAC (Role-Based Access Control) with zero-trust departmental silos.
- **User Experience**: Consolidated single-tab navigation and glassmorphic UI.

---

### [📄 Comprehensive Technical Manual](docs/TECHNICAL_OVERVIEW.md)
*Detailed breakdown of modules, API logic, and security architecture.*

## ⚙️ Quick Start

### 🐳 Via Docker (Recommended)
Simply open the project in VS Code with the **Dev Containers** extension. Docker will automatically provision the Node.js and MongoDB environment.

### 💻 Local Setup
1.  `npm install`
2.  Set `MONGODB_URI` and `ADMIN_KEY` in `.env`.
3.  `npm run seed` (to initialize the database).
4.  `npm run dev`.

&copy; 2025 OneCampus Team. All rights reserved.
