export interface ParsedUA {
  browser: string;
  os: string;
  deviceType: "mobile" | "desktop";
}

export function parseUserAgent(ua: string | null): ParsedUA {
  if (!ua) return { browser: "Unknown", os: "Unknown", deviceType: "desktop" };

  let browser = "Unknown";
  const edgeMatch = ua.match(/Edg\/([\d]+)/);
  const chromeMatch = ua.match(/Chrome\/([\d]+)/);
  const firefoxMatch = ua.match(/Firefox\/([\d]+)/);
  const safariMatch = ua.match(/Version\/([\d]+).*Safari/);
  if (edgeMatch) browser = `Edge ${edgeMatch[1]}`;
  else if (chromeMatch) browser = `Chrome ${chromeMatch[1]}`;
  else if (firefoxMatch) browser = `Firefox ${firefoxMatch[1]}`;
  else if (safariMatch) browser = `Safari ${safariMatch[1]}`;

  let os = "Unknown";
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  return { browser, os, deviceType: isMobile ? "mobile" : "desktop" };
}

export function formatUA(parsed: ParsedUA): string {
  return `${parsed.browser} · ${parsed.os}`;
}
