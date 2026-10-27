const DEFAULT_BRIDGE_URL = "https://oopsieheroes-bridge.onrender.com";
const COUNTRY_REQUEST_TIMEOUT_MS = 2500;

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

function getBridgeBaseUrl(): string {
  const envBridgeUrl = (import.meta as any)?.env?.VITE_BRIDGE_URL;
  return typeof envBridgeUrl === "string" && envBridgeUrl.trim().length > 0
    ? envBridgeUrl.trim()
    : DEFAULT_BRIDGE_URL;
}

async function getIpCountryCodeFromBridge(): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COUNTRY_REQUEST_TIMEOUT_MS);

  try {
    const bridgeBase = getBridgeBaseUrl();
    const response = await fetch(`${bridgeBase}/detect-country`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true"
      },
      signal: controller.signal
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return (
      normalizeCountryCode(payload?.countryCode) ||
      normalizeCountryCode(payload?.country) ||
      normalizeCountryCode(payload?.iso2) ||
      null
    );
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function detectCountryCode(): Promise<string> {
  const ipCountry = await getIpCountryCodeFromBridge();
  if (ipCountry) return ipCountry;

  const localeCountry = getLocaleCountryCode();
  if (localeCountry) return localeCountry;

  return "unknown";
}
