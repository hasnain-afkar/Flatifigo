/* ==========================================
   Search Module — Browse, Search & Filter (API)
   ========================================== */

const Search = (() => {
    let currentFilters = { query: '', city: '', minRent: '', maxRent: '', rooms: '', amenities: [] };
    let cachedListings = [];

    function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

    function getTimeAgo(dateString) {
        const diffDays = Math.floor((new Date() - new Date(dateString)) / (1e3 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today'; if (diffDays === 1) return 'Yesterday'; if (diffDays < 7) return diffDays + ' days ago';
        if (diffDays < 30) return Math.floor(diffDays / 7) + ' week(s) ago'; return Math.floor(diffDays / 30) + ' month(s) ago';
    }

    function renderListingCard(listing) {
        const user = Auth.getCurrentUser();
        const isOwn = user && listing.owner_id === user.id;
        const cityLabels = { islamabad: 'Islamabad', rawalpindi: 'Rawalpindi', lahore: 'Lahore', karachi: 'Karachi', peshawar: 'Peshawar', faisalabad: 'Faisalabad' };
        const amenityTags = (listing.amenities || []).slice(0, 3).map(a => `<span class="tag">${Listings.getAmenityLabel(a)}</span>`).join('');
        const stars = '★★★★' + (Math.random() > 0.4 ? '★' : '☆');
        const isRented = listing.status === 'rented';
        const imgSrc = (listing.images && listing.images.length > 0) ? `/uploads/${listing.images[0]}` : '';
        let badgeHtml;
        if (isRented) {
            badgeHtml = '<div class="listing-card-badge-rented">🔒 Rented</div>';
        } else if (isOwn) {
            badgeHtml = '<div class="listing-card-badge-own">Your Listing</div>';
        } else {
            badgeHtml = '<div class="listing-card-badge-verify">✓ Verified</div>';
        }
        return `
      <div class="listing-card ${isRented ? 'listing-card-rented' : ''}" data-id="${listing.id}" onclick="Search.showDetail('${listing.id}')">
        <div class="listing-card-image">${imgSrc ? `<img src="${imgSrc}" alt="Listing" style="width:100%;height:100%;object-fit:cover;">` : '<span class="placeholder-img">🏠</span>'}
          <div class="listing-card-price">${Listings.formatRent(listing.rent)} <span>/mo</span></div>
          ${badgeHtml}
        </div>
        <div class="listing-card-body">
          <h3>${escapeHtml(listing.title)}</h3>
          <div class="listing-card-location">📍 ${escapeHtml(listing.area)}, ${cityLabels[listing.city] || listing.city}</div>
          <div class="listing-card-tags">${amenityTags}</div>
          <div class="listing-card-meta">
            <span>🛏️ ${listing.rooms} Room${listing.rooms > 1 ? 's' : ''}</span>
            <span class="listing-card-stars">${stars}</span>
            <span style="font-size:0.75rem">${getTimeAgo(listing.created_at)}</span>
          </div>
        </div>
      </div>`;
    }

    async function showDetail(listingId) {
        const user = Auth.getCurrentUser();
        const cityLabels = { islamabad: 'Islamabad', rawalpindi: 'Rawalpindi', lahore: 'Lahore', karachi: 'Karachi', peshawar: 'Peshawar', faisalabad: 'Faisalabad' };
        const result = await API.getListing(listingId);
        if (!result.success) return;
        const listing = result.listing;
        const isOwn = user && listing.owner_id === user.id;
        const amenityTags = (listing.amenities || []).map(a => `<span class="tag">${Listings.getAmenityLabel(a)}</span>`).join('');

        const imgSrc = (listing.images && listing.images.length > 0) ? `/uploads/${listing.images[0]}` : '';
        const imageGallery = (listing.images && listing.images.length > 0)
            ? `<div class="modal-image-gallery">${listing.images.map(img => `<img src="/uploads/${img}" alt="Image" class="modal-gallery-img">`).join('')}</div>`
            : `<div class="modal-image"><span style="font-size:4rem;opacity:.3">🏠</span></div>`;

        const actionButtons = isOwn
            ? `<button class="btn btn-primary btn-lg" style="flex:1" onclick="Search.closeModal(); Listings.startEdit('${listing.id}')">✏️ Edit Listing</button>
               <button class="btn btn-danger btn-lg" onclick="Search.closeModal(); Listings.confirmDelete('${listing.id}')">🗑️ Delete</button>`
            : `<button class="btn btn-primary btn-lg" style="flex:1" onclick="App.showToast('info','Coming Soon','Messaging in Iteration 2!')">💬 Message Owner</button>`;

        const modalHtml = `
      <div class="modal-overlay" id="listingModal" onclick="Search.closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-header"><h2>${escapeHtml(listing.title)}</h2><button class="modal-close" onclick="Search.closeModal()">×</button></div>
          <div class="modal-body">
            ${imageGallery}
            <div style="margin-bottom:1.5rem">
              <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem">
                <span style="font-size:1.75rem;font-weight:800;color:var(--accent-primary)">${Listings.formatRent(listing.rent)}</span>
                <span style="color:var(--text-muted);font-size:.875rem">/month</span></div>
              <div style="color:var(--text-secondary);font-size:.875rem">📍 ${escapeHtml(listing.area)}, ${cityLabels[listing.city] || listing.city}</div>
            </div>
            <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:1.5rem">${escapeHtml(listing.description)}</p>
            <div class="detail-grid">
              <div class="detail-item"><label>Rooms</label><span>🛏️ ${listing.rooms} Room${listing.rooms > 1 ? 's' : ''}</span></div>
              <div class="detail-item"><label>City</label><span>📍 ${cityLabels[listing.city] || listing.city}</span></div>
              <div class="detail-item"><label>Area</label><span>🏘️ ${escapeHtml(listing.area)}</span></div>
              <div class="detail-item"><label>Views</label><span>👁️ ${listing.views || 0}</span></div>
            </div>
            ${amenityTags ? `<div style="margin-top:1.5rem"><label style="display:block;font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem">Amenities</label><div class="detail-amenities">${amenityTags}</div></div>` : ''}
            <div style="margin-top:2rem;padding-top:1.5rem;border-top:1.5px solid var(--border-color)">
              <h3 style="font-size:1rem;font-weight:600;margin-bottom:1rem">📱 Contact Information</h3>
              <div class="detail-grid">
                <div class="detail-item"><label>Owner</label><span>${escapeHtml(listing.contact_name || listing.owner_name || 'N/A')}</span></div>
                <div class="detail-item"><label>Phone</label><span>${escapeHtml(listing.contact_phone || 'N/A')}</span></div>
              </div>
            </div>
            <div style="margin-top:1.5rem;display:flex;gap:1rem">
              ${actionButtons}
              <button class="btn btn-secondary btn-lg" onclick="Search.closeModal()">Close</button>
            </div>
          </div>
        </div>
      </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    }

    function closeModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById('listingModal');
        if (modal) { modal.remove(); document.body.style.overflow = ''; }
    }

    function clientFilter(listings) {
        let filtered = [...listings];
        if (currentFilters.amenities.length > 0) filtered = filtered.filter(l => (l.amenities || []).some(a => currentFilters.amenities.includes(a)));
        return filtered;
    }

    async function renderBrowse() {
        const params = new URLSearchParams();
        if (currentFilters.query) params.set('q', currentFilters.query);
        if (currentFilters.city) params.set('city', currentFilters.city);
        if (currentFilters.minRent) params.set('minRent', currentFilters.minRent);
        if (currentFilters.maxRent) params.set('maxRent', currentFilters.maxRent);
        if (currentFilters.rooms) params.set('rooms', currentFilters.rooms);
        const result = await API.getListings(params.toString());
        cachedListings = result.success ? clientFilter(result.listings) : [];
        return renderBrowseHtml(cachedListings);
    }

    function renderBrowseHtml(listings) {
        const fiverrCardsHtml = `
            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/1.jpg.jpeg" alt="Flat in Islamabad" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Ali&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Ali Raza</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 5.0 <span style="color: var(--text-muted); font-weight: 400;">(12)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will provide a luxury flat in Islamabad.</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 45,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/2.jpg.jpeg" alt="Flat in Lahore" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Sara&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Sara Khan</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.9 <span style="color: var(--text-muted); font-weight: 400;">(8)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent my newly furnished apartment in Lahore</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 60,000</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/3.jpg.jpeg" alt="Flat in Rawalpindi" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Ahmad&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Ahmad Khan</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.8 <span style="color: var(--text-muted); font-weight: 400;">(21)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent a spacious 2-bedroom flat in Rawalpindi</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 35,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/4.jpg.jpeg" alt="Flat in Karachi" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Fatima&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Fatima Noor</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 5.0 <span style="color: var(--text-muted); font-weight: 400;">(5)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will provide a fully furnished studio in DHA Karachi</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 75,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/5.jpg.jpeg" alt="Flat in Faisalabad" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Zain&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Zain Ali</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.7 <span style="color: var(--text-muted); font-weight: 400;">(15)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent a secure apartment near university in Faisalabad</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 25,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/6.jpg.jpeg" alt="Flat in Lahore" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Usman&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Usman Tariq</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.9 <span style="color: var(--text-muted); font-weight: 400;">(32)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will provide an executive flat in Gulberg Lahore</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 85,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/7.jpg" alt="Flat in Islamabad" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Zoya&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Zoya Khan</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.6 <span style="color: var(--text-muted); font-weight: 400;">(11)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will offer a beautiful corner window apartment in F-11 Markaz</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 90,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/8.jpg" alt="Flat in Rawalpindi" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Hassan&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Hassan Bilal</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.8 <span style="color: var(--text-muted); font-weight: 400;">(29)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent a well-maintained family flat in Bahria Town Phase 8</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 40,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/9.jpg" alt="Flat in Lahore" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Maha&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Maha Noor</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.9 <span style="color: var(--text-muted); font-weight: 400;">(42)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent my stylish minimal studio in Model Town</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 35,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/10.jpg" alt="Flat in Karachi" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Sadiq&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Sadiq Ali</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.5 <span style="color: var(--text-muted); font-weight: 400;">(7)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will provide a spacious sharing room in Clifton</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 20,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/11.jpg" alt="Flat in Islamabad" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Ayesha&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Ayesha Tariq</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 5.0 <span style="color: var(--text-muted); font-weight: 400;">(19)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent a newly built apartment in G-13</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 70,000</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/12.jpg" alt="Flat in Lahore" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="https://ui-avatars.com/api/?name=Waqas&background=random" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Waqas Ahmed</span>
                        <span style="color: var(--accent-gold); margin-left: auto; font-weight: 600; font-size: 14px;">★ 4.7 <span style="color: var(--text-muted); font-weight: 400;">(55)</span></span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 16px; font-weight: 400; line-height: 1.4;">I will rent my prime location 3-bed flat in Johar Town</h3>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 18px; cursor: pointer;">❤</span>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Starting at</span>
                            <span style="font-size: 18px; color: var(--text-primary); font-weight: 600; display: block;">₨ 45,000</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        let listingsHtml = fiverrCardsHtml;
        if (!listingsHtml) {
            listingsHtml = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No Flats Found</h3><p>Try adjusting your filters or search query.</p><button class="btn btn-primary" onclick="Search.clearFilters()">Clear Filters</button></div>`;
        }
        return `
      <div class="search-hero"><div class="container">
        <h1>Find Your <span class="gradient-text">Perfect Flat</span></h1>
        <p>Browse verified listings across Pakistan</p>
        <div class="search-bar-container"><div class="search-bar">
          <input type="text" id="searchInput" placeholder="Search by location, area, or keywords..." value="${currentFilters.query}">
          <button onclick="Search.applySearch()">🔍 Search</button>
        </div></div>
      </div></div>
      <div class="browse-container"><div class="container"><div class="browse-layout">
        <div class="filters-sidebar"><div class="filters-card">
          <h3><span>Filters</span><button class="btn btn-sm btn-outline" onclick="Search.clearFilters()" style="font-size:.75rem">Clear All</button></h3>
          <div class="filter-group"><label>City</label><select class="form-select" id="filterCity" onchange="Search.applyFilters()"><option value="">All Cities</option><option value="islamabad" ${currentFilters.city === 'islamabad' ? 'selected' : ''}>Islamabad</option><option value="rawalpindi" ${currentFilters.city === 'rawalpindi' ? 'selected' : ''}>Rawalpindi</option><option value="lahore" ${currentFilters.city === 'lahore' ? 'selected' : ''}>Lahore</option><option value="karachi" ${currentFilters.city === 'karachi' ? 'selected' : ''}>Karachi</option><option value="peshawar" ${currentFilters.city === 'peshawar' ? 'selected' : ''}>Peshawar</option><option value="faisalabad" ${currentFilters.city === 'faisalabad' ? 'selected' : ''}>Faisalabad</option></select></div>
          <div class="filter-group"><label>Rent Range (PKR)</label><div class="filter-range"><input type="number" id="filterMinRent" placeholder="Min" value="${currentFilters.minRent}" onchange="Search.applyFilters()"><span>—</span><input type="number" id="filterMaxRent" placeholder="Max" value="${currentFilters.maxRent}" onchange="Search.applyFilters()"></div></div>
          <div class="filter-group"><label>Rooms</label><select class="form-select" id="filterRooms" onchange="Search.applyFilters()"><option value="">Any</option><option value="1" ${currentFilters.rooms === '1' ? 'selected' : ''}>1 Room</option><option value="2" ${currentFilters.rooms === '2' ? 'selected' : ''}>2 Rooms</option><option value="3" ${currentFilters.rooms === '3' ? 'selected' : ''}>3 Rooms</option></select></div>
          <div class="filter-group"><label>Amenities</label><div style="display:flex;flex-direction:column;gap:.5rem">
            ${['wifi', 'furnished', 'ac', 'kitchen', 'parking', 'security'].map(a => `<label class="form-checkbox-label" style="font-size:.8rem"><input type="checkbox" name="filterAmenity" value="${a}" ${currentFilters.amenities.includes(a) ? 'checked' : ''} onchange="Search.applyFilters()"> ${Listings.getAmenityLabel(a)}</label>`).join('')}
          </div></div>
        </div></div>
        <div><div class="results-header"><div class="results-count">Showing <strong>${listings.length}</strong> listing${listings.length !== 1 ? 's' : ''}</div></div>
          <div class="listings-grid stagger-children">${listingsHtml}</div>
        </div>
      </div></div></div>`;
    }

    function applySearch() { const i = document.getElementById('searchInput'); if (i) currentFilters.query = i.value.trim(); App.renderPage('browse'); }
    function applyFilters() {
        currentFilters.city = document.getElementById('filterCity')?.value || '';
        currentFilters.minRent = document.getElementById('filterMinRent')?.value || '';
        currentFilters.maxRent = document.getElementById('filterMaxRent')?.value || '';
        currentFilters.rooms = document.getElementById('filterRooms')?.value || '';
        currentFilters.amenities = Array.from(document.querySelectorAll('input[name="filterAmenity"]:checked')).map(cb => cb.value);
        App.renderPage('browse');
    }
    function clearFilters() { currentFilters = { query: '', city: '', minRent: '', maxRent: '', rooms: '', amenities: [] }; App.renderPage('browse'); }
    function attachBrowseEvents() { const s = document.getElementById('searchInput'); if (s) s.addEventListener('keypress', e => { if (e.key === 'Enter') applySearch(); }); }
    function filterByCity(cityName) {
        currentFilters.city = cityName.toLowerCase();
        App.renderPage('browse');
    }

    return { renderBrowse, attachBrowseEvents, showDetail, closeModal, applySearch, applyFilters, clearFilters, filterByCity };
})();
