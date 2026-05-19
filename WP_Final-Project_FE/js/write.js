// =====================================================
// What'sToday · write.js — Write / Edit a Post
// =====================================================

let editPostId  = null;
let issueId     = null;

document.addEventListener('DOMContentLoaded', () => {
  renderNav({ activePage: '', container: document.getElementById('navContainer') });
  renderFooter(document.getElementById('footerContainer'));

  // Require login — TODO: 백엔드 연결 후 주석 해제할 것!
  // if (!Auth.isLoggedIn()) {
  //   window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
  //   return;
  // }

  const params = new URLSearchParams(window.location.search);
  issueId    = params.get('issueId');
  editPostId = params.get('postId');

  // Set back link
  const backLink   = document.getElementById('backLink');
  const cancelLink = document.getElementById('cancelLink');
  const dest = issueId ? `board.html?id=${issueId}` : (editPostId ? `post.html?id=${editPostId}` : 'index.html');
  if (backLink)   backLink.href   = dest;
  if (cancelLink) cancelLink.href = dest;

  // Edit mode — pre-fill form
  if (editPostId) {
    document.getElementById('writeHeading').textContent = 'Edit Post';
    document.getElementById('submitBtn').textContent    = 'Save Changes';
    loadPostForEdit(editPostId);
  }

  // Form submit
  document.getElementById('writeForm').addEventListener('submit', handleSubmit);
});

// ── Pre-fill for edit ─────────────────────────────────
async function loadPostForEdit(postId) {
  try {
    const post = await API.getPost(postId);
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postBody').value  = post.body  || '';
    // Save issueId for redirect after save
    if (post.issue_id) issueId = post.issue_id;
  } catch (err) {
    showError('Failed to load post: ' + err.message);
  }
}

// ── Submit handler ────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  clearError();

  const title  = document.getElementById('postTitle').value.trim();
  const body   = document.getElementById('postBody').value.trim();
  const btn    = document.getElementById('submitBtn');

  if (!title || !body) { showError('Title and body are required.'); return; }
  if (!issueId && !editPostId) { showError('No issue selected.'); return; }

  btn.disabled = true;
  try {
    if (editPostId) {
      await API.updatePost(editPostId, title, body);
      showToast('Post updated!');
      setTimeout(() => window.location.href = `post.html?id=${editPostId}`, 800);
    } else {
      const newPost = await API.createPost(issueId, title, body);
      showToast('Post published!');
      setTimeout(() => window.location.href = `post.html?id=${newPost.id || newPost.post?.id}`, 800);
    }
  } catch (err) {
    showError(err.message || 'Something went wrong.');
    btn.disabled = false;
  }
}

function showError(msg) {
  const el = document.getElementById('writeError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearError() {
  const el = document.getElementById('writeError');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
