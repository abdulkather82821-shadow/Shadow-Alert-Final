import type { ThemeColors } from './theme';

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatMinutesShort(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function getDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(dateStr + 'T00:00:00');
  return days[d.getDay()];
}

export function getFullDate(): string {
  const d = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return d.toLocaleDateString('en-US', options);
}

export function getStatusColor(status: 'within' | 'warning' | 'reached' | 'exceeded', colors: ThemeColors): string {
  switch (status) {
    case 'within':
      return colors.success.main;
    case 'warning':
      return colors.warning.main;
    case 'reached':
      return colors.warning.dark;
    case 'exceeded':
      return colors.error.main;
  }
}

export function getStatusLabel(status: 'within' | 'warning' | 'reached' | 'exceeded'): string {
  switch (status) {
    case 'within':
      return 'Within Limit';
    case 'warning':
      return 'Almost There';
    case 'reached':
      return 'Limit Reached';
    case 'exceeded':
      return 'Limit Exceeded';
  }
}

export function getAppStatus(used: number, limit: number): 'within' | 'warning' | 'reached' | 'exceeded' {
  if (limit <= 0) return 'within';
  const pct = (used / limit) * 100;
  if (used > limit) return 'exceeded';
  if (used >= limit) return 'reached';
  if (pct >= 80) return 'warning';
  return 'within';
}

export function getProgress(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min((used / limit) * 100, 100);
}

export function getRemainingMinutes(used: number, limit: number): number {
  return Math.max(limit - used, 0);
}

export function getWeekStart(offset: number = 0): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff - offset * 7);
  return d.toISOString().split('T')[0];
}

export function getWeekEnd(start: string): string {
  const d = new Date(start + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

export function getWeekDates(offset: number = 0): string[] {
  const start = getWeekStart(offset);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start + 'T00:00:00');
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
