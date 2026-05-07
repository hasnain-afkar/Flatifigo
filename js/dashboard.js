/* ==========================================
   Dashboard Module — Owner Stats & Quick View
   ========================================== */

const Dashboard = (() => {

    async function render() {
        const user = Auth.getCurrentUser();
        if (!user || user.role !== 'owner') {
            return `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Access Denied</h2><p>Only property owners can view this dashboard.</p><a href="#home" class="btn btn-primary">Go Home</a></div></div>`;
        }

        let stats = { totalListings: 0, activeListings: 0, rentedListings: 0, totalViews: 0, unreadMessages: 0 };
        try {
            const result = await API.getOwnerStats();
            if (result.success) stats = result.stats;
        } catch (e) {
            console.error('Failed to load dashboard stats', e);
        }

        // Get quick recent listings
        let listingsHtml = '';
        try {
            const listingsResult = await API.getMyListings();
            if (listingsResult.success) {
                const recent = listingsResult.listings.slice(0, 3); // top 3
                if (recent.length > 0) {
                    listingsHtml = recent.map(l => {
                        const imgSrc = (l.images && l.images.length > 0) ? Sanitizer.sanitizeUrl(API.getAssetUrl(`uploads/${l.images[0]}`)) : '';
                        const isRented = l.status === 'rented';
                        return `
                        <div class="dashboard-listing-item" style="display:flex; gap:1rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(148,163,184,0.1); border-radius:1rem; margin-bottom: 0.8rem; align-items:center;">
                            <img src="${imgSrc || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjwvc3ZnPg=='}" style="width:60px; height:60px; border-radius:0.5rem; object-fit:cover;">
                            <div style="flex:1">
                                <h4 style="margin:0; font-size:1rem;">${Sanitizer.escape(l.title)}</h4>
                                <p style="margin:0; font-size:0.8rem; color:var(--text-secondary)">👁️ ${l.views || 0} views &nbsp;&nbsp; 💰 ${ListingService.formatRent(l.rent)}</p>
                            </div>
                            <div>
                                <span class="${isRented ? 'status-badge-rented' : 'status-badge-available'}" style="font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:5px; background:${isRented?'rgba(200,0,0,0.5)':'rgba(0,200,0,0.5)'}">${isRented ? 'Rented' : 'Available'}</span>
                            </div>
                        </div>`;
                    }).join('');
                } else {
                    listingsHtml = `<p style="color:var(--text-muted)">No listings yet.</p>`;
                }
            }
        } catch (e) {
            listingsHtml = `<p>Error loading listings</p>`;
        }

        return `
        <div class="browse-container--padded animate-fade-in">
            <div class="container" style="max-width:1100px;">
                <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 2rem;">
                    <div>
                        <h1 style="margin-bottom:0.5rem">Owner Dashboard</h1>
                        <p style="margin:0; color:var(--text-muted)">Welcome back, ${Sanitizer.escape(user.full_name || user.fullName)}</p>
                    </div>
                    <div>
                        <a href="#create-listing" class="btn btn-primary">+ Add New Property</a>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;">
                    <div style="background:var(--bg-card); border:1px solid rgba(245,166,35,0.3); border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column;">
                        <span style="color:var(--text-secondary); font-size:0.85rem; font-weight:600; text-transform:uppercase;">Unread Messages</span>
                        <strong style="font-size:2.5rem; line-height:1; color:var(--accent-gold); margin-top:0.5rem;">${stats.unreadMessages}</strong>
                    </div>
                    <div style="background:var(--bg-card); border:1px solid rgba(148,163,184,0.1); border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column;">
                        <span style="color:var(--text-secondary); font-size:0.85rem; font-weight:600; text-transform:uppercase;">Total Views</span>
                        <strong style="font-size:2.5rem; line-height:1; color:#fff; margin-top:0.5rem;">${stats.totalViews}</strong>
                    </div>
                    <div style="background:var(--bg-card); border:1px solid rgba(148,163,184,0.1); border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column;">
                        <span style="color:var(--text-secondary); font-size:0.85rem; font-weight:600; text-transform:uppercase;">Active Listings</span>
                        <strong style="font-size:2.5rem; line-height:1; color:#fff; margin-top:0.5rem;">${stats.activeListings}</strong>
                    </div>
                    <div style="background:var(--bg-card); border:1px solid rgba(148,163,184,0.1); border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column;">
                        <span style="color:var(--text-secondary); font-size:0.85rem; font-weight:600; text-transform:uppercase;">Rented out</span>
                        <strong style="font-size:2.5rem; line-height:1; color:#fff; margin-top:0.5rem;">${stats.rentedListings}</strong>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    
                    <div style="background:var(--bg-card); border:1px solid rgba(148,163,184,0.1); border-radius:1rem; padding:2rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                            <h3 style="margin:0">Recent Listings</h3>
                            <a href="#my-listings" class="btn btn-secondary btn-sm">View All</a>
                        </div>
                        <div>
                            ${listingsHtml}
                        </div>
                    </div>

                    <div style="background:var(--bg-card); border:1px solid rgba(148,163,184,0.1); border-radius:1rem; padding:2rem; display:flex; flex-direction:column;">
                        <h3 style="margin-bottom:1rem">Quick Actions</h3>
                        <a href="#recent-messages" class="btn btn-secondary" style="margin-bottom:0.8rem; justify-content:flex-start">💬 View Requests ${stats.unreadMessages > 0 ? `<span style="background:var(--accent-gold); color:#000; padding:2px 6px; border-radius:10px; font-size:0.7rem; margin-left:auto">${stats.unreadMessages} New</span>` : ''}</a>
                        <a href="#create-listing" class="btn btn-secondary" style="margin-bottom:0.8rem; justify-content:flex-start">🏠 Post New Property</a>
                        <a href="#profile" class="btn btn-secondary" style="margin-bottom:0.8rem; justify-content:flex-start">👤 Edit Profile</a>
                    </div>

                </div>
            </div>
        </div>
        `;
    }

    function attachEvents() {
        // Simple events if needed
    }

    return { render, attachEvents };
})();
