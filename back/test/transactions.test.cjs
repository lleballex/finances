const { test } = require("node:test");
const assert = require("node:assert/strict");
const { TransactionsController } = require("../dist/modules/transactions/transactions.controller");

test("список ограничен пользователем, поиск параметризован", async () => {
  const calls = [];
  const auth = { getUser: async (token) => { assert.equal(token, "signed"); return { id: "owner-id" }; } };
  const db = { query: async (sql, params) => { calls.push({ sql, params }); if (sql.includes("count(*)")) return [{ total: 0 }]; return []; } };
  const result = await new TransactionsController(auth, db).list({ headers: { cookie: "session=signed" } }, { page: 1, limit: 20, grouping: "day", search: "x%' OR true --" });
  assert.equal(result.meta.total, 0);
  assert.equal(calls.length, 3);
  for (const call of calls) {
    assert.match(call.sql, /c\.user_id = \$1/);
    assert.equal(call.params[0], "owner-id");
    assert.ok(!call.sql.includes("OR true --"));
  }
});

test("недействительная сессия не обращается к базе", async () => {
  let queried = false;
  const auth = { getUser: async () => { throw new Error("unauthorized"); } };
  const db = { query: async () => { queried = true; return []; } };
  await assert.rejects(new TransactionsController(auth, db).list({ headers: {} }, { page: 1, limit: 20, grouping: "day" }));
  assert.equal(queried, false);
});

test("создание ограничено владельцем и устанавливает знак по категории", async () => {
  process.env.FRONTEND_ORIGIN = "http://localhost:3001";
  let call;
  const auth = { getUser: async () => ({ id: "owner-id" }) };
  const db = { transaction: async (fn) => fn({ query: async (sql, params) => { if (sql.includes("INSERT")) { call = { sql, params }; return [{ id: "created" }]; } return []; } }) };
  const controller = new TransactionsController(auth, db);
  const result = await controller.create({ headers: { origin: "http://localhost:3001", cookie: "session=signed" } }, { categoryId: "category-id", amount: "123.45", operationDate: "2026-11-16", accountingPeriod: "2026-11-01", isRegular: false });
  assert.equal(result.id, "created");
  assert.match(call.sql, /c\.user_id = \$2/);
  assert.match(call.sql, /WHEN c\.type = 'expense' THEN -\$3::numeric/);
  assert.equal(call.params[1], "owner-id");
  assert.equal(call.params[2], "123.45");
});

test("создание отклоняет чужой origin до обращения к базе", async () => {
  process.env.FRONTEND_ORIGIN = "http://localhost:3001";
  let queried = false;
  const controller = new TransactionsController({ getUser: async () => ({ id: "owner-id" }) }, { query: async () => { queried = true; return []; } });
  await assert.rejects(controller.create({ headers: { origin: "https://example.com" } }, {}));
  assert.equal(queried, false);
});
