/* --- JAVASCRIPT LOGIC --- */
const slides = document.querySelectorAll('.slide');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const dotsContainer = document.getElementById('dotsContainer');

let currentIndex = 0;
let slideTimer = setInterval(nextSlide, 6000); // Auto-slide every 6 seconds

// Initialize Dots
function initDots() {
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            updateSlides(index);
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    });
}

initDots();
const dots = document.querySelectorAll('.dot');

function updateSlides(index) {
    // Remove active class from current slide and dot
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    // Calculate new index
    currentIndex = (index + slides.length) % slides.length;

    // Add active class to new slide and dot
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
}

function nextSlide() {
    updateSlides(currentIndex + 1);
}

function prevSlide() {
    updateSlides(currentIndex - 1);
}

// Manual Navigation Events
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
});

// Reset timer when user manually clicks to prevent "double jumping"
function resetAutoPlay() {
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 6000);
}

// Custom Toast Notification Logic
function showToast(message) {
    let toast = document.querySelector('.toast-container');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-container';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa-solid fa-lock"></i> <span>${message}</span>`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Protected Route Shield
function handleProtectedRoute(e) {
    const user = JSON.parse(localStorage.getItem('onecampus_user'));
    const href = e.currentTarget.getAttribute('href');

    if (!user) {
        e.preventDefault();
        showToast("Access Restricted: Please login first");

        // Wait a bit for the user to see the toast before redirecting
        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 1200);
        return;
    }

    // Role-based redirection for Cafe Orders
    if (user.role === 'cafe' && (href.includes('CafeH.html') || href.includes('CafeM.html'))) {
        e.preventDefault();
        window.location.href = "../cafe/hotel_view.html";
    }
}

// Attach listeners to protected links
document.querySelectorAll('.nav-links a, .cta-button').forEach(link => {
    const href = link.getAttribute('href');
    // Only protect internal feature links, not auth or hash links
    if (href && !href.includes('login') && href !== '#' && !href.startsWith('http')) {
        link.addEventListener('click', handleProtectedRoute);
    }
});

// Auth State Check
function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('onecampus_user'));
    const authItem = document.getElementById('auth-item');

    if (user) {
        // 1. Update Navigation Links destination if Vendor
        if (user.role === 'cafe') {
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href.includes('CafeH.html') || href.includes('CafeM.html'))) {
                    link.setAttribute('href', '../cafe/hotel_view.html');
                    // Remove target="_blank" for vendors so they stay in their dashboard flow
                    link.removeAttribute('target');
                }
            });
        }

        // 2. Update Auth Dropdown
        if (authItem) {
            let profilePath = "../profile/Ver2/profile_glass.html";
            if (user.role === 'faculty') profilePath = "../profile/Ver2/faculty_profile_glass.html";
            if (user.role === 'cafe') profilePath = "../cafe/hotel_view.html"; // Vendors go to dashboard

            // Inject Dropdown structure into the list item
            authItem.innerHTML = `
                <a href="javascript:void(0)" id="auth-btn">
                    <i class="fa-solid fa-circle-user"></i>
                </a>
                <div class="profile-dropdown">
                    <div class="dropdown-header">
                        <p class="user-name">${user.fullName}</p>
                        <p class="user-role">${user.role}</p>
                    </div>
                    <a href="${profilePath}" class="dropdown-link">
                        <i class="fa-regular fa-user"></i> ${user.role === 'cafe' ? 'Dashboard' : 'Profile'}
                    </a>
                    <div class="dropdown-divider"></div>
                    <button onclick="logoutUser()" class="dropdown-link logout-link">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            `;
        }
    }
}

function logoutUser() {
    localStorage.removeItem('onecampus_user');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', checkAuthState);

