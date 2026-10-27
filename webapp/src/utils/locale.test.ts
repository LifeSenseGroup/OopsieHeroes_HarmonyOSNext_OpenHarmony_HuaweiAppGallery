import { describe, expect, it } from 'vitest';
import { isChineseLocale, normalizeLocaleTag, phoneLanguageTag } from './locale';

describe('phone language', () => {
  it('keeps English on the English catalog', () => {
    expect(isChineseLocale('en')).toBe(false);
    expect(isChineseLocale('en-US')).toBe(false);
    expect(isChineseLocale('en-GB')).toBe(false);
  });

  it('treats Simplified and Traditional Chinese as Simplified Chinese', () => {
    for (const tag of [
      'zh',
      'zh-CN',
      'zh-Hans',
      'zh-Hans-CN',
      'zh-SG',
      'zh_CN',
      'zh-TW',
      'zh-HK',
      'zh-MO',
      'zh-Hant',
      'zh-Hant-TW',
      'zh-Hant-HK',
      'zh_TW'
    ]) {
      expect(isChineseLocale(tag)).toBe(true);
    }
  });

  it('leaves other phone languages on their own catalogs', () => {
    for (const tag of ['nl', 'nl-NL', 'ja', 'de-DE', 'es', 'fr-FR', 'tr']) {
      expect(isChineseLocale(tag)).toBe(false);
    }
  });

  it('normalizes underscore locale tags', () => {
    expect(normalizeLocaleTag('zh_TW')).toBe('zh-TW');
    expect(normalizeLocaleTag('en_US')).toBe('en-US');
    expect(normalizeLocaleTag(null)).toBeNull();
  });

  it('uses the phone language for the privacy policy, not another listed language', () => {
    window.__oopsiePhoneLanguage = 'de-DE';
    expect(isChineseLocale(phoneLanguageTag('zh-Hans'))).toBe(false);

    window.__oopsiePhoneLanguage = 'zh-Hant-TW';
    expect(isChineseLocale(phoneLanguageTag('en-US'))).toBe(true);

    window.__oopsiePhoneLanguage = 'zh_CN';
    expect(phoneLanguageTag('en')).toBe('zh-CN');
    expect(isChineseLocale(phoneLanguageTag('en'))).toBe(true);

    delete window.__oopsiePhoneLanguage;
    expect(isChineseLocale(phoneLanguageTag('de'))).toBe(false);
    expect(isChineseLocale(phoneLanguageTag('zh-Hans'))).toBe(true);
  });
});
