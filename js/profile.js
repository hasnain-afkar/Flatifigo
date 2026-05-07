/* ==========================================
   Profile Module — User Profile UI
   ==========================================
   UI Layer only. Delegates to ProfileService.
   Uses Store for state, Sanitizer for XSS protection.
   ========================================== */

const Profile = (() => {

    function renderProfile() {
        const user = Auth.getCurrentUser();
        if (!user) return `
      <div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center">
        <h2>Access Denied</h2><p class="auth-card__subtitle">Please log in to view your profile.</p>
        <a href="#login" class="btn btn-primary">Log In</a></div></div>`;

        const name = Sanitizer.escape(user.fullName || user.full_name || 'User');
        const email = Sanitizer.escape(user.email);
        const initials = (user.fullName || user.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const roleLabel = user.role === 'student' ? '🎓 Student' : user.role === 'jobholder' ? '💼 Jobholder' : '🏠 Owner';
        const roleDesc = user.role === 'owner' ? 'Manage your property owner profile' : 'Complete your profile to get better roommate matches';

        return `
      <div class="page-wrapper page-wrapper--padded"><div class="container">
        <div class="page-header animate-fade-in-up"><h1>My Profile</h1><p>${Sanitizer.escape(roleDesc)}</p></div>
        <div class="profile-grid">
          <div class="profile-sidebar animate-fade-in-up">
            <div class="profile-avatar-section">
              <div class="profile-avatar-wrapper" id="avatarWrapper" title="Click to change profile photo">
                <div class="profile-avatar" id="profileAvatar">${Sanitizer.escape(initials)}</div>
                <div class="profile-avatar-overlay"><span>📷</span><span class="avatar-overlay-text">Change</span></div>
                <input type="file" id="avatarFileInput" accept="image/*" class="hidden">
              </div>
              <button class="btn btn-sm btn-outline avatar-remove-btn hidden" id="removeAvatarBtn" style="margin-bottom:var(--space-md)" title="Remove profile photo">✕ Remove Photo</button>
              <h3>${name}</h3>
              <p class="profile-sidebar__email">${email}</p>
              <span class="badge profile-sidebar__badge">${roleLabel}</span>
              <div class="profile-completion"><div class="profile-completion__row">
                <span class="profile-completion__label">Profile Completion</span>
                <span id="completionPct" class="profile-completion__pct">0%</span></div>
                <div class="progress-bar"><div class="progress-fill" id="completionBar" style="width:0%"></div></div>
              </div>
            </div>
          </div>
          <div class="profile-form-card animate-fade-in-up" style="animation-delay:.1s">
            <h2>✏️ Edit Profile Details</h2>
            <form id="profileForm">
              <div class="form-section"><h3>📋 Basic Information</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="profOccupation">Occupation</label>
                    <select class="form-select" id="profOccupation"><option value="">Select</option><option value="student">Student</option><option value="jobholder">Working Professional</option><option value="freelancer">Freelancer</option><option value="other">Other</option></select></div>
                  <div class="form-group"><label class="form-label" for="profGender">Gender Preference</label>
                    <select class="form-select" id="profGender"><option value="">Select</option><option value="male">Male Only</option><option value="female">Female Only</option><option value="any">No Preference</option></select></div>
                </div>
                <div class="form-group"><label class="form-label" for="profBio">Short Bio</label>
                  <textarea class="form-textarea" id="profBio" placeholder="Tell potential roommates about yourself..." rows="3"></textarea></div>
              </div>
              ${user.role !== 'owner' ? `<div class="form-section"><h3>💰 Budget & Location</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="profBudgetMin">Minimum Budget (PKR)</label><input class="form-input" type="number" id="profBudgetMin" placeholder="e.g. 5000"></div>
                  <div class="form-group"><label class="form-label" for="profBudgetMax">Maximum Budget (PKR)</label><input class="form-input" type="number" id="profBudgetMax" placeholder="e.g. 15000"></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="profCity">Preferred City</label>
                    <select class="form-select" id="profCity"><option value="">Select city</option><option value="islamabad">Islamabad</option><option value="rawalpindi">Rawalpindi</option><option value="lahore">Lahore</option><option value="karachi">Karachi</option><option value="peshawar">Peshawar</option><option value="faisalabad">Faisalabad</option></select></div>
                  <div class="form-group"><label class="form-label" for="profArea">Preferred Area</label><input class="form-input" type="text" id="profArea" placeholder="e.g. G-10, Bahria Town"></div>
                </div>
              </div>
              <div class="form-section"><h3>🌟 Lifestyle & Schedule</h3>
                <div class="form-row">
                  <div class="form-group"><label class="form-label" for="profLifestyle">Lifestyle</label>
                    <select class="form-select" id="profLifestyle"><option value="">Select</option><option value="earlybird">Early Bird</option><option value="nightowl">Night Owl</option><option value="flexible">Flexible</option></select></div>
                  <div class="form-group"><label class="form-label" for="profSchedule">Schedule</label>
                    <select class="form-select" id="profSchedule"><option value="">Select</option><option value="morning">Morning Classes/Work</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="mixed">Mixed</option></select></div>
                </div>
              <div class="form-section"><h3>👁️ Visibility</h3>
                <div class="form-row">
                  <div class="form-group" style="display:flex;align-items:center;padding:1rem;background:rgba(255,255,255,0.05);border-radius:8px;border:1px solid rgba(255,255,255,0.1)">
                    <input type="checkbox" id="profShowRoommate" style="width:20px;height:20px;margin-right:1rem;accent-color:var(--accent-gold);cursor:pointer;">
                    <div style="display:flex; flex-direction:column; cursor:pointer;" onclick="document.getElementById('profShowRoommate').click()">
                      <label class="form-label" style="margin:0;cursor:pointer;font-weight:600">List me as a potential Roommate</label>
                      <span style="font-size:0.8rem;color:var(--text-muted)">If unchecked, other users won't see you in the Find Roommates tab. You can still search for flats.</span>
                    </div>
                  </div>
                </div>
              </div>` : ''}
              <button type="submit" class="btn btn-primary btn-lg" id="saveProfileBtn">💾 Save Profile</button>
            </form>
          </div>
        </div>
      </div></div>`;
    }

    async function loadProfileData() {
        const user = Auth.getCurrentUser();
        const result = await ProfileService.getProfile();
        if (result.success && result.profile) {
            const p = result.profile;
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            setVal('profOccupation', p.occupation);
            setVal('profGender', p.gender_preference);
            setVal('profBio', p.bio);
            setVal('profBudgetMin', p.budget_min || '');
            setVal('profBudgetMax', p.budget_max || '');
            setVal('profCity', p.preferred_city);
            setVal('profArea', p.preferred_area);
            setVal('profLifestyle', p.lifestyle);
            setVal('profSchedule', p.schedule);
            
            const profShow = document.getElementById('profShowRoommate');
            if (profShow) {
                profShow.checked = p.looking_for_roommate !== false;
            }

            // Load avatar
            const avatarEl = document.getElementById('profileAvatar');
            if (p.avatar && avatarEl) {
                avatarEl.innerHTML = `<img src="${Sanitizer.sanitizeUrl(API.getAssetUrl('/uploads/' + p.avatar))}" alt="Avatar" class="avatar-img">`;
                avatarEl.classList.add('has-image');
                const removeBtn = document.getElementById('removeAvatarBtn');
                if (removeBtn) removeBtn.classList.remove('hidden');
            }

            // Update navbar avatar
            const navAvatar = document.getElementById('navAvatar');
            if (p.avatar && navAvatar) {
                navAvatar.innerHTML = `<img src="${Sanitizer.sanitizeUrl(API.getAssetUrl('/uploads/' + p.avatar))}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
            }

            const role = user ? user.role : '';
            const pct = ProfileService.getCompletionPercent(p, role);
            const pctEl = document.getElementById('completionPct');
            const barEl = document.getElementById('completionBar');
            if (pctEl) {
                pctEl.textContent = pct + '%';
                pctEl.style.color = pct >= 80 ? 'var(--accent-success)' : pct >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';
            }
            if (barEl) barEl.style.width = pct + '%';
        }
    }

    function attachProfileEvents() {
        loadProfileData();

        // Avatar upload
        const avatarWrapper = document.getElementById('avatarWrapper');
        const avatarInput = document.getElementById('avatarFileInput');
        const removeAvatarBtn = document.getElementById('removeAvatarBtn');

        if (avatarWrapper && avatarInput) {
            avatarWrapper.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', async () => {
                const file = avatarInput.files[0];
                if (!file) return;

                // Preview immediately
                const avatarEl = document.getElementById('profileAvatar');
                const previewUrl = URL.createObjectURL(file);
                if (avatarEl) {
                    avatarEl.innerHTML = `<img src="${previewUrl}" alt="Avatar" class="avatar-img">`;
                    avatarEl.classList.add('has-image');
                }

                App.showToast('info', 'Uploading', 'Uploading your profile photo...');
                const result = await ProfileService.uploadAvatar(file);
                if (result.success) {
                    App.showToast('success', 'Avatar Updated', result.message);
                    const navAvatar = document.getElementById('navAvatar');
                    if (navAvatar) {
                        navAvatar.innerHTML = `<img src="${Sanitizer.sanitizeUrl(API.getAssetUrl('/uploads/' + result.filename))}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    }
                    if (removeAvatarBtn) removeAvatarBtn.classList.remove('hidden');
                } else {
                    App.showToast('error', 'Error', result.message);
                }
                avatarInput.value = '';
            });
        }

        // Remove avatar
        if (removeAvatarBtn) {
            removeAvatarBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Remove your profile photo?')) return;
                const result = await ProfileService.deleteAvatar();
                if (result.success) {
                    const user = Auth.getCurrentUser();
                    const initials = (user.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarEl = document.getElementById('profileAvatar');
                    if (avatarEl) { avatarEl.innerHTML = Sanitizer.escape(initials); avatarEl.classList.remove('has-image'); }
                    const navAvatar = document.getElementById('navAvatar');
                    if (navAvatar) navAvatar.textContent = initials;
                    removeAvatarBtn.classList.add('hidden');
                    App.showToast('success', 'Removed', result.message);
                } else {
                    App.showToast('error', 'Error', result.message);
                }
            });
        }

        // Save form
        const form = document.getElementById('profileForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('saveProfileBtn');
            btn.textContent = 'Saving...'; btn.disabled = true;
            const getVal = (id, fallback = '') => { const el = document.getElementById(id); return el ? el.value : fallback; };
            const result = await ProfileService.updateProfile({
                occupation: getVal('profOccupation'),
                genderPreference: getVal('profGender'),
                bio: getVal('profBio').trim(),
                budgetMin: getVal('profBudgetMin', 0) || 0,
                budgetMax: getVal('profBudgetMax', 0) || 0,
                preferredCity: getVal('profCity'),
                preferredArea: getVal('profArea').trim(),
                lifestyle: getVal('profLifestyle'),
                schedule: getVal('profSchedule'),
                lookingForRoommate: document.getElementById('profShowRoommate') ? document.getElementById('profShowRoommate').checked : true
            });
            btn.textContent = '💾 Save Profile'; btn.disabled = false;
            if (result.success) {
                App.showToast('success', 'Profile Saved', result.message);
                setTimeout(() => App.renderPage('profile'), 500);
            } else {
                App.showToast('error', 'Error', result.message);
            }
        });
    }

    return { renderProfile, attachProfileEvents };
})();
