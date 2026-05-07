/* ==========================================
   App Module - SPA Router & Init
   ========================================== */

const App = (() => {

    function showToast(type, title, message) {
        const c = document.getElementById('toastContainer');
        if (!c) return;

        const icons = {
            success: '&#10003;',
            error: '&#10005;',
            info: '&#9432;',
            warning: '&#9888;'
        };

        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `<span class="toast-icon">${icons[type] || '&#9432;'}</span><div class="toast-content"><strong>${title}</strong><span>${message}</span></div><button class="toast-close" data-action="close-toast">&times;</button>`;
        c.appendChild(t);

        setTimeout(() => {
            if (t.parentElement) {
                t.style.animation = 'fadeIn .3s ease reverse';
                setTimeout(() => t.remove(), 300);
            }
        }, 4000);
    }

    function isRoommateUser(user = Auth.getCurrentUser()) {
        return Boolean(user && ['user', 'student', 'jobholder'].includes(user.role));
    }

    function isOwner(user = Auth.getCurrentUser()) {
        return Boolean(user && user.role === 'owner');
    }

    function renderOwnerHome() {
        const user = Auth.getCurrentUser();
        const name = user ? (user.fullName || user.full_name || 'Owner') : 'Owner';

        return `
      <section class="hero home-hero">
        <div class="container home-hero-grid">
          <div class="hero-content home-hero-copy">
            <div class="hero-badge">
              <span class="hero-eyebrow-dot"></span>
              Property owner workspace
            </div>
            <h1>Manage your <em class="gradient-text-blue">properties</em> and tenant requests</h1>
            <p>Welcome back, ${Sanitizer.escape(name)}. Keep your listings updated, respond to inquiries, and track how your properties are performing.</p>

            <div class="home-owner-actions" style="justify-content:flex-start;margin-top:2rem">
              <a href="#owner-dashboard" class="btn btn-gold btn-lg">Open Dashboard</a>
              <a href="#create-listing" class="btn btn-primary btn-lg">Create Listing</a>
              <a href="#recent-messages" class="btn btn-secondary btn-lg">View Requests</a>
            </div>
          </div>

          <div class="home-hero-visual">
            <div class="home-hero-primary-media">
              <img src="uploads/8.jpg" alt="Shared flat bedroom">
              <div class="home-hero-media-caption">
                <span class="home-chip">Owner tools</span>
                <strong>Your listing operations in one place</strong>
                <span>Publish properties, manage availability, and reply to tenant inquiries</span>
              </div>
            </div>

            <div class="home-hero-mini-grid">
              <div class="home-mini-card">
                <img src="uploads/1.jpg.jpeg" alt="Property listing">
                <div>
                  <strong>Listings</strong>
                  <span>Edit rent, amenities, photos, and availability</span>
                </div>
              </div>
              <div class="home-mini-card">
                <img src="uploads/2.jpg.jpeg" alt="Apartment requests">
                <div>
                  <strong>Requests</strong>
                  <span>Respond to messages from interested tenants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="home-featured-section">
        <div class="container">
          <div class="section-header home-section-header">
            <div class="section-tag">Owner checklist</div>
            <h2>Keep your rental business moving</h2>
            <p>Use these shortcuts to publish properties, update availability, and reply to tenant inquiries quickly.</p>
          </div>
          <div class="home-steps-grid stagger-children">
            <a href="#create-listing" class="home-step-card" style="text-decoration:none">
              <div class="home-step-number">01</div>
              <h3>Post a New Property</h3>
              <p>Add rent, rooms, city, area, amenities, photos, and contact details for a new listing.</p>
            </a>
            <a href="#my-listings" class="home-step-card" style="text-decoration:none">
              <div class="home-step-number">02</div>
              <h3>Manage Listings</h3>
              <p>Edit rent or amenities, delete unavailable properties, and keep your listing photos current.</p>
            </a>
            <a href="#recent-messages" class="home-step-card" style="text-decoration:none">
              <div class="home-step-number">03</div>
              <h3>Reply to Requests</h3>
              <p>Open tenant messages, answer questions, share visit details, and follow up on serious inquiries.</p>
            </a>
            <a href="#owner-dashboard" class="home-step-card" style="text-decoration:none">
              <div class="home-step-number">04</div>
              <h3>Check Performance</h3>
              <p>Review listing views, active listings, rented properties, and unread tenant requests.</p>
            </a>
          </div>
        </div>
      </section>`;
    }

    function renderHome() {
        if (isOwner()) return renderOwnerHome();

        return `
      <section class="hero home-hero">
        <div class="container home-hero-grid">
          <div class="hero-content home-hero-copy">
            <div class="hero-badge">
              <span class="hero-eyebrow-dot"></span>
              For students &amp; jobholders across Pakistan
            </div>
            <h1>Find your <em class="gradient-text-blue">perfect flat</em> and a <em class="gradient-text">compatible roommate</em></h1>
            <p>Flatifigo connects students and jobholders with verified shared flats and compatible roommates. Search listings, match with roommates based on lifestyle &amp; budget, and move in with confidence.</p>

            <div class="hero-search-wrap home-hero-search" id="heroSearchWrap">
              <div class="hero-search-field">
                <label>City</label>
                <select id="heroCity" class="form-select hero-search-select">
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
                <label>Max Rent</label>
                <input type="number" id="heroMaxRent" placeholder="PKR 25,000" class="hero-search-input"/>
              </div>
              <div class="hero-search-divider"></div>
              <div class="hero-search-field">
                <label>Rooms</label>
                <select id="heroRooms" class="hero-search-select">
                  <option value="">Any</option>
                  <option value="1">1 Room</option>
                  <option value="2">2 Rooms</option>
                  <option value="3">3+ Rooms</option>
                </select>
              </div>
              <button class="hero-search-btn home-hero-search-btn" id="heroSearchBtn">
                Search Flats
              </button>
            </div>

            <div class="home-hero-pills">
              <button class="home-filter-pill" type="button" data-city="Lahore">🏠 Lahore rooms</button>
              <button class="home-filter-pill" type="button" data-city="Karachi">🌊 Karachi flats</button>
              <button class="home-filter-pill" type="button" data-city="Islamabad">🏔️ Islamabad shared spaces</button>
              <a href="#roommate-matches" class="home-filter-pill home-filter-pill--gold seeker-only">👥 Find Roommates</a>
            </div>

            <div class="hero-stats home-hero-stats">
              <div class="hero-stat"><h3>500+</h3><p>Verified listings</p></div>
              <div class="hero-stat"><h3>1,200+</h3><p>Active users</p></div>
              <div class="hero-stat"><h3>85%</h3><p>Match accuracy</p></div>
              <div class="hero-stat"><h3>6</h3><p>Cities covered</p></div>
            </div>
          </div>

          <div class="home-hero-visual">
            <div class="home-hero-primary-media">
              <img src="uploads/roommate_hero.png" alt="Students sharing an apartment">
              <div class="home-hero-media-caption">
                <span class="home-chip">Find flats &amp; roommates</span>
                <strong>Your next shared living experience starts here</strong>
                <span>Browse flats, match with compatible roommates, move in together</span>
              </div>
            </div>


            <div class="home-hero-mini-grid">
              <div class="home-mini-card">
                <img src="uploads/8.jpg" alt="Shared flat bedroom">
                <div>
                  <strong>Shared Flats</strong>
                  <span>Verified listings with photos &amp; details</span>
                </div>
              </div>
              <div class="home-mini-card">
                <img src="uploads/roommate_matching.png" alt="Roommate matching">
                <div>
                  <strong>Roommates</strong>
                  <span>Find people who match your vibe</span>
                </div>
              </div>
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

      <!-- ═══ HOW IT WORKS ═══ -->
      <section class="home-how-it-works">
        <div class="container">
          <div class="section-header home-section-header">
            <div class="section-tag">How it works</div>
            <h2>From sign-up to move-in, in 4 simple steps</h2>
            <p>Whether you're looking for a flat, a roommate, or both — Flatifigo makes the entire process easy and transparent.</p>
          </div>

          <div class="home-steps-grid stagger-children">
            <div class="home-step-card">
              <div class="home-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="home-step-number">01</div>
              <h3>Create Your Profile</h3>
              <p>Sign up as a student, jobholder, or property owner. Set your budget, preferred city, lifestyle habits, and schedule preferences.</p>
            </div>
            <div class="home-step-card">
              <div class="home-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div class="home-step-number">02</div>
              <h3>Search &amp; Filter Flats</h3>
              <p>Browse hundreds of verified flat listings. Filter by city, budget, room count, and amenities to find the right place fast.</p>
            </div>
            <div class="home-step-card home-step-card--highlight">
              <div class="home-step-icon home-step-icon--gold">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div class="home-step-number home-step-number--gold">03</div>
              <h3>Find Compatible Roommates</h3>
              <p>Our matching system suggests roommates based on lifestyle, schedule, and budget compatibility. Browse profiles and connect with your ideal match.</p>
            </div>
            <div class="home-step-card">
              <div class="home-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div class="home-step-number">04</div>
              <h3>Chat &amp; Move In</h3>
              <p>Message property owners or potential roommates directly through our platform. Finalize details and move into your new shared home.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ ROOMMATE MATCHING SHOWCASE ═══ -->
      <section class="home-roommate-section">
        <div class="container">
          <div class="home-roommate-grid">
            <div class="home-roommate-visual">
              <div class="home-roommate-img-main">
                <img src="uploads/roommate_community.png" alt="Roommates socializing in shared apartment">
                <div class="home-roommate-img-overlay">
                  <div class="home-roommate-match-badge">
                    <span class="home-match-percent">85%</span>
                    <span class="home-match-label">Match</span>
                  </div>
                </div>
              </div>
              <div class="home-roommate-profiles stagger-children">
                <div class="home-roommate-profile-card">
                  <img src="uploads/hasnain.jpeg" alt="Hasnain Afkar">
                  <div>
                    <strong>Hasnain Afkar</strong>
                    <span>CS Student @ FAST</span>
                    <div class="home-roommate-tags">
                      <span>Islamabad</span>
                      <span>PKR 15K-25K</span>
                    </div>
                  </div>
                </div>
                <div class="home-roommate-profile-card">
                  <img src="uploads/talal.jpeg" alt="Talal Amer">
                  <div>
                    <strong>Talal Amer</strong>
                    <span>Marketing Specialist</span>
                    <div class="home-roommate-tags">
                      <span>Lahore</span>
                      <span>PKR 20K-35K</span>
                    </div>
                  </div>
                </div>
                <div class="home-roommate-profile-card">
                  <img src="uploads/umer.jpeg" alt="Umer Butt">
                  <div>
                    <strong>Umer Butt</strong>
                    <span>Pre-Med Student</span>
                    <div class="home-roommate-tags">
                      <span>Rawalpindi</span>
                      <span>PKR 10K-18K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="home-roommate-copy">
              <div class="section-tag section-tag--gold">Roommate matching</div>
              <h2>Don't just find a flat — find <em class="gradient-text">the right people</em> to share it with</h2>
              <p>Living with the wrong roommate can ruin your experience. Flatifigo's preference-based matching considers your lifestyle, schedule, cleanliness habits, and budget to connect you with truly compatible roommates.</p>
              
              <div class="home-roommate-features">
                <div class="home-roommate-feature">
                  <div class="home-roommate-feature-icon">🎯</div>
                  <div>
                    <h4>Preference-Based Matching</h4>
                    <p>Set your budget, preferred city, lifestyle, and schedule. We'll show you people who match.</p>
                  </div>
                </div>
                <div class="home-roommate-feature">
                  <div class="home-roommate-feature-icon">👤</div>
                  <div>
                    <h4>Detailed Profiles</h4>
                    <p>View occupation, bio, budget range, and habits before making a decision.</p>
                  </div>
                </div>
                <div class="home-roommate-feature">
                  <div class="home-roommate-feature-icon">💬</div>
                  <div>
                    <h4>In-App Messaging</h4>
                    <p>Chat directly with potential roommates without sharing personal contact info.</p>
                  </div>
                </div>
              </div>

              <div class="home-roommate-cta">
                <a href="#roommate-matches" class="btn btn-gold btn-lg seeker-only">Browse Roommates</a>
                <a href="#register" class="btn btn-secondary btn-lg" id="heroSignUp">Create Profile</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ FEATURED LISTINGS ═══ -->
      <section class="home-featured-section">
        <div class="container">
          <div class="section-header home-section-header">
            <div class="section-tag">Featured rentals</div>
            <h2>Explore verified shared flats across Pakistan</h2>
            <p>Every listing comes with photos, verified rent details, room count, and amenities — so you know exactly what you're getting.</p>
          </div>

          <div class="home-featured-grid stagger-children">
            <article class="home-featured-card" data-city="Lahore">
              <div class="home-featured-image">
                <img src="uploads/1.jpg.jpeg" alt="Shared apartment in Lahore">
                <span class="home-featured-badge">Most viewed</span>
              </div>
              <div class="home-featured-body">
                <div class="home-featured-topline">
                  <span>Lahore</span>
                  <strong>PKR 22,000/mo</strong>
                </div>
                <h3>Furnished private room near Gulberg main boulevard</h3>
                <p>Ideal for students and young professionals who want quick transport, secure access, and ready-to-move comfort.</p>
                <div class="home-featured-meta">
                  <span>2 rooms</span>
                  <span>Wifi included</span>
                  <span>Owner verified</span>
                </div>
              </div>
            </article>

            <article class="home-featured-card" data-city="Islamabad">
              <div class="home-featured-image">
                <img src="uploads/2.jpg.jpeg" alt="Apartment in Islamabad">
                <span class="home-featured-badge home-featured-badge-blue">New listing</span>
              </div>
              <div class="home-featured-body">
                <div class="home-featured-topline">
                  <span>Islamabad</span>
                  <strong>PKR 28,000/mo</strong>
                </div>
                <h3>Calm shared flat with separate study area in F-11</h3>
                <p>Good for focused living with a quiet setup, modern kitchen, and easy access to business districts and universities.</p>
                <div class="home-featured-meta">
                  <span>3 rooms</span>
                  <span>Furnished</span>
                  <span>Secure building</span>
                </div>
              </div>
            </article>

            <article class="home-featured-card" data-city="Karachi">
              <div class="home-featured-image">
                <img src="uploads/3.jpg.jpeg" alt="Apartment in Karachi">
                <span class="home-featured-badge">Popular now</span>
              </div>
              <div class="home-featured-body">
                <div class="home-featured-topline">
                  <span>Karachi</span>
                  <strong>PKR 18,500/mo</strong>
                </div>
                <h3>Compact shared space near Clifton with bright common areas</h3>
                <p>Great for renters who want fast city access, practical rent, and a clean, well-maintained property.</p>
                <div class="home-featured-meta">
                  <span>1 room</span>
                  <span>Utilities included</span>
                  <span>Fast replies</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ═══ TRUST STRIP ═══ -->
      <div class="trust-strip">
        <div class="container">
          <div class="trust-strip-inner">
            <div class="trust-item"><div class="trust-icon">✓</div><div><strong>Verified listings</strong>Each listing is reviewed before going live</div></div>
            <div class="trust-item"><div class="trust-icon">💰</div><div><strong>Transparent pricing</strong>Rent, utilities &amp; costs are upfront</div></div>
            <div class="trust-item"><div class="trust-icon">👥</div><div><strong>Roommate matching</strong>Find compatible people to share with</div></div>
            <div class="trust-item"><div class="trust-icon">💬</div><div><strong>Secure messaging</strong>Chat safely within the platform</div></div>
          </div>
        </div>
      </div>

      <!-- ═══ BROWSE BY CITY ═══ -->
      <section class="popular-cities home-cities-section">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">Browse by city</div>
            <h2>Find shared flats &amp; roommates in your city</h2>
            <p>We're active in major Pakistani cities where students and professionals need shared accommodation the most.</p>
          </div>
          <div class="cities-grid stagger-children">
            <div class="city-card city-lahore" data-city="Lahore">
              <div class="city-card-bg" style="background-image:url('uploads/lahore.jpeg'),url('uploads/lahore.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Lahore</h3><span>120+ listings</span></div>
              <div class="city-card-badge">Popular</div>
            </div>
            <div class="city-card city-karachi" data-city="Karachi">
              <div class="city-card-bg" style="background-image:url('uploads/karachi.jpeg'),url('uploads/karachi.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Karachi</h3><span>95+ listings</span></div>
            </div>
            <div class="city-card city-islamabad" data-city="Islamabad">
              <div class="city-card-bg" style="background-image:url('uploads/islamabad.jpeg'),url('uploads/islamabad.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Islamabad</h3><span>80+ listings</span></div>
              <div class="city-card-badge">Hot</div>
            </div>
            <div class="city-card city-rawalpindi" data-city="Rawalpindi">
              <div class="city-card-bg" style="background-image:url('uploads/rawalpindi.jpeg'),url('uploads/rawalpindi.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Rawalpindi</h3><span>60+ listings</span></div>
            </div>
            <div class="city-card city-faisalabad" data-city="Faisalabad">
              <div class="city-card-bg" style="background-image:url('uploads/faisalabad.jpeg'),url('uploads/faisalabad.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Faisalabad</h3><span>45+ listings</span></div>
            </div>
            <div class="city-card city-multan" data-city="Multan">
              <div class="city-card-bg" style="background-image:url('uploads/multan.jpeg'),url('uploads/multan.jpg')"></div>
              <div class="city-card-overlay"></div>
              <div class="city-card-info"><h3>Multan</h3><span>30+ listings</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ PLATFORM BENEFITS ═══ -->
      <section class="home-benefits">
        <div class="container home-benefits-grid">
          <div class="home-benefits-copy">
            <div class="section-tag">Why Flatifigo</div>
            <h2>Everything you need for shared living, in one place</h2>
            <p>We built Flatifigo to solve real problems students and jobholders face when searching for accommodation in a new city — from finding a trustworthy flat to connecting with the right roommates.</p>

            <div class="home-benefits-list">
              <div class="home-benefit-row">
                <span class="home-benefit-number">01</span>
                <div>
                  <h3>Search &amp; filter listings</h3>
                  <p>Filter by city, budget range, room count, and amenities. Find options that match your needs instantly.</p>
                </div>
              </div>
              <div class="home-benefit-row">
                <span class="home-benefit-number">02</span>
                <div>
                  <h3>Smart roommate matching</h3>
                  <p>Our system suggests compatible roommates based on your lifestyle, schedule, and budget preferences.</p>
                </div>
              </div>
              <div class="home-benefit-row">
                <span class="home-benefit-number">03</span>
                <div>
                  <h3>Message &amp; connect securely</h3>
                  <p>In-app messaging keeps all communication safe and organized — no need to share phone numbers.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="home-benefits-panel">
            <div class="home-panel-card">
              <div class="home-panel-copy">
                <span class="home-chip home-chip-blue">Built for shared living</span>
                <h3>Not just listings — a complete roommate finding experience.</h3>
                <p>Flatifigo combines flat browsing with roommate matching and secure messaging, so you don't need to juggle multiple apps and WhatsApp groups.</p>
              </div>
              <img src="uploads/roommate_community.png" alt="Roommates in shared apartment">
            </div>
            <div class="home-panel-metrics">
              <div class="home-metric-card">
                <strong>85%</strong>
                <span>Average roommate compatibility score</span>
              </div>
              <div class="home-metric-card">
                <strong>24h</strong>
                <span>Average response time from owners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ TESTIMONIALS ═══ -->
      <section class="home-testimonials">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">What our users say</div>
            <h2>Real stories from real students &amp; professionals</h2>
            <p>Hear from users who found their ideal flat and roommate through Flatifigo.</p>
          </div>
          <div class="home-testimonials-grid stagger-children">
            <div class="home-testimonial-card">
              <div class="home-testimonial-stars">★★★★★</div>
              <p>"I was struggling to find a roommate when I moved to Islamabad for university. Flatifigo matched me with someone who had the same study schedule and budget. We've been sharing a flat for 6 months now — best decision ever!"</p>
              <div class="home-testimonial-author">
                <div class="home-testimonial-avatar">HA</div>
                <div>
                  <strong>Hasnain A.</strong>
                  <span>CS Student, FAST Islamabad</span>
                </div>
              </div>
            </div>
            <div class="home-testimonial-card">
              <div class="home-testimonial-stars">★★★★★</div>
              <p>"As a property owner, I used to get random calls from Facebook groups. With Flatifigo, I get serious inquiries from verified users. The listing format with photos works great — my place was rented within a week."</p>
              <div class="home-testimonial-author">
                <div class="home-testimonial-avatar">AR</div>
                <div>
                  <strong>Ali R.</strong>
                  <span>Property Owner, Lahore</span>
                </div>
              </div>
            </div>
            <div class="home-testimonial-card">
              <div class="home-testimonial-stars">★★★★★</div>
              <p>"I needed a flat near my office in Karachi but couldn't afford one alone. Flatifigo helped me find both a great flat AND a compatible roommate who works in the same area. The messaging system made everything smooth."</p>
              <div class="home-testimonial-author">
                <div class="home-testimonial-avatar">TA</div>
                <div>
                  <strong>Talal A.</strong>
                  <span>Marketing Professional, Karachi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ OWNER & SEEKER CTA ═══ -->
      <section class="home-owner-cta">
        <div class="container">
          <div class="home-owner-card">
            <div class="home-owner-copy">
              <div class="section-tag">Get started today</div>
              <h2>Whether you're looking for a flat or a roommate — start here.</h2>
              <p>Join thousands of students and professionals who trust Flatifigo for finding verified shared flats and compatible roommates in their city.</p>
            </div>
            <div class="home-owner-actions">
              <a href="#register" class="btn btn-gold btn-lg">Sign Up Free</a>
              <a href="#browse" class="btn btn-primary btn-lg">Browse Flats</a>
              <a href="#roommate-matches" class="btn btn-secondary btn-lg seeker-only">Find Roommates</a>
            </div>
          </div>
        </div>
      </section>`;
    }

    async function renderPage(hashPage) {
        const app = document.getElementById('app');
        if (!app) return;

        // Parse parameterized pages like messages-user_id
        let page = hashPage;
        let param = null;
        if (hashPage.startsWith('messages-')) {
            page = 'recent-messages';
            param = hashPage.replace('messages-', '');
        }

        let html = '';
        switch (page) {
            case 'home': html = renderHome(); break;
            case 'register': html = Auth.renderRegister(); break;
            case 'login': html = Auth.renderLogin(); break;
            case 'profile': html = Profile.renderProfile(); break;
            case 'create-listing': html = Listings.renderCreateListing(); break;
            case 'my-listings': html = await Listings.renderMyListings(); break;
            case 'edit-listing': html = await Listings.renderEditListing(); break;
            case 'roommate-matches':
                if (!Auth.isLoggedIn()) {
                    html = `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Log In Required</h2><p>Please log in as a student or jobholder to browse roommates.</p><a href="#login" class="btn btn-primary">Log In</a></div></div>`;
                } else if (!isRoommateUser()) {
                    html = `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Roommate Matching Is For Users</h2><p>Property owners can manage listings, dashboard, and tenant requests instead.</p><a href="#owner-dashboard" class="btn btn-primary">Owner Dashboard</a></div></div>`;
                } else {
                    html = await Roommates.renderMatches();
                }
                break;
            case 'recent-messages': html = await Messages.renderMessages(param); break;
            case 'favorites': html = await Favorites.renderFavorites(); break;
            case 'browse':
                if (isOwner()) {
                    html = `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Owner Workspace</h2><p>Property owners manage their own listings and tenant requests from the owner dashboard.</p><a href="#owner-dashboard" class="btn btn-primary">Owner Dashboard</a></div></div>`;
                } else {
                    html = await Search.renderBrowse();
                }
                break;
            case 'owner-dashboard': html = typeof Dashboard !== 'undefined' ? await Dashboard.render() : `<div class="container" style="padding:4rem 0"><h2>Coming soon</h2></div>`; break;
            case 'admin-panel': html = typeof AdminPanel !== 'undefined' ? await AdminPanel.render() : `<div class="container" style="padding:4rem 0"><h2>Coming soon</h2></div>`; break;
            default: html = renderHome(); page = 'home';
        }

        app.innerHTML = html;
        updateNav();

        // Toggle admin-only layout (hide navbar/footer)
        const isAdminPage = page === 'admin-panel';
        if (typeof AdminPanel !== 'undefined' && AdminPanel.showAdminLayout) {
            AdminPanel.showAdminLayout(isAdminPage);
        }

        switch (page) {
            case 'register': Auth.attachRegisterEvents(); break;
            case 'login': Auth.attachLoginEvents(); break;
            case 'profile': Profile.attachProfileEvents(); break;
            case 'create-listing': Listings.attachCreateListingEvents(); break;
            case 'my-listings': Listings.attachMyListingsEvents(); break;
            case 'edit-listing': Listings.attachEditListingEvents(); break;
            case 'browse': if (!isOwner()) Search.attachBrowseEvents(); break;
            case 'favorites': Favorites.attachFavoritesEvents(); break;
            case 'recent-messages': Messages.attachMessageEvents(); break;
            case 'roommate-matches': if (isRoommateUser()) Roommates.attachRoommateEvents(); break;
            case 'owner-dashboard': if (typeof Dashboard !== 'undefined') Dashboard.attachEvents(); break;
            case 'admin-panel': if (typeof AdminPanel !== 'undefined') AdminPanel.attachEvents(); break;
        }

        attachPageEvents(page);

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) link.classList.add('active');
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Auto-redirect admin users to admin panel after login
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.role === 'admin' && page !== 'admin-panel' && page !== 'login' && page !== 'register') {
            window.location.hash = '#admin-panel';
        }
    }

    function attachPageEvents(page) {
        function goToBrowse(overrides = {}) {
            Store.set('currentFilters', {
                query: '',
                city: '',
                minRent: '',
                maxRent: '',
                rooms: '',
                amenities: [],
                ...overrides
            });

            if (window.location.hash === '#browse') renderPage('browse');
            else window.location.hash = '#browse';
        }

        const heroBtn = document.getElementById('heroSearchBtn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => {
                const city = document.getElementById('heroCity')?.value || '';
                const maxRent = document.getElementById('heroMaxRent')?.value || '';
                const rooms = document.getElementById('heroRooms')?.value || '';

                goToBrowse({
                    city: city ? city.toLowerCase() : '',
                    maxRent,
                    rooms
                });
            });
        }

        document.querySelectorAll('[data-city]').forEach((item) => {
            item.addEventListener('click', () => {
                goToBrowse({ city: item.dataset.city.toLowerCase() });
            });
        });

        if (Auth.isLoggedIn()) {
            const heroSignUp = document.getElementById('heroSignUp');
            if (heroSignUp) {
                heroSignUp.href = '#profile';
                heroSignUp.textContent = 'My Profile';
            }
        }
    }

    function updateNav() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const authRequired = document.querySelectorAll('.auth-required');
        const ownerOnly = document.querySelectorAll('.owner-only');
        const seekerOnly = document.querySelectorAll('.seeker-only');
        const notOwnerOnly = document.querySelectorAll('.not-owner-only');
        const adminOnly = document.querySelectorAll('.admin-only');

        if (Auth.isLoggedIn()) {
            const user = Auth.getCurrentUser();
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');
            authRequired.forEach(el => el.classList.remove('hidden'));

            const isOwner = user.role === 'owner';
            const isAdmin = user.role === 'admin';
            const canUseRoommates = isRoommateUser(user);
            ownerOnly.forEach(el => isOwner ? el.classList.remove('hidden') : el.classList.add('hidden'));
            seekerOnly.forEach(el => canUseRoommates ? el.classList.remove('hidden') : el.classList.add('hidden'));
            notOwnerOnly.forEach(el => (!isOwner && !isAdmin) ? el.classList.remove('hidden') : el.classList.add('hidden'));
            adminOnly.forEach(el => isAdmin ? el.classList.remove('hidden') : el.classList.add('hidden'));

            const name = user.fullName || user.full_name || 'User';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('navAvatar').textContent = initials;
            document.getElementById('navUserName').textContent = name;
        } else {
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
            authRequired.forEach(el => el.classList.add('hidden'));
            ownerOnly.forEach(el => el.classList.add('hidden'));
            seekerOnly.forEach(el => el.classList.add('hidden'));
            notOwnerOnly.forEach(el => el.classList.remove('hidden'));
            adminOnly.forEach(el => el.classList.add('hidden'));
        }
    }

    function getCurrentPage() {
        return (window.location.hash.replace('#', '')) || 'home';
    }

    function initDropdown() {
        const btn = document.getElementById('customHamburgerBtn');
        const menu = document.getElementById('customHamburgerDropdown');
        if (!btn || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');
            menu.classList.toggle('hidden');
            menu.classList.toggle('open');
            btn.setAttribute('aria-expanded', !isOpen);
        });

        document.addEventListener('click', () => {
            menu.classList.add('hidden');
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });

        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('a')) {
                menu.classList.add('hidden');
                menu.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initGlobalDelegation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="close-toast"]')) {
                e.target.parentElement.remove();
            }
        });
    }

    async function init() {
        await Auth.checkSession();
        updateNav();
        initDropdown();
        initGlobalDelegation();
        renderPage(getCurrentPage());

        window.addEventListener('hashchange', () => renderPage(getCurrentPage()));

        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            updateNav();
            showToast('info', 'Logged Out', 'You have been logged out successfully.');
            window.location.hash = '#home';
        });

        document.getElementById('navToggle').addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('open');
        });

        document.querySelectorAll('.nav-link,.nav-btn').forEach(l => {
            l.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
        });

        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') Search.closeModal();
        });

        // Notifications Polling
        setInterval(updateNotifications, 10000);
        updateNotifications(); // Run once on init
    }

    async function updateNotifications() {
        if (!Auth.isLoggedIn()) return;
        const res = await API.getMessages();
        if (res.success) {
            let unread = 0;
            res.conversations.forEach(c => unread += c.unread_count || 0);
            
            const msgLink = document.querySelector('[href="#recent-messages"]');
            let badge = document.getElementById('msgBadge');
            
            if (unread > 0) {
                if (!badge && msgLink) {
                    badge = document.createElement('span');
                    badge.id = 'msgBadge';
                    badge.className = 'nav-badge';
                    msgLink.appendChild(badge);
                }
                if (badge) badge.textContent = unread;

                const lastUnread = Store.get('lastUnreadCount') || 0;
                if (unread > lastUnread) {
                    showToast('info', 'New Message!', `You have ${unread - lastUnread} new message(s).`);
                }
                Store.set('lastUnreadCount', unread);
            } else {
                if (badge) badge.remove();
                Store.set('lastUnreadCount', 0);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return { renderPage, updateNav, showToast, updateNotifications };
})();
