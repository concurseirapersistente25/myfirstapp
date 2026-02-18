import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from './server.js';

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(() => {
  server.close();
});

test('health endpoint responde ok', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
});

test('world-cup endpoint retorna partidas', async () => {
  const response = await fetch(`${baseUrl}/api/world-cup`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.participants));
  assert.ok(Array.isArray(body.matches));
  assert.ok(body.matches.length > 0);
});

