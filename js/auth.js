/* ==========================================
   Auth Module — Registration & Login (API)
   ========================================== */

const Auth = (() => {
    let currentUser = JSON.parse(localStorage.getItem('flatifigo_user') || 'null');

    function isLoggedIn() { return currentUser !== null && API.getToken() !== null; }
    function getCurrentUser() { return currentUser; }

    function setCurrentUser(user) {
        currentUser = user;
        if (user) localStorage.setItem('flatifigo_user', JSON.stringify(user));
        else localStorage.removeItem('flatifigo_user');
    }

    async function register(formData) {
        const result = await API.register(formData);
        if (result.success) {
            API.setToken(result.token);
            setCurrentUser(result.user);
        }
        return result;
    }

    async function login(email, password) {
        const result = await API.login({ email, password });
        if (result.success) {
            API.setToken(result.token);
            setCurrentUser(result.user);
        }
        return result;
    }

    function logout() {
        API.logout();
        API.setToken(null);
        setCurrentUser(null);
    }

    async function checkSession() {
        if (!API.getToken()) return;
        const result = await API.checkSession();
        if (result.loggedIn) {
            setCurrentUser(result.user);
        } else {
            API.setToken(null);
            setCurrentUser(null);
        }
    }

    function renderRegister() {
        return `
      <div class="auth-page">
        <div class="auth-card animate-fade-in-up">
          <div class="auth-card-header">
            <h2>Create Your Account ✨</h2>
            <p>Join Flatifigo and start finding your perfect flat</p>
          </div>
          <form id="registerForm">
            <div class="form-group">
              <label class="form-label" for="regName">Full Name</label>
              <input class="form-input" type="text" id="regName" placeholder="Enter your full name" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="regEmail">Email Address</label>
              <input class="form-input" type="email" id="regEmail" placeholder="you@example.com" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="regPassword">Password</label>
                <input class="form-input" type="password" id="regPassword" placeholder="Min 6 characters" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="regConfirmPassword">Confirm Password</label>
                <input class="form-input" type="password" id="regConfirmPassword" placeholder="Confirm password" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="regRole">I am a</label>
              <select class="form-select" id="regRole" required>
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="jobholder">Jobholder</option>
                <option value="owner">Property Owner</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="registerBtn">Create Account</button>
          </form>
          <div class="auth-footer">Already have an account? <a href="#login">Log in here</a></div>
        </div>
      </div>`;
    }

    function renderLogin() {
        return `
      <div class="auth-page">
        <div class="auth-card animate-fade-in-up">
          <div class="auth-card-header">
            <h2>Welcome Back 👋</h2>
            <p>Sign in to your Flatifigo account</p>
          </div>
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email Address</label>
              <input class="form-input" type="email" id="loginEmail" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="loginPassword">Password</label>
              <input class="form-input" type="password" id="loginPassword" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="loginBtn">Login</button>
          </form>
          <div class="auth-footer">Don't have an account? <a href="#register">Sign up for free</a></div>
        </div>
      </div>`;
    }

    function attachRegisterEvents() {
        const form = document.getElementById('registerForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('registerBtn');
            btn.textContent = 'Creating...'; btn.disabled = true;
            const result = await register({
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
            const result = await login(
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
