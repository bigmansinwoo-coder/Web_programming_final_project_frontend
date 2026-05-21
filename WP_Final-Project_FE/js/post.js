// =====================================================
// What'sToday · post.js — Post Detail + Comments
// =====================================================

let currentPostId  = null;
let currentIssueId = null;

// ── Mock data (remove when backend is ready) ──────────
const MOCK_POST = {
  id: 1,
  issue_id: 1,
  vote_score: 14,
  title: 'Why the Fed pause is good news for housing',
  body: 'Lower rate expectations have already caused mortgage rates to dip below 7% for the first time this year, potentially unlocking pent-up demand in the housing market.\n\nFor the past two years, high borrowing costs have kept many prospective buyers on the sidelines. A pause — or eventual cut — could bring millions of sidelined buyers back into the market.\n\nThat said, supply remains constrained, so any demand surge could just push prices higher rather than increase transaction volume.',
  author_username: 'jiyeon_k',
  author_id: 42,
  created_at: '2025-05-20T09:15:00Z',
  comments: [
    { id: 1, text: 'Great point about supply constraints. The inventory problem won\'t be fixed by lower rates alone.', author_username: 'marktwain92', author_id: 7, created_at: '2025-05-20T10:05:00Z' },
    { id: 2, text: '7% is still high historically. We need to get back to 5% range for real demand to return.', author_username: 'sinwoo_dev', author_id: 15, created_at: '2025-05-20T12:40:00Z' },
    { id: 3, text: 'Agreed, but the psychological effect of a downward trend matters a lot too.', author_username: 'byungchan', author_id: 1, created_at: '2025-05-20T14:20:00Z' },
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  renderNav({ activePage: '', container: document.getElementById('navContainer') });
  renderFooter(document.getElementById('footerContainer'));

  const params = new URLSearchParams(window.location.search);
  currentPostId  = params.get('id');
  currentIssueId = params.get('issueId');

  if (!currentPostId) {
    document.getElementById('postDetail').innerHTML =
      '<div class="errorState">No post specified.</div>';
    return;
  }

  loadPost(currentPostId);
});

// ── Post Detail ───────────────────────────────────────
async function loadPost(id) {
  const detailEl = document.getElementById('postDetail');
  const actionsEl = document.getElementById('postActions');
  const user = Auth.getUser();

  try {
    const post = await API.getPost(id);

    // Back link → issue board
    const issueId = currentIssueId || post.issue_id;
    const backLink = document.getElementById('backLink');
    if (backLink && issueId) backLink.href = `board.html?id=${issueId}`;

    const score = post.vote_score ?? post.score ?? 0;
    const userVote = post.userVote ?? null;  // ← 추가
    // Render post body
    detailEl.innerHTML = `
    <div class="postDetailMeta">
      <div class="avatar sm">${escapeHTML((post.author_username || '?')[0].toUpperCase())}</div>
      <strong>${escapeHTML(post.author_username || 'Unknown')}</strong>
      <span>·</span>
      <span>${formatDate(post.created_at)}</span>
    </div>
    <h1 class="postDetailTitle">${escapeHTML(post.title)}</h1>
    <div class="postDetailBody">${escapeHTML(post.body)}</div>
    <div class="postDetailVote">
      <button class="voteBtn up ${userVote === 'up' ? 'active' : ''}" onclick="handleVote(event, this, 'up', ${post.id})">▲</button>
      <span class="voteScore">${score}</span>
      <button class="voteBtn down ${userVote === 'down' ? 'active' : ''}" onclick="handleVote(event, this, 'down', ${post.id})">▼</button>
    </div>
  `;

    // Show edit/delete only to the author
    const isOwn = user && (user.id === post.author_id || user.username === post.author_username);
    if (isOwn && actionsEl) {
      actionsEl.style.display = 'flex';
      document.getElementById('editLink').href = `write.html?postId=${id}&issueId=${issueId}`;
      document.getElementById('deleteBtn').addEventListener('click', () => deletePost(id, issueId));
    }

    // Load comments
    loadComments(post.comments || [], id);

  } catch {
    const post = MOCK_POST;
    const backLink = document.getElementById('backLink');
    if (backLink) backLink.href = `board.html?id=${post.issue_id}`;
    const score = post.vote_score ?? 0;
    detailEl.innerHTML = `
      <div class="postDetailMeta">
        <div class="avatar sm">${escapeHTML(post.author_username[0].toUpperCase())}</div>
        <strong>${escapeHTML(post.author_username)}</strong>
        <span>·</span>
        <span>${formatDate(post.created_at)}</span>
      </div>
      <h1 class="postDetailTitle">${escapeHTML(post.title)}</h1>
      <div class="postDetailBody">${escapeHTML(post.body)}</div>
      <div class="postDetailVote">
        <button class="voteBtn up" onclick="handleVote(event, this, 'up', ${post.id})">▲</button>
        <span class="voteScore">${score}</span>
        <button class="voteBtn down" onclick="handleVote(event, this, 'down', ${post.id})">▼</button>
      </div>
    `;
    loadComments(post.comments, post.id);
  }
}

// ── Comments ──────────────────────────────────────────
function loadComments(comments, postId) {
  const countEl  = document.getElementById('commentCount');
  const listEl   = document.getElementById('commentList');
  const formEl   = document.getElementById('commentForm');
  const loginMsg = document.getElementById('commentLoginMsg');
  const user     = Auth.getUser();

  if (countEl) countEl.textContent = comments.length ? `${comments.length}` : '';

  // Show form or login prompt
  if (user) {
    if (formEl)   formEl.style.display   = 'block';
    if (loginMsg) loginMsg.style.display = 'none';
  } else {
    if (formEl)   formEl.style.display   = 'none';
    if (loginMsg) loginMsg.style.display = 'block';
  }

  // Render comment list
  if (!comments.length) {
    listEl.innerHTML = '<div class="emptyState">No comments yet.</div>';
  } else {
    listEl.innerHTML = comments.map(c => {
      const isOwn = user && (user.id === c.author_id || user.username === c.author_username);
      return `
        <div class="commentItem">
          <div class="commentMeta">
            <div class="avatar sm">${escapeHTML((c.author_username || '?')[0].toUpperCase())}</div>
            <strong>${escapeHTML(c.author_username || 'Unknown')}</strong>
            <span>·</span>
            <span>${formatDateShort(c.created_at)}</span>
            ${isOwn ? `<button class="deleteCommentBtn" onclick="deleteComment(${c.id})">Delete</button>` : ''}
          </div>
          <div class="commentBody">${escapeHTML(c.text)}</div>
        </div>
      `;
    }).join('');
  }

  // Comment submit
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textEl = document.getElementById('commentText');
      const text = textEl.value.trim();
      if (!text) return;

      const btn = formEl.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await API.createComment(postId, text);
        textEl.value = '';
        showToast('Comment posted!');
        // Reload post to get updated comments
        loadPost(postId);
      } catch (err) {
        showToast('Failed to post comment: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }
}

// ── Delete Post ───────────────────────────────────────
async function deletePost(postId, issueId) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  try {
    await API.deletePost(postId);
    showToast('Post deleted');
    setTimeout(() => {
      window.location.href = issueId ? `board.html?id=${issueId}` : 'index.html';
    }, 800);
  } catch (err) {
    showToast('Failed to delete: ' + err.message);
  }
}

// ── Delete Comment ────────────────────────────────────
async function deleteComment(commentId) {
  if (!confirm('Delete this comment?')) return;
  try {
    await API.deleteComment(commentId);
    showToast('Comment deleted');
    loadPost(currentPostId);
  } catch (err) {
    showToast('Failed to delete comment: ' + err.message);
  }
}
