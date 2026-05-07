/* ==========================================
   Admin Panel Module — Full Moderation System
   ==========================================
   Isolated admin panel with sidebar navigation.
   5 sections: Dashboard, Pending Listings,
   User Management, Reports, Flagged Listings.
   ========================================== */

const AdminPanel = (() => {

    let currentTab = 'dashboard';

    /* ─── LAYOUT ─── */

    async function render() {
        const user = Auth.getCurrentUser();
        if (!user || user.role !== 'admin') {
            return `
                <div class="auth-page">
                    <div class="auth-card" style="text-align:center">
                        <h2>🔒 Access Denied</h2>
                        <p>Only administrators can access this panel.</p>
                        <a href="#home" class="btn btn-primary">Go Home</a>
                    </div>
                </div>`;
        }

        currentTab = 'dashboard';

        return `
        <div class="adm-layout" id="adminLayout">
            <aside class="adm-sidebar" id="adminSidebar">
                <div class="adm-sidebar__brand">
                    <div class="adm-sidebar__logo">🛡️</div>
                    <div>
                        <strong>Flatifigo</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>
                <nav class="adm-sidebar__nav">
                    <button class="adm-nav-item adm-nav-item--active" data-tab="dashboard">
                        <span class="adm-nav-icon">📊</span> Dashboard
                    </button>
                    <button class="adm-nav-item" data-tab="pending">
                        <span class="adm-nav-icon">⏳</span> Pending Listings
                        <span class="adm-nav-badge" id="navPendingBadge"></span>
                    </button>
                    <button class="adm-nav-item" data-tab="users">
                        <span class="adm-nav-icon">👥</span> User Management
                    </button>
                    <button class="adm-nav-item" data-tab="reports">
                        <span class="adm-nav-icon">📋</span> Reports
                        <span class="adm-nav-badge" id="navReportBadge"></span>
                    </button>
                    <button class="adm-nav-item" data-tab="flagged">
                        <span class="adm-nav-icon">🚩</span> Flagged Listings
                        <span class="adm-nav-badge adm-nav-badge--danger" id="navFlaggedBadge"></span>
                    </button>
                </nav>
                <div class="adm-sidebar__footer">
                    <div class="adm-sidebar__user">
                        <div class="adm-sidebar__avatar">${(user.fullName || 'A')[0]}</div>
                        <div>
                            <strong>${Sanitizer.escape(user.fullName || 'Admin')}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>
                    <button class="adm-logout-btn" id="adminLogoutBtn">🚪 Logout</button>
                </div>
            </aside>
            <main class="adm-main" id="adminMainContent">
                <div class="adm-loading"><div class="adm-spinner"></div><p>Loading dashboard...</p></div>
            </main>
            <button class="adm-sidebar-toggle" id="adminSidebarToggle" aria-label="Toggle sidebar">☰</button>
        </div>`;
    }

    /* ─── EVENTS ─── */

    function attachEvents() {
        // Load dashboard
        loadTab('dashboard');

        // Sidebar navigation
        document.querySelectorAll('.adm-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                if (tab === currentTab) return;
                currentTab = tab;
                document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.remove('adm-nav-item--active'));
                btn.classList.add('adm-nav-item--active');
                loadTab(tab);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                App.updateNav();
                showAdminLayout(false);
                App.showToast('info', 'Logged Out', 'You have been logged out.');
                window.location.hash = '#home';
            });
        }

        // Mobile sidebar toggle
        const toggle = document.getElementById('adminSidebarToggle');
        const sidebar = document.getElementById('adminSidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('adm-sidebar--open');
            });
        }

        // Event delegation on main content
        const main = document.getElementById('adminMainContent');
        if (main) {
            main.addEventListener('click', handleMainClick);
        }
    }

    async function handleMainClick(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        btn.disabled = true;
        btn.style.opacity = '0.5';

        try {
            let result;
            switch (action) {
                case 'approve-listing':
                    result = await API.adminApproveListing(id);
                    if (result.success) {
                        App.showToast('success', 'Approved', result.message);
                        removeRow(id);
                        updateBadge('navPendingBadge', -1);
                    }
                    break;
                case 'reject-listing':
                    result = await API.adminRejectListing(id);
                    if (result.success) {
                        App.showToast('success', 'Rejected', result.message);
                        removeRow(id);
                        updateBadge('navPendingBadge', -1);
                    }
                    break;
                case 'block-user':
                    result = await API.adminBlockUser(id);
                    if (result.success) {
                        App.showToast('success', 'Blocked', result.message);
                        loadTab('users');
                    }
                    break;
                case 'unblock-user':
                    result = await API.adminUnblockUser(id);
                    if (result.success) {
                        App.showToast('success', 'Unblocked', result.message);
                        loadTab('users');
                    }
                    break;
                case 'resolve-report':
                    result = await API.adminResolveReport(id);
                    if (result.success) {
                        App.showToast('success', 'Resolved', result.message);
                        removeRow(id);
                        updateBadge('navReportBadge', -1);
                    }
                    break;
                case 'delete-flagged':
                    if (!confirm('Permanently delete this listing? This cannot be undone.')) {
                        btn.disabled = false; btn.style.opacity = '1'; return;
                    }
                    result = await API.adminDeleteFlaggedListing(id);
                    if (result.success) {
                        App.showToast('success', 'Deleted', result.message);
                        removeRow(id);
                        updateBadge('navFlaggedBadge', -1);
                    }
                    break;
                case 'approve-flagged':
                    result = await API.adminApproveListing(id);
                    if (result.success) {
                        App.showToast('success', 'Approved', 'Flagged listing has been approved.');
                        removeRow(id);
                        updateBadge('navFlaggedBadge', -1);
                    }
                    break;
            }
            if (result && !result.success) {
                App.showToast('error', 'Error', result.message || 'Action failed.');
                btn.disabled = false; btn.style.opacity = '1';
            }
        } catch (err) {
            App.showToast('error', 'Network Error', 'Could not complete the action.');
            btn.disabled = false; btn.style.opacity = '1';
        }
    }

    function removeRow(id) {
        const row = document.querySelector(`[data-row-id="${id}"]`);
        if (row) {
            row.style.transition = 'all 0.35s ease';
            row.style.opacity = '0';
            row.style.transform = 'translateX(20px)';
            setTimeout(() => {
                row.remove();
                // Check if table/grid is empty
                const container = document.getElementById('adminTabContent');
                if (container) {
                    const remaining = container.querySelectorAll('[data-row-id]');
                    if (remaining.length === 0) {
                        const empty = container.querySelector('.adm-content-area');
                        if (empty) empty.innerHTML = renderEmpty('All clear!', 'No items remaining in this section.');
                    }
                }
            }, 350);
        }
    }

    function updateBadge(badgeId, delta) {
        const badge = document.getElementById(badgeId);
        if (!badge) return;
        const current = parseInt(badge.textContent) || 0;
        const newVal = Math.max(0, current + delta);
        badge.textContent = newVal > 0 ? newVal : '';
    }

    /* ─── TAB LOADERS ─── */

    async function loadTab(tab) {
        const main = document.getElementById('adminMainContent');
        if (!main) return;
        main.innerHTML = `<div class="adm-loading"><div class="adm-spinner"></div><p>Loading...</p></div>`;

        try {
            switch (tab) {
                case 'dashboard': await loadDashboard(main); break;
                case 'pending': await loadPending(main); break;
                case 'users': await loadUsers(main); break;
                case 'reports': await loadReports(main); break;
                case 'flagged': await loadFlagged(main); break;
            }
        } catch (err) {
            main.innerHTML = renderEmpty('⚠️ Error', 'Failed to load data. Please try again.');
            console.error('[Admin]', err);
        }
    }

    /* ── Dashboard ── */
    async function loadDashboard(main) {
        const result = await API.getAdminStats();
        if (!result.success) { main.innerHTML = renderEmpty('Error', 'Could not load stats.'); return; }
        const s = result.stats;

        // Update sidebar badges
        setBadge('navPendingBadge', s.pendingListings);
        setBadge('navReportBadge', s.totalReports);
        setBadge('navFlaggedBadge', s.flaggedListings);

        main.innerHTML = `
            <div class="adm-page animate-fade-in">
                <div class="adm-page__header">
                    <h1>Dashboard</h1>
                    <p>Platform overview and key metrics</p>
                </div>
                <div class="adm-stats-grid">
                    ${statCard('👥', 'Total Users', s.totalUsers, 'blue')}
                    ${statCard('🏠', 'Total Listings', s.totalListings, 'green')}
                    ${statCard('⏳', 'Pending', s.pendingListings, 'gold')}
                    ${statCard('📋', 'Open Reports', s.totalReports, 'orange')}
                    ${statCard('🚩', 'Flagged', s.flaggedListings, 'red')}
                </div>
                <div class="adm-quick-actions">
                    <h3>Quick Actions</h3>
                    <div class="adm-quick-grid">
                        <button class="adm-quick-btn" onclick="document.querySelector('[data-tab=pending]').click()">⏳ Review Pending Listings</button>
                        <button class="adm-quick-btn" onclick="document.querySelector('[data-tab=users]').click()">👥 Manage Users</button>
                        <button class="adm-quick-btn" onclick="document.querySelector('[data-tab=reports]').click()">📋 View Reports</button>
                        <button class="adm-quick-btn" onclick="document.querySelector('[data-tab=flagged]').click()">🚩 Flagged Listings</button>
                    </div>
                </div>
            </div>`;
    }

    function statCard(icon, label, value, color) {
        return `
            <div class="adm-stat-card adm-stat-card--${color}">
                <div class="adm-stat-card__icon">${icon}</div>
                <div class="adm-stat-card__data">
                    <span class="adm-stat-card__value">${value}</span>
                    <span class="adm-stat-card__label">${label}</span>
                </div>
            </div>`;
    }

    /* ── Pending Listings ── */
    async function loadPending(main) {
        const result = await API.getAdminPendingListings();
        if (!result.success) { main.innerHTML = renderEmpty('Error', 'Could not load pending listings.'); return; }
        const listings = result.listings || [];
        setBadge('navPendingBadge', listings.length);

        if (listings.length === 0) {
            main.innerHTML = `<div class="adm-page animate-fade-in"><div class="adm-page__header"><h1>Pending Listings</h1><p>Listings waiting for your review</p></div>${renderEmpty('✅ All caught up!', 'No pending listings to review.')}</div>`;
            return;
        }

        main.innerHTML = `
            <div class="adm-page animate-fade-in">
                <div class="adm-page__header"><h1>Pending Listings</h1><p>${listings.length} listing${listings.length !== 1 ? 's' : ''} awaiting review</p></div>
                <div class="adm-content-area" id="adminTabContent">
                    ${listings.map(renderPendingCard).join('')}
                </div>
            </div>`;
    }

    function renderPendingCard(l) {
        const imgSrc = (l.images && l.images.length > 0) ? Sanitizer.sanitizeUrl(API.getAssetUrl(`/uploads/${l.images[0]}`)) : '';
        return `
            <div class="adm-listing-row" data-row-id="${Sanitizer.escapeAttr(l.id)}">
                <div class="adm-listing-row__img">${imgSrc ? `<img src="${imgSrc}" alt="">` : '<span>🏠</span>'}</div>
                <div class="adm-listing-row__info">
                    <strong>${Sanitizer.escape(l.title)}</strong>
                    <span>📍 ${Sanitizer.escape(ListingService.getCityLabel(l.city))}, ${Sanitizer.escape(l.area)} · ${ListingService.formatRent(l.rent)}/mo · ${l.rooms} room${l.rooms !== 1 ? 's' : ''}</span>
                    <span>👤 ${Sanitizer.escape(l.ownerName || l.owner_name || 'Unknown')} · ${ListingService.getTimeAgo(l.createdAt || l.created_at)}</span>
                </div>
                <div class="adm-listing-row__actions">
                    <button class="adm-action-btn adm-action-btn--approve" data-action="approve-listing" data-id="${Sanitizer.escapeAttr(l.id)}">✓ Approve</button>
                    <button class="adm-action-btn adm-action-btn--reject" data-action="reject-listing" data-id="${Sanitizer.escapeAttr(l.id)}">✕ Reject</button>
                </div>
            </div>`;
    }

    /* ── User Management ── */
    async function loadUsers(main) {
        const result = await API.getAdminUsers();
        if (!result.success) { main.innerHTML = renderEmpty('Error', 'Could not load users.'); return; }
        const users = result.users || [];

        main.innerHTML = `
            <div class="adm-page animate-fade-in">
                <div class="adm-page__header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1>User Management</h1>
                        <p>${users.length} registered user${users.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                        <input type="text" id="adminUserSearch" placeholder="🔍 Search users by name, email, or role..." style="width: 300px; padding: 0.65rem 1rem; border-radius: 0.8rem; border: 1px solid rgba(148, 163, 184, 0.2); background: rgba(255, 255, 255, 0.05); color: var(--text-primary); font-size: 0.9rem;">
                    </div>
                </div>
                <div class="adm-content-area" id="adminTabContent">
                    <div class="adm-table-wrap">
                        <table class="adm-table" id="adminUsersTable">
                            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
                            <tbody>
                                ${users.map(u => {
                                    const isBlocked = u.status === 'blocked';
                                    return `
                                    <tr data-row-id="${Sanitizer.escapeAttr(u.id)}">
                                        <td><strong>${Sanitizer.escape(u.fullName)}</strong></td>
                                        <td>${Sanitizer.escape(u.email)}</td>
                                        <td><span class="adm-role-badge adm-role-badge--${u.role}">${u.role}</span></td>
                                        <td><span class="adm-status-dot adm-status-dot--${isBlocked ? 'blocked' : 'active'}"></span> ${isBlocked ? 'Blocked' : 'Active'}</td>
                                        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            ${isBlocked
                                                ? `<button class="adm-action-btn adm-action-btn--approve" data-action="unblock-user" data-id="${Sanitizer.escapeAttr(u.id)}">Unblock</button>`
                                                : `<button class="adm-action-btn adm-action-btn--reject" data-action="block-user" data-id="${Sanitizer.escapeAttr(u.id)}">Block</button>`
                                            }
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;

        const searchInput = document.getElementById('adminUserSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#adminUsersTable tbody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }
    }

    /* ── Reports ── */
    async function loadReports(main) {
        const result = await API.getAdminReports();
        if (!result.success) { main.innerHTML = renderEmpty('Error', 'Could not load reports.'); return; }
        const reports = result.reports || [];
        const pending = reports.filter(r => r.status === 'pending');
        setBadge('navReportBadge', pending.length);

        if (reports.length === 0) {
            main.innerHTML = `<div class="adm-page animate-fade-in"><div class="adm-page__header"><h1>Reports</h1><p>User-submitted reports and complaints</p></div>${renderEmpty('✅ No reports', 'No reports have been filed yet.')}</div>`;
            return;
        }

        const reasonLabels = { fake: '🚫 Fake Listing', scam: '💰 Scam', inappropriate: '⚠️ Inappropriate', other: '📝 Other' };

        main.innerHTML = `
            <div class="adm-page animate-fade-in">
                <div class="adm-page__header"><h1>Reports</h1><p>${pending.length} pending report${pending.length !== 1 ? 's' : ''} of ${reports.length} total</p></div>
                <div class="adm-content-area" id="adminTabContent">
                    <div class="adm-table-wrap">
                        <table class="adm-table">
                            <thead><tr><th>Reporter</th><th>Type</th><th>Target</th><th>Reason & Message</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                            <tbody>
                                ${reports.map(r => {
                                    const isPending = r.status === 'pending';
                                    const reporter = r.reporterId ? r.reporterId.fullName : 'Unknown';
                                    return `
                                    <tr data-row-id="${r.id}" class="${!isPending ? 'adm-row-resolved' : ''}">
                                        <td><strong>${Sanitizer.escape(reporter)}</strong></td>
                                        <td><span class="adm-role-badge">${r.targetType}</span></td>
                                        <td>${Sanitizer.escape(r.targetName || 'Unknown')}</td>
                                        <td>
                                            <div style="font-weight:600">${reasonLabels[r.reason] || r.reason}</div>
                                            ${r.description ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem; max-width: 250px; line-height: 1.4; word-wrap: break-word;">"${Sanitizer.escape(r.description)}"</div>` : '<div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">No message</div>'}
                                        </td>
                                        <td><span class="adm-status-dot adm-status-dot--${isPending ? 'pending' : 'resolved'}"></span> ${isPending ? 'Pending' : 'Resolved'}</td>
                                        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td>${isPending ? `<button class="adm-action-btn adm-action-btn--approve" data-action="resolve-report" data-id="${r.id}">Resolve</button>` : '<span class="adm-muted">—</span>'}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    }

    /* ── Flagged Listings ── */
    async function loadFlagged(main) {
        const result = await API.getAdminFlaggedListings();
        if (!result.success) { main.innerHTML = renderEmpty('Error', 'Could not load flagged listings.'); return; }
        const listings = result.listings || [];
        setBadge('navFlaggedBadge', listings.length);

        if (listings.length === 0) {
            main.innerHTML = `<div class="adm-page animate-fade-in"><div class="adm-page__header"><h1>Flagged Listings</h1><p>Listings flagged due to multiple reports</p></div>${renderEmpty('✅ No flagged listings', 'No listings have been flagged.')}</div>`;
            return;
        }

        main.innerHTML = `
            <div class="adm-page animate-fade-in">
                <div class="adm-page__header"><h1>Flagged Listings</h1><p>${listings.length} flagged listing${listings.length !== 1 ? 's' : ''} requiring attention</p></div>
                <div class="adm-content-area" id="adminTabContent">
                    ${listings.map(l => {
                        const imgSrc = (l.images && l.images.length > 0) ? Sanitizer.sanitizeUrl(API.getAssetUrl(`/uploads/${l.images[0]}`)) : '';
                        return `
                        <div class="adm-listing-row adm-listing-row--flagged" data-row-id="${Sanitizer.escapeAttr(l.id)}">
                            <div class="adm-listing-row__img">${imgSrc ? `<img src="${imgSrc}" alt="">` : '<span>🏠</span>'}</div>
                            <div class="adm-listing-row__info">
                                <strong>🚩 ${Sanitizer.escape(l.title)}</strong>
                                <span>📍 ${Sanitizer.escape(ListingService.getCityLabel(l.city))}, ${Sanitizer.escape(l.area)} · ${ListingService.formatRent(l.rent)}/mo</span>
                                <span>⚠️ ${l.reportCount || 0} report${(l.reportCount || 0) !== 1 ? 's' : ''} · 👤 ${Sanitizer.escape(l.ownerName || l.owner_name || 'Unknown')}</span>
                            </div>
                            <div class="adm-listing-row__actions">
                                <button class="adm-action-btn adm-action-btn--approve" data-action="approve-flagged" data-id="${Sanitizer.escapeAttr(l.id)}">✓ Keep</button>
                                <button class="adm-action-btn adm-action-btn--danger" data-action="delete-flagged" data-id="${Sanitizer.escapeAttr(l.id)}">🗑 Delete</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    }

    /* ─── HELPERS ─── */

    function renderEmpty(title, msg) {
        return `<div class="adm-empty"><div class="adm-empty__icon">${title.includes('⚠') ? '⚠️' : '✅'}</div><h3>${title}</h3><p>${msg}</p></div>`;
    }

    function setBadge(id, count) {
        const el = document.getElementById(id);
        if (el) el.textContent = count > 0 ? count : '';
    }

    /* ─── ADMIN LAYOUT TOGGLE ─── */

    function showAdminLayout(show) {
        const navbar = document.getElementById('navbar');
        const footer = document.getElementById('footer');
        if (navbar) navbar.style.display = show ? 'none' : '';
        if (footer) footer.style.display = show ? 'none' : '';
        document.body.classList.toggle('adm-body', show);
    }

    return { render, attachEvents, showAdminLayout };
})();
