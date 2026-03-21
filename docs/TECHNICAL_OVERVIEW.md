# OneCampus: Technical Architecture & Security Overview

This document provides a deep dive into the core technical implementations, security layers, and operational logic that define the production-ready OneCampus platform.

## 1. Role-Based Access Control (RBAC)

The platform utilizes a strictly siloed RBAC model to ensure that different administrative departments operate without data crosstalk.

### Core Roles & Permissions
| Role | Primary Functions | Access Restricted Areas |
| :--- | :--- | :--- |
| **Student** | Cafe Orders, Leave Applications, Complaints | All Admin Dashboards |
| **Faculty** | Availability Tracking, Appointment Bookings | Portal Administration |
| **TPO** | Placement Drives, Alumni Database, Stats | Leave Management, Complaints, Cafe Vendor Portal |
| **Admin (Hostel)** | Full Leave/Rebate Approval Life-cycle | Academic Promotion, Cafe Vendor Portal |
| **Admin (Academic)** | Batch Promotion, Graduation, Faculty Grid | Leave Approval (View Only), Cafe Vendor Portal |
| **Admin (Mess)** | Leave Records (View Only) | Academic Promotion, Hostel Admin |
| **Cafe Vendor** | Order Fulfillment, Menu Management | All Academic/Hostel/Placement Portals |

## 2. Security Infrastructure

### Backend Authentication (`auth.js`)
All sensitive API routes are protected by a two-tier middleware system:
- **`authenticate`**: Verifies the session ID against the MongoDB `users` collection.
- **`authorize(roles, departments)`**: A higher-order function that enforces both top-level roles and department-specific isolation for administrators.

### Frontend Security Guards (`auth_check.js`)
Frontend routes use an autonomous guard script that:
- Prevents unauthenticated access via local storage verification.
- Implements **Unauthorized Overlays** (animated Rose-themed blocks) and alerts to prevent manual URL tampering.
- Strictly isolates the **Cafe Vendor Portal** environment from academic administrators.

## 3. Advanced Administrative Operations

### Batch Promotion & Graduation
Implemented in `src/routes/admin_students.js`, the promotion logic handles:
- **Semester Increment**: Mass updates for specific departments and batches.
- **Graduation (Sem 8)**: A critical process that generates a **CSV backup**, archives the data to `/uploads/graduated_records/`, and then permanently deletes the graduated accounts to maintain system efficiency.

### Read-Only "Viewer" Mode
Implemented for Academic and Mess admins within the **Leave Admin** portal. 
- **Dynamic UI Transformation**: Action buttons (Approve/Reject) are replaced with a "View Details" button.
- **Departmental Logic**: The system detects the user's department and automatically strips modification privileges for non-Hostel administrators.

## 4. UX & Navigation Polish

### Tab Management
To resolve "tab explosion," the platform enforces single-window navigation for all internal modules.
- **Recursive Logic**: `index.html` dynamically removes `target="_blank"` attributes for internal redirects.
- **Consistency**: Unified "Home" buttons across all deep-linked management portals ensure a cohesive application feel.

### Global Session Termination
The logout routine performs a recursive `localStorage.clear()` and `sessionStorage.clear()`, ensuring absolutely no user data, cart state, or authentication tokens persist between sessions.
