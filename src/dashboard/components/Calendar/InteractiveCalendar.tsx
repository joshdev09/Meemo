import React, { useState, memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { getDaysInMonth, getMonthStartOffset, toDateKey } from '../../utils';
import { AppEvent } from '../../types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EVENT_COLORS = [
  { bg: 'bg-[#EAE4F8]', text: 'text-[#6A4BB3]' },
  { bg: 'bg-[#E4F8EA]', text: 'text-[#2B7344]' },
  { bg: 'bg-[#F8EAE4]', text: 'text-[#A65B32]' },
];

interface CalendarCellProps {
  day: Date | null;
  isToday: boolean;
  isSelected: boolean;
  dayIndex: number;
  showWeekends: boolean;
  darkMode: boolean;
  daySlots: (AppEvent | null)[];
  onPress: (day: Date) => void;
}

const CalendarCell = memo(({ day, isToday, isSelected, dayIndex, showWeekends, darkMode, daySlots, onPress }: CalendarCellProps) => {
  const scale = useSharedValue<number>(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    if (day) {
      onPress(day);
    }
  };

  // ✅ WIRED: Dynamic border color calculation based on theme tokens
  const cellBorderColor = darkMode ? 'border-slate-700/40' : 'border-gray-200/30';
  const lastBorderIndex = showWeekends ? 6 : 4;

  if (!day) {
    return <View className={`flex-1 min-h-[90px] border-r ${dayIndex === lastBorderIndex ? 'border-r-0' : cellBorderColor}`} />;
  }

  const currentKey = toDateKey(day);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      className={`flex-1 min-h-[90px] border-r ${
        dayIndex === lastBorderIndex ? 'border-r-0' : cellBorderColor
      }`}
    >
      <Animated.View
        style={[
          animatedStyle,
          isSelected ? {
            shadowColor: '#977DDF',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          } : {}
        ]}
        className={`flex-1 w-full pt-2 pb-1 ${
          isSelected ? (darkMode ? 'bg-purple-950/40' : 'bg-purple-50/60') : ''
        }`}
      >
        {/* DATE LABEL */}
        <View className="items-center mb-1">
          <View className={`w-5 h-5 items-center justify-center rounded-full ${isToday ? 'bg-[#977DDF]' : ''}`}>
            <Text
              className={`text-xs ${
                isToday
                  ? 'text-white font-bold'
                  : isSelected
                  ? 'text-[#977DDF] font-bold'
                  : (darkMode ? 'text-slate-300 font-medium' : 'text-gray-700 font-medium')
              }`}
            >
              {day.getDate()}
            </Text>
          </View>
        </View>

        {/* TIMELINE SLOTS LAYOUT */}
        <View className="gap-[3px] mt-1 w-full">
          {daySlots.map((ev, slotIdx) => {
            if (!ev) {
              return <View key={`empty-slot-${slotIdx}`} className="h-[16px]" />;
            }

            const color = EVENT_COLORS[slotIdx % EVENT_COLORS.length];
            const evStartKey = toDateKey(new Date(ev.startDate));
            const evEndKey = ev.endDate ? toDateKey(new Date(ev.endDate)) : evStartKey;

            const isLeftEdge = currentKey === evStartKey || dayIndex === 0;
            const isRightEdge = currentKey === evEndKey || dayIndex === lastBorderIndex;

            return (
              <View
                key={`slot-${slotIdx}-${ev.id}`}
                className={`${color.bg} h-[16px] justify-center px-1
                  ${isLeftEdge ? 'rounded-l-md ml-1 pl-1.5' : 'ml-0 rounded-l-none'} 
                  ${isRightEdge ? 'rounded-r-md mr-1' : 'mr-0 rounded-r-none'}
                `}
              >
                {(isLeftEdge || dayIndex === 0) && (
                  <Text 
                    className={`${color.text} text-[9px] font-bold`} 
                    style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                    numberOfLines={1}
                  >
                    {ev.title || 'Event'}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

interface MonthGridProps {
  year: number;
  month: number;
  selectedKey: string;
  allEvents: AppEvent[];
  showWeekends: boolean;
  darkMode: boolean;
  onSelectDate: (date: Date) => void;
}

const MonthGrid = memo(({ year, month, selectedKey, allEvents, showWeekends, darkMode, onSelectDate }: MonthGridProps) => {
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const weeks = useMemo(() => {
    const days = getDaysInMonth(year, month);
    const offset = getMonthStartOffset(year, month);
    const cells: (Date | null)[] = [...Array(offset).fill(null), ...days];
    while (cells.length % 7 !== 0) cells.push(null);
    const chunked: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      chunked.push(cells.slice(i, i + 7));
    }
    return chunked;
  }, [year, month]);

  const computeWeekLayoutSlots = useCallback((weekDays: (Date | null)[]) => {
    const uniqueEventsMap = new Map<string, AppEvent>();
    weekDays.forEach(day => {
      if (!day) return;
      const dayKey = toDateKey(day);
      allEvents.forEach(ev => {
        const startK = toDateKey(new Date(ev.startDate));
        const endK = ev.endDate ? toDateKey(new Date(ev.endDate)) : startK;
        if (dayKey >= startK && dayKey <= endK) {
          uniqueEventsMap.set(ev.id, ev);
        }
      });
    });

    const weekEvents = Array.from(uniqueEventsMap.values());

    weekEvents.sort((a, b) => {
      const aLen = (a.endDate ? new Date(a.endDate).getTime() : 0) - new Date(a.startDate).getTime();
      const bLen = (b.endDate ? new Date(b.endDate).getTime() : 0) - new Date(b.startDate).getTime();
      if (aLen !== bLen) return bLen - aLen;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // ✅ ADJUSTED: Sizing tracks context matching structural requirements 
    const maxCols = showWeekends ? 7 : 5;
    const weekSlotsData: (AppEvent | null)[][] = Array(maxCols).fill(null).map(() => Array(3).fill(null));

    weekEvents.forEach(event => {
      const startK = toDateKey(new Date(event.startDate));
      const endK = event.endDate ? toDateKey(new Date(event.endDate)) : startK;

      const activeDayIndices: number[] = [];
      weekDays.forEach((day, idx) => {
        if (day) {
          const dayK = toDateKey(day);
          if (dayK >= startK && dayK <= endK) activeDayIndices.push(idx);
        }
      });

      if (activeDayIndices.length === 0) return;

      let assignedTrackIndex = -1;
      for (let trackIdx = 0; trackIdx < 3; trackIdx++) {
        const isTrackClear = activeDayIndices.every(dayIdx => weekSlotsData[dayIdx][trackIdx] === null);
        if (isTrackClear) {
          assignedTrackIndex = trackIdx;
          break;
        }
      }

      if (assignedTrackIndex !== -1) {
        activeDayIndices.forEach(dayIdx => {
          weekSlotsData[dayIdx][assignedTrackIndex] = event;
        });
      }
    });

    return weekSlotsData;
  }, [allEvents, showWeekends]);

  const gridBorderColor = darkMode ? 'border-slate-700/50' : 'border-gray-200/40';

  return (
    <View className={`w-full border ${gridBorderColor} rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-900/40' : 'bg-white/70'}`}>
      {weeks.map((week, weekIndex) => {
        // ✅ WIRED: Pre-filters weekend arrays prior to calculation execution loops
        const filteredWeekDays = showWeekends ? week : week.slice(0, 5);
        const weekLayoutSlots = computeWeekLayoutSlots(filteredWeekDays);

        return (
          <View
            key={`week-${year}-${month}-${weekIndex}`}
            className={`flex-row w-full justify-between items-start ${
              weekIndex !== weeks.length - 1 ? `border-b ${darkMode ? 'border-slate-700/40' : 'border-gray-200/40'}` : ''
            }`}
          >
            {filteredWeekDays.map((day, dayIndex) => {
              const key = day ? toDateKey(day) : `empty-${weekIndex}-${dayIndex}`;
              return (
                <CalendarCell
                  key={key}
                  day={day}
                  dayIndex={dayIndex}
                  showWeekends={showWeekends}
                  darkMode={darkMode}
                  daySlots={weekLayoutSlots[dayIndex]}
                  isToday={key === todayKey}
                  isSelected={key === selectedKey}
                  onPress={onSelectDate}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
});

// ✅ WIRED: Updated props interface mappings contract
interface InteractiveCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getForDate: (key: string) => AppEvent[];
  showWeekends: boolean;
  darkMode: boolean;
}

export default function InteractiveCalendar({ selectedDate, onSelectDate, getForDate, showWeekends, darkMode }: InteractiveCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());

  const selectedKey = selectedDate ? toDateKey(selectedDate) : toDateKey(today);

  const allEventsArray = useMemo(() => {
    const days = getDaysInMonth(viewYear, viewMonth);
    const uniqueMap = new Map<string, AppEvent>();
    days.forEach((d: Date) => {
      const items = getForDate(toDateKey(d));
      items.forEach(ev => uniqueMap.set(ev.id, ev));
    });
    return Array.from(uniqueMap.values());
  }, [viewYear, viewMonth, getForDate]);

  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else { setViewMonth((m) => m + 1); }
  };

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else { setViewMonth((m) => m - 1); }
  };

  // ✅ WIRED: Switches calendar label lengths dynamically
  const labelsToRender = showWeekends ? DAY_LABELS : DAY_LABELS.slice(0, 5);

  return (
    <View className="w-full">
      {/* HEADER CONTROL CONSOLE */}
      <View className="flex-row items-center justify-between mb-5 px-4">
        <TouchableOpacity onPress={goPrev} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="chevron-left" size={22} color={darkMode ? '#94A3B8' : '#4A4A4A'} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold tracking-widest uppercase ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={goNext} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="chevron-right" size={22} color={darkMode ? '#94A3B8' : '#4A4A4A'} />
        </TouchableOpacity>
      </View>

      {/* DAYS OF WEEK LEGEND ROW */}
      <View className="flex-row w-full justify-between pb-2 px-1">
        {labelsToRender.map((label, i) => (
          <Text key={i} className="flex-1 text-center text-[10px] font-bold text-gray-400">
            {label}
          </Text>
        ))}
      </View>

      {/* MAIN MONTH SLOTS LAYER COMPONENT */}
      <View className="px-1">
        <MonthGrid
          year={viewYear}
          month={viewMonth}
          selectedKey={selectedKey}
          allEvents={allEventsArray}
          showWeekends={showWeekends}
          darkMode={darkMode}
          onSelectDate={onSelectDate}
        />
      </View>
    </View>
  );
}