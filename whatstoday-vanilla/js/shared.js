// =====================================================
// What'sToday · Shared Utilities
// =====================================================

// ─── Auth State (localStorage) ───
const Auth = {
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('whatstoday_user')); } catch { return null; }
  },
  setUser: (user) => localStorage.setItem('whatstoday_user', JSON.stringify(user)),
  logout: () => localStorage.removeItem('whatstoday_user'),
  isLoggedIn: () => !!Auth.getUser(),
};

// ─── Theme ───
const Theme = {
  get: () => localStorage.getItem('whatstoday_theme') || 'light',
  set: (mode) => {
    localStorage.setItem('whatstoday_theme', mode);
    document.body.classList.toggle('dark', mode === 'dark');
  },
  toggle: () => Theme.set(Theme.get() === 'dark' ? 'light' : 'dark'),
  init: () => Theme.set(Theme.get()),
};

// ─── Toast ───
function showToast(msg, duration = 2500) {
  let el = document.getElementById('globalToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'globalToast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
}

// ─── Site Nav ───
function renderNav({ activePage = 'home', container }) {
  const user = Auth.getUser();
  const pages = [
    { key: 'home',          label: 'Today',         href: 'index.html' },
    { key: 'board',         label: 'Economy',        href: 'board.html' },
    { key: 'board-pol',     label: 'Politics',       href: 'board-politics.html' },
    { key: 'board-ent',     label: 'Entertainment',  href: 'board-entertainment.html' },
    { key: 'archive',       label: 'Archive',        href: 'archive.html' },
  ];

  const navLinks = pages.map(p => `
    <a href="${p.href}" class="${activePage === p.key ? 'active' : ''}">${p.label}</a>
  `).join('');

  const mobileLinks = pages.map(p => `
    <a href="${p.href}" class="${activePage === p.key ? 'active' : ''}">${p.label}</a>
  `).join('');

  const authHTML = user
    ? `<button class="iconBtn" title="Notifications">🔔</button>
       <div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="window.location='profile.html'">
         <div class="avatar sm">${user.username[0].toUpperCase()}</div>
         <span style="font-size:14px;font-weight:500">${user.username}</span>
       </div>
       <button class="ghostBtn" onclick="handleLogout()">Log out</button>`
    : `<a href="auth.html" class="ghostBtn">Log in</a>
       <a href="auth.html?mode=register" class="primaryBtn" style="padding:9px 18px;font-size:15px;font-weight:600;border-radius:8px;">Sign up</a>`;

  container.innerHTML = `
    <header class="siteNav">
      <a href="index.html" class="siteLogo">What'sToday</a>
      <nav class="navMenu">${navLinks}</nav>
      <span class="navSpacer"></span>
      <div class="navRight">
        <button class="iconBtn" onclick="handleSearch()" title="Search">🔍</button>
        <button class="iconBtn" onclick="Theme.toggle(); updateThemeBtn(this)" title="Toggle theme" id="themeBtn">☀</button>
        ${authHTML}
        <button class="mobileMenuBtn" onclick="toggleMobileNav()" aria-label="Menu">☰</button>
      </div>
    </header>
    <nav class="mobileNav" id="mobileNav">
      ${mobileLinks}
      ${user ? `<a onclick="handleLogout()">Log out</a>` : `<a href="auth.html">Log in</a><a href="auth.html?mode=register">Sign up</a>`}
    </nav>
  `;

  updateThemeBtn(document.getElementById('themeBtn'));
}

function updateThemeBtn(btn) {
  if (!btn) return;
  btn.textContent = Theme.get() === 'dark' ? '🌙' : '☀';
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

function handleLogout() {
  Auth.logout();
  showToast('Logged out');
  setTimeout(() => window.location.href = 'index.html', 800);
}

function handleSearch() {
  const q = prompt('Search What'sToday:');
  if (q && q.trim()) {
    showToast(`Searching for "${q}" — (search page coming soon)`);
  }
}

// ─── Site Footer ───
function renderFooter(container) {
  container.innerHTML = `
    <footer class="siteFooter">
      <div class="footInner">
        <span>© 2026 What'sToday · A daily current-affairs discussion forum</span>
        <div class="footLinks">
          <a href="#">About</a>
          <a href="#">Guidelines</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="api-docs.html">API Docs</a>
        </div>
      </div>
    </footer>
  `;
}

// ─── Post Row HTML ───
function postRowHTML({ post, pinned = false, isOwn = false }) {
  return `
    <div class="postRow ${pinned ? 'pinned' : ''}" onclick="window.location='post.html?id=${post.id || 1}'">
      <div class="voteCol">
        <button class="voteBtn" onclick="event.stopPropagation(); handleVote(this, 'up', ${post.id || 1})">▲</button>
        <span class="voteScore">${post.score}</span>
        <button class="voteBtn" onclick="event.stopPropagation(); handleVote(this, 'down', ${post.id || 1})">▼</button>
      </div>
      <div>
        <div class="postMeta">
          ${pinned ? '<span class="tag" style="background:#FFF3BF;color:#845300">📌 Today\'s Best</span>' : ''}
          <div class="avatar sm">${post.author[0].toUpperCase()}</div>
          <strong>${post.author}</strong>
          <span>·</span>
          <span>${post.time}</span>
          ${isOwn ? '<span class="tag" style="font-size:11px;padding:1px 6px">You</span>' : ''}
        </div>
        <div class="postTitle">${post.title}</div>
        <div class="postSnippet">${post.snippet}</div>
        <div class="postStats">
          <span>💬 ${post.comments} comments</span>
          <span>👁 ${post.views}</span>
          ${isOwn ? `<button onclick="event.stopPropagation(); confirmDelete(${post.id || 1})"
            style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:13px">Delete</button>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;color:var(--text-lighter);font-size:18px;padding-right:8px">→</div>
    </div>
  `;
}

// ─── Vote handler ───
function handleVote(btn, dir, postId) {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }
  const row = btn.closest('.voteCol') || btn.closest('.postRow');
  const upBtn   = row.querySelector('[data-dir="up"]')   || row.querySelectorAll('.voteBtn')[0];
  const downBtn = row.querySelector('[data-dir="down"]') || row.querySelectorAll('.voteBtn')[1];
  const scoreEl = row.querySelector('.voteScore');

  const wasActive = btn.classList.contains(dir === 'up' ? 'active-up' : 'active-down');
  upBtn.classList.remove('active-up');
  downBtn.classList.remove('active-down');

  if (!wasActive) {
    btn.classList.add(dir === 'up' ? 'active-up' : 'active-down');
  }
}

// ─── Delete confirm ───
function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
    showToast('Post deleted');
    // In real app: fetch DELETE /api/posts/:id
  }
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});
