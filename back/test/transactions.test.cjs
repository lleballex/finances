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
