import { describe, expect, it } from 'vitest';
import { validateEmail } from './utils';

describe('onboarding email or phone number', () => {
  it('accepts an email address', () => {
    expect(validateEmail('hero@example.com')).toBe(true);
  });

  it('accepts a phone number of any length, with an optional country code', () => {
    expect(validateEmail('12345678')).toBe(true);
    expect(validateEmail('123456789012')).toBe(true);
    expect(validateEmail('+31612345678')).toBe(true);
    expect(validateEmail('+86')).toBe(true);
    expect(validateEmail('  +12025550123  ')).toBe(true);
  });

  it('rejects an empty value, a plus sign alone, and mixed characters', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('   ')).toBe(false);
    expect(validateEmail('+')).toBe(false);
    expect(validateEmail('++31612345678')).toBe(false);
    expect(validateEmail('123+456')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
  });
});
