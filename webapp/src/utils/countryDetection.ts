function normalizeCountryCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  // We only accept ISO-3166 alpha-2 codes in app logic.
  return /^[a-z]{2}$/.test(normalized) ? normalized : null;
}

function extractRegionWithIntlLocale(localeTag: string): string | null {
  try {
    const normalizedTag = localeTag.replace(/_/g, "-");
    // Intl.Locale handles script/variant/extensions correctly when supported.
    const intlLocale = new Intl.Locale(normalizedTag);
    return normalizeCountryCode(intlLocale.region);
  } catch (_error) {
    return null;
  }
}

function extractRegionWithManualParse(localeTag: string): string | null {
  const normalizedTag = localeTag.replace(/_/g, "-");
  const subtags = normalizedTag.split("-").filter(Boolean);
  if (subtags.length < 2) return null;

  // Skip primary language (index 0), then find region subtag.
  for (let i = 1; i < subtags.length; i++) {
    const token = subtags[i];

    // Single-character subtags indicate extension/private sequences.
    if (token.length === 1) break;

    // Region subtag in BCP-47: either two letters or three digits.
    if (/^[a-zA-Z]{2}$/.test(token)) return token.toLowerCase();
    if (/^\d{3}$/.test(token)) return null;
  }

  return null;
}

function getLocaleCountryCode(): string | null {
  const locales = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];

  for (const localeTag of locales) {
    if (!localeTag) continue;
    const intlRegion = extractRegionWithIntlLocale(localeTag);
    if (intlRegion) return intlRegion;

    const manualRegion = extractRegionWithManualParse(localeTag);
    if (manualRegion) return manualRegion;
  }

  return null;
}

export async function detectCountryCode(): Promise<string> {
  const localeCountry = getLocaleCountryCode();
  if (localeCountry) return localeCountry;

  return "unknown";
}
