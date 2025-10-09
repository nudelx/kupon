import { describe, expect, it } from 'vitest';
import { createJoinCode, createShareSlug } from '../id';

describe('id utilities', () => {
  it('generates compact join codes', () => {
    const code = createJoinCode();
    expect(code).toHaveLength(8);
    expect(/^[a-z0-9]+$/i.test(code)).toBe(true);
  });

  it('generates share slugs', () => {
    const slug = createShareSlug();
    expect(slug).toHaveLength(12);
  });
});
