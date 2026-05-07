/* ==========================================
   Auth Module — Registration & Login UI
   ==========================================
   UI Layer only. Delegates to AuthService for logic.
   Uses Store for state, Sanitizer for output.
   ========================================== */

const Auth = (() => {

  // ── Public API (delegates to AuthService) ──
  function isLoggedIn() { return AuthService.isLoggedIn(); }
  function getCurrentUser() { return AuthService.getCurrentUser(); }
  function logout() { AuthService.logout(); }
  async function checkSession() { await AuthService.checkSession(); }

  // ── UI: Registration Form ──
  function renderRegister() {
    return `
      <div class="auth-page">
        <div class="auth-split">
          <div class="auth-split__visual">
            <div class="auth-split__visual-content">
              <div class="auth-split__logo">Flatifigo<span>.</span></div>
              <h1 class="auth-split__quote">Find your perfect space, effortlessly.</h1>
              <p class="auth-split__author">Join the modern way to rent and connect.</p>
            </div>
          </div>
          <div class="auth-split__form-container">
            <div class="auth-card-header">
              <h2>Create Account </h2>
              <p>Join Flatifigo and start finding your perfect flat</p>
            </div>
            <form id="registerForm">
              <div class="premium-input-group">
                <label class="form-label" for="regName">Full Name</label>
                <input class="form-input" type="text" id="regName" placeholder="Enter your full name" required>
              </div>
              <div class="premium-input-group">
                <label class="form-label" for="regEmail">Email Address</label>
                <input class="form-input" type="email" id="regEmail" placeholder="you@example.com" required>
              </div>
              <div class="form-row" style="display:flex; gap:16px;">
                <div class="premium-input-group" style="flex:1;">
                  <label class="form-label" for="regPassword">Password</label>
                  <input class="form-input" type="password" id="regPassword" placeholder="Min 6 chars" required>
                </div>
                <div class="premium-input-group" style="flex:1;">
                  <label class="form-label" for="regConfirmPassword">Confirm</label>
                  <input class="form-input" type="password" id="regConfirmPassword" placeholder="Confirm" required>
                </div>
              </div>
              <div class="premium-input-group">
                <label class="form-label" for="regRole">I am a</label>
                <select class="form-select" id="regRole" required>
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="jobholder">Jobholder</option>
                  <option value="owner">Property Owner</option>
                </select>
              </div>
              <button type="submit" class="btn-premium" id="registerBtn">Create Account</button>
            </form>
            <div class="auth-footer">Already have an account? <a href="#login">Log in here</a></div>
          </div>
        </div>
      </div>`;
  }

  // ── UI: Login Form ──
  function renderLogin() {
    return `
      <div class="auth-page">
        <div class="auth-split">
          <div class="auth-split__visual">
            <div class="auth-split__visual-content">
              <div class="auth-split__logo">Flatifigo<span>.</span></div>
              <h1 class="auth-split__quote">Welcome back to your community.</h1>
              <p class="auth-split__author">Sign in to continue your journey.</p>
            </div>
          </div>
          <div class="auth-split__form-container">
            <div class="auth-card-header">
              <h2>Welcome Back </h2>
              <p>Sign in to your Flatifigo account</p>
            </div>
            <form id="loginForm">
              <div class="premium-input-group">
                <label class="form-label" for="loginEmail">Email Address</label>
                <input class="form-input" type="email" id="loginEmail" placeholder="you@example.com" required>
              </div>
              <div class="premium-input-group">
                <label class="form-label" for="loginPassword">Password</label>
                <input class="form-input" type="password" id="loginPassword" placeholder="Enter your password" required>
              </div>
              <button type="submit" class="btn-premium" id="loginBtn">Login</button>
            </form>
            <div class="auth-footer">Don't have an account? <a href="#register">Sign up for free</a></div>
          </div>
        </div>
      </div>`;
  }

  // ── Events ──
  function attachRegisterEvents() {
    const form = document.getElementById('registerForm');
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      btn.textContent = 'Creating...'; btn.disabled = true;

      const result = await AuthService.register({
        fullName: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value,
        role: document.getElementById('regRole').value
      });

      btn.textContent = 'Create Account'; btn.disabled = false;
      if (result.success) {
        App.showToast('success', 'Welcome!', result.message);
        App.updateNav();
        window.location.hash = '#profile';
      } else {
        App.showToast('error', 'Registration Failed', result.message);
      }
    });
  }

  function attachLoginEvents() {
    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      btn.textContent = 'Logging in...'; btn.disabled = true;

      const result = await AuthService.login(
        document.getElementById('loginEmail').value.trim(),
        document.getElementById('loginPassword').value
      );

      btn.textContent = 'Login'; btn.disabled = false;
      if (result.success) {
        App.showToast('success', 'Welcome Back!', result.message);
        App.updateNav();
        window.location.hash = '#home';
      } else {
        App.showToast('error', 'Login Failed', result.message);
      }
    });
  }

  return { isLoggedIn, getCurrentUser, logout, checkSession, renderRegister, renderLogin, attachRegisterEvents, attachLoginEvents };
})();
