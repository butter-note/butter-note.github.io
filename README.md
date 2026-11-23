# butter-note.github.io

버터노트의 홈페이지이자 노션 아티클을 발행하는 기술 블로그입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

`main` 브랜치에 변경사항을 올리면 GitHub Actions가 정적 사이트를 빌드하고 Pages에 배포합니다. 노션 내용을 반영하기 위해 매시간(매시 10분)에도 자동으로 배포합니다.

GitHub는 공개 저장소에서 60일 동안 커밋이 없으면 예약 워크플로를 끄고, 꺼진 워크플로는 `main`에 올려도 실행되지 않습니다. 노션만 고치면 커밋이 생기지 않으므로 `.github/workflows/keepalive.yml`이 매달 1일에 점검합니다.

- 배포 워크플로가 비활동으로 꺼져 있으면 다시 켜고 바로 배포를 시작합니다. 직접 끈 경우는 그대로 둡니다.
- 마지막 커밋이 25일 이상 지났으면 빈 커밋(`Keep scheduled deploys active`)을 남겨 60일 기한이 차지 않게 합니다.
- 이 점검이 GitHub 사정으로 건너뛰어져 배포가 꺼졌다면 **Actions → Deploy to GitHub Pages → Enable workflow**를 누르면 됩니다.

## 방문자 분석 (Google Analytics·Microsoft Clarity)

`lib/site.ts`의 `analytics`에 ID를 넣고 배포하면 모든 페이지에 설치됩니다. 비워 두면 설치하지 않으며, 개인정보처리방침(`/privacy/`)의 수집 항목·국외 이전·쿠키 설명도 넣은 도구에 맞춰 자동으로 바뀝니다. ID 형식이 틀리면 빌드가 실패하므로 잘못된 태그가 배포되지 않습니다.

| 값 | 도구 | 어디서 확인하나 |
| --- | --- | --- |
| `googleAnalyticsId` | Google Analytics 4: 방문자 수, 페이지별 조회, 유입 경로 | GA 관리 → 데이터 스트림 → 웹 스트림의 측정 ID (`G-`로 시작) |
| `clarityProjectId` | Microsoft Clarity: 클릭·스크롤 히트맵, 화면 이용 기록 재생 | Clarity 프로젝트 Settings → Overview의 Project ID |

- 도구를 처음 넣거나 뺄 때는 `privacyEffectiveDate`도 그날 날짜로 바꿔 주세요.
- GA 관리 → 데이터 설정 → 데이터 보관에서 이벤트 데이터 보관 기간을 `analyticsRetention`(14개월)과 같게 맞춰 주세요. 기본값은 2개월입니다.
- Clarity 마스킹은 기본값(Balanced) 이상으로 유지하세요. 개인정보처리방침에 "입력창 내용과 숫자·이메일 주소는 가려진 상태로 수집"된다고 안내하고 있습니다. Clarity 설정에서 Google Analytics 연동을 켜면 GA에서 해당 방문의 Clarity 녹화로 바로 이동할 수 있습니다.

Google Tag Manager 컨테이너 `GTM-TV4D6VBX`도 모든 페이지에 설치되어 있지만, 2026년 11월 기준 게시된 버전에는 태그가 없습니다. GA와 Clarity는 위 코드로 설치하므로 GTM에 같은 태그를 또 추가하면 방문이 두 번 집계됩니다.

## 저작권 표기와 법적 안내 페이지

푸터에는 빌드 시점 연도의 저작권 표기와 **개인정보처리방침**(`/privacy/`), **이용약관·저작권 안내**(`/terms/`) 링크가 있습니다. 상호·이메일·시행일·보관 기간 같은 공통 값은 `lib/site.ts`에서 관리합니다. `representative`(대표), `businessNumber`(사업자등록번호), `address`(주소)를 채우면 푸터에 사업자 정보가 함께 표시되고, 비워 두면 표시하지 않습니다.

개인정보처리방침은 사이트가 실제로 사용하는 Google Tag Manager, 방문자 분석 도구(설정한 경우 Google Analytics·Microsoft Clarity), 이메일 문의, 외부 글꼴·영상 서비스(Google Fonts, jsDelivr, YouTube, Vimeo)를 기준으로 작성되어 있습니다. 분석 도구는 `lib/site.ts`의 ID에 따라 자동으로 반영되고, 그 밖의 외부 서비스를 추가·제거하면 `app/privacy/page.tsx`의 표와 `lib/site.ts`의 시행일을 함께 갱신해 주세요.

## 검색·AI 답변 최적화 (SEO·GEO)

검색엔진과 ChatGPT·Perplexity·Google AI 개요 같은 AI 답변 서비스가 사이트를 정확히 이해하고 출처와 함께 인용할 수 있도록, 빌드할 때 아래 항목을 자동으로 만듭니다. 노션 콘텐츠가 동기화되면 다음 배포에 함께 갱신됩니다.

| 경로·위치 | 내용 |
| --- | --- |
| `/robots.txt` | 모든 크롤러 허용. Googlebot, Bingbot, 네이버 Yeti, 다음 Daumoa, OAI-SearchBot·GPTBot, Claude-SearchBot·ClaudeBot, PerplexityBot, Google-Extended 등을 명시하고 사이트맵 위치를 안내 (`app/robots.ts`) |
| `/sitemap.xml` | 고정 페이지, 노션 블로그 글, 구축 사례의 주소와 수정일 (`app/sitemap.ts`) |
| `/feed.xml` | 노션 블로그 RSS. 네이버 서치어드바이저에 RSS로 제출할 수 있음 |
| `/llms.txt` | AI 도구용 사이트 안내([llms.txt](https://llmstxt.org) 형식): 소개, 서비스, 글·강의·템플릿·사례·FAQ 목록과 요약 |
| `/llms-full.txt` | 공개된 서비스·글·사례·FAQ 본문 전체를 노션 태그 없는 Markdown으로, 문서마다 원문 URL 포함 |
| 구조화 데이터(JSON-LD) | 전 페이지 Organization·WebSite, 글 BlogPosting, 사례 Article, 목록 CollectionPage, FAQPage, 강의 VideoObject, 템플릿 Product/CreativeWork, 서비스 Service, 상세 BreadcrumbList (`lib/structured-data.ts`) |
| 페이지 메타데이터 | 페이지마다 canonical 주소와 고유한 공유 제목·설명·이미지(글·사례는 본문 첫 이미지, 없으면 `og.png`), 게시·수정일, 긴 미리보기 허용 (`lib/seo.ts`) |

고정 페이지의 제목·설명은 `lib/site.ts`의 `pages`에서 한 번에 관리하며, 메타데이터·사이트맵·llms.txt가 같은 값을 씁니다. FAQ·강의·템플릿·서비스 항목에는 `#faq-…`, `#lesson-…`, `#template-…`, `#service-…` 앵커가 있어 AI 답변이 항목 단위로 출처를 연결할 수 있습니다.

노션에서 글을 쓸 때 AI 인용에 도움이 되는 습관:

- `요약` 속성에 글의 핵심 답을 1~2문장으로 씁니다. 비어 있거나 제목과 같으면 본문 첫 문단으로 설명을 자동 생성합니다.
- 제목은 독자가 실제로 묻는 질문이나 작업 이름으로, 본문 첫 문단에 바로 답을 씁니다. 단계는 번호 목록, 비교는 표로 정리합니다.
- 글의 수정일은 노션 페이지의 마지막 편집 시각을 사용하므로, 내용을 고치면 수정일이 함께 갱신됩니다.

검색엔진 등록:

1. Google Search Console과 네이버 서치어드바이저에서 사이트를 추가하고 'HTML 태그' 방식의 `content` 값을 `lib/site.ts`의 `verification.google`, `verification.naver`에 넣어 배포합니다.
2. 소유 확인 후 사이트맵(`https://butter-note.github.io/sitemap.xml`)을 제출하고, 네이버에는 RSS(`https://butter-note.github.io/feed.xml`)도 제출합니다.

AI 학습용 수집만 막고 싶다면 `app/robots.ts`에서 GPTBot, ClaudeBot, Google-Extended, Applebot-Extended를 `disallow`로 바꾸세요. 검색·답변용 크롤러(OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot)는 허용해야 AI 답변에 출처로 노출됩니다. 이용약관 제5조는 출처를 밝힌 검색·AI 인용을 허용하도록 되어 있습니다. Google은 FAQ 리치 결과를 일부 사이트에만 표시하지만, FAQPage 데이터는 AI 답변 서비스가 질문과 답을 정확히 읽는 데 도움이 됩니다.

## 콘텐츠 검색·필터

아티클, 무료 강의, 템플릿 목록에서 제목·설명·카테고리를 검색할 수 있습니다. 템플릿은 판매처 이름 검색과 판매처 필터도 지원합니다. 각 페이지 안에서 검색하며, 글 본문·영상 자막은 검색 대상이 아닙니다.

카테고리와 판매처 버튼은 배포에 포함된 공개 콘텐츠에서 자동 생성합니다. 새 분류는 노션 데이터가 다음 배포에 동기화될 때 함께 나타나므로 코드나 DB 속성을 추가할 필요가 없습니다. 템플릿 판매처 필터는 해당 판매처가 연결된 카드를 고르며, 카드 안에는 다른 판매처 링크도 그대로 남습니다.

검색어와 필터는 함께 적용되며, 여러 검색 단어는 모두 포함되어야 합니다. 영문 대소문자와 연속 공백을 정규화합니다. 결과 수, 검색어 지우기, 조건 초기화, 결과 없음 안내를 제공하며 기존 콘텐츠 순서를 유지합니다. 검색은 브라우저에서 처리하고 검색어를 저장하거나 별도 API에 전송하지 않습니다. 새로고침하면 조건이 초기화됩니다.

공통 UI의 상태·접근성·사용 규칙은 [검색 컴포넌트 문서](docs/catalog-browser.md)를 참고하세요.

아티클·무료 강의는 페이지당 6개, 템플릿은 9개씩 표시합니다. 이전·다음과 페이지 번호로 이동할 수 있고, 검색·필터를 변경하면 첫 페이지로 돌아갑니다. 검색은 현재 페이지뿐 아니라 전체 콘텐츠를 대상으로 합니다. 페이지가 하나뿐이거나 결과가 없으면 페이지 버튼을 숨깁니다. JavaScript가 꺼져 있으면 기존처럼 전체 목록을 표시합니다.

## 노션 콘텐츠 동기화

글과 템플릿은 각각 별도의 노션 데이터 소스를 사용합니다. `.env.example`을 참고해 환경 변수를 설정한 뒤 아래 명령으로 저장소의 정적 데이터를 갱신합니다.

```bash
npm run sync:notion
npm run sync:notion:templates
```

템플릿 데이터베이스 속성은 아래 이름을 기준으로 읽으며, 괄호 안의 영문 이름도 지원합니다.

| 속성 | 노션 유형 | 용도 |
| --- | --- | --- |
| 이름 (Name) | 제목 | 템플릿명 |
| 설명 (Description) | 텍스트 | 카드 설명 |
| 판매처 (Marketplace) | 선택 | Notion Marketplace, CTEE 등 |
| URL | URL | 실제 판매 페이지 |
| 커버 (Cover) | 파일 | 갤러리 이미지 |
| 가격 (Price) | 텍스트 | 가격 또는 무료 안내 |
| 상태 (Status) | 상태 또는 선택 | 숨김·비공개·Draft는 제외 |
| 순서 (Order) | 숫자 | 갤러리 노출 순서 |
| 추천 (Featured) | 체크박스 | 추천 배지 표시 |

노션 연결에는 읽기 권한이 필요하며, 대상 데이터베이스를 해당 연결과 공유해야 합니다.

GitHub 저장소의 Actions secrets에 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`, `NOTION_TEMPLATES_DATA_SOURCE_ID`, `NOTION_SALES_DATA_SOURCE_ID`를 등록하면 배포할 때마다 최신 노션 데이터가 자동으로 반영됩니다. 노션에서만 내용을 바꾼 경우에는 GitHub의 **Actions → Deploy to GitHub Pages → Run workflow**로 수동 배포할 수 있습니다.

템플릿의 `판매 링크` 관계와 판매 링크 데이터베이스의 `템플릿` 관계를 연결하면 하나의 템플릿 카드에 Notion Marketplace, CTEE 등 여러 판매처가 표시됩니다.

## 무료 강의

상단 메뉴의 **무료 강의** (`/lectures/`)는 같은 콘텐츠 DB를 사용합니다. 별도 데이터베이스나 API 키는 필요하지 않습니다.

| 속성 | 노션 유형 | 입력 내용 |
| --- | --- | --- |
| 이름 / 제목 (Name / Title) | 제목 | 강의 제목 |
| 상태 (Status) | 상태 또는 선택 | `발행` (또는 `Published`) |
| 형식 (Format) | 선택 | `영상` (또는 `Video`) |
| URL | URL 또는 파일과 미디어 | 영상 주소. 파일과 미디어의 ‘링크 임베드’도 지원. iframe 코드 대신 URL만 입력 |
| 요약 (Description) | 텍스트 | 선택: 영상 아래 설명 |
| 카테고리 (Category) | 선택 | 선택: 강의 분류 |
| 발행일 (Date) | 날짜 | 선택: 비어 있으면 생성일 사용 |
| 순서 (Order) | 숫자 | 선택: 작은 숫자부터 표시, 같은 순서는 최신순 |

`npm run sync:notion`과 기존 GitHub Actions 배포에서 글/영상을 함께 갱신합니다. 영상 형식은 아티클로 중복 게시하지 않습니다. URL 속성이 비어 있으면 노션 본문에서 영상 블록이나 링크를 읽습니다. 서로 다른 영상이 하나일 때만 연결하고, 여러 개이면 URL 속성을 명시하도록 경고합니다. 영상 목록은 매번 전체 교체되어 비공개 또는 삭제된 영상이 다음 배포에서 빠집니다. 이전에 글로 동기화된 항목도 형식 변경/비공개 시 생성된 사본만 정리합니다. 노션 원본이나 직접 작성한 저장소 게시글은 삭제하지 않습니다.

YouTube 일반·공유·Shorts·Live 링크, Vimeo 링크, HTTPS MP4/WebM/OGV/OGG 파일을 지원합니다. 목록에는 중앙 플레이 아이콘 없이 썸네일과 ‘크게 재생’ 안내를 표시하고, 썸네일을 클릭하면 화면 중앙의 큰 플레이어가 열립니다. 페이지 방문만으로는 플레이어를 불러오지 않으며, 사용자가 팝업을 열었을 때 재생을 시작합니다(브라우저 정책에 따라 재생 버튼을 한 번 더 눌러야 할 수 있음). 닫기 버튼·배경 클릭·Esc로 닫으면 플레이어를 제거하여 재생을 중지합니다. 키보드 초점은 팝업 내부에 유지되고 닫을 때 원래 버튼으로 돌아옵니다. 임의의 웹사이트나 iframe HTML을 그대로 실행하지 않으며, 지원하지 않는 HTTPS 주소는 원본 링크로 표시합니다. 잘못되거나 비어 있는 URL은 준비 중 상태와 동기화 경고를 남깁니다.

영상 제공자의 임베드 허용 여부, 삭제/비공개, 로그인·연령 제한에 따라 재생이 제한될 수 있으므로 각 카드에 원본 영상 링크를 함께 둡니다. 플레이어의 버튼·자막 같은 내부 UI는 영상 제공자가 제어하고, 카드와 페이지는 버터노트 스타일을 사용합니다.

임베드 규격: [YouTube 공식 문서](https://developers.google.com/youtube/player_parameters), [Vimeo 비공개 링크 안내](https://help.vimeo.com/hc/en-us/articles/12426470858001-Embedded-player-displays-This-video-does-not-exist-message).

## 일정

**일정** (`/schedule/`)은 별도 DB 없이 **노션 구축 사례 관리 DB**를 씁니다. 날짜가 있는 `발행` 항목은 모두 일정이 되고, 날짜가 지나면 지난 일정으로 옮겨집니다. 배포가 매시간(매시 10분) 자동으로 실행되므로 손댈 필요가 없고, 늦어도 한 시간 안에 반영됩니다.

| 상황 | 일정 페이지 | 구축 사례 페이지 |
| --- | --- | --- |
| 날짜가 오늘 이후 | 다가오는 일정 카드 | 만들지 않음 (본문이 있어도 행사 후에 공개) |
| 날짜가 지났고 본문 있음 | 지난 일정 + `사례 보기` 링크 | 공개 |
| 날짜가 지났고 본문 없음 | 지난 일정 (링크 없음) | 만들지 않음 |
| 날짜 없음, 본문 있음 | 표시 안 함 | 공개 (기존과 같음) |

행사 전 안내는 `요약`에 쓰고(카드에 표시), 본문에는 행사가 끝난 뒤 결과를 적으면 그대로 구축 사례가 됩니다. 날짜가 미래인 기존 사례는 그날이 지날 때까지 구축 사례 목록에서 빠지므로 날짜를 확인해 주세요.

읽는 속성 (모두 선택 사항이며, 날짜만 있으면 일정이 됩니다):

| 속성 | 노션 유형 | 용도 |
| --- | --- | --- |
| 일정 / 일시 / 진행일 / 날짜 / 발행일 (Date) | 날짜 | 앞에서부터 처음 찾은 날짜 속성. 시간과 종료일(기간)도 반영 |
| 카테고리 | 선택 | 교육 / 강연 / 워크숍 / 구축 사례 등. 비우면 `구축 사례` |
| 방식 (진행 방식) | 선택 | 온라인 / 오프라인 / 혼합 |
| 장소 (지역) | 텍스트 또는 선택 | 예: 춘천 |
| 대상 (참가 대상) | 텍스트 | 예: 교직원 30명 |
| 신청 링크 | URL | 있으면 `신청하기`, 없으면 `문의하기`(메일) 버튼. `http(s)` 주소만 사용 |

- 홈 화면에는 가장 가까운 일정 하나가 띠로 나오고, 예정 일정이 없으면 숨깁니다. 일정 페이지는 예정 일정이 없을 때 교육 문의 안내를 보여 줍니다.
- 캘린더 구독: `/schedule.ics`(iCalendar)를 구글 캘린더·다른 캘린더 앱에서 구독할 수 있습니다. 구독한 캘린더에 새 일정이 반영되기까지는 앱에 따라 몇 시간 걸립니다.
- 검색: 다가오는 일정 중 장소가 있거나 온라인인 일정은 검색엔진용 행사 정보(Event 구조화 데이터)로, 모든 다가오는 일정은 `llms.txt`에도 실립니다.
