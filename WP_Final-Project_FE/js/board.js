// =====================================================
// What'sToday · board.js — Issue Detail + Post List
// =====================================================

let currentIssueId = null;

// ── Mock data (remove when backend is ready) ──────────
const MOCK_ISSUE = {
  id: 1,
  title: 'Fed Signals Pause in Rate Hikes Amid Cooling Inflation',
  description: 'The Federal Reserve indicated it may hold interest rates steady as inflation shows signs of easing toward the 2% target. Chair Jerome Powell noted that recent data suggests the policy tightening has been working, though the central bank remains data-dependent.',
  date: '2025-05-20',
  posts: [
    { id: 1, title: 'Why the Fed pause is good news for housing', body: 'Lower rate expectations have already caused mortgage rates to dip below 7% for the first time this year, potentially unlocking pent-up demand in the housing market.', author_username: 'jiyeon_k', created_at: '2025-05-20T09:15:00Z', comment_count: 4, vote_score: 14 },
    { id: 2, title: 'Don\'t celebrate yet — inflation could rebound', body: 'Core PCE is still running above 2.5%, and services inflation has been sticky. The Fed pausing doesn\'t mean cuts are coming anytime soon.', author_username: 'marktwain92', created_at: '2025-05-20T11:30:00Z', comment_count: 7, vote_score: 8 },
    { id: 3, title: 'What this means for emerging markets', body: 'A pause in US rate hikes typically leads to capital returning to EM economies, relieving pressure on their currencies and bond markets.', author_username: 'byungchan', created_at: '2025-05-20T14:00:00Z', comment_count: 2, vote_score: 3 },
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  renderNav({ activePage: '', container: document.getElementById('navContainer') });
  renderFooter(document.getElementById('footerContainer'));

  const params = new URLSearchParams(window.location.search);
  currentIssueId = params.get('id');

  if (!currentIssueId) {
    document.getElementById('issueDetail').innerHTML =
      '<div class="errorState">No issue specified.</div>';
    return;
  }

  loadIssue(currentIssueId);
  loadPosts(currentIssueId);
});

// ── Issue Detail ──────────────────────────────────────
async function loadIssue(id) {
  const section = document.getElementById('issueDetail');
  try {
    const issue = await API.getIssue(id);

    renderIssueHeader(section, issue);
    const writeLink = document.getElementById('writeLink');
    if (writeLink) writeLink.href = `write.html?issueId=${id}`;
  } catch {
    renderIssueHeader(section, MOCK_ISSUE);
    const writeLink = document.getElementById('writeLink');
    if (writeLink) writeLink.href = `write.html?issueId=${MOCK_ISSUE.id}`;
  }
}

function renderIssueHeader(section, issue) {
  section.innerHTML = `
    <div class="issueHeader">
      <span class="issueDate">${formatDate(issue.date || issue.created_at)}</span>
      <h1 class="issueTitle">${escapeHTML(issue.title)}</h1>
      <p class="issueDescription">${escapeHTML(issue.description || issue.summary || '')}</p>
    </div>
  `;
}

// ── Post List ─────────────────────────────────────────
async function loadPosts(issueId) {
  const listEl = document.getElementById('postList');
  const countEl = document.getElementById('postCount');
  const user = Auth.getUser();

  try {
    const issue = await API.getIssue(issueId);
    const posts = Array.isArray(issue.posts) ? issue.posts : [];

    renderPostList(listEl, countEl, posts, user);
  } catch {
    renderPostList(listEl, countEl, MOCK_ISSUE.posts, null);
  }
}

function renderPostList(listEl, countEl, posts, user) {
  if (countEl) countEl.textContent = posts.length ? `${posts.length} posts` : '';
  if (!posts.length) {
    listEl.innerHTML = '<div class="emptyState">No posts yet. Be the first to write one!</div>';
    return;
  }
  listEl.innerHTML = posts.map(post => {
    const isOwn = user && (user.id === post.author_id || user.username === post.author_username);
    return postRowHTML({ post, isOwn });
  }).join('');
}
