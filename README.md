# butter-note.github.io

버터노트의 홈페이지이자 노션 아티클을 발행하는 기술 블로그입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

`main` 브랜치에 변경사항을 올리면 GitHub Actions가 정적 사이트를 빌드하고 Pages에 배포합니다.

Google Tag Manager 컨테이너 `GTM-TV4D6VBX`가 모든 페이지에 설치되어 있습니다. Google Analytics 태그는 해당 컨테이너에서 관리합니다.

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
| URL | URL | 영상 주소. iframe 코드 대신 URL만 입력 |
| 요약 (Description) | 텍스트 | 선택: 영상 아래 설명 |
| 카테고리 (Category) | 선택 | 선택: 강의 분류 |
| 발행일 (Date) | 날짜 | 선택: 비어 있으면 생성일 사용 |
| 순서 (Order) | 숫자 | 선택: 작은 숫자부터 표시, 같은 순서는 최신순 |

`npm run sync:notion`과 기존 GitHub Actions 배포에서 글/영상을 함께 갱신합니다. 영상 형식은 아티클로 중복 게시하지 않습니다. URL 속성이 비어 있으면 노션 본문에서 영상 블록이나 링크를 읽습니다. 서로 다른 영상이 하나일 때만 연결하고, 여러 개이면 URL 속성을 명시하도록 경고합니다. 영상 목록은 매번 전체 교체되어 비공개 또는 삭제된 영상이 다음 배포에서 빠집니다. 이전에 글로 동기화된 항목도 형식 변경/비공개 시 생성된 사본만 정리합니다. 노션 원본이나 직접 작성한 저장소 게시글은 삭제하지 않습니다.

YouTube 일반·공유·Shorts·Live 링크, Vimeo 링크, HTTPS MP4/WebM/OGV/OGG 파일을 재생창으로 표시합니다. 자동재생은 하지 않습니다. 임의의 웹사이트나 iframe HTML을 그대로 실행하지 않으며, 지원하지 않는 HTTPS 주소는 원본 링크로 표시합니다. 잘못되거나 비어 있는 URL은 준비 중 상태와 동기화 경고를 남깁니다.

영상 제공자의 임베드 허용 여부, 삭제/비공개, 로그인·연령 제한에 따라 재생이 제한될 수 있으므로 각 카드에 원본 영상 링크를 함께 둡니다. 플레이어의 버튼·자막 같은 내부 UI는 영상 제공자가 제어하고, 카드와 페이지는 버터노트 스타일을 사용합니다.

임베드 규격: [YouTube 공식 문서](https://developers.google.com/youtube/player_parameters), [Vimeo 비공개 링크 안내](https://help.vimeo.com/hc/en-us/articles/12426470858001-Embedded-player-displays-This-video-does-not-exist-message).
