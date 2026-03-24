/* ==========================================
   Listings Module — Create, Edit, My Listings (API)
   ========================================== */

const Listings = (() => {

    let pendingImages = []; // files selected for upload

    function getAmenityLabel(key) {
        const labels = { wifi: '📶 WiFi', furnished: '🛋️ Furnished', ac: '❄️ AC', kitchen: '🍳 Kitchen', parking: '🚗 Parking', laundry: '👕 Laundry', security: '🔒 Security', utilities: '💡 Utilities Included', gym: '💪 Gym' };
        return labels[key] || key;
    }

    function formatRent(rent) { return 'PKR ' + parseInt(rent).toLocaleString(); }

    function renderImageUploadSection() {
        return `
          <div class="form-section"><h3>📸 Property Images</h3>
            <div class="image-upload-zone" id="imageDropZone">
              <div class="upload-icon">📷</div>
              <p>Drag & drop images here or <label for="imageFileInput" class="upload-link">browse files</label></p>
              <span class="upload-hint">Max 5 images · JPG, PNG, WEBP · 16MB max</span>
              <input type="file" id="imageFileInput" accept="image/*" multiple style="display:none">
            </div>
            <div class="image-preview-grid" id="imagePreviewGrid"></div>
          </div>`;
    }

    function attachImageUploadEvents() {
        const dropZone = document.getElementById('imageDropZone');
        const fileInput = document.getElementById('imageFileInput');
        if (!dropZone || !fileInput) return;

        dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'LABEL') fileInput.click();
        });
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); dropZone.classList.remove('drag-over');
            handleFiles(Array.from(e.dataTransfer.files));
        });
        fileInput.addEventListener('change', () => {
            handleFiles(Array.from(fileInput.files));
            fileInput.value = '';
        });
    }

    function handleFiles(files) {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        const remaining = 5 - pendingImages.length;
        if (remaining <= 0) { App.showToast('warning', 'Limit Reached', 'Maximum 5 images allowed.'); return; }
        pendingImages.push(...imageFiles.slice(0, remaining));
        renderPreviews();
    }

    function renderPreviews() {
        const grid = document.getElementById('imagePreviewGrid');
        if (!grid) return;
        grid.innerHTML = pendingImages.map((f, i) => {
            const url = URL.createObjectURL(f);
            return `<div class="image-preview-item">
              <img src="${url}" alt="Preview">
              <button type="button" class="preview-remove" onclick="Listings.removeImage(${i})">×</button>
            </div>`;
        }).join('');
    }

    function removeImage(index) {
        pendingImages.splice(index, 1);
        renderPreviews();
    }

    function renderCreateListing() {
        const user = Auth.getCurrentUser();
        if (!user) return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>Access Denied</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Please log in to post a listing.</p><a href="#login" class="btn btn-primary">Log In</a></div></div>`;
        if (user.role !== 'owner') return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>🔒 Owners Only</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Only property owners can post listings. Students and jobholders can browse available flats.</p><a href="#browse" class="btn btn-primary">Browse Flats</a></div></div>`;

        pendingImages = [];
        return `
      <div class="page-wrapper"><div class="container">
        <div class="listing-form-container animate-fade-in-up">
          <div class="page-header"><h1>Post a New Listing</h1><p>Share your flat or room with potential tenants</p></div>
          <div class="listing-form-card">
            <form id="listingForm">
              <div class="form-section"><h3>📝 Basic Details</h3>
                <div class="form-group"><label class="form-label" for="listTitle">Listing Title</label><input class="form-input" type="text" id="listTitle" placeholder="e.g. Spacious 2-Bedroom Flat near FAST University" required><span class="form-help">Write a clear, descriptive title</span></div>
                <div class="form-group"><label class="form-label" for="listDesc">Description</label><textarea class="form-textarea" id="listDesc" placeholder="Describe the flat, neighborhood, facilities..." rows="4" required></textarea></div>
              </div>
              <div class="form-section"><h3>💰 Rent & Location</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="listRent">Monthly Rent (PKR)</label><input class="form-input" type="number" id="listRent" placeholder="e.g. 12000" min="1000" required></div>
                  <div class="form-group"><label class="form-label" for="listRooms">Number of Rooms</label><select class="form-select" id="listRooms" required><option value="">Select</option><option value="1">1 Room</option><option value="2">2 Rooms</option><option value="3">3 Rooms</option><option value="4">4 Rooms</option><option value="5">5+ Rooms</option></select></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="listCity">City</label><select class="form-select" id="listCity" required><option value="">Select city</option><option value="islamabad">Islamabad</option><option value="rawalpindi">Rawalpindi</option><option value="lahore">Lahore</option><option value="karachi">Karachi</option><option value="peshawar">Peshawar</option><option value="faisalabad">Faisalabad</option></select></div>
                  <div class="form-group"><label class="form-label" for="listArea">Area / Neighborhood</label><input class="form-input" type="text" id="listArea" placeholder="e.g. G-10, Bahria Town" required></div>
                </div>
              </div>
              ${renderImageUploadSection()}
              <div class="form-section"><h3>✨ Amenities</h3>
                <div class="form-checkbox-group">
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="wifi"> 📶 WiFi</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="furnished"> 🛋️ Furnished</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="ac"> ❄️ AC</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="kitchen"> 🍳 Kitchen</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="parking"> 🚗 Parking</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="laundry"> 👕 Laundry</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="security"> 🔒 Security</label>
                  <label class="form-checkbox-label"><input type="checkbox" name="amenities" value="utilities"> 💡 Utilities Included</label>
                </div>
              </div>
              <div class="form-section"><h3>📱 Contact Information</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="listContactName">Contact Name</label><input class="form-input" type="text" id="listContactName" value="${user.fullName}" required></div>
                  <div class="form-group"><label class="form-label" for="listContactPhone">Phone Number</label><input class="form-input" type="tel" id="listContactPhone" placeholder="e.g. 0300-1234567" required></div>
                </div>
              </div>
              <div style="display:flex;gap:1rem">
                <button type="submit" class="btn btn-primary btn-lg" id="submitListingBtn">🏠 Publish Listing</button>
                <a href="#browse" class="btn btn-secondary btn-lg">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div></div>`;
    }

    function attachCreateListingEvents() {
        attachImageUploadEvents();
        const form = document.getElementById('listingForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitListingBtn');
            btn.textContent = 'Publishing...'; btn.disabled = true;

            // Upload images first
            let imageFilenames = [];
            if (pendingImages.length > 0) {
                btn.textContent = 'Uploading images...';
                const uploadResult = await API.uploadImages(pendingImages);
                if (uploadResult.success) {
                    imageFilenames = uploadResult.filenames;
                } else {
                    App.showToast('error', 'Upload Failed', uploadResult.message);
                    btn.textContent = '🏠 Publish Listing'; btn.disabled = false;
                    return;
                }
            }

            btn.textContent = 'Publishing...';
            const amenities = Array.from(document.querySelectorAll('input[name="amenities"]:checked')).map(cb => cb.value);
            const result = await API.createListing({
                title: document.getElementById('listTitle').value.trim(),
                description: document.getElementById('listDesc').value.trim(),
                rent: parseInt(document.getElementById('listRent').value),
                rooms: parseInt(document.getElementById('listRooms').value),
                city: document.getElementById('listCity').value,
                area: document.getElementById('listArea').value.trim(),
                amenities,
                images: imageFilenames,
                contactName: document.getElementById('listContactName').value.trim(),
                contactPhone: document.getElementById('listContactPhone').value.trim()
            });
            btn.textContent = '🏠 Publish Listing'; btn.disabled = false;
            if (result.success) {
                pendingImages = [];
                App.showToast('success', 'Listing Published!', result.message);
                window.location.hash = '#browse';
            } else {
                App.showToast('error', 'Error', result.message);
            }
        });
    }

    // ── My Listings Page ──
    async function renderMyListings() {
        const user = Auth.getCurrentUser();
        if (!user) return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>Access Denied</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Please log in to view your listings.</p><a href="#login" class="btn btn-primary">Log In</a></div></div>`;
        if (user.role !== 'owner') return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>🔒 Owners Only</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Only property owners can manage listings.</p><a href="#browse" class="btn btn-primary">Browse Flats</a></div></div>`;

        const result = await API.getMyListings();
        const listings = result.success ? result.listings : [];
        const cityLabels = { islamabad: 'Islamabad', rawalpindi: 'Rawalpindi', lahore: 'Lahore', karachi: 'Karachi', peshawar: 'Peshawar', faisalabad: 'Faisalabad' };

        const listingsHtml = listings.length > 0 ? listings.map(l => {
            const imgSrc = (l.images && l.images.length > 0) ? `/uploads/${l.images[0]}` : '';
            const isRented = l.status === 'rented';
            return `
            <div class="my-listing-card animate-fade-in-up ${isRented ? 'my-listing-rented' : ''}">
              <div class="my-listing-image">${imgSrc ? `<img src="${imgSrc}" alt="Listing">` : '<span class="placeholder-img">🏠</span>'}</div>
              <div class="my-listing-body">
                <h3>${l.title} ${isRented ? '<span class="status-badge-rented">Rented</span>' : '<span class="status-badge-available">Available</span>'}</h3>
                <div class="my-listing-meta">
                  <span>📍 ${l.area}, ${cityLabels[l.city] || l.city}</span>
                  <span>💰 ${formatRent(l.rent)}/mo</span>
                  <span>🛏️ ${l.rooms} Room${l.rooms > 1 ? 's' : ''}</span>
                  <span>👁️ ${l.views || 0} views</span>
                </div>
              </div>
              <div class="my-listing-actions">
                <button class="btn btn-primary btn-sm" onclick="Listings.startEdit('${l.id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="Listings.confirmDelete('${l.id}')">🗑️ Delete</button>
              </div>
            </div>`;
        }).join('') : `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No Listings Yet</h3><p>You haven't posted any listings. Start by creating one!</p><a href="#create-listing" class="btn btn-primary">Post a Listing</a></div>`;

        return `
      <div class="page-wrapper"><div class="container">
        <div class="page-header animate-fade-in-up">
          <h1>My Listings</h1>
          <p>Manage your property listings</p>
          <a href="#create-listing" class="btn btn-primary" style="margin-top:1rem">+ Add New Listing</a>
        </div>
        <div class="my-listings-grid">${listingsHtml}</div>
      </div></div>`;
    }

    function attachMyListingsEvents() { /* events are inline onclick */ }

    async function confirmDelete(listingId) {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
        const result = await API.deleteListing(listingId);
        if (result.success) {
            App.showToast('success', 'Deleted', result.message);
            App.renderPage('my-listings');
        } else {
            App.showToast('error', 'Error', result.message);
        }
    }

    // ── Edit Listing ──
    let editListingId = null;

    async function startEdit(listingId) {
        editListingId = listingId;
        window.location.hash = '#edit-listing';
    }

    async function renderEditListing() {
        const user = Auth.getCurrentUser();
        if (!user || !editListingId) return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>No Listing Selected</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Go to My Listings to select a listing to edit.</p><a href="#my-listings" class="btn btn-primary">My Listings</a></div></div>`;
        if (user.role !== 'owner') return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>🔒 Owners Only</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Only property owners can edit listings.</p><a href="#browse" class="btn btn-primary">Browse Flats</a></div></div>`;

        const result = await API.getListing(editListingId);
        if (!result.success) return `<div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center"><h2>Error</h2><p>${result.message}</p></div></div>`;
        const l = result.listing;
        const amenityChecks = ['wifi','furnished','ac','kitchen','parking','laundry','security','utilities'].map(a =>
            `<label class="form-checkbox-label"><input type="checkbox" name="editAmenities" value="${a}" ${(l.amenities||[]).includes(a)?'checked':''}> ${getAmenityLabel(a)}</label>`
        ).join('');

        const existingImgs = (l.images || []).map((img, i) =>
            `<div class="image-preview-item"><img src="/uploads/${img}" alt="Image"><button type="button" class="preview-remove" onclick="Listings.removeExistingImage(${i})">×</button></div>`
        ).join('');

        return `
      <div class="page-wrapper"><div class="container">
        <div class="listing-form-container animate-fade-in-up">
          <div class="page-header"><h1>Edit Listing</h1><p>Update your listing details</p></div>
          <div class="listing-form-card">
            <form id="editListingForm">
              <div class="form-section"><h3>📝 Basic Details</h3>
                <div class="form-group"><label class="form-label" for="editTitle">Listing Title</label><input class="form-input" type="text" id="editTitle" value="${l.title}" required></div>
                <div class="form-group"><label class="form-label" for="editDesc">Description</label><textarea class="form-textarea" id="editDesc" rows="4" required>${l.description}</textarea></div>
              </div>
              <div class="form-section"><h3>💰 Rent & Location</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="editRent">Monthly Rent (PKR)</label><input class="form-input" type="number" id="editRent" value="${l.rent}" min="1000" required></div>
                  <div class="form-group"><label class="form-label" for="editRooms">Number of Rooms</label><select class="form-select" id="editRooms" required><option value="1" ${l.rooms==1?'selected':''}>1 Room</option><option value="2" ${l.rooms==2?'selected':''}>2 Rooms</option><option value="3" ${l.rooms==3?'selected':''}>3 Rooms</option><option value="4" ${l.rooms==4?'selected':''}>4 Rooms</option><option value="5" ${l.rooms>=5?'selected':''}>5+ Rooms</option></select></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="editCity">City</label><select class="form-select" id="editCity" required><option value="islamabad" ${l.city=='islamabad'?'selected':''}>Islamabad</option><option value="rawalpindi" ${l.city=='rawalpindi'?'selected':''}>Rawalpindi</option><option value="lahore" ${l.city=='lahore'?'selected':''}>Lahore</option><option value="karachi" ${l.city=='karachi'?'selected':''}>Karachi</option><option value="peshawar" ${l.city=='peshawar'?'selected':''}>Peshawar</option><option value="faisalabad" ${l.city=='faisalabad'?'selected':''}>Faisalabad</option></select></div>
                  <div class="form-group"><label class="form-label" for="editArea">Area / Neighborhood</label><input class="form-input" type="text" id="editArea" value="${l.area}" required></div>
                </div>
              </div>
              <div class="form-section"><h3>📸 Property Images</h3>
                <div class="image-preview-grid" id="existingImagesGrid">${existingImgs}</div>
                <div class="image-upload-zone" id="editImageDropZone" style="margin-top:1rem">
                  <div class="upload-icon">📷</div>
                  <p>Add more images or <label for="editImageFileInput" class="upload-link">browse files</label></p>
                  <input type="file" id="editImageFileInput" accept="image/*" multiple style="display:none">
                </div>
                <div class="image-preview-grid" id="editImagePreviewGrid"></div>
              </div>
              <div class="form-section"><h3>✨ Amenities</h3><div class="form-checkbox-group">${amenityChecks}</div></div>
              <div class="form-section"><h3>🏷️ Listing Status</h3>
                <div class="status-toggle-container">
                  <label class="status-toggle">
                    <input type="checkbox" id="editStatusToggle" ${(l.status === 'rented') ? 'checked' : ''}>
                    <span class="status-toggle-slider"></span>
                  </label>
                  <div class="status-toggle-label">
                    <span id="statusLabel" class="${(l.status === 'rented') ? 'status-rented' : 'status-available'}">${(l.status === 'rented') ? '🔒 Rented' : '✅ Available'}</span>
                    <span class="form-help">Toggle this if the flat has been rented out</span>
                  </div>
                </div>
              </div>
              <div class="form-section"><h3>📱 Contact Information</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="editContactName">Contact Name</label><input class="form-input" type="text" id="editContactName" value="${l.contact_name}" required></div>
                  <div class="form-group"><label class="form-label" for="editContactPhone">Phone Number</label><input class="form-input" type="tel" id="editContactPhone" value="${l.contact_phone}" required></div>
                </div>
              </div>
              <div style="display:flex;gap:1rem">
                <button type="submit" class="btn btn-primary btn-lg" id="updateListingBtn">💾 Update Listing</button>
                <a href="#my-listings" class="btn btn-secondary btn-lg">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div></div>`;
    }

    // Track existing images for edit form
    let editExistingImages = [];

    function removeExistingImage(index) {
        // We need to get the current listing's images and remove the one at index
        // Re-render the existing images grid
        const grid = document.getElementById('existingImagesGrid');
        if (!grid) return;
        const items = grid.querySelectorAll('.image-preview-item');
        if (items[index]) items[index].remove();
    }

    function attachEditListingEvents() {
        pendingImages = [];

        // Status toggle label update
        const statusToggle = document.getElementById('editStatusToggle');
        const statusLabel = document.getElementById('statusLabel');
        if (statusToggle && statusLabel) {
            statusToggle.addEventListener('change', () => {
                if (statusToggle.checked) {
                    statusLabel.textContent = '🔒 Rented';
                    statusLabel.className = 'status-rented';
                } else {
                    statusLabel.textContent = '✅ Available';
                    statusLabel.className = 'status-available';
                }
            });
        }

        const dropZone = document.getElementById('editImageDropZone');
        const fileInput = document.getElementById('editImageFileInput');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', (e) => { if (e.target.tagName !== 'LABEL') fileInput.click(); });
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault(); dropZone.classList.remove('drag-over');
                handleFiles(Array.from(e.dataTransfer.files));
                renderEditPreviews();
            });
            fileInput.addEventListener('change', () => { handleFiles(Array.from(fileInput.files)); fileInput.value = ''; renderEditPreviews(); });
        }

        const form = document.getElementById('editListingForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('updateListingBtn');
            btn.textContent = 'Updating...'; btn.disabled = true;

            // Collect remaining existing images from DOM
            const existingImgEls = document.querySelectorAll('#existingImagesGrid .image-preview-item img');
            let existingImages = Array.from(existingImgEls).map(img => img.src.split('/uploads/')[1]).filter(Boolean);

            // Upload new images
            if (pendingImages.length > 0) {
                btn.textContent = 'Uploading images...';
                const uploadResult = await API.uploadImages(pendingImages);
                if (uploadResult.success) {
                    existingImages = [...existingImages, ...uploadResult.filenames];
                }
            }

            btn.textContent = 'Updating...';
            const amenities = Array.from(document.querySelectorAll('input[name="editAmenities"]:checked')).map(cb => cb.value);
            const statusToggle = document.getElementById('editStatusToggle');
            const status = (statusToggle && statusToggle.checked) ? 'rented' : 'available';
            const result = await API.updateListing(editListingId, {
                title: document.getElementById('editTitle').value.trim(),
                description: document.getElementById('editDesc').value.trim(),
                rent: parseInt(document.getElementById('editRent').value),
                rooms: parseInt(document.getElementById('editRooms').value),
                city: document.getElementById('editCity').value,
                area: document.getElementById('editArea').value.trim(),
                amenities,
                images: existingImages,
                status,
                contactName: document.getElementById('editContactName').value.trim(),
                contactPhone: document.getElementById('editContactPhone').value.trim()
            });
            btn.textContent = '💾 Update Listing'; btn.disabled = false;
            if (result.success) {
                pendingImages = [];
                App.showToast('success', 'Updated!', result.message);
                window.location.hash = '#my-listings';
            } else {
                App.showToast('error', 'Error', result.message);
            }
        });
    }

    function renderEditPreviews() {
        const grid = document.getElementById('editImagePreviewGrid');
        if (!grid) return;
        grid.innerHTML = pendingImages.map((f, i) => {
            const url = URL.createObjectURL(f);
            return `<div class="image-preview-item"><img src="${url}" alt="Preview"><button type="button" class="preview-remove" onclick="Listings.removeNewEditImage(${i})">×</button></div>`;
        }).join('');
    }

    function removeNewEditImage(index) {
        pendingImages.splice(index, 1);
        renderEditPreviews();
    }

    return {
        getAmenityLabel, formatRent,
        renderCreateListing, attachCreateListingEvents,
        renderMyListings, attachMyListingsEvents,
        renderEditListing, attachEditListingEvents,
        startEdit, confirmDelete, removeImage,
        removeExistingImage, removeNewEditImage
    };
})();
