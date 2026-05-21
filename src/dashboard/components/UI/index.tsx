import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle, Switch } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

// ─── EmptyState ──────────────────────────────────────────────────────────
interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export const EmptyState = ({ emoji, title, subtitle }: EmptyStateProps) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ─── SectionCard ─────────────────────────────────────────────────────────
interface SectionCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const SectionCard = ({ children, style }: SectionCardProps) => (
  <View style={[styles.sectionCard, style]}>
    {children}
  </View>
);

// ─── GlassCard ───────────────────────────────────────────────────────────
export const GlassCard = ({ children, style }: SectionCardProps) => (
  <View style={[styles.glassCard, style]}>
    {children}
  </View>
);

// ─── AnimatedPressable ───────────────────────────────────────────────────
export const AnimatedPressable = ({ children, onPress, style, ...props }: TouchableOpacityProps) => {
  const scale = useSharedValue(1);
  
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <TouchableOpacity
      onPressIn={() => scale.value = withSpring(0.95)}
      onPressOut={() => scale.value = withSpring(1)}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      <Animated.View style={[style, animStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Divider ─────────────────────────────────────────────────────────────
export const Divider = ({ style }: { style?: ViewStyle | ViewStyle[] }) => (
  <View style={[styles.divider, style]} />
);

// ─── ToggleSwitch ────────────────────────────────────────────────────────
interface ToggleSwitchProps {
  value: boolean;
  onToggle: (val: boolean) => void;
}

export const ToggleSwitch = ({ value, onToggle }: ToggleSwitchProps) => (
  <Switch
    value={value}
    onValueChange={onToggle}
    trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
    thumbColor={value ? COLORS.primary : '#f4f3f4'}
  />
);

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    minHeight: 120,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  }
});