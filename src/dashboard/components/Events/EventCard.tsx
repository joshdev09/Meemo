import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatTime, formatDateShort } from '../../utils';
import { AppEvent } from '../../types';

interface EventCardProps {
  event: AppEvent;
  onEdit?: (event: AppEvent) => void;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  compact?: boolean;
}

const EventCard = memo(({ event, onEdit, onDelete, onToggleComplete, compact = false }: EventCardProps) => {
  const opacity = useSharedValue<number>(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const color = event.color || COLORS.primary;
  const isCompleted = event.completed;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutUp.springify()}
      style={[styles.card, animatedStyle, { borderLeftColor: color }]}
    >
      <View style={[styles.accent, { backgroundColor: color }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            {event.emoji ? <Text style={styles.emoji}>{event.emoji}</Text> : null}
            <Text style={[styles.title, isCompleted && styles.titleDone]} numberOfLines={1}>
              {event.title || 'Untitled'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onToggleComplete?.(event.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.checkBtn, isCompleted && { backgroundColor: COLORS.success }]}
            >
              <Feather name="check" size={12} color={isCompleted ? '#FFF' : COLORS.textLight} />
            </TouchableOpacity>

            {!compact && (
              <>
                <TouchableOpacity onPress={() => onEdit?.(event)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.iconBtn}>
                  <Feather name="edit-2" size={13} color={COLORS.textLight} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete?.(event.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.iconBtn}>
                  <Feather name="trash-2" size={13} color={COLORS.danger} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {!compact && (
          <View style={styles.metaRow}>
            <Feather name="calendar" size={11} color={COLORS.textLight} />
            <Text style={styles.meta}>
              {formatDateShort(event.startDate)}
              {event.endDate && ` → ${formatDateShort(event.endDate)}`}
            </Text>
            {!event.allDay && event.startTime && (
              <>
                <Feather name="clock" size={11} color={COLORS.textLight} style={{ marginLeft: 8 }} />
                <Text style={styles.meta}>{event.startTime}</Text>
              </>
            )}
            {event.allDay && (
              <View style={styles.allDayBadge}>
                <Text style={styles.allDayText}>All day</Text>
              </View>
            )}
          </View>
        )}

        {!compact && event.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({ /* Extracted as normal */
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOWS.sm },
  accent: { width: 4 },
  content: { flex: 1, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, paddingLeft: SPACING.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  emoji: { fontSize: 16 },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, flex: 1 },
  titleDone: { textDecorationLine: 'line-through', color: COLORS.textLight },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  checkBtn: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  iconBtn: { padding: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },
  allDayBadge: { backgroundColor: COLORS.primaryPale, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, marginLeft: 6 },
  allDayText: { fontSize: 10, color: COLORS.primaryDark, fontWeight: '600' },
  desc: { fontSize: 12, color: COLORS.textLight, marginTop: 4, lineHeight: 16 },
});

export default EventCard;