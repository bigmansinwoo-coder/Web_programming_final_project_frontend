// =====================================================
// What'sToday · shared.js — Shared Utilities
// =====================================================

// ─── Auth State (localStorage) ───────────────────────
const Auth = {
  getUser   : () => {
    try { return JSON.parse(localStorage.getItem('wt_user')); } catch { return null; }
  },
  setUser   : (user) => localStorage.setItem('wt_user', JSON.stringify(user)),
  logout    : () => localStorage.removeItem('wt_user'),
  isLoggedIn: () => !!Auth.getUser(),
};

// ─── Theme (dark / light) ─────────────────────────────
const Theme = {
  get   : () => localStorage.getItem('wt_theme') || 'light',
  set   : (mode) => {
    localStorage.setItem('wt_theme', mode);
    document.body.classList.toggle('dark', mode === 'dark');
  },
  toggle: () => Theme.set(Theme.get() === 'dark' ? 'light' : 'dark'),
  init  : () => Theme.set(Theme.get()),
};

// ─── Toast ───────────────────────────────────────────
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

// ─── Escape HTML ─────────────────────────────────────
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Date Formatting ─────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Nav ─────────────────────────────────────────────
function renderNav({ activePage = 'home', container }) {
  if (!container) return;
  const user = Auth.getUser();

  const authHTML = user
    ? `<div class="avatar sm">${escapeHTML((user.username || user.email)[0].toUpperCase())}</div>
       <span style="font-size:14px;font-weight:500">${escapeHTML(user.username || user.email)}</span>
       <button class="ghostBtn" onclick="handleLogout()">Log out</button>`
    : `<a href="auth.html" class="ghostBtn">Log in</a>
       <a href="auth.html?mode=register" class="primaryBtn">Sign up</a>`;

  container.innerHTML = `
    <header class="siteNav">
      <a href="index.html" class="siteLogo">What'sToday</a>
      <nav class="navMenu">
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
      </nav>
      <span class="navSpacer"></span>
      <div class="navRight">
        <button class="iconBtn" id="themeBtn" onclick="Theme.toggle(); updateThemeBtn(this)" title="Toggle theme">☀</button>
        ${authHTML}
      </div>
    </header>
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

async function handleLogout() {
  try { await API.logout(); } catch {}
  Auth.logout();
  showToast('Logged out');
  setTimeout(() => window.location.href = 'index.html', 800);
}

// ─── Footer ──────────────────────────────────────────
function renderFooter(container) {
  if (!container) return;
  container.innerHTML = `
    <footer class="siteFooter">
      <div class="footInner">
        <span>© 2025 What'sToday</span>
      </div>
    </footer>
  `;
}

// ─── Post Row HTML ────────────────────────────────────
// Renders a clickable post summary row for board / issue pages.
// post: { id, title, body, author_username, created_at, comment_count }
// isOwn: true if the logged-in user authored this post
function postRowHTML({ post, isOwn = false }) {
  const snippet = post.body ? escapeHTML(post.body).slice(0, 120) + (post.body.length > 120 ? '…' : '') : '';
  const initial = post.author_username ? post.author_username[0].toUpperCase() : '?';
  const score = post.vote_score ?? post.score ?? 0;

  return `
    <div class="postRow">
      <div class="voteCol">
        <button class="voteBtn up" onclick="handleVote(event, this, 'up', ${post.id})">▲</button>
        <span class="voteScore">${score}</span>
        <button class="voteBtn down" onclick="handleVote(event, this, 'down', ${post.id})">▼</button>
      </div>
      <div onclick="window.location='post.html?id=${post.id}'" style="cursor:pointer;min-width:0">
        <div class="postMeta">
          <div class="avatar sm">${escapeHTML(initial)}</div>
          <strong>${escapeHTML(post.author_username || 'Unknown')}</strong>
          <span>·</span>
          <span>${formatDateShort(post.created_at)}</span>
          ${isOwn ? '<span class="tag" style="font-size:11px;padding:1px 6px">You</span>' : ''}
        </div>
        <div class="postTitle">${escapeHTML(post.title)}</div>
        ${snippet ? `<div class="postSnippet">${snippet}</div>` : ''}
        <div class="postStats">
          <span>💬 ${post.comment_count ?? 0} comments</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;color:var(--text-lighter);font-size:16px;padding-right:4px">→</div>
    </div>
  `;
}

// ─── Vote handler ─────────────────────────────────────
async function handleVote(e, btn, dir, postId) {
  e.stopPropagation();
  if (!Auth.isLoggedIn()) {
    window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }
  const col = btn.closest('.voteCol');
  const upBtn   = col.querySelector('.voteBtn.up');
  const downBtn = col.querySelector('.voteBtn.down');
  const scoreEl = col.querySelector('.voteScore');

  const alreadyActive = btn.classList.contains('active');

  // Toggle off if same button clicked again
  upBtn.classList.remove('active');
  downBtn.classList.remove('active');

  try {
    if (alreadyActive) {
      await API.unvotePost(postId);
      scoreEl.textContent = parseInt(scoreEl.textContent) + (dir === 'up' ? -1 : 1);
    } else {
      const wasOpposite = (dir === 'up' ? downBtn : upBtn).classList.contains('active');
      await API.votePost(postId, dir);
      btn.classList.add('active');
      const delta = dir === 'up' ? (wasOpposite ? 2 : 1) : (wasOpposite ? -2 : -1);
      scoreEl.textContent = parseInt(scoreEl.textContent) + delta;
    }
  } catch {
    // If not logged in on server side, revert UI
    showToast('Please log in to vote');
  }
}

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});
