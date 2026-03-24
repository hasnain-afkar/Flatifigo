/* ==========================================
   App Module — SPA Router & Init (API)
   ========================================== */

const App = (() => {

    function showToast(type, title, message) {
        const c = document.getElementById('toastContainer'); if (!c) return;
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><div class="toast-content"><strong>${title}</strong><span>${message}</span></div><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
        c.appendChild(t);
        setTimeout(() => { if (t.parentElement) { t.style.animation = 'fadeIn .3s ease reverse'; setTimeout(() => t.remove(), 300); } }, 4000);
    }

    function renderHome() {
        return `
      <!-- ═══ HERO ═══ -->
      <section class="hero">
        <div class="container" style="position:relative;z-index:1">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="hero-eyebrow-dot"></span>
              Pakistan's #1 Flat &amp; Roommate Platform
            </div>
            <h1>Find Your <em class="gradient-text">Dream Flat</em> &amp;<br>Perfect Roommate</h1>
            <p>Flatifigo connects students and jobholders with verified shared flats and compatible roommates across Pakistan's major cities.</p>

            <!-- Integrated Search Bar -->
            <div class="hero-search-wrap" id="heroSearchWrap">
              <div class="hero-search-field">
                <label>📍 City</label>
                <select id="heroCity" class="form-select" style="padding:0;border:none;background:transparent;color:var(--text-primary);font-weight:500;font-size:0.9rem;">
                  <option value="">Any City</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>
              <div class="hero-search-divider"></div>
              <div class="hero-search-field">
                <label>💰 Max Rent (PKR)</label>
                <input type="number" id="heroMaxRent" placeholder="e.g. 25,000" style="appearance:textfield"/>
              </div>
              <div class="hero-search-divider"></div>
              <div class="hero-search-field">
                <label>🛏 Rooms</label>
                <select id="heroRooms" style="padding:0;border:none;background:transparent;color:var(--text-primary);font-weight:500;font-size:0.9rem;">
                  <option value="">Any</option>
                  <option value="1">1 Room</option>
                  <option value="2">2 Rooms</option>
                  <option value="3">3+ Rooms</option>
                </select>
              </div>
              <button class="hero-search-btn" id="heroSearchBtn">
                🔍 Search
              </button>
            </div>

            <div class="hero-stats">
              <div class="hero-stat"><h3>500+</h3><p>Verified Listings</p></div>
              <div class="hero-stat"><h3>1,200+</h3><p>Happy Users</p></div>
              <div class="hero-stat"><h3>6</h3><p>Major Cities</p></div>
              <div class="hero-stat"><h3>4.8★</h3><p>Avg. Rating</p></div>
            </div>
          </div>
        </div>
        <div class="hero-3d-shapes">
          <div class="shape-3d shape-3d-1"></div>
          <div class="shape-3d shape-3d-2"></div>
          <div class="shape-3d shape-3d-3"></div>
          <div class="shape-3d shape-3d-4"></div>
        </div>
      </section>

      <!-- ═══ TRUST STRIP ═══ -->
      <div class="trust-strip">
        <div class="container">
          <div class="trust-strip-inner">
            <div class="trust-item"><div class="trust-icon">✅</div><div><strong>Admin Verified</strong>Every listing reviewed</div></div>
            <div class="trust-item"><div class="trust-icon">🔒</div><div><strong>Secure Platform</strong>Your data is protected</div></div>
            <div class="trust-item"><div class="trust-icon">💬</div><div><strong>Direct Contact</strong>Message owners instantly</div></div>
            <div class="trust-item"><div class="trust-icon">🚀</div><div><strong>Free to Join</strong>No hidden charges</div></div>
          </div>
        </div>
      </div>

      <!-- ═══ POPULAR CITIES ═══ -->
      <section class="popular-cities">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">📍 Locations</div>
            <h2>Browse by <span class="gradient-text">City</span></h2>
            <p>Flats available across Pakistan's top cities — find yours today.</p>
          </div>
          <div class="cities-grid stagger-children">
            <div class="city-card city-lahore" onclick="Search.filterByCity('Lahore')">
              <div class="city-card-bg" style="background-image:url('uploads/lahore.jpeg'),url('uploads/lahore.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Lahore</h3><span>120+ listings</span></div>
              <div class="city-card-badge">Popular</div>
            </div>
            <div class="city-card city-karachi" onclick="Search.filterByCity('Karachi')">
              <div class="city-card-bg" style="background-image:url('uploads/karachi.jpeg'),url('uploads/karachi.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Karachi</h3><span>95+ listings</span></div>
            </div>
            <div class="city-card city-islamabad" onclick="Search.filterByCity('Islamabad')">
              <div class="city-card-bg" style="background-image:url('uploads/islamabad.jpeg'),url('uploads/islamabad.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Islamabad</h3><span>80+ listings</span></div>
              <div class="city-card-badge">Hot 🔥</div>
            </div>
            <div class="city-card city-rawalpindi" onclick="Search.filterByCity('Rawalpindi')">
              <div class="city-card-bg" style="background-image:url('uploads/rawalpindi.jpeg'),url('uploads/rawalpindi.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Rawalpindi</h3><span>60+ listings</span></div>
            </div>
            <div class="city-card city-faisalabad" onclick="Search.filterByCity('Faisalabad')">
              <div class="city-card-bg" style="background-image:url('uploads/faisalabad.jpeg'),url('uploads/faisalabad.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Faisalabad</h3><span>45+ listings</span></div>
            </div>
            <div class="city-card city-multan" onclick="Search.filterByCity('Multan')">
              <div class="city-card-bg" style="background-image:url('uploads/multan.jpeg'),url('uploads/multan.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Multan</h3><span>30+ listings</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ FEATURES ═══ -->
      <section class="features">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">✨ Why Us</div>
            <h2>Why Choose <span class="gradient-text">Flatifigo</span>?</h2>
            <p>Everything you need to find the perfect shared living space, all in one platform.</p>
          </div>
          <div class="features-grid stagger-children">
            <div class="feature-card"><div class="feature-icon">🔍</div><h3>Smart Search</h3><p>Filter flats by city, budget, rooms, amenities, and proximity to your university or workplace.</p></div>
            <div class="feature-card"><div class="feature-icon">🤝</div><h3>Roommate Matching</h3><p>Our preference-based system finds roommates who match your lifestyle, budget, and schedule.</p></div>
            <div class="feature-card"><div class="feature-icon">🔒</div><h3>Verified Listings</h3><p>Every listing goes through admin verification to ensure safety and authenticity.</p></div>
            <div class="feature-card"><div class="feature-icon">💬</div><h3>In-App Messaging</h3><p>Communicate securely with property owners and potential roommates within the platform.</p></div>
            <div class="feature-card"><div class="feature-icon">⭐</div><h3>Reviews &amp; Ratings</h3><p>Read real reviews from other tenants to make informed decisions about flats and roommates.</p></div>
            <div class="feature-card"><div class="feature-icon">📊</div><h3>Owner Dashboard</h3><p>Property owners can manage listings, track inquiries, and update availability with ease.</p></div>
          </div>
        </div>
      </section>

      <!-- ═══ HOW IT WORKS ═══ -->
      <section class="how-it-works">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">📋 Steps</div>
            <h2>How It <span class="gradient-text">Works</span></h2>
            <p>Get started in minutes with these simple steps.</p>
          </div>
          <div class="steps-grid stagger-children">
            <div class="step-card"><div class="step-number">1</div><h3>Create Account</h3><p>Sign up in seconds and set up your profile with your preferences.</p></div>
            <div class="step-card"><div class="step-number">2</div><h3>Set Preferences</h3><p>Tell us your budget, location, lifestyle and schedule preferences.</p></div>
            <div class="step-card"><div class="step-number">3</div><h3>Browse &amp; Filter</h3><p>Explore verified listings with advanced filters to find matching flats.</p></div>
            <div class="step-card"><div class="step-number">4</div><h3>Connect &amp; Move In</h3><p>Message owners, finalize your flat, and start your shared living experience.</p></div>
          </div>
        </div>
      </section>`;
    }

    async function renderPage(page) {
        const app = document.getElementById('app'); if (!app) return;
        let html = '';
        switch (page) {
            case 'home': html = renderHome(); break;
            case 'register': html = Auth.renderRegister(); break;
            case 'login': html = Auth.renderLogin(); break;
            case 'profile': html = Profile.renderProfile(); break;
            case 'create-listing': html = Listings.renderCreateListing(); break;
            case 'my-listings': html = await Listings.renderMyListings(); break;
            case 'edit-listing': html = await Listings.renderEditListing(); break;
            case 'roommate-matches': html = await Roommates.renderMatches(); break;
            case 'recent-messages': html = Messages.renderMessages(); break;
            case 'browse': html = await Search.renderBrowse(); break;
            default: html = renderHome(); page = 'home';
        }
        app.innerHTML = html;
        switch (page) {
            case 'register': Auth.attachRegisterEvents(); break;
            case 'login': Auth.attachLoginEvents(); break;
            case 'profile': Profile.attachProfileEvents(); break;
            case 'create-listing': Listings.attachCreateListingEvents(); break;
            case 'my-listings': Listings.attachMyListingsEvents(); break;
            case 'edit-listing': Listings.attachEditListingEvents(); break;
            case 'browse': Search.attachBrowseEvents(); break;
            case 'roommate-matches': break; // No events to attach yet
        }
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) link.classList.add('active');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Wire hero search button
        const heroBtn = document.getElementById('heroSearchBtn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => {
                const city = document.getElementById('heroCity')?.value || '';
                const maxRent = document.getElementById('heroMaxRent')?.value || '';
                const rooms = document.getElementById('heroRooms')?.value || '';
                // push filters into Search before navigating
                if (city) Search.filterByCity(city);
                window.location.hash = '#browse';
            });
        }
        if (Auth.isLoggedIn()) {
            const heroSignUp = document.getElementById('heroSignUp');
            if (heroSignUp) { heroSignUp.href = '#profile'; heroSignUp.textContent = '\uD83D\uDC64 My Profile'; }
        }
    }

    function updateNav() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const authRequired = document.querySelectorAll('.auth-required');
        const ownerOnly = document.querySelectorAll('.owner-only');
        if (Auth.isLoggedIn()) {
            const user = Auth.getCurrentUser();
            authButtons.style.display = 'none'; userMenu.style.display = 'flex';
            authRequired.forEach(el => el.style.display = '');
            // Hide owner-only links for non-owner roles (students, jobholders)
            const isOwner = user.role === 'owner';
            ownerOnly.forEach(el => el.style.display = isOwner ? '' : 'none');
            const name = user.fullName || user.full_name || 'User';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('navAvatar').textContent = initials;
            document.getElementById('navUserName').textContent = name;
        } else {
            authButtons.style.display = 'flex'; userMenu.style.display = 'none';
            authRequired.forEach(el => el.style.display = 'none');
        }
    }

    function getCurrentPage() { return (window.location.hash.replace('#', '')) || 'home'; }

    async function init() {
        await Auth.checkSession();
        updateNav();
        renderPage(getCurrentPage());
        window.addEventListener('hashchange', () => renderPage(getCurrentPage()));
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout(); updateNav();
            showToast('info', 'Logged Out', 'You have been logged out successfully.');
            window.location.hash = '#home';
        });
        document.getElementById('navToggle').addEventListener('click', () => document.getElementById('navLinks').classList.toggle('open'));
        document.querySelectorAll('.nav-link,.nav-btn').forEach(l => l.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open')));
        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') Search.closeModal(); });
    }

    document.addEventListener('DOMContentLoaded', init);
    return { renderPage, updateNav, showToast };
})();
