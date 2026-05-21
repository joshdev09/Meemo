import React, { useState, memo, useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence, 
  Easing,
  runOnJS 
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
// Assuming these exist in your project
import { getDaysInMonth, getMonthStartOffset, toDateKey } from '../../utils';
import { AppEvent } from '../../types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Soft, theme-friendly colors for the event pills
const EVENT_COLORS = [
  { bg: 'bg-[#EAE4F8]', text: 'text-[#6A4BB3]' }, // Soft Purple
  { bg: 'bg-[#E4F8EA]', text: 'text-[#2B7344]' }, // Soft Green
  { bg: 'bg-[#F8EAE4]', text: 'text-[#A65B32]' }, // Soft Orange
];

interface CalendarCellProps {
  day: Date | null;
  isToday: boolean;
  isSelected: boolean;
  events: AppEvent[]; // Changed from boolean to the actual array of events
  onPress: (day: Date) => void;
}

const CalendarCell = memo(({ day, isToday, isSelected, events, onPress }: CalendarCellProps) => {
  const scale = useSharedValue<number>(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // A gentler scale effect now that the cells are larger
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    
    if (day) {
      requestAnimationFrame(() => {
        onPress(day);
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={day ? handlePress : undefined}
      activeOpacity={0.7}
      className="flex-1 min-h-[85px] p-[2px]" // Allow cells to fill width and have height for pills
    >
      <Animated.View
        style={animatedStyle}
        className={`flex-1 w-full rounded-xl p-1 pt-2 ${
          isSelected ? 'border border-gray-400 bg-white/50 shadow-sm' : '' // The outline from your screenshot
        }`}
      >
        {/* Date Number */}
        <View className="items-center mb-1">
          <Text
            className={`text-xs ${
              isSelected 
                ? 'text-gray-900 font-bold' 
                : isToday 
                  ? 'text-[#977DDF] font-bold' 
                  : 'text-gray-700'
            }`}
          >
            {day ? day.getDate() : ''}
          </Text>
        </View>
        
        {/* Event Pills */}
        <View className="gap-[2px]">
          {events.slice(0, 3).map((ev, i) => {
            // Cycle through the soft colors
            const color = EVENT_COLORS[i % EVENT_COLORS.length];
            return (
              <View key={i} className={`${color.bg} rounded-[4px] px-1 py-[3px]`}>
                <Text className={`${color.text} text-[9px] font-medium leading-tight`} numberOfLines={1}>
                  {ev.title || 'Event'}
                </Text>
              </View>
            );
          })}
          {/* Indicator if there are too many events to fit */}
          {events.length > 3 && (
            <Text className="text-[9px] text-gray-500 text-center font-medium mt-[2px]">
              +{events.length - 3} more
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

interface MonthGridProps {
  year: number;
  month: number;
  selectedKey: string;
  eventMap: Record<string, AppEvent[]>;
  onSelectDate: (date: Date) => void;
}

const MonthGrid = memo(({ year, month, selectedKey, eventMap, onSelectDate }: MonthGridProps) => {
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

  return (
    <View className="w-full">
      {weeks.map((week, weekIndex) => (
        <View 
          key={`week-${year}-${month}-${weekIndex}`} 
          // Replaced hard padding with flex row layout
          className={`flex-row w-full justify-between items-start ${
            weekIndex !== weeks.length - 1 ? 'border-b border-gray-300/50' : ''
          }`} 
        >
          {week.map((day, dayIndex) => {
            if (!day) return <View key={`empty-${weekIndex}-${dayIndex}`} className="flex-1" />;
            
            const key = toDateKey(day);
            return (
              <CalendarCell
                key={key}
                day={day}
                isToday={key === todayKey}
                isSelected={key === selectedKey}
                events={eventMap[key] || []} // Passing the array instead of a boolean
                onPress={onSelectDate}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

interface InteractiveCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getForDate: (key: string) => AppEvent[];
}

const InteractiveCalendar = ({ selectedDate, onSelectDate, getForDate }: InteractiveCalendarProps) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());

  const slideX = useSharedValue<number>(0);
  const opacity = useSharedValue<number>(1);

  const selectedKey = selectedDate ? toDateKey(selectedDate) : toDateKey(today);

  const onSelectDateRef = useRef(onSelectDate);
  onSelectDateRef.current = onSelectDate;
  
  const getForDateRef = useRef(getForDate);
  getForDateRef.current = getForDate;

  const handleSelectDate = useCallback((date: Date) => {
    onSelectDateRef.current(date);
  }, []);

  const eventMap = useMemo(() => {
    const map: Record<string, AppEvent[]> = {};
    const days = getDaysInMonth(viewYear, viewMonth);
    days.forEach((d: Date) => {
      const key = toDateKey(d);
      map[key] = getForDateRef.current(key);
    });
    return map;
  }, [viewYear, viewMonth, getForDate]); // Added getForDate dependency so it redraws if new events are added

  const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
    const toX = direction === 'next' ? -30 : 30;
    slideX.value = withTiming(toX, { duration: 150, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 150 }, (isFinished) => {
      if (isFinished) {
        runOnJS(callback)(); 
        slideX.value = direction === 'next' ? 30 : -30;
        slideX.value = withSpring(0, { damping: 18, stiffness: 220 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    });
  };

  const goNext = () => animateTransition('next', () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } 
    else { setViewMonth((m) => m + 1); }
  });

  const goPrev = () => animateTransition('prev', () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } 
    else { setViewMonth((m) => m - 1); }
  });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="w-full">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-6 px-4">
        <TouchableOpacity onPress={goPrev} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-black tracking-widest uppercase">
          {MONTH_NAMES[viewMonth]}
        </Text>
        
        <TouchableOpacity onPress={goNext} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* DAY LABELS */}
      <View className="flex-row w-full justify-between border-b border-gray-400 pb-2 mb-2">
        {DAY_LABELS.map((label, i) => (
          <Text key={i} className="flex-1 text-center text-[10px] font-bold text-gray-700">
            {label}
          </Text>
        ))}
      </View>

      {/* CALENDAR GRID */}
      <Animated.View style={contentStyle}>
        <MonthGrid 
          year={viewYear} 
          month={viewMonth} 
          selectedKey={selectedKey} 
          eventMap={eventMap} 
          onSelectDate={handleSelectDate} 
        />
      </Animated.View>
    </View>
  );
};

export default InteractiveCalendar;