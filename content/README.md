# 버터노트 글 추가 방법

## Notion-flavored Markdown 직접 추가

`posts` 폴더에 이름이 같은 `.md`와 `.json` 파일을 추가합니다. Markdown 본문은 노션의 Enhanced Markdown 문법을 수정하지 않고 넣을 수 있습니다.

필수 메타데이터는 `slug`, `title`, `description`, `category`, `date`, `readTime`, `character`입니다.

## 노션 API 동기화

`.env.example`의 두 값을 환경 변수 또는 GitHub Actions 비밀값으로 등록한 다음 `npm run sync:notion`을 실행합니다. 노션 데이터 소스의 `상태`가 `발행`인 페이지만 가져옵니다.

권장 속성은 `이름`, `상태`, `Slug`, `카테고리`, `요약`, `발행일`, `추천`입니다.
