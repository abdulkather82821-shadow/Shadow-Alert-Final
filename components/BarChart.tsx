import { View, StyleSheet, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import { formatMinutesShort } from '@/lib/utils';
import type { DayUsage } from '@/types/database';

type Props = {
  data: DayUsage[];
  maxMinutes?: number;
};

export function BarChart({ data, maxMinutes }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const max = maxMinutes || Math.max(...data.map(d => d.totalMinutes), 60);
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {data.map((d, i) => {
          const heightPct = max > 0 ? (d.totalMinutes / max) * 100 : 0;
          const isToday = d.date === today;
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPct, d.totalMinutes > 0 ? 4 : 0)}%`,
                      backgroundColor: isToday ? colors.primary.main : colors.primary[300],
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{d.dayName}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.xs,
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 160,
      width: '100%',
      gap: Spacing.xs,
    },
    chartRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '100%',
      gap: Spacing.xs,
    },
    barCol: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    barTrack: {
      width: '100%',
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    bar: {
      width: '70%',
      borderRadius: Radius.sm,
      minHeight: 2,
    },
    dayLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: 10,
      color: colors.neutral[400],
    },
    todayLabel: {
      fontFamily: Typography.fontFamilySemiBold,
      color: colors.primary.main,
    },
  });
}
