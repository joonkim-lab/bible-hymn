// 신청·문의가 들어오면 디스코드 채널로 알림. 웹훅 URL은 비밀 설정 DISCORD_WEBHOOK 에 있음 (저장소에 없음).
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');

const DISCORD_WEBHOOK = defineSecret('DISCORD_WEBHOOK');
const ADMIN_URL = 'https://joonkim-lab.github.io/bible-hymn/admin.html';
setGlobalOptions({ region: 'us-central1', maxInstances: 5 });

async function discord(content) {
  const url = DISCORD_WEBHOOK.value();
  if (!url) return;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
  if (!r.ok) console.error('discord', r.status, await r.text());
}
const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

exports.onMemberCreated = onDocumentCreated({ document: 'members/{uid}', secrets: [DISCORD_WEBHOOK] }, async (e) => {
  const d = e.data?.data(); if (!d) return;
  await discord(`📩 **${clip(d.name, 30)}** (${clip(d.church, 40) || '교회 미기재'}) 사용 신청\n👉 승인하기: ${ADMIN_URL}#m=${e.params.uid}`);
});

exports.onInboxCreated = onDocumentCreated({ document: 'inbox/{id}', secrets: [DISCORD_WEBHOOK] }, async (e) => {
  const d = e.data?.data(); if (!d) return;
  await discord(`💬 **${clip(d.name, 30) || '이름 없음'}** 문의: ${clip(d.text, 300)}\n👉 답글: ${ADMIN_URL}#i=${e.params.id}`);
});
