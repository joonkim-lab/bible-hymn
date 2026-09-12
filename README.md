# 성경찬송 (개인용)

- `index.html` — 앱 본체 (찬송가 검색/악보 보기, 성경 개역개정·ESV 보기, 절 형광펜)
- `data/books.json` — 66권 목록
- `data/kr/{0..65}.json`, `data/en/{0..65}.json` — 개역개정 / ESV 본문 (책 단위, 소제목 포함)
- `data/hymns.json` — 새찬송가 645장 제목·통일찬송가 번호·분류 색인
- `hymn/001~645.webp` — 악보 이미지
- `sw.js`, `manifest.webmanifest`, `icon-*.png` — 홈화면 추가 / 오프라인용

GitHub Pages(main 브랜치 / root)로 배포하면 `https://joonkim-lab.github.io/bible-hymn/` 에서 열립니다.
