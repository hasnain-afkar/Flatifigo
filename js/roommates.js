/* ==========================================
   Roommates Module — Search and View Roommates
   ========================================== */

const Roommates = (() => {

    async function loadMatches() {
        const result = await API.getRoommates();
        return result.success ? result.roommates : [];
    }

    function renderRoommateCard(r) {
        const avatarUrl = r.avatar ? `uploads/${r.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.full_name)}&background=random`;
        return `
            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="${avatarUrl}" alt="${r.full_name}" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="${avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${r.full_name}</span>
                        <span style="color: var(--text-muted); margin-left: auto; font-size: 12px; text-transform: capitalize;">${r.role}</span>
                    </div>
                    
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">${r.occupation || 'Roommate Seeker'}</h3>
                    
                    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${r.bio || 'No bio provided. Looking for a great shared living experience!'}
                    </p>

                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Budget Range</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 600;">₨ ${r.budget_min || 0} - ${r.budget_max || 'Any'}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="App.showToast('info', 'Coming Soon', 'Messaging in Iteration 2!')">Message</button>
                    </div>
                </div>
            </div>
        `;
    }

    async function renderMatches() {
        const matches = await loadMatches();
        
        const hardcodedRoommatesHtml = `
            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/hasnain.jpeg" alt="Hasnain Afkar" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="uploads/hasnain.jpeg" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Hasnain Afkar</span>
                        <span style="color: var(--text-muted); margin-left: auto; font-size: 12px;">Student</span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">CS Student @ FAST</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        Tech enthusiast and final year student. Looking for a quiet, study-friendly environment in Islamabad.
                    </p>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Budget Range</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 600;">₨ 15,000 - 25,000</span>
                        </div>
                        <button class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="App.showToast('info', 'Coming Soon', 'Messaging in Iteration 2!')">Message</button>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/talal.jpeg" alt="Talal Amer" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="uploads/talal.jpeg" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Talal Amer</span>
                        <span style="color: var(--text-muted); margin-left: auto; font-size: 12px;">Jobholder</span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">Marketing Specialist</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        Young professional working in digital marketing. Looking for a neat space and like-minded roommates.
                    </p>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Budget Range</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 600;">₨ 20,000 - 35,000</span>
                        </div>
                        <button class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="App.showToast('info', 'Coming Soon', 'Messaging in Iteration 2!')">Message</button>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/humayl.JPG" alt="Humayl Abdullah" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="uploads/humayl.JPG" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Humayl Abdullah</span>
                        <span style="color: var(--text-muted); margin-left: auto; font-size: 12px;">Student</span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">Engineering Student</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        Civil Engineering student. Organized, dependable, and easy-going. Looking for a shared room or flat.
                    </p>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Budget Range</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 600;">₨ 12,000 - 20,000</span>
                        </div>
                        <button class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="App.showToast('info', 'Coming Soon', 'Messaging in Iteration 2!')">Message</button>
                    </div>
                </div>
            </div>

            <div class="fiverr-card hover-elevate" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-md); cursor: pointer; display: flex; flex-direction: column;">
                <img src="uploads/umer.jpeg" alt="Umer Butt" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; transition: transform 0.3s ease;">
                <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="uploads/umer.jpeg" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Umer Butt</span>
                        <span style="color: var(--text-muted); margin-left: auto; font-size: 12px;">Student</span>
                    </div>
                    <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">Pre-Med Student</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        Studying hard and looking for a compatible roommate who values silence and focus.
                    </p>
                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Budget Range</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 600;">₨ 10,000 - 18,000</span>
                        </div>
                        <button class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="App.showToast('info', 'Coming Soon', 'Messaging in Iteration 2!')">Message</button>
                    </div>
                </div>
            </div>
        `;

        let matchesHtml = hardcodedRoommatesHtml;

        return `
            <div class="browse-container animate-fade-in" style="padding-top: 100px;">
                <div class="container">
                    <div class="browse-layout" style="display: block;">
                        
                        <div class="results-header" style="margin-bottom: 32px;">
                            <div>
                                <h1 style="font-size: 28px; color: var(--text-primary); margin-bottom: 8px; font-weight: 700;">Find Your Perfect Roommate</h1>
                                <p class="results-count" style="color: var(--text-secondary); font-size: 16px;">Showing <strong>4</strong> matching roommates found for you</p>
                            </div>
                        </div>

                        <div class="listings-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                            ${matchesHtml}
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    return { renderMatches };
})();
