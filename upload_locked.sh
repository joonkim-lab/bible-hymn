#!/bin/sh
: 【맥북】
# 잠긴 자료를 Firebase Storage의 locked/ 아래로 올림. 앱 폴더(index.html 이 있는 곳)에서 실행.
set -e
B=gs://joonkim-bible.firebasestorage.app/locked
gsutil -m -h "Cache-Control:public,max-age=31536000" cp -r data/kr data/en "$B/data/"
gsutil -m -h "Cache-Control:public,max-age=31536000" cp data/hymns.json "$B/data/hymns.json"
gsutil -m -h "Cache-Control:public,max-age=31536000" -h "Content-Type:image/webp" cp hymn/*.webp "$B/hymn/"
echo "올림 끝. 확인:"; gsutil ls "$B/data" | head; gsutil ls "$B/hymn" | wc -l
