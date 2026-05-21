// =====================================================
// What'sToday · api.js — Central API Client
// =====================================================

const BASE = '/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('wt_token');

  const res = await fetch(BASE + path, {
    headers: { 
      'Content-Type': 'application/json' ,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

const API = {
  // ── Auth ──────────────────────────────────────────
  register : (username, email, password) =>
    apiFetch('/auth/register', { method: 'POST', body: { username, email, password } }),

  login    : (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  me       : () =>
    apiFetch('/auth/me'),

  // ── Issues ────────────────────────────────────────
  getIssuesToday : () =>
    apiFetch('/issues/today'),

  // category: optional string filter (e.g. 'politics', 'tech')
  getIssues      : (category) =>
    apiFetch('/issues' + (category ? `?category=${encodeURIComponent(category)}` : '')),

  getIssue       : (id) =>
    apiFetch(`/issues/${id}`),

  // ── Posts ─────────────────────────────────────────
  createPost : (issueId, title, body) =>
    apiFetch(`/issues/${issueId}/posts`, { method: 'POST', body: { title, body } }),

  getPost    : (id) =>
    apiFetch(`/posts/${id}`),

  updatePost : (id, title, body) =>
    apiFetch(`/posts/${id}`, { method: 'PUT', body: { title, body } }),

  deletePost : (id) =>
    apiFetch(`/posts/${id}`, { method: 'DELETE' }),

  // ── Votes ─────────────────────────────────────────
  votePost   : (id, type) =>
    apiFetch(`/posts/${id}/vote`, { method: 'POST', body: { type } }), // type: 'up' | 'down'

  unvotePost : (id) =>
    apiFetch(`/posts/${id}/vote`, { method: 'DELETE' }),

  // ── Comments ──────────────────────────────────────
  createComment : (postId, text) =>
    apiFetch(`/posts/${postId}/comments`, { method: 'POST', body: { text } }),

  deleteComment : (id) =>
    apiFetch(`/comments/${id}`, { method: 'DELETE' }),
};
