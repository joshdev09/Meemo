import { AppEvent, ContributionCell, ContributionsMap } from '../types';

// ============================================
// DATE FORMATTING
// ============================================

export const toDateKey = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatDateShort = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatDateLong = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatTime = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// ============================================
// MISC UTILS
// ============================================

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

// ============================================
// CALENDAR UTILS
// ============================================

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getMonthStartOffset = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust to make Monday = 0, Sunday = 6
  return firstDay === 0 ? 6 : firstDay - 1;
};

// ============================================
// CONTRIBUTION GRAPH UTILS
// ============================================

export const getContributionLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

export const buildContributionGrid = (contributions: ContributionsMap): ContributionCell[][] => {
  const weeks: ContributionCell[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  
  // Go back 364 days to get roughly a year
  startDate.setDate(today.getDate() - 364);
  
  // Adjust to start on a Sunday
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDay);

  let currentDate = new Date(startDate);
  
  for (let w = 0; w < 53; w++) {
    const week: ContributionCell[] = [];
    for (let d = 0; d < 7; d++) {
      const dateKey = toDateKey(currentDate);
      week.push({
        key: dateKey,
        date: new Date(currentDate),
        count: contributions[dateKey] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

export const getMonthLabels = (weeks: ContributionCell[][]): { label: string; index: number }[] => {
  const labels: { label: string; index: number }[] = [];
  let currentMonth = -1;
  
  weeks.forEach((week, index) => {
    const firstDay = week[0]?.date as Date;
    if (firstDay) {
      const month = firstDay.getMonth();
      if (month !== currentMonth && index > 0) {
        labels.push({ label: firstDay.toLocaleString('en-US', { month: 'short' }), index });
        currentMonth = month;
      } else if (currentMonth === -1) {
        currentMonth = month;
      }
    }
  });
  return labels;
};

// ============================================
// COUNTDOWN UTILS
// ============================================

export const getCountdown = (endDate: string | Date) => {
  const total = Date.parse(new Date(endDate).toString()) - Date.parse(new Date().toString());
  if (total <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    expired: false,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60)
  };
};

export const getProgress = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
};

// ============================================
// EVENT FILTERING UTILS
// ============================================

export const buildContributionsFromEvents = (events: Record<string, AppEvent>): ContributionsMap => {
  const map: ContributionsMap = {};
  Object.values(events).forEach(event => {
    if (event.completed) {
      const key = toDateKey(event.startDate);
      map[key] = (map[key] || 0) + 1;
    }
  });
  return map;
};

export const getUpcomingEvents = (events: Record<string, AppEvent>): AppEvent[] => {
  const now = new Date().getTime();
  return Object.values(events)
    .filter(e => !e.completed && new Date(e.startDate).getTime() > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};

export const getEventsForDate = (events: Record<string, AppEvent>, dateKey: string): AppEvent[] => {
  return Object.values(events).filter(e => toDateKey(e.startDate) === dateKey);
};