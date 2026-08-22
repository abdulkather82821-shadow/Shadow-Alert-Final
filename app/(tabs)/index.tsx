import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { Spacing, Radius, Typography } from '@/lib/theme';
import { getGreeting, getFullDate, formatMinutes } from '@/lib/utils';
import { getAppUsageSummaries, getTodayTotalUsage, getWeeklyComparison } from '@/lib/data';
import { getDailyUsageForWeek } from '@/lib/data';
import type { AppUsageSummary, DayUsage, WeeklyComparison } from '@/types/database';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { BarChart } from '@/components/BarChart';
import { Plus, TrendingDown, TrendingUp, Minus, Clock } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [summaries, setSummaries] = useState<AppUsageSummary[]>([]);
  const [todayUsage, setTodayUsage] = useState(0);
  const [weekData, setWeekData] = useState<DayUsage[]>([]);
  const [weeklyComp, setWeeklyComp] = useState<WeeklyComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, today, week, comp] = await Promise.all([
        getAppUsageSummaries(),
        getTodayTotalUsage(),
        getDailyUsageForWeek(0),
        getWeeklyComparison(),
      ]);
      setSummaries(s);
      setTodayUsage(today);
      setWeekData(week);
      setWeeklyComp(comp);
    } catch (e) {
      console.error('Dashboard load error:', e);
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

  const greeting = getGreeting();
  const dateStr = getFullDate();
  const restrictedCount = summaries.filter(s => s.status === 'reached' || s.status === 'exceeded').length;

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>Shadow Alert</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Clock size={24} color={colors.primary.contrast} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.heroLabel}>Screen Time Today</Text>
              <Text style={styles.heroValue}>{formatMinutes(todayUsage)}</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{summaries.length}</Text>
              <Text style={styles.heroStatLabel}>Monitored</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: restrictedCount > 0 ? colors.error.main : colors.primary.contrast }]}>
                {restrictedCount}
              </Text>
              <Text style={styles.heroStatLabel}>At Limit</Text>
            </View>
          </View>
        </View>

        {weeklyComp && (
          <View style={styles.weeklyCard}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.weeklyInfo}>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyLabel}>This Week</Text>
                <Text style={styles.weeklyValue}>{formatMinutes(weeklyComp.thisWeekMinutes)}</Text>
              </View>
              <View style={styles.weeklyTrend}>
                {weeklyComp.trend === 'down' ? (
                  <TrendingDown size={18} color={colors.success.main} strokeWidth={2} />
                ) : weeklyComp.trend === 'up' ? (
                  <TrendingUp size={18} color={colors.error.main} strokeWidth={2} />
                ) : (
                  <Minus size={18} color={colors.neutral[400]} strokeWidth={2} />
                )}
                <Text style={[
                  styles.weeklyChange,
                  {
                    color: weeklyComp.trend === 'down' ? colors.success.main :
                           weeklyComp.trend === 'up' ? colors.error.main :
                           colors.neutral[500]
                  }
                ]}>
                  {weeklyComp.percentChange > 0 ? '+' : ''}{Math.abs(weeklyComp.percentChange).toFixed(1)}%
                </Text>
              </View>
            </View>
            <BarChart data={weekData} />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monitored Applications</Text>
          {summaries.length > 0 && (
            <Pressable onPress={() => router.push('/(tabs)/apps')}>
              <Text style={styles.linkText}>Manage</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : summaries.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No Apps Monitored Yet"
            message="Select apps you want to control and set your intended usage limits to get started."
            action={
              <Pressable
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/apps')}
              >
                <Plus size={18} color={colors.primary.contrast} strokeWidth={2} />
                <Text style={styles.addButtonText}>Add Your First App</Text>
              </Pressable>
            }
          />
        ) : (
          <>
            {summaries.map((s) => (
              <AppCard
                key={s.app.package_name}
                summary={s}
                onPress={() => router.push(`/app-details?pkg=${encodeURIComponent(s.app.package_name)}`)}
              />
            ))}
            <Pressable
              style={styles.manageButton}
              onPress={() => router.push('/(tabs)/apps')}
            >
              <Text style={styles.manageButtonText}>Manage All Apps</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    greeting: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
    },
    dateText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    logoWrap: {
      backgroundColor: colors.primary.main,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
    },
    logoText: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeSm,
      color: colors.primary.contrast,
      letterSpacing: 0.5,
    },
    heroCard: {
      backgroundColor: colors.primary.main,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    heroIconWrap: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    heroLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: 'rgba(255,255,255,0.8)',
    },
    heroValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.primary.contrast,
      marginTop: 2,
    },
    heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.2)',
    },
    heroStat: {
      flex: 1,
      alignItems: 'center',
    },
    heroDivider: {
      width: 1,
      height: 32,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroStatValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.primary.contrast,
    },
    heroStatLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
    },
    weeklyCard: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    sectionTitle: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
    },
    linkText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.primary.main,
    },
    weeklyInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    weeklyStat: {},
    weeklyLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
    },
    weeklyValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
      marginTop: 2,
    },
    weeklyTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    weeklyChange: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
    },
    loadingWrap: {
      paddingVertical: Spacing.xl,
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[400],
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.main,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radius.full,
      gap: 8,
    },
    addButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.primary.contrast,
    },
    manageButton: {
      alignItems: 'center',
      paddingVertical: Spacing.md,
      marginTop: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary.main,
      borderRadius: Radius.md,
    },
    manageButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.primary.main,
    },
  });
}
