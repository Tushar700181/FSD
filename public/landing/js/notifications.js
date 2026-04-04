/**
 * Global Notification Handler for OneCampus
 * Unifies alerts from Cafe, Placements, and Complaints
 */
const NotificationHandler = {
    async init() {
        const user = JSON.parse(localStorage.getItem('onecampus_user'));
        if (!user) return;

        // Add Bell click listener if it exists
        const bellBtn = document.getElementById('notification-btn') || document.querySelector('.ph-bell')?.parentElement;
        if (bellBtn) {
            bellBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePanel();
            });
        }

        // Initial fetch
        this.fetchNotifications(user.id);
        
        // Poll every 60 seconds
        setInterval(() => this.fetchNotifications(user.id), 60000);
    },

    async fetchNotifications(userId) {
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
                this.updateBadge(data.notifications.length);
                this.renderNotifications(data.notifications);
            }
        } catch (err) {
            console.error('Notification fetch failed:', err);
        }
    },

    updateBadge(count) {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
            badge.style.display = 'flex';
        } else {
            badge.classList.add('hidden');
            badge.style.display = 'none';
        }
    },

    togglePanel() {
        let panel = document.getElementById('notification-panel');
        if (!panel) {
            panel = this.createPanel();
        }
        panel.classList.toggle('open');
    },

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.innerHTML = `
            <div class="notif-header">
                <h3>Notifications</h3>
                <button onclick="document.getElementById('notification-panel').classList.remove('open')">&times;</button>
            </div>
            <div id="notif-list" class="notif-list">
                <p class="notif-empty">No new notifications</p>
            </div>
        `;

        // Apply styles
        Object.assign(panel.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            width: '320px',
            maxHeight: '450px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: '10000',
            display: 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #eee'
        });

        // Add CSS for the "open" state and list items
        const style = document.createElement('style');
        style.textContent = `
            #notification-panel.open { display: flex !important; animation: slideIn 0.3s ease; }
            @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .notif-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .notif-header h3 { margin: 0; font-size: 1rem; color: #1e293b; }
            .notif-header button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
            .notif-list { overflow-y: auto; flex: 1; }
            .notif-item { padding: 15px 20px; border-bottom: 1px solid #f8fafc; transition: background 0.2s; cursor: pointer; }
            .notif-item:hover { background: #f1f5f9; }
            .notif-item.unread { background: #f0f9ff; }
            .notif-title { font-weight: 600; font-size: 0.85rem; color: #1e293b; margin-bottom: 4px; }
            .notif-msg { font-size: 0.8rem; color: #64748b; line-height: 1.4; }
            .notif-time { font-size: 0.7rem; color: #94a3b8; margin-top: 6px; }
            .notif-empty { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 0.85rem; }
        `;
        document.head.appendChild(style);
        document.body.appendChild(panel);
        return panel;
    },

    renderNotifications(notifs) {
        const list = document.getElementById('notif-list');
        if (!list) return;

        if (notifs.length === 0) {
            list.innerHTML = '<p class="notif-empty">No recent updates</p>';
            return;
        }

        list.innerHTML = notifs.map(n => {
            const date = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="notif-item">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-msg">${n.message}</div>
                    <div class="notif-time">${date}</div>
                </div>
            `;
        }).join('');
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationHandler.init());
} else {
    NotificationHandler.init();
}
