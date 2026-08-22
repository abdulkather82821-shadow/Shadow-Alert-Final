import { View, StyleSheet, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import { formatMinutesShort } from '@/lib/utils';

type Segment = {
  label: string;
  minutes: number;
  color: string;
};

type Props = {
  segments: Segment[];
  size?: number;
};

export function DonutChart({ segments, size = 140 }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const total = segments.reduce((sum, s) => sum + s.minutes, 0);
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;
  const arcs = segments.map((seg, i) => {
    if (total === 0) return null;
    const fraction = seg.minutes / total;
    const dashLength = fraction * circumference;
    const arc = (
      <View
        key={i}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: seg.color,
          borderStyle: 'dashed',
        }}
      />
      );
    offset += dashLength;
    return arc;
  });

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[styles.emptyRing, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth }]} />
        <Text style={styles.centerValue}>0m</Text>
        <Text style={styles.centerLabel}>No usage</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: colors.neutral[200] }]} />
      {segments.map((seg, i) => {
        const fraction = seg.minutes / total;
        const angle = fraction * 360;
        const prevAngle = segments.slice(0, i).reduce((acc, s) => acc + (s.minutes / total) * 360, 0);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: seg.color,
              transform: [{ rotate: `${prevAngle - 90}deg` }],
              overflow: 'hidden',
            }}
          >
            <View style={{
              width: '100%',
              height: '50%',
              backgroundColor: 'transparent',
            }} />
          </View>
        );
      })}
      <View style={styles.centerContent}>
        <Text style={styles.centerValue}>{formatMinutesShort(total)}</Text>
        <Text style={styles.centerLabel}>Total</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    ring: {
      position: 'absolute',
    },
    emptyRing: {
      borderColor: colors.neutral[200],
      position: 'absolute',
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    centerValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
    },
    centerLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[400],
      marginTop: 2,
    },
  });
}
