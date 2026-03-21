# OneCampus: Comprehensive Operational & Technical Manual

This document provides an exhaustive breakdown of every sub-application, operational workflow, and security layer within the OneCampus ecosystem.

---

## 🍽️ 1. CampusEats: Hotel & Item Management

OneCampus features a decentralized Cafe management system where each vendor controls their own culinary environment.

### 🛠️ Item Management (Vendor Dashboard)
Cafe vendors have full CRUD (Create, Read, Update, Delete) control over their digital menus via `src/routes/menus.js`:
- **Item Fields**: Name, Price (Numeric), Image URL, CafeName, and Availability Toggle.
- **Dynamic Status**: Vendors can toggle any item to "Unavailable" instantly to reflect real-time stock levels.
- **Rating System**: Integrated user feedback loop allowing students to submit 1-5 star ratings with comments. The system dynamically calculates `averageRating` and `totalRatings` on every submission.

### 📦 Order Fulfillment Pipeline
Located in `src/routes/orders.js`, the order flow ensures transparency:
- **Placement**: Students select items, calculate totals, and place orders.
- **Tracking**: Orders progress through lifecycle stages: `Pending` -> `Preparing` -> `Ready` -> `Completed`.
- **Persistence**: Full order history is maintained for both vendors and students.

---

## ⚖️ 2. Institutional Governance: Complaint Management

The ticketing system is strictly departmentalized to ensure that grievances reach the correct administrative eyes.

### 📂 Departmentalized Lifecycles
Complaints are routed via the `assignedTo` attribute in `src/routes/complaints.js`:
- **Hostel Complaint Management**: Dedicated queue for room maintenance, cleaning, and facilities, accessible only by **Hostel Administrators**.
- **Mess Complaint Management**: Focused on food quality and cafeteria services, accessible only by **Mess Administrators**.
- **Cross-Department Oversight**: Academic Administrators retain "Super-Admin" visibility to ensure overall campus harmony.

### 🎟️ Ticketing Operations
- **ID Generation**: Automated custom ID generation following the `CMP-1001` sequential pattern.
- **Resolution Flow**: Admins provide a structured `adminResponse` and update the status to `Resolved`, which triggers a real-time update on the student's dashboard.

---

## 🛡️ 3. Security & RBAC Architecture

### The Zero-Trust Middleware (`auth.js`)
Security is enforced at the network layer before any data is processed:
1. **`authenticate`**: Validates the session token against the user database.
2. **`authorize(['admin', 'cafe'], ['Hostel', 'Academic'])`**: A strict multi-key check that verifies BOTH the user role and their administrative department.

### Departmental Silos
- **The Cafe Wall**: Vendors are technically prevented from even querying administrative data.
- **Management Isolation**: A Hostel Administrator cannot "accidentally" view or modify academic promotion records, and vice versa.

---

## 🚀 4. Technical Infrastructure & DevOps

### Deployment via Docker
OneCampus is built for "One-Click Deployment" using the included Docker configuration in `.devcontainer/`:
- **`app` Service**: Provisions a Node.js 20 environment with automated port forwarding on `5000`.
- **`db` Service**: Spawns a dedicated MongoDB instance with persistent volume mapping to `mongodb-data`.

### Administrative Batch Engine
- **Graduation Archival**: Critical logic (`src/routes/admin_students.js`) that exports graduating batch data to CSV before clearing database records, maintaining a lean production environment.
- **Semester Promotion**: Mass-update operations for student cohorts across different engineering departments.

&copy; 2025 OneCampus Technical Team. All rights reserved.
