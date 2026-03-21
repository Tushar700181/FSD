/**
 * ONE CAMPUS STORAGE UTILITY (Backend Integrated)
 * Handles all interactions with the MongoDB Backend for the Complaint Register.
 */

const StorageUtils = {
    // Session Management (Bridging with existing Auth system)
    getCurrentUser() {
        // Use the same key as the main Auth system
        return JSON.parse(localStorage.getItem('onecampus_user'));
    },

    login(userId) {
        // This is primarily for testing/mocking roles quickly
        // In the real flow, the Login page handles this
        console.warn("StorageUtils.login() is deprecated. Real auth is handled by the login page.");
    },

    logout() {
        localStorage.removeItem('onecampus_user');
        window.location.href = '../login/login.html';
    },

    // Complaint Management (API CALLS)
    async getAllComplaints() {
        const user = this.getCurrentUser();
        if (!user) return [];

        try {
            let url = '';
            if (user.role === 'admin') {
                url = `/api/complaints/dept/${user.department}`;
            } else {
                url = `/api/complaints/student/${user.id}`;
            }

            const response = await fetch(url, {
                headers: { 'x-user-id': user.id || user._id }
            });
            const data = await response.json();
            return data.success ? data.complaints : [];
        } catch (err) {
            console.error("Fetch complaints error:", err);
            return [];
        }
    },

    async getComplaintsForStudent(studentId) {
        const user = this.getCurrentUser();
        try {
            const response = await fetch(`/api/complaints/student/${studentId}`, {
                headers: { 'x-user-id': user.id || user._id }
            });
            const data = await response.json();
            return data.success ? data.complaints : [];
        } catch (err) {
            console.error("Fetch student complaints error:", err);
            return [];
        }
    },

    async addComplaint(complaintData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        const body = {
            ...complaintData,
            studentId: currentUser.id,
            studentName: currentUser.fullName,
            requesterRole: currentUser.role,
            assignedTo: complaintData.category // Auto-assign by category
        };

        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': currentUser.id || currentUser._id
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return data.success ? data.complaint : null;
        } catch (err) {
            console.error("Add complaint error:", err);
            return null;
        }
    },

    async updateComplaintStatus(id, newStatus, assignedTo, responseText) {
        const user = this.getCurrentUser();
        try {
            const body = {};
            if (newStatus) body.status = newStatus;
            if (responseText) body.adminResponse = responseText;

            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-user-id': user.id || user._id 
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return data.success ? data.complaint : null;
        } catch (err) {
            console.error("Update complaint error:", err);
            return null;
        }
    },

    async getStats(studentId = null) {
        // For now, fetch all and calculate stats client-side
        const complaints = await (studentId ? this.getComplaintsForStudent(studentId) : this.getAllComplaints());
        return {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'Pending').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length
        };
    },

    init() {
        console.log("StorageUtils initialized (API connected)");
        // No more local seeding needed as MongoDB handles it
    }
};

// Initialize on load
StorageUtils.init();
