import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAssistantUserPrompt, checkLocalRateLimit, checkSharedRateLimit, getClientIp, isContextualFollowUp, retrieve } from '../api/ask.js';

test('skills questions retrieve the résumé skills note first', () => {
  const results = retrieve("What are Divyam's technical skills?");
  assert.equal(results[0]?.title, 'Technical skills');
});

test('ORBIT questions retrieve the ORBIT project note first', () => {
  const results = retrieve("Explain ORBIT's architecture and agents");
  assert.equal(results[0]?.title, 'ORBIT autonomous deep research engine');
});

test('GSIT questions retrieve the internship note first', () => {
  const results = retrieve('What did Divyam build during his GSIT internship?');
  assert.equal(results[0]?.title, 'GSIT Innovators internship');
});

test('Locust Watch questions retrieve the Locust Watch note first', () => {
  const results = retrieve('How did he evaluate Locust Watch spatial validation?');
  assert.equal(results[0]?.title, 'Locust Watch project');
});

test('recognizes contextual follow-ups without treating new topic questions as follow-ups', () => {
  assert.equal(isContextualFollowUp('Tell me more about it'), true);
  assert.equal(isContextualFollowUp('What about the researcher agent?'), true);
  assert.equal(isContextualFollowUp("What are Divyam's skills?"), false);
});

test('local rate limiter allows 20 questions and rejects the 21st in a window', () => {
  const identifier = `test-${Date.now()}-${Math.random()}`;
  const now = 1_800_000_000_000;
  for (let index = 0; index < 20; index += 1) {
    assert.equal(checkLocalRateLimit(identifier, now).allowed, true);
  }
  const blocked = checkLocalRateLimit(identifier, now);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test('local rate limiter resets in the next fixed window', () => {
  const identifier = `test-reset-${Date.now()}-${Math.random()}`;
  const now = 1_800_000_000_000;
  for (let index = 0; index < 21; index += 1) checkLocalRateLimit(identifier, now);
  assert.equal(checkLocalRateLimit(identifier, now + 600_000).allowed, true);
});

test('client IP prefers the Vercel forwarded client IP', () => {
  assert.equal(
    getClientIp({ headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.2' } }),
    '203.0.113.10',
  );
});


test('shared rate limiter fails closed in Vercel deployments without Upstash credentials', async () => {
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const previousEnvironment = process.env.VERCEL_ENV;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.VERCEL_ENV = 'production';
  try {
    const result = await checkSharedRateLimit('production-test-client');
    assert.equal(result.configured, false);
  } finally {
    if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previousUrl;
    if (previousToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
  }
});

test('shared rate limiter calls Upstash with an atomic EVAL counter', async () => {
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const previousEnvironment = process.env.VERCEL_ENV;
  const previousFetch = globalThis.fetch;
  process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  process.env.VERCEL_ENV = 'production';
  let observedBody;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://example.upstash.io/');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    observedBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ result: 3 }), { status: 200 });
  };
  try {
    const result = await checkSharedRateLimit('shared-test-client', 1_800_000_000_000);
    assert.equal(result.configured, true);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 17);
    assert.equal(observedBody[0], 'EVAL');
    assert.equal(observedBody[2], 1);
    assert.match(observedBody[1], /INCR/);
    assert.match(observedBody[1], /EXPIRE/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previousUrl;
    if (previousToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
  }
});


test('standalone questions are not polluted by previous topics', () => {
  assert.equal(buildAssistantUserPrompt('What are Divyam’s skills?', 'Explain ORBIT architecture'), 'What are Divyam’s skills?');
});

test('short follow-ups carry only the preceding user question as context', () => {
  const prompt = buildAssistantUserPrompt('What about its persistence?', 'Explain ORBIT architecture');
  assert.match(prompt, /Previous question .* Explain ORBIT architecture/);
  assert.match(prompt, /Current question: What about its persistence\?/);
});
