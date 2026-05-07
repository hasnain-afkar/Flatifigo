/* ==========================================
   Reviews UI Module
   ==========================================
   Generates the HTML for the reviews section and handles review submission.
   ========================================== */

const ReviewsUI = (() => {
    
    function renderStars(rating) {
        const full = '★'.repeat(Math.floor(rating));
        const empty = '☆'.repeat(5 - Math.floor(rating));
        return `<span style="color:var(--accent-gold); letter-spacing: 2px;">${full}${empty}</span>`;
    }

    function buildSection(targetType, targetId, avgRating, reviewCount, reviews, currentUser) {
        const avg = parseFloat(avgRating || 0).toFixed(1);
        const count = reviewCount || 0;
        
        let headerHtml = `
            <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 1.5rem;">
                <h3 style="font-size:1.2rem; font-weight:700; margin:0;">Reviews</h3>
                <div style="display:flex; align-items:center; gap: 0.5rem; background: rgba(245, 166, 35, 0.1); padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid rgba(245, 166, 35, 0.2);">
                    <span style="font-weight:800; color:var(--accent-gold);">${avg}</span>
                    <span style="font-size:0.9rem; color:var(--text-secondary);">(${count} review${count !== 1 ? 's' : ''})</span>
                </div>
            </div>
        `;

        let reviewsListHtml = '';
        if (reviews && reviews.length > 0) {
            reviewsListHtml = `<div style="display:flex; flex-direction:column; gap: 1rem; margin-bottom: 2rem; max-height: 300px; overflow-y: auto; padding-right: 0.5rem;" class="custom-scrollbar">` + 
                reviews.map(r => `
                    <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 0.8rem; border: 1px solid rgba(148, 163, 184, 0.1);">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                            <div style="font-weight:600; font-size:0.9rem;">${Sanitizer.escape(r.userId?.fullName || 'User')}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style="margin-bottom: 0.5rem; font-size:1.1rem;">${renderStars(r.rating)}</div>
                        ${r.comment ? `<p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin:0;">${Sanitizer.escape(r.comment)}</p>` : ''}
                    </div>
                `).join('') + `</div>`;
        } else {
            reviewsListHtml = `<div style="text-align:center; padding: 2rem 1rem; color:var(--text-muted); background: rgba(255,255,255,0.02); border-radius:0.8rem; margin-bottom:2rem; border: 1px dashed rgba(148,163,184,0.2);">No reviews yet. Be the first to leave one!</div>`;
        }

        let formHtml = '';
        if (currentUser) {
            const hasReviewed = reviews && reviews.some(r => r.userId && r.userId._id === currentUser.id);
            if (hasReviewed) {
                formHtml = `<div style="padding: 1rem; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 0.8rem; color: #86efac; text-align:center; font-size:0.9rem;">You have already reviewed this ${targetType}.</div>`;
            } else {
                formHtml = `
                    <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(148, 163, 184, 0.1);">
                        <h4 style="margin:0 0 1rem 0; font-size:1rem;">Write a Review</h4>
                        <form id="reviewForm-${targetId}" data-target-id="${targetId}" data-target-type="${targetType}">
                            <div style="margin-bottom: 1rem;">
                                <label style="display:block; font-size:0.8rem; margin-bottom:0.5rem; color:var(--text-secondary);">Rating</label>
                                <div class="star-rating-input" style="display:flex; gap:0.5rem; font-size:1.5rem; color:var(--text-muted); cursor:pointer;">
                                    <span data-val="1">☆</span><span data-val="2">☆</span><span data-val="3">☆</span><span data-val="4">☆</span><span data-val="5">☆</span>
                                </div>
                                <input type="hidden" name="rating" id="reviewRating-${targetId}" required>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display:block; font-size:0.8rem; margin-bottom:0.5rem; color:var(--text-secondary);">Comment (optional)</label>
                                <textarea id="reviewComment-${targetId}" class="form-select" rows="3" placeholder="Share your experience..." style="width:100%; border-radius:0.5rem; background:rgba(255,255,255,0.05); color:white; padding:0.8rem; border:1px solid rgba(148,163,184,0.2); resize:vertical;"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width:100%;">Submit Review</button>
                        </form>
                    </div>
                `;
            }
        } else {
            formHtml = `<div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.8rem; text-align:center; font-size:0.9rem; color:var(--text-secondary);">Please <a href="#login" style="color:var(--accent-primary);">log in</a> to write a review.</div>`;
        }

        return `
            <div class="reviews-section" style="margin-top:2rem; padding-top:2rem; border-top:1.5px solid var(--border-color);">
                ${headerHtml}
                ${reviewsListHtml}
                ${formHtml}
            </div>
        `;
    }

    function attachEvents(targetId, onSuccess) {
        const form = document.getElementById(`reviewForm-${targetId}`);
        if (!form) return;

        // Star rating interactivity
        const starContainer = form.querySelector('.star-rating-input');
        const stars = starContainer.querySelectorAll('span');
        const ratingInput = document.getElementById(`reviewRating-${targetId}`);

        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.dataset.val);
                ratingInput.value = val;
                stars.forEach(s => {
                    if (parseInt(s.dataset.val) <= val) {
                        s.textContent = '★';
                        s.style.color = 'var(--accent-gold)';
                    } else {
                        s.textContent = '☆';
                        s.style.color = 'var(--text-muted)';
                    }
                });
            });
            
            // Hover effect
            star.addEventListener('mouseenter', (e) => {
                const val = parseInt(e.target.dataset.val);
                stars.forEach(s => {
                    if (parseInt(s.dataset.val) <= val) {
                        s.textContent = '★';
                        s.style.color = 'var(--accent-gold-light)';
                    } else {
                        if (parseInt(s.dataset.val) > (ratingInput.value || 0)) {
                            s.textContent = '☆';
                            s.style.color = 'var(--text-muted)';
                        }
                    }
                });
            });
            
            starContainer.addEventListener('mouseleave', () => {
                const val = parseInt(ratingInput.value || 0);
                stars.forEach(s => {
                    if (parseInt(s.dataset.val) <= val) {
                        s.textContent = '★';
                        s.style.color = 'var(--accent-gold)';
                    } else {
                        s.textContent = '☆';
                        s.style.color = 'var(--text-muted)';
                    }
                });
            });
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = ratingInput.value;
            if (!rating) {
                App.showToast('warning', 'Rating Required', 'Please select a star rating.');
                return;
            }

            const comment = document.getElementById(`reviewComment-${targetId}`).value;
            const targetType = form.dataset.targetType;
            const btn = form.querySelector('button[type="submit"]');
            
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            const result = await API.submitReview({
                targetId,
                targetType,
                rating: parseInt(rating),
                comment
            });

            if (result.success) {
                App.showToast('success', 'Review Submitted', 'Thank you for your feedback!');
                if (onSuccess) onSuccess();
            } else {
                App.showToast('error', 'Error', result.message || 'Could not submit review.');
                btn.disabled = false;
                btn.textContent = 'Submit Review';
            }
        });
    }

    return { buildSection, attachEvents, renderStars };
})();
