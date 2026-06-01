import React, { useMemo, useState, memo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, withTiming } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { buildContributionGrid, getContributionLevel, formatDateLong } from '../../utils';
import { ContributionCell, ContributionsMap } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');

const CELL_SIZE = 12; 
const CELL_GAP = 4;
const COL_WIDTH = CELL_SIZE + CELL_GAP;

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const BRAND_LEVEL_COLORS = [
  '#EBE8F4', 
  '#D3C6F9', 
  '#B29AFA', 
  '#8B64F6', 
  '#5C25EB', 
];

interface GraphCellProps {
  cell: ContributionCell;
  onPress: (cell: ContributionCell) => void;
  isSelected: boolean;
}

const GraphCell = memo(({ cell, onPress, isSelected }: GraphCellProps) => {
  const scale = useSharedValue<number>(1);
  const ringOpacity = useSharedValue<number>(0);
  const level = getContributionLevel(cell.count);

  useEffect(() => {
    ringOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const handlePress = () => {
    scale.value = withSpring(0.8, { damping: 12, stiffness: 200 }, () => {
      scale.value = withSpring(1);
    });
    onPress(cell);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: isSelected ? withSpring(1.4) : 1 }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.cellWrapper}>
      <Animated.View style={[styles.selectionRing, { borderColor: BRAND_LEVEL_COLORS[level || 1] }, ringStyle]} />
      
      <Animated.View
        style={[
          styles.cell,
          { backgroundColor: BRAND_LEVEL_COLORS[level] },
          animStyle,
        ]}
      />
    </TouchableOpacity>
  );
});

const Tooltip = ({ cell }: { cell: ContributionCell | null }) => {
  if (!cell) return null;
  const count = cell.count;
  const label = count === 0
    ? 'No tasks'
    : count === 1
    ? '1 task'
    : `${count} tasks`;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.tooltip}>
      <Text style={styles.tooltipText}>
        <Text style={styles.tooltipBold}>{label}</Text> · {formatDateLong(cell.date)}
      </Text>
    </Animated.View>
  );
};

const Legend = () => (
  <View style={styles.legend}>
    <Text style={styles.legendLabel}>Less</Text>
    {BRAND_LEVEL_COLORS.map((c, i) => (
      <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
    ))}
    <Text style={styles.legendLabel}>More</Text>
  </View>
);

interface ContributionGraphProps {
  contributions: ContributionsMap;
}

const ContributionGraph = ({ contributions }: ContributionGraphProps) => {
  const [selectedCell, setSelectedCell] = useState<ContributionCell | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);

  const baseWeeks = useMemo(
    () => buildContributionGrid(contributions || {}),
    [contributions]
  );

  // 1. TRIPLE THE DATA TO CREATE A SEAMLESS LOOP
  const displayWeeks = useMemo(() => {
    if (!baseWeeks.length) return [];
    return [...baseWeeks, ...baseWeeks, ...baseWeeks];
  }, [baseWeeks]);

  const exactMonthLabels = useMemo(() => {
    const labels: { label: string; columnIndex: number }[] = [];
    let lastSeenMonth = -1;

    displayWeeks.forEach((week, columnIndex) => {
      const firstDayCell = week.find((cell) => cell && cell.date);
      if (!firstDayCell) return;

      const dateObj = new Date(firstDayCell.date);
      const monthIndex = dateObj.getMonth();

      if (monthIndex !== lastSeenMonth) {
        labels.push({
          label: MONTH_NAMES[monthIndex],
          columnIndex: columnIndex,
        });
        lastSeenMonth = monthIndex;
      }
    });

    return labels;
  }, [displayWeeks]);

  // 2. SCROLL TO THE MIDDLE LOOP ON LOAD
  useEffect(() => {
    if (displayWeeks.length > 0 && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      
      const timeoutId = setTimeout(() => {
        // Calculate the exact pixel width of one full base year
        const singleYearWidth = baseWeeks.length * COL_WIDTH;
        
        // Instantly place the user at the start of the middle "loop"
        // so they have a full year to scroll left, and a full year to scroll right
        scrollViewRef.current?.scrollTo({ x: singleYearWidth, animated: false }); 
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [displayWeeks.length, baseWeeks.length]);

  const handleCellPress = (cell: ContributionCell) => {
    setSelectedCell((prev) => (prev?.key === cell.key ? null : cell));
  };

  const totalCompleted = useMemo(
    () => Object.values(contributions || {}).reduce((sum, v) => sum + v, 0),
    [contributions]
  );

  return (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerSub}>{totalCompleted} tasks completed this year</Text>
        </View>
        <Legend />
      </View>

      <View style={styles.tooltipContainer}>
        {selectedCell && <Tooltip cell={selectedCell} />}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.graphContent}
        style={styles.graphScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        <View>
          <View style={styles.monthRow}>
            {exactMonthLabels.map(({ label, columnIndex }, i) => (
              <Text
                key={`month-${label}-${columnIndex}-${i}`}
                style={[
                  styles.monthLabel,
                  { position: 'absolute', left: columnIndex * COL_WIDTH }
                ]}
              >
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {displayWeeks.map((week: ContributionCell[], wi: number) => (
              <View key={`col-${wi}`} style={styles.weekCol}>
                {week.map((cell) => (
                  <GraphCell
                    key={`cell-${wi}-${cell.key}`}
                    cell={cell}
                    onPress={handleCellPress}
                    isSelected={selectedCell?.key === cell.key}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    marginBottom: SPACING.sm 
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: COLORS.textLight, marginTop: 4, fontWeight: '500' },
  
  graphScroll: { marginHorizontal: -SPACING.lg },
  graphContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.xs },
  
  monthRow: { flexDirection: 'row', height: 18, marginBottom: 6 },
  monthLabelContainer: { justifyContent: 'center', alignItems: 'flex-start' },
  monthLabel: { fontSize: 10, color: '#A09DB0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  grid: { flexDirection: 'row', gap: CELL_GAP },
  weekCol: { gap: CELL_GAP },
  
  cellWrapper: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: { 
    width: CELL_SIZE, 
    height: CELL_SIZE, 
    borderRadius: CELL_SIZE / 2, 
  },
  selectionRing: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  
  tooltipContainer: {
    height: 36, 
    justifyContent: 'center',
  },
  tooltip: { 
    backgroundColor: '#F4F0FE', 
    borderRadius: RADIUS.lg, 
    paddingHorizontal: SPACING.md, 
    paddingVertical: 6, 
    alignSelf: 'flex-start',
  },
  tooltipText: { fontSize: 12, color: '#5C25EB', fontWeight: '500' },
  tooltipBold: { fontWeight: '700' },
  
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendCell: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600', marginHorizontal: 2 },
});

export default ContributionGraph;