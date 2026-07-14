# 好好学每日单词词库第一版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为现有每日单词页面加入初二上册临时词库，并把 AI 科技词库扩充到不少于 180 个唯一词条。

**Architecture:** 新词条分别放在两个独立的浏览器脚本文件中。页面先加载数据文件，再在现有内联脚本创建分类前把新增词条合并进 `W`，因此现有学习状态、抽词逻辑和卡片 UI 都保持不变。

**Tech Stack:** 原生 HTML、CSS、JavaScript；Node.js 内置 `node:test` 做数据校验。

## Global Constraints

- 单词模块不调用 AI，不生成或复制提示词。
- 初二上册例句是临时教材语境，未确认实际教材前不得宣称为最终课本原句。
- 现有词库和学习记录结构保持兼容。
- AI 科技词库合计至少 180 个唯一词条。

---

### Task 1: 建立词库数据校验

**Files:**
- Create: `tests/word-banks.test.js`
- Create: `words_ai_extra.js`
- Create: `words_grade8_term1.js`

**Interfaces:**
- `words_ai_extra.js` exports `AI_EXTRA` in Node and defines it as a browser global.
- `words_grade8_term1.js` exports `GRADE8_TERM1_EXTRA` in Node and defines it as a browser global.

- [ ] **Step 1: Write the failing test**

```js
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

test('初二上册扩充词库覆盖八上前六个主题', () => {
  assert.ok(grade8Extra.length >= 80);
  assert.equal(uniqueWords(grade8Extra).size, grade8Extra.length);
  const words = new Set(grade8Extra.map((item) => item.w.toLowerCase()));
  for (const required of ['anyone', 'hardly', 'outgoing', 'theater', 'sitcom', 'programmer']) {
    assert.ok(words.has(required), `missing ${required}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/word-banks.test.js`
Expected: FAIL because the two new data modules do not exist.

- [ ] **Step 3: Add the two data modules**

Each file defines a plain array of objects shaped as `{w, p, z, e}` and ends with:

```js
if (typeof module !== 'undefined') module.exports = AI_EXTRA;
```

Use the corresponding global name in the grade-8 file.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/word-banks.test.js`
Expected: PASS with 2 tests and 0 failures.

- [ ] **Step 5: Commit**

```bash
git add words_ai_extra.js words_grade8_term1.js tests/word-banks.test.js
git commit -m "feat: add initial AI and grade eight word banks"
```

### Task 2: Wire the new banks into the existing page

**Files:**
- Modify: `index.html:186` to load the two data scripts before the main script.
- Modify: `index.html` after `W.ai` is defined and before `CAT_GROUPS`.
- Modify: `index.html` in the middle-school `CAT_GROUPS` section.

**Interfaces:**
- Browser globals `AI_EXTRA` and `GRADE8_TERM1_EXTRA` are available before the main inline script runs.
- `W.ai` remains the existing array plus `AI_EXTRA`.
- `W.grade8t1` points to `GRADE8_TERM1_EXTRA`.

- [ ] **Step 1: Write the failing integration test**

Extend `tests/word-banks.test.js` with:

```js
test('扩充后 AI 总量达到 180，初二上册独立存在', () => {
  const existingAi = 98;
  const existingGrade8 = 83;
  assert.ok(existingAi + aiExtra.length >= 180);
  assert.equal(grade8Extra.length, grade8Extra.length);
  assert.ok(existingGrade8 + grade8Extra.length >= 160);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/word-banks.test.js`
Expected: FAIL until the new data contains enough entries.

- [ ] **Step 3: Load and merge data**

Add before the existing inline main script:

```html
<script src="words_ai_extra.js"></script>
<script src="words_grade8_term1.js"></script>
```

Add before `var CAT_GROUPS=[`:

```js
W.ai = W.ai.concat(AI_EXTRA);
W.grade8t1 = GRADE8_TERM1_EXTRA.slice();
```

Add this option after the existing `grade8` option:

```js
{key:'grade8t1',name:'初二上册',desc:'人教版临时词库 ('+W.grade8t1.length+'词)'}
```

- [ ] **Step 4: Run data and syntax checks**

Run: `node --test tests/word-banks.test.js`
Run: `node --check words_ai_extra.js`
Run: `node --check words_grade8_term1.js`
Expected: all pass with no syntax errors.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/word-banks.test.js
git commit -m "feat: expose expanded daily word banks"
```

### Task 3: Verify page behavior and handoff

**Files:**
- Modify: none unless verification finds a regression.

- [ ] **Step 1: Run the complete local checks**

Run: `node --test tests/word-banks.test.js`
Run: `node --check words_ai_extra.js && node --check words_grade8_term1.js`
Run: `git diff --check HEAD~2..HEAD`

- [ ] **Step 2: Inspect the final diff**

Run: `git status --short --branch` and `git diff main...HEAD --stat`.
Expected: only the two data files, the test, the page wiring, and the design/plan documents are changed.

- [ ] **Step 3: Report deployment boundary**

Do not publish to the live domain in this task. Hand off the verified branch and list the next explicit release step separately.
