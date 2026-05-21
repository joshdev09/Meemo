import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { loadEvents, saveEvents } from '../storage';
import {
  buildContributionsFromEvents,
  getUpcomingEvents,
  getEventsForDate,
} from '../utils';
import { AppEvent, EventsMap, ContributionsMap } from '../types';

type Action =
  | { type: 'LOAD'; payload: EventsMap }
  | { type: 'ADD'; payload: AppEvent }
  | { type: 'UPDATE'; payload: AppEvent }
  | { type: 'DELETE'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string };

interface EventsState {
  events: EventsMap;
  loaded: boolean;
}

interface EventsContextValue {
  events: EventsMap;
  loaded: boolean;
  contributions: ContributionsMap;
  upcomingEvents: AppEvent[];
  getForDate: (dateKey: string) => AppEvent[];
  addEvent: (event: AppEvent) => void;
  updateEvent: (event: AppEvent) => void;
  deleteEvent: (id: string) => void;
  toggleComplete: (id: string) => void;
}

const reducer = (state: EventsState, action: Action): EventsState => {
  switch (action.type) {
    case 'LOAD':
      return { ...state, events: action.payload, loaded: true };
    case 'ADD':
    case 'UPDATE':
      return {
        ...state,
        events: { ...state.events, [action.payload.id]: action.payload },
      };
    case 'DELETE': {
      const next = { ...state.events };
      delete next[action.payload];
      return { ...state, events: next };
    }
    case 'TOGGLE_COMPLETE': {
      const id = action.payload;
      const existing = state.events[id];
      if (!existing) return state;
      return {
        ...state,
        events: {
          ...state.events,
          [id]: { ...existing, completed: !existing.completed },
        },
      };
    }
    default:
      return state;
  }
};

const initialState: EventsState = { events: {}, loaded: false };
const EventsContext = createContext<EventsContextValue | null>(null);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadEvents().then((data) => {
      dispatch({ type: 'LOAD', payload: data || {} });
    });
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveEvents(state.events);
    }
  }, [state.events, state.loaded]);

  const addEvent = useCallback((event: AppEvent) => {
    dispatch({ type: 'ADD', payload: event });
  }, []);

  const updateEvent = useCallback((event: AppEvent) => {
    dispatch({ type: 'UPDATE', payload: event });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
  }, []);

  const contributions = useMemo(
    () => buildContributionsFromEvents(state.events),
    [state.events]
  );

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(state.events),
    [state.events]
  );

  const getForDate = useCallback(
    (dateKey: string) => getEventsForDate(state.events, dateKey),
    [state.events]
  );

  const value: EventsContextValue = {
    events: state.events,
    loaded: state.loaded,
    contributions,
    upcomingEvents,
    getForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = (): EventsContextValue => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
};