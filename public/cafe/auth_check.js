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
    } else if (user.role === 'student' || user.role === 'faculty') {
        // Students/Faculty shouldn't access vendor pages
        if (path.includes('hotel_view.html') || path.includes('manage_menu.html')) {
            window.location.href = 'CafeH.html';
        }
    }
})();

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('onecampus_user');
        localStorage.removeItem('cafe_cart');
        localStorage.removeItem('cafe_order_type');
        window.location.href = '../login/login.html';
    }
}
