import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-config'
}));

const mockHomedir = '/tmp/tenmin-test-home-config';

import { getGeminiKey, saveGeminiKey } from './config.js';

describe('Config Management', () => {
  const testTenminDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testTenminDir)) {
      rmSync(testTenminDir, { recursive: true, force: true });
    }
    // Clear the env var if it's set just for tests
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (existsSync(testTenminDir)) {
      rmSync(testTenminDir, { recursive: true, force: true });
    }
    delete process.env.GEMINI_API_KEY;
  });

  it('getGeminiKey should return null if not set', () => {
    expect(getGeminiKey()).toBeNull();
  });

  it('saveGeminiKey should persist the key', () => {
    saveGeminiKey('test-key-123');
    expect(getGeminiKey()).toBe('test-key-123');
  });

  it('getGeminiKey should prioritize process.env.GEMINI_API_KEY', () => {
    saveGeminiKey('test-key-123');
    process.env.GEMINI_API_KEY = 'env-key-456';
    expect(getGeminiKey()).toBe('env-key-456');
  });
});
