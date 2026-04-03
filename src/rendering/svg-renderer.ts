import type { UsageData, UsagePeriod } from "../types/usage";

function getBarColor(utilization: number): string {
  if (utilization >= 90) return "#F44336";
  if (utilization >= 70) return "#FF9800";
  return "#4CAF50";
}

function getBgTint(utilization: number): string {
  if (utilization >= 90) return "#2a1a1a";
  if (utilization >= 70) return "#2a2218";
  return "#1a1a2e";
}

function formatCountdown(resetsAt: string): string {
  const resetTime = new Date(resetsAt).getTime();
  const now = Date.now();
  const diffMs = resetTime - now;

  if (diffMs <= 0) return "resetting...";

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `resets ${hours}h ${minutes}m`;
  return `resets ${minutes}m`;
}

function clamp(val: number): number {
  return Math.max(0, Math.min(100, val));
}

export function renderCombinedSvg(data: UsageData): string {
  const pct7d = Math.round(clamp(data.seven_day.utilization));
  const pct5h = Math.round(clamp(data.five_hour.utilization));
  const fill7d = Math.round((clamp(data.seven_day.utilization) / 100) * 120);
  const fill5h = Math.round((clamp(data.five_hour.utilization) / 100) * 120);
  const color7d = getBarColor(data.seven_day.utilization);
  const color5h = getBarColor(data.five_hour.utilization);
  const bg = getBgTint(Math.max(data.seven_day.utilization, data.five_hour.utilization));
  const cd7d = formatCountdown(data.seven_day.resets_at);
  const cd5h = formatCountdown(data.five_hour.resets_at);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="${bg}" rx="8"/>
  <text x="72" y="18" text-anchor="middle" fill="#999" font-size="11" font-family="Arial,sans-serif">7-Day</text>
  <rect x="12" y="24" width="120" height="18" rx="4" fill="#333"/>
  <rect x="12" y="24" width="${fill7d}" height="18" rx="4" fill="${color7d}"/>
  <text x="72" y="38" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial,sans-serif">${pct7d}%</text>
  <text x="72" y="56" text-anchor="middle" fill="#888" font-size="10" font-family="Arial,sans-serif">${cd7d}</text>
  <text x="72" y="80" text-anchor="middle" fill="#999" font-size="11" font-family="Arial,sans-serif">5-Hour</text>
  <rect x="12" y="86" width="120" height="18" rx="4" fill="#333"/>
  <rect x="12" y="86" width="${fill5h}" height="18" rx="4" fill="${color5h}"/>
  <text x="72" y="100" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial,sans-serif">${pct5h}%</text>
  <text x="72" y="118" text-anchor="middle" fill="#888" font-size="10" font-family="Arial,sans-serif">${cd5h}</text>
  <text x="72" y="138" text-anchor="middle" fill="#555" font-size="9" font-family="Arial,sans-serif">Claude Gauge</text>
</svg>`;
}

function renderSinglePeriodSvg(label: string, period: UsagePeriod): string {
  const pct = Math.round(clamp(period.utilization));
  const fillWidth = Math.round((clamp(period.utilization) / 100) * 120);
  const color = getBarColor(period.utilization);
  const bg = getBgTint(period.utilization);
  const countdown = formatCountdown(period.resets_at);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="${bg}" rx="8"/>
  <text x="72" y="28" text-anchor="middle" fill="#999" font-size="14" font-family="Arial,sans-serif">${label}</text>
  <text x="72" y="68" text-anchor="middle" fill="white" font-size="32" font-weight="bold" font-family="Arial,sans-serif">${pct}%</text>
  <rect x="12" y="80" width="120" height="20" rx="5" fill="#333"/>
  <rect x="12" y="80" width="${fillWidth}" height="20" rx="5" fill="${color}"/>
  <text x="72" y="118" text-anchor="middle" fill="#888" font-size="12" font-family="Arial,sans-serif">${countdown}</text>
  <text x="72" y="138" text-anchor="middle" fill="#555" font-size="9" font-family="Arial,sans-serif">Claude Gauge</text>
</svg>`;
}

export function renderSevenDaySvg(data: UsageData): string {
  return renderSinglePeriodSvg("7-Day Usage", data.seven_day);
}

export function renderFiveHourSvg(data: UsageData): string {
  return renderSinglePeriodSvg("5-Hour Usage", data.five_hour);
}

export function renderErrorSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a2e" rx="8"/>
  <text x="72" y="60" text-anchor="middle" fill="#F44336" font-size="14" font-weight="bold" font-family="Arial,sans-serif">${escapeXml(message)}</text>
  <text x="72" y="90" text-anchor="middle" fill="#666" font-size="11" font-family="Arial,sans-serif">Claude Gauge</text>
</svg>`;
}

export function renderLoadingSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a2e" rx="8"/>
  <text x="72" y="68" text-anchor="middle" fill="#888" font-size="14" font-family="Arial,sans-serif">Loading...</text>
  <text x="72" y="90" text-anchor="middle" fill="#555" font-size="9" font-family="Arial,sans-serif">Claude Gauge</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
