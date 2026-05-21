import React, { useMemo, useState, memo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { buildContributionGrid, getContributionLevel, getMonthLabels, formatDateLong } from '../../utils';
import { ContributionCell, ContributionsMap } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CELL_SIZE = 11;
const CELL_GAP = 3;
const COL_WIDTH = CELL_SIZE + CELL_GAP;

const LEVEL_COLORS = [
  COLORS.graphEmpty,
  COLORS.graphL1,
  COLORS.graphL2,
  COLORS.graphL3,
  COLORS.graphL4,
];

interface GraphCellProps {
  cell: ContributionCell;
  onPress: (cell: ContributionCell) => void;
  isSelected: boolean;
}

const GraphCell = memo(({ cell, onPress, isSelected }: GraphCellProps) => {
  const scale = useSharedValue<number>(1);
  const level = getContributionLevel(cell.count);

  const handlePress = () => {
    scale.value = withSpring(0.7, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    onPress(cell);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.cell,
          { backgroundColor: LEVEL_COLORS[level] },
          isSelected && styles.cellSelected,
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
    ? 'No tasks completed'
    : count === 1
    ? '1 task completed'
    : `${count} tasks completed`;

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.tooltip}>
      <Text style={styles.tooltipText}>
        {label} · {formatDateLong(cell.date)}
      </Text>
      <View style={styles.tooltipArrow} />
    </Animated.View>
  );
};

const Legend = () => (
  <View style={styles.legend}>
    <Text style={styles.legendLabel}>Less</Text>
    {LEVEL_COLORS.map((c, i) => (
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

  const weeks = useMemo(
    () => buildContributionGrid(contributions || {}),
    [contributions]
  );

  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  const handleCellPress = (cell: ContributionCell) => {
    setSelectedCell((prev) => (prev?.key === cell.key ? null : cell));
  };

  const totalCompleted = useMemo(
    () => Object.values(contributions || {}).reduce((sum, v) => sum + v, 0),
    [contributions]
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <Text style={styles.headerSub}>{totalCompleted} tasks completed this year</Text>
      </View>

      {selectedCell && <Tooltip cell={selectedCell} />}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.graphContent}
        style={styles.graphScroll}
      >
        <View>
          <View style={styles.monthRow}>
            {monthLabels.map(({ label, index }: { label: string, index: number }) => (
              <Text key={`${label}-${index}`} style={[styles.monthLabel, { left: index * COL_WIDTH }]}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {weeks.map((week: ContributionCell[], wi: number) => (
              <View key={wi} style={styles.weekCol}>
                {week.map((cell) => (
                  <GraphCell
                    key={cell.key}
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

      <Legend />
    </View>
  );
};

const styles = StyleSheet.create({ /* Keep styles precisely as they were */
  header: { marginBottom: SPACING.sm },
  headerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, letterSpacing: 0.2 },
  headerSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2, fontWeight: '500' },
  graphScroll: { marginHorizontal: -SPACING.lg },
  graphContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  monthRow: { flexDirection: 'row', height: 16, position: 'relative', marginBottom: 4 },
  monthLabel: { position: 'absolute', fontSize: 9, color: COLORS.textLight, fontWeight: '600', letterSpacing: 0.3 },
  grid: { flexDirection: 'row', gap: CELL_GAP },
  weekCol: { gap: CELL_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 2 },
  cellSelected: { borderWidth: 1.5, borderColor: COLORS.primaryDark },
  tooltip: { backgroundColor: COLORS.textDark, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.sm, alignSelf: 'flex-start', maxWidth: '100%' },
  tooltipText: { fontSize: 11, color: '#FFF', fontWeight: '500', lineHeight: 16 },
  tooltipArrow: { position: 'absolute', bottom: -5, left: 14, width: 10, height: 10, backgroundColor: COLORS.textDark, transform: [{ rotate: '45deg' }], borderRadius: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: SPACING.xs },
  legendCell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 2 },
  legendLabel: { fontSize: 9, color: COLORS.textLight, fontWeight: '500', marginHorizontal: 2 },
});

export default ContributionGraph;