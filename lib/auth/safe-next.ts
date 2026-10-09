export function safeNext(value: unknown, locale = "ar") {
  const fallback = `/${locale === "en" ? "en" : "ar"}`;
  if (
    typeof value !== "string" ||
    value.length > 600 ||
    /[\\\u0000-\u0020]/.test(value) ||
    !/^\/(ar|en)(\/|[?#]|$)/.test(value)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u0020]/.test(decoded) || decoded.startsWith("//"))
      return fallback;
    const target = new URL(value, "https://internal.invalid");
    if (
      target.origin !== "https://internal.invalid" ||
      !/^\/(ar|en)(\/|$)/.test(target.pathname) ||
      /^\/(ar|en)\/(login|signup)(\/|$)/.test(target.pathname)
    )
      return fallback;
    return target.pathname + target.search + target.hash;
  } catch {
    return fallback;
  }
}
