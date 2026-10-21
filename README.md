# 준킴 성경 (승인제 개인용)

- `index.html` — 앱 본체. 처음 열면 **사용 신청**(이름·교회) 화면이 뜨고, 관리자가 승인한 기기만 성경·찬송가를 볼 수 있음
- `admin.html` — 관리 화면 (신청 승인/차단, 문의함 답글). 관리자 이메일로 로그인
- `firestore.rules`, `storage.rules` — 실제 잠금. 관리자 이메일은 두 파일의 `isAdmin()` 에 있음
- `upload_locked.sh` — 성경 본문·찬송 악보·가사를 Storage `locked/` 로 올리는 스크립트
- `data/books.json`, `data/split3.json`, `data/plans-v1.json` — 공개해도 되는 색인·통독표
- `data/kr`, `data/en`, `data/hymns.json`, `hymn/` — **저장소에 없음**(.gitignore). 맥북 로컬 폴더에만 두고 Storage 로 올림

GitHub Pages(main / root) 그대로: https://joonkim-lab.github.io/bible-hymn/
