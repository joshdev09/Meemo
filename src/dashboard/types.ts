export interface AppEvent {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  allDay?: boolean;
  reminder?: string;
  repeat?: string;
  color?: string;
  location?: string;
  completed?: boolean;
  createdAt?: string;
}

export interface ContributionCell {
  key: string;
  date: string | Date;
  count: number;
}

export type ContributionsMap = Record<string, number>;
export type EventsMap = Record<string, AppEvent>;