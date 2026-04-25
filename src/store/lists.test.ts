import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-lists',
}));

const mockHomedir = '/tmp/tenmin-test-home-lists';

import {
  getSavedLists,
  getSavedList,
  saveList,
  deleteList,
  resetState,
} from './index.js';
import type { SavedList } from '../types.js';

const makeList = (name: string, itemCount = 2): SavedList => ({
  name,
  items: Array.from({ length: itemCount }, (_, i) => ({
    id: `prod_00${i + 1}`,
    name: `Product ${i + 1}`,
    qty: i + 1,
  })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('Saved Lists', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('getSavedLists returns empty array by default', () => {
    expect(getSavedLists()).toEqual([]);
  });

  it('saveList persists a new list', () => {
    const list = makeList('weekly-groceries');
    saveList(list);

    const lists = getSavedLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe('weekly-groceries');
    expect(lists[0].items).toHaveLength(2);
  });

  it('saveList updates an existing list with the same name', () => {
    saveList(makeList('my-list', 2));
    saveList(makeList('my-list', 5)); // overwrite

    const lists = getSavedLists();
    expect(lists).toHaveLength(1);         // still one list
    expect(lists[0].items).toHaveLength(5); // updated to 5 items
  });

  it('saveList stores multiple distinct lists', () => {
    saveList(makeList('list-a'));
    saveList(makeList('list-b'));
    saveList(makeList('list-c'));

    expect(getSavedLists()).toHaveLength(3);
  });

  it('getSavedList returns the correct list by name', () => {
    saveList(makeList('alpha'));
    saveList(makeList('beta'));

    const result = getSavedList('beta');
    expect(result).toBeDefined();
    expect(result!.name).toBe('beta');
  });

  it('getSavedList returns undefined for a non-existent name', () => {
    expect(getSavedList('does-not-exist')).toBeUndefined();
  });

  it('deleteList removes the correct list and returns true', () => {
    saveList(makeList('keep-me'));
    saveList(makeList('delete-me'));

    const deleted = deleteList('delete-me');
    expect(deleted).toBe(true);

    const lists = getSavedLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe('keep-me');
  });

  it('deleteList returns false when the list does not exist', () => {
    const deleted = deleteList('ghost-list');
    expect(deleted).toBe(false);
  });

  it('saved lists survive a getState round-trip (persistence)', () => {
    saveList(makeList('persistent'));

    // Simulate a fresh read by calling getSavedLists again
    // (same process, but verifies it hits disk and parses correctly)
    const lists = getSavedLists();
    expect(lists[0].name).toBe('persistent');
    expect(lists[0].items[0].id).toBe('prod_001');
  });

  it('state migration: old state without savedLists gets empty array', () => {
    // Simulate a state file from before savedLists was added
    mkdirSync(testDir, { recursive: true });
    writeFileSync(
      join(testDir, 'state.json'),
      JSON.stringify({ cart: [], credits: 500, orders: [], address: '', theme: 'default' }),
    );

    const lists = getSavedLists();
    expect(lists).toEqual([]);
  });
});
