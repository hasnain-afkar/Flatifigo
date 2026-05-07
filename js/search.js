/* ==========================================
   Search Module — Browse, Search & Filter UI
   ==========================================
   UI Layer only. Renders from data arrays.
   Uses ListingService (which handles API/mock fallback).
   ========================================== */

const Search = (() => {

    function _getFilters() { return Store.get('currentFilters'); }
    function _setFilters(f) { Store.set('currentFilters', f); }

    // ── Card Renderers (data-driven, no hardcoded HTML) ──

    /**
     * Render a fiverr-style card from a listing data object.
     * Works identically for mock data and API data.
     */
    function renderFiverrCard(listing, favIds = []) {
        const safeName = Sanitizer.escape(listing.ownerName);
        const safeTitle = Sanitizer.escape(listing.title);
        const imgSrc = Sanitizer.sanitizeUrl(listing.image);
        const avatarSrc = Sanitizer.sanitizeUrl(listing.ownerAvatar);
        const isFav = favIds.includes(listing.id);

        return `
            <div class="fiverr-card" data-id="${Sanitizer.escapeAttr(listing.id)}" data-action="show-detail">
                <img src="${imgSrc}" alt="${Sanitizer.escapeAttr(listing.title)}" class="fiverr-card__image">
                <div class="fiverr-card__body">
                    <div class="fiverr-card__header">
                        <img src="${avatarSrc}" class="fiverr-card__avatar" alt="${Sanitizer.escapeAttr(listing.ownerName)}">
                        <span class="fiverr-card__name">${safeName}</span>
                        <span class="fiverr-card__rating">${Sanitizer.escape(listing.rating)} <span class="fiverr-card__rating-count">(${Sanitizer.escape(listing.ratingCount)})</span></span>
                    </div>
                    <h3 class="fiverr-card__title">${safeTitle}</h3>
                    <div class="fiverr-card__footer">
                        <button class="fiverr-card__heart ${isFav ? 'favorited' : ''}" data-action="toggle-heart" data-id="${Sanitizer.escapeAttr(listing.id)}" aria-label="Save listing">&#10084;</button>
                        <div class="fiverr-card__price-block">
                            <span class="fiverr-card__price-label">Starting at</span>
                            <span class="fiverr-card__price">${Sanitizer.escape(listing.price || ListingService.formatRent(listing.rent))}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Render an API listing card (different layout for real listings).
     */
    function renderListingCard(listing) {
        const user = Auth.getCurrentUser();
        const isOwn = user && listing.owner_id === user.id;
        const amenityTags = (listing.amenities || []).slice(0, 3).map(a => `<span class="tag">${ListingService.getAmenityLabel(a)}</span>`).join('');
        const stars = '★★★★' + (Math.random() > 0.4 ? '★' : '☆');
        const isRented = listing.status === 'rented';
        const imgSrc = (listing.images && listing.images.length > 0) ? Sanitizer.sanitizeUrl(API.getAssetUrl(`/uploads/${listing.images[0]}`)) : '';
        const safeTitle = Sanitizer.escape(listing.title);
        const safeArea = Sanitizer.escape(listing.area);
        const cityLabel = Sanitizer.escape(ListingService.getCityLabel(listing.city));

        let badgeHtml;
        if (isRented) badgeHtml = '<div class="listing-card-badge-rented">🔒 Rented</div>';
        else if (isOwn) badgeHtml = '<div class="listing-card-badge-own">Your Listing</div>';
        else badgeHtml = '<div class="listing-card-badge-verify">✓ Verified</div>';

        return `
      <div class="listing-card ${isRented ? 'listing-card-rented' : ''}" data-id="${Sanitizer.escapeAttr(listing.id)}" data-action="show-detail">
        <div class="listing-card-image">${imgSrc ? `<img src="${imgSrc}" alt="${Sanitizer.escapeAttr(listing.title)}" style="width:100%;height:100%;object-fit:cover;">` : '<span class="placeholder-img">🏠</span>'}
          <div class="listing-card-price">${ListingService.formatRent(listing.rent)} <span>/mo</span></div>
          ${badgeHtml}
        </div>
        <div class="listing-card-body">
          <h3>${safeTitle}</h3>
          <div class="listing-card-location">📍 ${safeArea}, ${cityLabel}</div>
          <div class="listing-card-tags">${amenityTags}</div>
          <div class="listing-card-meta">
            <span>🛏️ ${listing.rooms} Room${listing.rooms > 1 ? 's' : ''}</span>
            <span class="listing-card-stars">${stars}</span>
            <span style="font-size:0.75rem">${ListingService.getTimeAgo(listing.created_at)}</span>
          </div>
        </div>
      </div>`;
    }

    async function showDetail(listingId) {
        const user = Auth.getCurrentUser();
        const result = await ListingService.fetchListing(listingId);
        if (!result.success) return;
        const listing = result.listing;
        const isOwn = user && listing.owner_id === user.id;
        const amenityTags = (listing.amenities || []).map(a => `<span class="tag">${ListingService.getAmenityLabel(a)}</span>`).join('');
        const safeTitle = Sanitizer.escape(listing.title);
        const safeDesc = Sanitizer.escape(listing.description || 'No description provided.');
        const safeArea = Sanitizer.escape(listing.area);
        const cityLabel = Sanitizer.escape(ListingService.getCityLabel(listing.city));
        const safeContact = Sanitizer.escape(listing.contact_name || listing.ownerName || 'N/A');
        const safePhone = Sanitizer.escape(listing.contact_phone || 'N/A');

        const imgSrc = listing.image || ((listing.images && listing.images.length > 0) ? API.getAssetUrl(`/uploads/${listing.images[0]}`) : '');
        const imageGallery = imgSrc
            ? `<div class="modal-image-gallery"><img src="${Sanitizer.sanitizeUrl(imgSrc)}" alt="Image" class="modal-gallery-img"></div>`
            : `<div class="modal-image"><span style="font-size:4rem;opacity:.3">🏠</span></div>`;

        const reportBtn = (!isOwn && user) ? `<button class="btn btn-outline-danger btn-sm" data-action="report-listing" data-target-id="${Sanitizer.escapeAttr(listing.id)}" data-target-type="listing" style="padding:0.45rem 0.7rem;font-size:0.78rem">🚩 Report</button>` : '';

        const actionButtons = isOwn
            ? `<button class="btn btn-primary btn-lg" style="flex:1" data-action="modal-edit" data-listing-id="${Sanitizer.escapeAttr(listing.id)}">✏️ Edit Listing</button>
               <button class="btn btn-danger btn-lg" data-action="modal-delete" data-listing-id="${Sanitizer.escapeAttr(listing.id)}">🗑️ Delete</button>`
            : `<button class="btn btn-primary btn-lg" style="flex:1" data-action="modal-message" data-owner-id="${Sanitizer.escapeAttr(listing.owner_id)}">💬 Message Owner</button>
               ${reportBtn}`;

        const demoTag = '';

        let reviewsHtml = '';
        if (typeof ReviewsUI !== 'undefined') {
            const reviewsRes = await API.getReviews(listing.id);
            const reviews = reviewsRes.success ? reviewsRes.reviews : [];
            reviewsHtml = ReviewsUI.buildSection('listing', listing.id, listing.avgRating, listing.reviewCount, reviews, user);
        }

        const modalHtml = `
      <div class="modal-overlay" id="listingModal">
        <div class="modal">
          <div class="modal-header"><h2>${safeTitle} ${demoTag}</h2><button class="modal-close" data-action="close-modal">×</button></div>
          <div class="modal-body">
            ${imageGallery}
            <div style="margin-bottom:1.5rem">
              <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem">
                <span style="font-size:1.75rem;font-weight:800;color:var(--accent-primary)">${ListingService.formatRent(listing.rent)}</span>
                <span style="color:var(--text-muted);font-size:.875rem">/month</span></div>
              <div style="color:var(--text-secondary);font-size:.875rem">📍 ${safeArea}, ${cityLabel}</div>
            </div>
            <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:1.5rem">${safeDesc}</p>
            <div class="detail-grid">
              <div class="detail-item"><label>Rooms</label><span>🛏️ ${listing.rooms} Room${listing.rooms > 1 ? 's' : ''}</span></div>
              <div class="detail-item"><label>City</label><span>📍 ${cityLabel}</span></div>
              <div class="detail-item"><label>Area</label><span>🏘️ ${safeArea}</span></div>
              <div class="detail-item"><label>Views</label><span>👁️ ${listing.views || 0}</span></div>
            </div>
            ${amenityTags ? `<div style="margin-top:1.5rem"><label style="display:block;font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem">Amenities</label><div class="detail-amenities">${amenityTags}</div></div>` : ''}
            <div style="margin-top:2rem;padding-top:1.5rem;border-top:1.5px solid var(--border-color)">
              <h3 style="font-size:1rem;font-weight:600;margin-bottom:1rem">📱 Contact Information</h3>
              <div class="detail-grid">
                <div class="detail-item"><label>Owner</label><span>${safeContact}</span></div>
                <div class="detail-item"><label>Phone</label><span>${safePhone}</span></div>
              </div>
            </div>
            ${reviewsHtml}
            <div style="margin-top:1.5rem;display:flex;gap:1rem">
              ${actionButtons}
              <button class="btn btn-secondary btn-lg" data-action="close-modal">Close</button>
            </div>
          </div>
        </div>
      </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';

        if (typeof ReviewsUI !== 'undefined') {
            ReviewsUI.attachEvents(listing.id, () => {
                // On success, reload the modal
                closeModal();
                showDetail(listingId);
            });
        }

        const modal = document.getElementById('listingModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { closeModal(); return; }
                const action = e.target.closest('[data-action]');
                if (!action) return;
                switch (action.dataset.action) {
                    case 'close-modal': closeModal(); break;
                    case 'modal-edit': closeModal(); Listings.startEdit(action.dataset.listingId); break;
                    case 'modal-delete': closeModal(); Listings.confirmDelete(action.dataset.listingId); break;
                    case 'modal-message': 
                        if (!Auth.isLoggedIn()) {
                            App.showToast('warning', 'Log in required', 'Please log in to send messages.');
                            window.location.hash = '#login';
                            closeModal();
                            return;
                        }
                        window.location.hash = '#messages-' + action.dataset.ownerId; 
                        closeModal(); 
                        break;
                    case 'report-listing':
                        if (!Auth.isLoggedIn()) {
                            App.showToast('warning', 'Log in required', 'Please log in to report.');
                            window.location.hash = '#login';
                            closeModal();
                            return;
                        }
                        ReportModal.show(action.dataset.targetType, action.dataset.targetId);
                        break;
                }
            });
        }
    }

    function closeModal() {
        const modal = document.getElementById('listingModal');
        if (modal) { modal.remove(); document.body.style.overflow = ''; }
    }

    /**
     * Main render function. Calls ListingService which handles API/mock fallback.
     * UI just receives data and renders — doesn't care where it came from.
     */
    async function renderBrowse() {
        const filters = _getFilters();
        const { listings, isMock } = await ListingService.fetchListings(filters);
        let favIds = [];
        if (Auth.isLoggedIn() && !isMock) {
            const f = await API.getFavoriteIds();
            if (f.success) favIds = f.ids;
        }
        return renderBrowseHtml(listings, isMock, favIds);
    }

    function renderBrowseHtml(listings, isMock, favIds = []) {
        const filters = _getFilters();

        // Render all listings from data — same function for mock and API data
        const listingsHtml = listings.length > 0
            ? listings.map(l => renderFiverrCard(l, favIds)).join('')
            : `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No Flats Found</h3><p>Try adjusting your filters or search query.</p><button class="btn btn-primary" data-action="clear-filters">Clear Filters</button></div>`;

        const demoBanner = '';

        return `
      <div class="search-hero"><div class="container">
        <h1>Find Your <span class="gradient-text">Perfect Flat</span></h1>
        <p>Browse verified listings across Pakistan</p>
        <div class="search-bar-container"><div class="search-bar">
          <input type="text" id="searchInput" placeholder="Search by location, area, or keywords..." value="${Sanitizer.escapeAttr(filters.query)}">
          <button id="searchBtn">🔍 Search</button>
        </div></div>
      </div></div>
      <div class="browse-container"><div class="container"><div class="browse-layout">
        <div class="filters-sidebar"><div class="filters-card">
          <h3><span>Filters</span><button class="btn btn-sm btn-outline" id="clearFiltersBtn" style="font-size:.75rem">Clear All</button></h3>
          <div class="filter-group"><label>City</label><select class="form-select" id="filterCity"><option value="">All Cities</option><option value="islamabad" ${filters.city==='islamabad'?'selected':''}>Islamabad</option><option value="rawalpindi" ${filters.city==='rawalpindi'?'selected':''}>Rawalpindi</option><option value="lahore" ${filters.city==='lahore'?'selected':''}>Lahore</option><option value="karachi" ${filters.city==='karachi'?'selected':''}>Karachi</option><option value="peshawar" ${filters.city==='peshawar'?'selected':''}>Peshawar</option><option value="faisalabad" ${filters.city==='faisalabad'?'selected':''}>Faisalabad</option></select></div>
          <div class="filter-group"><label>Rent Range (PKR)</label><div class="filter-range"><input type="number" id="filterMinRent" placeholder="Min" value="${Sanitizer.escapeAttr(filters.minRent)}"><span>—</span><input type="number" id="filterMaxRent" placeholder="Max" value="${Sanitizer.escapeAttr(filters.maxRent)}"></div></div>
          <div class="filter-group"><label>Rooms</label><select class="form-select" id="filterRooms"><option value="">Any</option><option value="1" ${filters.rooms==='1'?'selected':''}>1 Room</option><option value="2" ${filters.rooms==='2'?'selected':''}>2 Rooms</option><option value="3" ${filters.rooms==='3'?'selected':''}>3 Rooms</option></select></div>
          <div class="filter-group"><label>Amenities</label><div style="display:flex;flex-direction:column;gap:.5rem">
            ${['wifi','furnished','ac','kitchen','parking','security'].map(a => `<label class="form-checkbox-label" style="font-size:.8rem"><input type="checkbox" name="filterAmenity" value="${a}" ${filters.amenities.includes(a)?'checked':''}> ${ListingService.getAmenityLabel(a)}</label>`).join('')}
          </div></div>
        </div></div>
        <div>
          ${demoBanner}
          <div class="results-header"><div class="results-count">Showing <strong>${listings.length}</strong> listing${listings.length !== 1 ? 's' : ''}</div></div>
          <div class="listings-grid stagger-children" id="browseGrid">${listingsHtml}</div>
        </div>
      </div></div></div>`;
    }

    function applySearch() {
        const i = document.getElementById('searchInput');
        const filters = _getFilters();
        if (i) filters.query = i.value.trim();
        _setFilters(filters);
        App.renderPage('browse');
    }

    function applyFilters() {
        _setFilters({
            ...Store.get('currentFilters'),
            city: document.getElementById('filterCity')?.value || '',
            minRent: document.getElementById('filterMinRent')?.value || '',
            maxRent: document.getElementById('filterMaxRent')?.value || '',
            rooms: document.getElementById('filterRooms')?.value || '',
            amenities: Array.from(document.querySelectorAll('input[name="filterAmenity"]:checked')).map(cb => cb.value)
        });
        App.renderPage('browse');
    }

    function clearFilters() {
        _setFilters({ query: '', city: '', minRent: '', maxRent: '', rooms: '', amenities: [] });
        App.renderPage('browse');
    }

    function attachBrowseEvents() {
        const s = document.getElementById('searchInput');
        if (s) s.addEventListener('keypress', e => { if (e.key === 'Enter') applySearch(); });
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) searchBtn.addEventListener('click', () => applySearch());
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) clearBtn.addEventListener('click', () => clearFilters());
        ['filterCity', 'filterRooms'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => applyFilters());
        });
        ['filterMinRent', 'filterMaxRent'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => applyFilters());
        });
        document.querySelectorAll('input[name="filterAmenity"]').forEach(cb => {
            cb.addEventListener('change', () => applyFilters());
        });
        const grid = document.getElementById('browseGrid');
        if (grid) {
            grid.addEventListener('click', async (e) => {
                const heart = e.target.closest('[data-action="toggle-heart"]');
                if (heart) { 
                    e.stopPropagation(); 
                    if (!Auth.isLoggedIn()) {
                        App.showToast('warning', 'Log in required', 'Please log in to save favorites.');
                        window.location.hash = '#login';
                        return;
                    }
                    const listingId = heart.dataset.id;
                    const isFav = heart.classList.contains('favorited');
                    heart.classList.toggle('favorited');
                    
                    if (isFav) {
                        const res = await API.removeFavorite(listingId);
                        if (!res.success) { heart.classList.toggle('favorited'); App.showToast('error', 'Error', res.message); }
                    } else {
                        const res = await API.addFavorite(listingId);
                        if (!res.success) { heart.classList.toggle('favorited'); App.showToast('error', 'Error', res.message); }
                    }
                    return; 
                }
                const card = e.target.closest('[data-action="show-detail"]');
                if (card) showDetail(card.dataset.id);
            });
        }
    }

    function filterByCity(cityName) {
        const filters = _getFilters();
        filters.city = cityName.toLowerCase();
        _setFilters(filters);
        App.renderPage('browse');
    }

    return { renderBrowse, attachBrowseEvents, showDetail, closeModal, applySearch, applyFilters, clearFilters, filterByCity, renderFiverrCard };
})();
