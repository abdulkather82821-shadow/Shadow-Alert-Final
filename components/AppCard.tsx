import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import { ProgressBar } from './ProgressBar';
import { formatMinutes, getStatusLabel } from '@/lib/utils';
import type { AppUsageSummary } from '@/types/database';

type Props = {
  summary: AppUsageSummary;
  onPress?: () => void;
};

export function AppCard({ summary, onPress }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { app, todayUsageMinutes, remainingMinutes, progress, status } = summary;
  const statusColor =
    status === 'within' ? colors.success.main :
    status === 'warning' ? colors.warning.main :
    status === 'reached' ? colors.warning.dark :
    colors.error.main;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{app.app_icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.appName} numberOfLines={1}>{app.app_name}</Text>
          <Text style={styles.category}>{app.app_category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(status)}</Text>
        </View>
      </View>

      <View style={styles.usageRow}>
        <Text style={styles.usageText}>
          <Text style={styles.usageValue}>{formatMinutes(todayUsageMinutes)}</Text>
          <Text style={styles.usageLimit}> / {formatMinutes(app.limit_minutes)}</Text>
        </Text>
        {status === 'within' || status === 'warning' ? (
          <Text style={styles.remaining}>{formatMinutes(remainingMinutes)} remaining</Text>
        ) : (
          <Text style={[styles.remaining, { color: statusColor }]}>Limit reached</Text>
        )}
      </View>

      <ProgressBar progress={progress} color={statusColor} height={6} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    icon: {
      fontSize: 22,
    },
    info: {
      flex: 1,
    },
    appName: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
    },
    category: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
    },
    statusText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: 10,
    },
    usageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    usageText: {},
    usageValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
    },
    usageLimit: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[400],
    },
    remaining: {
      fontFamily: Typography.fontFamilyMedium,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
    },
  });
}
