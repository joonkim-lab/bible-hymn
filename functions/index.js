// 신청·문의 디스코드 알림 + 1회용 초대 코드 자동 승인 + 50명 제한.
// 웹훅 URL은 비밀 설정 DISCORD_WEBHOOK (저장소에 없음).
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const DISCORD_WEBHOOK = defineSecret('DISCORD_WEBHOOK');
const ADMIN_URL = 'https://joonkim-lab.github.io/bible-hymn/admin.html';
const MAX_MEMBERS = 50;   // 승인 인원 상한 (admin.html 의 MAX 와 같게)
setGlobalOptions({ region: 'asia-northeast3', maxInstances: 5 });

async function discord(content) {
  const url = DISCORD_WEBHOOK.value();
  if (!url) return;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
  if (!r.ok) console.error('discord', r.status, await r.text());
}
const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
async function approvedCount() {
  const agg = await db.collection('members').where('status', '==', 'approved').count().get();
  return agg.data().count;
}

exports.onMemberCreated = onDocumentCreated({ document: 'members/{uid}', secrets: [DISCORD_WEBHOOK] }, async (e) => {
  const d = e.data?.data(); if (!d) return;
  const uid = e.params.uid;
  const who = `**${clip(d.name, 30)}** (${clip(d.church, 40) || '교회 미기재'})`;
  const code = clip(d.code, 12).toUpperCase();
  let n = await approvedCount();

  // 그룹 코드: invites/{code} = {label, auto, uses}. 재사용 가능. auto 가 켜져 있고 정원이 남으면 즉시 승인, 아니면 대기.
  if (!code) {
    await e.data.ref.update({ codeError: '코드 없음' });
    await discord(`⚠️ ${who} 사용 신청 — 초대 코드 없음. 대기로 남김 · 현재 ${n}/${MAX_MEMBERS}명\n👉 확인: ${ADMIN_URL}#m=${uid}`);
    return;
  }
  const invRef = db.doc(`invites/${code}`);
  const inv = await invRef.get();
  if (!inv.exists) {
    await e.data.ref.update({ codeError: '코드 틀림' });
    await discord(`⚠️ ${who} 사용 신청 — 코드 \`${code}\` 는 없는 코드. 대기로 남김 · 현재 ${n}/${MAX_MEMBERS}명\n👉 확인: ${ADMIN_URL}#m=${uid}`);
    return;
  }
  const group = clip(inv.data().label, 40) || code;
  await invRef.update({ uses: admin.firestore.FieldValue.increment(1), lastUsedAt: admin.firestore.FieldValue.serverTimestamp(), lastUsedBy: clip(d.name, 30) });
  if (inv.data().auto && n < MAX_MEMBERS) {
    await e.data.ref.update({ status: 'approved', via: 'code', decidedAt: admin.firestore.FieldValue.serverTimestamp() });
    await discord(`✅ ${who} · 코드 \`${code}\`(${group}) 자동 승인 · 현재 ${n + 1}/${MAX_MEMBERS}명`);
    return;
  }
  await discord(`📩 ${who} · 코드 \`${code}\`(${group}) 사용 신청 · 현재 ${n}/${MAX_MEMBERS}명${inv.data().auto ? ' (정원이 차서 자동 승인 안 됨)' : ''}\n👉 승인하기: ${ADMIN_URL}#m=${uid}`);
});

exports.onInboxCreated = onDocumentCreated({ document: 'inbox/{id}', secrets: [DISCORD_WEBHOOK] }, async (e) => {
  const d = e.data?.data(); if (!d) return;
  await discord(`💬 **${clip(d.name, 30) || '이름 없음'}** 문의: ${clip(d.text, 300)}\n👉 답글: ${ADMIN_URL}#i=${e.params.id}`);
});
