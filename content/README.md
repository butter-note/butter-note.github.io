# 버터노트 글 추가 방법

공개 목록의 이름은 **노션 블로그**이며 기존 `/articles/` 주소를 유지합니다. 초기 기본 예시 글 3개는 공개 콘텐츠에서 삭제했습니다. 같은 제목의 노션 연동 글은 별개의 콘텐츠로 유지됩니다. 렌더링 검증용 예시는 `tests/fixtures/`에만 두고, 공개 글을 읽는 `posts` 폴더에는 넣지 않습니다.

노션 동기화 전에는 게시글이 0개일 수 있습니다. 이때도 정적 빌드가 가능하도록 상세 경로의 `__empty__`는 404 화면으로 처리하며 목록에는 표시하지 않습니다. 실제 글이 있으면 이 경로는 생성하지 않습니다.

## Notion-flavored Markdown 직접 추가

`posts` 폴더에 이름이 같은 `.md`와 `.json` 파일을 추가합니다. Markdown 본문은 노션의 Enhanced Markdown 문법을 수정하지 않고 넣을 수 있습니다.

필수 메타데이터는 `slug`, `title`, `description`, `category`, `date`, `readTime`, `character`입니다.

## 노션 API 동기화

`.env.example`의 두 값을 환경 변수 또는 GitHub Actions 비밀값으로 등록한 다음 `npm run sync:notion`을 실행합니다. 노션 데이터 소스의 `상태`가 `발행`인 페이지만 가져옵니다.

권장 속성은 `이름`, `상태`, `Slug`, `카테고리`, `요약`, `발행일`, `추천`입니다.
