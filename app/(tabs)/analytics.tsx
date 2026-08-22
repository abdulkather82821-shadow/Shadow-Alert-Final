import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import {
  getWeeklyComparison,
  getDailyUsageForWeek,
  getAppUsageSummaries,
  getLimitPerformance,
  getTotalBlockEvents,
  getAppUsageByCategory,
} from '@/lib/data';
import { formatMinutes } from '@/lib/utils';
import type { WeeklyComparison, DayUsage, AppUsageSummary } from '@/types/database';
import { BarChart } from '@/components/BarChart';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [weeklyComp, setWeeklyComp] = useState<WeeklyComparison | null>(null);
  const [weekData, setWeekData] = useState<DayUsage[]>([]);
  const [summaries, setSummaries] = useState<AppUsageSummary[]>([]);
  const [limitPerf, setLimitPerf] = useState<{ within: number; reached: number; exceeded: number }>({ within: 0, reached: 0, exceeded: 0 });
  const [blockCount, setBlockCount] = useState(0);
  const [categoryData, setCategoryData] = useState<{ category: string; minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [comp, week, s, perf, blocks, cats] = await Promise.all([
        getWeeklyComparison(),
        getDailyUsageForWeek(0),
        getAppUsageSummaries(),
        getLimitPerformance(),
        getTotalBlockEvents(),
        getAppUsageByCategory(),
      ]);
      setWeeklyComp(comp);
      setWeekData(week);
      setSummaries(s);
      setLimitPerf(perf);
      setBlockCount(blocks);
      setCategoryData(cats);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalToday = weekData.reduce((sum, d) => sum + d.totalMinutes, 0);

  if (summaries.length === 0 && totalToday === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your screen time insights</Text>
        </View>
        <EmptyState
          icon="📊"
          title="No Analytics Yet"
          message="Set up monitored apps and start using them to see your usage patterns, weekly trends, and limit performance here."
        />
      </SafeAreaView>
    );
  }

  const trendColor = weeklyComp?.trend === 'down' ? colors.success.main :
                      weeklyComp?.trend === 'up' ? colors.error.main :
                      colors.neutral[500];
  const trendIcon = weeklyComp?.trend === 'down' ? <TrendingDown size={18} color={trendColor} strokeWidth={2} /> :
                    weeklyComp?.trend === 'up' ? <TrendingUp size={18} color={trendColor} strokeWidth={2} /> :
                    <Minus size={18} color={trendColor} strokeWidth={2} />;
  const trendMessage = weeklyComp?.trend === 'down' ? 'Great! Your screen time decreased this week.' :
                        weeklyComp?.trend === 'up' ? 'Your screen time increased this week. Consider adjusting your limits.' :
                        'Your screen time stayed about the same this week.';

  const maxCatMinutes = Math.max(...categoryData.map(c => c.minutes), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your screen time insights</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
      >
        {weeklyComp && (
          <View style={styles.weeklyCard}>
            <Text style={styles.cardTitle}>Weekly Screen Time</Text>
            <View style={styles.weeklyCompare}>
              <View style={styles.weeklyCol}>
                <Text style={styles.weeklyColLabel}>This Week</Text>
                <Text style={styles.weeklyColValue}>{formatMinutes(weeklyComp.thisWeekMinutes)}</Text>
              </View>
              <View style={styles.weeklyCol}>
                <Text style={styles.weeklyColLabel}>Last Week</Text>
                <Text style={styles.weeklyColValue}>{formatMinutes(weeklyComp.lastWeekMinutes)}</Text>
              </View>
              <View style={styles.weeklyCol}>
                <Text style={styles.weeklyColLabel}>Change</Text>
                <View style={styles.trendRow}>
                  {trendIcon}
                  <Text style={[styles.trendText, { color: trendColor }]}>
                    {weeklyComp.percentChange > 0 ? '+' : ''}{Math.abs(weeklyComp.percentChange).toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.trendMessage}>{trendMessage}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Usage (This Week)</Text>
          <BarChart data={weekData} />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Monitored Apps"
            value={String(summaries.length)}
            icon="📱"
            accentColor={colors.primary.main}
          />
          <View style={styles.gap} />
          <StatCard
            label="Blocked Sessions"
            value={String(blockCount)}
            icon="🛡️"
            accentColor={colors.error.main}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Limit Performance</Text>
          <View style={styles.limitPerfRow}>
            <View style={styles.limitPerfItem}>
              <View style={[styles.limitPerfDot, { backgroundColor: colors.success.main }]} />
              <Text style={styles.limitPerfValue}>{limitPerf.within}</Text>
              <Text style={styles.limitPerfLabel}>Within</Text>
            </View>
            <View style={styles.limitPerfItem}>
              <View style={[styles.limitPerfDot, { backgroundColor: colors.warning.main }]} />
              <Text style={styles.limitPerfValue}>{limitPerf.reached}</Text>
              <Text style={styles.limitPerfLabel}>Reached</Text>
            </View>
            <View style={styles.limitPerfItem}>
              <View style={[styles.limitPerfDot, { backgroundColor: colors.error.main }]} />
              <Text style={styles.limitPerfValue}>{limitPerf.exceeded}</Text>
              <Text style={styles.limitPerfLabel}>Exceeded</Text>
            </View>
          </View>
        </View>

        {categoryData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Usage by Category</Text>
            {categoryData.map((c, i) => (
              <View key={i} style={styles.catRow}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{c.category}</Text>
                  <Text style={styles.catMinutes}>{formatMinutes(c.minutes)}</Text>
                </View>
                <View style={styles.catBarTrack}>
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        width: `${(c.minutes / maxCatMinutes) * 100}%`,
                        backgroundColor: colors.primary.main,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {summaries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Most Used Apps Today</Text>
            {[...summaries]
              .sort((a, b) => b.todayUsageMinutes - a.todayUsageMinutes)
              .slice(0, 5)
              .map((s, i) => (
                <View key={s.app.package_name} style={styles.topAppRow}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <Text style={styles.topAppIcon}>{s.app.app_icon}</Text>
                  <View style={styles.topAppInfo}>
                    <Text style={styles.topAppName} numberOfLines={1}>{s.app.app_name}</Text>
                    <Text style={styles.topAppUsage}>{formatMinutes(s.todayUsageMinutes)} / {formatMinutes(s.app.limit_minutes)}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral.background,
    },
    header: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    title: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
    },
    subtitle: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[400],
    },
    weeklyCard: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    card: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    cardTitle: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
      marginBottom: Spacing.md,
    },
    weeklyCompare: {
      flexDirection: 'row',
      marginBottom: Spacing.sm,
    },
    weeklyCol: {
      flex: 1,
    },
    weeklyColLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
    },
    weeklyColValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
      marginTop: 2,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    trendText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
    },
    trendMessage: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[600],
      lineHeight: 20,
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.neutral[200],
    },
    statsRow: {
      flexDirection: 'row',
      marginBottom: Spacing.md,
    },
    gap: {
      width: Spacing.sm,
    },
    limitPerfRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    limitPerfItem: {
      alignItems: 'center',
    },
    limitPerfDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginBottom: Spacing.xs,
    },
    limitPerfValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
    },
    limitPerfLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginTop: 2,
    },
    catRow: {
      marginBottom: Spacing.sm,
    },
    catInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    catName: {
      fontFamily: Typography.fontFamilyMedium,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[700],
    },
    catMinutes: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[900],
    },
    catBarTrack: {
      height: 8,
      backgroundColor: colors.neutral[200],
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    catBarFill: {
      height: 8,
      borderRadius: Radius.full,
    },
    topAppRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[100],
    },
    rank: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[300],
      width: 24,
    },
    topAppIcon: {
      fontSize: 22,
      marginRight: Spacing.sm,
    },
    topAppInfo: {
      flex: 1,
    },
    topAppName: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[900],
    },
    topAppUsage: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginTop: 2,
    },
  });
}
