const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

test("режим разработки сохраняет метаданные NestJS для зависимостей и DTO", () => {
  const script = `
    require('reflect-metadata');
    const { CategoriesController } = require('./src/modules/categories/categories.controller');
    const dependencies = Reflect.getMetadata('design:paramtypes', CategoriesController);
    const params = Reflect.getMetadata('design:paramtypes', CategoriesController.prototype, 'create');
    if (!dependencies?.every(Boolean) || dependencies.length !== 2 || !params?.[1]) process.exit(1);
  `;
  const result = spawnSync(process.execPath, ["-r", "ts-node/register", "-e", script], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(require("../package.json").scripts.dev, /ts-node\/register/);
});
