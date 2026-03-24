/**
 * Shared Vendor Logic for logout and session management
 */

document.addEventListener('DOMContentLoaded', () => {
    checkVendorSession();
});

function checkVendorSession() {
    const user = JSON.parse(localStorage.getItem('onecampus_user') || '{}');
    if (!user.cafeName || user.role !== 'cafe') {
        console.warn('Invalid vendor session detected. Redirecting to login...');
        window.location.href = '../login/vendor_login.html';
    }
}

function logoutVendor() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('onecampus_user');
        window.location.href = '../login/vendor_login.html';
    }
}

// Global exposure for onclick handlers
window.logoutVendor = logoutVendor;
