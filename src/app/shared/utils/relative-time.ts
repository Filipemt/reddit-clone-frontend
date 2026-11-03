export function formatRelativeTime(isoDate: string, now = Date.now()): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) {
    return 'agora';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay}d`;
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth}me`;
  }

  return `${Math.floor(diffMonth / 12)}a`;
}
