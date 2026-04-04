// Main Logic
let currentView = 'active'; // 'active' or 'past'

document.addEventListener('DOMContentLoaded', () => {
    const user = StorageUtils.getCurrentUser();
    if (!user) {
        window.location.href = '../login/login.html';
        return;
    } else if (user.role === 'admin') {
        window.location.href = '../complaints/complaint_dashboard.html';
        return;
    }

    // Inject User Info
    document.getElementById('sidebar-name').textContent = user.fullName;
    document.getElementById('sidebar-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('sidebar-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;

    renderDashboard();
    fetchLiveStatus();
    fetchNotifications();
    setupEventListeners();
});

function showSection(view, btnElement) {
    currentView = view;

    // Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // Update Header
    const title = view === 'active' ? 'ACTIVE COMPLAINTS' : 'PAST COMPLAINTS (HISTORY)';
    document.getElementById('section-title').textContent = title;

    renderDashboard();
}

async function renderDashboard() {
    const user = StorageUtils.getCurrentUser();
    if (!user) return;

    const allComplaints = await StorageUtils.getComplaintsForStudent(user.id);
    const stats = await StorageUtils.getStats(user.id);

    // Update Stats
    document.getElementById('total-count').textContent = stats.total;
    document.getElementById('progress-count').textContent = stats.pending + stats.inProgress;
    document.getElementById('resolved-count').textContent = stats.resolved;

    // Update Notification Count (e.g. showing number of resolved tickets as "notifications")
    const notifCount = document.getElementById('nav-notification-count');
    if (notifCount) {
        notifCount.textContent = `(${stats.resolved})`;
    }

    // Filter Logic
    const displayComplaints = allComplaints.filter(c => {
        if (currentView === 'active') {
            return c.status !== 'Resolved';
        } else {
            return c.status === 'Resolved';
        }
    });

    // Render Grid
    const grid = document.getElementById('complaints-grid');
    grid.innerHTML = '';

    if (displayComplaints.length === 0) {
        grid.innerHTML = `<div class="no-data">No ${currentView} complaints found.</div>`;
        return;
    }

    displayComplaints.forEach(c => {
        const card = document.createElement('div');
        card.className = 'complaint-card';

        // Styling logic based on status
        let iconClass = 'pending';
        let iconName = 'ph-clock';
        let progressWidth = '10%';
        let progressColor = 'var(--warning-color)';

        if (c.status === 'In Progress') {
            iconClass = 'pending'; // or a new class
            iconName = 'ph-spinner';
            progressWidth = '50%';
            progressColor = 'var(--accent-color)';
        } else if (c.status === 'Resolved') {
            iconClass = 'resolved';
            iconName = 'ph-check';
            progressWidth = '100%';
            progressColor = 'var(--success-color)';
        }

        // Only show progress bar for active items
        const showProgress = c.status !== 'Resolved';
        const progressHTML = showProgress
            ? `<div class="card-progress"><div class="fill" style="width: ${progressWidth}; background-color: ${progressColor}"></div></div>`
            : `<div class="card-progress" style="background:none;"></div>`;

        // Format Date
        const dateObj = new Date(c.timestamp);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Attachment Indicator (Multiple)
        let attachmentHTML = '';
        if (c.images && c.images.length > 0) {
            attachmentHTML = `<div style="font-size:0.75rem; color:#6b7280; margin-top:4px; display:flex; align-items:center; gap:4px;">
                 <i class="ph-bold ph-paperclip"></i> ${c.images.length} Attachment(s)
               </div>`;
        } else if (c.image) {
            // Backward compatibility for single image
            attachmentHTML = `<div style="font-size:0.75rem; color:#6b7280; margin-top:4px; display:flex; align-items:center; gap:4px;">
                 <i class="ph-bold ph-paperclip"></i> 1 Attachment
               </div>`;
        }

        card.innerHTML = `
            <div class="card-icon ${iconClass}">
                <i class="ph-bold ${iconName}"></i>
            </div>
            <div class="card-content">
                <div class="card-header-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                     <div class="card-category" style="font-size:0.75rem; color:#888; text-transform:uppercase; letter-spacing:0.5px;">${c.category}</div>
                     <div class="card-id" style="font-size:0.75rem; color:#aaa;">#${c.id.split('-')[1]}</div>
                </div>
                <div class="card-title">${c.title}</div>
                ${attachmentHTML}
                
                ${progressHTML}
                
                <div class="card-meta">Assigned to: ${c.assignedTo}</div>
                
                <div class="card-footer">
                    <span class="status-text ${iconClass}">${c.status} &bull; ${dateStr}</span>
                    <a href="#" onclick="viewDetails('${c.id}')">View Details</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Modal Logic
const modal = document.getElementById('complaintModal');
const detailsModal = document.getElementById('detailsModal');

window.openModal = function () { modal.classList.add('open'); }
window.closeModal = function () { modal.classList.remove('open'); }

window.openDetailsModal = function () { detailsModal.classList.add('open'); }
window.closeDetailsModal = function () { detailsModal.classList.remove('open'); }

function setupEventListeners() {
    window.onclick = function (event) {
        if (event.target == modal) closeModal();
        if (event.target == detailsModal) closeDetailsModal();
    }

    const form = document.getElementById('newComplaintForm');
    if (form) {
        form.onsubmit = async (e) => await handleFormSubmit(e);
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'ph-check-circle' : 'ph-exclamation-circle';
    const iconColor = type === 'success' ? 'var(--accent-green)' : '#ef4444';

    toast.innerHTML = `
        <i class="ph-bold ${icon} toast-icon" style="color: ${iconColor}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Initial trigger for animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto-remove after 4s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    // Gather Data
    const categorySelector = e.target.querySelector('#complaintCategory') || e.target.querySelector('select');
    const category = categorySelector.value;
    const title = e.target.querySelector('input[type="text"]').value;
    const description = e.target.querySelector('textarea').value;
    const fileInput = e.target.querySelector('input[type="file"]');

    // Handle Multiple Files
    const images = [];
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            images.push({ name: fileInput.files[i].name });
        }
    }

    if (!title || !description) {
        showNotification("Please fill in both title and description.", 'error');
        return;
    }

    // Submit to Storage
    const newComplaint = await StorageUtils.addComplaint({
        title,
        category,
        description,
        images: images,
        image: images.length > 0 ? images[0] : null
    });

    if (newComplaint) {
        showNotification("Complaint Registered Successfully!");
        renderDashboard();
        closeModal();
        e.target.reset();
    } else {
        showNotification("Failed to submit complaint. Please try again.", 'error');
    }
}

async function viewDetails(id) {
    const complaints = await StorageUtils.getAllComplaints();
    const c = complaints.find(item => item.id === id);
    if (!c) return;

    const content = document.getElementById('detailsContent');
    const dateStr = new Date(c.timestamp).toLocaleString();

    // Images HTML
    let imagesHTML = '';
    if (c.images && c.images.length > 0) {
        imagesHTML = `<div style="margin-top:10px; font-weight:bold;">Attachments:</div>`;
        c.images.forEach(img => {
            imagesHTML += `<div style="background:#f9fafb; padding:8px; margin-top:5px; border-radius:6px; display:flex; align-items:center; gap:8px;">
                <i class="ph-bold ph-image"></i> ${img.name}
            </div>`;
        });
    }

    content.innerHTML = `
        <div style="font-size:0.85rem; color:#6b7280; text-transform:uppercase; font-weight:600; margin-bottom:5px;">
            ${c.category} &bull; ${c.id}
        </div>
        <h2 style="font-size:1.5rem; font-weight:700; color:#111827; margin-bottom:10px;">${c.title}</h2>
        <div style="display:flex; gap:10px; margin-bottom:20px;">
             <span class="status-text" style="background:#f3f4f6; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:600;">Status: ${c.status}</span>
             <span style="font-size:0.8rem; color:#6b7280; padding-top:4px;">Date: ${dateStr}</span>
        </div>
        
        <div style="background:#f9fafb; padding:16px; border-radius:8px; margin-bottom:20px;">
            <label style="display:block; font-size:0.8rem; font-weight:600; color:#4b5563; margin-bottom:6px;">Description</label>
            <p style="color:#1f2937; line-height:1.6;">${c.description}</p>
        </div>
        
        <div style="border-top:1px solid #e5e7eb; padding-top:16px;">
            <div style="font-size:0.9rem; font-weight:600; margin-bottom:10px;">Department Updates</div>
            <div style="display:flex; gap:10px; align-items:start;">
                <div style="width:30px; height:30px; background:#dbeafe; color:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i class="ph-fill ph-user"></i>
                </div>
                <div>
                     <div style="font-size:0.85rem; font-weight:600;">${c.assignedTo}</div>
                     <div style="font-size:0.8rem; color:#6b7280;">assigned this ticket to themselves.</div>
                </div>
            </div>
            <!-- More fake updates could go here -->
        </div>

        ${imagesHTML}
    `;

    openDetailsModal();
}

async function fetchLiveStatus() {
    const user = StorageUtils.getCurrentUser();
    if (!user) return;

    try {
        // 1. Fetch Latest Cafe Order
        const cafeRes = await fetch(`/api/cafe/orders/user/${user.id}`);
        const cafeData = await cafeRes.json();
        const orderStatusEl = document.getElementById('cafe-order-status');
        const cafeProgressEl = document.getElementById('cafe-progress');
        
        if (cafeData.success && cafeData.orders && cafeData.orders.length > 0) {
            const latest = cafeData.orders[0];
            orderStatusEl.textContent = latest.status;
            // Map status to progress
            const progressMap = { 'Pending': '20%', 'Preparing': '50%', 'Ready': '100%', 'Delivered': '100%' };
            cafeProgressEl.style.width = progressMap[latest.status] || '10%';
        }

        // 2. Fetch Next Placement Drive
        const placementRes = await fetch('/api/placements');
        const placementData = await placementRes.json();
        const placementNextEl = document.getElementById('placement-next');
        
        if (placementData.success && placementData.placements && placementData.placements.length > 0) {
            const nextDrive = placementData.placements[0]; // Assuming sorted by date
            placementNextEl.textContent = `${nextDrive.company} (${nextDrive.date})`;
        }
    } catch (err) {
        console.error('Error fetching live status:', err);
    }
}

async function fetchNotifications() {
    const user = StorageUtils.getCurrentUser();
    if (!user) return;

    try {
        // Aggregate notifications from multiple sources (Complaints, Cafe, Leaves)
        const stats = await StorageUtils.getStats(user.id);
        const unreadCount = stats.resolved; // Simple demo mapping: Resolved complaints count as notifications

        const badge = document.getElementById('notification-badge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}



