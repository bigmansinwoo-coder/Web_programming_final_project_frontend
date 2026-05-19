// =====================================================
// What'sToday · index.js — Home Page
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  renderNav({ activePage: 'home', container: document.getElementById('navContainer') });
  renderFooter(document.getElementById('footerContainer'));

  const label = document.getElementById('todayLabel');
  if (label) {
    const today = new Date();
    label.textContent = today.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }) + ' · One issue. One conversation.';
  }

  loadToday();
  loadArchive();
});

// ── Mock data (remove when backend is ready) ──────────
const MOCK_TODAY = {
  id: 1,
  title: 'Fed Signals Pause in Rate Hikes Amid Cooling Inflation',
  summary: 'The Federal Reserve indicated it may hold interest rates steady as inflation shows signs of easing toward the 2% target. Chair Jerome Powell noted that recent data suggests policy tightening has been working, though the central bank remains data-dependent.',
  post_count: 12,
};
const MOCK_ARCHIVE = [
  { id: 4, title: 'Global Supply Chain Disruptions Ease in Q1', summary: 'Shipping delays and component shortages have significantly improved compared to last year.', date: '2025-05-14', post_count: 9 },
  { id: 5, title: 'Snap Election Called After No-Confidence Vote', summary: 'The prime minister called for early elections after losing a key parliamentary vote on budget reforms.', date: '2025-05-13', post_count: 14 },
  { id: 6, title: 'Box Office Hits $1B Milestone for Summer Season', summary: 'The summer movie season is off to a record start with three blockbusters crossing $300M domestically.', date: '2025-05-12', post_count: 6 },
  { id: 7, title: 'Tech Layoffs Continue as AI Reshapes Workforce', summary: 'Several major tech firms announced further headcount reductions as automation replaces repetitive roles.', date: '2025-05-11', post_count: 21 },
];

// ── Today's Issue ─────────────────────────────────────
async function loadToday() {
  const grid = document.getElementById('todayGrid');
  try {
    const data = await API.getIssuesToday();
    const issue = Array.isArray(data) ? data[0] : (data.issue || data);
    if (!issue) {
      grid.innerHTML = '<div class="emptyState">No issue for today yet.</div>';
      return;
    }
    renderTodayFeatured(grid, issue);
  } catch {
    renderTodayFeatured(grid, MOCK_TODAY);
  }
}

function renderTodayFeatured(container, issue) {
  container.innerHTML = `
    <div class="todayFeatured" onclick="window.location='board.html?id=${issue.id}'">
      <div class="todayFeaturedLabel">Today's Issue</div>
      <h2 class="todayFeaturedTitle">${escapeHTML(issue.title)}</h2>
      <p class="todayFeaturedSummary">${escapeHTML(issue.summary || issue.description || '')}</p>
      <div class="todayFeaturedMeta">${issue.post_count ?? 0} posts · Join the discussion →</div>
    </div>
  `;
}

// ── Archive ───────────────────────────────────────────
async function loadArchive() {
  const list = document.getElementById('archiveList');
  try {
    const data = await API.getIssues();
    const allIssues = Array.isArray(data) ? data : (data.issues || []);

    const todayStr = new Date().toISOString().slice(0, 10);
    const past = allIssues.filter(issue => {
      const d = issue.date || issue.created_at || '';
      return d.slice(0, 10) !== todayStr;
    });

    if (!past.length) {
      list.innerHTML = '<div class="emptyState">No past issues yet.</div>';
      return;
    }
    renderArchiveRows(list, past);
  } catch {
    renderArchiveRows(list, MOCK_ARCHIVE);
  }
}

function renderArchiveRows(list, issues) {
  list.innerHTML = issues.map(issue => `
    <div class="archiveRow" onclick="window.location='board.html?id=${issue.id}'">
      <div class="archiveRowLeft">
        <span class="archiveRowDate">${formatDateShort(issue.date || issue.created_at)}</span>
        <div class="archiveRowTitle">${escapeHTML(issue.title)}</div>
        <div class="archiveRowSummary">${escapeHTML((issue.summary || issue.description || '').slice(0, 100))}${(issue.summary || issue.description || '').length > 100 ? '…' : ''}</div>
      </div>
      <div class="archiveRowCount">${issue.post_count ?? 0} posts →</div>
    </div>
  `).join('');
}
