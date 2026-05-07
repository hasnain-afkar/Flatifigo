/* ==========================================
   Roommates Module — Search and View Roommates UI
   ==========================================
   UI Layer only. Renders from data arrays.
   Uses RoommateService (which handles API/mock fallback).
   ========================================== */

const Roommates = (() => {

    /**
     * Render a single roommate card from a data object.
     */
    function renderRoommateCard(roommate) {
        const safeName = Sanitizer.escape(roommate.full_name);
        const safeOccupation = Sanitizer.escape(roommate.occupation || 'Roommate Seeker');
        const safeBio = Sanitizer.escape(roommate.bio || 'Looking for a great shared living experience!');
        const safeRole = Sanitizer.escape(roommate.role);
        const avatarUrl = roommate.avatar
            ? Sanitizer.sanitizeUrl(API.getAssetUrl(`uploads/${roommate.avatar}`))
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(roommate.full_name)}&background=random`;
        const avatarFallback = roommate.avatar
            ? ` onerror="this.onerror=null;this.src='${Sanitizer.escapeAttr(`uploads/${roommate.avatar}`)}'"`
            : '';

        const matchScore = roommate.match_score || 0;
        let matchBadge = '';
        if (matchScore > 0) {
            const isHighMatch = matchScore >= 70;
            matchBadge = `
                <div style="position:absolute; top: 10px; right: 10px; background: ${isHighMatch ? 'linear-gradient(135deg,rgba(245,166,35,0.9),rgba(251,191,36,0.95))' : 'rgba(37,99,235,0.9)'}; color: ${isHighMatch ? '#080f1a' : '#fff'}; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 2;">
                    ${matchScore}% Match
                </div>
            `;
        }

        return `
            <div class="fiverr-card" style="position:relative; ${matchScore >= 70 ? 'border: 1px solid rgba(245,166,35,0.3);' : ''}">
                ${matchBadge}
                <img src="${avatarUrl}" alt="${Sanitizer.escapeAttr(roommate.full_name)}" class="fiverr-card__image fiverr-card__image--square"${avatarFallback}>
                <div class="fiverr-card__body fiverr-card__body--lg">
                    <div class="fiverr-card__header">
                        <img src="${avatarUrl}" class="fiverr-card__avatar" alt="${Sanitizer.escapeAttr(roommate.full_name)}"${avatarFallback}>
                        <span class="fiverr-card__name">${safeName}</span>
                        <span class="fiverr-card__role">${safeRole}</span>
                    </div>
                    <h3 class="fiverr-card__occupation">${safeOccupation}</h3>
                    <p class="fiverr-card__bio fiverr-card__bio--3lines">${safeBio}</p>
                    <div class="fiverr-card__footer">
                        <div class="fiverr-card__budget-block">
                            <span class="fiverr-card__budget-label">Budget Range</span>
                            <span class="fiverr-card__budget-value">₨ ${Sanitizer.escape(roommate.budget_min || '0')} - ${Sanitizer.escape(roommate.budget_max || 'Any')}</span>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn btn-outline btn-xs" data-action="view-reviews" data-partner-id="${Sanitizer.escapeAttr(roommate.id)}" data-partner-name="${Sanitizer.escapeAttr(roommate.full_name)}" data-avg-rating="${roommate.avgRating || 0}" data-review-count="${roommate.reviewCount || 0}" style="padding:0.3rem 0.6rem;font-size:0.75rem;">★ ${roommate.avgRating ? Number(roommate.avgRating).toFixed(1) : 'Review'}</button>
                            <button class="btn btn-primary btn-sm" data-action="message-roommate" data-partner-id="${Sanitizer.escapeAttr(roommate.id)}">Message</button>
                            <button class="btn btn-outline-danger btn-xs" data-action="report-user" data-target-id="${Sanitizer.escapeAttr(roommate.id)}" data-target-type="user" style="padding:0.3rem 0.5rem;font-size:0.68rem">🚩</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    async function renderMatches() {
        const currentUser = Auth.getCurrentUser();
        const canBrowseRoommates = currentUser && ['user', 'student', 'jobholder'].includes(currentUser.role);

        if (!Auth.isLoggedIn()) {
            return `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Log In Required</h2><p>Please log in as a student or jobholder to browse roommates.</p><a href="#login" class="btn btn-primary">Log In</a></div></div>`;
        }

        if (!canBrowseRoommates) {
            return `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Roommate Matching Is For Users</h2><p>Property owners can manage listings, dashboard, and tenant requests instead.</p><a href="#owner-dashboard" class="btn btn-primary">Owner Dashboard</a></div></div>`;
        }

        const { roommates } = await RoommateService.fetchRoommates();

        const cardsHtml = roommates.length > 0 
            ? roommates.map(r => renderRoommateCard(r)).join('')
            : `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No roommates found seeking an apartment at this time.</div>`;

        const profileInfo = '';

        return `
            <div class="browse-container--padded animate-fade-in">
                <div class="container">
                    <div class="browse-layout--block">
                        <div class="results-header results-header--spaced">
                            <div>
                                <h1 class="results-header__title">Find Your Perfect Roommate</h1>
                                <p class="results-header__subtitle">Showing <strong>${roommates.length}</strong> potential roommate${roommates.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        ${profileInfo}
                        <div class="listings-grid--4col" id="roommatesGrid">${cardsHtml}</div>
                    </div>
                </div>
            </div>`;
    }

    function attachRoommateEvents() {
        const grid = document.getElementById('roommatesGrid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const msgBtn = e.target.closest('[data-action="message-roommate"]');
                if (msgBtn) {
                    if (!Auth.isLoggedIn()) {
                        App.showToast('warning', 'Log in required', 'Please log in to send messages.');
                        window.location.hash = '#login';
                        return;
                    }
                    window.location.hash = '#messages-' + msgBtn.dataset.partnerId;
                    return;
                }
                const reportBtn = e.target.closest('[data-action="report-user"]');
                if (reportBtn) {
                    if (!Auth.isLoggedIn()) {
                        App.showToast('warning', 'Log in required', 'Please log in to report.');
                        window.location.hash = '#login';
                        return;
                    }
                    ReportModal.show(reportBtn.dataset.targetType, reportBtn.dataset.targetId);
                    return;
                }
                const reviewBtn = e.target.closest('[data-action="view-reviews"]');
                if (reviewBtn) {
                    showRoommateReviews(
                        reviewBtn.dataset.partnerId, 
                        reviewBtn.dataset.partnerName, 
                        parseFloat(reviewBtn.dataset.avgRating), 
                        parseInt(reviewBtn.dataset.reviewCount)
                    );
                }
            });
        }
    }

    async function showRoommateReviews(userId, userName, avgRating, reviewCount) {
        const user = Auth.getCurrentUser();
        let reviewsHtml = '';
        if (typeof ReviewsUI !== 'undefined') {
            const reviewsRes = await API.getReviews(userId);
            const reviews = reviewsRes.success ? reviewsRes.reviews : [];
            reviewsHtml = ReviewsUI.buildSection('user', userId, avgRating, reviewCount, reviews, user);
        }

        const modalHtml = `
      <div class="modal-overlay" id="roommateReviewsModal">
        <div class="modal" style="max-width:500px;">
          <div class="modal-header"><h2>${Sanitizer.escape(userName)}'s Reviews</h2><button class="modal-close" onclick="document.getElementById('roommateReviewsModal').remove();document.body.style.overflow=''">×</button></div>
          <div class="modal-body" style="max-height:80vh; overflow-y:auto; padding-top:0;">
            ${reviewsHtml}
          </div>
        </div>
      </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';

        if (typeof ReviewsUI !== 'undefined') {
            ReviewsUI.attachEvents(userId, () => {
                document.getElementById('roommateReviewsModal').remove();
                document.body.style.overflow = '';
                showRoommateReviews(userId, userName, avgRating, reviewCount + 1);
            });
        }
    }

    return { renderMatches, attachRoommateEvents };
})();
