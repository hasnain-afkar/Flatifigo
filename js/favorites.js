/* ==========================================
   Favorites Module — View Saved Flats UI
   ========================================== */

const Favorites = (() => {

    async function renderFavorites() {
        if (!Auth.isLoggedIn()) {
            return `<div class="empty-state"><div class="empty-state-icon">🔒</div><h3>Log In Required</h3><p>Please log in to view your favorite flats.</p><a href="#login" class="btn btn-primary">Log In</a></div>`;
        }

        const user = Auth.getCurrentUser();
        if (user && user.role === 'owner') {
            return `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Favorites Are For Users</h2><p>Property owners can manage listings, dashboard, and tenant requests instead.</p><a href="#owner-dashboard" class="btn btn-primary">Owner Dashboard</a></div></div>`;
        }

        const res = await API.getFavorites();
        const listings = res.success ? res.listings : [];
        const favIds = listings.map(l => l.id); // they are all favorites

        const cardsHtml = listings.length > 0
            ? listings.map(l => Search.renderFiverrCard(l, favIds)).join('')
            : `<div class="empty-state"><div class="empty-state-icon">❤️</div><h3>No Favorites Yet</h3><p>Start browsing and save flats you like.</p><a href="#browse" class="btn btn-primary">Browse Flats</a></div>`;

        return `
            <div class="search-hero">
                <div class="container">
                    <h1>Your <span class="gradient-text">Favorite Flats</span></h1>
                    <p>You have saved ${listings.length} flat${listings.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <div class="browse-container--padded animate-fade-in">
                <div class="container">
                    <div class="listings-grid--4col" id="favoritesGrid">
                        ${cardsHtml}
                    </div>
                </div>
            </div>`;
    }

    function attachFavoritesEvents() {
        const grid = document.getElementById('favoritesGrid');
        if (grid) {
            grid.addEventListener('click', async (e) => {
                const heart = e.target.closest('[data-action="toggle-heart"]');
                if (heart) {
                    e.stopPropagation();
                    const listingId = heart.dataset.id;
                    const res = await API.removeFavorite(listingId);
                    if (res.success) {
                        App.renderPage('favorites'); // re-render
                    } else {
                        App.showToast('error', 'Error', 'Could not remove favorite.');
                    }
                    return;
                }
                const card = e.target.closest('[data-action="show-detail"]');
                if (card) Search.showDetail(card.dataset.id);
            });
        }
    }

    return { renderFavorites, attachFavoritesEvents };
})();
