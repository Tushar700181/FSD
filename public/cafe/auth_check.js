(function () {
    const user = JSON.parse(localStorage.getItem('onecampus_user') || 'null');
    const path = window.location.pathname;

    // Redirect if not logged in
    if (!user) {
        window.location.href = '../login/login.html';
        return;
    }

    // Role-based access control
    if (user.role === 'cafe') {
        // Vendors should stay in their own dashboard
        if (!path.includes('hotel_view.html') && !path.includes('manage_menu.html')) {
            window.location.href = 'hotel_view.html';
        }
    } else {
        // Block all non-vendor roles from vendor pages
        if (path.includes('hotel_view.html') || path.includes('manage_menu.html')) {
            // Redirect to home or cafe student view
            alert('Unauthorized: Vendor access only.');
            window.location.href = '../landing/index.html';
        }
    }
})();

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all session and platform data
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../login/login.html';
    }
}
