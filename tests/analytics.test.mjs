import assert from 'node:assert/strict';
import test from 'node:test';
import { claritySnippet, googleAnalyticsSnippet, resolveAnalytics } from '../lib/analytics.ts';

test('empty analytics IDs turn the tools off', () => {
  assert.deepEqual(resolveAnalytics({ googleAnalyticsId: '', clarityProjectId: '  ' }), { googleAnalyticsId: '', clarityProjectId: '' });
});

test('valid analytics IDs are kept and trimmed', () => {
  assert.deepEqual(resolveAnalytics({ googleAnalyticsId: ' G-AB12CD34EF ', clarityProjectId: 'abc123defg' }), {
    googleAnalyticsId: 'G-AB12CD34EF',
    clarityProjectId: 'abc123defg',
  });
});

test('malformed analytics IDs fail the build', () => {
  assert.throws(() => resolveAnalytics({ googleAnalyticsId: 'UA-12345-1', clarityProjectId: '' }), /googleAnalyticsId/);
  assert.throws(() => resolveAnalytics({ googleAnalyticsId: '', clarityProjectId: 'abc");alert(1)//' }), /clarityProjectId/);
});

test('snippets load the configured IDs', () => {
  assert.match(googleAnalyticsSnippet('G-AB12CD34EF'), /gtag\('config','G-AB12CD34EF'\)/);
  assert.match(claritySnippet('abc123defg'), /"https:\/\/www\.clarity\.ms\/tag\/"\+i/);
  assert.match(claritySnippet('abc123defg'), /"clarity","script","abc123defg"\)/);
});
