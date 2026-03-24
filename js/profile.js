/* ==========================================
   Profile Module — User Profile (API)
   ========================================== */

const Profile = (() => {

    function getCompletionPercent(profile, role) {
        if (!profile) return 0;
        const fields = (role === 'owner')
            ? ['occupation', 'gender_preference', 'bio']
            : ['occupation', 'budget_min', 'budget_max', 'preferred_city', 'preferred_area', 'lifestyle', 'gender_preference', 'schedule', 'bio'];
        let filled = 0;
        fields.forEach(f => { if (profile[f] && profile[f].toString().trim() !== '' && profile[f] !== 0) filled++; });
        return Math.round((filled / fields.length) * 100);
    }

    function renderProfile() {
        const user = Auth.getCurrentUser();
        if (!user) return `
      <div class="auth-page"><div class="auth-card animate-fade-in-up" style="text-align:center">
        <h2>Access Denied</h2><p style="color:var(--text-secondary);margin:1rem 0 2rem">Please log in to view your profile.</p>
        <a href="#login" class="btn btn-primary">Log In</a></div></div>`;

        const name = user.fullName || user.full_name || 'User';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return `
      <div class="page-wrapper" style="padding-top: 100px;"><div class="container">
        <div class="page-header animate-fade-in-up"><h1>My Profile</h1><p>${user.role === 'owner' ? 'Manage your property owner profile' : 'Complete your profile to get better roommate matches'}</p></div>
        <div class="profile-grid">
          <div class="profile-sidebar animate-fade-in-up">
            <div class="profile-avatar-section">
              <div class="profile-avatar-wrapper" id="avatarWrapper" title="Click to change profile photo">
                <div class="profile-avatar" id="profileAvatar">${initials}</div>
                <div class="profile-avatar-overlay"><span>📷</span><span class="avatar-overlay-text">Change</span></div>
                <input type="file" id="avatarFileInput" accept="image/*" style="display:none">
              </div>
              <button class="btn btn-sm btn-outline avatar-remove-btn" id="removeAvatarBtn" style="display:none;margin-bottom:var(--space-md)" title="Remove profile photo">✕ Remove Photo</button>
              <h3>${user.fullName || user.full_name || 'User'}</h3>
              <p style="color:var(--text-secondary);font-size:0.875rem">${user.email}</p>
              <span class="badge" style="margin-top:0.75rem">${user.role === 'student' ? '🎓 Student' : user.role === 'jobholder' ? '💼 Jobholder' : '🏠 Owner'}</span>
              <div class="profile-completion"><div style="display:flex;justify-content:space-between;font-size:0.875rem">
                <span style="color:var(--text-secondary)">Profile Completion</span>
                <span id="completionPct" style="font-weight:600">0%</span></div>
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
              </div>` : ''}
              <button type="submit" class="btn btn-primary btn-lg" id="saveProfileBtn">💾 Save Profile</button>
            </form>
          </div>
        </div>
      </div></div>`;
    }

    async function loadProfileData() {
        const user = Auth.getCurrentUser();
        const result = await API.getProfile();
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

            // Load avatar
            const avatarEl = document.getElementById('profileAvatar');
            if (p.avatar && avatarEl) {
                avatarEl.innerHTML = `<img src="/uploads/${p.avatar}" alt="Avatar" class="avatar-img">`;
                avatarEl.classList.add('has-image');
                const removeBtn = document.getElementById('removeAvatarBtn');
                if (removeBtn) removeBtn.style.display = '';
            }

            // Update navbar avatar too
            const navAvatar = document.getElementById('navAvatar');
            if (p.avatar && navAvatar) {
                navAvatar.innerHTML = `<img src="/uploads/${p.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
            }

            const role = user ? user.role : '';
            const pct = getCompletionPercent(p, role);
            const pctEl = document.getElementById('completionPct');
            const barEl = document.getElementById('completionBar');
            if (pctEl) { pctEl.textContent = pct + '%'; pctEl.style.color = pct >= 80 ? 'var(--accent-success)' : pct >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'; }
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
                if (!file.type.startsWith('image/')) {
                    App.showToast('error', 'Invalid File', 'Please select an image file.');
                    return;
                }
                // Preview immediately
                const avatarEl = document.getElementById('profileAvatar');
                const previewUrl = URL.createObjectURL(file);
                if (avatarEl) {
                    avatarEl.innerHTML = `<img src="${previewUrl}" alt="Avatar" class="avatar-img">`;
                    avatarEl.classList.add('has-image');
                }
                // Upload
                App.showToast('info', 'Uploading', 'Uploading your profile photo...');
                const result = await API.uploadAvatar(file);
                if (result.success) {
                    App.showToast('success', 'Avatar Updated', result.message);
                    // Update navbar avatar
                    const navAvatar = document.getElementById('navAvatar');
                    if (navAvatar) {
                        navAvatar.innerHTML = `<img src="/uploads/${result.filename}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    }
                    if (removeAvatarBtn) removeAvatarBtn.style.display = '';
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
                const result = await API.deleteAvatar();
                if (result.success) {
                    const user = Auth.getCurrentUser();
                    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarEl = document.getElementById('profileAvatar');
                    if (avatarEl) {
                        avatarEl.innerHTML = initials;
                        avatarEl.classList.remove('has-image');
                    }
                    const navAvatar = document.getElementById('navAvatar');
                    if (navAvatar) navAvatar.textContent = initials;
                    removeAvatarBtn.style.display = 'none';
                    App.showToast('success', 'Removed', result.message);
                } else {
                    App.showToast('error', 'Error', result.message);
                }
            });
        }

        const form = document.getElementById('profileForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('saveProfileBtn');
            btn.textContent = 'Saving...'; btn.disabled = true;
            const getVal = (id, fallback = '') => { const el = document.getElementById(id); return el ? el.value : fallback; };
            const result = await API.updateProfile({
                occupation: getVal('profOccupation'),
                genderPreference: getVal('profGender'),
                bio: (getVal('profBio')).trim(),
                budgetMin: getVal('profBudgetMin', 0) || 0,
                budgetMax: getVal('profBudgetMax', 0) || 0,
                preferredCity: getVal('profCity'),
                preferredArea: (getVal('profArea')).trim(),
                lifestyle: getVal('profLifestyle'),
                schedule: getVal('profSchedule')
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
