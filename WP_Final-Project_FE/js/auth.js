// =====================================================
// What'sToday · auth.js — Login / Register
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  renderNav({ activePage: '', container: document.getElementById('navContainer') });
  renderFooter(document.getElementById('footerContainer'));

  // Already logged in → redirect home
  if (Auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // Check ?mode=register in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'register') switchTab('register');

  // Form listeners
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// ── Tab switch ────────────────────────────────────────
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none'  : 'block';
  document.getElementById('tabLogin').classList.toggle('active',    isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
}

// ── Login ─────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  clearError('loginError');

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');

  btn.disabled = true;
  try {
    const data = await API.login(email, password);
    localStorage.setItem('wt_token', data.token);
    Auth.setUser(data.user);
    showToast('Welcome back!');

    const redirect = new URLSearchParams(window.location.search).get('redirect');
    setTimeout(() => window.location.href = redirect || 'index.html', 600);
  } catch (err) {
    showError('loginError', err.message || 'Login failed.');
    btn.disabled = false;
  }
}

// ── Register ──────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  clearError('registerError');

  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const btn      = document.getElementById('registerBtn');

  if (password.length < 8) {
    showError('registerError', 'Password must be at least 8 characters.');
    return;
  }

  btn.disabled = true;
  try {
    const data = await API.register(username, email, password);
    Auth.setUser(data.user || data);
    showToast('Account created! Welcome 🎉');
    setTimeout(() => window.location.href = 'index.html', 600);
  } catch (err) {
    showError('registerError', err.message || 'Registration failed.');
    btn.disabled = false;
  }
}

// ── Helpers ───────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
