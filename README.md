# butter-note.github.io

버터노트의 홈페이지이자 노션 아티클을 발행하는 기술 블로그입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

`main` 브랜치에 변경사항을 올리면 GitHub Actions가 정적 사이트를 빌드하고 Pages에 배포합니다.

Google Analytics를 활성화하려면 저장소의 **Settings → Secrets and variables → Actions → Variables**에서 `GA_MEASUREMENT_ID`를 만들고 `G-`로 시작하는 측정 ID를 입력합니다.
