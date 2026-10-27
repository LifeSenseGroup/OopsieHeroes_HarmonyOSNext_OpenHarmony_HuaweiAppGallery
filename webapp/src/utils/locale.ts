declare global {
  interface Window {
    __oopsiePhoneLanguage?: string;
  }
}

/** BCP 47 tags use hyphens. Some phones report underscores, such as zh_TW. */
export function normalizeLocaleTag(tag: string | null | undefined): string | null {
  if (!tag) return null;
  return tag.replace(/_/g, "-");
}

const localeTagPattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/**
 * iOS injects the phone's preferred language before the page scripts run.
 * WKWebView's navigator.language can be another app localization, such as
 * Chinese, when that language is still in the phone's language list.
 */
export function phoneLanguageTag(navigatorLanguage: string | null | undefined): string | null {
  const injected = typeof window !== "undefined" ? window.__oopsiePhoneLanguage : undefined;
  const normalized = normalizeLocaleTag(injected) ?? normalizeLocaleTag(navigatorLanguage);
  if (!normalized || !localeTagPattern.test(normalized)) {
    return normalizeLocaleTag(navigatorLanguage);
  }
  return normalized;
}

/**
 * Simplified and Traditional Chinese phone settings both display
 * Simplified Chinese. en, nl, ja, and the other catalogs stay separate.
 */
export function isChineseLocale(tag: string | null | undefined): boolean {
  const normalized = normalizeLocaleTag(tag);
  if (!normalized) return false;
  const lower = normalized.toLowerCase();
  return lower === "zh" || lower.startsWith("zh-");
}
