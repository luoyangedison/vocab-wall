const test = require('node:test');
const assert = require('node:assert/strict');
const aiExtra = require('../words_ai_extra.js');
const grade8Extra = require('../words_grade8_term1.js');

function uniqueWords(items) {
  return new Set(items.map((item) => item.w.toLowerCase()));
}

test('AI 扩充词库至少包含 100 个词条且字段完整', () => {
  assert.ok(aiExtra.length >= 100);
  assert.equal(uniqueWords(aiExtra).size, aiExtra.length);
  for (const item of aiExtra) {
    assert.ok(item.w && item.p && item.z && item.e);
  }
});

test('初二上册扩充词库覆盖八上前六个常见主题', () => {
  assert.ok(grade8Extra.length >= 80);
  assert.equal(uniqueWords(grade8Extra).size, grade8Extra.length);
  const words = new Set(grade8Extra.map((item) => item.w.toLowerCase()));
  for (const required of ['anyone', 'hardly', 'outgoing', 'theater', 'sitcom', 'programmer']) {
    assert.ok(words.has(required), `missing ${required}`);
  }
});

test('扩充后 AI 总量达到 180，初二上册独立存在', () => {
  assert.ok(98 + aiExtra.length >= 180);
  assert.ok(83 + grade8Extra.length >= 160);
});
