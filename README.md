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
