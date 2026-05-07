/* ==========================================
   Report Modal — User-facing Report Submission
   ==========================================
   Reusable modal for reporting listings or users.
   Called via ReportModal.show(targetType, targetId)
   ========================================== */

const ReportModal = (() => {

    function show(targetType, targetId) {
        // Remove any existing report modal
        close();

        const typeLabel = targetType === 'listing' ? 'Listing' : 'User';

        const html = `
        <div class="report-overlay" id="reportModal">
            <div class="report-modal">
                <div class="report-modal__header">
                    <h3>🚩 Report ${typeLabel}</h3>
                    <button class="report-modal__close" data-action="close-report">&times;</button>
                </div>
                <form class="report-modal__form" id="reportForm">
                    <input type="hidden" name="targetType" value="${Sanitizer.escapeAttr(targetType)}">
                    <input type="hidden" name="targetId" value="${Sanitizer.escapeAttr(targetId)}">
                    <div class="report-modal__group">
                        <label>Reason <span style="color:#ef4444">*</span></label>
                        <select name="reason" id="reportReason" class="report-modal__select" required>
                            <option value="">Select a reason...</option>
                            <option value="fake">🚫 Fake ${typeLabel}</option>
                            <option value="scam">💰 Scam / Fraud</option>
                            <option value="inappropriate">⚠️ Inappropriate Content</option>
                            <option value="other">📝 Other</option>
                        </select>
                    </div>
                    <div class="report-modal__group">
                        <label>Details <span style="color:var(--text-muted);font-size:0.7rem">(optional)</span></label>
                        <textarea name="description" id="reportDescription" class="report-modal__textarea" rows="3" placeholder="Describe the issue..." maxlength="500"></textarea>
                    </div>
                    <div class="report-modal__actions">
                        <button type="button" class="btn btn-secondary" data-action="close-report">Cancel</button>
                        <button type="submit" class="btn btn-danger" id="reportSubmitBtn">🚩 Submit Report</button>
                    </div>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        const modal = document.getElementById('reportModal');
        const form = document.getElementById('reportForm');

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
            if (e.target.closest('[data-action="close-report"]')) close();
        });

        // Submit handler
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const reason = document.getElementById('reportReason').value;
            const description = document.getElementById('reportDescription').value.trim();

            if (!reason) {
                App.showToast('warning', 'Required', 'Please select a reason.');
                return;
            }

            const submitBtn = document.getElementById('reportSubmitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                const result = await API.submitReport({
                    targetType,
                    targetId,
                    reason,
                    description,
                });

                if (result.success) {
                    App.showToast('success', 'Report Submitted', result.message);
                    close();
                } else {
                    App.showToast('error', 'Error', result.message || 'Could not submit report.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = '🚩 Submit Report';
                }
            } catch (err) {
                App.showToast('error', 'Network Error', 'Could not submit report. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = '🚩 Submit Report';
            }
        });
    }

    function close() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.remove();
        }
    }

    return { show, close };
})();
