import { View, StyleSheet } from 'react-native';
import { Radius, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';

type Props = {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({ progress, color, trackColor, height = 8 }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const pct = Math.max(0, Math.min(progress, 100));
  const barColor = color || colors.primary.main;
  const bgColor = trackColor || colors.neutral[200];

  return (
    <View style={[styles.track, { height, backgroundColor: bgColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%`,
            backgroundColor: barColor,
            height,
          },
        ]}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    track: {
      borderRadius: Radius.full,
      overflow: 'hidden',
      width: '100%',
    },
    fill: {
      borderRadius: Radius.full,
    },
  });
}
