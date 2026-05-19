# What's Today — Frontend

[![CI](https://github.com/[your-org]/WP_Final-Project_FE/actions/workflows/ci.yml/badge.svg)](https://github.com/[your-org]/WP_Final-Project_FE/actions)

> AI가 매일 선정한 시사 이슈(Economy / Politics / Entertainment)를 중심으로 사용자들이 의견을 올리고 토론하는 웹 기반 시사 토론 포럼 — **프론트엔드 리포지토리**

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [주요 기능](#2-주요-기능)
3. [기술 스택](#3-기술-스택)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [화면 구성](#5-화면-구성)
6. [시작하기](#6-시작하기)
7. [환경 변수](#7-환경-변수)
8. [배포](#8-배포)
9. [AI 도구 사용 고지](#9-ai-도구-사용-고지)

---

## 1. 프로젝트 소개

**What's Today**는 매일 AI(GPT-4o-mini)가 Economy / Politics / Entertainment 3개 카테고리에서 핵심 시사 이슈를 자동 선정하고, 사용자들이 그 이슈에 대해 게시물·댓글·추천/비추천으로 토론할 수 있는 포럼 서비스입니다.

- 백엔드 리포지토리: [WP_Final-Projcet_BE](https://github.com/[your-org]/WP_Final-Projcet_BE)
- 배포 URL: [https://[your-fe].onrender.com](https://[your-fe].onrender.com)

---

## 2. 주요 기능

| 기능 | 설명 |
|------|------|
| 오늘의 이슈 홈 | AI가 선정한 카테고리별 이슈 3개 카드를 홈에서 한눈에 확인 |
| 카테고리 게시판 | Top / Latest 정렬로 게시물 목록 탐색, 베스트 게시물 자동 고정 |
| 게시물 작성/수정/삭제 | 마크다운 에디터 지원, 댓글 없을 때만 수정 가능 |
| 추천 / 비추천 | 게시물에 ▲/▼ 투표, 재클릭 시 취소, 반대 투표 시 자동 전환 |
| 댓글 & 1-depth 대댓글 | 게시물에 댓글 작성 및 댓글에 대한 답글(1단계) 작성 |
| 아카이브 | 날짜·카테고리별로 과거 이슈와 토론 탐색 |
| 공지사항 | 관리자가 작성한 공지를 홈 상단과 목록에서 확인 |
| 관리자 패널 | AI cron 실행 상태 모니터링, 부적절한 이슈 삭제, 공지 관리 |
| 다크 모드 | CSS Variables 기반 라이트/다크 전환, 설정 localStorage 저장 |
| 반응형 레이아웃 | 모바일(375px) ~ 데스크탑(1280px) 대응 |

---

## 3. 기술 스택

| 영역 | 기술 |
|------|------|
| UI 프레임워크 | React 18 |
| 빌드 도구 | Vite 5 |
| HTTP 클라이언트 | Axios (`withCredentials: true`) |
| 마크다운 렌더링 | `marked` + `DOMPurify` (XSS sanitize) |
| 스타일링 | CSS Modules + CSS Variables (다크모드) |
| 린트 / 포맷 | ESLint + Prettier |
| 배포 | Render Static Site (Free tier) |

---

## 4. 프로젝트 구조

```
WP_Final-Project_FE/
├── src/
│   ├── pages/                  # 라우트 단위 페이지
│   │   ├── HomePage.jsx            # S-01 홈 (오늘의 이슈 + 공지)
│   │   ├── LoginPage.jsx           # S-02 로그인
│   │   ├── RegisterPage.jsx        # S-03 회원가입
│   │   ├── BoardPage.jsx           # S-04 카테고리 게시판
│   │   ├── PostDetailPage.jsx      # S-05 게시물 상세 + 댓글
│   │   ├── WritePage.jsx           # S-06 게시물 작성/수정
│   │   ├── ArchivePage.jsx         # S-07 아카이브
│   │   ├── NoticePage.jsx          # S-08 공지사항
│   │   └── admin/
│   │       ├── AdminIssuesPage.jsx  # S-09a 이슈 관리 & cron 모니터링
│   │       └── AdminNoticesPage.jsx # S-09b 공지사항 관리
│   ├── components/
│   │   ├── common/             # Header, Footer, Button, Modal, MarkdownRenderer
│   │   ├── post/               # PostCard, VoteButton, CommentTree, CommentItem
│   │   ├── issue/              # IssueCard, IssueBanner
│   │   ├── notice/             # NoticeCard
│   │   └── admin/
│   ├── hooks/                  # useAuth, useFetch 등 커스텀 훅
│   ├── api/                    # Axios 인스턴스 + 엔드포인트 함수
│   │   ├── client.js           # baseURL + withCredentials 설정
│   │   ├── authApi.js
│   │   ├── postApi.js
│   │   └── ...
│   ├── context/                # AuthContext, ThemeContext
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css       # 다크모드 CSS 변수
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── .env.example
└── package.json
```

---

## 5. 화면 구성

| 화면 ID | 경로 | 설명 |
|---------|------|------|
| S-01 | `/` | 홈 — 오늘의 이슈 카드 3개 + 최신 공지 |
| S-02 | `/login` | 로그인 |
| S-03 | `/register` | 회원가입 |
| S-04 | `/board/:category` | 카테고리 게시판 (Top / Latest) |
| S-05 | `/posts/:id` | 게시물 상세 + 댓글 |
| S-06 | `/write`, `/posts/:id/edit` | 게시물 작성 / 수정 |
| S-07 | `/archive` | 아카이브 (날짜·카테고리 필터) |
| S-08 | `/notices` | 공지사항 목록 및 상세 |
| S-09a | `/admin/issues` | 관리자 — 이슈 관리 & cron 상태 |
| S-09b | `/admin/notices` | 관리자 — 공지사항 관리 |

---

## 6. 시작하기

### 사전 요구사항

- Node.js 20 LTS 이상
- 백엔드 서버 실행 중 ([WP_Final-Projcet_BE](https://github.com/[your-org]/WP_Final-Projcet_BE) 참조)

### 설치 및 실행

```bash
# 1. 리포지토리 클론
git clone https://github.com/[your-org]/WP_Final-Project_FE.git
cd WP_Final-Project_FE

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 열어 VITE_API_BASE_URL 설정

# 4. 개발 서버 시작 (기본 포트: 5173)
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드

```bash
npm run build
# dist/ 폴더에 정적 파일 생성
```

### 린트

```bash
npm run lint
```

---

## 7. 환경 변수

`.env.example`을 복사하여 `.env` 파일을 생성한 뒤 값을 채웁니다.  
`.env` 파일은 절대 커밋하지 마세요.

```bash
# Vite는 VITE_ prefix가 붙은 변수만 클라이언트에 노출합니다
VITE_API_BASE_URL=http://localhost:3000/api
```

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL | `http://localhost:3000/api` |

> 프로덕션 배포 시에는 Render 대시보드의 Environment Variables에 직접 입력합니다.

---

## 8. 배포

본 프로젝트는 **Render Static Site (Free tier)** 를 사용하여 배포합니다.

| 항목 | 값 |
|------|----|
| 빌드 명령 | `npm run build` |
| 배포 디렉터리 | `dist` |
| 환경 변수 | Render 대시보드에서 설정 |

> Free tier 특성상 일정 시간 비활성 후 cold start가 발생할 수 있습니다.

---

## 9. AI 도구 사용 고지

> 본 과목 규정에 따라 AI 도구 사용 여부를 명시합니다.

본 프로젝트의 개발 과정에서 다음 AI 도구를 활용하였습니다.

- **ChatGPT / Claude**: 컴포넌트 구조 설계 아이디어 도출, 코드 디버깅 보조, 문서 초안 작성
- **OpenAI GPT-4o-mini**: 서비스 핵심 기능인 "오늘의 이슈 자동 선정" (백엔드 AI cron)에 사용

모든 최종 코드는 팀원이 직접 검토·수정하였으며, AI가 생성한 코드를 무비판적으로 사용하지 않았습니다.

---

## 팀

**What's Today Team** — Seoultech University Web Programming Final Project (2026)
