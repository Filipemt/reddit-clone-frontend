export function formatCompactCount(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  if (value < 1_000_000) {
    const compact = value / 1000;
    const rounded = compact >= 10 ? Math.round(compact) : Math.round(compact * 10) / 10;
    return `${rounded}k`;
  }

  const compact = value / 1_000_000;
  const rounded = compact >= 10 ? Math.round(compact) : Math.round(compact * 10) / 10;
  return `${rounded}M`;
}
