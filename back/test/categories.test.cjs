const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CategoriesController } = require('../dist/modules/categories/categories.controller');
const input = { name: 'Еда', type: 'income', isRegular: false, parentId: null, emoji: '🍎', color: '#abcdef' };
const request = { headers: { origin: 'http://localhost:3001', cookie: 'session=signed' } };
process.env.FRONTEND_ORIGIN = 'http://localhost:3001';
function controller(query) {
  return new CategoriesController({ getUser: async () => ({ id: 'owner' }) }, { transaction: async (fn) => fn({ query }) });
}
test('запрещает менять тип категории, если подкатегория используется', async () => {
  const queries = [];
  const instance = controller(async (sql) => {
    queries.push(sql);
    if (sql.includes('SELECT id, type')) return [{ id: 'root', type: 'expense' }];
    if (sql.includes('SELECT id FROM category WHERE parent_id')) return [{ id: 'child' }];
    if (sql.includes('FROM "transaction"')) return [{}];
    return [];
  });
  await assert.rejects(instance.update(request, 'root', input), { status: 409 });
  assert.equal(queries.some((sql) => sql.startsWith('UPDATE')), false);
});
test('меняет тип подкатегорий вместе с родителем', async () => {
  const queries = [];
  const instance = controller(async (sql, params) => {
    queries.push({ sql, params });
    if (sql.includes('SELECT id, type')) return [{ id: 'root', type: 'expense' }];
    if (sql.includes('SELECT id FROM category WHERE parent_id')) return [{ id: 'child' }];
    return [];
  });
  await instance.update(request, 'root', input);
  assert.ok(queries.some(({ sql, params }) => sql.includes('UPDATE category SET type') && params[0] === 'income'));
});
test('запрещает удаление родителя с подкатегорией', async () => {
  const instance = controller(async (sql) => {
    if (sql.includes('SELECT id FROM category WHERE id')) return [{ id: 'root' }];
    if (sql.includes('SELECT 1 FROM category WHERE parent_id')) return [{}];
    return [];
  });
  await assert.rejects(instance.remove(request, 'root'), { status: 409 });
});
