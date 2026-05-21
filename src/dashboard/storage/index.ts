import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventsMap, ContributionsMap } from '../types';

const KEYS = {
  EVENTS: '@productivity_events',
  SETTINGS: '@productivity_settings',
  CONTRIBUTIONS: '@productivity_contributions',
};

const save = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[Storage] save error:', e);
  }
};

const load = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('[Storage] load error:', e);
    return fallback;
  }
};

const remove = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('[Storage] remove error:', e);
  }
};

export const loadEvents = (): Promise<EventsMap> => load<EventsMap>(KEYS.EVENTS, {});
export const saveEvents = (eventsMap: EventsMap): Promise<void> => save(KEYS.EVENTS, eventsMap);

export const loadSettings = (): Promise<{ userName: string; avatarUri: string }> =>
  load(KEYS.SETTINGS, { userName: 'Shua', avatarUri: 'https://i.pravatar.cc/150?img=11' });

export const saveSettings = (settings: { userName: string; avatarUri: string }): Promise<void> => 
  save(KEYS.SETTINGS, settings);

export const loadContributions = (): Promise<ContributionsMap> => load<ContributionsMap>(KEYS.CONTRIBUTIONS, {});
export const saveContributions = (data: ContributionsMap): Promise<void> => save(KEYS.CONTRIBUTIONS, data);

export const clearAll = async (): Promise<void> => {
  await remove(KEYS.EVENTS);
  await remove(KEYS.SETTINGS);
  await remove(KEYS.CONTRIBUTIONS);
};

export const toDateKey = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};