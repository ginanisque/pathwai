import assert from 'node:assert/strict';
import test from 'node:test';
import { containsSensitiveMemory, embedMemoryText } from '../src/server/agentMemory';
import { extractBearerToken } from '../src/server/firebaseAuth';

test('memory embeddings are deterministic and 768 dimensional', () => {
  const first = embedMemoryText('Portugal digital nomad with a calm checklist');
  const second = embedMemoryText('Portugal digital nomad with a calm checklist');
  assert.equal(first.length, 768);
  assert.deepEqual(first, second);
});

test('different memory text produces a different embedding', () => {
  assert.notDeepEqual(embedMemoryText('Portugal visa preference'), embedMemoryText('Canada student permit constraint'));
});

test('empty input produces a valid zero vector', () => {
  const vector = embedMemoryText('');
  assert.equal(vector.length, 768);
  assert.ok(vector.every(value => value === 0));
});

test('sensitive identity and location details are detected before persistence', () => {
  assert.equal(containsSensitiveMemory('My passport number is P12345678'), true);
  assert.equal(containsSensitiveMemory('My exact coordinates are 6.5, 3.3'), true);
  assert.equal(containsSensitiveMemory('I prefer calm step-by-step guidance'), false);
});

test('authorization requires a bearer token', () => {
  assert.equal(extractBearerToken({ authorization: 'Bearer firebase-token' }), 'firebase-token');
  assert.equal(extractBearerToken({ Authorization: 'bearer another-token' }), 'another-token');
  assert.equal(extractBearerToken({ authorization: 'Basic credentials' }), null);
  assert.equal(extractBearerToken({}), null);
});
