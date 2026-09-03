/**
 * Authentication and User Session Management
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    const token = localStorage.getItem('layoveriq_token');
    const savedUser = localStorage.getItem('layoveriq_user');

    if (token && savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.updateNavUI();
      } catch (e) {
        this.logout();
      }
    } else {
      this.updateNavUI();
    }
  }

  updateNavUI() {
    const userContainer = document.getElementById('navUserContainer');
    if (!userContainer) return;

    if (this.currentUser && this.currentUser.id !== 'guest') {
      userContainer.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
            ${this.currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-semibold text-white leading-tight">${this.currentUser.name}</p>
            <p class="text-[10px] text-slate-400 leading-tight">${this.currentUser.email}</p>
          </div>
          <button onclick="window.authManager.logout()" class="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-700 hover:bg-slate-800 transition">
            Logout
          </button>
        </div>
      `;
    } else {
      userContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="window.authManager.openLoginModal()" class="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800/80 transition">
            Login
          </button>
          <button onclick="window.authManager.openRegisterModal()" class="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition">
            Register
          </button>
          <button onclick="window.authManager.handleDemoLogin()" class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 transition">
            ⚡ Quick Demo Login
          </button>
        </div>
      `;
    }
  }

  async handleLogin(email, password) {
    try {
      const data = await LayoverAPI.login({ email, password });
      this.setSession(data.token, data.user);
      this.closeAuthModal();
      window.app.showNotification('Welcome back to LayoverIQ!', 'success');
    } catch (err) {
      window.app.showNotification(err.message, 'error');
    }
  }

  async handleRegister(name, email, password, homeCity) {
    try {
      const data = await LayoverAPI.register({ name, email, password, homeCity });
      this.setSession(data.token, data.user);
      this.closeAuthModal();
      window.app.showNotification('Account created successfully!', 'success');
    } catch (err) {
      window.app.showNotification(err.message, 'error');
    }
  }

  async handleDemoLogin() {
    try {
      const data = await LayoverAPI.demoLogin();
      this.setSession(data.token, data.user);
      window.app.showNotification('Logged in with Demo Traveler profile.', 'success');
    } catch (err) {
      window.app.showNotification('Demo login failed.', 'error');
    }
  }

  setSession(token, user) {
    this.currentUser = user;
    localStorage.setItem('layoveriq_token', token);
    localStorage.setItem('layoveriq_user', JSON.stringify(user));
    this.updateNavUI();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('layoveriq_token');
    localStorage.removeItem('layoveriq_user');
    this.updateNavUI();
    window.app.showNotification('Logged out successfully.', 'info');
  }

  openLoginModal() {
    const modal = document.getElementById('authModal');
    const modalBody = document.getElementById('authModalBody');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6">
        <h3 class="text-xl font-bold text-white mb-1">Login to LayoverIQ</h3>
        <p class="text-xs text-slate-400 mb-5">Access your saved flight layover itineraries and preferences.</p>
        
        <form id="loginForm" onsubmit="window.authManager.submitLogin(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input type="email" id="loginEmail" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="traveler@example.com" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input type="password" id="loginPassword" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm transition">
            Sign In
          </button>
        </form>

        <div class="mt-5 pt-4 border-t border-slate-800 text-center">
          <button onclick="window.authManager.handleDemoLogin(); window.authManager.closeAuthModal();" class="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs py-2 rounded-lg transition mb-3">
            ⚡ One-Click Instant Demo Login
          </button>
          <p class="text-xs text-slate-400">
            Don't have an account? <button onclick="window.authManager.openRegisterModal()" class="text-blue-400 hover:underline">Register now</button>
          </p>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  }

  openRegisterModal() {
    const modal = document.getElementById('authModal');
    const modalBody = document.getElementById('authModalBody');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6">
        <h3 class="text-xl font-bold text-white mb-1">Create LayoverIQ Account</h3>
        <p class="text-xs text-slate-400 mb-5">Plan safe city exploration without risking your flight.</p>
        
        <form id="registerForm" onsubmit="window.authManager.submitRegister(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input type="text" id="regName" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Alex Vance" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input type="email" id="regEmail" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="alex@travel.com" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input type="password" id="regPassword" required minlength="6" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Home City</label>
            <input type="text" id="regHomeCity" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Delhi" />
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm transition mt-2">
            Create Free Account
          </button>
        </form>

        <div class="mt-4 pt-3 border-t border-slate-800 text-center">
          <p class="text-xs text-slate-400">
            Already have an account? <button onclick="window.authManager.openLoginModal()" class="text-blue-400 hover:underline">Log in</button>
          </p>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
  }

  submitLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    this.handleLogin(email, password);
  }

  submitRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const homeCity = document.getElementById('regHomeCity').value;
    this.handleRegister(name, email, password, homeCity);
  }
}

window.AuthManager = AuthManager;
